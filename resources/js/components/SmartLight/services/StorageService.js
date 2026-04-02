/**
 * ============================================================================
 * STORAGE SERVICE — СЕРВИС ДЛЯ РАБОТЫ С LOCALSTORAGE
 * ============================================================================
 * 📁 Путь: services/StorageService.js
 * ✅ Локальное хранилище
 * ✅ Отвечает за: кэширование настроек в localStorage
 * ============================================================================
 */

import { logDebug, logError } from '@/components/SmartLight/utils/appLogger.js';

export class StorageService {
    /**
     * Сохранение настроек устройства в localStorage
     * @param {string} deviceId - ID устройства
     * @param {Object} settings - Настройки
     * @returns {boolean} Успешность операции
     */
    saveDeviceSettings(deviceId, settings) {
        logDebug('StorageService', 'Сохранение настроек устройства в localStorage', {
            deviceId, settings
        });
        try {
            const key = `smartlight_device_settings_${deviceId}`;
            localStorage.setItem(key, JSON.stringify({
                settings,
                timestamp: new Date().toISOString()
            }));
            return true;
        } catch (error) {
            logError('StorageService', 'Ошибка сохранения настроек в localStorage', error);
            return false;
        }
    }

    /**
     * Получение настроек устройства из localStorage
     * @param {string} deviceId - ID устройства
     * @returns {Object|null} Настройки
     */
    getDeviceSettings(deviceId) {
        logDebug('StorageService', 'Получение настроек устройства из localStorage', { deviceId });
        try {
            const key = `smartlight_device_settings_${deviceId}`;
            const data = localStorage.getItem(key);
            if (data) {
                const parsed = JSON.parse(data);
                logDebug('StorageService', 'Настройки успешно загружены из localStorage', {
                    deviceId, settings: parsed.settings, timestamp: parsed.timestamp
                });
                return parsed.settings;
            }
            return null;
        } catch (error) {
            logError('StorageService', 'Ошибка получения настроек из localStorage', error);
            return null;
        }
    }

    /**
     * Очистка настроек устройства из localStorage
     * @param {string} deviceId - ID устройства
     * @returns {boolean} Успешность операции
     */
    clearDeviceSettings(deviceId) {
        logDebug('StorageService', 'Очистка настроек устройства из localStorage', { deviceId });
        try {
            const key = `smartlight_device_settings_${deviceId}`;
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            logError('StorageService', 'Ошибка очистки настроек из localStorage', error);
            return false;
        }
    }

    /**
     * Сохранение глобальных настроек в localStorage
     * @param {Object} settings - Настройки
     * @returns {boolean} Успешность операции
     */
    saveGlobalSettings(settings) {
        logDebug('StorageService', 'Сохранение глобальных настроек в localStorage');
        try {
            localStorage.setItem('smartlight_global_settings', JSON.stringify({
                settings,
                timestamp: new Date().toISOString()
            }));
            return true;
        } catch (error) {
            logError('StorageService', 'Ошибка сохранения глобальных настроек в localStorage', error);
            return false;
        }
    }

    /**
     * Получение глобальных настроек из localStorage
     * @returns {Object|null} Настройки
     */
    getGlobalSettings() {
        logDebug('StorageService', 'Получение глобальных настроек из localStorage');
        try {
            const data = localStorage.getItem('smartlight_global_settings');
            if (data) {
                const parsed = JSON.parse(data);
                logDebug('StorageService', 'Глобальные настройки успешно загружены из localStorage', {
                    settings: parsed.settings, timestamp: parsed.timestamp
                });
                return parsed.settings;
            }
            return null;
        } catch (error) {
            logError('StorageService', 'Ошибка получения глобальных настроек из localStorage', error);
            return null;
        }
    }

    /**
     * Очистка глобальных настроек из localStorage
     * @returns {boolean} Успешность операции
     */
    clearGlobalSettings() {
        logDebug('StorageService', 'Очистка глобальных настроек из localStorage');
        try {
            localStorage.removeItem('smartlight_global_settings');
            return true;
        } catch (error) {
            logError('StorageService', 'Ошибка очистки глобальных настроек из localStorage', error);
            return false;
        }
    }
}

export default StorageService;
