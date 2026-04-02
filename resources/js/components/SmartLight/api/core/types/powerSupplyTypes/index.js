/**
 * ============================================================================
 * POWER SUPPLY TYPES API INDEX — ГЛАВНЫЙ ЭКСПОРТ
 * ============================================================================
 * 📁 Путь: api/core/types/powerSupplyTypes/index.js
 * ============================================================================
 */

export { corePowerSupplyTypeApi } from './corePowerSupplyTypeApi.js';
export { CorePowerSupplyTypeResource } from '../../resource/corePowerSupplyTypeResource.js';

export default {
    corePowerSupplyTypeApi: () => import('./corePowerSupplyTypeApi.js'),
    corePowerSupplyTypeResource: () => import('../../resource/corePowerSupplyTypeResource.js')
};
