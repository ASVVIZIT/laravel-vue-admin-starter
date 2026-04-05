/**
 * ============================================================================
 * CORE POWER SUPPLY TYPE RESOURCE — РЕСУРС ДЛЯ ТИПОВ ИСТОЧНИКОВ ПИТАНИЯ
 * ============================================================================
 * 📁 Путь: api/core/resource/corePowerSupplyTypeResource.js
 * ✅ Маршрут: /api/smart-light/power-supplies
 * ✅ Рефакторинг: методы с суффиксом Resource()
 * ============================================================================
 */

import { CoreBaseResource } from './coreBaseResource.js';

export class CorePowerSupplyTypeResource extends CoreBaseResource {
    constructor() {
        super('/smart-light', null);
    }

    async getAllResource() {
        return this.getBase('/power-supplies');
    }

    async getByIdResource(id) {
        return this.getBase(`/power-supplies/${id}`);
    }

    async getForDropdownResource() {
        return this.getBase('/power-supplies/dropdown');
    }

    async checkCompatibilityResource(supplyTypeId, deviceId) {
        return this.postBase('/power-supplies/check-compatibility', {
            supply_type_id: supplyTypeId,
            device_id: deviceId
        });
    }
}

export default CorePowerSupplyTypeResource;
