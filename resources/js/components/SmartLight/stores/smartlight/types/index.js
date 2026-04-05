/**
 * ============================================================================
 * TYPES INDEX — ЭКСПОРТ ВСЕХ ТИПОВ
 * ============================================================================
 * 📁 Путь: stores/smartlight/types/index.js
 * ✅ Экспорт всех типов данных (батареи, лампы, питание, устройства)
 * ============================================================================
 */

export { BATTERY_TYPES, getBatteryTypeByIdStore, getBatteryTypesForDropdownStore } from './batteryTypes.js';
export { BULB_TYPES, getBulbTypeByIdStore, getBulbTypesForDropdownStore } from './bulbTypes.js';
export { POWER_SUPPLY_TYPES, getPowerSupplyById, getPowerSuppliesForDropdown } from './powerSupplyTypes.js';
export { DEVICE_TYPES, DEVICE_STATE, BATTERY_TYPE_IDS, BULB_TYPE_IDS, POWER_SUPPLY_TYPE_IDS } from './deviceTypes.js';

export default {
    BATTERY_TYPES,
    BULB_TYPES,
    POWER_SUPPLY_TYPES,
    DEVICE_TYPES,
    DEVICE_STATE,
    BATTERY_TYPE_IDS,
    BULB_TYPE_IDS,
    POWER_SUPPLY_TYPE_IDS
};
