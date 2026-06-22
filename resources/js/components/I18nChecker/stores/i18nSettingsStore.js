import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { I18N_SETTINGS_DEFAULTS_CONFIG } from '@components/I18nChecker/config/i18nSettingsDefaultsConfig.js';
import { deepClone } from '@components/I18nChecker/utils/i18nSettingsHelpersUtils.js';

const STORAGE_KEY = 'i18n-checker-settings';

// СИНХРОННАЯ ЗАГРУЗКА из localStorage при инициализации модуля
const loadInitialSettings = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            return {
                icons: { ...deepClone(I18N_SETTINGS_DEFAULTS_CONFIG.icons), ...(parsed.icons || {}) },
                display: { ...deepClone(I18N_SETTINGS_DEFAULTS_CONFIG.display), ...(parsed.display || {}) },
                behavior: { ...deepClone(I18N_SETTINGS_DEFAULTS_CONFIG.behavior), ...(parsed.behavior || {}) },
                meta: { ...deepClone(I18N_SETTINGS_DEFAULTS_CONFIG.meta), ...(parsed.meta || {}) },
            };
        }
    } catch (err) {
        console.error('[i18nSettingsStore] Initial load error:', err);
    }
    return null;
};

const initialSettings = loadInitialSettings();

export const useI18nSettingsStore = defineStore('i18n-settings', () => {
    // ========================================================================
    // STATE — инициализируется СРАЗУ из localStorage
    // ========================================================================
    const iconsSettings = ref(initialSettings?.icons || deepClone(I18N_SETTINGS_DEFAULTS_CONFIG.icons));
    const displaySettings = ref(initialSettings?.display || deepClone(I18N_SETTINGS_DEFAULTS_CONFIG.display));
    const behaviorSettings = ref(initialSettings?.behavior || deepClone(I18N_SETTINGS_DEFAULTS_CONFIG.behavior));
    const metaSettings = ref(initialSettings?.meta || deepClone(I18N_SETTINGS_DEFAULTS_CONFIG.meta));

    const loading = ref(false);
    const error = ref(null);
    const initialized = ref(true); // 🔥 Сразу true — загрузили синхронно

    // ========================================================================
    // COMPUTED
    // ========================================================================
    const settingsDebugSnapshot = computed(() => ({
        meta: { ...metaSettings.value },
        icons: { ...iconsSettings.value },
        display: { ...displaySettings.value },
        behavior: { ...behaviorSettings.value },
    }));

    // ========================================================================
    // ACTIONS
    // ========================================================================
    const saveToStorage = () => {
        try {
            const payload = {
                icons: iconsSettings.value,
                display: displaySettings.value,
                behavior: behaviorSettings.value,
                meta: metaSettings.value,
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
            return { success: true };
        } catch (err) {
            error.value = 'Не удалось сохранить настройки';
            console.error('[i18nSettingsStore] Save error:', err);
            return { success: false, message: err.message };
        }
    };

    const updateSettingsStore = (settings) => {
        try {
            if (settings.icons) iconsSettings.value = { ...iconsSettings.value, ...settings.icons };
            if (settings.display) displaySettings.value = { ...displaySettings.value, ...settings.display };
            if (settings.behavior) behaviorSettings.value = { ...behaviorSettings.value, ...settings.behavior };
            if (settings.meta) metaSettings.value = { ...metaSettings.value, ...settings.meta };
            return saveToStorage();
        } catch (err) {
            error.value = 'Не удалось обновить настройки';
            console.error('[i18nSettingsStore] Update error:', err);
            return { success: false, message: err.message };
        }
    };

    const resetSettingsStore = () => {
        try {
            iconsSettings.value = deepClone(I18N_SETTINGS_DEFAULTS_CONFIG.icons);
            displaySettings.value = deepClone(I18N_SETTINGS_DEFAULTS_CONFIG.display);
            behaviorSettings.value = deepClone(I18N_SETTINGS_DEFAULTS_CONFIG.behavior);
            metaSettings.value = deepClone(I18N_SETTINGS_DEFAULTS_CONFIG.meta);
            return saveToStorage();
        } catch (err) {
            console.error('[i18nSettingsStore] Reset error:', err);
            return { success: false, message: err.message };
        }
    };

    return {
        iconsSettings,
        displaySettings,
        behaviorSettings,
        metaSettings,
        loading,
        error,
        initialized,
        settingsDebugSnapshot,
        saveToStorage,
        updateSettingsStore,
        resetSettingsStore,
    };
});

export default useI18nSettingsStore;
