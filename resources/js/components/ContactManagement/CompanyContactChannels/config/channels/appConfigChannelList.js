/**
 * ============================================================================
 * APP CONFIG CHANNEL LIST — CHANNEL LIST COMPONENT
 * ============================================================================
 * 📁 Путь: config/channels/appConfigChannelList.js
 * ✅ Используется: ChannelList.vue, channelStore.js, LoadingDataActions.vue
 * ✅ Безопасно менять — влияет только на список каналов
 * ✅ НЕ ЗАВИСИТ ОТ: config/companies/* (полностью независим)
 * ============================================================================
 */

import { COLORS, ANIMATIONS, BREAKPOINTS, TIMINGS } from '../global/index.js';
import {
    CHANNEL_TYPES,
    CHANNEL_TYPE_LABELS,
    CHANNEL_TYPE_ICONS,
    getChannelTypeLabel,
    getChannelTypes,
    getChannelTypeOptions,
    getChannelTypeIcon,
} from './appConfigChannelTypes.js';

// ============================================================================
// CHANNEL LIST THRESHOLDS
// ============================================================================

export const CHANNEL_LIST_THRESHOLDS = {
    SHOW_LOAD_BUTTONS_MIN: 100,
    CONFIRM_LOAD_ALL_MIN: 1000,
    CHUNK_LOAD_MAX: 5000,
};

// ============================================================================
// CHANNEL LIST FILTERS
// ============================================================================

export const CHANNEL_LIST_FILTERS = {
    SEARCH_DEBOUNCE: 500,
    DEFAULT_PAGE_SIZE: 15,
    MIN_PAGE_SIZE: 15,
    MAX_PAGE_SIZE: 500,
    PAGE_SIZE_OPTIONS: [15, 50, 100, 200, 500],
};

// ============================================================================
// CHANNEL USER SETTINGS
// ============================================================================

export const CHANNEL_USER_SETTINGS = {
    STORAGE_KEY: 'channel_user_settings',
    DEFAULT_CHUNK_SIZE: 500,
    DEFAULT_PAGE_SIZE: 15,
    DEFAULT_SORT_BY: 'order_asc',
    DEFAULT_SORT_DIRECTION: 'asc',
    DEFAULT_FILTER_COMPANY_ID: null,
    DEFAULT_FILTER_TYPE: null,
    DEFAULT_FILTER_IS_ACTIVE: null,
};

// ============================================================================
// CHANNEL SORT OPTIONS
// ============================================================================

export const CHANNEL_SORT_OPTIONS = {
    ORDER_ASC: { value: 'order_asc', label: 'Порядок ↑' },
    ORDER_DESC: { value: 'order_desc', label: 'Порядок ↓' },
    ID_ASC: { value: 'id_asc', label: 'ID ↑' },
    ID_DESC: { value: 'id_desc', label: 'ID ↓' },
    TYPE_ASC: { value: 'type_asc', label: 'Тип А-Я' },
    TYPE_DESC: { value: 'type_desc', label: 'Тип Я-А' },
    TITLE_ASC: { value: 'title_asc', label: 'Название А-Я' },
    TITLE_DESC: { value: 'title_desc', label: 'Название Я-А' },
    COMPANY_ASC: { value: 'company_asc', label: 'Компания А-Я' },
    COMPANY_DESC: { value: 'company_desc', label: 'Компания Я-А' },
    CREATED_AT_DESC: { value: 'created_at_desc', label: 'Сначала новые' },
    CREATED_AT_ASC: { value: 'created_at_asc', label: 'Сначала старые' },
    DEFAULT: 'order_asc',
};

// ============================================================================
// UI CONFIGS
// ============================================================================

export const CHANNEL_LIST_UI = {
    PADDING: '8px',
    HEADER_GAP: '8px',
    HEADER_ACTIONS_GAP: '8px',
    HEADER_TITLE_FILTERS_GAP: '12px',
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
    LOAD_STATUS_TAG_HEIGHT: '20px',
    LOAD_STATUS_TAG_PADDING: '0 6px',
    LOAD_STATUS_TAG_FONT_SIZE: '10px',
    ACTION_BUTTON_SIZE: 'small',
    ACTION_BUTTON_CIRCLE: true,
    ACTION_BUTTON_PADDING: '0',
    ACTION_BUTTON_WIDTH: '24px',
    ACTION_BUTTON_HEIGHT: '24px',
    ACTION_BUTTON_ICON_SIZE: '12px',
    ACTION_BUTTON_HOVER_SCALE: '1.1',
    ACTION_BUTTON_DISABLED_OPACITY: '0.3',
    PAGINATION_MARGIN_TOP: '10px',
    PAGINATION_GAP: '8px',
    FILTER_WIDTH: '130px',
    FILTER_WIDTH_MOBILE: '120px',
    FILTER_WIDTH_SMALL: '100%',
};

