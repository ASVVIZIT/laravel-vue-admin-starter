/**
 * ============================================================================
 * POWER SUPPLY TYPE RESOURCE — ЯДРО (ТИПЫ ИСТОЧНИКОВ ПИТАНИЯ)
 * ============================================================================
 * 📁 Путь: api/core/resource/corePowerSupplyTypeResource.js
 * ✅ Используется: V0, V1, V2 ресурсы
 * ============================================================================
 */

import { CoreBaseResource } from './coreBaseResource.js';
import { logDebug, logError } from '@components/SmartLight/api/core/utils/coreApiLogger.js';

export class CorePowerSupplyTypeResource extends CoreBaseResource {
    constructor() {
        super('power-supply-types');
    }

    async getAll() {
        logDebug('corePowerSupplyTypeResource', 'getAll');
        return this.get('');
    }

    async getById(id) {
        logDebug('corePowerSupplyTypeResource', 'getById', { id });
        return this.get(`/${id}`);
    }

    async checkPowerSupplyTypeCompatibility(supplyTypeId, deviceId) {
        logDebug('corePowerSupplyTypeResource', 'checkCompatibility', { supplyTypeId, deviceId });
        return this.post('/check-compatibility', {
            power_supply_type_id: supplyTypeId,
            device_id: deviceId
        });
    }

    async getPowerSupplyTypeParameters(supplyTypeId) {
        logDebug('corePowerSupplyTypeResource', 'getParameters', { supplyTypeId });
        return this.get(`/parameters/${supplyTypeId}`);
    }

    async getPowerSupplyTypeCompatibility(supplyTypeId, deviceId) {
        logDebug('corePowerSupplyTypeResource', 'getCompatibility', { supplyTypeId, deviceId });
        return this.get(`/compatibility/${supplyTypeId}/${deviceId}`);
    }
}

export default CorePowerSupplyTypeResource;
