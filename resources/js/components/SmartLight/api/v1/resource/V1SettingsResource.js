/**
 * ============================================================================
 * V1 SETTINGS RESOURCE — ВЕРСИЯ 1 (НЕЗАВИСИМА ОТ V0)
 * ============================================================================
 * 📁 Путь: api/v1/resource/V1SettingsResource.js
 * ✅ Расширяет: Core SettingsResource
 * ============================================================================
 */

import { SettingsResource } from '@/components/SmartLight/api/core/resource/SettingsResource.js';

export class V1SettingsResource extends SettingsResource {
    constructor() {
        super();
        this.version = 'v1';
    }

    getVersion() {
        return 'v1';
    }

    // ✅ V1: Bulk settings update
    async updateBulkDeviceSettings(deviceIds, settings) {
        return this.post('/settings/bulk', { device_ids: deviceIds, settings });
    }

    async getSettingsHistory(deviceId) {
        return this.get(`/${deviceId}/device-settings/history`);
    }
}

export default V1SettingsResource;