// ============================================================================
// FILTERS UI CONFIGS
// ============================================================================

export const CHANNEL_LIST_FILTERS_UI = {
    CONTAINER_PADDING: '1px',
    CONTAINER_GAP: '6px',
    CONTAINER_GAP_MOBILE: '4px',
    CONTAINER_GAP_SMALL: '4px',
    CONTAINER_MIN_HEIGHT: '20px',
    WRAPPER_HEIGHT: '20px',
    WRAPPER_HEIGHT_MOBILE: '20px',
    WRAPPER_HEIGHT_SMALL: '20px',
    WRAPPER_HEIGHT_TOUCH: '32px',
    WRAPPER_FONT_SIZE: '11px',
    WRAPPER_FONT_SIZE_MOBILE: '11px',
    WRAPPER_FONT_SIZE_SMALL: '11px',
    WRAPPER_FONT_SIZE_TOUCH: '14px',
    WRAPPER_PADDING: '0 3px',
    WRAPPER_PADDING_MOBILE: '0 6px',
    WRAPPER_PADDING_SMALL: '0 4px',
    WRAPPER_PADDING_TOUCH: '0 8px',
    WRAPPER_BORDER_RADIUS: '2px',
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
    CARET_FONT_SIZE: '8px',
    CARET_HEIGHT: '18px',
    CARET_LINE_HEIGHT: '18px',
    PREFIX_HEIGHT: '18px',
    PREFIX_FONT_SIZE: '11px',
    PREFIX_FONT_SIZE_TOUCH: '14px',
    CLEAR_FONT_SIZE: '8px',
    CLEAR_FONT_SIZE_TOUCH: '12px',
    BUTTON_HEIGHT: '20px',
    BUTTON_HEIGHT_TOUCH: '36px',
    BUTTON_FONT_SIZE: '11px',
    BUTTON_FONT_SIZE_TOUCH: '14px',
    BUTTON_PADDING: '0 4px',
    BUTTON_PADDING_TOUCH: '8px 12px',
    BUTTON_ICON_SIZE: '9px',
    BUTTON_ICON_SIZE_TOUCH: '14px',
    INFO_LABEL_FONT_SIZE: '5px',
    INFO_LABEL_FONT_SIZE_TOUCH: '9px',
    INFO_COUNT_FONT_SIZE: '7px',
    INFO_COUNT_FONT_SIZE_TOUCH: '11px',
    ROW_GAP: '6px',
    ROW_GAP_MOBILE: '6px',
    ROW_GAP_SMALL: '4px',
    SEARCH_WIDTH: '120px',
    SEARCH_WIDTH_FOCUSED: '180px',
    SELECT_WIDTH: '60px',
};

// ============================================================================
// MESSAGES (ВСЕ РУССКИЕ СЛОВА — ПОЛНЫЙ СПИСОК!)
// ============================================================================

