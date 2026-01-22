/**
 * Утилиты для работы с устройствами
 * Все вычисления перенесены сюда для избежания дублирования кода
 */

import { useSmartLightStore } from '@/components/SmartLight/stores/smartLightStore.js';

const store = useSmartLightStore();

/**
 * Рассчитывает минимальное напряжение для устройства
 * @param {string} deviceId - ID устройства
 * @returns {number} Минимальное напряжение
 */
export const calculateMinVoltage = (deviceId) => {
    if (!deviceId) {
        console.warn('[deviceUtils] deviceId не указан');
        return 2.5;
    }

    try {
        const device = store.getDevice(deviceId);
        if (!device) return 2.5;

        // Типы аккумуляторов
        const batteryTypes = {
            'li-ion-18650': 2.5,
            'li-ion-21700': 2.5,
            'li-po': 3.0,
            'lead-acid': 1.8,
            'other': 2.0
        };

        const batteryType = device.battery_type_id || 'li-ion-18650';
        const min = batteryTypes[batteryType] || batteryTypes.other;

        console.debug('[deviceUtils] Вычисление минимального напряжения', {
            deviceId,
            batteryType,
            minVoltage: min
        });

        return min;
    } catch (e) {
        console.error('[deviceUtils] Ошибка вычисления минимального напряжения', e);
        return 2.5;
    }
};

/**
 * Рассчитывает максимальное напряжение для устройства
 * @param {string} deviceId - ID устройства
 * @returns {number} Максимальное напряжение
 */
export const calculateMaxVoltage = (deviceId) => {
    if (!deviceId) {
        console.warn('[deviceUtils] deviceId не указан');
        return 4.3;
    }

    try {
        const device = store.getDevice(deviceId);
        if (!device) return 4.3;

        // Типы аккумуляторов
        const batteryTypes = {
            'li-ion-18650': 4.3,
            'li-ion-21700': 4.3,
            'li-po': 4.3,
            'lead-acid': 2.4,
            'other': 4.0
        };

        const batteryType = device.battery_type_id || 'li-ion-18650';
        const max = batteryTypes[batteryType] || batteryTypes.other;

        console.debug('[deviceUtils] Вычисление максимального напряжения', {
            deviceId,
            batteryType,
            maxVoltage: max
        });

        return max;
    } catch (e) {
        console.error('[deviceUtils] Ошибка вычисления максимального напряжения', e);
        return 4.3;
    }
};

/**
 * Рассчитывает критическое напряжение для устройства
 * @param {string} deviceId - ID устройства
 * @returns {number} Критическое напряжение
 */
export const calculateCriticalVoltage = (deviceId) => {
    if (!deviceId) {
        console.warn('[deviceUtils] deviceId не указан');
        return 3.0;
    }

    try {
        const device = store.getDevice(deviceId);
        if (!device) return 3.0;

        // Типы аккумуляторов
        const batteryTypes = {
            'li-ion-18650': 3.0,
            'li-ion-21700': 3.0,
            'li-po': 3.2,
            'lead-acid': 2.0,
            'other': 2.8
        };

        const batteryType = device.battery_type_id || 'li-ion-18650';
        const critical = batteryTypes[batteryType] || batteryTypes.other;

        console.debug('[deviceUtils] Вычисление критического напряжения', {
            deviceId,
            batteryType,
            criticalVoltage: critical
        });

        return critical;
    } catch (e) {
        console.error('[deviceUtils] Ошибка вычисления критического напряжения', e);
        return 3.0;
    }
};

/**
 * Рассчитывает позицию критического порога в процентах
 * @param {Object} device - Объект устройства
 * @returns {number} Позиция в процентах
 */
export const calculateCriticalThresholdPosition = (device) => {
    if (!device || !device.device_id) {
        console.warn('[deviceUtils] Устройство не указано для вычисления позиции критического порога');
        return 0;
    }

    try {
        const min = calculateMinVoltage(device.device_id);
        const max = calculateMaxVoltage(device.device_id);
        const critical = calculateCriticalVoltage(device.device_id);

        const position = ((critical - min) / (max - min)) * 100;

        console.debug('[deviceUtils] Вычисление позиции критического порога', {
            deviceId: device.device_id,
            min,
            max,
            critical,
            position
        });

        return position;
    } catch (e) {
        console.error('[deviceUtils] Ошибка вычисления позиции критического порога', e);
        return 0;
    }
};

