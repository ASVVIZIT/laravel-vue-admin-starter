/**
 * ============================================================================
 * V1 BULB TYPE RESOURCE — ВЕРСИЯ 1 (НЕЗАВИСИМА ОТ V0)
 * ============================================================================
 * 📁 Путь: api/v1/resource/V1BulbTypeResource.js
 * ✅ Расширяет: Core BulbTypeResource
 * ============================================================================
 */

import { CoreBulbTypeResource } from '@/components/SmartLight/api/core/resource/BulbTypeResource.js';

export class V1BulbTypeResource extends CoreBulbTypeResource {
    constructor() {
        super();
        this.version = 'v1';
    }

    getVersion() {
        return 'v1';
    }

    // ✅ V1: Bulb analytics
    async getAnalytics(bulbTypeId) {
        return this.get(`/bulb-types/${bulbTypeId}/analytics`);
    }

    async getEffects(bulbTypeId) {
        return this.get(`/bulb-types/${bulbTypeId}/effects`);
    }
}

export default V1BulbTypeResource;