export const CHANNEL_LIST_MESSAGES = {
    // ✅ СТАТУСЫ ЗАГРУЗКИ
    LOADING: 'Загрузка каналов...',
    LOADING_CHUNKS: 'Загрузка чанками...',
    LOADING_INITIAL: 'Загрузка...',

    // ✅ УСПЕХ
    SUCCESS_CHANNEL_CREATED: 'Канал создан',
    SUCCESS_CHANNEL_UPDATED: 'Канал обновлён',
    SUCCESS_CHANNEL_DELETED: 'Канал удалён',
    SUCCESS_ORDER_UPDATED: 'Порядок обновлён',
    SUCCESS_CHUNK_LOADED: (count) => `Загружено ещё ${count} каналов`,
    SUCCESS_ALL_LOADED: (total) => `Загружено все ${total} каналов`,
    SUCCESS_SETTINGS_SAVED: 'Настройки сохранены',
    SUCCESS_FILTERS_RESET: 'Фильтры сброшены',
    SUCCESS_RECORD_REFRESHED: (name) => `Запись "${name}" обновлена`,

    // ✅ ОШИБКИ
    ERROR_LOADING: 'Ошибка при загрузке каналов',
    ERROR_DELETING: 'Ошибка при удалении',
    ERROR_SAVING: 'Ошибка при сохранении',
    ERROR_REORDER: 'Ошибка при сортировке',
    ERROR_RECORD_REFRESH: (name) => `Ошибка обновления "${name}"`,
    REFRESH_ERROR: (error) => `Ошибка при обновлении: ${error}`,

    // ✅ ПОДТВЕРЖДЕНИЯ
    CONFIRM_DELETE_TITLE: 'Удаление канала',
    CONFIRM_DELETE_MESSAGE: (title) => `Удалить канал "${title}"?`,
    CONFIRM_DELETE_CONFIRM: 'Удалить',
    CONFIRM_DELETE_CANCEL: 'Отмена',
    CONFIRM_LOAD_ALL_TITLE: 'Предупреждение',
    CONFIRM_LOAD_ALL_CONFIRM: 'Да',
    CONFIRM_LOAD_ALL_CANCEL: 'Нет',
    CONFIRM_LOAD_ALL_MESSAGE: (total) => `Загрузка ${total} каналов займёт время. Продолжить?`,

    // ✅ ИНФОРМАЦИЯ
    EMPTY_NO_DATA: 'Нет каналов связи',
    EMPTY_ADD_FIRST: 'Добавьте первый канал',
    TITLE: 'Каналы связи',
    BTN_ADD: 'Добавить',
    ENTITY_LABEL: 'Канал',
    ENTITY_LABEL_PLURAL: 'Каналы',
    NO_NEW_RECORDS: 'Новых записей нет',
    NEW_RECORDS_LOADED: (count) => `Загружено ${count} новых записей`,
    ALL_RECORDS_LOADED: 'Все записи уже загружены',
    LOAD_PAUSED: 'Загрузка приостановлена',
    LOAD_RESUMED: 'Загрузка возобновлена',

    // ✅ КНОПКИ
    BTN_EDIT: 'Редактировать',
    BTN_DELETE: 'Удалить',
    BTN_SAVE: 'Сохранить',
    BTN_CANCEL: 'Отмена',
    BTN_LOAD_MORE: 'Загрузить ещё',
    BTN_LOAD_ALL: 'Загрузить все',
    BTN_PAUSE: 'Пауза',
    BTN_RESUME: 'Продолжить',
    BTN_REFRESH: 'Обновить',
    BTN_SETTINGS: 'Настройки',
    BTN_RESET_FILTERS: 'Сбросить фильтры',

    // ✅ ИНФОРМАЦИЯ (ФУНКЦИИ)
    LOADED_COUNT: (loaded, total) => `${loaded} из ${total}`,
    PROGRESS_PERCENTAGE: (percentage) => `${percentage}%`,

    // ✅ TOOLTIPS
    TOOLTIP_EDIT: 'Редактировать',
    TOOLTIP_DELETE: 'Удалить',
    TOOLTIP_LOAD_MORE: 'Загрузить ещё',
    TOOLTIP_LOAD_ALL: 'Загрузить все',
    TOOLTIP_REFRESH: 'Обновить список',
    TOOLTIP_SETTINGS: 'Настройки',
    TOOLTIP_FILTER_COMPANY: 'Фильтр по компании',
    TOOLTIP_FILTER_TYPE: 'Фильтр по типу',
    TOOLTIP_FILTER_STATUS: 'Фильтр по статусу',
    TOOLTIP_RESET_FILTERS: 'Сбросить все фильтры',
    TOOLTIP_SEARCH: 'Поиск',
    TOOLTIP_SORT: 'Сортировка',
    TOOLTIP_ENTITY_SETTINGS: 'Настройки сущности',
};

// ============================================================================
// FILTER PLACEHOLDERS
// ============================================================================

export const CHANNEL_FILTER_PLACEHOLDERS = {
    SORT: 'Сортировка',
    COMPANY: 'Все компании',
    TYPE: 'Все типы',
    STATUS: 'Все статусы',
};

// ============================================================================
// FILTER OPTIONS
// ============================================================================

export const CHANNEL_FILTER_OPTIONS = {
    STATUS_ACTIVE: 'Активные',
    STATUS_INACTIVE: 'Неактивные',
};

// ============================================================================
// PROPS CONFIG
// ============================================================================

export const CHANNEL_LIST_PROPS_CONFIG = {
    companyId: { type: Number, default: null },
    channels: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    loadingChunks: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    showAddButton: { type: Boolean, default: true },
    showEditButton: { type: Boolean, default: true },
    showDeleteButton: { type: Boolean, default: true },
    allowReorder: { type: Boolean, default: true },
    useStore: { type: Boolean, default: true },
    loadedCount: { type: Number, default: 0 },
    totalItems: { type: Number, default: 0 },
    chunkProgress: { type: Number, default: 0 },
    allRecordsLoaded: { type: Boolean, default: false },
    chunkSize: { type: Number, default: 500 },
    entity: { type: String, default: 'channel' },
    currentPage: { type: Number, default: 1 },
    pageSize: { type: Number, default: 15 },
    useServerPagination: { type: Boolean, default: false },
    searchQuery: { type: String, default: '' },
    sortBy: { type: String, default: 'order_asc' },
};

// ============================================================================
// HELPER FUNCTIONS — USER SETTINGS
// ============================================================================

