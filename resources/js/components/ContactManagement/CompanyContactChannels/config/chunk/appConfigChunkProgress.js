// ============================================================================
// APP CONFIG CHUNK PROGRESS — CHUNK PROGRESS BAR
// ============================================================================
// 📁 Путь: config/chunk/appConfigChunkProgress.js
// ✅ Используется: ChunkProgress.vue, LoadingDataActions.vue
// ✅ Безопасно менять — влияет только на прогресс бар загрузки
// ✅ Зависит от: config/global/index.js (COLORS, ANIMATIONS, TIMINGS)
// ============================================================================

import { COLORS, ANIMATIONS, TIMINGS } from '../global/index.js';

// ============================================================================
// CHUNK PROGRESS CONFIG
// ============================================================================

export const CHUNK_PROGRESS_CONFIG = {
    // ✅ РАЗМЕРЫ
    HEIGHT: '20px',
    BORDER_RADIUS: '10px',

    // ✅ ЦВЕТА
    LOADING_COLOR: COLORS.PRIMARY,
    LOADING_COLOR_LIGHT: '#66b1ff',
    CHUNK_COLOR: COLORS.WARNING,
    CHUNK_COLOR_LIGHT: '#FFB140',
    BACKGROUND_COLOR: '#e0e0e0',

    // ✅ ТЕКСТ
    FONT_SIZE: '9px',
    FONT_SIZE_PERCENTAGE: '8px',
    FONT_WEIGHT: '700',
    TEXT_COLOR: '#FFFFFF',
    TEXT_SHADOW: '0 2px 4px rgba(0, 0, 0, 0.5)',

    // ✅ АНИМАЦИЯ
    TRANSITION_DURATION: '0.8s',
    TRANSITION_TIMING: 'cubic-bezier(0.34, 1.56, 0.64, 1)',

    // ✅ ТЕНИ
    BOX_SHADOW: 'inset 0 2px 4px rgba(0, 0, 0, 0.15)',

    // ✅ ПОЛОСКИ (STRIPES)
    STRIPE_WIDTH: '10px',
    STRIPE_ANGLE: '45deg',
    STRIPE_ANIMATION_DURATION: '4s',
    STRIPE_OPACITY: '0.25',

    // ✅ CHUNK OVERSHOOT (выступ оранжевой полосы)
    CHUNK_OVERSHOOT_PERCENT: '12%',
    CHUNK_MIN_WIDTH: '5%',
    CHUNK_GROWTH_DURATION: '0.8s',

    // ✅ CHUNK СВЕЧЕНИЕ
    CHUNK_SHADOW: '0 0 10px rgba(255, 149, 0, 0.8), inset 0 0 5px rgba(255, 255, 255, 0.3)',
    CHUNK_BORDER: '2px solid rgba(255, 255, 255, 0.6)',
    CHUNK_BORDER_RADIUS: '8px',

    // ✅ Z-INDEX (оранжевая под синей!)
    CHUNK_Z_INDEX: 10,
    LOADED_Z_INDEX: 20,

    // ✅ ГРАДИЕНТЫ
    CHUNK_GRADIENT_ANGLE: '90deg',

    // ✅ SHINE ANIMATION (блик)
    SHINE_WIDTH: '300px',
    SHINE_DURATION: '4s',
    SHINE_COLOR: 'rgba(255, 255, 255, 0.5)',
    SHINE_LEFT_START: '-150%',
    SHINE_LEFT_END: '150%',
    SHINE_ANIMATION_DELAY: '0s',

    // ✅ STRIPES ANIMATION
    STRIPES_WIDTH: '400%',
    STRIPES_LEFT_OFFSET: '-150%',
    STRIPES_ANIMATION_DISTANCE: '60px',
};

// ============================================================================
// PROPS CONFIG
// ============================================================================

export const CHUNK_PROGRESS_PROPS_CONFIG = {
    loaded: { type: Number, required: true },
    total: { type: Number, required: true },
    percentage: { type: Number, required: true },
    chunkProgress: { type: Number, default: 0 },
    isLoading: { type: Boolean, default: false },
};
