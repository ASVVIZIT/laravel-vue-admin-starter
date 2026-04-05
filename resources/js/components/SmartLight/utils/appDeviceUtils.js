/**
 * ============================================================================
 * APP DEVICE UTILS — УТИЛИТЫ ДЛЯ РАБОТЫ С УСТРОЙСТВАМИ
 * ============================================================================
 * 📁 Путь: utils/appDeviceUtils.js
 * ✅ Используется: PowerMonitoring.vue, PowerService.js, useDebugPanel.js, useDeviceCalculations.js
 * ✅ Назначение: Расчёты для устройств (прогресс, цвета, время, позиции, вольтаж)
 * ============================================================================
 */

/**
 * ============================================================================
 * РАСЧЁТ НАПРЯЖЕНИЯ (из device или battery type)
 * ============================================================================
 */

/**
 * Получить минимальное напряжение
 * Приоритет: device.min_voltage → batteryType.minVoltage → default (2.5)
 *
 * @param {Object|number} deviceOrValue - Устройство ИЛИ значение
 * @returns {number} Минимальное напряжение
 */
export const calculateMinVoltage = (deviceOrValue) => {
    if (typeof deviceOrValue === 'number') return deviceOrValue;
    if (!deviceOrValue) return 2.5;

    // device.min_voltage (из API)
    if (deviceOrValue.min_voltage !== undefined) return deviceOrValue.min_voltage;

    // batteryType.minVoltage (из store)
    if (deviceOrValue.battery_type?.minVoltage !== undefined) {
        return deviceOrValue.battery_type.minVoltage;
    }

    return 2.5; // Default для Li-Ion
};

/**
 * Получить максимальное напряжение
 * Приоритет: device.max_voltage → batteryType.maxVoltage → default (4.2)
 *
 * @param {Object|number} deviceOrValue - Устройство ИЛИ значение
 * @returns {number} Максимальное напряжение
 */
export const calculateMaxVoltage = (deviceOrValue) => {
    if (typeof deviceOrValue === 'number') return deviceOrValue;
    if (!deviceOrValue) return 4.2;

    if (deviceOrValue.max_voltage !== undefined) return deviceOrValue.max_voltage;

    if (deviceOrValue.battery_type?.maxVoltage !== undefined) {
        return deviceOrValue.battery_type.maxVoltage;
    }

    return 4.2; // Default для Li-Ion
};

/**
 * Получить критическое напряжение
 * Приоритет: device.critical_voltage → batteryType.criticalVoltage → default (3.2)
 *
 * @param {Object|number} deviceOrValue - Устройство ИЛИ значение
 * @returns {number} Критическое напряжение
 */
export const calculateCriticalVoltage = (deviceOrValue) => {
    if (typeof deviceOrValue === 'number') return deviceOrValue;
    if (!deviceOrValue) return 3.2;

    if (deviceOrValue.critical_voltage !== undefined) return deviceOrValue.critical_voltage;

    if (deviceOrValue.battery_type?.criticalVoltage !== undefined) {
        return deviceOrValue.battery_type.criticalVoltage;
    }

    return 3.2; // Default для Li-Ion
};

/**
 * ============================================================================
 * РАСЧЁТ ПОЗИЦИЙ МАРКЕРОВ (для визуализации прогресс-бара)
 * ============================================================================
 */

/**
 * Расчёт позиции критического порога (в %)
 * Показывает где на шкале находится criticalVoltage относительно min-max
 *
 * @param {Object} device - Устройство
 * @returns {number} Позиция от 0 до 100 (%)
 */
export const calculateCriticalThresholdPosition = (device) => {
    if (!device) return 0;

    const minVoltage = calculateMinVoltage(device);
    const maxVoltage = calculateMaxVoltage(device);
    const criticalVoltage = calculateCriticalVoltage(device);

    const totalRange = maxVoltage - minVoltage;
    if (totalRange <= 0) return 0;

    const position = ((criticalVoltage - minVoltage) / totalRange) * 100;
    return Math.min(100, Math.max(0, Math.round(position)));
};

