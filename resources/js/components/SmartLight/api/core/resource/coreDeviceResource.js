/**
 * ============================================================================
 * DEVICE RESOURCE — ЯДРО (МАРШРУТЫ БЕЗ ВЕРСИИ)
 * ============================================================================
 * 📁 Путь: api/core/resource/coreDeviceResource.js
 * ✅ Маршруты: /smart-light/devices (НЕ /smart-light/v0/devices)
 * ✅ Рефакторинг: методы с суффиксом Resource(), вызовы через Base()
 * ============================================================================
 */

import { CoreBaseResource } from './coreBaseResource.js';

export class CoreDeviceResource extends CoreBaseResource {
    constructor() {
        // ✅ version=null → buildUrl() не добавит префикс версии
        // Итоговый URL: /api/smart-light/devices
        super('/smart-light', null);
    }

    async getAllResource(params = {}) { return this.getBase('/devices', params); }
    async getByIdResource(deviceId) { return this.getBase(`/devices/${deviceId}`); }
    async getDropdownResource() { return this.getBase('/devices/dropdown'); }
    async checkOwnershipResource(deviceId) { return this.getBase(`/devices/${deviceId}/ownership`); }
    async registerResource(data) { return this.postBase('/devices/register', data); }
    async getWithTelemetryResource(deviceId, limit = 100) { return this.getBase(`/devices/${deviceId}/with-telemetry`, { limit }); }
    async updateStatusResource(deviceId, status) { return this.putBase(`/devices/${deviceId}/status`, { status }); }
    async updateIntensityResource(deviceId, intensity) { return this.putBase(`/devices/${deviceId}/intensity`, { intensity }); }
    async updateSettingsResource(deviceId, settings) { return this.putBase(`/devices/${deviceId}/settings`, settings); }
    async wakeResource(deviceId) { return this.postBase(`/devices/${deviceId}/wake`); }
    async sleepResource(deviceId) { return this.postBase(`/devices/${deviceId}/sleep`); }
    async deleteDeviceResource(deviceId) { return this.deleteBase(`/devices/${deviceId}`); }
    async getTelemetryResource(deviceId, params = {}) { return this.getBase(`/devices/${deviceId}/telemetry`, params); }
    async getBatteryStatusResource(deviceId) { return this.getBase(`/devices/${deviceId}/battery`); }
    async getPowerStatusResource(deviceId) { return this.getBase(`/devices/${deviceId}/power`); }
}

export default CoreDeviceResource;
