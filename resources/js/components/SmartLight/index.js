// resources/js/components/SmartLight/index.js
/**
 * Точка входа для модуля "Умное освещение"
 * Импортируйте все компоненты и функциональность через этот файл
 */

export * from './api/core/SmartLightResource';
export * from './composables/useWebGL';
export * from './composables/useDeviceCalculations';
export * from './controllers/DeviceController';
export * from './controllers/SettingsController';
export * from './services/DeviceService';
export * from './services/SettingsService';
export * from './stores';