/**
 * Расчёт позиции текущего уровня напряжения (в %)
 * Показывает где на шкале находится текущее voltage относительно min-max
 *
 * @param {Object} device - Устройство
 * @returns {number} Позиция от 0 до 100 (%)
 */
export const calculateCurrentLevelPosition = (device) => {
    if (!device || device.voltage === undefined) return 0;

    const minVoltage = calculateMinVoltage(device);
    const maxVoltage = calculateMaxVoltage(device);
    const voltage = device.voltage;

    const totalRange = maxVoltage - minVoltage;
    if (totalRange <= 0) return 0;

    const position = ((voltage - minVoltage) / totalRange) * 100;
    return Math.min(100, Math.max(0, Math.round(position)));
};

/**
 * ============================================================================
 * РАСЧЁТ ПРОГРЕССА БАТАРЕИ
 * ============================================================================
 */

/**
 * Расчёт нормального прогресса батареи
 * Показывает прогресс в "нормальном" диапазоне (от criticalVoltage до maxVoltage)
 *
 * @param {Object|number} deviceOrVoltage - Устройство ИЛИ напряжение
 * @param {number} [criticalVoltage] - Критическое напряжение
 * @param {number} [minVoltage=2.5] - Минимальное напряжение
 * @param {number} [maxVoltage=4.2] - Максимальное напряжение
 * @returns {number} Прогресс от 0 до 100 (только нормальная часть)
 */
export const calculateBatteryNormalProgress = (deviceOrVoltage, criticalVoltage, minVoltage = 2.5, maxVoltage = 4.2) => {
    let voltage = deviceOrVoltage;

    if (typeof deviceOrVoltage === 'object' && deviceOrVoltage !== null) {
        voltage = deviceOrVoltage.voltage;
        criticalVoltage = calculateCriticalVoltage(deviceOrVoltage);
        minVoltage = calculateMinVoltage(deviceOrVoltage);
        maxVoltage = calculateMaxVoltage(deviceOrVoltage);
    }

    if (voltage === undefined || voltage === null) return 0;
    if (criticalVoltage === undefined) criticalVoltage = 3.2;

    if (voltage <= criticalVoltage) return 0;
    if (voltage >= maxVoltage) return 100;

    const normalRange = maxVoltage - criticalVoltage;
    const normalValue = voltage - criticalVoltage;
    const progress = (normalValue / normalRange) * 100;

    return Math.min(100, Math.max(0, Math.round(progress)));
};

/**
 * Расчёт критического прогресса батареи
 * Показывает прогресс в "критическом" диапазоне (от minVoltage до criticalVoltage)
 *
 * @param {Object|number} deviceOrVoltage - Устройство ИЛИ напряжение
 * @param {number} [criticalVoltage] - Критическое напряжение
 * @param {number} [minVoltage=2.5] - Минимальное напряжение
 * @param {number} [maxVoltage=4.2] - Максимальное напряжение
 * @returns {number} Прогресс от 0 до 100 (только критическая часть)
 */
export const calculateBatteryCriticalProgress = (deviceOrVoltage, criticalVoltage, minVoltage = 2.5, maxVoltage = 4.2) => {
    let voltage = deviceOrVoltage;

    if (typeof deviceOrVoltage === 'object' && deviceOrVoltage !== null) {
        voltage = deviceOrVoltage.voltage;
        criticalVoltage = calculateCriticalVoltage(deviceOrVoltage);
        minVoltage = calculateMinVoltage(deviceOrVoltage);
        maxVoltage = calculateMaxVoltage(deviceOrVoltage);
    }

    if (voltage === undefined || voltage === null) return 0;
    if (criticalVoltage === undefined) criticalVoltage = 3.2;

    if (voltage >= criticalVoltage) return 0;
    if (voltage <= minVoltage) return 100;

    const criticalRange = criticalVoltage - minVoltage;
    const criticalValue = criticalVoltage - voltage;
    const progress = (criticalValue / criticalRange) * 100;

    return Math.min(100, Math.max(0, Math.round(progress)));
};

