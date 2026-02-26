// ============================================================================
// ДЛЯ ТЕСТИРОВАНИЯ — ДОБАВИТЬ В НАЧАЛО ФАЙЛА
// ============================================================================

if (typeof window !== 'undefined') {
    window.SIMULATE_API_ERROR = false;
    window.DEBUG_LOGS = true;
}

// ============================================================================
// BREAKPOINTS — АДАПТИВ (15 ВАРИАНТОВ)
// ============================================================================

export const BREAKPOINTS = {
    // Очень маленькие телефоны
    XS: 320,
    SM: 375,

    // Маленькие телефоны
    MD: 414,

    // Большие телефоны / Маленькие планшеты
    LG: 480,
    XL: 576,

    // Планшеты
    XXL: 640,
    XXXL: 768,

    // Большие планшеты / Маленькие десктопы
    XXXXL: 834,
    XXXXXL: 1024,

    // Десктопы
    DESKTOP: 1280,
    DESKTOP_LARGE: 1440,
    DESKTOP_XL: 1920,
    DESKTOP_2K: 2560,
    DESKTOP_4K: 3840,
};

// ============================================================================
// MEDIA QUERIES — ГОТОВЫЕ ЗАПРОСЫ
// ============================================================================

export const MEDIA_QUERIES = {
    MAX_XS: `@media (max-width: ${BREAKPOINTS.XS}px)`,
    MAX_SM: `@media (max-width: ${BREAKPOINTS.SM}px)`,
    MAX_MD: `@media (max-width: ${BREAKPOINTS.MD}px)`,
    MAX_LG: `@media (max-width: ${BREAKPOINTS.LG}px)`,
    MAX_XL: `@media (max-width: ${BREAKPOINTS.XL}px)`,
    MAX_XXL: `@media (max-width: ${BREAKPOINTS.XXL}px)`,
    MAX_XXXL: `@media (max-width: ${BREAKPOINTS.XXXL}px)`,
    MAX_XXXXL: `@media (max-width: ${BREAKPOINTS.XXXXL}px)`,
    MAX_XXXXXL: `@media (max-width: ${BREAKPOINTS.XXXXXL}px)`,
    MAX_DESKTOP: `@media (max-width: ${BREAKPOINTS.DESKTOP}px)`,
    MAX_DESKTOP_LARGE: `@media (max-width: ${BREAKPOINTS.DESKTOP_LARGE}px)`,
    MAX_DESKTOP_XL: `@media (max-width: ${BREAKPOINTS.DESKTOP_XL}px)`,

    MIN_XS: `@media (min-width: ${BREAKPOINTS.XS}px)`,
    MIN_SM: `@media (min-width: ${BREAKPOINTS.SM}px)`,
    MIN_MD: `@media (min-width: ${BREAKPOINTS.MD}px)`,
    MIN_LG: `@media (min-width: ${BREAKPOINTS.LG}px)`,
    MIN_XL: `@media (min-width: ${BREAKPOINTS.XL}px)`,
    MIN_XXL: `@media (min-width: ${BREAKPOINTS.XXL}px)`,
    MIN_XXXL: `@media (min-width: ${BREAKPOINTS.XXXL}px)`,
    MIN_XXXXL: `@media (min-width: ${BREAKPOINTS.XXXXL}px)`,
    MIN_XXXXXL: `@media (min-width: ${BREAKPOINTS.XXXXXL}px)`,
    MIN_DESKTOP: `@media (min-width: ${BREAKPOINTS.DESKTOP}px)`,
    MIN_DESKTOP_LARGE: `@media (min-width: ${BREAKPOINTS.DESKTOP_LARGE}px)`,
    MIN_DESKTOP_XL: `@media (min-width: ${BREAKPOINTS.DESKTOP_XL}px)`,

    BETWEEN_XS_SM: `@media (min-width: ${BREAKPOINTS.XS}px) and (max-width: ${BREAKPOINTS.SM}px)`,
    BETWEEN_SM_MD: `@media (min-width: ${BREAKPOINTS.SM}px) and (max-width: ${BREAKPOINTS.MD}px)`,
    BETWEEN_MD_LG: `@media (min-width: ${BREAKPOINTS.MD}px) and (max-width: ${BREAKPOINTS.LG}px)`,
    BETWEEN_LG_XL: `@media (min-width: ${BREAKPOINTS.LG}px) and (max-width: ${BREAKPOINTS.XL}px)`,
    BETWEEN_XL_XXL: `@media (min-width: ${BREAKPOINTS.XL}px) and (max-width: ${BREAKPOINTS.XXL}px)`,
    BETWEEN_XXL_XXXL: `@media (min-width: ${BREAKPOINTS.XXL}px) and (max-width: ${BREAKPOINTS.XXXL}px)`,
    BETWEEN_XXXL_XXXXL: `@media (min-width: ${BREAKPOINTS.XXXL}px) and (max-width: ${BREAKPOINTS.XXXXL}px)`,
    BETWEEN_XXXXL_XXXXXL: `@media (min-width: ${BREAKPOINTS.XXXXL}px) and (max-width: ${BREAKPOINTS.XXXXXL}px)`,
    BETWEEN_XXXXXL_DESKTOP: `@media (min-width: ${BREAKPOINTS.XXXXXL}px) and (max-width: ${BREAKPOINTS.DESKTOP}px)`,
    BETWEEN_DESKTOP_DESKTOP_LARGE: `@media (min-width: ${BREAKPOINTS.DESKTOP}px) and (max-width: ${BREAKPOINTS.DESKTOP_LARGE}px)`,
    BETWEEN_DESKTOP_LARGE_DESKTOP_XL: `@media (min-width: ${BREAKPOINTS.DESKTOP_LARGE}px) and (max-width: ${BREAKPOINTS.DESKTOP_XL}px)`,

    MOBILE_ONLY: `@media (max-width: ${BREAKPOINTS.XL}px)`,
    TABLET_ONLY: `@media (min-width: ${BREAKPOINTS.XXL}px) and (max-width: ${BREAKPOINTS.XXXXXL}px)`,
    DESKTOP_ONLY: `@media (min-width: ${BREAKPOINTS.DESKTOP}px)`,

    PORTRAIT: '@media (orientation: portrait)',
    LANDSCAPE: '@media (orientation: landscape)',

    TOUCH_ONLY: '@media (hover: none) and (pointer: coarse)',
    HOVER_CAPABLE: '@media (hover: hover)',
    FINE_POINTER: '@media (pointer: fine)',
};

