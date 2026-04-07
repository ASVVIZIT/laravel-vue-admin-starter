/**
 * ============================================================================
 * SVG ICONS — ЭКСПОРТ ИКОНОК БАТАРЕЙ
 * ============================================================================
 * 📁 Путь: visualization/svg/icons/index.js
 * ✅ Исправлено: пути экспорта, ленивая загрузка, структура
 * ============================================================================
 */

export { default as BatteryFullIcon } from './BatteryFullIcon.vue';
export { default as BatteryLowIcon } from './BatteryLowIcon.vue';
export { default as BatteryCriticalIcon } from './BatteryCriticalIcon.vue';
export { default as BatteryChargingIcon } from './BatteryChargingIcon.vue';
export { default as CompositeIcon } from './CompositeIcon.vue';

export default {
    BatteryFullIcon: () => import('./BatteryFullIcon.vue'),
    BatteryLowIcon: () => import('./BatteryLowIcon.vue'),
    BatteryCriticalIcon: () => import('./BatteryCriticalIcon.vue'),
    BatteryChargingIcon: () => import('./BatteryChargingIcon.vue'),
    CompositeIcon: () => import('./CompositeIcon.vue')
};
