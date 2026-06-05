/**
 * ============================================================================
 * TRAINING SETTINGS RESOURCE — НАСТРОЙКИ МОДУЛЯ TRAINING
 * ============================================================================
 * 📁 Путь: @/components/Training/api/core/resource/TrainingSettingsResource.js
 * ✅ Эндпоинты: settings/*
 * ✅ Рефакторинг: методы с суффиксом Resource(), логирование через logDebugUtils
 * ============================================================================
 */

import { TrainingBaseResource } from './TrainingBaseResource.js'
import { logDebugUtils, logErrorUtils } from '../utils/coreApiLoggerUtils.js'

export class TrainingSettingsResource extends TrainingBaseResource {
    constructor() {
        super('/training/settings')
    }

    /**
     * Получить все настройки (разделённые на server/frontend + grouping)
     * @param {string} tab - Вкладка для определения режима группировки
     * @returns {Promise<Object>} { success, data: { server, frontend, grouping } }
     */
    async getSettingsResource(tab = 'mine') {
        logDebugUtils('TrainingSettingsResource', 'getSettingsResource', { tab })
        try {
            const response = await this.getBase('', { tab })
            return response
        } catch (error) {
            logErrorUtils('TrainingSettingsResource', 'getSettingsResource error', error)
            throw error
        }
    }

    /**
     * Обновить настройки (только админ)
     * @param {Object} settings - Настройки в формате { server: {...}, frontend: {...} }
     * @returns {Promise<Object>} { success, message, data }
     */
    async updateSettingsResource(settings) {
        logDebugUtils('TrainingSettingsResource', 'updateSettingsResource', { settings })
        try {
            const response = await this.putBase('', settings)
            return response
        } catch (error) {
            logErrorUtils('TrainingSettingsResource', 'updateSettingsResource error', error)
            throw error
        }
    }

    /**
     * Получить только серверные настройки
     * @returns {Promise<Object>} Серверные настройки
     */
    async getServerSettingsResource() {
        logDebugUtils('TrainingSettingsResource', 'getServerSettingsResource')
        try {
            const response = await this.getSettingsResource()
            return response?.data?.server || {}
        } catch (error) {
            logErrorUtils('TrainingSettingsResource', 'getServerSettingsResource error', error)
            return {}
        }
    }

    /**
     * Получить только фронтенд-настройки
     * @returns {Promise<Object>} Фронтенд-настройки
     */
    async getFrontendSettingsResource() {
        logDebugUtils('TrainingSettingsResource', 'getFrontendSettingsResource')
        try {
            const response = await this.getSettingsResource()
            return response?.data?.frontend || {}
        } catch (error) {
            logErrorUtils('TrainingSettingsResource', 'getFrontendSettingsResource error', error)
            return {}
        }
    }

    /**
     * Получить текущий режим группировки для вкладки
     * @param {string} tab - Вкладка
     * @returns {Promise<Object>} { mode, server_by, reason, count, threshold }
     */
    async getGroupingModeResource(tab = 'mine') {
        logDebugUtils('TrainingSettingsResource', 'getGroupingModeResource', { tab })
        try {
            const response = await this.getSettingsResource(tab)
            return response?.data?.grouping || { mode: 'frontend', reason: 'Fallback' }
        } catch (error) {
            logErrorUtils('TrainingSettingsResource', 'getGroupingModeResource error', error)
            return { mode: 'frontend', reason: 'Error fallback' }
        }
    }
}

export default TrainingSettingsResource
