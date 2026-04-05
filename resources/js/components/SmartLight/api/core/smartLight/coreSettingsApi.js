/**
 * ============================================================================
 * SETTINGS API — API ДЛЯ РАБОТЫ С НАСТРОЙКАМИ
 * ============================================================================
 * 📁 Путь: api/core/smartLight/coreSettingsApi.js
 * ✅ Используется: SettingsService, Controllers
 * ✅ Рефакторинг: методы с суффиксом Api(), вызовы через Resource()
 * ============================================================================
 */

import { CoreSmartLightResource } from '@components/SmartLight/api/core/resource/coreSmartLightResource.js';
import { logDebugUtils, logErrorUtils } from '@components/SmartLight/api/core/utils/coreApiLoggerUtils.js';

const resource = new CoreSmartLightResource();

export const CoreSettingsApi = {
    async getGlobalSettingsApi() {
        logDebugUtils('coreSettingsApi', 'getGlobalSettingsApi called');
        try {
            const response = await resource.getGlobalSettingsResource();
            return {
                success: true,
                message: 'Настройки загружены',
                data: response.data
            };
        } catch (error) {
            logErrorUtils('coreSettingsApi', 'getGlobalSettingsApi error', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Ошибка загрузки настроек',
                error: error.response?.data || error
            };
        }
    },

    async updateGlobalSettingsApi(settings) {
        logDebugUtils('coreSettingsApi', 'updateGlobalSettingsApi called', { settings });
        try {
            const response = await resource.updateGlobalSettingsResource(settings);
            return {
                success: true,
                message: 'Настройки обновлены',
                data: response.data
            };
        } catch (error) {
            logErrorUtils('coreSettingsApi', 'updateGlobalSettingsApi error', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Ошибка обновления настроек',
                error: error.response?.data || error
            };
        }
    },

    async resetGlobalSettingsApi() {
        logDebugUtils('coreSettingsApi', 'resetGlobalSettingsApi called');
        try {
            const response = await resource.resetGlobalSettingsResource();
            return {
                success: true,
                message: 'Настройки сброшены',
                data: response.data
            };
        } catch (error) {
            logErrorUtils('coreSettingsApi', 'resetGlobalSettingsApi error', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Ошибка сброса настроек',
                error: error.response?.data || error
            };
        }
    }
};

export default CoreSettingsApi;
