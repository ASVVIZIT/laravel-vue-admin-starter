/**
 * ============================================================================
 * V2 DEVICE RESOURCE — ВЕРСИЯ 2 (РЕЗЕРВ, НЕЗАВИСИМА)
 * ============================================================================
 * 📁 Путь: api/v2/resource/V2DeviceResource.js
 * ✅ Расширяет: Core DeviceResource
 * ============================================================================
 */

import { CoreDeviceResource } from '@/components/SmartLight/api/core/resource/DeviceResource.js';

export class V2DeviceResource extends CoreDeviceResource {
    constructor() {
        super();
        this.version = 'v2';
    }

    getVersion() {
        return 'v2';
    }

    // ✅ V2: Будущие методы (пока заглушки)
    async getWithTelemetry(deviceId, limit = 100) {
        return this.get(`/devices/${deviceId}/with-telemetry`, { limit });
    }
}

export default V2DeviceResource;
