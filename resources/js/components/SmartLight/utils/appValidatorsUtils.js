/**
 * ============================================================================
 * VALIDATORS UTILS — ВАЛИДАТОРЫ ДЛЯ SMARTLIGHT (УТИЛИТЫ)
 * ============================================================================
 * 📁 Путь: utils/appValidatorsUtils.js
 * ✅ Store передаётся как параметр (опционально)
 * ✅ Рефакторинг: исправлен импорт логгера, добавлена контекстная валидация
 * ============================================================================
 */

// ✅ ИСПРАВЛЕНО: импорт из app-layer, не из api/core/
import { logDebugUtils, logErrorUtils } from '@/components/SmartLight/utils/appLoggerUtils.js';

/**
 * Валидация команды
 */
export const validateCommandUtils = (command, deviceId) => {
    logDebugUtils('ValidatorsUtils', 'Валидация команды', { command, deviceId });
    const errors = [];
    const VALID_COMMANDS = ['ON', 'OFF', 'SLEEPING', 'WAKE_UP', 'STATUS_UPDATE', 'EMERGENCY_SLEEP'];

    if (!command) {
        errors.push('Команда не указана');
    } else if (!VALID_COMMANDS.includes(command)) {
        errors.push(`Недопустимая команда: ${command}. Допустимые: ${VALID_COMMANDS.join(', ')}`);
    }

    if (!deviceId) {
        errors.push('deviceId не указан');
    }

    return { valid: errors.length === 0, errors, command, deviceId };
};

/**
 * Валидация настроек устройства
 */
export const validateDeviceSettingsUtils = (deviceId, settings, store = null) => {
    logDebugUtils('ValidatorsUtils', 'Валидация настроек устройства', { deviceId, settings });
    const errors = [];
    const warnings = [];
    const minVoltage = 2.5;
    const maxVoltage = 4.3;

    if (settings.critical_voltage !== undefined) {
        if (settings.critical_voltage < minVoltage) errors.push(`Критическое напряжение не может быть меньше ${minVoltage} В`);
        if (settings.critical_voltage > maxVoltage) errors.push(`Критическое напряжение не может быть больше ${maxVoltage} В`);
    }

    if (settings.sleep_interval !== undefined) {
        if (settings.sleep_interval < 60) errors.push('Интервал сна не может быть меньше 60 секунд');
        if (settings.sleep_interval > 86400) errors.push('Интервал сна не может быть больше 86400 секунд');
    }

    if (settings.emergency_sleep_interval !== undefined) {
        if (settings.emergency_sleep_interval < 300) errors.push('Аварийный интервал сна не может быть меньше 300 секунд');
        if (settings.emergency_sleep_interval > 86400) errors.push('Аварийный интервал сна не может быть больше 86400 секунд');
    }

    if (store) {
        if (settings.battery_type_id !== undefined) {
            const batteryType = store.typesGetBatteryTypeByIdStore?.(settings.battery_type_id);
            if (!batteryType) errors.push('Указанный тип аккумулятора не существует');
        }
        if (settings.bulb_type_id !== undefined) {
            const bulbType = store.typesGetBulbTypeByIdStore?.(settings.bulb_type_id);
            if (!bulbType) errors.push('Указанный тип лампы не существует');
        }
        if (settings.battery_group_config?.enabled) {
            const batteryType = store.typesGetBatteryTypeByIdStore?.(settings.battery_type_id);
            if (batteryType) {
                if (settings.battery_group_config.type === 'parallel' && !batteryType.groupSupport?.parallel) {
                    errors.push('Тип аккумулятора не поддерживает параллельное соединение');
                }
                if (settings.battery_group_config.type === 'series_parallel' && !batteryType.groupSupport?.series_parallel) {
                    errors.push('Тип аккумулятора не поддерживает последовательно-параллельное соединение');
                }
                if (settings.battery_group_config.count > (batteryType.groupSupport?.maxInGroup || 10)) {
                    errors.push(`Количество аккумуляторов не может превышать ${batteryType.groupSupport?.maxInGroup || 10}`);
                }
            }
        }
    }

    if (settings.critical_voltage !== undefined && settings.max_voltage !== undefined) {
        if (settings.critical_voltage >= settings.max_voltage) {
            warnings.push('Критическое напряжение должно быть меньше максимального');
        }
    }

    return { valid: errors.length === 0, errors, warnings };
};

/**
 * Валидация глобальных настроек (с контекстной валидацией по типу питания)
 */
