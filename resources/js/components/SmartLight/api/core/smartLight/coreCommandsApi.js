/**
 * ============================================================================
 * COMMANDS API — API ДЛЯ ОТПРАВКИ КОМАНД
 * ============================================================================
 * 📁 Путь: api/core/smartLight/coreCommandsApi.js
 * ✅ Используется: CommandService, Controllers
 * ============================================================================
 */

import { CoreSmartLightResource } from '@components/SmartLight/api/core/resource/coreSmartLightResource.js';
import { logDebug, logError } from '@components/SmartLight/api/core/utils/coreApiLogger.js';

const resource = new CoreSmartLightResource();

export const CoreCommandsApi = {
    async sendCommand(deviceId, command, intensity = 100) {
        logDebug('coreCommandsApi', 'sendCommand called', { deviceId, command, intensity });
        try {
            const response = await resource.sendCommand(deviceId, command, intensity);
            return {
                success: true,
                message: 'Команда успешно отправлена',
                data: response.data
            };
        } catch (error) {
            logError('coreCommandsApi', 'sendCommand error', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Ошибка отправки команды',
                error: error.response?.data || error
            };
        }
    },

    async forceSleep(deviceId) {
        logDebug('coreCommandsApi', 'forceSleep called', { deviceId });
        try {
            const response = await resource.forceSleep(deviceId);
            return {
                success: true,
                message: 'Команда сна отправлена',
                data: response.data
            };
        } catch (error) {
            logError('coreCommandsApi', 'forceSleep error', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Ошибка отправки команды сна',
                error: error.response?.data || error
            };
        }
    },

    async getCommand(deviceId) {
        logDebug('coreCommandsApi', 'getCommand called', { deviceId });
        try {
            const response = await resource.getCommand(deviceId);
            return {
                success: true,
                message: 'Команда получена',
                data: response.data
            };
        } catch (error) {
            logError('coreCommandsApi', 'getCommand error', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Ошибка получения команды',
                error: error.response?.data || error
            };
        }
    }
};

export default CoreCommandsApi;
