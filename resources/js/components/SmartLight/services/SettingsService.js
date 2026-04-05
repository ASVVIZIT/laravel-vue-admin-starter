/**
 * ============================================================================
 * SETTINGS SERVICE — СЕРВИС ДЛЯ РАБОТЫ С НАСТРОЙКАМИ
 * ============================================================================
 * 📁 Путь: services/SettingsService.js
 * ✅ Бизнес-логика + API вызовы
 * ✅ Рефакторинг: методы получили суффикс Service(), импорты обновлены на *Utils
 * ============================================================================
 */

import { CoreSmartLightResource } from '@/components/SmartLight/api/core/resource/coreSmartLightResource.js';
import { logDebugUtils, logErrorUtils } from '@/components/SmartLight/api/core/utils/coreApiLoggerUtils.js';

export class SettingsService {
    constructor() {
        this.resource = new CoreSmartLightResource();
    }

    async getDeviceSettingsService(deviceId) {
        logDebugUtils('SettingsService', 'Получение настроек', { deviceId });
        try {
            const response = await this.resource.getDeviceSettingsResource(deviceId);
            return {
                success: true,
                data: response.data,
                message: 'Настройки успешно загружены'
            };
        } catch (error) {
            logErrorUtils('SettingsService', 'Ошибка загрузки настроек', error);
            return {
                success: false,
                error: error.message,
                message: 'Не удалось загрузить настройки устройства'
            };
        }
    }

    async updateDeviceSettingsService(deviceId, settings) {
        logDebugUtils('SettingsService', 'Обновление настроек', { deviceId, settings });
        try {
            const response = await this.resource.updateDeviceSettingsResource(deviceId, settings);
            return {
                success: true,
                data: response.data,
                message: 'Настройки успешно обновлены'
            };
        } catch (error) {
            logErrorUtils('SettingsService', 'Ошибка обновления настроек', error);
            return {
                success: false,
                error: error.message,
                message: 'Не удалось обновить настройки устройства'
            };
        }
    }

    async resetDeviceSettingsService(deviceId) {
        logDebugUtils('SettingsService', 'Сброс настроек', { deviceId });
        try {
            const response = await this.resource.resetDeviceSettingsResource(deviceId);
            return {
                success: true,
                data: response.data,
                message: 'Настройки успешно сброшены'
            };
        } catch (error) {
            logErrorUtils('SettingsService', 'Ошибка сброса настроек', error);
            return {
                success: false,
                error: error.message,
                message: 'Не удалось сбросить настройки устройства'
            };
        }
    }

    async getGlobalSettingsService() {
        logDebugUtils('SettingsService', 'Получение глобальных настроек');
        try {
            const response = await this.resource.getGlobalSettingsResource();
            return {
                success: true,
                data: response.data,
                message: 'Глобальные настройки успешно загружены'
            };
        } catch (error) {
            logErrorUtils('SettingsService', 'Ошибка загрузки глобальных настроек', error);
            return {
                success: false,
                error: error.message,
                message: 'Не удалось загрузить глобальные настройки'
            };
        }
    }

    async updateGlobalSettingsService(settings) {
        logDebugUtils('SettingsService', 'Обновление глобальных настроек', { settings });
        try {
            const response = await this.resource.updateGlobalSettingsResource(settings);
            return {
                success: true,
                data: esponse.data,
                message: 'Глобальные настройки успешно обновлены'
            };
        } catch (error) {
            logErrorUtils('SettingsService', 'Ошибка обновления глобальных настроек', error);
            return {
                success: false,
                error: error.message,
                message: 'Не удалось обновить глобальные настройки'
            };
        }
    }

    async resetGlobalSettingsService() {
        logDebugUtils('SettingsService', 'Сброс глобальных настроек');
        try {
            const response = await this.resource.resetGlobalSettingsResource();
            return {
                success: true,
                data: response.data,
                message: 'Глобальные настройки успешно сброшены'
            };
        } catch (error) {
            logErrorUtils('SettingsService', 'Ошибка сброса глобальных настроек', error);
            return {
                success: false,
                error: error.message,
                message: 'Не удалось сбросить глобальные настройки'
            };
        }
    }
}

export default SettingsService;
