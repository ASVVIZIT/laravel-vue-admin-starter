/**
 * ============================================================================
 * INTERFACE STORE — УПРАВЛЕНИЕ ИНТЕРФЕЙСОМ
 * ============================================================================
 * 📁 Путь: stores/smartlight/interfaceStore.js
 * ✅ Используется: Dashboard.vue, DeviceCard.vue, DebugPanel.vue
 * ✅ Рефакторинг: методы получили суффикс Store(), импорты обновлены на *Utils
 * ============================================================================
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { logDebugUtils } from '@/components/SmartLight/utils/appLoggerUtils.js';

export const useInterfaceStore = defineStore('smartlight-interface', () => {
    // === STATE ===
    const debugPanelVisible = ref(false);
    const globalSettingsVisible = ref(false);
    const global3DMode = ref(false);
    const device3DSettings = ref({});
    const debugLogs = ref([]);
    const sidebarCollapsed = ref(false);
    const theme = ref('light');
    const rightPanelVisible = ref(false);
    const rightPanelTab = ref('settings');

    // === GETTERS (с суффиксом Store) ===
    const getDevice3DModeStore = (deviceId) => {
        if (!deviceId) return global3DMode.value;
        return device3DSettings.value[deviceId] ?? global3DMode.value;
    };

    const getVisibleDebugLogsStore = computed(() => debugLogs.value.slice(0, 50));
    const getActiveThemeStore = computed(() => theme.value);
    const isRightPanelOpenStore = computed(() => rightPanelVisible.value);

    // === ACTIONS (с суффиксом Store) ===

    // Debug panel
    const toggleDebugPanelStore = () => {
        debugPanelVisible.value = !debugPanelVisible.value;
        logDebugUtils('InterfaceStore', 'Debug panel toggled:', debugPanelVisible.value);
    };

    const setDebugPanelVisibleStore = (visible) => {
        debugPanelVisible.value = visible;
        logDebugUtils('InterfaceStore', 'Debug panel visibility:', visible);
    };

    // Global settings
    const setGlobalSettingsVisibleStore = (visible) => {
        globalSettingsVisible.value = visible;
        logDebugUtils('InterfaceStore', 'Global settings visibility:', visible);
    };

    const toggleGlobalSettingsVisibleStore = () => {
        globalSettingsVisible.value = !globalSettingsVisible.value;
        logDebugUtils('InterfaceStore', 'Global settings toggled:', globalSettingsVisible.value);
    };

    // Global 3D mode
    const setGlobal3DModeStore = (value) => {
        global3DMode.value = value;
        logDebugUtils('InterfaceStore', 'Global 3D mode:', value);
        if (value) localStorage.setItem('smartlight_global_3d_mode', 'true');
        else localStorage.removeItem('smartlight_global_3d_mode');
    };

    const toggleGlobal3DModeStore = () => {
        setGlobal3DModeStore(!global3DMode.value);
    };

    // Device 3D mode
    const setDevice3DModeStore = (deviceId, value) => {
        if (!deviceId) return;
        device3DSettings.value = { ...device3DSettings.value, [deviceId]: value };
        logDebugUtils('InterfaceStore', `Device 3D mode: ${deviceId} ${value}`);
    };

    const toggleDevice3DModeStore = (deviceId) => {
        if (!deviceId) return;
        setDevice3DModeStore(deviceId, !getDevice3DModeStore(deviceId));
    };

    // Debug logs
    const addLogStore = (log) => {
        if (!log) return;
        debugLogs.value.unshift({
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            level: log.level || 'info',
            component: log.component || 'Unknown',
            message: log.message || '',
            data: log.data || null
        });
        if (debugLogs.value.length > 200) debugLogs.value = debugLogs.value.slice(0, 200);
    };

    const clearLogsStore = () => {
        debugLogs.value = [];
        logDebugUtils('InterfaceStore', 'Debug logs cleared');
    };

    // Sidebar
    const toggleSidebarStore = () => {
        sidebarCollapsed.value = !sidebarCollapsed.value;
        logDebugUtils('InterfaceStore', 'Sidebar collapsed:', sidebarCollapsed.value);
    };

    const setSidebarCollapsedStore = (collapsed) => {
        sidebarCollapsed.value = collapsed;
        logDebugUtils('InterfaceStore', 'Sidebar collapsed:', collapsed);
    };

    // Theme
    const setThemeStore = (newTheme) => {
        if (!['light', 'dark', 'auto'].includes(newTheme)) return;
        theme.value = newTheme;
        localStorage.setItem('smartlight_theme', newTheme);
        logDebugUtils('InterfaceStore', 'Theme set:', newTheme);
    };

    const toggleThemeStore = () => {
        const themes = ['light', 'dark', 'auto'];
        const nextIndex = (themes.indexOf(theme.value) + 1) % themes.length;
        setThemeStore(themes[nextIndex]);
    };

    // Right panel
    const setRightPanelVisibleStore = (visible) => {
        rightPanelVisible.value = visible;
        logDebugUtils('InterfaceStore', 'Right panel visibility:', visible);
    };

    const toggleRightPanelStore = () => {
        rightPanelVisible.value = !rightPanelVisible.value;
        logDebugUtils('InterfaceStore', 'Right panel toggled:', rightPanelVisible.value);
    };

    const setRightPanelTabStore = (tab) => {
        rightPanelTab.value = tab;
        logDebugUtils('InterfaceStore', 'Right panel tab:', tab);
    };

    // Preferences
    const loadSavedPreferencesStore = () => {
        const saved3D = localStorage.getItem('smartlight_global_3d_mode');
        if (saved3D !== null) global3DMode.value = saved3D === 'true';

        const savedTheme = localStorage.getItem('smartlight_theme');
        if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) theme.value = savedTheme;

        logDebugUtils('InterfaceStore', 'Saved preferences loaded');
    };

    const resetPreferencesStore = () => {
        global3DMode.value = false;
        theme.value = 'light';
        device3DSettings.value = {};
        localStorage.removeItem('smartlight_global_3d_mode');
        localStorage.removeItem('smartlight_theme');
        logDebugUtils('InterfaceStore', 'Preferences reset to default');
    };

    const initInterfaceStore = () => {
        logDebugUtils('InterfaceStore', 'Initializing...');
        loadSavedPreferencesStore();
    };

    // === EXPOSE ===
    return {
        debugPanelVisible, globalSettingsVisible, global3DMode, device3DSettings,
        debugLogs, sidebarCollapsed, theme, rightPanelVisible, rightPanelTab,
        getDevice3DModeStore, getVisibleDebugLogsStore, getActiveThemeStore, isRightPanelOpenStore,
        toggleDebugPanelStore, setDebugPanelVisibleStore,
        setGlobalSettingsVisibleStore, toggleGlobalSettingsVisibleStore,
        setGlobal3DModeStore, toggleGlobal3DModeStore, setDevice3DModeStore, toggleDevice3DModeStore,
        addLogStore, clearLogsStore,
        toggleSidebarStore, setSidebarCollapsedStore,
        setThemeStore, toggleThemeStore,
        setRightPanelVisibleStore, toggleRightPanelStore, setRightPanelTabStore,
        loadSavedPreferencesStore, resetPreferencesStore,
        initInterfaceStore
    };
});

export default useInterfaceStore;
