// ============================================================================
// APP CONFIG CHUNK — CHUNK CONFIG & THRESHOLDS
// ============================================================================
// 📁 Путь: config/chunk/appConfigChunk.js
// ✅ Используется: CompanyList.vue, companyStore.js, SettingsModal.vue
// ✅ Безопасно менять — влияет только на загрузку чанками
// ✅ Зависит от: config/global/index.js (нет зависимостей)
// ============================================================================

// ============================================================================
// CHUNK CONFIG (основные настройки загрузки)
// ============================================================================

export const CHUNK_CONFIG = {
    // ✅ РАЗМЕР ЧАНКА (по умолчанию)
    SIZE: 500,

    // ✅ ЗАДЕРЖКА МЕЖДУ ЧАНКАМИ (ms)
    DELAY: 200,

    // ✅ МАКСИМУМ ПАРАЛЛЕЛЬНЫХ ЗАГРУЗОК
    MAX_CONCURRENT: 1,
};

// ============================================================================
// CHUNK SIZE OPTIONS (для SettingsModal.vue)
// ============================================================================

export const CHUNK_SIZE_OPTIONS = [
    { value: 100, label: '100 записей' },
    { value: 250, label: '250 записей' },
    { value: 500, label: '500 записей (по умолчанию)' },
    { value: 1000, label: '1000 записей' },
];

// ============================================================================
// CHUNK SIZE CONSTANTS (для валидации)
// ============================================================================

export const CHUNK_SIZE_DEFAULT = 500;
export const CHUNK_SIZE_MIN = 100;
export const CHUNK_SIZE_MAX = 1000;

// ============================================================================
// COMPANY LIST THRESHOLDS (пороги для UI)
// ============================================================================

export const COMPANY_LIST_THRESHOLDS = {
    // ✅ ПОКАЗЫВАТЬ КНОПКИ ЗАГРУЗКИ (если записей больше)
    SHOW_LOAD_BUTTONS_MIN: 1000,

    // ✅ ПОДТВЕРЖДЕНИЕ ЗАГРУЗКИ ВСЕХ (если записей больше)
    CONFIRM_LOAD_ALL_MIN: 5000,
};

// ============================================================================
// COMPANY LIST FILTERS (настройки фильтрации)
// ============================================================================

export const COMPANY_LIST_FILTERS = {
    // ✅ ЗАДЕРЖКА ПОИСКА (ms)
    SEARCH_DEBOUNCE: 700,

    // ✅ ЗАДЕРЖКА ПРИМЕНЕНИЯ ФИЛЬТРОВ (ms)
    FILTER_TRANSITION_DELAY: 100,

    // ✅ ЗАДЕРЖКА ПРИМЕНЕНИЯ PAGE SIZE (ms)
    PAGE_SIZE_TRANSITION_DELAY: 150,
};

// ============================================================================
// PROPS CONFIG (для LoadingDataActions.vue)
// ============================================================================

export const CHUNK_PROPS_CONFIG = {
    loaded: { type: Number, required: true },
    total: { type: Number, required: true },
    percentage: { type: Number, required: true },
    chunkSize: { type: Number, default: 500 },
    chunkProgress: { type: Number, default: 0 },
    isLoading: { type: Boolean, default: false },
    isPaused: { type: Boolean, default: false },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// ✅ Получить размер чанка по умолчанию
export function getDefaultChunkSize() {
    return CHUNK_SIZE_DEFAULT;
}

// ✅ Проверить валидность размера чанка
export function isValidChunkSize(size) {
    return size >= CHUNK_SIZE_MIN && size <= CHUNK_SIZE_MAX;
}

// ✅ Получить опции размера чанка
export function getChunkSizeOptions() {
    return CHUNK_SIZE_OPTIONS;
}

// ✅ Получить порог для кнопок загрузки
export function getShowLoadButtonsThreshold() {
    return COMPANY_LIST_THRESHOLDS.SHOW_LOAD_BUTTONS_MIN;
}

// ✅ Получить порог для подтверждения загрузки всех
export function getConfirmLoadAllThreshold() {
    return COMPANY_LIST_THRESHOLDS.CONFIRM_LOAD_ALL_MIN;
}
