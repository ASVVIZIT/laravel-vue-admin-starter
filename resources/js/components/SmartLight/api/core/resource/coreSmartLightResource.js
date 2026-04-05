/**
 * ============================================================================
 * SMART LIGHT RESOURCE — БАЗОВЫЙ API КЛИЕНТ (НАСЛЕДУЕТ BASE)
 * ============================================================================
 * 📁 Путь: api/core/resource/coreSmartLightResource.js
 * ✅ Использует: CoreBaseResource (единый стандарт вместо прямого request)
 * ✅ Endpoints: /smart-light/devices/{id}/wake
 * ✅ Рефакторинг: методы с суффиксом Resource(), наследование CoreBaseResource
 * ============================================================================
 */

import { CoreBaseResource } from './coreBaseResource.js';
import { logDebugUtils, logErrorUtils } from '@components/SmartLight/api/core/utils/coreApiLoggerUtils.js';

export class CoreSmartLightResource extends CoreBaseResource {
    constructor() {
        super('/smart-light', null);
    }

    async getDevicesResource() {
        logDebugUtils('coreSmartLightResource', 'getDevicesResource');
        return this.getBase('/devices');
    }

    async getDeviceResource(deviceId) {
        logDebugUtils('coreSmartLightResource', 'getDeviceResource', { deviceId });
        return this.getBase(`/devices/${deviceId}`);
    }

    async wakeDeviceResource(deviceId) {
        logDebugUtils('coreSmartLightResource', 'wakeDeviceResource', { deviceId });
        return this.postBase(`/devices/${deviceId}/wake`);
    }

    async forceSleepResource(deviceId) {
        logDebugUtils('coreSmartLightResource', 'forceSleepResource', { deviceId });
        return this.postBase(`/devices/${deviceId}/sleep`);
    }

    async sendCommandResource(deviceId, command, intensity = 100) {
        logDebugUtils('coreSmartLightResource', 'sendCommandResource', { deviceId, command, intensity });
        return this.postBase(`/devices/${deviceId}/commands`, { command, intensity });
    }

    async getGlobalSettingsResource() {
        logDebugUtils('coreSmartLightResource', 'getGlobalSettingsResource');
        return this.getBase('/settings');
    }

    async updateGlobalSettingsResource(settings) {
        logDebugUtils('coreSmartLightResource', 'updateGlobalSettingsResource', { settings });
        return this.postBase('/settings', { settings });
    }

    async resetGlobalSettingsResource() {
        logDebugUtils('coreSmartLightResource', 'resetGlobalSettingsResource');
        return this.postBase('/settings/reset');
    }

    async getDeviceSettingsResource(deviceId) {
        logDebugUtils('coreSmartLightResource', 'getDeviceSettingsResource', { deviceId });
        return this.getBase(`/devices/${deviceId}/settings`);
    }

    async updateDeviceSettingsResource(deviceId, settings) {
        logDebugUtils('coreSmartLightResource', 'updateDeviceSettingsResource', { deviceId, settings });
        return this.putBase(`/devices/${deviceId}/settings`, settings);
    }

    async resetDeviceSettingsResource(deviceId) {
        logDebugUtils('coreSmartLightResource', 'resetDeviceSettingsResource', { deviceId });
        return this.postBase(`/devices/${deviceId}/settings/reset`);
    }
}

export default CoreSmartLightResource;
