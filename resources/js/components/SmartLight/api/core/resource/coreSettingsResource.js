/**
 * ============================================================================
 * SETTINGS RESOURCE — ЯДРО (БАЗОВАЯ ЛОГИКА НАСТРОЕК)
 * ============================================================================
 * 📁 Путь: api/core/resource/coreSettingsResource.js
 * ✅ Используется: V0, V1, V2 ресурсы
 * ✅ Рефакторинг: методы с суффиксом Resource(), вызовы через Base()
 * ============================================================================
 */

import { CoreBaseResource } from './coreBaseResource.js';
import { logDebugUtils, logErrorUtils } from '@components/SmartLight/api/core/utils/coreApiLoggerUtils.js';

export class CoreSettingsResource extends CoreBaseResource {
    constructor() {
        super('/smart-light', null);
    }

    /**
     * Получить глобальные настройки (суффикс Resource)
     */
    async getGlobalResource() {
        logDebugUtils('coreSettingsResource', 'getGlobalResource');
        return this.getBase('/settings');
    }

    /**
     * Обновить глобальные настройки (суффикс Resource)
     */
    async updateGlobalResource(settings) {
        logDebugUtils('coreSettingsResource', 'updateGlobalResource', { settings });
        return this.postBase('/settings', { settings });
    }

    /**
     * Сбросить глобальные настройки (суффикс Resource)
     */
    async resetGlobalResource() {
        logDebugUtils('coreSettingsResource', 'resetGlobalResource');
        return this.postBase('/settings/reset');
    }

    /**
     * Получить настройки устройства (суффикс Resource)
     */
    async getDeviceResource(deviceId) {
        logDebugUtils('coreSettingsResource', 'getDeviceResource', { deviceId });
        return this.getBase(`/devices/${deviceId}/settings`);
    }

    /**
     * Обновить настройки устройства (суффикс Resource)
     */
    async updateDeviceResource(deviceId, settings) {
        logDebugUtils('coreSettingsResource', 'updateDeviceResource', { deviceId, settings });
        return this.putBase(`/devices/${deviceId}/settings`, settings);
    }

    /**
     * Сбросить настройки устройства (суффикс Resource)
     */
    async resetDeviceResource(deviceId) {
        logDebugUtils('coreSettingsResource', 'resetDeviceResource', { deviceId });
        return this.postBase(`/devices/${deviceId}/settings/reset`);
    }

    /**
     * Получить настройки по умолчанию (суффикс Resource)
     */
    async getDefaultsResource(deviceId) {
        logDebugUtils('coreSettingsResource', 'getDefaultsResource', { deviceId });
        return this.getBase(`/devices/${deviceId}/settings/defaults`);
    }

    /**
     * Проверить валидность настроек (суффикс Resource)
     */
    async validateResource(deviceId, settings) {
        logDebugUtils('coreSettingsResource', 'validateResource', { deviceId, settings });
        return this.postBase(`/devices/${deviceId}/settings/validate`, settings);
    }
}

export default CoreSettingsResource;
