/**
 * ============================================================================
 * THREEJS BULBS — ЭКСПОРТ 3D ЛАМП
 * ============================================================================
 */

// === БАЗОВЫЕ КОМПОНЕНТЫ ===
export { default as BulbBaseThree } from './BulbBaseThree.vue';

// === РЕАЛИЗОВАНО ===
export { default as BulbClassicThree } from './BulbClassicThree.vue';
export { default as BulbLedThree } from './BulbLedThree.vue';
export { default as BulbSmartRgbThree } from './BulbSmartRgbThree.vue';

// === ЗАПЛАНИРОВАНО (закомментировано) ===
// export { default as BulbHalogenThree } from './BulbHalogenThree.vue';
// export { default as BulbCflThree } from './BulbCflThree.vue';
// export { default as BulbLedStripThree } from './BulbLedStripThree.vue';
// export { default as BulbTubeThree } from './BulbTubeThree.vue';

export default {
    BulbBaseThree: () => import('./BulbBaseThree.vue'),
    BulbClassicThree: () => import('./BulbClassicThree.vue'),
    BulbLedThree: () => import('./BulbLedThree.vue'),
    BulbSmartRgbThree: () => import('./BulbSmartRgbThree.vue'),
    // BulbHalogenThree: () => import('./BulbHalogenThree.vue'),
    // BulbCflThree: () => import('./BulbCflThree.vue'),
    // BulbLedStripThree: () => import('./BulbLedStripThree.vue'),
    // BulbTubeThree: () => import('./BulbTubeThree.vue')
};
