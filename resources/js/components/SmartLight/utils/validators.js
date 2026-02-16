/**
 * Валидаторы для SmartLight
 *
 * Содержит функции для проверки корректности данных
 *
 * @file utils/validators.js
 */

import { logDebug, logError } from '@/components/SmartLight/utils/appLogger';
import { useSmartlightStore } from '@/components/SmartLight/stores';

// Получаем единый стор
const store = useSmartlightStore();

/**
 * Валидация настроек устройства
 *
 * @param {string} deviceId - ID устройства
 * @param {Object} settings - настройки
 * @returns {Object} объект с результатом валидации
 */
export const validateDeviceSettings = (deviceId, settings) => {
    logDebug('Validators', 'Валидация настроек устройства', { deviceId, settings });

    const errors = [];
    const warnings = [];

    // Проверка критического напряжения
    const minVoltage = 2.5;
    const maxVoltage = 4.3;

    if (settings.critical_voltage !== undefined) {
        if (settings.critical_voltage < minVoltage) {
            errors.push(`Критическое напряжение не может быть меньше ${minVoltage} В`);
        }

        if (settings.critical_voltage > maxVoltage) {
            errors.push(`Критическое напряжение не может быть больше ${maxVoltage} В`);
        }
    }

    // Проверка интервалов
    if (settings.sleep_interval !== undefined) {
        if (settings.sleep_interval < 60) {
            errors.push('Интервал сна не может быть меньше 60 сек');
        }

        if (settings.sleep_interval > 86400) {
            errors.push('Интервал сна не может быть больше 86400 сек');
        }
    }

    if (settings.emergency_sleep_interval !== undefined) {
        if (settings.emergency_sleep_interval < 300) {
            errors.push('Аварийный интервал сна не может быть меньше 300 сек');
        }

        if (settings.emergency_sleep_interval > 86400) {
            errors.push('Аварийный интервал сна не может быть больше 86400 сек');
        }
    }

    // Проверка типов аккумуляторов
    if (settings.battery_type_id !== undefined) {
        const batteryType = store.typesGetBatteryTypeById(settings.battery_type_id);
        if (!batteryType) {
            errors.push('Указанный тип аккумулятора не существует');
        }
    }

    // Проверка типов ламп
    if (settings.bulb_type_id !== undefined) {
        const bulbType = store.typesGetBulbTypeById(settings.bulb_type_id);
        if (!bulbType) {
            errors.push('Указанный тип лампы не существует');
        }
    }

    // Проверка группировки аккумуляторов
    if (settings.battery_group_config !== undefined) {
        if (settings.battery_group_config.enabled) {
            const batteryType = store.typesGetBatteryTypeById(settings.battery_type_id);

            if (batteryType) {
                if (settings.battery_group_config.type === 'parallel' && !batteryType.groupSupport.parallel) {
                    errors.push('Тип аккумулятора не поддерживает параллельное соединение');
                }

                if (settings.battery_group_config.type === 'series_parallel' && !batteryType.groupSupport.series_parallel) {
                    errors.push('Тип аккумулятора не поддерживает последовательно-параллельное соединение');
                }

                if (settings.battery_group_config.count > batteryType.groupSupport.maxInGroup) {
                    errors.push(`Количество аккумуляторов не может превышать ${batteryType.groupSupport.maxInGroup}`);
                }
            }
        }
    }

    // Проверка на конфликты
    if (settings.critical_voltage !== undefined && settings.max_voltage !== undefined) {
        if (settings.critical_voltage >= settings.max_voltage) {
            warnings.push('Критическое напряжение должно быть меньше максимального');
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
};

/**
 * Валидация глобальных настроек
 *
 * @param {Object} settings - глобальные настройки
 * @returns {Object} объект с результатом валидации
 */
export const validateGlobalSettings = (settings) => {
    logDebug('Validators', 'Валидация глобальных настроек', { settings });

    const errors = [];
    const warnings = [];

    // Проверка критического напряжения
    if (settings.critical_voltage !== undefined) {
        if (settings.critical_voltage < 2.0) {
            errors.push('Критическое напряжение не может быть меньше 2.0 В');
        }

        if (settings.critical_voltage > 5.0) {
            errors.push('Критическое напряжение не может быть больше 5.0 В');
        }
    }

    // Проверка интервалов
    if (settings.sleep_interval !== undefined) {
        if (settings.sleep_interval < 60) {
            errors.push('Интервал сна не может быть меньше 60 сек');
        }

        if (settings.sleep_interval > 86400) {
            errors.push('Интервал сна не может быть больше 86400 сек');
        }
    }

    if (settings.emergency_sleep_interval !== undefined) {
        if (settings.emergency_sleep_interval < 300) {
            errors.push('Аварийный интервал сна не может быть меньше 300 сек');
        }

        if (settings.emergency_sleep_interval > 86400) {
            errors.push('Аварийный интервал сна не может быть больше 86400 сек');
        }
    }

    // Проверка типов
    if (settings.default_battery_type !== undefined) {
        const batteryType = store.typesGetBatteryTypeById(settings.default_battery_type);
        if (!batteryType) {
            errors.push('Указанный тип аккумулятора по умолчанию не существует');
        }
    }

    if (settings.default_bulb_type !== undefined) {
        const bulbType = store.typesGetBulbTypeById(settings.default_bulb_type);
        if (!bulbType) {
            errors.push('Указанный тип лампы по умолчанию не существует');
        }
    }

    if (settings.default_power_supply !== undefined) {
        const powerSupply = store.typesGetPowerSupplyById(settings.default_power_supply);
        if (!powerSupply) {
            errors.push('Указанный тип питания по умолчанию не существует');
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
};

/**
 * Валидация данных устройства
 *
 * @param {Object} deviceData - данные устройства
 * @returns {Object} объект с результатом валидации
 */
export const validateDeviceData = (deviceData) => {
    logDebug('Validators', 'Валидация данных устройства', { deviceData });

    const errors = [];
    const warnings = [];

    // Проверка обязательных полей
    if (!deviceData.device_id) {
        errors.push('device_id обязателен');
    }

    if (!deviceData.name) {
        errors.push('name обязателен');
    }

    // Проверка напряжения
    if (deviceData.voltage !== undefined) {
        if (deviceData.voltage < 0) {
            errors.push('Напряжение не может быть отрицательным');
        }

        if (deviceData.voltage > 20) {
            errors.push('Напряжение не может быть больше 20 В');
        }
    }

    // Проверка интенсивности
    if (deviceData.intensity !== undefined) {
        if (deviceData.intensity < 0) {
            errors.push('Интенсивность не может быть меньше 0');
        }

        if (deviceData.intensity > 100) {
            errors.push('Интенсивность не может быть больше 100');
        }
    }

    // Проверка статуса
    if (deviceData.status !== undefined) {
        const validStatuses = ['ON', 'OFF', 'SLEEPING', 'ERROR', 'WARNING'];
        if (!validStatuses.includes(deviceData.status)) {
            errors.push(`Неверный статус: ${deviceData.status}. Допустимые значения: ${validStatuses.join(', ')}`);
        }
    }

    // Проверка типов
    if (deviceData.battery_type_id) {
        const batteryType = store.typesGetBatteryTypeById(deviceData.battery_type_id);
        if (!batteryType) {
            warnings.push('Указанный тип аккумулятора не найден');
        }
    }

    if (deviceData.bulb_type_id) {
        const bulbType = store.typesGetBulbTypeById(deviceData.bulb_type_id);
        if (!bulbType) {
            warnings.push('Указанный тип лампы не найден');
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
};
