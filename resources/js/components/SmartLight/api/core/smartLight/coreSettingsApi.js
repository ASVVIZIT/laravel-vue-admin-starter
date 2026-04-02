/**
 * ============================================================================
 * SETTINGS API — API ДЛЯ РАБОТЫ С НАСТРОЙКАМИ
 * ============================================================================
 * 📁 Путь: api/core/smartLight/coreSettingsApi.js
 * ✅ Используется: SettingsService, Controllers
 * ============================================================================
 */

import { CoreSmartLightResource } from '@components/SmartLight/api/core/resource/coreSmartLightResource.js';
import { logDebug, logError } from '@components/SmartLight/api/core/utils/coreApiLogger.js';

const resource = new CoreSmartLightResource();

export const CoreSettingsApi = {
    async getGlobalSettings() {
        try {
            const response = await resource.getGlobalSettings();
            return {
                success: true,
                message: 'Настройки загружены',
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Ошибка загрузки настроек',
                error: error.response?.data || error
            };
        }
    },

    async updateGlobalSettings(settings) {
        try {
            const response = await resource.updateGlobalSettings(settings);
            return {
                success: true,
                message: 'Настройки обновлены',
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Ошибка обновления настроек',
                error: error.response?.data || error
            };
        }
    },

    async resetGlobalSettings() {
        try {
            const response = await resource.resetGlobalSettings();
            return {
                success: true,
                message: 'Настройки сброшены',
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Ошибка сброса настроек',
                error: error.response?.data || error
            };
        }
    }
};

export default CoreSettingsApi;
