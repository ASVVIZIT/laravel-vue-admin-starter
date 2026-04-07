/**
 * ============================================================================
 * INTERFACE STORE — УПРАВЛЕНИЕ ИНТЕРФЕЙСОМ
 * ============================================================================
 * 📁 Путь: stores/smartlight/interfaceStore.js
 * ✅ Исправлено: addLogStore с ограничением размера и безопасным логированием
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
    const isLogging = ref(false); // ✅ Защита от рекурсии

    // === БЕЗОПАСНОЕ ЛОГИРОВАНИЕ ===
    const safeLog = (component, message, data = null) => {
        if (isLogging.value) return;
        try {
            isLogging.value = true;
            logDebugUtils(component, message, data);
        } finally { isLogging.value = false; }
    };

    // === GETTERS ===
    const getDevice3DModeStore = (deviceId) =>
        !deviceId ? global3DMode.value : device3DSettings.value[deviceId] ?? global3DMode.value;

    const getVisibleDebugLogsStore = computed(() => debugLogs.value.slice(0, 50));
    const getActiveThemeStore = computed(() => theme.value);
    const isRightPanelOpenStore = computed(() => rightPanelVisible.value);

    // === ACTIONS: Logs (исправлено) ===
    const addLogStore = (log) => {
        if (!log || !log.message) return;
        // ✅ Ограничение до 100 записей
        if (debugLogs.value.length >= 100) debugLogs.value = debugLogs.value.slice(0, 99);

        const logData = log.data && Object.keys(log.data).length > 0 ? log.data : null;

        debugLogs.value.unshift({
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            level: log.level || 'info',
            component: log.component || 'Unknown',
            message: log.message,
            logData // ✅ null вместо {}
        });
        safeLog('InterfaceStore', `Log added: ${log.component}`, { message: log.message });
    };

    const clearLogsStore = () => {
        debugLogs.value = [];
        safeLog('InterfaceStore', 'Logs cleared');
    };

    // === ACTIONS: 3D Mode (с сохранением в localStorage) ===
    const setGlobal3DModeStore = (value) => {
        global3DMode.value = value;
        safeLog('InterfaceStore', 'Global 3D mode', { value });
        if (value) localStorage.setItem('smartlight_global_3d_mode', 'true');
        else localStorage.removeItem('smartlight_global_3d_mode');
    };

    const toggleGlobal3DModeStore = () => setGlobal3DModeStore(!global3DMode.value);

    const setDevice3DModeStore = (deviceId, value) => {
        if (!deviceId) return;
        const old = device3DSettings.value[deviceId];
        device3DSettings.value = { ...device3DSettings.value, [deviceId]: value };
        safeLog('InterfaceStore', 'Device 3D mode', { deviceId, from: old, to: value });
        try {
            localStorage.setItem('smartlight_device_3d_modes', JSON.stringify(device3DSettings.value));
        } catch (e) {
            console.warn('localStorage save failed', e);
        }
    };

    const toggleDevice3DModeStore = (deviceId) => {
        if (deviceId) setDevice3DModeStore(deviceId, !getDevice3DModeStore(deviceId));
    };

    // === ACTIONS: Preferences ===
    const loadSavedPreferencesStore = () => {
        const saved3D = localStorage.getItem('smartlight_global_3d_mode');
        if (saved3D !== null) global3DMode.value = saved3D === 'true';

        const savedDevice = localStorage.getItem('smartlight_device_3d_modes');
        if (savedDevice) {
            try {
                device3DSettings.value = JSON.parse(savedDevice);
            } catch (e) {
                localStorage.removeItem('smartlight_device_3d_modes');
            }
        }

        const savedTheme = localStorage.getItem('smartlight_theme');
        if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) theme.value = savedTheme;

        safeLog('InterfaceStore', 'Preferences loaded', {
            global3D: global3DMode.value,
            device3DCount: Object.keys(device3DSettings.value).length
        });
    };

    const resetPreferencesStore = () => {
        global3DMode.value = false;
        theme.value = 'light';
        device3DSettings.value = {};
        localStorage.removeItem('smartlight_global_3d_mode');
        localStorage.removeItem('smartlight_device_3d_modes');
        localStorage.removeItem('smartlight_theme');
        safeLog('InterfaceStore', 'Preferences reset');
    };

    const initInterfaceStore = () => {
        safeLog('InterfaceStore', 'Initializing');
        loadSavedPreferencesStore();
    };

    // === EXPOSE ===
    return {
        debugPanelVisible,
        globalSettingsVisible,
        global3DMode,
        device3DSettings,
        debugLogs,
        sidebarCollapsed,
        theme,
        rightPanelVisible,
        rightPanelTab,
        getDevice3DModeStore,
        getVisibleDebugLogsStore,
        getActiveThemeStore,
        isRightPanelOpenStore,
        toggleDebugPanelStore: () => {
            debugPanelVisible.value = !debugPanelVisible.value;
            safeLog('InterfaceStore', 'Debug panel toggled', { visible: debugPanelVisible.value });
        },
        setDebugPanelVisibleStore: (v) => {
            debugPanelVisible.value = v;
            safeLog('InterfaceStore', 'Debug panel visibility', { visible: v });
        },
        setGlobalSettingsVisibleStore: (v) => {
            globalSettingsVisible.value = v;
            safeLog('InterfaceStore', 'Global settings visibility', { visible: v });
        },
        toggleGlobalSettingsVisibleStore: () => {
            globalSettingsVisible.value = !globalSettingsVisible.value;
            safeLog('InterfaceStore', 'Global settings toggled', { visible: globalSettingsVisible.value });
        },
        setGlobal3DModeStore,
        toggleGlobal3DModeStore,
        setDevice3DModeStore,
        toggleDevice3DModeStore,
        addLogStore,
        clearLogsStore,
        toggleSidebarStore: () => {
            sidebarCollapsed.value = !sidebarCollapsed.value;
            safeLog('InterfaceStore', 'Sidebar toggled', { collapsed: sidebarCollapsed.value });
        },
        setSidebarCollapsedStore: (c) => {
            sidebarCollapsed.value = c;
            safeLog('InterfaceStore', 'Sidebar collapsed', { collapsed: c });
        },
        setThemeStore: (t) => {
            if (['light', 'dark', 'auto'].includes(t)) {
                theme.value = t;
                localStorage.setItem('smartlight_theme', t);
                safeLog('InterfaceStore', 'Theme set', { theme: t });
            }
        },
        toggleThemeStore: () => {
            const themes = ['light', 'dark', 'auto'];
            setThemeStore(themes[(themes.indexOf(theme.value) + 1) % themes.length]);
        },
        setRightPanelVisibleStore: (v) => {
            rightPanelVisible.value = v;
            safeLog('InterfaceStore', 'Right panel visibility', { visible: v });
        },
        toggleRightPanelStore: () => {
            rightPanelVisible.value = !rightPanelVisible.value;
            safeLog('InterfaceStore', 'Right panel toggled', { visible: rightPanelVisible.value });
        },
        setRightPanelTabStore: (t) => {
            rightPanelTab.value = t;
            safeLog('InterfaceStore', 'Right panel tab', { tab: t });
        },
        loadSavedPreferencesStore,
        resetPreferencesStore,
        initInterfaceStore
    };
});

export default useInterfaceStore;
