/**
 * ============================================================================
 * V1 TYPES RESOURCE — ВЕРСИЯ 1 (НЕЗАВИСИМА ОТ V0)
 * ============================================================================
 * 📁 Путь: api/v1/resource/V1TypesResource.js
 * ✅ Расширяет: Core TypesResource
 * ============================================================================
 */

import { TypesResource } from '@/components/SmartLight/api/core/resource/TypesResource.js';

export class V1TypesResource extends TypesResource {
    constructor() {
        super();
        this.version = 'v1';
    }

    getVersion() {
        return 'v1';
    }

    // ✅ V1: Compatibility check
    async checkCompatibility(type, typeId, deviceId) {
        return this.post(`/${type}/check-compatibility`, {
            type_id: typeId,
            device_id: deviceId
        });
    }

    async getRecommended(deviceId) {
        return this.get('/types/recommended', { device_id: deviceId });
    }
}

export default V1TypesResource;
