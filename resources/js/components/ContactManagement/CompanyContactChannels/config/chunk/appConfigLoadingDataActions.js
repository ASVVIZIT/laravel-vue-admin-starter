// ============================================================================
// APP CONFIG LOADING DATA ACTIONS — LOADING DATA ACTIONS COMPONENT
// ============================================================================
// 📁 Путь: config/chunk/appConfigLoadingDataActions.js
// ✅ Используется: LoadingDataActions.vue, CompanyList.vue
// ✅ Безопасно менять — влияет только на панель загрузки
// ✅ Зависит от: config/global/index.js (COLORS, ANIMATIONS, BREAKPOINTS)
// ✅ Зависит от: config/chunk/index.js (CHUNK_PROGRESS_CONFIG)
// ============================================================================

import { COLORS, ANIMATIONS, BREAKPOINTS } from '../global/index.js';
import { CHUNK_PROGRESS_CONFIG } from './index.js';

// ============================================================================
// UI CONFIGS (размеры и отступы)
// ============================================================================

export const LOADING_DATA_ACTIONS_UI = {
    // ✅ РАЗМЕРЫ КОНТЕЙНЕРА
    HEIGHT: '28px',
    GAP: '8px',
    PADDING: '4px 8px',
    BACKGROUND: '#f5f7fa',
    BORDER_RADIUS: '4px',
    BORDER: '1px solid #e4e7ed',

    // ✅ КНОПКИ
    BUTTON_FONT_SIZE: '10px',
    BUTTON_HEIGHT: '22px',
    BUTTON_PADDING: '3px 8px',
    BUTTON_BORDER_RADIUS: '3px',

    // ✅ ИКОНКИ
    ICON_SIZE: '12px',
    ICON_MARGIN: '2px',

    // ✅ СПЕЦИФИЧНЫЕ КНОПКИ
    MAIN_BUTTON_MIN_WIDTH: '70px',
    REFRESH_BUTTON_PADDING: '3px 6px',
};

// ============================================================================
// COLORS (градиенты кнопок)
// ============================================================================

export const LOADING_DATA_ACTIONS_COLORS = {
    // ✅ КНОПКА "+N" (LOAD MORE)
    BTN_MORE_GRADIENT_FROM: '#67c23a',
    BTN_MORE_GRADIENT_TO: '#529b33',
    BTN_MORE_GRADIENT_FROM_HOVER: '#85ce61',
    BTN_MORE_GRADIENT_TO_HOVER: '#67c23a',

    // ✅ КНОПКА "ПАУЗА/ВСЕ" (MAIN)
    BTN_MAIN_GRADIENT_FROM: '#e6a23c',
    BTN_MAIN_GRADIENT_TO: '#c98b2f',
    BTN_MAIN_GRADIENT_FROM_HOVER: '#ebb563',
    BTN_MAIN_GRADIENT_TO_HOVER: '#e6a23c',

    // ✅ КНОПКА "ОБНОВИТЬ" (REFRESH)
    BTN_REFRESH_GRADIENT_FROM: '#909399',
    BTN_REFRESH_GRADIENT_TO: '#73767a',
    BTN_REFRESH_GRADIENT_FROM_HOVER: '#a6a9ad',
    BTN_REFRESH_GRADIENT_TO_HOVER: '#909399',

    // ✅ ОБЩИЕ
    TEXT_COLOR: '#FFF',
    DISABLED_OPACITY: '0.6',
};

// ============================================================================
// MESSAGES (тексты интерфейса — БЕЗ ЖЁСТКОГО CHUNKSIZE!)
// ============================================================================

export const LOADING_DATA_ACTIONS_MESSAGES = {
    // ✅ TOOLTIPS (БЕЗ ЖЁСТКОГО CHUNKSIZE)
    TOOLTIP_LOAD_MORE: 'Загрузить ещё записей',
    TOOLTIP_LOAD_ALL: 'Загрузить все записи',
    TOOLTIP_PAUSE: 'Приостановить загрузку',
    TOOLTIP_RESUME: 'Возобновить загрузку',
    TOOLTIP_REFRESH: 'Проверить новые записи',
    TOOLTIP_REFRESH_RECORD: 'Обновить запись',
    TOOLTIP_REFRESH_RECORD_LOADING: 'Обновление...',
    TOOLTIP_SETTINGS: 'Настройки',

    // ✅ КНОПКИ (БЕЗ ЖЁСТКОГО CHUNKSIZE)
    BTN_LOAD_MORE: '+',
    BTN_LOAD_ALL: 'Все',
    BTN_PAUSE: 'Пауза',
    BTN_RESUME: 'Продолжить',

    // ✅ СТАТУСЫ
    STATUS_LOADING: 'Загрузка...',
    STATUS_PAUSED: 'Пауза',
    STATUS_COMPLETE: 'Готово',
    STATUS_WAITING: 'Ожидание',
};

// ============================================================================
// PROPS CONFIG (для LoadingDataActions.vue)
// ============================================================================

export const LOADING_DATA_ACTIONS_PROPS_CONFIG = {
    // ✅ ПРОГРЕСС
    loaded: { type: Number, required: true },
    total: { type: Number, required: true },
    percentage: { type: Number, required: true },
    chunkProgress: { type: Number, default: 0 },

    // ✅ ЧАНКИ
    chunkSize: { type: Number, default: 500 },

    // ✅ СОСТОЯНИЯ
    disabled: { type: Boolean, default: false },
    isLoading: { type: Boolean, default: false },
    isPaused: { type: Boolean, default: false },

    // ✅ ВИДИМОСТЬ КНОПОК
    showLoadMore: { type: Boolean, default: true },
    showLoadAll: { type: Boolean, default: true },
    showRefresh: { type: Boolean, default: false },
};

// ============================================================================
// HELPER FUNCTIONS (ГЕНЕРАЦИЯ С ДИНАМИЧЕСКИМ CHUNKSIZE)
// ============================================================================

// ✅ Получить текст кнопки "+N"
export function getLoadMoreButtonText(chunkSize) {
    return `+${chunkSize}`;
}

// ✅ Получить tooltip для кнопки загрузки
export function getLoadMoreTooltip(chunkSize) {
    return `Загрузить ещё ${chunkSize} записей`;
}

// ✅ Получить статус загрузки
export function getLoadingStatus(isLoading, isPaused, isComplete) {
    if (isComplete) return LOADING_DATA_ACTIONS_MESSAGES.STATUS_COMPLETE;
    if (isPaused) return LOADING_DATA_ACTIONS_MESSAGES.STATUS_PAUSED;
    if (isLoading) return LOADING_DATA_ACTIONS_MESSAGES.STATUS_LOADING;
    return LOADING_DATA_ACTIONS_MESSAGES.STATUS_WAITING;
}

// ✅ Проверить видимость кнопки загрузки
export function shouldShowLoadMoreButton(allRecordsLoaded, totalItems, loadedCount, threshold) {
    return (
        !allRecordsLoaded &&
        totalItems > threshold &&
        loadedCount < totalItems
    );
}

// ✅ Проверить видимость кнопки загрузки всех
export function shouldShowLoadAllButton(allRecordsLoaded, totalItems, loadedCount, threshold) {
    return (
        !allRecordsLoaded &&
        totalItems > threshold &&
        loadedCount < totalItems &&
        totalItems > 0
    );
}
