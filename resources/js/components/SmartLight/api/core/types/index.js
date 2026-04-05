/**
 * ============================================================================
 * CORE TYPES INDEX — ГЛАВНЫЙ ЭКСПОРТ ТИПОВ (СПРАВОЧНИКИ)
 * ============================================================================
 * 📁 Путь: api/core/types/index.js
 * ✅ Используется: typesStore.js, GlobalSettingsForm.vue, DeviceSettingsForm.vue
 * ✅ Рефакторинг: прямые экспорты классов с суффиксами *TypeApi
 * ============================================================================
 */

export { CoreBatteryTypeApi, coreBatteryTypeApi } from './coreBatteryTypeApi.js';
export { CoreBulbTypeApi, coreBulbTypeApi } from './coreBulbTypeApi.js';
export { CorePowerSupplyTypeApi, corePowerSupplyTypeApi } from './corePowerSupplyTypeApi.js';

export default {
    coreBatteryTypeApi: () => import('./coreBatteryTypeApi.js'),
    coreBulbTypeApi: () => import('./coreBulbTypeApi.js'),
    corePowerSupplyTypeApi: () => import('./corePowerSupplyTypeApi.js')
};
