/**
 * ============================================================================
 * THREE.JS POWER — ЭКСПОРТ 3D МОДЕЛЕЙ ИСТОЧНИКОВ ПИТАНИЯ
 * ============================================================================
 * 📁 Путь: visualization/threeJs/power/index.js
 * ✅ Назначение: Централизованный экспорт всех 3D-компонентов питания
 * ✅ Используется: PowerSupplyRenderer.vue (через dynamic import)
 * ============================================================================
 */

export { default as PowerBaseThree } from './PowerBaseThree.vue';
export { default as PowerStandardThree } from './PowerStandardThree.vue';
export { default as PowerAc220vThree } from './PowerAc220vThree.vue';
export { default as PowerDc12vThree } from './PowerDc12vThree.vue';
export { default as PowerDc24vThree } from './PowerDc24vThree.vue';
export { default as PowerSolarThree } from './PowerSolarThree.vue';
export { default as PowerUsb5vThree } from './PowerUsb5vThree.vue';
export { default as PowerBatteryPackThree } from './PowerBatteryPackThree.vue';
export { default as PowerGeneratorThree } from './PowerGeneratorThree.vue';
export { default as PowerUpsThree } from './PowerUpsThree.vue';

// Ленивая загрузка (для рендереров)
export default {
    PowerBaseThree: () => import('./PowerBaseThree.vue'),
    PowerStandardThree: () => import('./PowerStandardThree.vue'),
    PowerAc220vThree: () => import('./PowerAc220vThree.vue'),
    PowerDc12vThree: () => import('./PowerDc12vThree.vue'),
    PowerDc24vThree: () => import('./PowerDc24vThree.vue'),
    PowerSolarThree: () => import('./PowerSolarThree.vue'),
    PowerUsb5vThree: () => import('./PowerUsb5vThree.vue'),
    PowerBatteryPackThree: () => import('./PowerBatteryPackThree.vue'),
    PowerGeneratorThree: () => import('./PowerGeneratorThree.vue'),
    PowerUpsThree: () => import('./PowerUpsThree.vue')
};