// ============================================================================
// ANIMATIONS & TIMINGS
// ============================================================================

export const ANIMATIONS = {
    TRANSITION_INSTANT: '0s',
    TRANSITION_FASTEST: '0.1s',
    TRANSITION_FAST: '0.15s',
    TRANSITION_NORMAL: '0.2s',
    TRANSITION_SLOW: '0.3s',
    TRANSITION_SLOWER: '0.4s',
    TRANSITION_SLOWEST: '0.5s',

    EASING_LINEAR: 'linear',
    EASING_EASE: 'ease',
    EASING_EASE_IN: 'ease-in',
    EASING_EASE_OUT: 'ease-out',
    EASING_EASE_IN_OUT: 'ease-in-out',
    EASING_CUBIC_BEZIER: 'cubic-bezier(0.4, 0, 0.2, 1)',
    EASING_BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    EASING_SPRING: 'cubic-bezier(0.34, 1.56, 0.64, 1)',

    FADE_IN: 'fadeIn 0.3s ease-in-out',
    FADE_OUT: 'fadeOut 0.3s ease-in-out',
    SLIDE_IN: 'slideIn 0.3s ease-out',
    SLIDE_OUT: 'slideOut 0.3s ease-in',
    SCALE_IN: 'scaleIn 0.2s ease-out',
    SCALE_OUT: 'scaleOut 0.2s ease-in',
    ROTATE: 'rotate 1s linear infinite',
    PULSE: 'pulse 2s ease-in-out infinite',
    BOUNCE: 'bounce 1s ease-in-out infinite',
    SHAKE: 'shake 0.5s ease-in-out',

    SPINNER_ROTATION: 'spin 1s linear infinite',
    PROGRESS_BAR: 'progress 2s ease-in-out infinite',
    SKELETON: 'skeleton 1.5s ease-in-out infinite',
};

export const TIMINGS = {
    DEBOUNCE_INSTANT: 0,
    DEBOUNCE_FAST: 200,
    DEBOUNCE_NORMAL: 300,
    DEBOUNCE_SEARCH: 500,
    DEBOUNCE_SLOW: 700,
    DEBOUNCE_VERY_SLOW: 1000,

    THROTTLE_FAST: 100,
    THROTTLE_NORMAL: 200,
    THROTTLE_SLOW: 500,

    DELAY_INSTANT: 0,
    DELAY_FAST: 100,
    DELAY_NORMAL: 200,
    DELAY_SLOW: 300,
    DELAY_VERY_SLOW: 500,

    TOOLTIP_DELAY: 200,
    TOOLTIP_HIDE_DELAY: 100,
    DROPDOWN_DELAY: 150,
    MODAL_ANIMATION: 300,
    TOAST_DURATION: 3000,
    TOAST_ERROR_DURATION: 5000,

    FILTER_TRANSITION_DELAY: 100,
    PAGE_SIZE_TRANSITION_DELAY: 150,
    RECALCULATING_DURATION: 150,
    TABLE_ROW_ANIMATION: 200,

    CHUNK_LOAD_DELAY: 200,
    LOADING_MIN_DURATION: 500,
    LOADING_MAX_DURATION: 3000,
    REFRESH_COOLDOWN: 1000,

    DRAG_ANIMATION: 200,
    DRAG_GHOST_OPACITY: 0.5,
    DROP_ANIMATION: 150,
};

// ============================================================================
// STATE FUNCTIONS
// ============================================================================

export function getInitialPaginationState() {
    return {
        currentPage: 1,
        perPage: 15,
        lastPage: 1,
    };
}

export function getInitialCompanyListState() {
    return {
        dialogVisible: false,
        editingCompany: null,
        formLoading: false,
        deletionLoading: false,
        deleteConfirmDialogVisible: false,
        companyToDelete: null,
        filteringLoading: false,
        pageSizeLoading: false,
        searchQuery: '',
        filterHasIcon: '',
        sortBy: 'id_asc',
    };
}

export function getInitialCompanyFormState() {
    return {
        formData: { name: '', description: '', address: '', settings: { icon: '' } },
    };
}

// ============================================================================
// PROPS CONFIGS — БАЗОВЫЕ
// ============================================================================

export const COMMON_PROPS_CONFIG = {
    loading: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
};

// ============================================================================
// PROPS CONFIGS — КОМПОНЕНТЫ
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

export const COMPANY_FORM_PROPS_CONFIG = {
    ...COMMON_PROPS_CONFIG,
    visible: { type: Boolean, default: false },
    company: { type: Object, default: null },
    iconOptions: { type: Array, default: () => [] },
    iconMap: { type: Object, default: () => ({}) },
};

export const COMPANY_TABLE_PROPS_CONFIG = {
    ...COMMON_PROPS_CONFIG,
    data: { type: Array, required: true },
    iconMap: { type: Object, required: true },
    iconOptions: { type: Array, required: true },
    currentPage: { type: Number, default: 1 },
    pageSize: { type: Number, default: 15 },
    tableHeight: { type: String, default: '280' },
};

