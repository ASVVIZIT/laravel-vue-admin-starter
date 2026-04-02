/**
 * ============================================================================
 * CORE RESOURCE INDEX — ЭКСПОРТЫ ВСЕХ РЕСУРСОВ
 * ============================================================================
 * 📁 Путь: api/core/resource/index.js
 * ✅ Используется: Все версии API
 * ============================================================================
 */

export { CoreBaseResource } from './coreBaseResource.js';
export { CoreDeviceResource } from './coreDeviceResource.js';
export { CoreCommandResource } from './coreCommandResource.js';
export { CoreSettingsResource } from './coreSettingsResource.js';
export { CoreTelemetryResource } from './coreTelemetryResource.js';
export { CoreTypesResource } from './coreTypesResource.js';
export { CoreBatteryTypeResource } from './coreBatteryTypeResource.js';
export { CoreBulbTypeResource } from './coreBulbTypeResource.js';
export { CorePowerSupplyResource } from './corePowerSupplyTypeResource.js';
export { CoreSmartLightResource } from './coreSmartLightResource.js';

export default {
    CoreBaseResource: () => import('./coreBaseResource.js'),
    CoreDeviceResource: () => import('./coreDeviceResource.js'),
    CoreCommandResource: () => import('./coreCommandResource.js'),
    CoreSettingsResource: () => import('./coreSettingsResource.js'),
    CoreTelemetryResource: () => import('./coreTelemetryResource.js'),
    CoreTypesResource: () => import('./coreTypesResource.js'),
    CoreBatteryTypeResource: () => import('./coreBatteryTypeResource.js'),
    CoreBulbTypeResource: () => import('./coreBulbTypeResource.js'),
    CorePowerSupplyTypeResource: () => import('./corePowerSupplyTypeResource.js'),
    CoreSmartLightResource: () => import('./coreSmartLightResource.js')
};
