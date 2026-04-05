/**
 * ============================================================================
 * DEVICES COMPONENTS — ЭКСПОРТ УСТРОЙСТВ
 * ============================================================================
 */

export { default as DeviceCard } from './DeviceCard.vue';
export { default as DeviceGrid } from './DeviceGrid.vue';
export { default as DeviceList } from './DeviceList.vue';
export { default as DeviceStatus } from './DeviceStatus.vue';

export default {
    DeviceCard: () => import('./DeviceCard.vue'),
    DeviceGrid: () => import('./DeviceGrid.vue'),
    DeviceList: () => import('./DeviceList.vue'),
    DeviceStatus: () => import('./DeviceStatus.vue')
};
