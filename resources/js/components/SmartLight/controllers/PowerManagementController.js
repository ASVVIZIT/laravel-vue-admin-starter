import { DeviceController } from '@/components/SmartLight/controllers/DeviceController';
import { SettingsController } from '@/components/SmartLight/controllers/SettingsController';
import { logDebug, logError } from '@/components/SmartLight/api/utils/logger';
import { PowerService } from '@/components/SmartLight/services/PowerService';
import { validateDeviceSettings } from '@/components/SmartLight/utils/validators';

export class PowerManagementController {
    constructor() {
        this.deviceController = new DeviceController();
        this.settingsController = new SettingsController();
        this.powerService = new PowerService();
        this.powerManagement = {
            sharedPowerSource: true,
            controllerRuntime: 86400, // 24 часа в секундах
            minControllerVoltage: 2.8,
            powerManagementMode: 'conservative'
        };
    }

    /**
     * Получение настроек управления питанием
     */
    getPowerManagementSettings(deviceId) {
        logDebug('PowerManagementController', 'Получение настроек управления питанием', { deviceId });

        const device = this.deviceController.getDevice(deviceId);
        return device?.settings?.power_config || this.powerManagement;
    }

    /**
     * Сохранение настроек управления питанием
     */
    async savePowerManagementSettings(deviceId, settings) {
        logDebug('PowerManagementController', 'Сохранение настроек управления питанием', {
            deviceId,
            settings
        });

        try {
            // Валидация настроек
            const validationResult = validateDeviceSettings(deviceId, settings);
            if (!validationResult.valid) {
                logError('PowerManagementController', 'Настройки управления питанием не прошли валидацию', {
                    deviceId,
                    errors: validationResult.errors
                });

                throw new Error(validationResult.errors.join(', '));
            }

            // Обновляем настройки устройства
            const deviceSettings = await this.settingsController.saveSettings(deviceId, {
                power_config: settings
            });

            return {
                success: true,
                message: 'Настройки управления питанием сохранены',
                deviceSettings
            };
        } catch (error) {
            logError('PowerManagementController', 'Ошибка сохранения настроек управления питанием', error);
            return {
                success: false,
                message: error.message || 'Ошибка сохранения настроек управления питанием',
                error: error.message,
                status: error.status || 500
            };
        }
    }

    /**
     * Расчет времени работы
     */
    calculateRuntime(deviceId) {
        logDebug('PowerManagementController', 'Расчет времени работы', { deviceId });

        return this.powerService.calculateRuntime(deviceId);
    }

    /**
     * Расчет параметров питания
     */
    calculatePowerParameters(deviceId) {
        logDebug('PowerManagementController', 'Расчет параметров питания', { deviceId });

        const device = this.deviceController.getDevice(deviceId);
        return this.powerService.calculatePowerParameters(device);
    }

    /**
     * Проверка критического напряжения
     */
    checkCriticalVoltage(deviceId) {
        logDebug('PowerManagementController', 'Проверка критического напряжения', { deviceId });

        const device = this.deviceController.getDevice(deviceId);
        if (!device) {
            logDebug('PowerManagementController', 'Устройство не найдено', { deviceId });
            return {
                success: false,
                message: 'Устройство не найдено',
                status: 404
            };
        }

        const min = this.powerService.calculateMinVoltage(deviceId);
        const max = this.powerService.calculateMaxVoltage(deviceId);
        const critical = this.powerService.calculateCriticalVoltage(deviceId);
        const voltage = device.voltage || 3.7;

        if (voltage <= critical) {
            logDebug('PowerManagementController', 'Критическое напряжение достигнуто', {
                deviceId,
                voltage,
                critical
            });

            return {
                success: true,
                critical: true,
                message: 'Критическое напряжение достигнуто',
                voltage,
                critical
            };
        }

        const percentage = ((voltage - min) / (max - min)) * 100;
        const hours = Math.round(percentage * 10);

        logDebug('PowerManagementController', 'Проверка критического напряжения', {
            deviceId,
            percentage,
            hours,
            voltage,
            critical
        });

        return {
            success: true,
            critical: false,
            voltage,
            critical,
            percentage,
            hours,
            runtime: hours < 1 ? `${hours * 60} мин` : hours < 24 ? `${hours} ч` : `${Math.floor(hours / 24)}дн`
        };
    }

