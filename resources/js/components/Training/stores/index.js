import { useExerciseStore } from './exerciseStore.js';
import { useTrainingLogStore } from './trainingLogStore.js';
import { useTrainingSettingsStore } from './trainingSettingsStore.js';
import { useInterfaceStore } from './interfaceStore.js';

/**
 * Объединённый стор для удобного доступа ко всем данным модуля Training
 */
export const useTrainingStore = () => {
    const exerciseStore = useExerciseStore();
    const logStore = useTrainingLogStore();
    const settingsStore = useTrainingSettingsStore();
    const interfaceStore = useInterfaceStore();

    return {
        // === EXERCISE ===
        exercises: exerciseStore.exercises,
        exercisesMap: exerciseStore.exercisesMap,
        exercisesLoaded: exerciseStore.exercisesLoaded,
        exerciseLoading: exerciseStore.loading,
        exerciseError: exerciseStore.error,
        exercisesForDropdown: exerciseStore.exercisesForDropdownStore,
        fetchExercises: exerciseStore.fetchExercisesStore,
        initExercises: exerciseStore.initExercisesStore,

        // === LOGS ===
        currentLogs: logStore.currentLogs,
        currentLoading: logStore.currentLoading,
        currentError: logStore.currentError,
        currentPagination: logStore.currentPagination,
        isGrouped: logStore.isGrouped,
        activeTab: logStore.activeTab,
        hasLogs: logStore.hasLogs,
        isEmpty: logStore.isEmpty,
        config: logStore.config,

        refreshCurrentTab: logStore.refreshCurrentTab,
        setActiveTab: logStore.setActiveTab,
        setPage: logStore.setPage,
        setPerPage: logStore.setPerPage,
        clearFilters: logStore.clearFilters,
        createLog: logStore.createLog,
        updateLog: logStore.updateLog,
        deleteLog: logStore.deleteLog,
        fetchStats: logStore.fetchStats,
        fetchSummary: logStore.fetchSummary,

        // === SETTINGS ===
        serverSettings: settingsStore.serverSettings,
        frontendSettings: settingsStore.frontendSettings,
        groupingModes: settingsStore.groupingModes,
        settingsLoading: settingsStore.loading,
        settingsError: settingsStore.error,
        validationErrors: settingsStore.validationErrors,

        isGroupingToggleVisibleStore: settingsStore.isGroupingToggleVisibleStore,
        isStatsEnabledStore: settingsStore.isStatsEnabledStore,
        isSharingEnabledStore: settingsStore.isSharingEnabledStore,
        getGroupingModeForTabStore: settingsStore.getGroupingModeForTabStore,
        isServerGroupingActiveStore: settingsStore.isServerGroupingActiveStore,

        fetchSettingsStore: settingsStore.fetchSettingsStore,
        updateSettingsStore: settingsStore.updateSettingsStore,
        resetSettingsStore: settingsStore.resetSettingsStore,
        clearValidationErrorStore: settingsStore.clearValidationErrorStore,

        // === INTERFACE (UI State) ===
        debugPanelVisible: interfaceStore.debugPanelVisible,
        globalSettingsVisible: interfaceStore.globalSettingsVisible,
        debugLogs: interfaceStore.debugLogs,
        sidebarCollapsed: interfaceStore.sidebarCollapsed,
        theme: interfaceStore.theme,
        rightPanelVisible: interfaceStore.rightPanelVisible,
        rightPanelTab: interfaceStore.rightPanelTab,

        getVisibleDebugLogsStore: interfaceStore.getVisibleDebugLogsStore,
        getActiveThemeStore: interfaceStore.getActiveThemeStore,
        isRightPanelOpenStore: interfaceStore.isRightPanelOpenStore,

        addLogStore: interfaceStore.addLogStore,
        clearLogsStore: interfaceStore.clearLogsStore,
        toggleDebugPanelStore: interfaceStore.toggleDebugPanelStore,
        setDebugPanelVisibleStore: interfaceStore.setDebugPanelVisibleStore,
        toggleGlobalSettingsVisibleStore: interfaceStore.toggleGlobalSettingsVisibleStore,
        setGlobalSettingsVisibleStore: interfaceStore.setGlobalSettingsVisibleStore,
        toggleSidebarStore: interfaceStore.toggleSidebarStore,
        setSidebarCollapsedStore: interfaceStore.setSidebarCollapsedStore,
        setThemeStore: interfaceStore.setThemeStore,
        toggleThemeStore: interfaceStore.toggleThemeStore,
        setRightPanelVisibleStore: interfaceStore.setRightPanelVisibleStore,
        toggleRightPanelStore: interfaceStore.toggleRightPanelStore,
        setRightPanelTabStore: interfaceStore.setRightPanelTabStore,
        loadSavedPreferencesStore: interfaceStore.loadSavedPreferencesStore,
        resetPreferencesStore: interfaceStore.resetPreferencesStore,
        initInterfaceStore: interfaceStore.initInterfaceStore,

        // === INIT ===
        init: async () => {
            interfaceStore.initInterfaceStore();
            await exerciseStore.initExercisesStore();
            await settingsStore.fetchSettingsStore('mine');
            await logStore.refreshCurrentTab();
        }
    };
};

// ✅ Явные именованные экспорты
export { useExerciseStore } from './exerciseStore.js';
export { useTrainingLogStore } from './trainingLogStore.js';
export { useTrainingSettingsStore } from './trainingSettingsStore.js';
export { useInterfaceStore } from './interfaceStore.js';

// ✅ Безопасный default export
export default {
    useTrainingStore,
    useExerciseStore,
    useTrainingLogStore,
    useTrainingSettingsStore,
    useInterfaceStore
};
