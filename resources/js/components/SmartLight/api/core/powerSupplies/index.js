/**
 * ============================================================================
 * POWER SUPPLIES API INDEX — ГЛАВНЫЙ ЭКСПОРТ
 * ============================================================================
 * 📁 Путь: api/core/powerSupplies/index.js
 * ============================================================================
 */

export { corePowerSupplyApi } from './corePowerSupplyApi.js';
export { CorePowerSupplyResource } from '../resource/corePowerSupplyResource.js';

export default {
    corePowerSupplyApi: () => import('./corePowerSupplyApi.js'),
    corePowerSupplyResource: () => import('../resource/corePowerSupplyResource.js')
};
