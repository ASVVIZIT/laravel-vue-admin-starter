/**
 * ============================================================================
 * COMPONENTS INDEX — ГЛАВНЫЙ ЭКСПОРТ КОМПОНЕНТОВ
 * ============================================================================
 * 📁 Путь: components/index.js
 * ✅ Используется: Все Views SmartLight
 * ============================================================================
 */

export { default as BatteryGroupConfig } from './BatteryGroupConfig.vue';
export { default as BatteryRenderer } from './visualization/renderers/BatteryRenderer.vue';
export { default as BatterySlider } from './controls/BatterySlider.vue';
export { default as Bulb } from './Bulb.vue';
export { default as Bulb3D } from './visualization/ThreeJs/bulbs/Bulb3D.vue';
export { default as BulbRenderer } from './visualization/renderers/BulbRenderer.vue';
export { default as DeviceCard } from './devices/DeviceCard.vue';
export { default as DeviceGrid } from './devices/DeviceGrid.vue';
export { default as IconWrapper } from './layout/IconWrapper.vue';
export { default as PowerMonitoring } from './monitoring/PowerMonitoring.vue';
export { default as PowerSupplyRenderer } from './visualization/renderers/PowerSupplyRenderer.vue';
export { default as ThreeScene } from './visualization/ThreeJs/ThreeScene.vue';
export { default as VoltageIndicator } from './monitoring/VoltageIndicator.vue';

export default {
    BatteryGroupConfig: () => import('./BatteryGroupConfig.vue'),
    BatteryRenderer: () => import('./visualization/renderers/BatteryRenderer.vue'),
    BatterySlider: () => import('./controls/BatterySlider.vue'),
    Bulb: () => import('./Bulb.vue'),
    Bulb3D: () => import('./visualization/ThreeJs/bulbs/Bulb3D.vue'),
    BulbRenderer: () => import('./visualization/renderers/BulbRenderer.vue'),
    DeviceCard: () => import('./devices/DeviceCard.vue'),
    DeviceGrid: () => import('./devices/DeviceGrid.vue'),
    IconWrapper: () => import('./layout/IconWrapper.vue'),
    PowerMonitoring: () => import('./monitoring/PowerMonitoring.vue'),
    PowerSupplyRenderer: () => import('./visualization/renderers/PowerSupplyRenderer.vue'),
    ThreeScene: () => import('./visualization/ThreeJs/ThreeScene.vue'),
    VoltageIndicator: () => import('./monitoring/VoltageIndicator.vue')
};
