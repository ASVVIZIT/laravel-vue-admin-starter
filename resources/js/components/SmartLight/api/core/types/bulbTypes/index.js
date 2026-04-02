/**
 * ============================================================================
 * BULB TYPES API INDEX — ГЛАВНЫЙ ЭКСПОРТ BULB API
 * ============================================================================
 * 📁 Путь: api/core/types/bulbTypes/index.js
 * ✅ Используется: TypesApi, Services
 * ============================================================================
 */

export { coreBulbTypeApi } from './coreBulbTypeApi.js';
export { CoreBulbTypeResource } from '../../resource/coreBulbTypeResource.js';

export default {
    coreBulbTypeApi: () => import('./coreBulbTypeApi.js'),
    coreBulbTypeResource: () => import('../../resource/coreBulbTypeResource.js')
};
