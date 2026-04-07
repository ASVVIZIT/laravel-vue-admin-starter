/**
 * ============================================================================
 * THREE.JS BULBS — ЭКСПОРТ 3D МОДЕЛЕЙ ЛАМП
 * ============================================================================
 * 📁 Путь: visualization/threeJs/bulbs/index.js
 * ✅ Назначение: Централизованный экспорт всех 3D-компонентов ламп
 * ✅ Используется: BulbRenderer.vue (через dynamic import)
 * ============================================================================
 */

export { default as BulbBaseThree } from './BulbBaseThree.vue';
export { default as BulbClassicThree } from './BulbClassicThree.vue';
export { default as BulbCflThree } from './BulbCflThree.vue';
export { default as BulbHalogenThree } from './BulbHalogenThree.vue';
export { default as BulbLedThree } from './BulbLedThree.vue';
export { default as BulbLedStripThree } from './BulbLedStripThree.vue';
export { default as BulbSmartRgbThree } from './BulbSmartRgbThree.vue';
export { default as BulbTubeThree } from './BulbTubeThree.vue';

export default {
    BulbBaseThree: () => import('./BulbBaseThree.vue'),
    BulbClassicThree: () => import('./BulbClassicThree.vue'),
    BulbCflThree: () => import('./BulbCflThree.vue'),
    BulbHalogenThree: () => import('./BulbHalogenThree.vue'),
    BulbLedThree: () => import('./BulbLedThree.vue'),
    BulbLedStripThree: () => import('./BulbLedStripThree.vue'),
    BulbSmartRgbThree: () => import('./BulbSmartRgbThree.vue'),
    BulbTubeThree: () => import('./BulbTubeThree.vue')
};