export const PAGINATION_PROPS_CONFIG = {
    ...COMMON_PROPS_CONFIG,
    currentPage: { type: Number, default: 1 },
    pageSize: { type: Number, default: 15 },
    loadedCount: { type: Number, required: true },
    totalItems: { type: Number, default: 0 },
    availableSizes: { type: Array, required: true },
};

export const PAGE_SIZE_SELECTOR_PROPS_CONFIG = {
    modelValue: { type: Number, default: 15 },
    totalItems: { type: Number, default: 0 },
    loadedCount: { type: Number, default: 0 },
    availableSizes: { type: Array, default: () => [] },
    allLabel: { type: String, default: 'Все' },
    showLabel: { type: Boolean, default: false },
    label: { type: String, default: 'На странице:' },
    selectSize: { type: String, default: 'small' },
    className: { type: String, default: '' },
    selectClass: { type: String, default: '' },
};

export const EDITABLE_CELL_PROPS_CONFIG = {
    modelValue: { type: [String, Number], default: '' },
    type: { type: String, default: 'text' },
    placeholder: { type: String, default: 'Введите значение' },
    disabled: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    emptyText: { type: String, default: '—' },
    maxLength: { type: Number, default: 255 },
    rows: { type: Number, default: 1 },
    showEditButton: { type: Boolean, default: true },
    showActionButtons: { type: Boolean, default: false },
    validator: { type: Function, default: null },
};

export const FILTERS_PROPS_CONFIG = {
    totalItems: { type: Number, default: 0 },
    totalFiltered: { type: Number, default: 0 },
    disabled: { type: Boolean, default: false },
    availableSizes: { type: Array, default: () => [] },
    showIconFilter: { type: Boolean, default: true },
    searchDebounce: { type: Number, default: 700 },
};

export const DELETE_CONFIRM_PROPS_CONFIG = {
    visible: { type: Boolean, default: false },
    item: { type: Object, default: null },
    itemName: { type: String, default: '' },
    entityLabel: { type: String, default: 'запись' },
    loading: { type: Boolean, default: false },
};

export const LOADING_DATA_ACTIONS_PROPS_CONFIG = {
    loaded: { type: Number, required: true },
    total: { type: Number, required: true },
    percentage: { type: Number, required: true },
    chunkSize: { type: Number, default: 500 },
    disabled: { type: Boolean, default: false },
    isLoading: { type: Boolean, default: false },
    isPaused: { type: Boolean, default: false },
    showLoadMore: { type: Boolean, default: true },
    showLoadAll: { type: Boolean, default: true },
    showRefresh: { type: Boolean, default: false },
    chunkProgress: { type: Number, default: 0 },
};

export const CHUNK_PROGRESS_PROPS_CONFIG = {
    loaded: { type: Number, required: true },
    total: { type: Number, required: true },
    percentage: { type: Number, required: true },
    chunkProgress: { type: Number, default: 0 },
    isLoading: { type: Boolean, default: false },
};

export const SETTINGS_MODAL_PROPS_CONFIG = {
    visible: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    isSaving: { type: Boolean, default: false },
};

// ============================================================================
// UI CONFIGS — PAGINATION
// ============================================================================

export const PAGINATION_UI = {
    GAP: '8px',
    MARGIN_TOP: '8px',
    PADDING: '4px 0',
    FONT_SIZE: '8.5px',
    BUTTON_HEIGHT: '17px',
    BUTTON_WIDTH: '17px',
    BUTTON_PADDING: '0 4px',
    BUTTON_MARGIN: '0 1.5px',
    BORDER_RADIUS: '2px',
    INPUT_WIDTH: '32px',
    INPUT_HEIGHT: '17px',
    INPUT_PADDING: '1px 4px',
    SELECT_WIDTH: '70px',
    SELECT_HEIGHT: '17px',
    DROPDOWN_PADDING: '3px 7px',
    TOTAL_MARGIN: '6px',
    JUMP_MARGIN: '6px',
    RECALCULATING_DURATION: 150,
    RECALCULATING_BANNER_TOP: '-16px',
    RECALCULATING_BANNER_TOP_MOBILE: '-20px',
};

export const PAGINATOR_DISPLAY = {
    LAYOUT: 'total, prev, pager, next, last, jumper',
    PAGER_COUNT: 5,
    HIDE_ON_SINGLE: true,
};

export const PAGINATION_LABELS = {
    PAGE_SIZE_SUFFIX: 'на странице',
    ALL_ITEMS: 'Все',
};

export const PAGINATION_MESSAGES = {
    RECALCULATING: 'Пересчет...',
    FIRST_PAGE: 'Первая страница',
    LAST_PAGE: 'Последняя страница',
    PAGE_SIZE_LABEL: 'На странице:',
    ALL_ITEMS: 'Все',
};

// ============================================================================
// UI CONFIGS — TABLE
// ============================================================================

