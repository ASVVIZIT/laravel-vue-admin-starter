/**
 * ============================================================================
 * CONTROLLERS INDEX — ГЛАВНЫЙ ЭКСПОРТ КОНТРОЛЛЕРОВ
 * ============================================================================
 * 📁 Путь: controllers/index.js
 * ✅ Единая точка входа для всех controllers
 * ============================================================================
 */

export { DeviceController } from './DeviceController.js';
export { SettingsController } from './SettingsController.js';
export { PowerManagementController } from './PowerManagementController.js';
export { InitializationController } from './InitializationController.js';

export default {
    DeviceController: () => import('./DeviceController.js'),
    SettingsController: () => import('./SettingsController.js'),
    PowerManagementController: () => import('./PowerManagementController.js'),
    InitializationController: () => import('./InitializationController.js')
};
