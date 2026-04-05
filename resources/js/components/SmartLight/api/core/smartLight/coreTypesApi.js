/**
 * ============================================================================
 * CORE TYPES API — БИЗНЕС-ЛОГИКА ДЛЯ СПРАВОЧНИКОВ ТИПОВ
 * ============================================================================
 * 📁 Путь: api/core/smartLight/coreTypesApi.js
 * ✅ Используется: typesStore, GlobalSettingsForm, DeviceSettingsForm
 * ✅ Назначение: Нормализация ответов, обработка ошибок, фолбэк на константы
 * ✅ Рефакторинг: методы с суффиксом Api()
 * ============================================================================
 */

// Импорт низкоуровневых API для каждого типа
import { coreBatteryTypeApi } from '@components/SmartLight/api/core/types/coreBatteryTypeApi.js';
import { coreBulbTypeApi } from '@components/SmartLight/api/core/types/coreBulbTypeApi.js';
import { corePowerSupplyTypeApi } from '@components/SmartLight/api/core/types/corePowerSupplyTypeApi.js';

// Импорт локальных констант как фолбэк если API не отвечает
import { BATTERY_TYPES } from '@components/SmartLight/stores/smartlight/types/batteryTypes.js';
import { BULB_TYPES } from '@components/SmartLight/stores/smartlight/types/bulbTypes.js';
import { POWER_SUPPLY_TYPES } from '@components/SmartLight/stores/smartlight/types/powerSupplyTypes.js';

export const CoreTypesApi = {
    // ===== ТИПЫ БАТАРЕЙ =====

    /**
     * Получить все типы батарей (суффикс Api)
     * @returns {Promise<{success: boolean, message: string, data: Object|Array, error?: string}>}
     */
    getBatteryTypesApi: async () => {
        try {
            const response = await coreBatteryTypeApi.getAllBatteryTypesTypeApi();
            return {
                success: response?.success ?? false,
                message: response?.message || 'Типы батарей загружены',
                data: response?.data || response || [] || BATTERY_TYPES,
                error: response?.error || null
            };
        } catch (error) {
            console.error('[CoreTypesApi] getBatteryTypesApi error:', error);
            return {
                success: false,
                message: 'Не удалось загрузить типы батарей',
                data: BATTERY_TYPES,
                error: error?.message || String(error)
            };
        }
    },

    /**
     * Получить тип батареи по ID (суффикс Api)
     * @param {string} id - ID типа батареи
     * @returns {Promise<{success: boolean, message: string, data: Object|null, error?: string}>}
     */
    getBatteryTypeApi: async (id) => {
        try {
            const response = await coreBatteryTypeApi.getBatteryTypeByIdTypeApi(id);
            return {
                success: response?.success ?? false,
                message: response?.message || 'Тип батареи загружен',
                data: response?.data || response || null,
                error: response?.error || null
            };
        } catch (error) {
            console.error('[CoreTypesApi] getBatteryTypeApi error:', error);
            return {
                success: false,
                message: 'Не удалось загрузить тип батареи',
                data: BATTERY_TYPES[id] || null,
                error: error?.message || String(error)
            };
        }
    },

    // ===== ТИПЫ ЛАМП =====

    /**
     * Получить все типы ламп (суффикс Api)
     * @returns {Promise<{success: boolean, message: string, data: Object|Array, error?: string}>}
     */
    getBulbTypesApi: async () => {
        try {
            const response = await coreBulbTypeApi.getAllBulbTypesTypeApi();
            return {
                success: response?.success ?? false,
                message: response?.message || 'Типы ламп загружены',
                data: response?.data || response || [] || BULB_TYPES,
                error: response?.error || null
            };
        } catch (error) {
            console.error('[CoreTypesApi] getBulbTypesApi error:', error);
            return {
                success: false,
                message: 'Не удалось загрузить типы ламп',
                data: BULB_TYPES,
                error: error?.message || String(error)
            };
        }
    },

    /**
     * Получить тип лампы по ID (суффикс Api)
     * @param {string} id - ID типа лампы
     * @returns {Promise<{success: boolean, message: string, data: Object|null, error?: string}>}
     */
    getBulbTypeApi: async (id) => {
        try {
            const response = await coreBulbTypeApi.getBulbTypeByIdTypeApi(id);
            return {
                success: response?.success ?? false,
                message: response?.message || 'Тип лампы загружен',
                data: response?.data || response || null,
                error: response?.error || null
            };
        } catch (error) {
            console.error('[CoreTypesApi] getBulbTypeApi error:', error);
            return {
                success: false,
                message: 'Не удалось загрузить тип лампы',
                data: BULB_TYPES[id] || null,
                error: error?.message || String(error)
            };
        }
    },

    // ===== ТИПЫ ИСТОЧНИКОВ ПИТАНИЯ =====

    /**
     * Получить все типы источников питания (суффикс Api)
     * @returns {Promise<{success: boolean, message: string, data: Object|Array, error?: string}>}
     */
    getPowerSupplyTypesApi: async () => {
        try {
            const response = await corePowerSupplyTypeApi.getAllPowerSupplyTypesTypeApi();
            return {
                success: response?.success ?? false,
                message: response?.message || 'Типы источников питания загружены',
                data: response?.data || response || [] || POWER_SUPPLY_TYPES,
                error: response?.error || null
            };
        } catch (error) {
            console.error('[CoreTypesApi] getPowerSupplyTypesApi error:', error);
            return {
                success: false,
                message: 'Не удалось загрузить типы источников питания',
                data: POWER_SUPPLY_TYPES,
                error: error?.message || String(error)
            };
        }
    },

    /**
     * Получить тип источника питания по ID (суффикс Api)
     * @param {string} id - ID типа источника питания
     * @returns {Promise<{success: boolean, message: string, data: Object|null, error?: string}>}
     */
    getPowerSupplyTypeApi: async (id) => {
        try {
            const response = await corePowerSupplyTypeApi.getPowerSupplyTypeByIdTypeApi(id);
            return {
                success: response?.success ?? false,
                message: response?.message || 'Тип источника питания загружен',
                data: response?.data || response || null,
                error: response?.error || null
            };
        } catch (error) {
            console.error('[CoreTypesApi] getPowerSupplyTypeApi error:', error);
            return {
                success: false,
                message: 'Не удалось загрузить тип источника питания',
                data: POWER_SUPPLY_TYPES[id] || null,
                error: error?.message || String(error)
            };
        }
    },

    /**
     * Проверить совместимость типа источника питания с устройством (суффикс Api)
     * @param {string} supplyTypeId - ID типа источника питания
     * @param {string} deviceId - ID устройства
     * @returns {Promise<{success: boolean, message: string, data: Object|null, error?: string}>}
     */
    checkPowerSupplyTypeCompatibilityApi: async (supplyTypeId, deviceId) => {
        try {
            const response = await corePowerSupplyTypeApi.checkPowerSupplyTypeCompatibilityTypeApi(supplyTypeId, deviceId);
            return {
                success: response?.success ?? false,
                message: response?.message || 'Совместимость проверена',
                data: response?.data || response || null,
                error: response?.error || null
            };
        } catch (error) {
            console.error('[CoreTypesApi] checkPowerSupplyTypeCompatibilityApi error:', error);
            return {
                success: false,
                message: 'Не удалось проверить совместимость',
                data: null,
                error: error?.message || String(error)
            };
        }
    }
};

// ✅ Экспорт по умолчанию
export default CoreTypesApi;
