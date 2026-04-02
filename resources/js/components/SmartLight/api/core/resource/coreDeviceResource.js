/**
 * ============================================================================
 * DEVICE RESOURCE — ЯДРО (БАЗОВАЯ ЛОГИКА)
 * ============================================================================
 * 📁 Путь: api/core/resource/coreDeviceResource.js
 * ✅ Используется: V0, V1, V2 ресурсы
 * ============================================================================
 */

import { CoreBaseResource } from '@components/SmartLight/api/core/resource/coreBaseResource.js';

export class CoreDeviceResource extends CoreBaseResource {
    constructor() {
        super('/smart-light', null); // null = без версии (default)
    }

    async getAll(params = {}) {
        return this.get('/devices', params);
    }

    async getById(deviceId) {
        return this.get(`/devices/${deviceId}`);
    }

    async getDropdown() {
        return this.get('/devices/dropdown');
    }

    async checkOwnership(deviceId) {
        return this.get(`/${deviceId}/ownership`);
    }

    async register(data) {
        return this.post('/register', data);
    }

    async getWithTelemetry(deviceId, limit = 100) {
        return this.get(`/devices/${deviceId}/with-telemetry`, { limit });
    }
}

export default CoreDeviceResource;
