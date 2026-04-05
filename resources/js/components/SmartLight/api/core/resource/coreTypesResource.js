/**
 * ============================================================================
 * TYPES RESOURCE — ЯДРО (БАЗОВАЯ ЛОГИКА ТИПОВ)
 * ============================================================================
 * 📁 Путь: api/core/resource/coreTypesResource.js
 * ✅ Используется: V0, V1, V2 ресурсы, прямые вызовы
 * ✅ Рефакторинг: методы с суффиксом Resource(), вызовы через Base()
 * ============================================================================
 */

import { CoreBaseResource } from './coreBaseResource.js';
import { logDebugUtils, logErrorUtils } from '@/components/SmartLight/api/core/utils/coreApiLoggerUtils.js';

export class CoreTypesResource extends CoreBaseResource {
    constructor() {
        super('/smart-light', null);
    }

    async getBatteryTypesResource() {
        logDebugUtils('CoreTypesResource', 'getBatteryTypesResource');
        return this.getBase('/battery-types');
    }

    async getBatteryTypeByIdResource(id) {
        logDebugUtils('CoreTypesResource', 'getBatteryTypeByIdResource', { id });
        return this.getBase(`/battery-types/${id}`);
    }

    async getBulbTypesResource() {
        logDebugUtils('CoreTypesResource', 'getBulbTypesResource');
        return this.getBase('/bulb-types');
    }

    async getBulbTypeByIdResource(id) {
        logDebugUtils('CoreTypesResource', 'getBulbTypeByIdResource', { id });
        return this.getBase(`/bulb-types/${id}`);
    }

    async getPowerSuppliesResource() {
        logDebugUtils('CoreTypesResource', 'getPowerSuppliesResource');
        return this.getBase('/power-supplies');
    }

    async getPowerSupplyByIdResource(id) {
        logDebugUtils('CoreTypesResource', 'getPowerSupplyByIdResource', { id });
        return this.getBase(`/power-supplies/${id}`);
    }

    async getForDropdownResource(type) {
        logDebugUtils('CoreTypesResource', 'getForDropdownResource', { type });
        return this.getBase(`/${type}/dropdown`);
    }

    async checkCompatibilityResource(type, typeId, deviceId) {
        logDebugUtils('CoreTypesResource', 'checkCompatibilityResource', { type, typeId, deviceId });
        return this.postBase(`/${type}/check-compatibility`, {
            type_id: typeId,
            device_id: deviceId
        });
    }
}

export default CoreTypesResource;
