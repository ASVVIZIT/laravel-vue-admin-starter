# Laravel Vue Training System — Архитектура настроек модуля Training

**Описание:** Полный поток данных от БД до UI
**Обновлено:** 2026-06-08
**Статус:** 🚧 Dev Ready
**Цель:** Production-ready архитектура (DRY, реактивность, кэширование, валидация)

---

## 1. Ключевые принципы

- **DRY** — константы (`DEFAULT_LIMITS`, `DEFAULT_COLUMNS`) только в `TrainingSettingsService.php`
- **Консистентность ключей** — все frontend-настройки под префиксом `frontend.*` (включая `frontend.columns.*`)
- **Единая точка входа на фронте** — `trainingSettingsStore.js` (Pinia)
- **Двухуровневое кэширование** — БД (Redis/файл) + localStorage
- **Валидация на двух уровнях** — Laravel (backend) + фронтенд-сервис

---

## 2. Схема потока данных
```bash

0. КОНФИГИ И УТИЛИТЫ (фронтенд)
  - config/settingsDefaultsConfig.js — единый источник дефолтов
  - utils/appSettingsHelpersUtils.js — deepClone, deepMerge
  - utils/appDebugUtils.js + useDebug.js — логирование

↓ импорты

1. БД (training_settings таблица)
  - Ключи: server., frontend., frontend.columns., limits.
  - Значения: строки, JSON, boolean как 'true'/'false'

↓ pluck('value', 'key')

2. TrainingSettingsService.php (бэкенд)
  - getAllSettings() — читает из БД/кэша
  - getTyped() — конвертирует типы (string→int, JSON→array)
  - filterByPrefixNested() — группирует вложенные ключи
  - getColumnsConfig() — читает frontend.columns.{$tab}
  - getLimits() / getLimit() — читает limits.* с дефолтами
  - resolveGroupingMode() — вычисляет режим группировки
  - setMany() — массовое сохранение + 1 очистка кэша
  🔥 DEFAULT_LIMITS, DEFAULT_COLUMNS — только здесь (DRY)

↓ getAllGrouped() + getColumnsConfig() + getLimits()

3. TrainingSettingsController.php (бэкенд)
  - index() — возвращает { server, frontend, columns, limits }
  - update() — валидирует + сохраняет через setMany()
  - Валидация: server.form_meta., frontend.columns., limits
  - БЕЗ дублирования констант (делегирование сервису)

↓ HTTP API

4. TrainingSettingsApi.js (фронтенд)
  - getSettingsApi() — обёртка над resource
  - updateSettingsApi() — обёртка над resource
  - Контракт: { success, message, data, error }

↓

5. TrainingSettingsService.js (фронтенд)
  - Нормализация данных перед отправкой
  - Кэширование в localStorage (server, frontend, columns, limits, form_meta, grouping_mode)
  - Валидация перед отправкой (limits, server)
  - Fallback на дефолты при ошибке API

↓

6. trainingSettingsStore.js (Pinia) ← ТОЧКА ВХОДА НА ФРОНТЕ
  - fetchSettingsStore() — загружает из API
  - updateSettingsStore() — сохраняет через сервис
  - resetSettingsStore() — сброс к дефолтам
  - serverSettings, frontendSettings, limits, columnsConfig
  - groupingModes, loading, error, validationErrors
  - settingsDebugSnapshot — computed для отладки
  - isGroupingToggleVisibleStore, getColumnsForTabStore()
  
↓ computed / props / v-model

7. КОМПОНЕНТЫ (применение настроек) │
  - Dashboard.vue — default_tab, compact_view, enable_stats, logs_per_page → пагинация, columnsConfig → таблица
  - TrainingLogTable.vue — колонки, группировка, пагинация │
  - TrainingLogForm.vue — max_shared_with, max_notes_length, enable_sharing (скрытие блока шаринга)
  - TrainingUserSharingSelector.vue — лимиты шаринга, search_min_length (уже применяет настройки)
  - TrainingSettingsForm.vue — форма редактирования (4 панели)
  - DebugState.vue — интерактивная подсветка изменений
  - DebugPanel.vue + DebugLogs.vue — панель отладки

```

---

## 3. Структура БД

**Таблица:** `training_settings`

| Поле  | Тип    | Описание                              |
|-------|--------|---------------------------------------|
| `id`  | int    | Первичный ключ                        |
| `key` | string | Ключ настройки (например `server.grouping_mode`) |
| `value` | text | Значение (строка, JSON, `'true'`/`'false'`) |

**Примеры ключей:**
```bash
server.grouping_mode
server.grouping_auto_threshold
server.form_meta.layout
server.form_meta.visible_tabs
frontend.default_tab
frontend.show_grouping_toggle
frontend.columns.mine
frontend.columns.shared-with-me
frontend.columns.shared-by-me
limits.max_shared_with
limits.search_results_limit
limits.max_sets
limits.max_notes_length
limits.search_min_length
```


---

## 4. API Endpoints

| Метод  | URL                              | Описание                        |
|--------|----------------------------------|---------------------------------|
| `GET`  | `/api/training/settings?tab=mine` | Получить все настройки + режим группировки |
| `POST` | `/api/training/settings`         | Обновить настройки (требует `PERMISSION_MANAGE_TRAINING`) |

**Формат ответа `GET`:**
```json
{
  "success": true,
  "data": {
    "server":   { "grouping_mode": "auto", "form_meta": {...}, ... },
    "frontend": { "default_tab": "mine", ... },
    "columns":  { "mine": {...}, "shared-with-me": {...}, "shared-by-me": {...} },
    "limits":   { "max_shared_with": 100, ... },
    "grouping": { "mode": "frontend", "reason": "Мало записей: 19 < 500" }
  }
}
```

## 5. Известные ограничения
  - Лимиты (max_shared_with, max_notes_length) применяются только после сохранения настроек
  - Группировка требует N записей для активации (порог grouping_auto_threshold)
  - Кэш БД живёт 3600 секунд (CACHE_TTL в сервисе)
  - Кэш localStorage живёт 5 минут (CACHE_TTL_MS в фронтенд-сервисе)
  - form_meta хранится в БД как вложенные ключи (server.form_meta.layout), но возвращается как объект

## 6. Changelog
  - Дата Изменение
  - 2026-06-08 | Создан файл, зафиксирована архитектура
  - 2026-06-08 | Добавлены filterByPrefixNested(), setMany(), getLimits()
  - 2026-06-08 | Удалено дублирование констант в контроллере
  - 2026-06-08 | Применены настройки: logs_per_page, enable_stats
  - 2026-06-08 | Debug Panel: интерактивная подсветка изменений
---
##  Что изменилось при рефакторинге:

| Было | Стало |
|------|-------|
| Дублирование заголовка | ✅ Один заголовок |
| Дублирование разделов (SQL, API, Ограничения) | ✅ Единые разделы |
| Схема разбита на 8 отдельных блоков кода | ✅ Единый блок с плавным потоком |
| Нет таблицы БД | ✅ Добавлена таблица + примеры ключей |
| Нет формата ответа API | ✅ Добавлен JSON-пример |
| Ограничения списком | ✅ Таблица + детали |
| Changelog одной строкой | ✅ Таблица с историей |
