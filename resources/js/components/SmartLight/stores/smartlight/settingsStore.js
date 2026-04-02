/**
 * ============================================================================
 * SETTINGS STORE — ПОДСТОР НАСТРОЕК
 * ============================================================================
 * 📁 Путь: stores/smartlight/settingsStore.js
 * ============================================================================
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';
import { CoreSmartLightResource } from '@/components/SmartLight/api/core/resource/coreSmartLightResource.js';

export const useSettingsStore = defineStore('settings', () => {
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

    const init = async () => {
        console.log('[SettingsStore] Initializing...');
        const saved = localStorage.getItem('smartlight_global_settings');
        if (saved) {
            try {
                globalSettings.value = { ...globalSettings.value, ...JSON.parse(saved) };
                console.log('[SettingsStore] Loaded from localStorage');
            } catch (e) {
                console.error('[SettingsStore] Load error:', e);
            }
        }
        return true;
    };

    const getGlobalSettings = async () => {
        loading.value = true;
        error.value = null;
        console.log('[SettingsStore] Fetching global settings...');
        try {
            const resource = new CoreSmartLightResource();
            const response = await resource.getGlobalSettings();
            if (response.success) {
                globalSettings.value = { ...globalSettings.value, ...response.data };
                console.log('[SettingsStore] Settings loaded');
            }
            return response;
        } catch (err) {
            error.value = 'Не удалось загрузить настройки';
            console.error('[SettingsStore] Error:', err.message);
            return { success: false, message: err.message };
        } finally {
            loading.value = false;
        }
    };

    const updateGlobalSettings = async (settings) => {
        loading.value = true;
        error.value = null;
        console.log('[SettingsStore] Updating settings:', settings);
        try {
            const resource = new CoreSmartLightResource();
            const response = await resource.updateGlobalSettings(settings);
            if (response.success) {
                globalSettings.value = { ...globalSettings.value, ...settings };
                localStorage.setItem('smartlight_global_settings', JSON.stringify(globalSettings.value));
                console.log('[SettingsStore] Settings saved');
            }
            return response;
        } catch (err) {
            error.value = 'Не удалось сохранить настройки';
            console.error('[SettingsStore] Error:', err.message);
            return { success: false, message: err.message };
        } finally {
            loading.value = false;
        }
    };

    const resetGlobalSettings = async () => {
        loading.value = true;
        error.value = null;
        console.log('[SettingsStore] Resetting settings...');
        try {
            const resource = new CoreSmartLightResource();
            const response = await resource.resetGlobalSettings();
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
                console.log('[SettingsStore] Settings reset');
            }
            return response;
        } catch (err) {
            error.value = 'Не удалось сбросить настройки';
            console.error('[SettingsStore] Error:', err.message);
            return { success: false, message: err.message };
        } finally {
            loading.value = false;
        }
    };

    return {
        globalSettings, loading, error,
        init, getGlobalSettings, updateGlobalSettings, resetGlobalSettings
    };
});

export default useSettingsStore;