export const COMPANY_TABLE_UI = {
    HEADER_BACKGROUND: '#f5f7fa',
    HEADER_COLOR: '#606266',
    HEADER_FONT_WEIGHT: '600',
    HEADER_FONT_SIZE: '8px',
    HEADER_HEIGHT: '20px',
    HEADER_PADDING: '0 2px',
    CELL_FONT_SIZE: '8px',
    CELL_FONT_SIZE_MOBILE: '7px',
    CELL_FONT_SIZE_SMALL: '6px',
    CELL_PADDING: '1px 2px',
    CELL_HEIGHT: '22px',
    CELL_LINE_HEIGHT: '1.2',
    ROW_HEIGHT: '22px',
    TABLE_HEIGHT: 'calc(100vh - 290px)',
    HOVER_COLOR: '#f5f7fa',
    SCROLLBAR_WIDTH: '6px',
    SCROLLBAR_TRACK_COLOR: '#f1f1f1',
    SCROLLBAR_THUMB_COLOR: '#c1c1c1',
    SCROLLBAR_BORDER_RADIUS: '3px',
    EMPTY_ICON_SIZE: '24px',
    EMPTY_ICON_COLOR: '#909399',
    EMPTY_TEXT_COLOR: '#909399',
    EMPTY_TEXT_SIZE: '11px',
    EMPTY_PADDING: '20px 10px',
    EMPTY_GAP: '8px',
    ROW_NUMBER_FONT_SIZE: '7px',
    ROW_NUMBER_COLOR: '#909399',
    ID_FONT_WEIGHT: '600',
    ID_COLOR: '#409EFF',
    ID_FONT_SIZE: '8px',
    CHANNEL_TAG_HEIGHT: '14px',
    CHANNEL_TAG_PADDING: '0 3px',
    CHANNEL_TAG_FONT_SIZE: '7px',
    CHANNEL_TAG_FONT_WEIGHT: '500',
    ACTION_BTN_PADDING: '1px',
    ACTION_BTN_FONT_SIZE: '10px',
    ACTION_BTN_HOVER_SCALE: '1.1',
    ICON_DISPLAY_MIN_HEIGHT: '20px',
    ICON_PLACEHOLDER_FONT_SIZE: '14px',
    ICON_PLACEHOLDER_COLOR: '#c0c4cc',
    ICON_OPTION_GAP: '4px',
    ICON_SELECT_SIZE: '14px',
    ICON_DISPLAY_SIZE: '16px',
    ICON_DISPLAY_COLOR: '#409EFF',
    ROW_NUMBER_WIDTH: '28',
    ID_WIDTH: '35',
    NAME_MIN_WIDTH: '120',
    ICON_WIDTH: '120',
    DESCRIPTION_MIN_WIDTH: '130',
    ADDRESS_MIN_WIDTH: '120',
    CHANNEL_WIDTH: '55',
    ACTION_WIDTH: '60',
    DESCRIPTION_MAX_LENGTH: 1000,
    ADDRESS_MAX_LENGTH: 500,
    LOADING_BACKGROUND: 'rgba(255, 255, 255, 0.9)',
    EMPTY_CELL_TEXT: '—',
    STRIPED_ROW_BACKGROUND: '#fafafa',
    CELL_OVERFLOW: 'visible',
    CONTAINER_OVERFLOW: 'hidden !important',
    FIXED_COLUMN_Z_INDEX: 10,
    TABLE_PROPS: {
        stripe: true,
        border: true,
        size: 'small',
    },
    TAG_PROPS: {
        effect: 'plain',
        size: 'small',
    },
    CHANNEL_THRESHOLDS: {
        LOW: 3,
        MEDIUM: 10,
    },
    CHANNEL_TAG_TYPES: {
        EMPTY: 'info',
        LOW: 'success',
        MEDIUM: 'warning',
        HIGH: 'danger',
    },
    NAME_PLACEHOLDER: 'Название',
    ICON_PLACEHOLDER: 'Выберите',
    DESCRIPTION_PLACEHOLDER: 'Описание',
    ADDRESS_PLACEHOLDER: 'Адрес',
};

// ============================================================================
// UI CONFIGS — FORM
// ============================================================================

export const COMPANY_FORM_UI = {
    DIALOG_WIDTH: '500px',
    DIALOG_BODY_PADDING: '20px',
    DIALOG_HEADER_PADDING: '16px 20px',
    DIALOG_HEADER_BORDER_COLOR: '#EBEEF5',
    DIALOG_TITLE_FONT_SIZE: '16px',
    DIALOG_TITLE_FONT_WEIGHT: '600',
    DIALOG_TITLE_COLOR: '#303133',
    LABEL_WIDTH: '80px',
    LABEL_POSITION: 'top',
    FORM_SIZE: 'small',
    ICON_SELECT_WIDTH: '100%',
    FORM_LABEL_FONT_SIZE: '12px',
    FORM_LABEL_FONT_WEIGHT: '500',
    FORM_LABEL_COLOR: '#606266',
    FORM_LABEL_MARGIN_BOTTOM: '4px',
    FORM_INPUT_FONT_SIZE: '13px',
    FORM_TEXTAREA_MIN_HEIGHT: '60px',
    FORM_TEXTAREA_RESIZE: 'vertical',
    FORM_ROW_GAP: '16px',
    FORM_ROW_MARGIN_BOTTOM: '16px',
    FORM_ITEM_MARGIN_BOTTOM: '16px',
    FORM_FOOTER_GAP: '12px',
    FORM_FOOTER_PADDING_TOP: '12px',
    FORM_FOOTER_BUTTON_MIN_WIDTH: '80px',
    FORM_ID_INPUT_BACKGROUND: '#f5f7fa',
    FORM_ID_INPUT_COLOR: '#909399',
    FORM_ID_INPUT_FONT_WEIGHT: '600',
    FORM_SELECT_HEIGHT: '32px',
    FORM_ICON_OPTION_GAP: '6px',
    FORM_DROPDOWN_ITEM_PADDING: '8px 12px',
    FORM_DROPDOWN_HOVER_BACKGROUND: '#f5f7fa',
    FORM_DROPDOWN_SELECTED_BACKGROUND: '#f0f9eb',
    FORM_ERROR_FONT_SIZE: '12px',
    FORM_ERROR_PADDING_TOP: '4px',
    DIALOG_WIDTH_TABLET: '450px',
    DIALOG_WIDTH_MOBILE: '90%',
    DIALOG_WIDTH_SMALL: '95%',
    DIALOG_BODY_PADDING_SMALL: '16px 12px',
    FORM_LABEL_FONT_SIZE_SMALL: '11px',
    FORM_INPUT_FONT_SIZE_SMALL: '12px',
    FORM_ROW_GAP_TABLET: '12px',
    FORM_ROW_GAP_MOBILE: '8px',
    FORM_FOOTER_GAP_MOBILE: '8px',
};

