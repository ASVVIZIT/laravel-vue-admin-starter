# APP CONFIG — КОНФИГУРАЦИЯ КОМПОНЕНТОВ

Централизованное хранилище всех настроек для компонентов CompanyContactChannels

---

## СТРУКТУРА ПАПОК
```markdown
config/
├── appConfigIndex.js            (Главный экспорт)
├── appConfigGlobal.js           (Глобальные настройки)
├── appConfigChunk.js            (CHUNK_CONFIG, THRESHOLDS)
├── appConfigFilters.js          (SORT_OPTIONS, FILTERS_*)
├── appConfigPageSizeSelector.js (PAGE_SIZE_OPTIONS)
├── appConfigDeleteConfirm.js    (DELETE_CONFIRM_*)
├── appConfigPagination.js       (PAGINATION_*)
├── appConfigChunkProgress.js    (CHUNK_PROGRESS_CONFIG)
├── appConfigLoadingDataActions.js (LOADING_DATA_ACTIONS_*)
├── appConfigSettingsModal.js    (SETTINGS_*)
├── appConfigCompanyForm.js      (COMPANY_FORM_*)
├── appConfigCompanyTable.js     (COMPANY_TABLE_*, EDITABLE_CELL_*, RECORD_REFRESH_CONFIG)
├── appConfigCompanyList.js      (COMPANY_LIST_*)
└── README.md                    (Этот файл)
```
---

## БЫСТРЫЙ ПОИСК

| Что изменить            | Файл                           | Раздел                                |
|-------------------------|--------------------------------|---------------------------------------|
| Цвет бренда             | appConfigGlobal.js             | COLORS                                |
| Брейкпоинты             | appConfigGlobal.js             | BREAKPOINTS                           |
| Анимации                | appConfigGlobal.js             | ANIMATIONS                            |
| Тайминги                | appConfigGlobal.js             | TIMINGS                               |
| Чанки загрузки          | appConfigChunk.js              | CHUNK_CONFIG                          |
| Пороги загрузки         | appConfigChunk.js              | COMPANY_LIST_THRESHOLDS               |
| Сортировка              | appConfigFilters.js            | SORT_OPTIONS                          |
| Фильтры                 | appConfigFilters.js            | FILTERS_*                             |
| Пагинация               | appConfigPagination.js         | PAGINATION_*                          |
| Прогресс бар            | appConfigChunkProgress.js      | CHUNK_PROGRESS_CONFIG                 |
| Панель загрузки         | appConfigLoadingDataActions.js | LOADING_DATA_ACTIONS_*                |
| Настройки модалки       | appConfigSettingsModal.js      | SETTINGS_*                            |
| Размер страницы         | appConfigPageSizeSelector.js   | PAGE_SIZE_OPTIONS                     |
| Селектор размера        | appConfigPageSizeSelector.js   | PAGE_SIZE_SELECTOR_*                  |
| Удаление                | appConfigDeleteConfirm.js      | DELETE_CONFIRM_*                      |
| Форма компании          | appConfigCompanyForm.js        | COMPANY_FORM_*                        |
| Таблица компаний        | appConfigCompanyTable.js       | COMPANY_TABLE_* RECORD_REFRESH_CONFIG |
| Редактируемые ячейки    | appConfigCompanyTable.js       | EDITABLE_CELL__*                      |
| Обновление записи       | appConfigCompanyTable.js       | RECORD_REFRESH_CONFIG                 |
| Список компаний         | appConfigCompanyList.js        | COMPANY_LIST_*                        |

---

## ВАЖНЫЕ ПРАВИЛА

1. Импортируйте только через appConfigIndex.js
   ✅ import { COLORS } from '../config/appConfigIndex.js'
   ❌ import { COLORS } from '../config/appConfigGlobal.js'

2. Изменения в appConfigGlobal.js влияют на ВСЕ компоненты

3. Изменения в компонентных файлах безопасны (влияют только на один компонент)

4. Префикс appConfig* для быстрого поиска (Ctrl+P)

---

## ЗАВИСИМОСТИ МЕЖДУ ФАЙЛАМИ
```markdown
appConfigIndex.js (главный экспорт)
│
├── appConfigGlobal.js (ни от чего не зависит)
├── appConfigChunk.js (ни от чего не зависит)
├── appConfigFilters.js (ни от чего не зависит)
├── appConfigPageSizeSelector.js (ни от чего не зависит)
├── appConfigDeleteConfirm.js (ни от чего не зависит)
├── appConfigPagination.js → appConfigPageSizeSelector.js
├── appConfigChunkProgress.js → appConfigGlobal.js
├── appConfigLoadingDataActions.js → appConfigGlobal.js, appConfigChunkProgress.js
├── appConfigSettingsModal.js → appConfigGlobal.js, appConfigCompanyList.js
├── appConfigCompanyForm.js → appConfigGlobal.js
├── appConfigCompanyTable.js → appConfigGlobal.js, appConfigFilters.js
└── appConfigCompanyList.js → appConfigGlobal.js, appConfigChunk.js
```
---

## СТАТИСТИКА
```markdown
Всего файлов: 13
Всего строк кода: ~1150
Глобальные настройки: 1 файл (~150 строк)
Компонентные настройки: 11 файлов (~950 строк)
Вспомогательные: 1 файл (~50 строк)
Экспортируемых констант: ~150
Экспортируемых функций: ~10
```
---

## ПРИМЕР ИСПОЛЬЗОВАНИЯ

В любом компоненте Vue:
```markdown
import {
    COLORS,
    BREAKPOINTS,
    COMPANY_LIST_UI,
    SETTINGS_MESSAGES,
} from '../../config/appConfigIndex.js';
```
---

## ДОБАВЛЕНИЕ НОВОГО КОМПОНЕНТА

1. Создайте файл appConfigNewComponent.js
2. Добавьте экспорт в appConfigIndex.js
3. Обновите таблицу БЫСТРЫЙ ПОИСК в README.md
4. Укажите зависимости если есть

---

## ПОДДЕРЖКА

При возникновении вопросов:
1. Проверьте таблицу БЫСТРЫЙ ПОИСК
2. Проверьте зависимости между файлами
3. Убедитесь что импортируете через appConfigIndex.js

---
```markdown
Версия: 1.0
Последнее обновление: 2026-02-26 6:36
Расположение: config/README.md
```
