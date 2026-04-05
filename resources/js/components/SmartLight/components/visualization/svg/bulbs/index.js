/**
 * ============================================================================
 * SVG BULBS — ЭКСПОРТ 2D ЛАМП (4 ТИПА)
 * ============================================================================
 */

export { default as BulbBaseSvg } from './BulbBaseSvg.vue';
export { default as BulbClassicSvg } from './BulbClassicSvg.vue';
export { default as BulbHalogenSvg } from './BulbHalogenSvg.vue';
export { default as BulbLedSvg } from './BulbLedSvg.vue';
export { default as BulbSmartRgbSvg } from './BulbSmartRgbSvg.vue';

export default {
    BulbBaseSvg: () => import('./BulbBaseSvg.vue'),
    BulbClassicSvg: () => import('./BulbClassicSvg.vue'),
    BulbHalogenSvg: () => import('./BulbHalogenSvg.vue'),
    BulbLedSvg: () => import('./BulbLedSvg.vue'),
    BulbSmartRgbSvg: () => import('./BulbSmartRgbSvg.vue')
};
