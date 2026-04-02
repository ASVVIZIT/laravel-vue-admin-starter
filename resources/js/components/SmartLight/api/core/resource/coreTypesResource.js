/**
 * ============================================================================
 * TYPES RESOURCE — ЯДРО (БАЗОВАЯ ЛОГИКА ТИПОВ)
 * ============================================================================
 * 📁 Путь: api/core/resource/coreTypesResource.js
 * ✅ Используется: V0, V1, V2 ресурсы
 * ============================================================================
 */

import { CoreBaseResource } from './coreBaseResource.js';
import { logDebug, logError } from '@/components/SmartLight/api/core/utils/coreApiLogger.js';

export class CoreTypesResource extends CoreBaseResource {
    constructor() {
        super('/smart-light', null);
    }

    async getBatteryTypes() {
        logDebug('coreTypesResource', 'getBatteryTypes');
        return this.get('/battery-types');
    }

    async getBatteryTypeById(id) {
        logDebug('coreTypesResource', 'getBatteryTypeById', { id });
        return this.get(`/battery-types/${id}`);
    }

    async getBulbTypes() {
        logDebug('coreTypesResource', 'getBulbTypes');
        return this.get('/bulb-types');
    }

    async getBulbTypeById(id) {
        logDebug('coreTypesResource', 'getBulbTypeById', { id });
        return this.get(`/bulb-types/${id}`);
    }

    async getPowerSupplies() {
        logDebug('coreTypesResource', 'getPowerSupplies');
        return this.get('/power-supplies');
    }

    async getPowerSupplyById(id) {
        logDebug('coreTypesResource', 'getPowerSupplyById', { id });
        return this.get(`/power-supplies/${id}`);
    }

    async getForDropdown(type) {
        logDebug('coreTypesResource', 'getForDropdown', { type });
        return this.get(`/${type}/dropdown`);
    }

    async checkCompatibility(type, typeId, deviceId) {
        logDebug('coreTypesResource', 'checkCompatibility', { type, typeId, deviceId });
        return this.post(`/${type}/check-compatibility`, {
            type_id: typeId,
            device_id: deviceId
        });
    }
}

export default CoreTypesResource;
