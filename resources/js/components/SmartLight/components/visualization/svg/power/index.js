/**
 * ============================================================================
 * SVG POWER — ЭКСПОРТ 2D ИСТОЧНИКОВ ПИТАНИЯ
 * ============================================================================
 */

// === БАЗОВЫЕ КОМПОНЕНТЫ ===
export { default as PowerBaseSvg } from './PowerBaseSvg.vue';

// === РЕАЛИЗОВАНО ===
export { default as PowerAc220vSvg } from './PowerAc220vSvg.vue';
export { default as PowerDc12vSvg } from './PowerDc12vSvg.vue';
export { default as PowerDc24vSvg } from './PowerDc24vSvg.vue';
export { default as PowerSolarSvg } from './PowerSolarSvg.vue';

// === ЗАПЛАНИРОВАНО (закомментировано) ===
// export { default as PowerUsb5vSvg } from './PowerUsb5vSvg.vue';
// export { default as PowerBatteryPackSvg } from './PowerBatteryPackSvg.vue';
// export { default as PowerGeneratorSvg } from './PowerGeneratorSvg.vue';
// export { default as PowerUpsSvg } from './PowerUpsSvg.vue';

export default {
    PowerBaseSvg: () => import('./PowerBaseSvg.vue'),
    PowerAc220vSvg: () => import('./PowerAc220vSvg.vue'),
    PowerDc12vSvg: () => import('./PowerDc12vSvg.vue'),
    PowerDc24vSvg: () => import('./PowerDc24vSvg.vue'),
    PowerSolarSvg: () => import('./PowerSolarSvg.vue'),
    // PowerUsb5vSvg: () => import('./PowerUsb5vSvg.vue'),
    // PowerBatteryPackSvg: () => import('./PowerBatteryPackSvg.vue'),
    // PowerGeneratorSvg: () => import('./PowerGeneratorSvg.vue'),
    // PowerUpsSvg: () => import('./PowerUpsSvg.vue')
};
