/**
 * ============================================================================
 * TRAINING LOG RESOURCE — ЖУРНАЛ, СТАТИСТИКА, ШЕРИНГ, ГРУППИРОВКА
 * ============================================================================
 * 📁 Путь: @/components/Training/api/core/resource/TrainingLogResource.js
 * ✅ Эндпоинты: logs/*, stats/*, users/*shared, logs/grouped
 * ============================================================================
 */

import { TrainingBaseResource } from './TrainingBaseResource.js'
import { logDebugUtils, logErrorUtils } from '../utils/coreApiLoggerUtils.js'

export class TrainingLogResource extends TrainingBaseResource {
    constructor() {
        super('/training')
    }

    // ===== CRUD =====
    async getListResource(params = {}) {
        logDebugUtils('TrainingLogResource', 'getListResource', params)
        return this.getBase('/logs', params)
    }

    async createResource(data) {
        logDebugUtils('TrainingLogResource', 'createResource', data)
        return this.postBase('/logs', data)
    }

    async updateResource(id, data) {
        logDebugUtils('TrainingLogResource', 'updateResource', { id, data })
        return this.putBase(`/logs/${id}`, data)
    }

    async deleteResource(id) {
        logDebugUtils('TrainingLogResource', 'deleteResource', { id })
        return this.deleteBase(`/logs/${id}`)
    }

    // ===== ACTIONS =====
    async restoreResource(id) {
        logDebugUtils('TrainingLogResource', 'restoreResource', { id })
        return this.postBase(`/logs/${id}/restore`)
    }

    async forceDeleteResource(id) {
        logDebugUtils('TrainingLogResource', 'forceDeleteResource', { id })
        return this.deleteBase(`/logs/${id}/force`)
    }

    // ===== STATS =====
    async getStatsResource(params = {}) {
        logDebugUtils('TrainingLogResource', 'getStatsResource', params)
        return this.getBase('/stats', params)
    }

    async getSummaryResource() {
        logDebugUtils('TrainingLogResource', 'getSummaryResource')
        return this.getBase('/stats/summary')
    }

    // ===== SHARING =====
    async getSharedResource(userId, params = {}) {
        logDebugUtils('TrainingLogResource', 'getSharedResource', { userId, params })
        return this.getBase(`/users/${userId}/shared`, params)
    }

    // ===== 🔥 СЕРВЕРНАЯ ГРУППИРОВКА =====
    /**
     * Получить сгруппированные записи (серверная группировка)
     * @param {Object} params - Параметры:
     *   - tab: 'mine' | 'shared-with-me' | 'shared-by-me'
     *   - group_by: 'user' | 'exercise' | 'date'
     *   - page, per_page (пагинация по группам)
     * @returns {Promise<Object>} { success, data: [...groups], meta: { pagination, grouping } }
     */
    async getGroupedLogsResource(params = {}) {
        logDebugUtils('TrainingLogResource', 'getGroupedLogsResource', params)
        try {
            const response = await this.getBase('/logs/grouped', params)
            return response
        } catch (error) {
            logErrorUtils('TrainingLogResource', 'getGroupedLogsResource error', error)
            throw error
        }
    }
}

export default TrainingLogResource
