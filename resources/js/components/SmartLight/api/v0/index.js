/**
 * ============================================================================
 * API V0 INDEX — ГЛАВНЫЙ ЭКСПОРТ ВЕРСИИ 0
 * ============================================================================
 * 📁 Путь: api/v0/index.js
 * ✅ Используется: Текущая версия приложения
 * ============================================================================
 */

// V0 Resources
export { V0DeviceResource } from './V0DeviceResource.js';
export { V0CommandResource } from './V0CommandResource.js';
export { V0SettingsResource } from './V0SettingsResource.js';
export { V0TelemetryResource } from './V0TelemetryResource.js';

// Sub-modules
export * from './batteryTypes/index.js';
export * from './bulbTypes/index.js';
export * from './powerSupplies/index.js';
export * from './smartLight/index.js';

export default {
    V0DeviceResource: () => import('./V0DeviceResource.js'),
    V0CommandResource: () => import('./V0CommandResource.js'),
    V0SettingsResource: () => import('./V0SettingsResource.js'),
    V0TelemetryResource: () => import('./V0TelemetryResource.js'),
    batteryTypes: () => import('./batteryTypes/index.js'),
    bulbTypes: () => import('./bulbTypes/index.js'),
    powerSupplies: () => import('./powerSupplies/index.js'),
    smartLight: () => import('./smartLight/index.js')
};
