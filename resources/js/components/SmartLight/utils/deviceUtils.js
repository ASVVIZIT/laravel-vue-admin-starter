/**
 * Утилиты для работы с устройствами
 *
 * Содержит функции для расчета параметров устройств
 *
 * @file utils/deviceUtils.js
 */

import { useSmartlightStore } from '@/components/SmartLight/stores';
import { logDebug, logError } from '@/components/SmartLight/utils/appLogger';

// Получаем единый стор
const store = useSmartlightStore();

/**
 * Получает устройство из Store
 *
 * @param {string} deviceId - ID устройства
 * @returns {Object|null} устройство или null
 */
export const getDevice = (deviceId) => {
    logDebug('DeviceUtils', 'Получение устройства', { deviceId });

    if (!deviceId) {
        logDebug('DeviceUtils', 'deviceId не определен');
        return null;
    }

    return store.deviceGetDevice(deviceId);
};

/**
 * Получает тип батареи
 *
 * @param {string} batteryTypeId - ID типа батареи
 * @returns {Object} тип батареи
 */
export const getBatteryType = (batteryTypeId) => {
    logDebug('DeviceUtils', 'Получение типа батареи', { batteryTypeId });

    if (!batteryTypeId) {
        logDebug('DeviceUtils', 'batteryTypeId не определен');
        return store.typesGetBatteryTypeById('li-ion-18650');
    }

    const batteryType = store.typesGetBatteryTypeById(batteryTypeId);

    if (!batteryType) {
        logDebug('DeviceUtils', 'Тип аккумулятора не найден', { batteryTypeId });
        return store.typesGetBatteryTypeById('li-ion-18650');
    }

    return batteryType;
};

/**
 * Получает тип лампочки
 *
 * @param {string} bulbTypeId - ID типа лампочки
 * @returns {Object} тип лампочки
 */
export const getBulbType = (bulbTypeId) => {
    logDebug('DeviceUtils', 'Получение типа лампочки', { bulbTypeId });

    if (!bulbTypeId) {
        logDebug('DeviceUtils', 'bulbTypeId не определен');
        return store.typesGetBulbTypeById('classic');
    }

    const bulbType = store.typesGetBulbTypeById(bulbTypeId);

    if (!bulbType) {
        logDebug('DeviceUtils', 'Тип лампы не найден', { bulbTypeId });
        return store.typesGetBulbTypeById('classic');
    }

    return bulbType;
};

/**
 * Рассчитывает минимальное напряжение для устройства
 *
 * @param {string} deviceId - ID устройства
 * @returns {number} минимальное напряжение
 */
export const calculateMinVoltage = (deviceId) => {
    logDebug('DeviceUtils', 'Расчет минимального напряжения', { deviceId });

    if (!deviceId) {
        logDebug('DeviceUtils', 'deviceId не определен');
        return 2.5;
    }

    const device = store.deviceGetDevice(deviceId);
    if (!device) {
        logDebug('DeviceUtils', 'Устройство не найдено', { deviceId });
        return 2.5;
    }

    const batteryType = getBatteryType(device.battery_type_id);
    if (!batteryType) {
        logDebug('DeviceUtils', 'Тип аккумулятора не найден', {
            battery_type_id: device.battery_type_id
        });
        return 2.5;
    }

    const minVoltage = batteryType.minVoltage;

    // Учитываем группировку аккумуляторов
    if (device.battery_group_config?.enabled) {
        switch (device.battery_group_config.type) {
            case 'series':
                return minVoltage * device.battery_group_config.count;
            case 'parallel':
                return minVoltage;
            case 'series_parallel':
                const groups = Math.ceil(device.battery_group_config.count / 2);
                return minVoltage * groups;
            default:
                return minVoltage;
        }
    }

    return minVoltage;
};

/**
 * Рассчитывает максимальное напряжение для устройства
 *
 * @param {string} deviceId - ID устройства
 * @returns {number} максимальное напряжение
 */
export const calculateMaxVoltage = (deviceId) => {
    logDebug('DeviceUtils', 'Расчет максимального напряжения', { deviceId });

    if (!deviceId) {
        logDebug('DeviceUtils', 'deviceId не определен');
        return 4.3;
    }

    const device = store.deviceGetDevice(deviceId);
    if (!device) {
        logDebug('DeviceUtils', 'Устройство не найдено', { deviceId });
        return 4.3;
    }

    const batteryType = getBatteryType(device.battery_type_id);
    if (!batteryType) {
        logDebug('DeviceUtils', 'Тип аккумулятора не найден', {
            battery_type_id: device.battery_type_id
        });
        return 4.3;
    }

    const maxVoltage = batteryType.maxVoltage;

    // Учитываем группировку аккумуляторов
    if (device.battery_group_config?.enabled) {
        switch (device.battery_group_config.type) {
            case 'series':
                return maxVoltage * device.battery_group_config.count;
            case 'parallel':
                return maxVoltage;
            case 'series_parallel':
                const groups = Math.ceil(device.battery_group_config.count / 2);
                return maxVoltage * groups;
            default:
                return maxVoltage;
        }
    }

    return maxVoltage;
};

