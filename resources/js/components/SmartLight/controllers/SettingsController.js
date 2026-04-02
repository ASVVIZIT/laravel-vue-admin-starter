/**
 * ============================================================================
 * SETTINGS CONTROLLER — КОНТРОЛЛЕР ДЛЯ УПРАВЛЕНИЯ НАСТРОЙКАМИ
 * ============================================================================
 * 📁 Путь: controllers/SettingsController.js
 * ✅ Координация настроек
 * ✅ Отвечает за: загрузку, сохранение, сброс настроек
 * ============================================================================
 */

import { SettingsService } from '@/components/SmartLight/services/SettingsService.js';
import { StorageService } from '@/components/SmartLight/services/StorageService.js';
import { useSmartlightStore } from '@/components/SmartLight/stores/index.js';
import { logDebug, logError } from '@/components/SmartLight/utils/appLogger.js';

export class SettingsController {
    constructor() {
        this.store = useSmartlightStore();
        this.settingsService = new SettingsService();
        this.storageService = new StorageService();
    }

    /**
     * Загрузка настроек устройства
     * @param {string} deviceId - ID устройства
     * @returns {Promise<Object>} Настройки
     */
    async loadSettings(deviceId) {
        logDebug('SettingsController', 'Загрузка настроек', { deviceId });
        try {
            let settings;
            try {
                const response = await this.settingsService.getDeviceSettings(deviceId);
                if (response.success) {
                    settings = response.data;
                    this.storageService.saveDeviceSettings(deviceId, settings);
                }
            } catch (apiError) {
                logDebug('SettingsController', 'API ошибка, используем localStorage');
            }

            if (!settings) {
                settings = this.storageService.getDeviceSettings(deviceId);
            }

            if (settings) {
                const device = this.store.deviceGetDevice(deviceId);
                if (device) {
                    this.store.deviceUpdateDevice({ ...device, ...settings });
                }
            }

            return settings;
        } catch (error) {
            logError('SettingsController', 'Ошибка загрузки настроек', error);
            throw error;
        }
    }

    /**
     * Сохранение настроек устройства
     * @param {string} deviceId - ID устройства
     * @param {Object} settings - Настройки
     * @returns {Promise<Object>} Результат сохранения
     */
    async saveSettings(deviceId, settings) {
        logDebug('SettingsController', 'Сохранение настроек', { deviceId, settings });
        try {
            let updatedSettings;
            try {
                const response = await this.settingsService.updateDeviceSettings(deviceId, settings);
                if (response.success) {
                    updatedSettings = response.data;
                }
            } catch (apiError) {
                logDebug('SettingsController', 'API ошибка');
            }

            if (!updatedSettings) {
                updatedSettings = settings;
            }

            this.storageService.saveDeviceSettings(deviceId, updatedSettings);

            //   ОБНОВЛЯЕМ STORE ДЛЯ РЕАКТИВНОСТИ
            const device = this.store.deviceGetDevice(deviceId);
            if (device) {
                this.store.deviceUpdateDevice({ ...device, ...updatedSettings });
            }

            return updatedSettings;
        } catch (error) {
            logError('SettingsController', 'Ошибка сохранения настроек', error);
            throw error;
        }
    }

    /**
     * Сброс настроек к значениям по умолчанию
     * @param {string} deviceId - ID устройства
     * @returns {Promise<Object>} Настройки по умолчанию
     */
    async resetToDefaults(deviceId) {
        logDebug('SettingsController', 'Сброс настроек', { deviceId });
        try {
            const device = this.store.deviceGetDevice(deviceId);
            if (!device) {
                throw new Error('Устройство не найдено');
            }
            const defaultSettings = this.getDefaultSettings(device);

            let resetSettings;
            try {
                const response = await this.settingsService.resetDeviceSettings(deviceId);
                if (response.success) {
                    resetSettings = response.data;
                }
            } catch (apiError) {
                logDebug('SettingsController', 'API ошибка, используем значения по умолчанию');
            }

            if (!resetSettings) {
                resetSettings = defaultSettings;
            }

            this.storageService.saveDeviceSettings(deviceId, resetSettings);
            this.store.deviceUpdateDevice({ ...device, ...resetSettings });

            logDebug('SettingsController', 'Настройки сброшены', {
                deviceId, settings: resetSettings
            });
            return resetSettings;
        } catch (error) {
            logError('SettingsController', 'Ошибка сброса настроек', error);
            throw error;
        }
    }

    /**
     * Получение настроек по умолчанию
     * @param {Object} device - Устройство
     * @returns {Object} Настройки по умолчанию
     */
    getDefaultSettings(device) {
        return {
            critical_voltage: device.critical_voltage || 3.0,
            sleep_interval: device.sleep_interval || 600,
            emergency_sleep_interval: device.emergency_sleep_interval || 3600,
            battery_group_config: {
                enabled: false,
                type: 'series',
                count: 1,
                connections: []
            },
            updated_at: new Date().toISOString()
        };
    }
}

export default SettingsController;