/**
 * Расчёт общего прогресса батареи (нормальный + критический)
 *
 * @param {Object|number} deviceOrVoltage - Устройство ИЛИ напряжение
 * @param {number} [criticalVoltage] - Критическое напряжение
 * @param {number} [minVoltage=2.5] - Минимальное напряжение
 * @param {number} [maxVoltage=4.2] - Максимальное напряжение
 * @returns {number} Общий прогресс от 0 до 100
 */
export const calculateBatteryTotalProgress = (deviceOrVoltage, criticalVoltage, minVoltage = 2.5, maxVoltage = 4.2) => {
    let voltage = deviceOrVoltage;

    if (typeof deviceOrVoltage === 'object' && deviceOrVoltage !== null) {
        voltage = deviceOrVoltage.voltage;
        minVoltage = calculateMinVoltage(deviceOrVoltage);
        maxVoltage = calculateMaxVoltage(deviceOrVoltage);
    }

    if (voltage === undefined || voltage === null) return 0;

    const totalRange = maxVoltage - minVoltage;
    if (totalRange <= 0) return 0;

    const totalValue = voltage - minVoltage;
    const progress = (totalValue / totalRange) * 100;

    return Math.min(100, Math.max(0, Math.round(progress)));
};

/**
 * ============================================================================
 * РАСЧЁТ ЦВЕТА БАТАРЕИ
 * ============================================================================
 */

/**
 * Расчёт цвета батареи по напряжению
 *
 * @param {Object|number} deviceOrVoltage - Устройство ИЛИ напряжение
 * @param {number} [criticalVoltage] - Критическое напряжение
 * @param {Object} [colors] - Объект цветов { normal, warning, critical }
 * @returns {string} Hex цвет
 */
export const calculateBatteryColor = (deviceOrVoltage, criticalVoltage, colors = {
    normal: '#67c23a',
    warning: '#e6a23c',
    critical: '#f56c6c'
}) => {
    let voltage = deviceOrVoltage;

    if (typeof deviceOrVoltage === 'object' && deviceOrVoltage !== null) {
        voltage = deviceOrVoltage.voltage;
        criticalVoltage = calculateCriticalVoltage(deviceOrVoltage);
    }

    if (voltage === undefined || voltage === null) return colors.normal;
    if (criticalVoltage === undefined) criticalVoltage = 3.2;

    if (voltage < criticalVoltage) return colors.critical;
    if (voltage < criticalVoltage + 0.3) return colors.warning;
    return colors.normal;
};

/**
 * Расчёт цвета для прогресс-бара по значению прогресса
 *
 * @param {number} progress - Прогресс от 0 до 100
 * @returns {string} Hex цвет
 */
export const calculateProgressColor = (progress) => {
    if (progress >= 70) return '#67c23a';
    if (progress >= 40) return '#e6a23c';
    return '#f56c6c';
};

/**
 * ============================================================================
 * РАСЧЁТ ВРЕМЕНИ РАБОТЫ
 * ============================================================================
 */

/**
 * Расчёт времени работы устройства
 *
 * @param {Object} params - Параметры расчёта
 * @param {number} params.voltage - Текущее напряжение (В)
 * @param {number} params.capacity - Ёмкость батареи (мАч)
 * @param {number} params.currentConsumption - Текущее потребление (мА)
 * @param {number} params.baseConsumption - Базовое потребление (мА)
 * @param {number} params.customConsumption - Дополнительное потребление (мА)
 * @param {string} params.status - Статус устройства (ON, OFF, SLEEPING)
 * @returns {Object} Результат расчёта
 */
