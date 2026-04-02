/**
 * ============================================================================
 * POWER UTILS — УТИЛИТЫ ДЛЯ ПИТАНИЯ
 * ============================================================================
 * 📁 Путь: utils/appPowerUtils.js
 * ✅ ТОЛЬКО pure функции — НЕТ store, НЕТ API вызовов!
 * ✅ Отвечает за: расчёты времени работы, потребления, Wh
 * ============================================================================
 */

import { formatRuntimeWithSettings } from './appFormatters.js';
import { logDebug } from './appLogger.js';

/**
 * Получает потребление устройства (из объекта или по умолчанию)
 * @param {Object} device - Устройство (object, NOT from store)
 * @returns {number} потребление в мА
 */
export const getDeviceConsumption = (device) => {
    if (!device) return 100;

    const powerConfig = device.power_config || {};
    const customConsumption = powerConfig.custom_consumption_mA || powerConfig.base_consumption_mA;

    if (customConsumption && customConsumption > 0) {
        return customConsumption;
    }

    return 100;
};

/**
 * Рассчитывает время работы устройства (В ЧАСАХ)
 * @param {Object} device - Устройство (object)
 * @param {Object} batteryType - Тип батареи (object)
 * @returns {number} время работы в часах
 */
export const calculateDeviceRuntimeHours = (device, batteryType) => {
    if (!device || !batteryType) return 0;

    const totalCapacity = device.capacity || batteryType.nominalCapacity || 3500;
    const intensity = device.intensity || 100;
    const currentVoltage = device.voltage || 3.7;
    const minVoltage = batteryType.minVoltage || 2.5;
    const maxVoltage = batteryType.maxVoltage || 4.3;

    const baseConsumption = getDeviceConsumption(device);
    const currentConsumption = baseConsumption * (intensity / 100);

    const voltageRange = maxVoltage - minVoltage;
    const remainingVoltage = currentVoltage - minVoltage;
    const capacityPercentage = Math.max(0, Math.min(1, remainingVoltage / voltageRange));
    const remainingCapacity = totalCapacity * capacityPercentage;

    const runtimeHours = remainingCapacity / currentConsumption;

    logDebug('appPowerUtils', 'Время работы рассчитано', {
        deviceId: device.device_id,
        runtimeHours
    });

    return runtimeHours;
};

/**
 * Рассчитывает время работы с форматированием
 * @param {Object} device - Устройство
 * @param {Object} batteryType - Тип батареи
 * @returns {string} форматированное время
 */
export const calculateDeviceRuntime = (device, batteryType) => {
    if (!device || !batteryType) return 'N/A';

    const runtimeHours = calculateDeviceRuntimeHours(device, batteryType);
    return formatRuntimeWithSettings(runtimeHours);
};

/**
 * Рассчитывает потребление в Ватт-часах (Wh)
 * @param {Object} device - Устройство
 * @returns {number} потребление в Wh
 */
export const calculatePowerConsumptionWh = (device) => {
    if (!device) return 0;

    const consumption_mA = getDeviceConsumption(device);
    const voltage = device.voltage || 3.7;

    // Wh = (mA × V) / 1000
    return (consumption_mA * voltage) / 1000;
};

/**
 * Рассчитывает потребление за период
 * @param {Object} device - Устройство
 * @param {number} hours - Количество часов
 * @returns {number} потребление в Wh
 */
export const calculatePowerConsumptionForPeriod = (device, hours) => {
    if (!device || !hours) return 0;
    return calculatePowerConsumptionWh(device) * hours;
};

export default {
    getDeviceConsumption,
    calculateDeviceRuntimeHours,
    calculateDeviceRuntime,
    calculatePowerConsumptionWh,
    calculatePowerConsumptionForPeriod
};
