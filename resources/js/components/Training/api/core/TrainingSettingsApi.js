/**
 * ============================================================================
 * TRAINING SETTINGS API — ОБЁРТКА НАД RESOURCE
 * ============================================================================
 * 📁 Путь: @/components/Training/api/core/TrainingSettingsApi.js
 * ✅ Используется: TrainingSettingsService, Stores
 * ✅ Рефакторинг: методы с суффиксом Api(), вызовы через Resource()
 * ✅ Контракт: возвращает { success, message, data, error }
 * ============================================================================
 */

import { TrainingSettingsResource } from './resource/TrainingSettingsResource.js'
import { logDebugUtils, logErrorUtils } from './utils/coreApiLoggerUtils.js'

const resource = new TrainingSettingsResource()

export const TrainingSettingsApi = {
    /**
     * Получить все настройки (server + frontend + grouping)
     * @param {string} tab - Вкладка для определения режима группировки
     */
    async getSettingsApi(tab = 'mine') {
        logDebugUtils('TrainingSettingsApi', 'getSettingsApi called', { tab })
        try {
            const response = await resource.getSettingsResource(tab)
            return {
                success: true,
                message: 'Настройки загружены',
                data: response?.data || response
            }
        } catch (error) {
            logErrorUtils('TrainingSettingsApi', 'getSettingsApi error', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Ошибка загрузки настроек',
                error: error.response?.data || error
            }
        }
    },

    /**
     * Обновить настройки (только админ)
     * @param {Object} settings - { server: {...}, frontend: {...} }
     */
    async updateSettingsApi(settings) {
        logDebugUtils('TrainingSettingsApi', 'updateSettingsApi called', { settings })
        try {
            const response = await resource.updateSettingsResource(settings)
            return {
                success: true,
                message: 'Настройки обновлены',
                data: response?.data || response
            }
        } catch (error) {
            logErrorUtils('TrainingSettingsApi', 'updateSettingsApi error', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Ошибка обновления настроек',
                error: error.response?.data || error
            }
        }
    },

    /**
     * Получить только серверные настройки
     */
    async getServerSettingsApi() {
        logDebugUtils('TrainingSettingsApi', 'getServerSettingsApi called')
        try {
            const data = await resource.getServerSettingsResource()
            return {
                success: true,
                message: 'Серверные настройки загружены',
                data
            }
        } catch (error) {
            logErrorUtils('TrainingSettingsApi', 'getServerSettingsApi error', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Ошибка загрузки серверных настроек',
                error: error.response?.data || error
            }
        }
    },

    /**
     * Получить только фронтенд-настройки
     */
    async getFrontendSettingsApi() {
        logDebugUtils('TrainingSettingsApi', 'getFrontendSettingsApi called')
        try {
            const data = await resource.getFrontendSettingsResource()
            return {
                success: true,
                message: 'Фронтенд-настройки загружены',
                data
            }
        } catch (error) {
            logErrorUtils('TrainingSettingsApi', 'getFrontendSettingsApi error', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Ошибка загрузки фронтенд-настроек',
                error: error.response?.data || error
            }
        }
    },

    /**
     * Получить текущий режим группировки для вкладки
     * @param {string} tab - Вкладка
     */
    async getGroupingModeApi(tab = 'mine') {
        logDebugUtils('TrainingSettingsApi', 'getGroupingModeApi called', { tab })
        try {
            const data = await resource.getGroupingModeResource(tab)
            return {
                success: true,
                message: 'Режим группировки определён',
                data
            }
        } catch (error) {
            logErrorUtils('TrainingSettingsApi', 'getGroupingModeApi error', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Ошибка определения режима',
                error: error.response?.data || error,
                data: { mode: 'frontend', reason: 'Error fallback' }
            }
        }
    }
}

export default TrainingSettingsApi