/**
 * Рассчитывает критическое напряжение для устройства
 *
 * @param {string} deviceId - ID устройства
 * @returns {number} критическое напряжение
 */
export const calculateCriticalVoltage = (deviceId) => {
    logDebug('DeviceUtils', 'Расчет критического напряжения', { deviceId });

    if (!deviceId) {
        logDebug('DeviceUtils', 'deviceId не определен');
        return 3.0;
    }

    const device = store.deviceGetDevice(deviceId);
    if (!device) {
        logDebug('DeviceUtils', 'Устройство не найдено', { deviceId });
        return 3.0;
    }

    const batteryType = getBatteryType(device.battery_type_id);
    if (!batteryType) {
        logDebug('DeviceUtils', 'Тип аккумулятора не найден', {
            battery_type_id: device.battery_type_id
        });
        return 3.0;
    }

    const criticalVoltage = batteryType.criticalVoltage;

    // Учитываем группировку аккумуляторов
    if (device.battery_group_config?.enabled) {
        switch (device.battery_group_config.type) {
            case 'series':
                return criticalVoltage * device.battery_group_config.count;
            case 'parallel':
                return criticalVoltage;
            case 'series_parallel':
                const groups = Math.ceil(device.battery_group_config.count / 2);
                return criticalVoltage * groups;
            default:
                return criticalVoltage;
        }
    }

    return criticalVoltage;
};

/**
 * Рассчитывает позицию критического порога в процентах
 *
 * @param {Object} device - устройство
 * @returns {number} позиция в процентах
 */
export const calculateCriticalThresholdPosition = (device) => {
    if (!device || !device.device_id) {
        logDebug('DeviceUtils', 'Устройство не найдено при расчете позиции критического порога', { device });
        return 0;
    }

    const min = calculateMinVoltage(device.device_id);
    const max = calculateMaxVoltage(device.device_id);
    const critical = calculateCriticalVoltage(device.device_id);

    // Избегаем деления на ноль
    if (max <= min) {
        logDebug('DeviceUtils', 'Ошибка расчета позиции критического порога', { min, max, critical });
        return 0;
    }

    return ((critical - min) / (max - min)) * 100;
};

/**
 * Рассчитывает нормальный прогресс
 *
 * @param {Object} device - устройство
 * @returns {number} прогресс в процентах
 */
export const calculateBatteryNormalProgress = (device) => {
    if (!device || !device.device_id) {
        logDebug('DeviceUtils', 'Устройство не найдено при расчете нормального прогресса', { device });
        return 0;
    }

    const min = calculateMinVoltage(device.device_id);
    const max = calculateMaxVoltage(device.device_id);
    const critical = calculateCriticalVoltage(device.device_id);
    const voltage = Number(device.voltage) || 3.7;

    if (voltage <= critical) return 0;

    const normalVoltage = voltage - critical;
    const maxNormalVoltage = max - critical;

    // Избегаем деления на ноль
    if (maxNormalVoltage <= 0) {
        logDebug('DeviceUtils', 'Ошибка расчета нормального прогресса', { min, max, critical, voltage });
        return 0;
    }

    return Math.min(100, Math.max(0, (normalVoltage / maxNormalVoltage) * 100));
};

/**
 * Рассчитывает критический прогресс
 *
 * @param {Object} device - устройство
 * @returns {number} прогресс в процентах
 */
export const calculateBatteryCriticalProgress = (device) => {
    if (!device || !device.device_id) {
        logDebug('DeviceUtils', 'Устройство не найдено при расчете критического прогресса', { device });
        return 0;
    }

    const min = calculateMinVoltage(device.device_id);
    const max = calculateMaxVoltage(device.device_id);
    const critical = calculateCriticalVoltage(device.device_id);
    const voltage = Number(device.voltage) || 3.7;

    if (voltage >= critical) return 0;

    const criticalVoltageValue = critical - voltage;
    const criticalVoltageRange = critical - min;

    // Избегаем деления на ноль
    if (criticalVoltageRange <= 0) {
        logDebug('DeviceUtils', 'Ошибка расчета критического прогресса', { min, critical, voltage });
        return 0;
    }

    return Math.min(100, Math.max(0, (criticalVoltageValue / criticalVoltageRange) * 100));
};

