/**
 * ============================================================================
 * SMARTLIGHT API INDEX — ГЛАВНЫЙ ЭКСПОРТ SMARTLIGHT API
 * ============================================================================
 * 📁 Путь: api/core/smartLight/index.js
 * ✅ Используется: Services, Controllers
 * ✅ Рефакторинг: добавлен экспорт corePowerSupplyApi из текущей папки
 * ============================================================================
 */

export * from '@components/SmartLight/api/core/smartLight/coreSettingsApi.js';
export * from '@components/SmartLight/api/core/smartLight/coreDevicesApi.js';
export * from '@components/SmartLight/api/core/smartLight/coreCommandsApi.js';
export * from '@components/SmartLight/api/core/smartLight/coreTypesApi.js';
export * from '@components/SmartLight/api/core/smartLight/corePowerSupplyApi.js';

export { CoreSmartLightApi } from '@components/SmartLight/api/core/smartLight/coreSmartLightApi.js';

export default {
    coreSettingsApi: () => import('@components/SmartLight/api/core/smartLight/coreSettingsApi.js'),
    coreDevicesApi: () => import('@components/SmartLight/api/core/smartLight/coreDevicesApi.js'),
    coreCommandsApi: () => import('@components/SmartLight/api/core/smartLight/coreCommandsApi.js'),
    coreTypesApi: () => import('@components/SmartLight/api/core/smartLight/coreTypesApi.js'),
    corePowerSupplyApi: () => import('@components/SmartLight/api/core/smartLight/corePowerSupplyApi.js'),
    coreSmartLightApi: () => import('@components/SmartLight/api/core/smartLight/coreSmartLightApi.js')
};
