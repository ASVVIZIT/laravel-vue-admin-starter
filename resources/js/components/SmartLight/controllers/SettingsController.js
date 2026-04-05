/**
 * ============================================================================
 * SETTINGS CONTROLLER — КОНТРОЛЛЕР ДЛЯ УПРАВЛЕНИЯ НАСТРОЙКАМИ
 * ============================================================================
 * 📁 Путь: controllers/SettingsController.js
 * ✅ Координация настроек устройств и глобальных настроек
 * ✅ Отвечает за: загрузку, сохранение, сброс настроек
 * ============================================================================
 */

import { SettingsService } from '@/components/SmartLight/services/SettingsService.js';
import { useSmartlightStore } from '@/components/SmartLight/stores/smartlightStore.js';
import { logDebugUtils, logErrorUtils } from '@/components/SmartLight/utils/appLoggerUtils.js';

export class SettingsController {
    constructor() {
        this.store = useSmartlightStore();
        this.settingsService = new SettingsService();
    }

    /**
     * Загрузка глобальных настроек
     * @returns {Promise<Object>} Результат загрузки
     */
    async loadGlobalSettings() {
        logDebugUtils('SettingsController', 'Загрузка глобальных настроек');
        try {
            const result = await this.settingsService.getGlobalSettings();
            if (result.success) {
                // Обновляем стор для реактивности
                this.store.settingsUpdateGlobalSettings(result.data);
                logDebugUtils('SettingsController', 'Глобальные настройки загружены');
                return result.data;
            } else {
                throw new Error(result.message || 'Ошибка загрузки настроек');
            }
        } catch (error) {
            logErrorUtils('SettingsController', 'Ошибка загрузки глобальных настроек', error);
            throw error;
        }
    }

    /**
     * Сохранение глобальных настроек
     * @param {Object} settings - Настройки
     * @returns {Promise<Object>} Результат операции
     */
    async saveGlobalSettings(settings) {
        logDebugUtils('SettingsController', 'Сохранение глобальных настроек', { settings });
        try {
            const result = await this.settingsService.updateGlobalSettings(settings);
            if (result.success) {
                // Обновляем стор для реактивности
                this.store.settingsUpdateGlobalSettings(settings);
                return result;
            } else {
                throw new Error(result.message || 'Ошибка сохранения настроек');
            }
        } catch (error) {
            logErrorUtils('SettingsController', 'Ошибка сохранения глобальных настроек', error);
            throw error;
        }
    }

    /**
     * Сброс глобальных настроек
     * @returns {Promise<Object>} Результат операции
     */
    async resetGlobalSettings() {
        logDebugUtils('SettingsController', 'Сброс глобальных настроек');
        try {
            const result = await this.settingsService.resetGlobalSettings();
            if (result.success) {
                // Сбрасываем в сторе
                this.store.settingsResetGlobalSettings();
                return result;
            } else {
                throw new Error(result.message || 'Ошибка сброса настроек');
            }
        } catch (error) {
            logErrorUtils('SettingsController', 'Ошибка сброса глобальных настроек', error);
            throw error;
        }
    }

    /**
     * Загрузка настроек устройства
     * @param {string} deviceId - ID устройства
     * @returns {Promise<Object>} Результат загрузки
     */
    async loadDeviceSettings(deviceId) {
        logDebugUtils('SettingsController', 'Загрузка настроек устройства', { deviceId });
        try {
            const result = await this.settingsService.getDeviceSettings(deviceId);
            if (result.success) {
                return result.data;
            } else {
                throw new Error(result.message || 'Ошибка загрузки настроек устройства');
            }
        } catch (error) {
            logErrorUtils('SettingsController', 'Ошибка загрузки настроек устройства', error);
            throw error;
        }
    }

    /**
     * Сохранение настроек устройства
     * @param {string} deviceId - ID устройства
     * @param {Object} settings - Настройки
     * @returns {Promise<Object>} Результат операции
     */
    async saveDeviceSettings(deviceId, settings) {
        logDebugUtils('SettingsController', 'Сохранение настроек устройства', { deviceId, settings });
        try {
            const result = await this.settingsService.updateDeviceSettingsStore(deviceId, settings);
            if (result.success) {
                // Обновляем устройство в сторе для реактивности
                const device = this.store.deviceGetDevice(deviceId);
                if (device) {
                    this.store.deviceUpdateDevice({
                        ...device,
                        ...settings
                    });
                }
                return result;
            } else {
                throw new Error(result.message || 'Ошибка сохранения настроек устройства');
            }
        } catch (error) {
            logErrorUtils('SettingsController', 'Ошибка сохранения настроек устройства', error);
            throw error;
        }
    }

    /**
     * Сброс настроек устройства
     * @param {string} deviceId - ID устройства
     * @returns {Promise<Object>} Результат операции
     */
    async resetDeviceSettings(deviceId) {
        logDebugUtils('SettingsController', 'Сброс настроек устройства', { deviceId });
        try {
            const result = await this.settingsService.resetDeviceSettings(deviceId);
            if (result.success) {
                return result;
            } else {
                throw new Error(result.message || 'Ошибка сброса настроек устройства');
            }
        } catch (error) {
            logErrorUtils('SettingsController', 'Ошибка сброса настроек устройства', error);
            throw error;
        }
    }
}

export default SettingsController;
