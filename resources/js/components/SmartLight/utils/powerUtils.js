/**
 * Утилиты для работы с питанием
 *
 * Содержит функции для расчета параметров питания
 *
 * @file utils/powerUtils.js
 */

import { useSmartlightStore } from '@/components/SmartLight/stores';
import { logDebug, logError } from '@/components/SmartLight/utils/appLogger';

// Получаем единый стор
const store = useSmartlightStore();

/**
 * Рассчитывает время работы контроллера в автономном режиме
 *
 * @param {string} deviceId - ID устройства
 * @returns {number} время работы в часах
 */
export const calculateControllerRuntime = (deviceId) => {
    logDebug('PowerUtils', 'Расчет времени работы контроллера', { deviceId });

    if (!deviceId) {
        logDebug('PowerUtils', 'deviceId не определен');
        return 0;
    }

    const device = store.deviceGetDevice(deviceId);
    if (!device) {
        logDebug('PowerUtils', 'Устройство не найдено', { deviceId });
        return 0;
    }

    const batteryType = store.typesGetBatteryTypeById(device.battery_type_id);
    if (!batteryType) {
        logDebug('PowerUtils', 'Тип аккумулятора не найден', {
            battery_type_id: device.battery_type_id
        });
        return 0;
    }

    const powerConfig = device.power_config || {
        shared_power_source: true,
        controller_runtime: 86400,
        min_controller_voltage: 2.8,
        power_management_mode: 'balanced'
    };

    // Рассчитываем оставшееся время
    const voltage = device.voltage || 3.7;
    const minVoltage = batteryType.minVoltage;
    const maxVoltage = batteryType.maxVoltage;

    // Проверка на критический уровень
    if (voltage <= minVoltage) {
        return 0;
    }

    const remainingVoltage = voltage - minVoltage;
    const voltageRange = maxVoltage - minVoltage;
    const percentage = remainingVoltage / voltageRange;

    return powerConfig.controller_runtime * percentage;
};

/**
 * Рассчитывает режим энергопотребления
 *
 * @param {string} deviceId - ID устройства
 * @returns {Object} объект с режимом и параметрами
 */
export const calculatePowerManagement = (deviceId) => {
    logDebug('PowerUtils', 'Расчет режима энергопотребления', { deviceId });

    if (!deviceId) {
        logDebug('PowerUtils', 'deviceId не определен');
        return {
            mode: 'conservative',
            controller_runtime: 86400,
            min_controller_voltage: 2.8
        };
    }

    const device = store.deviceGetDevice(deviceId);
    if (!device) {
        logDebug('PowerUtils', 'Устройство не найдено', { deviceId });
        return {
            mode: 'conservative',
            controller_runtime: 86400,
            min_controller_voltage: 2.8
        };
    }

    const powerConfig = device.power_config || {
        shared_power_source: true,
        controller_runtime: 86400,
        min_controller_voltage: 2.8,
        power_management_mode: 'balanced'
    };

    return {
        mode: powerConfig.power_management_mode,
        controller_runtime: powerConfig.controller_runtime,
        min_controller_voltage: powerConfig.min_controller_voltage,
        ...powerConfig
    };
};

/**
 * Рассчитывает энергопотребление лампы
 *
 * @param {string} deviceId - ID устройства
 * @returns {Object} объект с параметрами энергопотребления
 */
export const calculateBulbPowerConsumption = (deviceId) => {
    logDebug('PowerUtils', 'Расчет энергопотребления лампы', { deviceId });

    if (!deviceId) {
        logDebug('PowerUtils', 'deviceId не определен');
        return {
            power: 50,
            current: 20,
            efficiency: 0.2
        };
    }

    const device = store.deviceGetDevice(deviceId);
    if (!device) {
        logDebug('PowerUtils', 'Устройство не найдено', { deviceId });
        return {
            power: 50,
            current: 20,
            efficiency: 0.2
        };
    }

    const bulbType = store.typesGetBulbTypeById(device.bulb_type_id);
    if (!bulbType) {
        logDebug('PowerUtils', 'Тип лампы не найден', {
            bulb_type_id: device.bulb_type_id
        });
        return {
            power: 50,
            current: 20,
            efficiency: 0.2
        };
    }

    // Расчет мощности
    const nominalPower = bulbType.lightEfficiency * 0.01;
    const currentPower = nominalPower * (device.intensity / 100);

    // Расчет тока
    const current = currentPower / (device.voltage || 3.7);

    // Расчет эффективности
    const efficiency = currentPower / nominalPower;

    return {
        power: currentPower,
        current,
        efficiency
    };
};

/**
 * Рассчитывает энергопотребление контроллера
 *
 * @param {string} deviceId - ID устройства
 * @returns {Object} объект с параметрами энергопотребления контроллера
 */
