// ============================================================================
// ⚙️ НАСТРОЙКИ ПАГИНАЦИИ (ЕДИНЫЙ ИСТОЧНИК ИСТИНЫ)
// ============================================================================

export const PAGE_SIZE_OPTIONS = {
    DEFAULT: 15,
    AVAILABLE: [5, 10, 15, 25, 30, 35, 50],
    MIN: 1,
    MAX: 10000,
};

export const PAGINATOR_DISPLAY = {
    LAYOUT: 'total,prev,pager,next,jumper,->',
    PAGER_COUNT: 7,
    HIDE_ON_SINGLE: false,
    BACKGROUND: true,
};

export const PAGINATION_LABELS = {
    ALL_ITEMS: 'Все',
    PAGE_SIZE_LABEL: '',
    PAGE_SIZE_SUFFIX: 'на странице',
};

export const PAGE_SIZE_SELECTOR_UI = {
    SHOW_LABEL: false,
    SELECT_SIZE: 'small',
    SELECT_WIDTH: '100px',
    CLASS_NAME: '',
    SELECT_CLASS: '',
    LABEL_COLOR: '#606266',
    LABEL_FONT_SIZE: '12px',
    GAP: '8px',
};

export const COMPANY_PAGINATION_UI = {
    GAP: '12px',
    MARGIN_TOP: '8px',
    PADDING: '8px 0',
};

// ============================================================================
// 📥 PROPS КОНФИГУРАЦИЯ (СТАТИЧНЫЕ ЗНАЧЕНИЯ ДЛЯ defineProps)
// ============================================================================

export const PAGE_SIZE_SELECTOR_PROPS = {
    MODEL_VALUE_TYPE: Number,
    MODEL_VALUE_REQUIRED: true,
    TOTAL_ITEMS_DEFAULT: 0,
    BASE_SIZES: () => PAGE_SIZE_OPTIONS.AVAILABLE,
    ALL_LABEL: PAGINATION_LABELS.ALL_ITEMS,
    SHOW_LABEL: PAGE_SIZE_SELECTOR_UI.SHOW_LABEL,
    LABEL: PAGINATION_LABELS.PAGE_SIZE_LABEL,
    SELECT_SIZE: PAGE_SIZE_SELECTOR_UI.SELECT_SIZE,
    CLASS_NAME: PAGE_SIZE_SELECTOR_UI.CLASS_NAME,
    SELECT_CLASS: PAGE_SIZE_SELECTOR_UI.SELECT_CLASS,
};

export const COMPANY_PAGINATION_PROPS = {
    CURRENT_PAGE_DEFAULT: 1,
    PAGE_SIZE_DEFAULT: PAGE_SIZE_OPTIONS.DEFAULT,
    TOTAL_ITEMS_DEFAULT: 0,
    TOTAL_PAGES_DEFAULT: 1,
};

// ============================================================================
// 🔧 ФУНКЦИИ КОНФИГУРАЦИИ (ДЛЯ RUNTIME ИСПОЛЬЗОВАНИЯ)
// ============================================================================

export function getInitialPaginationState() {
    return {
        currentPage: COMPANY_PAGINATION_PROPS.CURRENT_PAGE_DEFAULT,
        lastPage: COMPANY_PAGINATION_PROPS.TOTAL_PAGES_DEFAULT,
        perPage: PAGE_SIZE_OPTIONS.DEFAULT,
        totalItems: PAGE_SIZE_SELECTOR_PROPS.TOTAL_ITEMS_DEFAULT,
    };
}

export function generatePageSizeOptions(
    totalItems = PAGE_SIZE_SELECTOR_PROPS.TOTAL_ITEMS_DEFAULT,
    baseSizes = PAGE_SIZE_OPTIONS.AVAILABLE,
    allLabel = PAGINATION_LABELS.ALL_ITEMS,
    suffix = PAGINATION_LABELS.PAGE_SIZE_SUFFIX
) {
    if (!Array.isArray(baseSizes) || baseSizes.length === 0) {
        baseSizes = PAGE_SIZE_OPTIONS.AVAILABLE;
    }

    const sortedSizes = [...new Set(baseSizes)].sort((a, b) => a - b);
    const options = sortedSizes.map(size => ({
        value: size,
        label: `${size} ${suffix}`
    }));

    const maxSize = Math.max(...sortedSizes);
    if (totalItems > maxSize && !sortedSizes.includes(totalItems)) {
        options.push({
            value: totalItems,
            label: `${allLabel} (${totalItems})`
        });
    }

    return options;
}

export function getDefaultPaginationConfig(overrides = {}) {
    return {
        pageSize: PAGE_SIZE_OPTIONS.DEFAULT,
        pageSizes: PAGE_SIZE_OPTIONS.AVAILABLE,
        pagerCount: PAGINATOR_DISPLAY.PAGER_COUNT,
        layout: PAGINATOR_DISPLAY.LAYOUT,
        hideOnSinglePage: PAGINATOR_DISPLAY.HIDE_ON_SINGLE,
        background: PAGINATOR_DISPLAY.BACKGROUND,
        ...overrides
    };
}

export function getDefaultDisplayPaginationConfig(overrides = {}) {
    return {
        layout: PAGINATOR_DISPLAY.LAYOUT,
        pagerCount: PAGINATOR_DISPLAY.PAGER_COUNT,
        hideOnSinglePage: PAGINATOR_DISPLAY.HIDE_ON_SINGLE,
        background: PAGINATOR_DISPLAY.BACKGROUND,
        ...overrides
    };
}

export function getDefaultPageSizeSelectorConfig(overrides = {}) {
    return {
        totalItems: PAGE_SIZE_SELECTOR_PROPS.TOTAL_ITEMS_DEFAULT,
        baseSizes: PAGE_SIZE_SELECTOR_PROPS.BASE_SIZES(),
        allLabel: PAGE_SIZE_SELECTOR_PROPS.ALL_LABEL,
        showLabel: PAGE_SIZE_SELECTOR_PROPS.SHOW_LABEL,
        label: PAGE_SIZE_SELECTOR_PROPS.LABEL,
        selectSize: PAGE_SIZE_SELECTOR_PROPS.SELECT_SIZE,
        className: PAGE_SIZE_SELECTOR_PROPS.CLASS_NAME,
        selectClass: PAGE_SIZE_SELECTOR_PROPS.SELECT_CLASS,
        ...overrides
    };
}

export function getDefaultCompanyPaginationConfig(overrides = {}) {
    return {
        currentPage: COMPANY_PAGINATION_PROPS.CURRENT_PAGE_DEFAULT,
        pageSize: COMPANY_PAGINATION_PROPS.PAGE_SIZE_DEFAULT,
        totalItems: COMPANY_PAGINATION_PROPS.TOTAL_ITEMS_DEFAULT,
        totalPages: COMPANY_PAGINATION_PROPS.TOTAL_PAGES_DEFAULT,
        ...overrides
    };
}
