/**
 * ============================================================================
 * RENDERERS — ЭКСПОРТ ОБЁРТОК
 * ============================================================================
 */

export { default as BatteryRenderer } from './BatteryRenderer.vue';
export { default as BulbRenderer } from './BulbRenderer.vue';
export { default as PowerSupplyRenderer } from './PowerSupplyRenderer.vue';

export default {
    BatteryRenderer: () => import('./BatteryRenderer.vue'),
    BulbRenderer: () => import('./BulbRenderer.vue'),
    PowerSupplyRenderer: () => import('./PowerSupplyRenderer.vue')
};