// ============================================================================
// UI CONFIGS — FILTERS
// ============================================================================

export const FILTERS_UI = {
    HEIGHT: '24px',
    INPUT_WIDTH: '100px',
    INPUT_WIDTH_FOCUSED: '200px',
    SELECT_WIDTH: '100px',
    GAP: '6px',
    FONT_SIZE: '9px',
    TRANSITION_DURATION: '0.3s',
};

// ============================================================================
// UI CONFIGS — PAGE SIZE SELECTOR
// ============================================================================

export const PAGE_SIZE_SELECTOR_UI = {
    SHOW_LABEL: false,
    SELECT_SIZE: 'small',
    SELECT_WIDTH: '70px',
    CLASS_NAME: '',
    SELECT_CLASS: '',
    LABEL_COLOR: '#606266',
    LABEL_FONT_SIZE: '8.5px',
    GAP: '8px',
};

export const PAGE_SIZE_OPTIONS = {
    BASE_AVAILABLE: [5, 10, 15, 30, 50, 100, 200, 500, 1000],
    MIN: 5,
    MAX: 1000,
};

export function generateAvailablePageSizes(totalItems) {
    const baseSizes = PAGE_SIZE_OPTIONS.BASE_AVAILABLE;
    if (totalItems <= 0) return baseSizes;
    const filtered = baseSizes.filter(size => size <= totalItems);
    if (!filtered.includes(totalItems) && totalItems <= PAGE_SIZE_OPTIONS.MAX) {
        filtered.push(totalItems);
    }
    return filtered.sort((a, b) => a - b);
}

// ============================================================================
// UI CONFIGS — EDITABLE CELL
// ============================================================================

export const EDITABLE_CELL_UI = {
    FONT_SIZE: '8px',
    LINE_HEIGHT: '14px',
    INPUT_HEIGHT: '18px',
    INPUT_PADDING: '1px 4px',
    BUTTON_FONT_SIZE: '10px',
    ERROR_COLOR: '#f56c6c',
};

// ============================================================================
// UI CONFIGS — DELETE CONFIRM
// ============================================================================

export const DELETE_CONFIRM_UI = {
    DIALOG_WIDTH: '400px',
    ICON_SIZE: '48px',
    ICON_COLOR: '#f56c6c',
    CONTENT_PADDING: '8px 0',
    MESSAGE_FONT_SIZE: '14px',
    MESSAGE_COLOR: '#606266',
    MESSAGE_LINE_HEIGHT: '1.6',
    MESSAGE_MAX_WIDTH: '400px',
    ITEM_NAME_FONT_WEIGHT: '600',
    ITEM_NAME_COLOR: '#303133',
    HINT_GAP: '6px',
    HINT_FONT_SIZE: '12px',
    HINT_COLOR: '#909399',
    HINT_PADDING: '4px 8px',
    HINT_BACKGROUND: '#f5f7fa',
    HINT_BORDER_RADIUS: '4px',
    FOOTER_GAP: '12px',
    FOOTER_PADDING_TOP: '12px',
    BUTTON_MIN_WIDTH: '80px',
    HEADER_PADDING: '16px 20px',
    HEADER_BORDER: '1px solid #EBEEF5',
    HEADER_BACKGROUND: '#FFFFFF',
    TITLE_FONT_SIZE: '16px',
    TITLE_FONT_WEIGHT: '600',
    TITLE_COLOR: '#303133',
    BODY_PADDING: '24px 20px',
    FOOTER_PADDING: '12px 20px 16px',
    FOOTER_BORDER: '1px solid #EBEEF5',
    FOOTER_BACKGROUND: '#FFFFFF',
    DIALOG_WIDTH_TABLET: '450px',
    DIALOG_WIDTH_MOBILE: '90%',
    DIALOG_WIDTH_SMALL: '95%',
    BODY_PADDING_SMALL: '16px 12px',
    ICON_SIZE_TABLET: '42px',
    ICON_SIZE_MOBILE: '36px',
    ICON_SIZE_SMALL: '32px',
    MESSAGE_FONT_SIZE_TABLET: '13px',
    MESSAGE_FONT_SIZE_MOBILE: '12px',
    MESSAGE_FONT_SIZE_SMALL: '11px',
    HINT_FONT_SIZE_MOBILE: '11px',
    HINT_FONT_SIZE_SMALL: '10px',
    GAP_MOBILE: '12px',
    FOOTER_GAP_MOBILE: '8px',
};

// ============================================================================
// UI CONFIGS — SETTINGS MODAL
// ============================================================================

