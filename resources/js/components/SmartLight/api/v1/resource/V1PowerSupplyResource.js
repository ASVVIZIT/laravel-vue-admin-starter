/**
 * ============================================================================
 * V1 POWER SUPPLY RESOURCE — ВЕРСИЯ 1 (НЕЗАВИСИМА ОТ V0)
 * ============================================================================
 * 📁 Путь: api/v1/resource/V1PowerSupplyResource.js
 * ✅ Расширяет: Core PowerSupplyResource
 * ============================================================================
 */

import { CorePowerSupplyResource } from '@/components/SmartLight/api/core/resource/PowerSupplyResource.js';

export class V1PowerSupplyResource extends CorePowerSupplyResource {
    constructor() {
        super();
        this.version = 'v1';
    }

    getVersion() {
        return 'v1';
    }

    // ✅ V1: Power analytics
    async getAnalytics(supplyId) {
        return this.get(`/power-supplies/${supplyId}/analytics`);
    }

    async getEfficiency(supplyId, deviceId) {
        return this.get(`/power-supplies/${supplyId}/efficiency`, { device_id: deviceId });
    }
}

export default V1PowerSupplyResource;
