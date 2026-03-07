// ============================================================================
// APP CONFIG PAGE SIZE SELECTOR — PAGE SIZE SELECTOR COMPONENT
// ============================================================================
// 📁 Путь: config/common/appConfigPageSizeSelector.js
// ✅ Используется: PageSizeSelector.vue, Pagination.vue
// ✅ Безопасно менять — влияет только на селектор размера страницы
// ✅ Зависит от: config/global/index.js (COLORS)
// ============================================================================

import { COLORS } from '../global/index.js';

// ============================================================================
// UI CONFIGS (размеры и стили)
// ============================================================================

export const PAGE_SIZE_SELECTOR_UI = {
    // ✅ ВИДИМОСТЬ
    SHOW_LABEL: false,

    // ✅ SELECT
    SELECT_SIZE: 'small',
    SELECT_WIDTH: '70px',
    CLASS_NAME: '',
    SELECT_CLASS: '',

    // ✅ LABEL
    LABEL_COLOR: COLORS.INFO,
    LABEL_FONT_SIZE: '8.5px',
    GAP: '8px',
};

// ============================================================================
// PAGE SIZE OPTIONS (доступные размеры)
// ============================================================================

export const PAGE_SIZE_OPTIONS = {
    BASE_AVAILABLE: [5, 10, 15, 30, 50, 100, 200, 500, 1000],
    MIN: 5,
    MAX: 1000,
    DEFAULT_PAGE_SIZE: 15,
};

// ============================================================================
// LABELS (тексты меток)
// ============================================================================

export const PAGINATION_LABELS = {
    PAGE_SIZE_SUFFIX: 'на странице',
    ALL_ITEMS: 'Все',
};

// ============================================================================
// PROPS CONFIG (для PageSizeSelector.vue)
// ============================================================================

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

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// ✅ Сгенерировать доступные размеры страниц
export function generateAvailablePageSizes(totalItems) {
    const baseSizes = PAGE_SIZE_OPTIONS.BASE_AVAILABLE;
    if (totalItems <= 0) return baseSizes;

    const filtered = baseSizes.filter(size => size <= totalItems);

    if (!filtered.includes(totalItems) && totalItems <= PAGE_SIZE_OPTIONS.MAX) {
        filtered.push(totalItems);
    }

    return filtered.sort((a, b) => a - b);
}

// ✅ Получить минимальный размер страницы
export function getMinPageSize() {
    return PAGE_SIZE_OPTIONS.MIN;
}

// ✅ Получить максимальный размер страницы
export function getMaxPageSize() {
    return PAGE_SIZE_OPTIONS.MAX;
}

// ✅ Получить базовые размеры
export function getBasePageSizes() {
    return PAGE_SIZE_OPTIONS.BASE_AVAILABLE;
}
