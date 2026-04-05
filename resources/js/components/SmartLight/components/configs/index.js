/**
 * ============================================================================
 * CONFIGS COMPONENTS — ЭКСПОРТ КОНФИГУРАЦИЙ
 * ============================================================================
 */

export { default as BatteryGroupConfig } from './BatteryGroupConfig.vue';
export { default as DeviceConfig } from './DeviceConfig.vue';
export { default as PowerConfig } from './PowerConfig.vue';

export default {
    BatteryGroupConfig: () => import('./BatteryGroupConfig.vue'),
    DeviceConfig: () => import('./DeviceConfig.vue'),
    PowerConfig: () => import('./PowerConfig.vue')
};
