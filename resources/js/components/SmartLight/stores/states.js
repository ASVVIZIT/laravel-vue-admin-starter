/**
 * Состояния для Pinia сторов
 *
 * Экспортирует функции для создания состояния
 *
 * @file stores/states.js
 */

import { BATTERY_TYPES } from '@/components/SmartLight/stores/smartlight/types/batteryTypes';
import { BULB_TYPES } from '@/components/SmartLight/stores/smartlight/types/bulbTypes';
import { DEVICE_TYPES, DEVICE_STATE } from '@/components/SmartLight/stores/smartlight/types/deviceTypes';
import { POWER_SUPPLY_TYPES } from '@/components/SmartLight/stores/smartlight/types/powerSupplyTypes';

/**
 * Возвращает состояние для подстора устройств
 *
 * @returns {Object} состояние подстора устройств
 */
export const deviceStoreState = () => ({
    devices: [],
    devicesMap: new Map(),
    selectedDeviceId: null,
    loading: false,
    error: null,
    lastCommandTimestamp: 0,
    COMMAND_DEBOUNCE: 1000,
    interfaceSettings: {
        global3DMode: false,
        device3DSettings: {}
    }
});

/**
 * Возвращает состояние для подстора настроек
 *
 * @returns {Object} состояние подстора настроек
 */
export const settingsStoreState = () => ({
    globalSettings: {
        critical_voltage: 3.2,
        sleep_interval: 600,
        emergency_sleep_interval: 3600,
        server_url: import.meta.env.VITE_API_BASE_URL || '/api/smart-light',
        global_3d_mode: false,
        default_battery_type: 'li-ion-18650',
        default_bulb_type: 'classic',
        default_power_supply: 'standard',
        power_management_mode: 'balanced',
        controller_runtime: 86400,
        min_controller_voltage: 2.8
    },
    loading: false,
    error: null
});

/**
 * Возвращает состояние для подстора интерфейса
 *
 * @returns {Object} состояние подстора интерфейса
 */
export const interfaceStoreState = () => ({
    size: 'small',
    debugPanelVisible: true,
    debugPanelTab: 'debug',
    globalSettingsVisible: false,
    loading: false,
    error: null,
    interfaceSettings: {
        global3DMode: false,
        device3DSettings: {}
    }
});

/**
 * Возвращает состояние для подстора питания
 *
 * @returns {Object} состояние подстора питания
 */
export const powerStoreState = () => ({
    powerSupplies: POWER_SUPPLY_TYPES,
    activePowerSupply: 'standard',
    loading: false,
    error: null,
    powerStatus: {
        status: 'active',
        voltage: 3.7,
        current: 0,
        power: 0,
        lastUpdate: Date.now()
    }
});

/**
 * Возвращает состояние для подстора типов
 *
 * @returns {Object} состояние подстора типов
 */
export const typesStoreState = () => ({
    batteryTypes: BATTERY_TYPES,
    bulbTypes: BULB_TYPES,
    powerSupplies: POWER_SUPPLY_TYPES,
    deviceTypes: DEVICE_TYPES,
    deviceStates: DEVICE_STATE,
    loading: false,
    error: null,
    initialized: false
});