export const validateGlobalSettingsUtils = (settings, store = null) => {
    logDebugUtils('ValidatorsUtils', 'Валидация глобальных настроек', { settings });
    const errors = [];
    const warnings = [];

    // ✅ Контекстные правила в зависимости от типа питания
    const powerType = settings.power_supply_type || 'battery';
    const voltageRules = {
        'battery': { min: 2.0, max: 4.3, criticalMin: 2.0, criticalMax: 4.3 },
        'dc-5v': { min: 4.0, max: 5.5, criticalMin: null, criticalMax: null }, // critical_voltage не применимо
        'dc-12v': { min: 9.0, max: 14.0, criticalMin: null, criticalMax: null },
        'ac-220v': { min: null, max: null, criticalMin: null, criticalMax: null }, // напряжения не применимы
        'solar': { min: 2.0, max: 6.0, criticalMin: 2.0, criticalMax: 6.0 }
    };

    const rules = voltageRules[powerType] || voltageRules.battery;

    // Валидация критического напряжения (только если применимо для типа питания)
    if (settings.critical_voltage !== undefined && rules.criticalMin !== null) {
        if (settings.critical_voltage < rules.criticalMin) errors.push(`Критическое напряжение не может быть меньше ${rules.criticalMin} В для типа ${powerType}`);
        if (settings.critical_voltage > rules.criticalMax) errors.push(`Критическое напряжение не может быть больше ${rules.criticalMax} В для типа ${powerType}`);
    }

    // Валидация мин. напряжения контроллера
    if (settings.min_controller_voltage !== undefined && rules.min !== null) {
        if (settings.min_controller_voltage < rules.min) errors.push(`Мин. напряжение контроллера не может быть меньше ${rules.min} В для типа ${powerType}`);
        if (settings.min_controller_voltage > rules.max) errors.push(`Мин. напряжение контроллера не может быть больше ${rules.max} В для типа ${powerType}`);
    }

    // Общие проверки интервалов
    if (settings.sleep_interval !== undefined) {
        if (settings.sleep_interval < 60) errors.push('Интервал сна не может быть меньше 60 секунд');
        if (settings.sleep_interval > 86400) errors.push('Интервал сна не может быть больше 24 часов');
    }

    if (settings.emergency_sleep_interval !== undefined) {
        if (settings.emergency_sleep_interval < 300) errors.push('Аварийный интервал сна не может быть меньше 5 минут');
        if (settings.emergency_sleep_interval > 86400) errors.push('Аварийный интервал сна не может быть больше 24 часов');
    }

    if (settings.controller_runtime !== undefined) {
        const maxRuntime = powerType === 'ac-220v' ? 604800 : 86400; // 7 дней для сети, 1 день для батарей
        if (settings.controller_runtime < 3600) errors.push('Время работы контроллера не может быть меньше 1 часа');
        if (settings.controller_runtime > maxRuntime) errors.push(`Время работы контроллера не может быть больше ${maxRuntime/3600} часов для типа ${powerType}`);
    }

    // Валидация с использованием стора (если передан)
    if (store) {
        if (settings.default_battery_type !== undefined) {
            const batteryType = store.typesGetBatteryTypeByIdStore?.(settings.default_battery_type);
            if (!batteryType) errors.push('Указанный тип аккумулятора по умолчанию не существует');
        }
        if (settings.default_bulb_type !== undefined) {
            const bulbType = store.typesGetBulbTypeByIdStore?.(settings.default_bulb_type);
            if (!bulbType) errors.push('Указанный тип лампы по умолчанию не существует');
        }
        if (settings.default_power_supply !== undefined) {
            const powerSupply = store.typesGetPowerSupplyByIdStore?.(settings.default_power_supply);
            if (!powerSupply) errors.push('Указанный тип питания по умолчанию не существует');
        }
    }

    // Логическая проверка: критическое напряжение должно быть меньше мин. напряжения контроллера
    if (settings.critical_voltage !== undefined && settings.min_controller_voltage !== undefined) {
        if (settings.critical_voltage >= settings.min_controller_voltage) {
            warnings.push('Критическое напряжение должно быть меньше мин. напряжения контроллера');
        }
    }

    return { valid: errors.length === 0, errors, warnings };
};

/**
 * Валидация данных устройства
 */
export const validateDeviceDataUtils = (deviceData, store = null) => {
    logDebugUtils('ValidatorsUtils', 'Валидация данных устройства', { deviceData });
    const errors = [];
    const warnings = [];

    if (!deviceData.device_id) errors.push('device_id обязателен');
    if (!deviceData.name) errors.push('name обязателен');

    if (deviceData.voltage !== undefined) {
        if (deviceData.voltage < 0) errors.push('Напряжение не может быть отрицательным');
        if (deviceData.voltage > 20) errors.push('Напряжение не может быть больше 20 В');
    }

    if (deviceData.intensity !== undefined) {
        if (deviceData.intensity < 0) errors.push('Интенсивность не может быть меньше 0');
        if (deviceData.intensity > 100) errors.push('Интенсивность не может быть больше 100');
    }

    if (deviceData.status !== undefined) {
        const validStatuses = ['ON', 'OFF', 'SLEEPING', 'ERROR', 'WARNING'];
        if (!validStatuses.includes(deviceData.status)) {
            errors.push(`Неверный статус: ${deviceData.status}. Допустимые: ${validStatuses.join(', ')}`);
        }
    }

    if (store) {
        if (deviceData.battery_type_id) {
            const batteryType = store.typesGetBatteryTypeByIdStore?.(deviceData.battery_type_id);
            if (!batteryType) warnings.push('Указанный тип аккумулятора не найден');
        }
        if (deviceData.bulb_type_id) {
            const bulbType = store.typesGetBulbTypeByIdStore?.(deviceData.bulb_type_id);
            if (!bulbType) warnings.push('Указанный тип лампы не найден');
        }
    }

    return { valid: errors.length === 0, errors, warnings };
};

export default {
    validateCommandUtils,
    validateDeviceSettingsUtils,
    validateGlobalSettingsUtils,
    validateDeviceDataUtils
};
