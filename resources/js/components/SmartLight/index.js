/**
 * ============================================================================
 * SMARTLIGHT MODULE — ГЛАВНАЯ ТОЧКА ВХОДА
 * ============================================================================
 * 📁 Путь: components/SmartLight/index.js
 * ✅ Используется: Все файлы модуля SmartLight
 * ============================================================================
 */

// API
export * from './api/core/index.js';

// Services
export * from './services/index.js';

// Controllers
export * from './controllers/index.js';

// Stores
export * from './stores/index.js';

// Components
export * from './components/index.js';

// Composables
export * from './composables/index.js';

// Utils
export * from './utils/index.js';

// Default export для удобного импорта
export default {
    api: () => import('./api/core/index.js'),
    services: () => import('./services/index.js'),
    controllers: () => import('./controllers/index.js'),
    stores: () => import('./stores/index.js'),
    components: () => import('./components/index.js'),
    composables: () => import('./composables/index.js'),
    utils: () => import('./utils/index.js')
};
