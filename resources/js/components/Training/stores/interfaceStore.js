/**
 * ============================================================================
 * TRAINING INTERFACE STORE — УПРАВЛЕНИЕ ИНТЕРФЕЙСОМ МОДУЛЯ
 * ============================================================================
 * 📁 Путь: @/components/Training/stores/smartlight/interfaceStore.js
 * ✅ Назначение: Состояние отладки, темы, панелей, логов для Training модуля
 * ✅ Адаптировано: Убраны 3D/Device-зависимости, добавлены Training-флаги
 * ============================================================================
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { logDebugUtils } from '@components/Training/utils/appLoggerUtils.js';

export const useInterfaceStore = defineStore('training-interface', () => {
    // === STATE ===
    const debugPanelVisible = ref(false);
    const globalSettingsVisible = ref(false);
    const debugLogs = ref([]);
    const sidebarCollapsed = ref(false);
    const theme = ref('light');
    const rightPanelVisible = ref(false);
    const rightPanelTab = ref('filters'); // 'filters' | 'stats' | 'settings'
    const isLogging = ref(false); // ✅ Защита от рекурсии в логах

    // === БЕЗОПАСНОЕ ЛОГИРОВАНИЕ ===
    const safeLog = (component, message, data = null) => {
        if (isLogging.value) return;
        try {
            isLogging.value = true;
            logDebugUtils(component, message, data);
        } finally { isLogging.value = false; }
    };

    // === GETTERS ===
    const getVisibleDebugLogsStore = computed(() => debugLogs.value.slice(0, 50));
    const getActiveThemeStore = computed(() => theme.value);
    const isRightPanelOpenStore = computed(() => rightPanelVisible.value);

    // === ACTIONS: Logs ===
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
            logData
        });
        safeLog('InterfaceStore', `Log added: ${log.component}`, { message: log.message });
    };

    const clearLogsStore = () => {
        debugLogs.value = [];
        safeLog('InterfaceStore', 'Logs cleared');
    };

    // === ACTIONS: Preferences (Training-specific keys) ===
    const loadSavedPreferencesStore = () => {
        const savedTheme = localStorage.getItem('training_theme');
        if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) theme.value = savedTheme;

        const savedSidebar = localStorage.getItem('training_sidebar_collapsed');
        if (savedSidebar !== null) sidebarCollapsed.value = savedSidebar === 'true';

        safeLog('InterfaceStore', 'Preferences loaded', {
            theme: theme.value,
            sidebarCollapsed: sidebarCollapsed.value
        });
    };

    const resetPreferencesStore = () => {
        theme.value = 'light';
        sidebarCollapsed.value = false;
        localStorage.removeItem('training_theme');
        localStorage.removeItem('training_sidebar_collapsed');
        safeLog('InterfaceStore', 'Preferences reset');
    };

    const initInterfaceStore = () => {
        safeLog('InterfaceStore', 'Initializing');
        loadSavedPreferencesStore();
    };

    // === ACTIONS: UI Toggles ===
    const toggleDebugPanelStore = () => {
        debugPanelVisible.value = !debugPanelVisible.value;
        safeLog('InterfaceStore', 'Debug panel toggled', { visible: debugPanelVisible.value });
    };

    const setDebugPanelVisibleStore = (v) => {
        debugPanelVisible.value = v;
        safeLog('InterfaceStore', 'Debug panel visibility', { visible: v });
    };

    const toggleGlobalSettingsVisibleStore = () => {
        globalSettingsVisible.value = !globalSettingsVisible.value;
        safeLog('InterfaceStore', 'Global settings toggled', { visible: globalSettingsVisible.value });
    };

    const setGlobalSettingsVisibleStore = (v) => {
        globalSettingsVisible.value = v;
        safeLog('InterfaceStore', 'Global settings visibility', { visible: v });
    };

    const toggleSidebarStore = () => {
        sidebarCollapsed.value = !sidebarCollapsed.value;
        localStorage.setItem('training_sidebar_collapsed', sidebarCollapsed.value.toString());
        safeLog('InterfaceStore', 'Sidebar toggled', { collapsed: sidebarCollapsed.value });
    };

    const setSidebarCollapsedStore = (c) => {
        sidebarCollapsed.value = c;
        localStorage.setItem('training_sidebar_collapsed', c.toString());
        safeLog('InterfaceStore', 'Sidebar collapsed', { collapsed: c });
    };

    const setThemeStore = (t) => {
        if (['light', 'dark', 'auto'].includes(t)) {
            theme.value = t;
            localStorage.setItem('training_theme', t);
            safeLog('InterfaceStore', 'Theme set', { theme: t });
        }
    };

    const toggleThemeStore = () => {
        const themes = ['light', 'dark', 'auto'];
        setThemeStore(themes[(themes.indexOf(theme.value) + 1) % themes.length]);
    };

    const setRightPanelVisibleStore = (v) => {
        rightPanelVisible.value = v;
        safeLog('InterfaceStore', 'Right panel visibility', { visible: v });
    };

    const toggleRightPanelStore = () => {
        rightPanelVisible.value = !rightPanelVisible.value;
        safeLog('InterfaceStore', 'Right panel toggled', { visible: rightPanelVisible.value });
    };

    const setRightPanelTabStore = (t) => {
        rightPanelTab.value = t;
        safeLog('InterfaceStore', 'Right panel tab', { tab: t });
    };

    // === EXPOSE ===
    return {
        // State
        debugPanelVisible,
        globalSettingsVisible,
        debugLogs,
        sidebarCollapsed,
        theme,
        rightPanelVisible,
        rightPanelTab,

        // Getters
        getVisibleDebugLogsStore,
        getActiveThemeStore,
        isRightPanelOpenStore,

        // Actions: Logs
        addLogStore,
        clearLogsStore,

        // Actions: UI
        toggleDebugPanelStore,
        setDebugPanelVisibleStore,
        toggleGlobalSettingsVisibleStore,
        setGlobalSettingsVisibleStore,
        toggleSidebarStore,
        setSidebarCollapsedStore,
        setThemeStore,
        toggleThemeStore,
        setRightPanelVisibleStore,
        toggleRightPanelStore,
        setRightPanelTabStore,

        // Actions: Preferences
        loadSavedPreferencesStore,
        resetPreferencesStore,
        initInterfaceStore
    };
});

export default useInterfaceStore;
