/**
 * Типы устройств
 *
 * Содержит только данные типов устройств без бизнес-логики
 *
 * @file stores/smartlight/types/deviceTypes.js
 */

export const DEVICE_TYPES = {
    standard: {
        name: 'Стандартное устройство',
        features: {
            voltage: true,
            intensity: true,
            sleepMode: true,
            emergencyMode: true,
            groupSupport: true
        }
    },
    basic: {
        name: 'Базовое устройство',
        features: {
            voltage: true,
            intensity: true,
            sleepMode: true,
            emergencyMode: false,
            groupSupport: false
        }
    },
    advanced: {
        name: 'Расширенное устройство',
        features: {
            voltage: true,
            intensity: true,
            sleepMode: true,
            emergencyMode: true,
            groupSupport: true,
            powerManagement: true
        }
    }
};

export const DEVICE_STATE = {
    ON: 'Включено',
    OFF: 'Выключено',
    SLEEPING: 'Спит',
    ERROR: 'Ошибка',
    WARNING: 'Предупреждение'
};

// Типы аккумуляторов
export const BATTERY_TYPE_IDS = {
    LI_ION_18650: 'li-ion-18650',
    LI_ION_21700: 'li-ion-21700',
    LI_PO: 'li-po',
    LEAD_ACID: 'lead-acid'
};

// Типы ламп
export const BULB_TYPE_IDS = {
    CLASSIC: 'classic',
    LED: 'led',
    HALOGEN: 'halogen',
    SMART_LED: 'smart-led'
};

// Типы источников питания
export const POWER_SUPPLY_TYPE_IDS = {
    STANDARD: 'standard',
    SOLAR: 'solar',
    GRID: 'grid'
};