export const SETTINGS_UI = {
    DIALOG_WIDTH: '480px',
    DIALOG_WIDTH_TABLET: '460px',
    DIALOG_WIDTH_MOBILE: '90%',
    DIALOG_WIDTH_SMALL: '95%',
    LABEL_WIDTH: '160px',
    LABEL_POSITION: 'left',
    FORM_SIZE: 'default',
    HEADER_PADDING: '12px 16px',
    BODY_PADDING: '14px',
    FOOTER_PADDING: '12px 16px',
    BODY_PADDING_SMALL: '10px',
    HEADER_PADDING_SMALL: '10px 12px',
    FOOTER_PADDING_SMALL: '10px 12px',
    TITLE_FONT_SIZE: '14px',
    TITLE_FONT_SIZE_MOBILE: '13px',
    TITLE_FONT_SIZE_SMALL: '12px',
    DIVIDER_MARGIN: '10px 0 8px',
    DIVIDER_MARGIN_SMALL: '8px 0 6px',
    DIVIDER_FONT_SIZE: '12px',
    DIVIDER_FONT_SIZE_SMALL: '11px',
    FORM_ITEM_MARGIN: '12px',
    LABEL_FONT_SIZE: '12px',
    LABEL_FONT_SIZE_MOBILE: '11px',
    LABEL_FONT_SIZE_SMALL: '10px',
    HINT_FONT_SIZE: '10px',
    HINT_FONT_SIZE_MOBILE: '9px',
    HINT_FONT_SIZE_SMALL: '8px',
    SELECT_HEIGHT: '28px',
    SELECT_HEIGHT_TOUCH: '36px',
    BUTTON_FONT_SIZE: '12px',
    BUTTON_FONT_SIZE_SMALL: '11px',
    BUTTON_PADDING: '8px 14px',
    BUTTON_PADDING_SMALL: '7px 12px',
    BUTTON_MIN_WIDTH: '80px',
    BUTTON_MIN_WIDTH_SMALL: '75px',
    FOOTER_GAP: '8px',
    FOOTER_GAP_MOBILE: '6px',
    SCROLLBAR_WIDTH: '5px',
};

// ============================================================================
// UI CONFIGS — LOADING DATA ACTIONS
// ============================================================================

export const COLORS = {
    PRIMARY: '#409EFF',
    SUCCESS: '#67C23A',
    WARNING: '#FF9500',
    DANGER: '#F56C6C',
    INFO: '#909399',
};

export const LOADING_DATA_ACTIONS_UI = {
    HEIGHT: '28px',
    GAP: '8px',
    PADDING: '4px 8px',
    BACKGROUND: '#f5f7fa',
    BORDER_RADIUS: '4px',
    BORDER: '1px solid #e4e7ed',
    BUTTON_FONT_SIZE: '10px',
    BUTTON_HEIGHT: '22px',
    BUTTON_PADDING: '3px 8px',
    BUTTON_BORDER_RADIUS: '3px',
    ICON_SIZE: '12px',
    ICON_MARGIN: '2px',
    MAIN_BUTTON_MIN_WIDTH: '70px',
    REFRESH_BUTTON_PADDING: '3px 6px',
};

export const LOADING_DATA_ACTIONS_COLORS = {
    BTN_MORE_GRADIENT_FROM: '#67c23a',
    BTN_MORE_GRADIENT_TO: '#529b33',
    BTN_MORE_GRADIENT_FROM_HOVER: '#85ce61',
    BTN_MORE_GRADIENT_TO_HOVER: '#67c23a',
    BTN_MAIN_GRADIENT_FROM: '#e6a23c',
    BTN_MAIN_GRADIENT_TO: '#c98b2f',
    BTN_MAIN_GRADIENT_FROM_HOVER: '#ebb563',
    BTN_MAIN_GRADIENT_TO_HOVER: '#e6a23c',
    BTN_REFRESH_GRADIENT_FROM: '#909399',
    BTN_REFRESH_GRADIENT_TO: '#73767a',
    BTN_REFRESH_GRADIENT_FROM_HOVER: '#a6a9ad',
    BTN_REFRESH_GRADIENT_TO_HOVER: '#909399',
    TEXT_COLOR: '#FFF',
    DISABLED_OPACITY: '0.6',
};

// ============================================================================
// UI CONFIGS — CHUNK PROGRESS
// ============================================================================

export const CHUNK_PROGRESS_CONFIG = {
    HEIGHT: '20px',
    BORDER_RADIUS: '10px',
    LOADING_COLOR: '#409EFF',
    LOADING_COLOR_LIGHT: '#66b1ff',
    CHUNK_COLOR: '#FF9500',
    CHUNK_COLOR_LIGHT: '#FFB140',
    BACKGROUND_COLOR: '#e0e0e0',
    FONT_SIZE: '9px',
    FONT_SIZE_PERCENTAGE: '8px',
    FONT_WEIGHT: '700',
    TEXT_COLOR: '#FFFFFF',
    TEXT_SHADOW: '0 2px 4px rgba(0, 0, 0, 0.5)',
    TRANSITION_DURATION: '0.8s',
    TRANSITION_TIMING: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    BOX_SHADOW: 'inset 0 2px 4px rgba(0, 0, 0, 0.15)',
    STRIPE_WIDTH: '10px',
    STRIPE_ANGLE: '45deg',
    STRIPE_ANIMATION_DURATION: '4s',
    STRIPE_OPACITY: '0.25',
    CHUNK_OVERSHOOT_PERCENT: '12%',
    CHUNK_MIN_WIDTH: '5%',
    CHUNK_GROWTH_DURATION: '0.8s',
    CHUNK_SHADOW: '0 0 10px rgba(255, 149, 0, 0.8), inset 0 0 5px rgba(255, 255, 255, 0.3)',
    CHUNK_BORDER: '2px solid rgba(255, 255, 255, 0.6)',
    CHUNK_BORDER_RADIUS: '8px',
    CHUNK_Z_INDEX: 1,
    LOADED_Z_INDEX: 10,
    CHUNK_GRADIENT_ANGLE: '90deg',
    SHINE_WIDTH: '300px',
    SHINE_DURATION: '4s',
    SHINE_COLOR: 'rgba(255, 255, 255, 0.5)',
    SHINE_LEFT_START: '-150%',
    SHINE_LEFT_END: '150%',
    SHINE_ANIMATION_DELAY: '0s',
    STRIPES_WIDTH: '400%',
    STRIPES_LEFT_OFFSET: '-150%',
    STRIPES_ANIMATION_DISTANCE: '60px',
};

