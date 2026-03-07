// ============================================================================
// APP CONFIG FILTERS — FILTERS COMPONENT & SORT OPTIONS
// ============================================================================
// 📁 Путь: config/common/appConfigFilters.js
// ✅ Используется: Filters.vue, CompanyList.vue, companyStore.js
// ✅ Безопасно менять — влияет на фильтры и сортировку
// ============================================================================

// ============================================================================
// SORT OPTIONS (варианты сортировки)
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

// ============================================================================
// HELPER FUNCTIONS (сортировка)
// ============================================================================

// ✅ Получить все опции сортировки
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

// ✅ Получить опцию сортировки по значению
export function getSortOptionByValue(value) {
    return Object.values(SORT_OPTIONS).find(opt => opt.value === value);
}

// ✅ Получить label сортировки по значению (для опций)
export function getSortLabelByValue(value) {
    const option = getSortOptionByValue(value);
    return option ? option.label : '';
}

// ============================================================================
// UI CONFIGS (БАЗОВЫЕ)
// ============================================================================

export const FILTERS_UI = {
    HEIGHT: '24px',
    INPUT_WIDTH: '120px',
    INPUT_WIDTH_FOCUSED: '180px',
    SELECT_WIDTH: '60px',
    GAP: '6px',
    FONT_SIZE: '9px',
    TRANSITION_DURATION: '0.2s',
};

// ============================================================================
// FILTERS FILTERS UI CONFIGS (настройки фильтров)
// ============================================================================

export const FILTERS_FILTERS_UI = {
    // ✅ CONTAINER
    CONTAINER_PADDING: '1px',
    CONTAINER_GAP: '6px',
    CONTAINER_GAP_MOBILE: '4px',
    CONTAINER_GAP_SMALL: '4px',
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
    WRAPPER_PADDING: '0 3px',
    WRAPPER_PADDING_MOBILE: '0 6px',
    WRAPPER_PADDING_SMALL: '0 4px',
    WRAPPER_PADDING_TOUCH: '0 8px',
    WRAPPER_BORDER_RADIUS: '2px',

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
    PREFIX_FONT_SIZE_TOUCH: '14px',

    // ✅ CLEAR BUTTON
    CLEAR_FONT_SIZE: '8px',
    CLEAR_FONT_SIZE_TOUCH: '12px',

    // ✅ BUTTON
    BUTTON_HEIGHT: '20px',
    BUTTON_HEIGHT_TOUCH: '36px',
    BUTTON_FONT_SIZE: '11px',
    BUTTON_FONT_SIZE_TOUCH: '14px',
    BUTTON_PADDING: '0 4px',
    BUTTON_PADDING_TOUCH: '8px 12px',
    BUTTON_ICON_SIZE: '9px',
    BUTTON_ICON_SIZE_TOUCH: '14px',

    // ✅ INFO
    INFO_LABEL_FONT_SIZE: '5px',
    INFO_LABEL_FONT_SIZE_TOUCH: '9px',
    INFO_COUNT_FONT_SIZE: '7px',
    INFO_COUNT_FONT_SIZE_TOUCH: '11px',

    // ✅ ROW / FILTER ITEM
    ROW_GAP: '6px',
    ROW_GAP_MOBILE: '6px',
    ROW_GAP_SMALL: '4px',
    SEARCH_WIDTH: '120px',
    SEARCH_WIDTH_FOCUSED: '180px',
    SELECT_WIDTH: '60px',
};

// ============================================================================
// MESSAGES (тексты интерфейса — С TOOLTIP!)
// ============================================================================

export const FILTERS_MESSAGES = {
    // ✅ SEARCH
    SEARCH_PLACEHOLDER: 'Поиск...',
    SEARCH_TOOLTIP: 'Поиск по названию, описанию, адресу',

    // ✅ SORT
    SORT_LABEL: 'Сортировка',
    SORT_TOOLTIP: 'Сортировка списка компаний',

    // ✅ ICON FILTER
    ICON_FILTER_TOOLTIP: 'Фильтр по наличию иконки',

    // ✅ INFO
    FOUND_LABEL: 'Найдено',

    // ✅ RESET
    RESET_TOOLTIP: 'Сбросить все фильтры',
};

// ============================================================================
// PROPS CONFIG (для Filters.vue)
// ============================================================================

export const FILTERS_PROPS_CONFIG = {
    totalItems: { type: Number, default: 0 },
    totalFiltered: { type: Number, default: 0 },
    disabled: { type: Boolean, default: false },
    availableSizes: { type: Array, default: () => [] },
    showIconFilter: { type: Boolean, default: true },
    searchDebounce: { type: Number, default: 700 },
    sortOptions: { type: Array, default: null },
};

// ============================================================================
// HELPER FUNCTIONS (фильтры)
// ============================================================================

// ✅ Получить placeholder поиска
export function getSearchPlaceholder() {
    return FILTERS_MESSAGES.SEARCH_PLACEHOLDER;
}

// ✅ Получить tooltip поиска
export function getSearchTooltip() {
    return FILTERS_MESSAGES.SEARCH_TOOLTIP;
}

// ✅ Получить label для селекта сортировки
export function getSortSelectLabel() {
    return FILTERS_MESSAGES.SORT_LABEL;
}

// ✅ Получить tooltip сортировки
export function getSortTooltip() {
    return FILTERS_MESSAGES.SORT_TOOLTIP;
}

// ✅ Получить tooltip фильтра иконок
export function getIconFilterTooltip() {
    return FILTERS_MESSAGES.ICON_FILTER_TOOLTIP;
}

// ✅ Получить label найденных
export function getFoundLabel() {
    return FILTERS_MESSAGES.FOUND_LABEL;
}

// ✅ Получить tooltip сброса
export function getResetTooltip() {
    return FILTERS_MESSAGES.RESET_TOOLTIP;
}
