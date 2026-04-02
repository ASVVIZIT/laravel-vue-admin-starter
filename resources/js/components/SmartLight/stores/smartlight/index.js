/**
 * ============================================================================
 * SMARTLIGHT STORES INDEX — ГЛАВНЫЙ ЭКСПОРТ ПОДСТОРОВ
 * ============================================================================
 * 📁 Путь: stores/smartlight/index.js
 * ✅ Используется: stores/index.js, компоненты
 * ============================================================================
 */

export { useDeviceStore } from './deviceStore.js';
export { useSettingsStore } from './settingsStore.js';
export { useTypesStore } from './typesStore.js';
export { useInterfaceStore } from './interfaceStore.js';
export { usePowerStore } from './powerStore.js';

export default {
    deviceStore: () => import('./deviceStore.js'),
    settingsStore: () => import('./settingsStore.js'),
    typesStore: () => import('./typesStore.js'),
    interfaceStore: () => import('./interfaceStore.js'),
    powerStore: () => import('./powerStore.js')
};
