/**
 * ============================================================================
 * APP DEVICE UTILS — БАЗОВЫЕ УТИЛИТЫ УСТРОЙСТВ
 * ============================================================================
 * 📁 Путь: utils/appDeviceUtils.js
 * ✅ ТОЛЬКО pure функции — НЕТ store, НЕТ API вызовов!
 * ✅ Отвечает за: расчёты напряжения, цвета, прогресса батареи
 * ============================================================================
 */

import { getBatteryTypeById } from '@/components/SmartLight/stores/smartlight/types/batteryTypes.js';

/**
 * Расчет цвета батареи
 * @param {Object} device - Устройство
 * @returns {string} HEX цвет
 */
export const calculateBatteryColor = (device) => {
    if (!device) return '#67c23a';

    const voltage = device.voltage || 3.7;
    const criticalVoltage = device.critical_voltage || 3.0;

    if (voltage < criticalVoltage) return '#f56c6c';
    if (voltage < criticalVoltage + 0.3) return '#e6a23c';
    return '#67c23a';
};

/**
 * Расчет критического прогресса батареи
 * @param {Object} device - Устройство
 * @returns {number} Прогресс в процентах
 */
export const calculateBatteryCriticalProgress = (device) => {
    if (!device) return 0;

    const minVoltage = 2.5;
    const maxVoltage = 4.3;
    const voltage = device.voltage || 3.7;

    return Math.min(100, Math.max(0, ((voltage - minVoltage) / (maxVoltage - minVoltage)) * 100));
};

/**
 * Расчет нормального прогресса батареи
 * @param {Object} device - Устройство
 * @returns {number} Прогресс в процентах
 */
export const calculateBatteryNormalProgress = (device) => {
    if (!device) return 0;

    const minVoltage = 2.5;
    const maxVoltage = 4.3;
    const criticalVoltage = device.critical_voltage || 3.0;
    const voltage = device.voltage || 3.7;

    if (voltage < criticalVoltage) return 0;

    return Math.min(100, Math.max(0, ((voltage - criticalVoltage) / (maxVoltage - criticalVoltage)) * 100));
};

/**
 * Расчет позиции критического порога
 * @param {Object} device - Устройство
 * @returns {number} Позиция в процентах
 */
export const calculateCriticalThresholdPosition = (device) => {
    if (!device) return 0;

    const minVoltage = 2.5;
    const maxVoltage = 4.3;
    const criticalVoltage = device.critical_voltage || 3.0;

    return ((criticalVoltage - minVoltage) / (maxVoltage - minVoltage)) * 100;
};

/**
 * Расчет позиции текущего уровня
 * @param {Object} device - Устройство
 * @returns {number} Позиция в процентах
 */
export const calculateCurrentLevelPosition = (device) => {
    if (!device) return 0;

    const minVoltage = 2.5;
    const maxVoltage = 4.3;
    const voltage = device.voltage || 3.7;

    return ((voltage - minVoltage) / (maxVoltage - minVoltage)) * 100;
};

/**
 * Расчет минимального напряжения
 * @param {Object} device - Устройство
 * @returns {number} Минимальное напряжение
 */
export const calculateMinVoltage = (device) => {
    if (!device) return 2.5;
    const batteryType = getBatteryTypeById(device.battery_type_id);
    return batteryType?.minVoltage || 2.5;
};

/**
 * Расчет максимального напряжения
 * @param {Object} device - Устройство
 * @returns {number} Максимальное напряжение
 */
export const calculateMaxVoltage = (device) => {
    if (!device) return 4.3;
    const batteryType = getBatteryTypeById(device.battery_type_id);
    return batteryType?.maxVoltage || 4.3;
};

/**
 * Расчет критического напряжения
 * @param {Object} device - Устройство
 * @returns {number} Критическое напряжение
 */
export const calculateCriticalVoltage = (device) => {
    if (!device) return 3.0;
    const batteryType = getBatteryTypeById(device.battery_type_id);
    return batteryType?.criticalVoltage || device.critical_voltage || 3.0;
};

export default {
    calculateBatteryColor,
    calculateBatteryCriticalProgress,
    calculateBatteryNormalProgress,
    calculateCriticalThresholdPosition,
    calculateCurrentLevelPosition,
    calculateMinVoltage,
    calculateMaxVoltage,
    calculateCriticalVoltage
};
