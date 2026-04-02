/**
 * ============================================================================
 * V1 RESOURCE INDEX — ЭКСПОРТЫ РЕСУРСОВ V1
 * ============================================================================
 * 📁 Путь: api/v1/resource/index.js
 * ============================================================================
 */

export { V1DeviceResource } from './V1DeviceResource.js';
export { V1CommandResource } from './V1CommandResource.js';
export { V1SettingsResource } from './V1SettingsResource.js';
export { V1TelemetryResource } from './V1TelemetryResource.js';
export { V1TypesResource } from './V1TypesResource.js';
export { V1BatteryTypeResource } from './V1BatteryTypeResource.js';
export { V1BulbTypeResource } from './V1BulbTypeResource.js';
export { V1PowerSupplyResource } from './V1PowerSupplyResource.js';
export { V1SmartLightResource } from './V1SmartLightResource.js';

export default {
    V1DeviceResource: () => import('./V1DeviceResource.js'),
    V1CommandResource: () => import('./V1CommandResource.js'),
    V1SettingsResource: () => import('./V1SettingsResource.js'),
    V1TelemetryResource: () => import('./V1TelemetryResource.js'),
    V1TypesResource: () => import('./V1TypesResource.js'),
    V1BatteryTypeResource: () => import('./V1BatteryTypeResource.js'),
    V1BulbTypeResource: () => import('./V1BulbTypeResource.js'),
    V1PowerSupplyResource: () => import('./V1PowerSupplyResource.js'),
    V1SmartLightResource: () => import('./V1SmartLightResource.js')
};
