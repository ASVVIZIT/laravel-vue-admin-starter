/**
 * ============================================================================
 * POWER MANAGEMENT CONTROLLER — КОНТРОЛЛЕР УПРАВЛЕНИЯ ПИТАНИЕМ
 * ============================================================================
 * 📁 Путь: controllers/PowerManagementController.js
 * ✅ Координация между Components, Services, Store
 * ✅ Рефакторинг: методы получили суффикс Controller(), импорты обновлены на *Utils
 * ============================================================================
 */

import { PowerService } from '@/components/SmartLight/services/PowerService.js';
import { SettingsController } from '@/components/SmartLight/controllers/SettingsController.js';
import { useSmartlightStore } from '@/components/SmartLight/stores/smartlightStore.js';
import { logDebugUtils, logErrorUtils } from '@/components/SmartLight/utils/appLoggerUtils.js';

export class PowerManagementController {
    constructor() {
        this.store = useSmartlightStore();
        this.powerService = new PowerService();
        this.settingsController = new SettingsController();
    }

    /**
     * Получает время работы устройства (суффикс Controller)
     * @param {string} deviceId - ID устройства
     * @returns {string} форматированное время
     */
    getDeviceRuntimeController(deviceId) {
        try {
            logDebugUtils('PowerManagementController', 'Запрос времени работы', { deviceId });
            return this.powerService.calculateRuntimeService(deviceId);
        } catch (error) {
            logErrorUtils('PowerManagementController', 'Ошибка получения времени работы', error);
            return 'N/A';
        }
    }

    /**
     * Сохраняет потребление устройства (суффикс Controller)
     * @param {string} deviceId - ID устройства
     * @param {number} consumption_mA - Потребление в мА
     * @returns {Promise<Object>} результат
     */
    async saveDeviceConsumptionController(deviceId, consumption_mA) {
        try {
            logDebugUtils('PowerManagementController', 'Сохранение потребления', {
                deviceId, consumption_mA
            });

            const device = this.store.deviceGetDevice(deviceId);
            if (!device) {
                return { success: false, message: 'Устройство не найдено' };
            }

            const updatedPowerConfig = {
                ...(device.power_config || {}),
                custom_consumption_mA: Number(consumption_mA),
                base_consumption_mA: Number(consumption_mA)
            };

            const response = await this.store.deviceUpdateDeviceSettings(deviceId, {
                power_config: updatedPowerConfig
            });

            if (response.success) {
                const updatedDevice = {
                    ...device,
                    power_config: updatedPowerConfig
                };
                this.store.deviceUpdateDevice(updatedDevice);

                logDebugUtils('PowerManagementController', 'Потребление сохранено', {
                    deviceId, consumption_mA
                });

                return { success: true, message: 'Потребление сохранено' };
            }

            return { success: false, message: response.message || 'Ошибка сохранения' };
        } catch (error) {
            logErrorUtils('PowerManagementController', 'Ошибка сохранения потребления', error);
            return { success: false, message: error.message };
        }
    }

    /**
     * Сохраняет настройки управления питанием (суффикс Controller)
     * @param {string} deviceId - ID устройства
     * @param {Object} settings - Настройки
     * @returns {Promise<Object>} результат
     */
    async savePowerManagementSettingsController(deviceId, settings) {
        try {
            logDebugUtils('PowerManagementController', 'Сохранение настроек питания', {
                deviceId, settings
            });

            const response = await this.store.deviceUpdateDeviceSettings(deviceId, settings);

            if (response.success) {
                const device = this.store.deviceGetDevice(deviceId);
                if (device) {
                    const updatedDevice = {
                        ...device,
                        ...settings,
                        power_config: settings.power_config,
                        battery_group_config: settings.battery_group_config
                    };
                    this.store.deviceUpdateDevice(updatedDevice);
                }

                return { success: true, message: 'Настройки сохранены' };
            }

            return { success: false, message: response.message || 'Ошибка сохранения' };
        } catch (error) {
            logErrorUtils('PowerManagementController', 'Ошибка сохранения настроек', error);
            return { success: false, message: error.message };
        }
    }

    /**
     * Получает потребление устройства (суффикс Controller)
     * @param {string} deviceId - ID устройства
     * @returns {number} потребление в мА
     */
    getDeviceConsumptionController(deviceId) {
        return this.powerService.getDeviceConsumptionService(deviceId);
    }

    /**
     * Получает потребление в Wh (суффикс Controller)
     * @param {string} deviceId - ID устройства
     * @returns {number} потребление в Wh
     */
    getPowerConsumptionWhController(deviceId) {
        return this.powerService.calculatePowerConsumptionWhService(deviceId);
    }

    /**
     * Получает цвет батареи (суффикс Controller)
     * @param {string} deviceId - ID устройства
     * @returns {string} HEX цвет
     */
    getBatteryColorController(deviceId) {
        return this.powerService.getBatteryColorService(deviceId);
    }

    /**
     * Проверяет совместимость источника питания (суффикс Controller)
     * @param {string} deviceId - ID устройства
     * @param {string} supplyId - ID источника питания
     * @returns {Object} результат проверки
     */
    checkPowerSupplyCompatibilityController(deviceId, supplyId) {
        return this.powerService.checkPowerSupplyCompatibilityService(deviceId, supplyId);
    }
}

export default PowerManagementController;