export const calculateControllerPowerConsumption = (deviceId) => {
    logDebug('PowerUtils', 'Расчет энергопотребления контроллера', { deviceId });

    if (!deviceId) {
        logDebug('PowerUtils', 'deviceId не определен');
        return {
            sleepCurrent: 0.05,
            activeCurrent: 0.5,
            powerManagement: 'conservative'
        };
    }

    const device = store.deviceGetDevice(deviceId);
    if (!device) {
        logDebug('PowerUtils', 'Устройство не найдено', { deviceId });
        return {
            sleepCurrent: 0.05,
            activeCurrent: 0.5,
            powerManagement: 'conservative'
        };
    }

    const powerConfig = calculatePowerManagement(deviceId);
    const batteryType = store.typesGetBatteryTypeById(device.battery_type_id);

    // Базовые значения для контроллера
    const baseSleepCurrent = 0.05; // mA
    const baseActiveCurrent = 0.5;  // mA

    // Режимы энергопотребления
    const mode = powerConfig.mode;
    let sleepCurrent, activeCurrent;

    switch (mode) {
        case 'conservative':
            sleepCurrent = baseSleepCurrent * 0.8;
            activeCurrent = baseActiveCurrent * 1.2;
            break;
        case 'balanced':
            sleepCurrent = baseSleepCurrent;
            activeCurrent = baseActiveCurrent;
            break;
        case 'aggressive':
            sleepCurrent = baseSleepCurrent * 1.2;
            activeCurrent = baseActiveCurrent * 0.8;
            break;
        default:
            sleepCurrent = baseSleepCurrent;
            activeCurrent = baseActiveCurrent;
    }

    return {
        sleepCurrent,
        activeCurrent,
        powerManagement: mode,
        controllerRuntime: powerConfig.controller_runtime,
        minControllerVoltage: powerConfig.min_controller_voltage
    };
};

/**
 * Рассчитывает общее энергопотребление системы
 *
 * @param {string} deviceId - ID устройства
 * @returns {Object} объект с общими параметрами энергопотребления
 */
export const calculateTotalPowerConsumption = (deviceId) => {
    logDebug('PowerUtils', 'Расчет общего энергопотребления', { deviceId });

    if (!deviceId) {
        logDebug('PowerUtils', 'deviceId не определен');
        return {
            bulb: { power: 50, current: 20, efficiency: 0.2 },
            controller: { sleepCurrent: 0.05, activeCurrent: 0.5, powerManagement: 'conservative' },
            total: 50.05
        };
    }

    const bulbPower = calculateBulbPowerConsumption(deviceId);
    const controllerPower = calculateControllerPowerConsumption(deviceId);

    // Рассчитываем общее энергопотребление
    const device = store.deviceGetDevice(deviceId);
    const totalPower = {
        bulb: bulbPower,
        controller: controllerPower,
        total: bulbPower.power + controllerPower.activeCurrent * (device?.voltage || 3.7),
        totalSleep: bulbPower.power * 0.05 + controllerPower.sleepCurrent * (device?.voltage || 3.7)
    };

    return totalPower;
};

/**
 * Рассчитывает эффективность энергопотребления
 *
 * @param {string} deviceId - ID устройства
 * @returns {Object} объект с параметрами эффективности
 */
export const calculatePowerEfficiency = (deviceId) => {
    logDebug('PowerUtils', 'Расчет эффективности энергопотребления', { deviceId });

    if (!deviceId) {
        logDebug('PowerUtils', 'deviceId не определен');
        return {
            efficiency: 0.85,
            consumptionRate: 0.1,
            runtimeEstimate: 0
        };
    }

    const device = store.deviceGetDevice(deviceId);
    if (!device) {
        logDebug('PowerUtils', 'Устройство не найдено', { deviceId });
        return {
            efficiency: 0.85,
            consumptionRate: 0.1,
            runtimeEstimate: 0
        };
    }

    const batteryType = store.typesGetBatteryTypeById(device.battery_type_id);
    const powerConfig = device.power_config || {
        shared_power_source: true,
        controller_runtime: 86400,
        min_controller_voltage: 2.8,
        power_management_mode: 'balanced'
    };

    // Среднее потребление (из ваших замеров)
    const lightCurrent = 40; // mA
    const espCurrent = 0.5;  // mA

    // Расчет эффективности
    const totalCurrent = lightCurrent + espCurrent;
    const efficiency = (lightCurrent / totalCurrent) * 0.85;

    // Расчет суточного потребления
    const dailyConsumption = (lightCurrent * 10) + (espCurrent * 24);

    // Расчет времени работы
    const capacity = device.capacity || batteryType.nominalCapacity;
    const remainingCapacity = capacity * ((device.voltage - batteryType.minVoltage) /
        (batteryType.maxVoltage - batteryType.minVoltage));
    const runtimeEstimate = remainingCapacity / dailyConsumption;

    return {
        efficiency: Math.round(efficiency * 100) / 100,
        consumptionRate: dailyConsumption,
        runtimeEstimate,
        ...powerConfig
    };
};

/**
 * Проверяет совместимость источника питания с устройством
 *
 * @param {string} supplyId - ID источника питания
 * @param {string} deviceId - ID устройства
 * @returns {Object} объект с результатом проверки
 */
export const checkPowerSupplyCompatibility = (supplyId, deviceId) => {
    logDebug('PowerUtils', 'Проверка совместимости источника питания', { supplyId, deviceId });

    if (!supplyId || !deviceId) {
        logDebug('PowerUtils', 'supplyId или deviceId не определены');
        return {
            compatible: false,
            message: 'supplyId или deviceId не определены'
        };
    }

    const device = store.deviceGetDevice(deviceId);
    const powerSupply = store.typesGetPowerSupplyById(supplyId);

    if (!device || !powerSupply) {
        logDebug('PowerUtils', 'Устройство или источник питания не найдены');
        return {
            compatible: false,
            message: 'Устройство или источник питания не найдены'
        };
    }

    // Проверяем совместимость напряжения
    const deviceVoltage = device.voltage || 3.7;
    const supplyVoltageRange = powerSupply.voltageRange;

    const isCompatible = deviceVoltage >= supplyVoltageRange.min &&
        deviceVoltage <= supplyVoltageRange.max;

    return {
        compatible: isCompatible,
        message: isCompatible ? 'Источник питания совместим' : 'Несовместимость по напряжению',
        details: {
            deviceVoltage,
            supplyVoltageRange
        }
    };
};