export function saveChannelUserSettings(settings) {
    try {
        localStorage.setItem(CHANNEL_USER_SETTINGS.STORAGE_KEY, JSON.stringify(settings));
        console.log('🟢 [ChannelConfig] Settings saved:', settings);
        return true;
    } catch (e) {
        console.error('🔴 [ChannelConfig] Error saving settings:', e);
        return false;
    }
}

export function loadChannelUserSettings() {
    try {
        const saved = localStorage.getItem(CHANNEL_USER_SETTINGS.STORAGE_KEY);
        if (saved) {
            const settings = JSON.parse(saved);
            console.log('🟢 [ChannelConfig] Settings loaded:', settings);
            return settings;
        }
        console.log('🟡 [ChannelConfig] No settings found, using defaults');
        return null;
    } catch (e) {
        console.error('🔴 [ChannelConfig] Error loading settings:', e);
        return null;
    }
}

export function getDefaultChannelSettings() {
    return {
        chunkSize: CHANNEL_USER_SETTINGS.DEFAULT_CHUNK_SIZE,
        pageSize: CHANNEL_USER_SETTINGS.DEFAULT_PAGE_SIZE,
        sortBy: CHANNEL_USER_SETTINGS.DEFAULT_SORT_BY,
        sortDirection: CHANNEL_USER_SETTINGS.DEFAULT_SORT_DIRECTION,
        filterCompanyId: CHANNEL_USER_SETTINGS.DEFAULT_FILTER_COMPANY_ID,
        filterType: CHANNEL_USER_SETTINGS.DEFAULT_FILTER_TYPE,
        filterIsActive: CHANNEL_USER_SETTINGS.DEFAULT_FILTER_IS_ACTIVE,
    };
}

export function getChannelUserSettings() {
    const saved = loadChannelUserSettings();
    const defaults = getDefaultChannelSettings();
    return saved ? { ...defaults, ...saved } : defaults;
}

// ============================================================================
// HELPER FUNCTIONS — SORT OPTIONS
// ============================================================================

export function getChannelSortOptions() {
    return [
        CHANNEL_SORT_OPTIONS.ORDER_ASC,
        CHANNEL_SORT_OPTIONS.ORDER_DESC,
        CHANNEL_SORT_OPTIONS.ID_ASC,
        CHANNEL_SORT_OPTIONS.ID_DESC,
        CHANNEL_SORT_OPTIONS.TYPE_ASC,
        CHANNEL_SORT_OPTIONS.TYPE_DESC,
        CHANNEL_SORT_OPTIONS.TITLE_ASC,
        CHANNEL_SORT_OPTIONS.TITLE_DESC,
        CHANNEL_SORT_OPTIONS.COMPANY_ASC,
        CHANNEL_SORT_OPTIONS.COMPANY_DESC,
        CHANNEL_SORT_OPTIONS.CREATED_AT_DESC,
        CHANNEL_SORT_OPTIONS.CREATED_AT_ASC,
    ];
}

export function getChannelSortOptionByValue(value) {
    return Object.values(CHANNEL_SORT_OPTIONS).find(opt => opt.value === value);
}

export function getChannelSortLabelByValue(value) {
    const option = getChannelSortOptionByValue(value);
    return option ? option.label : '';
}

// ============================================================================
// HELPER FUNCTIONS — FILTERS
// ============================================================================

export function getChannelFilterPlaceholders() {
    return CHANNEL_FILTER_PLACEHOLDERS;
}

export function getChannelFilterOptions() {
    return CHANNEL_FILTER_OPTIONS;
}

// ============================================================================
// HELPER FUNCTIONS — GENERAL
// ============================================================================

export function getShowLoadButtonsThreshold() {
    return CHANNEL_LIST_THRESHOLDS.SHOW_LOAD_BUTTONS_MIN;
}

export function getConfirmLoadAllThreshold() {
    return CHANNEL_LIST_THRESHOLDS.CONFIRM_LOAD_ALL_MIN;
}

export function getSearchDebounce() {
    return CHANNEL_LIST_FILTERS.SEARCH_DEBOUNCE;
}

export function getDefaultChunkSize() {
    return CHANNEL_USER_SETTINGS.DEFAULT_CHUNK_SIZE;
}

export function getDefaultPageSize() {
    return CHANNEL_USER_SETTINGS.DEFAULT_PAGE_SIZE;
}

export function getPageSizeOptions() {
    return CHANNEL_LIST_FILTERS.PAGE_SIZE_OPTIONS;
}

export function getSuccessChunkLoadedMessage(count) {
    return CHANNEL_LIST_MESSAGES.SUCCESS_CHUNK_LOADED(count);
}

export function getSuccessAllLoadedMessage(total) {
    return CHANNEL_LIST_MESSAGES.SUCCESS_ALL_LOADED(total);
}
