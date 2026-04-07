/**
 * ============================================================================
 * SVG BULBS — ЭКСПОРТ 2D ВИЗУАЛИЗАЦИИ ЛАМП
 * ============================================================================
 * 📁 Путь: visualization/svg/bulbs/index.js
 * ✅ Назначение: Централизованный экспорт всех SVG-компонентов ламп
 * ✅ Используется: BulbRenderer.vue (через dynamic import)
 * ============================================================================
 */

export { default as BulbBaseSvg } from './BulbBaseSvg.vue';
export { default as BulbClassicSvg } from './BulbClassicSvg.vue';
export { default as BulbHalogenSvg } from './BulbHalogenSvg.vue';
export { default as BulbLedSvg } from './BulbLedSvg.vue';
export { default as BulbSmartRgbSvg } from './BulbSmartRgbSvg.vue';
export { default as BulbCflSvg } from './BulbCflSvg.vue';
export { default as BulbLedStripSvg } from './BulbLedStripSvg.vue';
export { default as BulbTubeSvg } from './BulbTubeSvg.vue';

export default {
    BulbBaseSvg: () => import('./BulbBaseSvg.vue'),
    BulbClassicSvg: () => import('./BulbClassicSvg.vue'),
    BulbHalogenSvg: () => import('./BulbHalogenSvg.vue'),
    BulbLedSvg: () => import('./BulbLedSvg.vue'),
    BulbSmartRgbSvg: () => import('./BulbSmartRgbSvg.vue'),
    BulbCflSvg: () => import('./BulbCflSvg.vue'),
    BulbLedStripSvg: () => import('./BulbLedStripSvg.vue'),
    BulbTubeSvg: () => import('./BulbTubeSvg.vue')
};
