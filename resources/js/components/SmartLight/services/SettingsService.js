import { SmartLightResource } from '@/components/SmartLight/api/core/SmartLightResource';
import { logDebug, logError } from '@/components/SmartLight/api/utils/logger';

export class SettingsService {
    /**
     * Получение настроек устройства
     */
    async getDeviceSettings(deviceId) {
        logDebug('SettingsService', 'Получение настроек', { deviceId });

        const resource = new SmartLightResource();

        try {
            const response = await resource.getDeviceSettings(deviceId);
            return {
                success: true,
                data: response.data,
                message: 'Настройки успешно загружены'
            };
        } catch (error) {
            logError('SettingsService', 'Ошибка загрузки настроек', error);
            return {
                success: false,
                error: error.message,
                message: 'Не удалось загрузить настройки устройства'
            };
        }
    }

    /**
     * Обновление настроек устройства
     */
    async updateDeviceSettings(deviceId, settings) {
        logDebug('SettingsService', 'Обновление настроек', {
            deviceId,
            settings
        });

        const resource = new SmartLightResource();

        try {
            const response = await resource.updateDeviceSettings(deviceId, settings);
            return {
                success: true,
                data: response.data,
                message: 'Настройки успешно обновлены'
            };
        } catch (error) {
            logError('SettingsService', 'Ошибка обновления настроек', error);
            return {
                success: false,
                error: error.message,
                message: 'Не удалось обновить настройки устройства'
            };
        }
    }

    /**
     * Сброс настроек устройства
     */
    async resetDeviceSettings(deviceId) {
        logDebug('SettingsService', 'Сброс настроек', { deviceId });

        const resource = new SmartLightResource();

        try {
            const response = await resource.resetDeviceSettings(deviceId);
            return {
                success: true,
                data: response.data,
                message: 'Настройки успешно сброшены'
            };
        } catch (error) {
            logError('SettingsService', 'Ошибка сброса настроек', error);
            return {
                success: false,
                error: error.message,
                message: 'Не удалось сбросить настройки устройства'
            };
        }
    }
}
