/**
 * ============================================================================
 * BATTERY TYPES API INDEX — ГЛАВНЫЙ ЭКСПОРТ BATTERY API
 * ============================================================================
 * 📁 Путь: api/core/types/batteryTypes/index.js
 * ✅ Используется: TypesApi, Services
 * ============================================================================
 */

export { coreBatteryTypeApi } from './coreBatteryTypeApi.js';
export { CoreBatteryTypeResource } from '../../resource/coreBatteryTypeResource.js';

export default {
    coreBatteryTypeApi: () => import('./coreBatteryTypeApi.js'),
    coreBatteryTypeResource: () => import('../../resource/coreBatteryTypeResource.js')
};
