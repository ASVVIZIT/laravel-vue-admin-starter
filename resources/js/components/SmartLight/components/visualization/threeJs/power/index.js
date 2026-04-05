/**
 * ============================================================================
 * THREEJS POWER — ЭКСПОРТ 3D ИСТОЧНИКОВ ПИТАНИЯ
 * ============================================================================
 */

// === БАЗОВЫЕ КОМПОНЕНТЫ ===
export { default as PowerBaseThree } from './PowerBaseThree.vue';

// === РЕАЛИЗОВАНО ===
export { default as PowerAc220vThree } from './PowerAc220vThree.vue';
export { default as PowerDc12vThree } from './PowerDc12vThree.vue';
export { default as PowerDc24vThree } from './PowerDc24vThree.vue';
export { default as PowerSolarThree } from './PowerSolarThree.vue';

// === ЗАПЛАНИРОВАНО (закомментировано) ===
// export { default as PowerUsb5vThree } from './PowerUsb5vThree.vue';
// export { default as PowerBatteryPackThree } from './PowerBatteryPackThree.vue';
// export { default as PowerGeneratorThree } from './PowerGeneratorThree.vue';
// export { default as PowerUpsThree } from './PowerUpsThree.vue';

export default {
    PowerBaseThree: () => import('./PowerBaseThree.vue'),
    PowerAc220vThree: () => import('./PowerAc220vThree.vue'),
    PowerDc12vThree: () => import('./PowerDc12vThree.vue'),
    PowerDc24vThree: () => import('./PowerDc24vThree.vue'),
    PowerSolarThree: () => import('./PowerSolarThree.vue'),
    // PowerUsb5vThree: () => import('./PowerUsb5vThree.vue'),
    // PowerBatteryPackThree: () => import('./PowerBatteryPackThree.vue'),
    // PowerGeneratorThree: () => import('./PowerGeneratorThree.vue'),
    // PowerUpsThree: () => import('./PowerUpsThree.vue')
};
