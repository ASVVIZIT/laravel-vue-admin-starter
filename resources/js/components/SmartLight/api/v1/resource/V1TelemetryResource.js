/**
 * ============================================================================
 * V1 TELEMETRY RESOURCE — ВЕРСИЯ 1 (НЕЗАВИСИМА ОТ V0)
 * ============================================================================
 * 📁 Путь: api/v1/resource/V1TelemetryResource.js
 * ✅ Расширяет: Core TelemetryResource
 * ============================================================================
 */

import { TelemetryResource } from '@/components/SmartLight/api/core/resource/TelemetryResource.js';

export class V1TelemetryResource extends TelemetryResource {
    constructor() {
        super();
        this.version = 'v1';
    }

    getVersion() {
        return 'v1';
    }

    // ✅ V1: Расширенная статистика
    async getStatistics(deviceId) {
        return this.get(`/devices/${deviceId}/telemetry/statistics`);
    }

    async getAggregated(deviceId, interval = 'hour') {
        return this.get(`/devices/${deviceId}/telemetry/aggregated`, { interval });
    }

    async export(deviceId, format = 'csv', options = {}) {
        return this.get(`/devices/${deviceId}/telemetry/export`, {
            format,
            ...options
        });
    }
}

export default V1TelemetryResource;
