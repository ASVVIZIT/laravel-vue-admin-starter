/**
 * ============================================================================
 * COMPOSABLES INDEX — ГЛАВНЫЙ ЭКСПОРТ COMPOSABLES
 * ============================================================================
 * 📁 Путь: composables/index.js
 * ✅ Используется: Все компоненты SmartLight
 * ============================================================================
 */

export { default as useContainer } from './useContainer.js';
export { default as useDebugPanel } from './useDebugPanel.js';
export { default as useDeviceCalculations } from './useDeviceCalculations.js';
export { default as useInitialization } from './useInitialization.js';
export { default as useWebGL } from './useWebGL.js';

export default {
    useContainer: () => import('./useContainer.js'),
    useDebugPanel: () => import('./useDebugPanel.js'),
    useDeviceCalculations: () => import('./useDeviceCalculations.js'),
    useInitialization: () => import('./useInitialization.js'),
    useWebGL: () => import('./useWebGL.js')
};