// ============================================================================
// UI CONFIGS — COMPANY LIST
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
    LOADING_SPINNER_COLOR: '#409EFF',
    LOADING_TEXT_COLOR: '#606266',
    LOADING_TEXT_SIZE: '12px',
    TITLE_FONT_SIZE: '13px',
    TITLE_FONT_WEIGHT: '600',
    TITLE_COLOR: '#303133',
};

// ============================================================================
// SORT OPTIONS
// ============================================================================

export const SORT_OPTIONS = {
    ID_ASC: { value: 'id_asc', label: 'ID ↑' },
    ID_DESC: { value: 'id_desc', label: 'ID ↓' },
    NAME_ASC: { value: 'name_asc', label: 'Название А-Я' },
    NAME_DESC: { value: 'name_desc', label: 'Название Я-А' },
    CREATED_AT_DESC: { value: 'created_at_desc', label: 'Сначала новые' },
    CREATED_AT_ASC: { value: 'created_at_asc', label: 'Сначала старые' },
    DEFAULT: 'id_asc',
};

export function getSortOptions() {
    return [
        SORT_OPTIONS.ID_ASC,
        SORT_OPTIONS.ID_DESC,
        SORT_OPTIONS.NAME_ASC,
        SORT_OPTIONS.NAME_DESC,
        SORT_OPTIONS.CREATED_AT_DESC,
        SORT_OPTIONS.CREATED_AT_ASC,
    ];
}

// ============================================================================
// MESSAGES — COMPANY FORM
// ============================================================================

export const COMPANY_FORM_MESSAGES = {
    TITLE_CREATE: 'Добавить Компанию',
    TITLE_EDIT: 'Редактировать Компанию',
    SUBMIT_CREATE: 'Создать',
    SUBMIT_EDIT: 'Сохранить',
    CANCEL: 'Отмена',
    FIELD_REQUIRED: (field) => `Поле "${field}" обязательно`,
    FIELD_MIN_LENGTH: (field, min) => `Минимум ${min} символов`,
    FIELD_MAX_LENGTH: (field, max) => `Максимум ${max} символов`,
    SUCCESS_COMPANY_CREATED: 'Компания создана',
    SUCCESS_COMPANY_UPDATED: 'Компания обновлена',
};

// ============================================================================
// MESSAGES — COMPANY LIST
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
// MESSAGES — FILTERS
// ============================================================================

export const FILTERS_MESSAGES = {
    SEARCH_PLACEHOLDER: 'Поиск...',
    ICON_FILTER_LABEL: 'Иконка',
    ICON_FILTER_ALL: 'Все',
    ICON_FILTER_WITH: 'С иконкой',
    ICON_FILTER_WITHOUT: 'Без иконки',
    SORT_LABEL: 'Сортировка',
    FOUND_LABEL: 'Найдено',
    RESET_TOOLTIP: 'Сбросить фильтры',
};

// ============================================================================
// MESSAGES — DELETE CONFIRM
// ============================================================================

export const DELETE_CONFIRM_MESSAGES = {
    TITLE: 'Подтверждение удаления',
    MESSAGE: (name, label) => `Удалить ${label} "${name}"?`,
    CONFIRM: 'Удалить',
    CANCEL: 'Отмена',
    HINT_TEXT: 'Это действие нельзя отменить',
};

// ============================================================================
// MESSAGES — LOADING DATA ACTIONS
// ============================================================================

export const LOADING_DATA_ACTIONS_MESSAGES = {
    TOOLTIP_LOAD_MORE: 'Загрузить ещё 500 записей',
    TOOLTIP_LOAD_ALL: 'Загрузить все записи',
    TOOLTIP_PAUSE: 'Приостановить загрузку',
    TOOLTIP_RESUME: 'Возобновить загрузку',
    TOOLTIP_REFRESH: 'Проверить новые записи',
    TOOLTIP_REFRESH_RECORD: 'Обновить запись',
    TOOLTIP_REFRESH_RECORD_LOADING: 'Обновление...',
    TOOLTIP_SETTINGS: 'Настройки',
    BTN_LOAD_MORE: '+500',
    BTN_LOAD_ALL: 'Все',
    BTN_PAUSE: 'Пауза',
    BTN_RESUME: 'Продолжить',
    STATUS_LOADING: 'Загрузка...',
    STATUS_PAUSED: 'Пауза',
    STATUS_COMPLETE: 'Готово',
    STATUS_WAITING: 'Ожидание',
};

// ============================================================================
// MESSAGES — SETTINGS MODAL
// ============================================================================

