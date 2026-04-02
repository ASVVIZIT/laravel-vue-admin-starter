/**
 * ============================================================================
 * V1 BATTERY TYPE RESOURCE — ВЕРСИЯ 1 (НЕЗАВИСИМА ОТ V0)
 * ============================================================================
 * 📁 Путь: api/v1/resource/V1BatteryTypeResource.js
 * ✅ Расширяет: Core BatteryTypeResource
 * ============================================================================
 */

import { CoreBatteryTypeResource } from '@/components/SmartLight/api/core/resource/BatteryTypeResource.js';

export class V1BatteryTypeResource extends CoreBatteryTypeResource {
    constructor() {
        super();
        this.version = 'v1';
    }

    getVersion() {
        return 'v1';
    }

    // ✅ V1: Battery analytics
    async getAnalytics(batteryTypeId) {
        return this.get(`/battery-types/${batteryTypeId}/analytics`);
    }

    async compare(batteryTypeIds) {
        return this.post('/battery-types/compare', { battery_type_ids: batteryTypeIds });
    }
}

export default V1BatteryTypeResource;