/**
 * Рассчитывает нормальный прогресс
 * @param {Object} device - Объект устройства
 * @returns {number} Прогресс в процентах
 */
export const calculateBatteryNormalProgress = (device) => {
    if (!device || !device.device_id) {
        console.warn('[deviceUtils] Устройство не указано для вычисления нормального прогресса');
        return 0;
    }

    try {
        const min = calculateMinVoltage(device.device_id);
        const max = calculateMaxVoltage(device.device_id);
        const critical = calculateCriticalVoltage(device.device_id);
        const voltage = device.voltage || 3.7;

        console.debug('[deviceUtils] Вычисление нормального прогресса', {
            deviceId: device.device_id,
            min,
            max,
            critical,
            voltage
        });

        if (voltage <= critical) {
            return 0;
        }

        const normalVoltage = voltage - critical;
        const maxNormalVoltage = max - critical;
        return Math.min(100, Math.max(0, (normalVoltage / maxNormalVoltage) * 100));
    } catch (e) {
        console.error('[deviceUtils] Ошибка вычисления нормального прогресса', e);
        return 0;
    }
};

/**
 * Рассчитывает критический прогресс
 * @param {Object} device - Объект устройства
 * @returns {number} Прогресс в процентах
 */
export const calculateBatteryCriticalProgress = (device) => {
    if (!device || !device.device_id) {
        console.warn('[deviceUtils] Устройство не указано для вычисления критического прогресса');
        return 0;
    }

    try {
        const min = calculateMinVoltage(device.device_id);
        const max = calculateMaxVoltage(device.device_id);
        const critical = calculateCriticalVoltage(device.device_id);
        const voltage = device.voltage || 3.7;

        console.debug('[deviceUtils] Вычисление критического прогресса', {
            deviceId: device.device_id,
            min,
            max,
            critical,
            voltage
        });

        if (voltage >= critical) {
            return 0;
        }

        const criticalVoltageValue = critical - voltage;
        const criticalVoltageRange = critical - min;
        return Math.min(100, Math.max(0, (criticalVoltageValue / criticalVoltageRange) * 100));
    } catch (e) {
        console.error('[deviceUtils] Ошибка вычисления критического прогресса', e);
        return 0;
    }
};

/**
 * Рассчитывает позицию текущего уровня
 * @param {Object} device - Объект устройства
 * @returns {number} Позиция в процентах
 */
export const calculateCurrentLevelPosition = (device) => {
    if (!device || !device.device_id) {
        console.warn('[deviceUtils] Устройство не указано для вычисления позиции текущего уровня');
        return 0;
    }

    try {
        const min = calculateMinVoltage(device.device_id);
        const max = calculateMaxVoltage(device.device_id);
        const voltage = device.voltage || 3.7;

        const position = ((voltage - min) / (max - min)) * 100;

        console.debug('[deviceUtils] Вычисление позиции текущего уровня', {
            deviceId: device.device_id,
            min,
            max,
            voltage,
            position
        });

        return position;
    } catch (e) {
        console.error('[deviceUtils] Ошибка вычисления позиции текущего уровня', e);
        return 0;
    }
};

/**
 * Рассчитывает тип аккумулятора
 * @param {Object} device - Объект устройства
 * @returns {string} Тип аккумулятора
 */
export const calculateBatteryType = (device) => {
    if (!device || !device.device_id) {
        console.warn('[deviceUtils] Устройство не указано для определения типа аккумулятора');
        return 'Нормальный режим';
    }

    try {
        const voltage = device.voltage || 3.7;
        let name;
        if (voltage < 3.0) name = 'Критический режим';
        else if (voltage < 3.4) name = 'Внимание';
        else name = 'Нормальный режим';

        console.debug('[deviceUtils] Определение типа аккумулятора', {
            deviceId: device.device_id,
            voltage,
            name
        });

        return name;
    } catch (e) {
        console.error('[deviceUtils] Ошибка определения типа аккумулятора', e);
        return 'Нормальный режим';
    }
};