export const SETTINGS_MESSAGES = {
    TITLE_MAIN: 'Настройки',

    // ✅ ЗАГОЛОВОК ФОРМИРУЕТСЯ ДИНАМИЧЕСКИ ЧЕРЕЗ GETTER
    get TITLE() {
        return `${this.TITLE_MAIN} — ${COMPANY_LIST_MESSAGES.ENTITY_LABEL}`;
    },

    SECTION_DATA_LOAD: 'Загрузка данных',
    SECTION_DISPLAY: 'Отображение',
    SECTION_DEFAULT_FILTERS: 'Фильтры по умолчанию',

    LABEL_CHUNK_SIZE: 'Размер порции:',
    PLACEHOLDER_CHUNK_SIZE: 'Выберите размер',
    HINT_CHUNK_SIZE: 'Количество записей загружаемых за один раз',

    LABEL_CONFIRM_LOAD_ALL: 'Подтверждение загрузки всех:',
    HINT_CONFIRM_LOAD_ALL: 'Запрашивать подтверждение перед загрузкой всех записей',

    LABEL_PAGE_SIZE: 'Записей на страницу:',
    PLACEHOLDER_PAGE_SIZE: 'Выберите количество',
    HINT_PAGE_SIZE: 'Количество записей отображаемых на странице',

    LABEL_SHOW_LOAD_BUTTONS: 'Показывать кнопки загрузки:',
    HINT_SHOW_LOAD_BUTTONS: 'Отображать кнопки "Загрузить ещё" и "Загрузить все"',

    LABEL_DEFAULT_SORT: 'Сортировка по умолчанию:',
    PLACEHOLDER_DEFAULT_SORT: 'Выберите сортировку',
    HINT_DEFAULT_SORT: 'Сортировка применяемая при загрузке страницы',

    LABEL_DEFAULT_ICON_FILTER: 'Фильтр по иконке:',
    PLACEHOLDER_DEFAULT_ICON_FILTER: 'Выберите фильтр',
    HINT_DEFAULT_ICON_FILTER: 'Фильтр по иконкам применяемый при загрузке',

    ICON_FILTER_ALL: 'Все',
    ICON_FILTER_WITH: 'С иконкой',
    ICON_FILTER_WITHOUT: 'Без иконки',

    SWITCH_ON: 'Вкл',
    SWITCH_OFF: 'Выкл',

    BTN_SAVE: 'Сохранить',
    BTN_CANCEL: 'Отмена',
    BTN_RESET_DEFAULTS: 'Сбросить',
};

// ✅ ФУНКЦИЯ ДЛЯ ПОЛУЧЕНИЯ ЗАГОЛОВКА (для использования в template)
export function getSettingsTitle() {
    return `${SETTINGS_MESSAGES.TITLE_MAIN} — ${COMPANY_LIST_MESSAGES.ENTITY_LABEL}`;
}

// ============================================================================
// VALIDATION
// ============================================================================

export const COMPANY_FORM_VALIDATION = {
    NAME: { required: true, min: 2, max: 255, trigger: ['blur', 'change'] },
    DESCRIPTION: { required: false, max: 1000, trigger: ['blur', 'change'] },
    ADDRESS: { required: false, max: 500, trigger: ['blur', 'change'] },
};

export function getDefaultCompanyFormValidation() {
    return {
        name: [
            { required: COMPANY_FORM_VALIDATION.NAME.required, message: COMPANY_FORM_MESSAGES.FIELD_REQUIRED('Название'), trigger: COMPANY_FORM_VALIDATION.NAME.trigger },
            { min: COMPANY_FORM_VALIDATION.NAME.min, message: COMPANY_FORM_MESSAGES.FIELD_MIN_LENGTH('Название', COMPANY_FORM_VALIDATION.NAME.min), trigger: COMPANY_FORM_VALIDATION.NAME.trigger },
            { max: COMPANY_FORM_VALIDATION.NAME.max, message: COMPANY_FORM_MESSAGES.FIELD_MAX_LENGTH('Название', COMPANY_FORM_VALIDATION.NAME.max), trigger: COMPANY_FORM_VALIDATION.NAME.trigger },
        ],
        description: [
            { max: COMPANY_FORM_VALIDATION.DESCRIPTION.max, message: COMPANY_FORM_MESSAGES.FIELD_MAX_LENGTH('Описание', COMPANY_FORM_VALIDATION.DESCRIPTION.max), trigger: COMPANY_FORM_VALIDATION.DESCRIPTION.trigger },
        ],
        address: [
            { max: COMPANY_FORM_VALIDATION.ADDRESS.max, message: COMPANY_FORM_MESSAGES.FIELD_MAX_LENGTH('Адрес', COMPANY_FORM_VALIDATION.ADDRESS.max), trigger: COMPANY_FORM_VALIDATION.ADDRESS.trigger },
        ],
        'settings.icon': [],
    };
}

// ============================================================================
// FIELD CONFIGS
// ============================================================================

export const COMPANY_FORM_FIELDS = {
    NAME: { key: 'name', label: 'Название', placeholder: 'Введите название компании', maxLength: 255 },
    DESCRIPTION: { key: 'description', label: 'Описание', placeholder: 'Введите описание компании', maxLength: 1000, rows: 3 },
    ADDRESS: { key: 'address', label: 'Адрес', placeholder: 'Введите адрес компании', maxLength: 500 },
    ICON: { key: 'settings.icon', label: 'Иконка', placeholder: 'Выберите иконку', clearable: true },
};

// ============================================================================
// CHUNK & THRESHOLDS
// ============================================================================

export const CHUNK_CONFIG = {
    SIZE: 500,
    DELAY: 200,
    MAX_CONCURRENT: 1,
};

export const COMPANY_LIST_THRESHOLDS = {
    SHOW_LOAD_BUTTONS_MIN: 1000,
    CONFIRM_LOAD_ALL_MIN: 5000,
};

export const COMPANY_LIST_FILTERS = {
    SEARCH_DEBOUNCE: 700,
    FILTER_TRANSITION_DELAY: 100,
    PAGE_SIZE_TRANSITION_DELAY: 150,
};

// ============================================================================
// RECORD REFRESH
// ============================================================================

export const RECORD_REFRESH_CONFIG = {
    BUTTON_SIZE: 'small',
    BUTTON_TYPE: 'info',
    BUTTON_WIDTH: '24px',
    TOOLTIP: 'Обновить запись',
    TOOLTIP_LOADING: 'Обновление...',
};
