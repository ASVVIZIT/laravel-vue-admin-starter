/**
 * ============================================================================
 * STORES INDEX — ГЛАВНЫЙ ЭКСПОРТ
 * ============================================================================
 * 📁 Путь: stores/index.js
 * ============================================================================
 */

// ✅ ПРЯМОЙ ЭКСПОРТ ПОДСТОРОВ (рекомендуется)
export { useDeviceStore } from './smartlight/deviceStore.js';
export { useSettingsStore } from './smartlight/settingsStore.js';
export { useTypesStore } from './smartlight/typesStore.js';
export { useInterfaceStore } from './smartlight/interfaceStore.js';
export { usePowerStore } from './smartlight/powerStore.js';

// ✅ ОБЪЕДИНЁННЫЙ STORE (для удобства)
export { useSmartlightStore } from './smartlightStore.js';

export default {
    useDeviceStore: () => import('./smartlight/deviceStore.js'),
    useSettingsStore: () => import('./smartlight/settingsStore.js'),
    useTypesStore: () => import('./smartlight/typesStore.js'),
    useInterfaceStore: () => import('./smartlight/interfaceStore.js'),
    usePowerStore: () => import('./smartlight/powerStore.js'),
    useSmartlightStore: () => import('./smartlightStore.js')
};