    /**
     * Перевод устройства в спящий режим
     */
    async forceSleep(deviceId) {
        logDebug('PowerManagementController', 'Перевод в спящий режим', { deviceId });

        try {
            const response = await this.deviceController.forceSleep(deviceId);
            return response;
        } catch (error) {
            logError('PowerManagementController', 'Ошибка перевода в спящий режим', error);
            return {
                success: false,
                message: error.message || 'Ошибка перевода в сон',
                error: error.message,
                status: error.status || 500
            };
        }
    }

    /**
     * Пробуждение устройства
     */
    async wakeDevice(deviceId) {
        logDebug('PowerManagementController', 'Пробуждение устройства', { deviceId });

        try {
            const response = await this.deviceController.wakeDevice(deviceId);
            return response;
        } catch (error) {
            logError('PowerManagementController', 'Ошибка пробуждения устройства', error);
            return {
                success: false,
                message: error.message || 'Ошибка пробуждения',
                error: error.message,
                status: error.status || 500
            };
        }
    }

    /**
     * Проверка автономной работы контроллера
     */
    checkControllerRuntime(deviceId) {
        logDebug('PowerManagementController', 'Проверка автономной работы контроллера', { deviceId });

        const device = this.deviceController.getDevice(deviceId);
        const powerConfig = this.getPowerManagementSettings(deviceId);

        if (!device || !powerConfig) {
            return {
                success: false,
                message: 'Устройство или настройки не найдены',
                status: 404
            };
        }

        const currentVoltage = device.voltage;
        const minControllerVoltage = powerConfig.minControllerVoltage;

        // Проверяем, может ли контроллер работать автономно
        if (currentVoltage < minControllerVoltage) {
            return {
                success: false,
                message: 'Напряжение ниже минимального для работы контроллера',
                voltage: currentVoltage,
                minControllerVoltage
            };
        }

        // Расчет времени автономной работы
        const runtime = this.calculateControllerRuntime(deviceId);

        return {
            success: true,
            message: 'Контроллер может работать автономно',
            runtime,
            minControllerVoltage
        };
    }

    /**
     * Расчет времени автономной работы контроллера
     */
    calculateControllerRuntime(deviceId) {
        logDebug('PowerManagementController', 'Расчет времени автономной работы', { deviceId });

        const device = this.deviceController.getDevice(deviceId);
        const powerConfig = this.getPowerManagementSettings(deviceId);

        if (!device || !powerConfig) {
            return 'N/A';
        }

        // Расчет времени работы
        const currentVoltage = device.voltage;
        const minVoltage = powerConfig.minControllerVoltage;
        const maxVoltage = powerConfig.minControllerVoltage * 1.1; // 10% запаса
        const voltageRange = maxVoltage - minVoltage;

        if (currentVoltage <= minVoltage) {
            return 'КРИТ';
        }

        const percentage = ((currentVoltage - minVoltage) / voltageRange) * 100;
        const hours = Math.round(percentage * powerConfig.controllerRuntime / 100);

        return hours < 1 ? `${hours * 60} мин` : hours < 24 ? `${hours} ч` : `${Math.floor(hours / 24)}дн`;
    }

    /**
     * Получение настроек режима управления питанием
     */
    getPowerManagementModeSettings(mode) {
        logDebug('PowerManagementController', 'Получение настроек режима управления питанием', { mode });

        const modes = {
            conservative: {
                controllerSleepInterval: 300, // 5 минут
                deepSleepVoltageThreshold: 3.1,
                wakeUpInterval: 3600 // 1 час
            },
            aggressive: {
                controllerSleepInterval: 60, // 1 минута
                deepSleepVoltageThreshold: 3.0,
                wakeUpInterval: 7200 // 2 часа
            },
            balanced: {
                controllerSleepInterval: 180, // 3 минуты
                deepSleepVoltageThreshold: 3.15,
                wakeUpInterval: 5400 // 1.5 часа
            }
        };

        return modes[mode] || modes.balanced;
    }
}
