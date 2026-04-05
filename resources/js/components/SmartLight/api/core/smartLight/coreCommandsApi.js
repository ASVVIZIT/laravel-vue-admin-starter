/**
 * ============================================================================
 * COMMANDS API — API ДЛЯ ОТПРАВКИ КОМАНД
 * ============================================================================
 * 📁 Путь: api/core/smartLight/coreCommandsApi.js
 * ✅ Используется: CommandService, Controllers
 * ✅ Рефакторинг: методы с суффиксом Api(), вызовы через Resource()
 * ============================================================================
 */

import { CoreSmartLightResource } from '@components/SmartLight/api/core/resource/coreSmartLightResource.js';
import { logDebugUtils, logErrorUtils } from '@components/SmartLight/api/core/utils/coreApiLoggerUtils.js';

const resource = new CoreSmartLightResource();

export const CoreCommandsApi = {
    async sendCommandApi(deviceId, command, intensity = 100) {
        logDebugUtils('coreCommandsApi', 'sendCommandApi called', { deviceId, command, intensity });
        try {
            const response = await resource.sendCommandResource(deviceId, command, intensity);
            return {
                success: true,
                message: 'Команда успешно отправлена',
                data: response.data
            };
        } catch (error) {
            logErrorUtils('coreCommandsApi', 'sendCommandApi error', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Ошибка отправки команды',
                error: error.response?.data || error
            };
        }
    },

    async forceSleepApi(deviceId) {
        logDebugUtils('coreCommandsApi', 'forceSleepApi called', { deviceId });
        try {
            const response = await resource.forceSleepResource(deviceId);
            return {
                success: true,
                message: 'Команда сна отправлена',
                data: response.data
            };
        } catch (error) {
            logErrorUtils('coreCommandsApi', 'forceSleepApi error', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Ошибка отправки команды сна',
                error: error.response?.data || error
            };
        }
    },

    async getCommandApi(deviceId) {
        logDebugUtils('coreCommandsApi', 'getCommandApi called', { deviceId });
        try {
            const response = await resource.getCommandResource(deviceId);
            return {
                success: true,
                message: 'Команда получена',
                data: response.data
            };
        } catch (error) {
            logErrorUtils('coreCommandsApi', 'getCommandApi error', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Ошибка получения команды',
                error: error.response?.data || error
            };
        }
    }
};

export default CoreCommandsApi;
