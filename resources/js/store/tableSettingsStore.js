import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

const STORAGE_KEY = 'table-global-settings';

// Настройки по умолчанию
const DEFAULT_SETTINGS = {
    display: {
        defaultPageSize: 20,
        pageSizes: [5, 10, 20, 50, 100],
        compactMode: false,
        showRowIndex: false,
        stripeRows: true,
        borderTable: false,
        highlightCurrentRow: true,
        highlightHoverRow: true
    },
    behavior: {
        preserveFilters: true,
        preservePagination: true,
        preserveSorting: true,
        autoSaveOnchange: true,
        confirmBeforeClear: false
    }
};

// Синхронная загрузка из localStorage
const loadInitialSettings = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            return {
                display: { ...DEFAULT_SETTINGS.display, ...(parsed.display || {}) },
                behavior: { ...DEFAULT_SETTINGS.behavior, ...(parsed.behavior || {}) }
            };
        }
    } catch (err) {
        console.error('[TableSettingsStore] Initial load error:', err);
    }
    return null;
};

const initialSettings = loadInitialSettings();

export const useTableSettingsStore = defineStore('table-settings', () => {
    // STATE
    const displaySettings = ref(initialSettings?.display || { ...DEFAULT_SETTINGS.display });
    const behaviorSettings = ref(initialSettings?.behavior || { ...DEFAULT_SETTINGS.behavior });
    const loading = ref(false);
    const error = ref(null);
    const initialized = ref(true);

    // COMPUTED
    const settingsSnapshot = computed(() => ({
        display: { ...displaySettings.value },
        behavior: { ...behaviorSettings.value }
    }));

    // ACTIONS
    const saveToStorage = () => {
        try {
            const payload = {
                display: displaySettings.value,
                behavior: behaviorSettings.value
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
            return { success: true };
        } catch (err) {
            error.value = 'Не удалось сохранить настройки';
            console.error('[TableSettingsStore] Save error:', err);
            return { success: false, message: err.message };
        }
    };

    const updateSettings = (settings) => {
        try {
            if (settings.display) {
                displaySettings.value = { ...displaySettings.value, ...settings.display };
            }
            if (settings.behavior) {
                behaviorSettings.value = { ...behaviorSettings.value, ...settings.behavior };
            }
            return saveToStorage();
        } catch (err) {
            error.value = 'Не удалось обновить настройки';
            console.error('[TableSettingsStore] Update error:', err);
            return { success: false, message: err.message };
        }
    };

    const resetSettings = () => {
        try {
            displaySettings.value = { ...DEFAULT_SETTINGS.display };
            behaviorSettings.value = { ...DEFAULT_SETTINGS.behavior };
            return saveToStorage();
        } catch (err) {
            console.error('[TableSettingsStore] Reset error:', err);
            return { success: false, message: err.message };
        }
    };

    return {
        displaySettings,
        behaviorSettings,
        loading,
        error,
        initialized,
        settingsSnapshot,
        saveToStorage,
        updateSettings,
        resetSettings
    };
});

export default useTableSettingsStore;
