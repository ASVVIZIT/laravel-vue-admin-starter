/**
 * ============================================================================
 * V1 DEVICE RESOURCE — ВЕРСИЯ 1 (НЕЗАВИСИМА ОТ V0)
 * ============================================================================
 * 📁 Путь: api/v1/resource/V1DeviceResource.js
 * ✅ Расширяет: Core DeviceResource (НЕ V0!)
 * ============================================================================
 */

import { CoreDeviceResource } from '@/components/SmartLight/api/core/resource/DeviceResource.js';

export class V1DeviceResource extends CoreDeviceResource {
    constructor() {
        super();
        this.version = 'v1';
    }

    getVersion() {
        return 'v1';
    }

    // ✅ V1: Новые методы (не переопределение V0)
    async getWithTelemetry(deviceId, limit = 100) {
        return this.get(`/devices/${deviceId}/with-telemetry`, { limit });
    }

    async batchUpdate(devices) {
        return this.post('/devices/batch', { devices });
    }

    async getStatistics(deviceId) {
        return this.get(`/devices/${deviceId}/statistics`);
    }
}

export default V1DeviceResource;
