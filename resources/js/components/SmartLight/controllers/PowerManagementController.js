/**
 * ============================================================================
 * POWER MANAGEMENT CONTROLLER — КОНТРОЛЛЕР УПРАВЛЕНИЯ ПИТАНИЕМ
 * ============================================================================
 * 📁 Путь: controllers/PowerManagementController.js
 * ✅ Координация между Components, Services, Store
 * ✅ Отвечает за: расчёт времени, сохранение потребления, проверки
 * ============================================================================
 */

import { PowerService } from '@/components/SmartLight/services/PowerService.js';
import { SettingsController } from '@/components/SmartLight/controllers/SettingsController.js';
import { useSmartlightStore } from '@/components/SmartLight/stores/index.js';
import { logDebug, logError } from '@/components/SmartLight/utils/appLogger.js';

export class PowerManagementController {
    constructor() {
        this.store = useSmartlightStore();
        this.powerService = new PowerService();
        this.settingsController = new SettingsController();
    }

    /**
     * Получает время работы устройства
     * @param {string} deviceId - ID устройства
     * @returns {string} форматированное время
     */
    getDeviceRuntime(deviceId) {
        try {
            logDebug('PowerManagementController', 'Запрос времени работы', { deviceId });
            return this.powerService.calculateRuntime(deviceId);
        } catch (error) {
            logError('PowerManagementController', 'Ошибка получения времени работы', error);
            return 'N/A';
        }
    }

    /**
     * Сохраняет потребление устройства
     * @param {string} deviceId - ID устройства
     * @param {number} consumption_mA - Потребление в мА
     * @returns {Promise<Object>} результат
     */
    async saveDeviceConsumption(deviceId, consumption_mA) {
        try {
            logDebug('PowerManagementController', 'Сохранение потребления', {
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
                //   ОБНОВЛЯЕМ STORE ДЛЯ РЕАКТИВНОСТИ
                const updatedDevice = {
                    ...device,
                    power_config: updatedPowerConfig
                };
                this.store.deviceUpdateDevice(updatedDevice);

                logDebug('PowerManagementController', 'Потребление сохранено', {
                    deviceId, consumption_mA
                });

                return { success: true, message: 'Потребление сохранено' };
            }

            return { success: false, message: response.message || 'Ошибка сохранения' };
        } catch (error) {
            logError('PowerManagementController', 'Ошибка сохранения потребления', error);
            return { success: false, message: error.message };
        }
    }

    /**
     * Сохраняет настройки управления питанием
     * @param {string} deviceId - ID устройства
     * @param {Object} settings - Настройки
     * @returns {Promise<Object>} результат
     */
    async savePowerManagementSettings(deviceId, settings) {
        try {
            logDebug('PowerManagementController', 'Сохранение настроек питания', {
                deviceId, settings
            });

            const response = await this.store.deviceUpdateDeviceSettings(deviceId, settings);

            if (response.success) {
                //   ОБНОВЛЯЕМ STORE ДЛЯ РЕАКТИВНОСТИ
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
            logError('PowerManagementController', 'Ошибка сохранения настроек', error);
            return { success: false, message: error.message };
        }
    }

    /**
     * Получает потребление устройства
     * @param {string} deviceId - ID устройства
     * @returns {number} потребление в мА
     */
    getDeviceConsumption(deviceId) {
        return this.powerService.getDeviceConsumption(deviceId);
    }

    /**
     * Получает потребление в Wh
     * @param {string} deviceId - ID устройства
     * @returns {number} потребление в Wh
     */
    getPowerConsumptionWh(deviceId) {
        return this.powerService.calculatePowerConsumptionWh(deviceId);
    }

    /**
     * Получает цвет батареи
     * @param {string} deviceId - ID устройства
     * @returns {string} HEX цвет
     */
    getBatteryColor(deviceId) {
        return this.powerService.getBatteryColor(deviceId);
    }

    /**
     * Проверяет совместимость источника питания
     * @param {string} deviceId - ID устройства
     * @param {string} supplyId - ID источника питания
     * @returns {Object} результат проверки
     */
    checkPowerSupplyCompatibility(deviceId, supplyId) {
        return this.powerService.checkPowerSupplyCompatibility(deviceId, supplyId);
    }
}

export default PowerManagementController;