/**
 * Рассчитывает позицию текущего уровня
 *
 * @param {Object} device - устройство
 * @returns {number} позиция в процентах
 */
export const calculateCurrentLevelPosition = (device) => {
    if (!device || !device.device_id) {
        logDebug('DeviceUtils', 'Устройство не найдено при расчете позиции текущего уровня', { device });
        return 0;
    }

    const min = calculateMinVoltage(device.device_id);
    const max = calculateMaxVoltage(device.device_id);
    const voltage = Number(device.voltage) || 3.7;

    // Избегаем деления на ноль
    if (max <= min) {
        logDebug('DeviceUtils', 'Ошибка расчета позиции текущего уровня', { min, max, voltage });
        return 0;
    }

    return ((voltage - min) / (max - min)) * 100;
};

/**
 * Рассчитывает цвет нормального уровня
 *
 * @param {Object} device - устройство
 * @returns {string} цвет
 */
export const calculateBatteryColor = (device) => {
    if (!device) {
        logDebug('DeviceUtils', 'Устройство не найдено при расчете цвета нормального уровня');
        return '#67c23a';
    }

    const voltage = Number(device.voltage) || 3.7;
    const criticalVoltage = calculateCriticalVoltage(device.device_id);

    if (voltage < criticalVoltage) {
        return '#f56c6c';
    }
    if (voltage < criticalVoltage + 0.2) {
        return '#e6a23c';
    }
    return '#67c23a';
};

/**
 * Рассчитывает цвет критического уровня
 *
 * @param {Object} device - устройство
 * @returns {string} цвет
 */
export const calculateCriticalColor = (device) => {
    if (!device) {
        logDebug('DeviceUtils', 'Устройство не найдено при расчете цвета критического уровня');
        return '#ffcccb';
    }

    const voltage = Number(device.voltage) || 3.7;
    const criticalVoltage = calculateCriticalVoltage(device.device_id);

    if (voltage < criticalVoltage) {
        return '#f56c6c';
    }
    if (voltage < criticalVoltage + 0.2) {
        return '#faa7a7';
    }
    return '#ffcccb';
};

/**
 * Рассчитывает время работы
 *
 * @param {Object} device - устройство
 * @returns {string} время работы в формате "X ч Y мин" или "КРИТ"
 */
export const calculateDeviceRuntime = (device) => {
    if (!device) {
        logDebug('DeviceUtils', 'Устройство не определено при расчете времени работы');
        return 'N/A';
    }

    const batteryType = getBatteryType(device.battery_type_id);
    if (!batteryType) {
        logDebug('DeviceUtils', 'Тип аккумулятора не найден', {
            battery_type_id: device.battery_type_id
        });
        return 'N/A';
    }

    const currentVoltage = Number(device.voltage) || 3.7;
    const capacity = Number(device.capacity) || Number(batteryType.nominalCapacity) || 3500;

    // Проверка на критический уровень
    if (currentVoltage <= batteryType.criticalVoltage) {
        return 'КРИТИЧЕСКИЙ ЗАРЯД';
    }

    // Среднее потребление (из ваших замеров)
    const lightCurrent = 40; // mA
    const espCurrent = 0.5;  // mA

    // Расчёт оставшейся ёмкости
    const remainingCapacity = capacity * ((currentVoltage - batteryType.minVoltage) /
        (batteryType.maxVoltage - batteryType.minVoltage));

    // Суточное потребление
    const dailyConsumption = (lightCurrent * 10) + (espCurrent * 24);

    // Расчёт часов
    const hours = remainingCapacity / dailyConsumption;

    return formatRuntime(hours);
};

/**
 * Форматирует время работы
 *
 * @param {number} hours - количество часов
 * @returns {string} отформатированное время
 */
const formatRuntime = (hours) => {
    if (hours < 1) {
        return `${Math.round(hours * 60)} мин`;
    }
    if (hours < 24) {
        return `${Math.round(hours)} ч`;
    }
    return `${Math.floor(hours / 24)} дн`;
};

/**
 * Рассчитывает безопасный диапазон интенсивности
 *
 * @param {Object} device - устройство
 * @returns {Object} объект с min и max интенсивности
 */
export const calculateSafeIntensityRange = (device) => {
    if (!device) {
        logDebug('DeviceUtils', 'Устройство не найдено при расчете безопасного диапазона');
        return { min: 0, max: 100 };
    }

    const bulbType = getBulbType(device.bulb_type_id);
    return {
        min: bulbType.minIntensity,
        max: bulbType.maxIntensity
    };
};
