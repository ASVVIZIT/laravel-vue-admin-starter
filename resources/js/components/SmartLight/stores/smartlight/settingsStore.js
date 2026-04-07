/**
 * ============================================================================
 * SETTINGS STORE — ПОДСТОР НАСТРОЕК (ИСПРАВЛЕННАЯ ОБРАБОТКА 422)
 * ============================================================================
 * 📁 Путь: stores/smartlight/settingsStore.js
 * ✅ Исправлено: структура запроса + обработка ошибок валидации
 * ============================================================================
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';
import { CoreSmartLightResource } from '@/components/SmartLight/api/core/resource/coreSmartLightResource.js';
import { logDebugUtils, logErrorUtils } from '@/components/SmartLight/api/core/utils/coreApiLoggerUtils.js';

export const useSettingsStore = defineStore('smartlight-settings', () => {
    const globalSettings = ref({
        critical_voltage: 3.2,
        sleep_interval: 600,
        emergency_sleep_interval: 3600,
        default_battery_type: 'li-ion-18650',
        default_bulb_type: 'classic',
        default_power_supply: 'standard',
        power_management_mode: 'balanced',
        controller_runtime: 86400,
        min_controller_voltage: 2.8
    });

    const loading = ref(false);
    const error = ref(null);
    const validationErrors = ref({});

    const initSettingsStore = async () => {
        logDebugUtils('SettingsStore', 'Initializing...');
        const saved = localStorage.getItem('smartlight_global_settings');
        if (saved) {
            try {
                globalSettings.value = { ...globalSettings.value, ...JSON.parse(saved) };
                logDebugUtils('SettingsStore', 'Loaded from localStorage');
            } catch (e) {
                logErrorUtils('SettingsStore', 'Load error', e);
            }
        }
        return true;
    };

    const getGlobalSettingsStore = async () => {
        loading.value = true;
        error.value = null;
        validationErrors.value = {};
        logDebugUtils('SettingsStore', 'Fetching global settings...');

        try {
            const resource = new CoreSmartLightResource();
            const response = await resource.getGlobalSettingsResource();

            if (response.success) {
                globalSettings.value = { ...globalSettings.value, ...response.data };
                logDebugUtils('SettingsStore', 'Settings loaded');
            }
            return response;
        } catch (err) {
            error.value = 'Не удалось загрузить настройки';
            logErrorUtils('SettingsStore', 'Error loading settings', err);
            return { success: false, message: err.message };
        } finally {
            loading.value = false;
        }
    };

    const updateGlobalSettingsStore = async (settings) => {
        loading.value = true;
        error.value = null;
        validationErrors.value = {};

        logDebugUtils('SettingsStore', 'Updating settings', settings);

        try {
            const resource = new CoreSmartLightResource();
            // ✅ ИСПРАВЛЕНО: отправляем settings напрямую, без обёртки { settings }
            const response = await resource.updateGlobalSettingsResource(settings);

            if (response.success) {
                globalSettings.value = { ...globalSettings.value, ...settings };
                localStorage.setItem('smartlight_global_settings', JSON.stringify(globalSettings.value));
                logDebugUtils('SettingsStore', 'Settings saved');
            }
            return response;
        } catch (err) {
            const rawErrors = err.response?.data?.errors || {};

            // ✅ Нормализуем ключи: settings.field → field
            const { normalizeValidationErrorsUtils } = await import('@/components/SmartLight/utils/appFormattersUtils.js');
            validationErrors.value = normalizeValidationErrorsUtils(rawErrors);

            const errorMessage = err.response?.data?.message || 'Ошибка валидации';
            error.value = errorMessage;

            logErrorUtils('SettingsStore', errorMessage, err);

            return {
                success: false,
                message: errorMessage,
                errors: validationErrors.value
            };
        } finally {
            loading.value = false;
        }
    };

    const resetGlobalSettingsStore = async () => {
        loading.value = true;
        error.value = null;
        validationErrors.value = {};

        logDebugUtils('SettingsStore', 'Resetting settings...');

        try {
            const resource = new CoreSmartLightResource();
            const response = await resource.resetGlobalSettingsResource();

            if (response.success) {
                globalSettings.value = {
                    critical_voltage: 3.2,
                    sleep_interval: 600,
                    emergency_sleep_interval: 3600,
                    default_battery_type: 'li-ion-18650',
                    default_bulb_type: 'classic',
                    default_power_supply: 'standard',
                    power_management_mode: 'balanced',
                    controller_runtime: 86400,
                    min_controller_voltage: 2.8
                };
                localStorage.setItem('smartlight_global_settings', JSON.stringify(globalSettings.value));
                logDebugUtils('SettingsStore', 'Settings reset');
            }
            return response;
        } catch (err) {
            error.value = 'Не удалось сбросить настройки';
            logErrorUtils('SettingsStore', 'Error resetting settings', err);
            return { success: false, message: err.message };
        } finally {
            loading.value = false;
        }
    };

    // ========================================================================
    // EXPOSE
    // ========================================================================
    return {
        globalSettings,
        loading,
        error,
        validationErrors,
        initSettingsStore,
        getGlobalSettingsStore,
        updateGlobalSettingsStore,
        resetGlobalSettingsStore
    };
});

export default useSettingsStore;
