/**
 * ============================================================================
 * SETTINGS RESOURCE — ЯДРО (БАЗОВАЯ ЛОГИКА НАСТРОЕК)
 * ============================================================================
 * 📁 Путь: api/core/resource/coreSettingsResource.js
 * ✅ Используется: V0, V1, V2 ресурсы
 * ============================================================================
 */

import { CoreBaseResource } from './coreBaseResource.js';
import { logDebug, logError } from '@components/SmartLight/api/core/utils/coreApiLogger.js';

export class CoreSettingsResource extends CoreBaseResource {
    constructor() {
        super('/smart-light', null);
    }

    /**
     * Получить глобальные настройки
     */
    async getGlobal() {
        logDebug('coreSettingsResource', 'getGlobal');
        return this.get('/settings');
    }

    /**
     * Обновить глобальные настройки
     */
    async updateGlobal(settings) {
        logDebug('coreSettingsResource', 'updateGlobal', { settings });
        return this.post('/settings', { settings });
    }

    /**
     * Сбросить глобальные настройки
     */
    async resetGlobal() {
        logDebug('coreSettingsResource', 'resetGlobal');
        return this.post('/settings/reset');
    }

    /**
     * Получить настройки устройства
     */
    async getDevice(deviceId) {
        logDebug('coreSettingsResource', 'getDevice', { deviceId });
        return this.get(`/${deviceId}/device-settings`);
    }

    /**
     * Обновить настройки устройства
     */
    async updateDevice(deviceId, settings) {
        logDebug('coreSettingsResource', 'updateDevice', { deviceId, settings });
        return this.put(`/${deviceId}/device-settings`, settings);
    }

    /**
     * Сбросить настройки устройства
     */
    async resetDevice(deviceId) {
        logDebug('coreSettingsResource', 'resetDevice', { deviceId });
        return this.post(`/${deviceId}/device-settings/reset`);
    }

    /**
     * Получить настройки по умолчанию
     */
    async getDefaults(deviceId) {
        logDebug('coreSettingsResource', 'getDefaults', { deviceId });
        return this.get(`/${deviceId}/device-settings/defaults`);
    }

    /**
     * Проверить валидность настроек
     */
    async validate(deviceId, settings) {
        logDebug('coreSettingsResource', 'validate', { deviceId, settings });
        return this.post(`/${deviceId}/device-settings/validate`, settings);
    }
}

export default CoreSettingsResource;
