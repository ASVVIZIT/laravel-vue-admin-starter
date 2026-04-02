/**
 * ============================================================================
 * POWER SERVICE — СЕРВИС ДЛЯ РАСЧЕТА ПИТАНИЯ
 * ============================================================================
 * 📁 Путь: services/PowerService.js
 * ✅ Бизнес-логика + доступ к store
 * ✅ Отвечает за: расчёт времени работы, потребления, цвета батареи
 * ============================================================================
 */

import { useSmartlightStore } from '@/components/SmartLight/stores/index.js';
import {
    calculateDeviceRuntimeHours,
    calculateDeviceRuntime,
    calculatePowerConsumptionWh
} from '@/components/SmartLight/utils/appPowerUtils.js';
import {
    calculateBatteryColor,
    calculateBatteryCriticalProgress,
    calculateBatteryNormalProgress
} from '@/components/SmartLight/utils/appDeviceUtils.js';
import { logDebug, logError } from '@/components/SmartLight/utils/appLogger.js';

export class PowerService {
    constructor() {
        this.store = useSmartlightStore();
    }

    /**
     * Рассчитывает время работы устройства
     * @param {string} deviceId - ID устройства
     * @returns {string} форматированное время
     */
    calculateRuntime(deviceId) {
        try {
            const device = this.store.deviceGetDevice(deviceId);
            if (!device) {
                logError('PowerService', 'Устройство не найдено', { deviceId });
                return 'N/A';
            }

            const batteryType = this.store.typesGetBatteryTypeById(device.battery_type_id);
            if (!batteryType) {
                logError('PowerService', 'Тип батареи не найден', { deviceId });
                return 'N/A';
            }

            return calculateDeviceRuntime(device, batteryType);
        } catch (error) {
            logError('PowerService', 'Ошибка расчета времени работы', error);
            return 'N/A';
        }
    }

    /**
     * Рассчитывает потребление в Ватт-часах
     * @param {string} deviceId - ID устройства
     * @returns {number} потребление в Wh
     */
    calculatePowerConsumptionWh(deviceId) {
        const device = this.store.deviceGetDevice(deviceId);
        if (!device) return 0;
        return calculatePowerConsumptionWh(device);
    }

    /**
     * Получает потребление устройства (мА)
     * @param {string} deviceId - ID устройства
     * @returns {number} потребление в мА
     */
    getDeviceConsumption(deviceId) {
        const device = this.store.deviceGetDevice(deviceId);
        if (!device) return 100;
        return device.power_config?.custom_consumption_mA ||
            device.power_config?.base_consumption_mA || 100;
    }

    /**
     * Получает цвет батареи
     * @param {string} deviceId - ID устройства
     * @returns {string} HEX цвет
     */
    getBatteryColor(deviceId) {
        const device = this.store.deviceGetDevice(deviceId);
        if (!device) return '#67c23a';
        return calculateBatteryColor(device);
    }

    /**
     * Получает прогресс батареи (нормальный)
     * @param {string} deviceId - ID устройства
     * @returns {number} прогресс в %
     */
    getBatteryNormalProgress(deviceId) {
        const device = this.store.deviceGetDevice(deviceId);
        if (!device) return 0;
        return calculateBatteryNormalProgress(device);
    }

    /**
     * Получает прогресс батареи (критический)
     * @param {string} deviceId - ID устройства
     * @returns {number} прогресс в %
     */
    getBatteryCriticalProgress(deviceId) {
        const device = this.store.deviceGetDevice(deviceId);
        if (!device) return 0;
        return calculateBatteryCriticalProgress(device);
    }

    /**
     * Проверяет совместимость источника питания
     * @param {string} deviceId - ID устройства
     * @param {string} supplyId - ID источника питания
     * @returns {Object} результат проверки
     */
    checkPowerSupplyCompatibility(deviceId, supplyId) {
        const device = this.store.deviceGetDevice(deviceId);
        const powerSupply = this.store.typesGetPowerSupplyById(supplyId);

        if (!device || !powerSupply) {
            return { compatible: false, message: 'Не найдено' };
        }

        const deviceVoltage = device.voltage || 3.7;
        const supplyVoltageRange = powerSupply.voltageRange;
        const isCompatible = deviceVoltage >= supplyVoltageRange.min &&
            deviceVoltage <= supplyVoltageRange.max;

        return {
            compatible: isCompatible,
            message: isCompatible ? 'Совместимо' : 'Несовместимо',
            details: { deviceVoltage, supplyVoltageRange }
        };
    }
}

export default PowerService;
