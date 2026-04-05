/**
 * ============================================================================
 * CORE BATTERY TYPE RESOURCE — РЕСУРС ДЛЯ ТИПОВ АККУМУЛЯТОРОВ
 * ============================================================================
 * 📁 Путь: api/core/resource/coreBatteryTypeResource.js
 * ✅ Маршрут: /api/smart-light/battery-types
 * ✅ Рефакторинг: методы с суффиксом Resource()
 * ============================================================================
 */

import { CoreBaseResource } from './coreBaseResource.js';

export class CoreBatteryTypeResource extends CoreBaseResource {
    constructor() {
        super('/smart-light', null);
    }

    async getAllResource() {
        return this.getBase('/battery-types');
    }

    async getByIdResource(id) {
        return this.getBase(`/battery-types/${id}`);
    }

    async getForDropdownResource() {
        return this.getBase('/battery-types/dropdown');
    }

    async checkCompatibilityResource(batteryTypeId, deviceId) {
        return this.postBase('/battery-types/check-compatibility', {
            battery_type_id: batteryTypeId,
            device_id: deviceId
        });
    }
}

export default CoreBatteryTypeResource;
