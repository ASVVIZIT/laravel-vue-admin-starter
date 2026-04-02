/**
 * ============================================================================
 * SETTINGS SERVICE — СЕРВИС ДЛЯ РАБОТЫ С НАСТРОЙКАМИ
 * ============================================================================
 * 📁 Путь: services/SettingsService.js
 * ✅ Бизнес-логика + API вызовы
 * ✅ Отвечает за: сохранение/загрузка настроек устройств и глобальных
 * ============================================================================
 */

import { CoreSmartLightResource } from '@/components/SmartLight/api/core/resource/coreSmartLightResource.js';
import { logDebug, logError } from '@/components/SmartLight/utils/appLogger.js';

export class SettingsService {
    constructor() {
        this.resource = new CoreSmartLightResource();
    }

    /**
     * Получение настроек устройства
     * @param {string} deviceId - ID устройства
     * @returns {Promise<Object>} Результат загрузки
     */
    async getDeviceSettings(deviceId) {
        logDebug('SettingsService', 'Получение настроек', { deviceId });

        try {
            const response = await this.resource.getDeviceSettings(deviceId);
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
     * @param {string} deviceId - ID устройства
     * @param {Object} settings - Настройки
     * @returns {Promise<Object>} Результат обновления
     */
    async updateDeviceSettings(deviceId, settings) {
        logDebug('SettingsService', 'Обновление настроек', { deviceId, settings });

        try {
            const response = await this.resource.updateDeviceSettings(deviceId, settings);
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
     * @param {string} deviceId - ID устройства
     * @returns {Promise<Object>} Результат сброса
     */
    async resetDeviceSettings(deviceId) {
        logDebug('SettingsService', 'Сброс настроек', { deviceId });

        try {
            const response = await this.resource.resetDeviceSettings(deviceId);
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

    /**
     * Получение глобальных настроек
     * @returns {Promise<Object>} Результат загрузки
     */
    async getGlobalSettings() {
        logDebug('SettingsService', 'Получение глобальных настроек');

        try {
            const response = await this.resource.getGlobalSettings();
            return {
                success: true,
                data: response.data,
                message: 'Глобальные настройки успешно загружены'
            };
        } catch (error) {
            logError('SettingsService', 'Ошибка загрузки глобальных настроек', error);
            return {
                success: false,
                error: error.message,
                message: 'Не удалось загрузить глобальные настройки'
            };
        }
    }

    /**
     * Обновление глобальных настроек
     * @param {Object} settings - Настройки
     * @returns {Promise<Object>} Результат обновления
     */
    async updateGlobalSettings(settings) {
        logDebug('SettingsService', 'Обновление глобальных настроек', { settings });

        try {
            const response = await this.resource.updateGlobalSettings(settings);
            return {
                success: true,
                data: response.data,
                message: 'Глобальные настройки успешно обновлены'
            };
        } catch (error) {
            logError('SettingsService', 'Ошибка обновления глобальных настроек', error);
            return {
                success: false,
                error: error.message,
                message: 'Не удалось обновить глобальные настройки'
            };
        }
    }

    /**
     * Сброс глобальных настроек
     * @returns {Promise<Object>} Результат сброса
     */
    async resetGlobalSettings() {
        logDebug('SettingsService', 'Сброс глобальных настроек');

        try {
            const response = await this.resource.resetGlobalSettings();
            return {
                success: true,
                data: response.data,
                message: 'Глобальные настройки успешно сброшены'
            };
        } catch (error) {
            logError('SettingsService', 'Ошибка сброса глобальных настроек', error);
            return {
                success: false,
                error: error.message,
                message: 'Не удалось сбросить глобальные настройки'
            };
        }
    }
}

export default SettingsService;
