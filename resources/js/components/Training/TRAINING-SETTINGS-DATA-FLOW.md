# Laravel Vue Training system 

# Module setting
┌─────────────────────────────────────────────────────────────────┐
│  0. КОНФИГИ И УТИЛИТЫ (фронтенд)                                │
│     • config/settingsDefaultsConfig.js — единый источник дефолтов│
│     • utils/appSettingsHelpersUtils.js — deepClone, deepMerge   │
│     • utils/appDebugUtils.js + useDebug.js — логирование        │
└──────────────────────────┬──────────────────────────────────────┘
                           ↓ импорты
┌─────────────────────────────────────────────────────────────────┐
│  1. БД (training_settings таблица)                              │
│     Ключи: server.*, frontend.*, frontend.columns.*, limits.*   │
│     Значения: строки, JSON, boolean как 'true'/'false'          │
└──────────────────────────┬──────────────────────────────────────┘
                           ↓ pluck('value', 'key')
┌─────────────────────────────────────────────────────────────────┐
│  2. TrainingSettingsService.php (бэкенд)                        │
│     • getAllSettings() — читает из БД/кэша                      │
│     • getTyped() — конвертирует типы (string→int, JSON→array)   │
│     • filterByPrefixNested() — группирует вложенные ключи       │
│     • getColumnsConfig() — читает frontend.columns.{$tab}       │
│     • getLimits() / getLimit() — читает limits.* с дефолтами    │
│     • resolveGroupingMode() — вычисляет режим группировки       │
│     • setMany() — массовое сохранение + 1 очистка кэша          │
│     🔥 DEFAULT_LIMITS, DEFAULT_COLUMNS — только здесь (DRY)     │
└──────────────────────────┬──────────────────────────────────────┘
                           ↓ getAllGrouped() + getColumnsConfig() + getLimits()
┌─────────────────────────────────────────────────────────────────┐
│  3. TrainingSettingsController.php (бэкенд)                     │
│     • index() — возвращает { server, frontend, columns, limits }│
│     • update() — валидирует + сохраняет через setMany()         │
│     • Валидация: server.form_meta.*, frontend.columns.*, limits │
│     🔥 БЕЗ дублирования констант (делегирование сервису)        │
└──────────────────────────┬──────────────────────────────────────┘
                           ↓ HTTP API
┌─────────────────────────────────────────────────────────────────┐
│  4. TrainingSettingsApi.js (фронтенд)                           │
│     • getSettingsApi() — обёртка над resource                   │
│     • updateSettingsApi() — обёртка над resource                │
│     • Контракт: { success, message, data, error }               │
└──────────────────────────┬──────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│  5. TrainingSettingsService.js (фронтенд)                       │
│     • Нормализация данных перед отправкой                       │
│     • Кэширование в localStorage (server, frontend, columns,    │
│       limits, form_meta, grouping_mode)                         │
│     • Валидация перед отправкой (limits, server)                │
│     • Fallback на дефолты при ошибке API                        │
└──────────────────────────┬──────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│  6. trainingSettingsStore.js (Pinia) ← ТОЧКА ВХОДА НА ФРОНТЕ    │
│     • fetchSettingsStore() — загружает из API                   │
│     • updateSettingsStore() — сохраняет через сервис            │
│     • resetSettingsStore() — сброс к дефолтам                   │
│     • serverSettings, frontendSettings, limits, columnsConfig   │
│     • groupingModes, loading, error, validationErrors           │
│     • settingsDebugSnapshot — computed для отладки              │
│     • isGroupingToggleVisibleStore, getColumnsForTabStore()     │
└──────────────────────────┬──────────────────────────────────────┘
                           ↓ computed / props / v-model
┌─────────────────────────────────────────────────────────────────┐
│  7. КОМПОНЕНТЫ (применение настроек)                            │
│     • Dashboard.vue — default_tab, compact_view, enable_stats,  │
│       logs_per_page → пагинация, columnsConfig → таблица        │
│     • TrainingLogTable.vue — колонки, группировка, пагинация    │
│     • TrainingLogForm.vue — max_shared_with, max_notes_length,  │
│       enable_sharing (скрытие блока шаринга)                    │
│     • TrainingUserSharingSelector.vue — лимиты шаринга,         │
│       search_min_length (уже применяет настройки)               │
│     • TrainingSettingsForm.vue — форма редактирования (4 панели)│
│     • DebugState.vue — интерактивная подсветка изменений        │
│     • DebugPanel.vue + DebugLogs.vue — панель отладки           │
└─────────────────────────────────────────────────────────────────┘
