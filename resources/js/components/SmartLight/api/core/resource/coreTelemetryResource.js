/**
 * ============================================================================
 * TELEMETRY RESOURCE — ЯДРО (БАЗОВАЯ ЛОГИКА ТЕЛЕМЕТРИИ)
 * ============================================================================
 * 📁 Путь: api/core/resource/coreTelemetryResource.js
 * ✅ Используется: V0, V1, V2 ресурсы
 * ✅ Рефакторинг: методы с суффиксом Resource(), вызовы через Base()
 * ============================================================================
 */

import { CoreBaseResource } from './coreBaseResource.js';
import { logDebugUtils, logErrorUtils } from '@components/SmartLight/api/core/utils/coreApiLoggerUtils.js';

export class CoreTelemetryResource extends CoreBaseResource {
    constructor() {
        super('/smart-light', null);
    }

    /**
     * Отправить телеметрию (суффикс Resource)
     */
    async sendResource(deviceId, data) {
        logDebugUtils('coreTelemetryResource', 'sendResource', { deviceId, data });
        return this.postBase(`/${deviceId}/telemetry`, data);
    }

    /**
     * Получить телеметрию устройства (суффикс Resource)
     */
    async getResource(deviceId, params = {}) {
        logDebugUtils('coreTelemetryResource', 'getResource', { deviceId, params });
        return this.getBase(`/${deviceId}/telemetry`, params);
    }

    /**
     * Получить последнюю телеметрию (суффикс Resource)
     */
    async getLatestResource(deviceId) {
        logDebugUtils('coreTelemetryResource', 'getLatestResource', { deviceId });
        return this.getBase(`/${deviceId}/telemetry`, { limit: 1 });
    }

    /**
     * Получить историю телеметрии (суффикс Resource)
     */
    async getHistoryResource(deviceId, options = {}) {
        logDebugUtils('coreTelemetryResource', 'getHistoryResource', { deviceId, options });
        const params = new URLSearchParams();
        if (options.limit) params.append('limit', options.limit);
        if (options.start) params.append('start', options.start);
        if (options.end) params.append('end', options.end);
        if (options.interval) params.append('interval', options.interval);
        return this.getBase(`/${deviceId}/telemetry/history`, params);
    }

    /**
     * Получить статистику телеметрии (суффикс Resource)
     */
    async getStatisticsResource(deviceId, period = 'day') {
        logDebugUtils('coreTelemetryResource', 'getStatisticsResource', { deviceId, period });
        return this.getBase(`/${deviceId}/telemetry/statistics`, { period });
    }

    /**
     * Экспортировать телеметрию (суффикс Resource)
     */
    async exportResource(deviceId, format = 'csv', options = {}) {
        logDebugUtils('coreTelemetryResource', 'exportResource', { deviceId, format, options });
        return this.getBase(`/${deviceId}/telemetry/export`, { format, ...options });
    }

    /**
     * Очистить историю телеметрии (суффикс Resource)
     */
    async clearResource(deviceId, beforeDate) {
        logDebugUtils('coreTelemetryResource', 'clearResource', { deviceId, beforeDate });
        return this.deleteBase(`/${deviceId}/telemetry`, { before: beforeDate });
    }
}

export default CoreTelemetryResource;
