// ============================================================================
// APP CONFIG LOADING DATA ACTIONS — LOADING DATA ACTIONS COMPONENT
// ============================================================================
// 📁 Путь: config/appConfigLoadingDataActions.js
// ✅ Используется: LoadingDataActions.vue, CompanyList.vue
// ✅ Безопасно менять — влияет только на панель загрузки
// ✅ Зависит от: appConfigGlobal.js (COLORS, ANIMATIONS, TIMINGS)
// ✅ Зависит от: appConfigChunkProgress.js (CHUNK_PROGRESS_CONFIG)
// ============================================================================

import { COLORS, ANIMATIONS, TIMINGS } from './appConfigGlobal.js';

// ============================================================================
// UI CONFIGS
// ============================================================================

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

// ============================================================================
// COLORS
// ============================================================================

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
// MESSAGES
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
// PROPS CONFIG
// ============================================================================

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
