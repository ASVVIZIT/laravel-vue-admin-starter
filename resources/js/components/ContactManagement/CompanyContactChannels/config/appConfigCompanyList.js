// ============================================================================
// APP CONFIG COMPANY LIST — COMPANY LIST COMPONENT
// ============================================================================
// 📁 Путь: config/appConfigCompanyList.js
// ✅ Используется: CompanyList.vue (главный компонент)
// ✅ Безопасно менять — влияет только на список компаний
// ✅ Зависит от: appConfigGlobal.js (COLORS, ANIMATIONS, TIMINGS, BREAKPOINTS)
// ✅ Зависит от: appConfigChunk.js (CHUNK_CONFIG, THRESHOLDS, FILTERS)
// ============================================================================

import { COLORS, ANIMATIONS, TIMINGS, BREAKPOINTS } from './appConfigGlobal.js';
import { CHUNK_CONFIG, COMPANY_LIST_THRESHOLDS, COMPANY_LIST_FILTERS } from './appConfigChunk.js';

// ============================================================================
// UI CONFIGS
// ============================================================================

export const COMPANY_LIST_UI = {
    PADDING: '5px',
    HEADER_GAP: '8px',
    HEADER_ACTIONS_GAP: '8px',
    HEADER_TITLE_FILTERS_GAP: '12px',
    LOAD_STATUS_TAG_HEIGHT: '20px',
    LOAD_STATUS_TAG_PADDING: '0 6px',
    LOAD_STATUS_TAG_FONT_SIZE: '10px',
    TABLE_WRAPPER_MARGIN_BOTTOM: '10px',
    TABLE_WRAPPER_BORDER: '0.01rem solid #e9e9e9',
    TABLE_WRAPPER_BORDER_RADIUS: '2px',
    TABLE_WRAPPER_MIN_HEIGHT: '300px',
    LOADING_SPINNER_SIZE: '32px',
    LOADING_SPINNER_COLOR: COLORS.PRIMARY,
    LOADING_TEXT_COLOR: '#606266',
    LOADING_TEXT_SIZE: '12px',
    TITLE_FONT_SIZE: '13px',
    TITLE_FONT_WEIGHT: '600',
    TITLE_COLOR: '#303133',
};

// ============================================================================
// FILTERS UI CONFIGS (НОВЫЙ РАЗДЕЛ)
// ============================================================================

export const COMPANY_LIST_FILTERS_UI = {
    // ✅ CONTAINER
    CONTAINER_PADDING: '1px',
    CONTAINER_GAP: '6px',
    CONTAINER_MIN_HEIGHT: '20px',

    // ✅ WRAPPER (input/select)
    WRAPPER_HEIGHT: '20px',
    WRAPPER_HEIGHT_MOBILE: '20px',
    WRAPPER_HEIGHT_SMALL: '20px',
    WRAPPER_HEIGHT_TOUCH: '32px',
    WRAPPER_FONT_SIZE: '11px',
    WRAPPER_FONT_SIZE_MOBILE: '11px',
    WRAPPER_FONT_SIZE_SMALL: '11px',
    WRAPPER_FONT_SIZE_TOUCH: '14px',
    WRAPPER_PADDING: '0 8px',
    WRAPPER_PADDING_MOBILE: '0 6px',
    WRAPPER_PADDING_SMALL: '0 4px',
    WRAPPER_PADDING_TOUCH: '0 8px',
    WRAPPER_BORDER_RADIUS: '3px',

    // ✅ INNER (input/select)
    INNER_HEIGHT: '18px',
    INNER_HEIGHT_MOBILE: '18px',
    INNER_HEIGHT_SMALL: '18px',
    INNER_HEIGHT_TOUCH: '30px',
    INNER_FONT_SIZE: '11px',
    INNER_FONT_SIZE_MOBILE: '11px',
    INNER_FONT_SIZE_SMALL: '11px',
    INNER_FONT_SIZE_TOUCH: '14px',
    INNER_LINE_HEIGHT: '18px',
    INNER_LINE_HEIGHT_MOBILE: '18px',
    INNER_LINE_HEIGHT_SMALL: '18px',
    INNER_LINE_HEIGHT_TOUCH: '30px',

    // ✅ DROPDOWN
    DROPDOWN_HEIGHT: '18px',
    DROPDOWN_HEIGHT_MOBILE: '18px',
    DROPDOWN_HEIGHT_SMALL: '18px',
    DROPDOWN_HEIGHT_TOUCH: '32px',
    DROPDOWN_FONT_SIZE: '11px',
    DROPDOWN_FONT_SIZE_MOBILE: '11px',
    DROPDOWN_FONT_SIZE_SMALL: '10px',
    DROPDOWN_FONT_SIZE_TOUCH: '14px',
    DROPDOWN_PADDING: '0 6px',
    DROPDOWN_PADDING_MOBILE: '0 6px',
    DROPDOWN_PADDING_SMALL: '0 6px',
    DROPDOWN_PADDING_TOUCH: '0 10px',
    DROPDOWN_LINE_HEIGHT: '18px',
    DROPDOWN_LINE_HEIGHT_MOBILE: '18px',
    DROPDOWN_LINE_HEIGHT_SMALL: '18px',
    DROPDOWN_LINE_HEIGHT_TOUCH: '32px',

    // ✅ CARET / ARROW
    CARET_FONT_SIZE: '8px',
    CARET_HEIGHT: '18px',
    CARET_LINE_HEIGHT: '18px',

    // ✅ PREFIX / SUFFIX
    PREFIX_HEIGHT: '18px',
    PREFIX_FONT_SIZE: '11px',

    // ✅ ROW
    ROW_GAP: '6px',
    ROW_GAP_MOBILE: '6px',
    ROW_GAP_SMALL: '4px',
    ROW_HEIGHT: '28px',

    // ✅ BUTTON
    BUTTON_HEIGHT: '20px',
    BUTTON_HEIGHT_TOUCH: '36px',
    BUTTON_FONT_SIZE: '11px',
    BUTTON_FONT_SIZE_TOUCH: '14px',
};

