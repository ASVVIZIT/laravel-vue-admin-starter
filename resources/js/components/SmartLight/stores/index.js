/**
 * ============================================================================
 * STORES INDEX — ГЛАВНЫЙ ЭКСПОРТ СТОРОВ
 * ============================================================================
 * 📁 Путь: stores/index.js
 * ✅ Поддерживает модульные сторы и агрегатор (обратная совместимость)
 * ============================================================================
 */

import { createPinia } from 'pinia';
import { useDeviceStore } from './smartlight/deviceStore.js';
import { useSettingsStore } from './smartlight/settingsStore.js';
import { useTypesStore } from './smartlight/typesStore.js';
import { useInterfaceStore } from './smartlight/interfaceStore.js';
import { usePowerStore } from './smartlight/powerStore.js';
import { useVisualizationConfigStore } from './smartlight/visualizationConfigStore.js';

/**
 * Инициализация Pinia и всех сторов
 */
export const setupStores = (app) => {
    const pinia = createPinia();
    app.use(pinia);

    useSettingsStore();
    useInterfaceStore();
    useTypesStore();
    usePowerStore();
    useVisualizationConfigStore();
    // useDeviceStore инициализируется в Dashboard.vue при первом использовании

    console.log('[Stores] ✅ All stores initialized');
    return pinia;
};

/**
 * Экспорт модульных сторов
 */
export {
    useDeviceStore,
    useSettingsStore,
    useTypesStore,
    useInterfaceStore,
    usePowerStore,
    useVisualizationConfigStore
};

/**
 * Экспорт для ленивой загрузки
 */
export default {
    deviceStore: () => import('./smartlight/deviceStore.js'),
    settingsStore: () => import('./smartlight/settingsStore.js'),
    typesStore: () => import('./smartlight/typesStore.js'),
    interfaceStore: () => import('./smartlight/interfaceStore.js'),
    powerStore: () => import('./smartlight/powerStore.js'),
    visualizationConfigStore: () => import('./smartlight/visualizationConfigStore.js')
};
