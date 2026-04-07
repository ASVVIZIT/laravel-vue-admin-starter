/**
 * ============================================================================
 * SVG BATTERIES — ЭКСПОРТ 2D ВИЗУАЛИЗАЦИИ АККУМУЛЯТОРОВ
 * ============================================================================
 * 📁 Путь: visualization/svg/batteries/index.js
 * ✅ Назначение: Централизованный экспорт всех SVG-компонентов батарей
 * ✅ Используется: BatteryRenderer.vue (через dynamic import)
 * ============================================================================
 */

export { default as BatteryBaseSvg } from './BatteryBaseSvg.vue';
export { default as Battery18650Svg } from './Battery18650Svg.vue';
export { default as Battery21700Svg } from './Battery21700Svg.vue';
export { default as BatteryCylindricalSvg } from './BatteryCylindricalSvg.vue';
export { default as BatteryLeadAcidSvg } from './BatteryLeadAcidSvg.vue';
export { default as BatteryLiPoSvg } from './BatteryLiPoSvg.vue';
export { default as BatteryPrismaticSvg } from './BatteryPrismaticSvg.vue';

export default {
    BatteryBaseSvg: () => import('./BatteryBaseSvg.vue'),
    Battery18650Svg: () => import('./Battery18650Svg.vue'),
    Battery21700Svg: () => import('./Battery21700Svg.vue'),
    BatteryCylindricalSvg: () => import('./BatteryCylindricalSvg.vue'),
    BatteryLeadAcidSvg: () => import('./BatteryLeadAcidSvg.vue'),
    BatteryLiPoSvg: () => import('./BatteryLiPoSvg.vue'),
    BatteryPrismaticSvg: () => import('./BatteryPrismaticSvg.vue')
};
