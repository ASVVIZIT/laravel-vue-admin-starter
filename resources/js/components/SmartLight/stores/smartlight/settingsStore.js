/**
 * Подстор для управления настройками
 *
 * Содержит state, getters и actions для подстора настроек
 *
 * @file stores/settingsStore.js
 */

import { defineStore } from 'pinia';
import { SettingsApi } from '@/components/SmartLight/api/smartLight/SettingsApi';
import { logDebug, logError } from '@/components/SmartLight/utils/appLogger';

export const useSettingsStore = defineStore('smartlight/settings', {
    state: () => ({
        globalSettings: {
            critical_voltage: 3.2,
            sleep_interval: 600,
            emergency_sleep_interval: 3600,
            server_url: import.meta.env.VITE_API_BASE_URL || '/api/smart-light',
            global_3d_mode: false,
            default_battery_type: 'li-ion-18650',
            default_bulb_type: 'classic',
            default_power_supply: 'standard',
            power_management_mode: 'balanced',
            controller_runtime: 86400,
            min_controller_voltage: 2.8
        },
        loading: false,
        error: null
    }),

    getters: {
        globalSettings: (state) => {
            return state.globalSettings;
        }
    },

    actions: {
        async init() {
            logDebug('SettingsStore', 'Инициализация SettingsStore');

            this.loading = true;
            this.error = null;

            try {
                // Загружаем настройки из localStorage
                const settingsJson = localStorage.getItem('smartlight_global_settings');
                if (settingsJson) {
                    const settings = JSON.parse(settingsJson);
                    this.globalSettings = {
                        ...this.globalSettings,
                        ...settings
                    };
                }

                // Загружаем настройки из API
                const response = await SettingsApi.getGlobalSettings();

                if (response.success) {
                    this.globalSettings = {
                        ...this.globalSettings,
                        ...response.data
                    };
                }

                return {
                    success: true,
                    message: 'Глобальные настройки загружены',
                    ...this.globalSettings
                };
            } catch (err) {
                this.error = 'Не удалось загрузить настройки';
                logError('SettingsStore', 'Ошибка загрузки настроек', err);

                return {
                    success: false,
                    message: 'Ошибка загрузки настроек',
                    error: err.message
                };
            } finally {
                this.loading = false;
            }
        },

        async updateGlobalSettings(settings) {
            logDebug('SettingsStore', 'Обновление глобальных настроек', { settings });

            this.loading = true;
            this.error = null;

            try {
                const response = await SettingsApi.updateGlobalSettings(settings);

                if (response.success) {
                    // Обновляем локальные настройки
                    this.globalSettings = {
                        ...this.globalSettings,
                        ...settings
                    };

                    // Сохраняем в localStorage
                    localStorage.setItem('smartlight_global_settings', JSON.stringify(this.globalSettings));

                    return {
                        success: true,
                        message: 'Глобальные настройки обновлены',
                        ...response.data
                    };
                } else {
                    throw new Error(response.message || 'Ошибка сохранения настроек');
                }
            } catch (err) {
                this.error = 'Не удалось сохранить глобальные настройки';
                logError('SettingsStore', 'Ошибка сохранения настроек', err);

                return {
                    success: false,
                    message: 'Ошибка сохранения настроек',
                    error: err.message
                };
            } finally {
                this.loading = false;
            }
        },

        async getGlobalSettings() {
            logDebug('SettingsStore', 'Получение глобальных настроек');

            this.loading = true;
            this.error = null;

            try {
                const response = await SettingsApi.getGlobalSettings();

                if (response.success) {
                    return {
                        success: true,
                        message: 'Глобальные настройки получены',
                        ...response.data
                    };
                } else {
                    throw new Error(response.message || 'Ошибка получения настроек');
                }
            } catch (err) {
                this.error = 'Не удалось получить настройки';
                logError('SettingsStore', 'Ошибка получения настроек', err);

                return {
                    success: false,
                    message: 'Ошибка получения настроек',
                    error: err.message
                };
            } finally {
                this.loading = false;
            }
        }
    }
});
