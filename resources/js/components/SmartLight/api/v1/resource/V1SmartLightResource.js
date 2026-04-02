/**
 * ============================================================================
 * V1 SMARTLIGHT RESOURCE — ВЕРСИЯ 1 (НЕЗАВИСИМА ОТ V0)
 * ============================================================================
 * 📁 Путь: api/v1/resource/V1SmartLightResource.js
 * ✅ Расширяет: Core SmartLightResource
 * ============================================================================
 */

import { CoreSmartLightResource } from '@/components/SmartLight/api/core/resource/SmartLightResource.js';
import { V1DeviceResource } from './V1DeviceResource.js';
import { V1CommandResource } from './V1CommandResource.js';
import { V1SettingsResource } from './V1SettingsResource.js';
import { V1TelemetryResource } from './V1TelemetryResource.js';
import { V1TypesResource } from './V1TypesResource.js';

export class V1SmartLightResource extends CoreSmartLightResource {
    constructor() {
        super();
        this.version = 'v1';

        // ✅ V1: Переопределяем ресурсы с V1 версиями
        this.devices = new V1DeviceResource();
        this.commands = new V1CommandResource();
        this.settings = new V1SettingsResource();
        this.telemetry = new V1TelemetryResource();
        this.types = new V1TypesResource();
    }

    getVersion() {
        return 'v1';
    }

    // ✅ V1: Новые методы
    async getDashboard(deviceIds) {
        return this.get('/dashboard', { device_ids: deviceIds });
    }

    async getAnalytics(deviceIds, period = 'day') {
        return this.get('/analytics', { device_ids: deviceIds, period });
    }
}

export default V1SmartLightResource;
