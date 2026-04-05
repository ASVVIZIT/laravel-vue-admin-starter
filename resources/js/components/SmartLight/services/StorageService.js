/**
 * ============================================================================
 * STORAGE SERVICE — СЕРВИС ДЛЯ РАБОТЫ С LOCALSTORAGE
 * ============================================================================
 * 📁 Путь: services/StorageService.js
 * ✅ Локальное хранилище
 * ✅ Рефакторинг: методы получили суффикс Service(), импорты обновлены на *Utils
 * ============================================================================
 */

import { logDebugUtils, logErrorUtils } from '@/components/SmartLight/api/core/utils/coreApiLoggerUtils.js';

export class StorageService {
    saveDeviceSettingsService(deviceId, settings) {
        logDebugUtils('StorageService', 'Сохранение настроек устройства в localStorage', {
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
            logErrorUtils('StorageService', 'Ошибка сохранения настроек в localStorage', error);
            return false;
        }
    }

    getDeviceSettingsService(deviceId) {
        logDebugUtils('StorageService', 'Получение настроек устройства из localStorage', { deviceId });
        try {
            const key = `smartlight_device_settings_${deviceId}`;
            const data = localStorage.getItem(key);
            if (data) {
                const parsed = JSON.parse(data);
                logDebugUtils('StorageService', 'Настройки успешно загружены из localStorage', {
                    deviceId, settings: parsed.settings, timestamp: parsed.timestamp
                });
                return parsed.settings;
            }
            return null;
        } catch (error) {
            logErrorUtils('StorageService', 'Ошибка получения настроек из localStorage', error);
            return null;
        }
    }

    clearDeviceSettingsService(deviceId) {
        logDebugUtils('StorageService', 'Очистка настроек устройства из localStorage', { deviceId });
        try {
            const key = `smartlight_device_settings_${deviceId}`;
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            logErrorUtils('StorageService', 'Ошибка очистки настроек из localStorage', error);
            return false;
        }
    }

    saveGlobalSettingsService(settings) {
        logDebugUtils('StorageService', 'Сохранение глобальных настроек в localStorage');
        try {
            localStorage.setItem('smartlight_global_settings', JSON.stringify({
                settings,
                timestamp: new Date().toISOString()
            }));
            return true;
        } catch (error) {
            logErrorUtils('StorageService', 'Ошибка сохранения глобальных настроек в localStorage', error);
            return false;
        }
    }

    getGlobalSettingsService() {
        logDebugUtils('StorageService', 'Получение глобальных настроек из localStorage');
        try {
            const data = localStorage.getItem('smartlight_global_settings');
            if (data) {
                const parsed = JSON.parse(data);
                logDebugUtils('StorageService', 'Глобальные настройки успешно загружены из localStorage', {
                    settings: parsed.settings, timestamp: parsed.timestamp
                });
                return parsed.settings;
            }
            return null;
        } catch (error) {
            logErrorUtils('StorageService', 'Ошибка получения глобальных настроек из localStorage', error);
            return null;
        }
    }

    clearGlobalSettingsService() {
        logDebugUtils('StorageService', 'Очистка глобальных настроек из localStorage');
        try {
            localStorage.removeItem('smartlight_global_settings');
            return true;
        } catch (error) {
            logErrorUtils('StorageService', 'Ошибка очистки глобальных настроек из localStorage', error);
            return false;
        }
    }
}

export default StorageService;
