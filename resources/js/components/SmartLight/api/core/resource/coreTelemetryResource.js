/**
 * ============================================================================
 * TELEMETRY RESOURCE — ЯДРО (БАЗОВАЯ ЛОГИКА ТЕЛЕМЕТРИИ)
 * ============================================================================
 * 📁 Путь: api/core/resource/coreTelemetryResource.js
 * ✅ Используется: V0, V1, V2 ресурсы
 * ============================================================================
 */

import { CoreBaseResource } from './coreBaseResource.js';
import { logDebug, logError } from '@components/SmartLight/api/core/utils/coreApiLogger.js';

export class CoreTelemetryResource extends CoreBaseResource {
    constructor() {
        super('/smart-light', null);
    }

    /**
     * Отправить телеметрию
     */
    async send(deviceId, data) {
        logDebug('coreTelemetryResource', 'send', { deviceId, data });
        return this.post(`/${deviceId}/telemetry`, data);
    }

    /**
     * Получить телеметрию устройства
     */
    async get(deviceId, params = {}) {
        logDebug('coreTelemetryResource', 'get', { deviceId, params });
        return this.get(`/${deviceId}/telemetry`, params);
    }

    /**
     * Получить последнюю телеметрию
     */
    async getLatest(deviceId) {
        logDebug('coreTelemetryResource', 'getLatest', { deviceId });
        return this.get(`/${deviceId}/telemetry`, { limit: 1 });
    }

    /**
     * Получить историю телеметрии
     */
    async getHistory(deviceId, options = {}) {
        logDebug('coreTelemetryResource', 'getHistory', { deviceId, options });
        const params = new URLSearchParams();
        if (options.limit) params.append('limit', options.limit);
        if (options.start) params.append('start', options.start);
        if (options.end) params.append('end', options.end);
        if (options.interval) params.append('interval', options.interval);
        return this.get(`/${deviceId}/telemetry/history`, params);
    }

    /**
     * Получить статистику телеметрии
     */
    async getStatistics(deviceId, period = 'day') {
        logDebug('coreTelemetryResource', 'getStatistics', { deviceId, period });
        return this.get(`/${deviceId}/telemetry/statistics`, { period });
    }

    /**
     * Экспортировать телеметрию
     */
    async export(deviceId, format = 'csv', options = {}) {
        logDebug('coreTelemetryResource', 'export', { deviceId, format, options });
        return this.get(`/${deviceId}/telemetry/export`, { format, ...options });
    }

    /**
     * Очистить историю телеметрии
     */
    async clear(deviceId, beforeDate) {
        logDebug('coreTelemetryResource', 'clear', { deviceId, beforeDate });
        return this.delete(`/${deviceId}/telemetry`, { before: beforeDate });
    }
}

export default CoreTelemetryResource;
