import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { I18N_SETTINGS_DEFAULTS_CONFIG } from '@components/I18nChecker/config/i18nSettingsDefaultsConfig.js';
import { deepClone } from '@components/I18nChecker/utils/i18nSettingsHelpersUtils.js';

const STORAGE_KEY = 'i18n-checker-settings';

export const useI18nSettingsStore = defineStore('i18n-settings', () => {
    // ========================================================================
    // STATE
    // ========================================================================
    const iconsSettings = ref(deepClone(I18N_SETTINGS_DEFAULTS_CONFIG.icons));
    const displaySettings = ref(deepClone(I18N_SETTINGS_DEFAULTS_CONFIG.display));
    const behaviorSettings = ref(deepClone(I18N_SETTINGS_DEFAULTS_CONFIG.behavior));
    const metaSettings = ref(deepClone(I18N_SETTINGS_DEFAULTS_CONFIG.meta));

    const loading = ref(false);
    const error = ref(null);
    const initialized = ref(false);

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
    // LOCAL STORAGE
    // ========================================================================
    const loadFromStorage = () => {
        loading.value = true;
        error.value = null;
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed.icons) iconsSettings.value = { ...iconsSettings.value, ...parsed.icons };
                if (parsed.display) displaySettings.value = { ...displaySettings.value, ...parsed.display };
                if (parsed.behavior) behaviorSettings.value = { ...behaviorSettings.value, ...parsed.behavior };
                if (parsed.meta) metaSettings.value = { ...metaSettings.value, ...parsed.meta };
            }
            initialized.value = true;
            return { success: true };
        } catch (err) {
            error.value = 'Не удалось загрузить настройки';
            console.error('[i18nSettingsStore] Load error:', err);
            return { success: false, message: error.value };
        } finally {
            loading.value = false;
        }
    };

    const saveToStorage = (settings) => {
        loading.value = true;
        try {
            const payload = {
                icons: settings?.icons || iconsSettings.value,
                display: settings?.display || displaySettings.value,
                behavior: settings?.behavior || behaviorSettings.value,
                meta: settings?.meta || metaSettings.value,
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
            return { success: true };
        } catch (err) {
            error.value = 'Не удалось сохранить настройки';
            console.error('[i18nSettingsStore] Save error:', err);
            return { success: false, message: error.value };
        } finally {
            loading.value = false;
        }
    };

    // ========================================================================
    // ACTIONS
    // ========================================================================
    const updateSettingsStore = async (settings) => {
        loading.value = true;
        try {
            if (settings.icons) iconsSettings.value = { ...iconsSettings.value, ...settings.icons };
            if (settings.display) displaySettings.value = { ...displaySettings.value, ...settings.display };
            if (settings.behavior) behaviorSettings.value = { ...behaviorSettings.value, ...settings.behavior };
            if (settings.meta) metaSettings.value = { ...metaSettings.value, ...settings.meta };

            const result = saveToStorage();
            return result;
        } catch (err) {
            error.value = 'Не удалось обновить настройки';
            console.error('[i18nSettingsStore] Update error:', err);
            return { success: false, message: error.value };
        } finally {
            loading.value = false;
        }
    };

    const resetSettingsStore = async () => {
        loading.value = true;
        try {
            iconsSettings.value = deepClone(I18N_SETTINGS_DEFAULTS_CONFIG.icons);
            displaySettings.value = deepClone(I18N_SETTINGS_DEFAULTS_CONFIG.display);
            behaviorSettings.value = deepClone(I18N_SETTINGS_DEFAULTS_CONFIG.behavior);
            metaSettings.value = deepClone(I18N_SETTINGS_DEFAULTS_CONFIG.meta);

            const result = saveToStorage();
            if (result.success) {
                return { success: true, message: 'Настройки сброшены' };
            }
            return { success: false, message: result.message || 'Ошибка сброса' };
        } catch (err) {
            console.error('[i18nSettingsStore] Reset error:', err);
            return { success: false, message: 'Не удалось сбросить настройки' };
        } finally {
            loading.value = false;
        }
    };

    // ========================================================================
    // INIT
    // ========================================================================
    const init = () => {
        if (!initialized.value) {
            loadFromStorage();
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
        loadFromStorage,
        saveToStorage,
        updateSettingsStore,
        resetSettingsStore,
        init,
    };
});

export default useI18nSettingsStore;
