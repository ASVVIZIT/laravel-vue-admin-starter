// resources/js/components/SmartLight/api/smartLight/CommandsApi.js
import { SmartLightResource } from '../core/SmartLightResource.js';
import { logger } from '../utils/logger.js';

const resource = new SmartLightResource();

export const CommandsApi = {
    async sendCommand(deviceId, command, intensity = 100) {
        logger.debug('CommandsApi.sendCommand called', { deviceId, command, intensity });
        try {
            const response = await resource.sendCommand(deviceId, command, intensity);
            return {
                success: true,
                message: 'Команда успешно отправлена',
                data: response.data
            };
        } catch (error) {
            logger.error('CommandsApi.sendCommand error', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Ошибка отправки команды',
                error: error.response?.data || error
            };
        }
    },

    async forceSleep(deviceId) {
        logger.debug('CommandsApi.forceSleep called', { deviceId });
        try {
            const response = await resource.forceSleep(deviceId);
            return {
                success: true,
                message: 'Команда сна отправлена',
                data: response.data
            };
        } catch (error) {
            logger.error('CommandsApi.forceSleep error', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Ошибка отправки команды сна',
                error: error.response?.data || error
            };
        }
    },

    async getCommand(deviceId) {
        logger.debug('CommandsApi.getCommand called', { deviceId });
        try {
            const response = await resource.getCommand(deviceId);
            return {
                success: true,
                message: 'Команда получена',
                data: response.data
            };
        } catch (error) {
            logger.error('CommandsApi.getCommand error', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Ошибка получения команды',
                error: error.response?.data || error
            };
        }
    }
};