export const calculateDeviceRuntime = (params) => {
    const {
        voltage = 3.7,
        capacity = 3500,
        currentConsumption = 0,
        baseConsumption = 50,
        customConsumption = 0,
        status = 'ON'
    } = params || {};

    const minVoltage = 2.5;
    const maxVoltage = 4.2;
    const voltageRatio = Math.min(1, Math.max(0, (voltage - minVoltage) / (maxVoltage - minVoltage)));
    const effectiveCapacity = capacity * voltageRatio;

    let totalConsumption = baseConsumption;

    if (status === 'ON') {
        totalConsumption += currentConsumption + customConsumption;
    } else if (status === 'SLEEPING') {
        totalConsumption += Math.round(baseConsumption * 0.3);
    }

    let runtimeHours = 0;
    let runtimeMinutes = 0;
    let runtimeText = '∞';
    let isUnlimited = false;

    if (totalConsumption > 0) {
        runtimeHours = effectiveCapacity / totalConsumption;
        runtimeMinutes = Math.round(runtimeHours * 60);

        if (runtimeHours >= 24) {
            const days = Math.floor(runtimeHours / 24);
            const hours = Math.round(runtimeHours % 24);
            runtimeText = `${days}д ${hours}ч`;
        } else if (runtimeHours >= 1) {
            runtimeText = `${Math.floor(runtimeHours)}ч ${Math.round((runtimeHours % 1) * 60)}м`;
        } else {
            runtimeText = `${runtimeMinutes}м`;
        }
    } else {
        isUnlimited = true;
        runtimeText = '∞';
    }

    return {
        effectiveCapacity: Math.round(effectiveCapacity),
        totalConsumption: Math.round(totalConsumption),
        runtimeHours: Math.round(runtimeHours * 10) / 10,
        runtimeMinutes,
        runtimeText,
        isUnlimited,
        voltageRatio: Math.round(voltageRatio * 100)
    };
};

/**
 * ============================================================================
 * ФОРМАТИРОВАНИЕ
 * ============================================================================
 */

/**
 * Форматирование напряжения
 *
 * @param {number} voltage - Напряжение
 * @param {number} decimals - Количество знаков после запятой
 * @returns {string} Форматированное напряжение
 */
export const formatVoltageUtils = (voltage, decimals = 1) => {
    if (voltage === undefined || voltage === null) return '0.00В';
    return `${Number(voltage).toFixed(decimals)}В`;
};

/**
 * Форматирование ёмкости
 *
 * @param {number} capacity - Ёмкость в мАч
 * @returns {string} Форматированная ёмкость
 */
export const formatCapacity = (capacity) => {
    if (capacity === undefined || capacity === null) return 'N/A';
    if (capacity >= 1000) {
        return `${(capacity / 1000).toFixed(1)}Ач`;
    }
    return `${Math.round(capacity)}мАч`;
};

/**
 * Форматирование времени
 *
 * @param {number} minutes - Минуты
 * @returns {string} Форматированное время
 */
