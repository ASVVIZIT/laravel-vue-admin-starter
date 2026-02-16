import { SettingsService } from '@/components/SmartLight/services/SettingsService';
import { StorageService } from '@/components/SmartLight/services/StorageService';
import { logDebug, logError } from '@/components/SmartLight/api/utils/logger';
import { useDeviceStore, useSettingsStore } from '@/components/SmartLight/stores';

export class SettingsController {
    constructor() {
        this.deviceStore = useDeviceStore();
        this.settingsStore = useSettingsStore();
        this.settingsService = new SettingsService();
        this.storageService = new StorageService();
        this.cache = new Map();
    }

    /**
     * Загрузка настроек устройства
     */
    async loadSettings(deviceId) {
        logDebug('SettingsController', 'Загрузка настроек', { deviceId });

        try {
            // Сначала пытаемся загрузить из API
            let settings;

            try {
                const response = await this.settingsService.getDeviceSettings(deviceId);
                if (response.success) {
                    settings = response.data;
                    // Сохраняем в локальное хранилище
                    this.storageService.saveDeviceSettings(deviceId, settings);
                }
            } catch (apiError) {
                logDebug('SettingsController', 'Ошибка загрузки настроек из API, используем локальное хранилище', { error: apiError.message });
            }

            // Если не удалось загрузить из API, используем локальное хранилище
            if (!settings) {
                settings = this.storageService.getDeviceSettings(deviceId);
            }

            // Если нет настроек ни в API, ни в локальном хранилище, используем значения по умолчанию
            if (!settings) {
                const device = this.deviceStore.actions.getDevice(deviceId);
                if (device) {
                    settings = this.getDefaultSettings(device);
                    // Сохраняем настройки по умолчанию в локальное хранилище
                    this.storageService.saveDeviceSettings(deviceId, settings);
                }
            }

            if (settings) {
                this.cache.set(deviceId, settings);
            }

            logDebug('SettingsController', 'Настройки загружены', {
                deviceId,
                settings
            });

            return settings;
        } catch (error) {
            logError('SettingsController', 'Ошибка загрузки настроек', error);
            throw error;
        }
    }

    /**
     * Сохранение настроек устройства
     */
    async saveSettings(deviceId, settings) {
        logDebug('SettingsController', 'Сохранение настроек', {
            deviceId,
            settings
        });

        try {
            // Валидация настроек
            this.validateSettings(settings);

            // Сохраняем в API
            let updatedSettings;
            try {
                const response = await this.settingsService.updateDeviceSettings(deviceId, settings);
                if (response.success) {
                    updatedSettings = response.data;
                }
            } catch (apiError) {
                logDebug('SettingsController', 'Ошибка сохранения в API, используем локальное хранилище', { error: apiError.message });
            }

            // Если не удалось сохранить в API, используем переданные настройки
            if (!updatedSettings) {
                updatedSettings = settings;
            }

            // Всегда сохраняем в локальное хранилище
            this.storageService.saveDeviceSettings(deviceId, updatedSettings);

            // Обновляем кеш
            this.cache.set(deviceId, updatedSettings);

            logDebug('SettingsController', 'Настройки сохранены', {
                deviceId,
                settings: updatedSettings
            });

            return updatedSettings;
        } catch (error) {
            logError('SettingsController', 'Ошибка сохранения настроек', error);
            throw error;
        }
    }

    /**
     * Сброс настроек к значениям по умолчанию
     */
    async resetToDefaults(deviceId) {
        logDebug('SettingsController', 'Сброс настроек', { deviceId });

        try {
            const device = this.deviceStore.actions.getDevice(deviceId);
            if (!device) {
                throw new Error('Устройство не найдено');
            }

            const defaultSettings = this.getDefaultSettings(device);

            // Сохраняем в API
            let resetSettings;
            try {
                const response = await this.settingsService.resetDeviceSettings(deviceId);
                if (response.success) {
                    resetSettings = response.data;
                }
            } catch (apiError) {
                logDebug('SettingsController', 'Ошибка сброса в API, используем локальное хранилище', { error: apiError.message });
            }

            // Если не удалось сбросить через API, используем настройки по умолчанию
            if (!resetSettings) {
                resetSettings = defaultSettings;
            }

            // Всегда сохраняем в локальное хранилище
            this.storageService.saveDeviceSettings(deviceId, resetSettings);

            // Обновляем состояние в store
            this.deviceStore.actions.updateDeviceSettings(deviceId, resetSettings);

            // Очищаем кеш
            this.cache.delete(deviceId);

            logDebug('SettingsController', 'Настройки сброшены к значениям по умолчанию', {
                deviceId,
                settings: resetSettings
            });

            return resetSettings;
        } catch (error) {
            logError('SettingsController', 'Ошибка сброса настроек', error);
            throw error;
        }
    }

    /**
     * Получение настроек по умолчанию
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

    /**
     * Валидация настроек
     */
    validateSettings(settings) {
        if (!settings) {
            throw new Error('Настройки не могут быть пустыми');
        }

        // Валидация критического напряжения
        if (settings.critical_voltage !== undefined) {
            if (typeof settings.critical_voltage !== 'number') {
                throw new Error('Критическое напряжение должно быть числом');
            }

            if (settings.critical_voltage < 2.5 || settings.critical_voltage > 14.4) {
                throw new Error('Критическое напряжение должно быть в диапазоне 2.5-14.4В');
            }
        }

        // Валидация интервалов
        if (settings.sleep_interval !== undefined) {
            if (typeof settings.sleep_interval !== 'number' || settings.sleep_interval < 60 || settings.sleep_interval > 86400) {
                throw new Error('Интервал сна должен быть числом от 60 до 86400 секунд');
            }
        }

        if (settings.emergency_sleep_interval !== undefined) {
            if (typeof settings.emergency_sleep_interval !== 'number' || settings.emergency_sleep_interval < 300 || settings.emergency_sleep_interval > 86400) {
                throw new Error('Аварийный интервал должен быть числом от 300 до 86400 секунд');
            }
        }

        // Валидация группировки батарей
        if (settings.battery_group_config) {
            if (settings.battery_group_config.enabled) {
                if (!['series', 'parallel', 'series_parallel'].includes(settings.battery_group_config.type)) {
                    throw new Error('Недопустимый тип группировки: ' + settings.battery_group_config.type);
                }

                if (typeof settings.battery_group_config.count !== 'number' || settings.battery_group_config.count < 1 || settings.battery_group_config.count > 15) {
                    throw new Error('Количество батарей должно быть числом от 1 до 15');
                }
            }
        }

        return true;
    }
}
