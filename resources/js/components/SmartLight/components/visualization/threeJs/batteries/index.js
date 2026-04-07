/**
 * ============================================================================
 * THREE.JS BATTERIES — ЭКСПОРТ 3D МОДЕЛЕЙ АККУМУЛЯТОРОВ
 * ============================================================================
 * 📁 Путь: visualization/threeJs/batteries/index.js
 * ✅ Назначение: Централизованный экспорт всех 3D-компонентов батарей
 * ✅ Используется: BatteryRenderer.vue (через dynamic import)
 * ============================================================================
 */

export { default as BatteryBaseThree } from './BatteryBaseThree.vue';
export { default as Battery18650Three } from './Battery18650Three.vue';
export { default as Battery21700Three } from './Battery21700Three.vue';
export { default as BatteryAAThree } from './BatteryAAThree.vue';
export { default as BatteryAAAThree } from './BatteryAAAThree.vue';
export { default as BatteryCylindricalThree } from './BatteryCylindricalThree.vue';
export { default as BatteryLeadAcidThree } from './BatteryLeadAcidThree.vue';
export { default as BatteryLiPoThree } from './BatteryLiPoThree.vue';
export { default as BatteryPrismaticThree } from './BatteryPrismaticThree.vue';

export default {
    BatteryBaseThree: () => import('./BatteryBaseThree.vue'),
    Battery18650Three: () => import('./Battery18650Three.vue'),
    Battery21700Three: () => import('./Battery21700Three.vue'),
    BatteryAAThree: () => import('./BatteryAAThree.vue'),
    BatteryAAAThree: () => import('./BatteryAAAThree.vue'),
    BatteryCylindricalThree: () => import('./BatteryCylindricalThree.vue'),
    BatteryLeadAcidThree: () => import('./BatteryLeadAcidThree.vue'),
    BatteryLiPoThree: () => import('./BatteryLiPoThree.vue'),
    BatteryPrismaticThree: () => import('./BatteryPrismaticThree.vue')
};