// ============================================================================
// MESSAGES
// ============================================================================

export const COMPANY_LIST_MESSAGES = {
    LOADING_INITIAL: 'Загрузка...',
    SUCCESS_CHUNK_LOADED: (count) => `Загружено ещё ${count} записей`,
    SUCCESS_ALL_LOADED: (total) => `Загружено все ${total} записей`,
    SUCCESS_COMPANY_CREATED: 'Компания создана',
    SUCCESS_COMPANY_UPDATED: 'Компания обновлена',
    SUCCESS_COMPANY_DELETED: (name) => `Компания "${name}" удалена`,
    SUCCESS_RECORD_REFRESHED: (name) => `Запись "${name}" обновлена`,
    ERROR_RECORD_REFRESH: (name) => `Ошибка обновления "${name}"`,
    ERROR_LOADING: 'Ошибка при загрузке',
    ERROR_DELETING: 'Ошибка при удалении',
    ERROR_SAVING: 'Ошибка при сохранении',
    CONFIRM_LOAD_ALL_TITLE: 'Предупреждение',
    CONFIRM_LOAD_ALL_CONFIRM: 'Да',
    CONFIRM_LOAD_ALL_CANCEL: 'Нет',
    CONFIRM_LOAD_ALL_MESSAGE: (total) => `Загрузка ${total} записей займёт 1-2 минуты. Продолжить?`,
    SUCCESS_FILTERS_RESET: 'Фильтры сброшены',
    EMPTY_NO_DATA: 'Нет данных',
    TITLE: 'Список Компаний',
    BTN_ADD: 'Добавить',
    ENTITY_LABEL: 'Компания',
    ENTITY_LABEL_PLURAL: 'Компании',
    NO_NEW_RECORDS: 'Новых записей нет',
    NEW_RECORDS_LOADED: (count) => `Загружено ${count} новых записей`,
    REFRESH_ERROR: (error) => `Ошибка при обновлении: ${error}`,
    ALL_RECORDS_LOADED: 'Все записи уже загружены',
    LOAD_PAUSED: 'Загрузка приостановлена',
    LOAD_RESUMED: 'Загрузка возобновлена',
};

// ============================================================================
// PROPS CONFIG
// ============================================================================

export const COMPANY_LIST_PROPS_CONFIG = {
    entity: { type: String, default: 'company' },
    loadedCount: { type: Number, required: true },
    totalItems: { type: Number, default: 0 },
    chunkProgress: { type: Number, default: 0 },
    loadingChunks: { type: Boolean, default: false },
    allRecordsLoaded: { type: Boolean, default: false },
    currentPage: { type: Number, default: 1 },
    pageSize: { type: Number, default: 15 },
    useServerPagination: { type: Boolean, default: false },
    searchQuery: { type: String, default: '' },
    filterHasIcon: { type: String, default: '' },
    sortBy: { type: String, default: 'id_asc' },
    disabled: { type: Boolean, default: false },
    iconMap: { type: Object, required: true },
    iconOptions: { type: Array, required: true },
};

// ============================================================================
// ЭКСПОРТЫ (ПЕРЕЭКСПОРТ ИЗ appConfigChunk.js)
// ============================================================================

export { CHUNK_CONFIG, COMPANY_LIST_THRESHOLDS, COMPANY_LIST_FILTERS } from './appConfigChunk.js';