export const formatTime = (minutes) => {
    if (minutes === undefined || minutes === null) return 'N/A';
    if (minutes >= 1440) {
        const days = Math.floor(minutes / 1440);
        const hours = Math.round((minutes % 1440) / 60);
        return `${days}д ${hours}ч`;
    }
    if (minutes >= 60) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}ч ${mins}м`;
    }
    return `${minutes}м`;
};

/**
 * ============================================================================
 * СТАТУСЫ И КЛАССИФИКАЦИЯ
 * ============================================================================
 */

/**
 * Определение статуса батареи
 *
 * @param {number} voltage - Текущее напряжение
 * @param {number} criticalVoltage - Критическое напряжение
 * @returns {string} Статус: 'critical' | 'warning' | 'normal' | 'full'
 */
export const getBatteryStatus = (voltage, criticalVoltage = 3.2) => {
    if (voltage === undefined || voltage === null) return 'unknown';
    if (voltage < criticalVoltage) return 'critical';
    if (voltage < criticalVoltage + 0.3) return 'warning';
    if (voltage >= 4.0) return 'full';
    return 'normal';
};

/**
 * Определение статусов устройства
 *
 * @param {Object} device - Устройство
 * @returns {Object} Статусы { battery, power, overall }
 */
export const getDeviceStatuses = (device) => {
    if (!device) {
        return { battery: 'unknown', power: 'unknown', overall: 'unknown' };
    }

    const batteryStatus = getBatteryStatus(device.voltage, device.critical_voltage);
    const powerStatus = device.status === 'ON' ? 'active' : device.status === 'OFF' ? 'inactive' : device.status;

    let overallStatus = powerStatus;
    if (batteryStatus === 'critical') overallStatus = 'critical';
    else if (batteryStatus === 'warning' && overallStatus !== 'critical') overallStatus = 'warning';

    return { battery: batteryStatus, power: powerStatus, overall: overallStatus };
};

/**
 * ============================================================================
 * РАСЧЁТ ПОТРЕБЛЕНИЯ
 * ============================================================================
 */

/**
 * Расчёт потребления по интенсивности
 *
 * @param {number} intensity - Интенсивность (0-100)
 * @param {number} maxConsumption - Максимальное потребление при 100%
 * @param {number} minConsumption - Минимальное потребление при 0%
 * @returns {number} Расчётное потребление (мА)
 */
export const calculateConsumptionByIntensity = (intensity, maxConsumption = 500, minConsumption = 50) => {
    const ratio = Math.min(100, Math.max(0, intensity)) / 100;
    return Math.round(minConsumption + (maxConsumption - minConsumption) * ratio);
};

/**
 * Расчёт общего потребления устройства
 *
 * @param {Object} device - Устройство
 * @returns {number} Общее потребление (мА)
 */
export const calculateTotalConsumption = (device) => {
    if (!device) return 0;

    const baseConsumption = device.power_config?.base_consumption_mA || 50;
    const customConsumption = device.power_config?.custom_consumption_mA || 0;
    const intensityConsumption = calculateConsumptionByIntensity(device.intensity || 0);

    if (device.status === 'OFF') return baseConsumption;
    if (device.status === 'SLEEPING') return Math.round(baseConsumption * 0.3);

    return baseConsumption + customConsumption + intensityConsumption;
};

/**
 * ============================================================================
 * ВАЛИДАЦИЯ
 * ============================================================================
 */

/**
 * Валидация данных устройства
 *
 * @param {Object} device - Устройство для проверки
 * @returns {Object} Результат валидации { valid, errors }
 */
export const validateDeviceData = (device) => {
    const errors = [];

    if (!device) {
        errors.push('Device is required');
        return { valid: false, errors };
    }

    if (!device.device_id) errors.push('Device ID is required');

    if (device.voltage !== undefined && (device.voltage < 0 || device.voltage > 50)) {
        errors.push('Voltage must be between 0 and 50V');
    }

    if (device.intensity !== undefined && (device.intensity < 0 || device.intensity > 100)) {
        errors.push('Intensity must be between 0 and 100%');
    }

    if (device.capacity !== undefined && device.capacity < 0) {
        errors.push('Capacity must be positive');
    }

    return { valid: errors.length === 0, errors };
};

/**
 * ============================================================================
 * ЭКСПОРТ ПО УМОЛЧАНИЮ (ОБНОВЛЁННЫЙ)
 * ============================================================================
 */

export default {
    // Напряжение
    calculateMinVoltage,
    calculateMaxVoltage,
    calculateCriticalVoltage,

    // Позиции маркеров
    calculateCriticalThresholdPosition,
    calculateCurrentLevelPosition,

    // Прогресс батареи
    calculateBatteryNormalProgress,
    calculateBatteryCriticalProgress,
    calculateBatteryTotalProgress,

    // Цвета
    calculateBatteryColor,
    calculateProgressColor,

    // Время работы
    calculateDeviceRuntime,

    // Форматирование
    formatVoltageUtils,
    formatCapacity,
    formatTime,

    // Статусы
    getBatteryStatus,
    getDeviceStatuses,

    // Потребление
    calculateConsumptionByIntensity,
    calculateTotalConsumption,

    // Валидация
    validateDeviceData
};
