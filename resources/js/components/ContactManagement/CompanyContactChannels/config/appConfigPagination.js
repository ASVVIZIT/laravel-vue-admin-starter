// ============================================================================
// APP CONFIG PAGINATION — PAGINATION COMPONENT
// ============================================================================
// 📁 Путь: config/appConfigPagination.js
// ✅ Используется: Pagination.vue, CompanyList.vue, companyStore.js
// ✅ Безопасно менять — влияет только на компонент пагинации
// ✅ Зависит от: appConfigPageSizeSelector.js (PAGE_SIZE_OPTIONS)
// ============================================================================

import { PAGE_SIZE_OPTIONS } from './appConfigPageSizeSelector.js';

// ============================================================================
// UI CONFIGS
// ============================================================================

export const PAGINATION_FILTERS_UI = {
    // ✅ WRAPPER
    WRAPPER_HEIGHT: '17px',
    WRAPPER_HEIGHT_MOBILE: '20px',
    WRAPPER_HEIGHT_SMALL: '17px',
    WRAPPER_HEIGHT_TOUCH: '32px',
    WRAPPER_FONT_SIZE: '8.5px',
    WRAPPER_FONT_SIZE_MOBILE: '9px',
    WRAPPER_FONT_SIZE_SMALL: '8px',
    WRAPPER_FONT_SIZE_TOUCH: '14px',

    // ✅ BUTTON
    BUTTON_HEIGHT: '17px',
    BUTTON_HEIGHT_MOBILE: '24px',
    BUTTON_HEIGHT_SMALL: '20px',
    BUTTON_HEIGHT_TOUCH: '44px',
    BUTTON_WIDTH: '17px',
    BUTTON_WIDTH_MOBILE: '24px',
    BUTTON_WIDTH_SMALL: '20px',
    BUTTON_WIDTH_TOUCH: '36px',
    BUTTON_FONT_SIZE: '8.5px',
    BUTTON_FONT_SIZE_MOBILE: '10px',
    BUTTON_FONT_SIZE_SMALL: '9px',
    BUTTON_FONT_SIZE_TOUCH: '14px',

    // ✅ INPUT
    INPUT_WIDTH: '32px',
    INPUT_WIDTH_MOBILE: '32px',
    INPUT_WIDTH_SMALL: '28px',
    INPUT_WIDTH_TOUCH: '50px',
    INPUT_HEIGHT: '17px',
    INPUT_HEIGHT_MOBILE: '20px',
    INPUT_HEIGHT_SMALL: '18px',
    INPUT_HEIGHT_TOUCH: '32px',

    // ✅ SELECT
    SELECT_HEIGHT: '17px',
    SELECT_HEIGHT_MOBILE: '20px',
    SELECT_HEIGHT_SMALL: '17px',
    SELECT_HEIGHT_TOUCH: '32px',

    // ✅ DROPDOWN
    DROPDOWN_HEIGHT: '17px',
    DROPDOWN_HEIGHT_MOBILE: '20px',
    DROPDOWN_HEIGHT_SMALL: '17px',
    DROPDOWN_HEIGHT_TOUCH: '32px',
    DROPDOWN_PADDING: '3px 7px',
    DROPDOWN_PADDING_MOBILE: '4px 8px',
    DROPDOWN_PADDING_SMALL: '3px 6px',
    DROPDOWN_PADDING_TOUCH: '8px 10px',
};

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

// ============================================================================
// PAGINATOR DISPLAY
// ============================================================================

export const PAGINATOR_DISPLAY = {
    LAYOUT: 'total, prev, pager, next, last, jumper',
    PAGER_COUNT: 5,
    HIDE_ON_SINGLE: true,
};

// ============================================================================
// MESSAGES
// ============================================================================

export const PAGINATION_MESSAGES = {
    RECALCULATING: 'Пересчет...',
    FIRST_PAGE: 'Первая страница',
    LAST_PAGE: 'Последняя страница',
    PAGE_SIZE_LABEL: 'На странице:',
    ALL_ITEMS: 'Все',
};

// ============================================================================
// PROPS CONFIG
// ============================================================================

export const PAGINATION_PROPS_CONFIG = {
    currentPage: { type: Number, default: 1 },
    pageSize: { type: Number, default: 15 },
    loadedCount: { type: Number, required: true },
    totalItems: { type: Number, default: 0 },
    availableSizes: { type: Array, required: true },
    disabled: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getInitialPaginationState() {
    return {
        currentPage: 1,
        perPage: PAGE_SIZE_OPTIONS.BASE_AVAILABLE[2],
        lastPage: 1,
    };
}
