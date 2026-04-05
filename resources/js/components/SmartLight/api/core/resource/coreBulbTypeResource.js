/**
 * ============================================================================
 * CORE BULB TYPE RESOURCE — РЕСУРС ДЛЯ ТИПОВ ЛАМП
 * ============================================================================
 * 📁 Путь: api/core/resource/coreBulbTypeResource.js
 * ✅ Маршрут: /api/smart-light/bulb-types
 * ✅ Рефакторинг: методы с суффиксом Resource()
 * ============================================================================
 */

import { CoreBaseResource } from './coreBaseResource.js';

export class CoreBulbTypeResource extends CoreBaseResource {
    constructor() {
        super('/smart-light', null);
    }

    async getAllResource() {
        return this.getBase('/bulb-types');
    }

    async getByIdResource(id) {
        return this.getBase(`/bulb-types/${id}`);
    }

    async getForDropdownResource() {
        return this.getBase('/bulb-types/dropdown');
    }

    async checkCompatibilityResource(bulbTypeId, deviceId) {
        return this.postBase('/bulb-types/check-compatibility', {
            bulb_type_id: bulbTypeId,
            device_id: deviceId
        });
    }
}

export default CoreBulbTypeResource;
