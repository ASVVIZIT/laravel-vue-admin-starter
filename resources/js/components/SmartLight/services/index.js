/**
 * ============================================================================
 * SERVICES INDEX — ГЛАВНЫЙ ЭКСПОРТ СЕРВИСОВ
 * ============================================================================
 * 📁 Путь: services/index.js
 * ✅ Используется: Все контроллеры SmartLight
 * ✅ Рефакторинг: экспорт без изменений (классы не переименовываем)
 * ============================================================================
 */

export { DeviceService } from './DeviceService.js';
export { CommandService } from './CommandService.js';
export { SettingsService } from './SettingsService.js';
export { PowerService } from './PowerService.js';
export { StorageService } from './StorageService.js';

export default {
    DeviceService: () => import('./DeviceService.js'),
    CommandService: () => import('./CommandService.js'),
    SettingsService: () => import('./SettingsService.js'),
    PowerService: () => import('./PowerService.js'),
    StorageService: () => import('./StorageService.js')
};
