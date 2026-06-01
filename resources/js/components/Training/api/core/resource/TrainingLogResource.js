/**
 * ============================================================================
 * TRAINING LOG RESOURCE — ЖУРНАЛ, СТАТИСТИКА, ШЕРИНГ
 * ============================================================================
 * 📁 Путь: @/components/Training/api/core/resource/TrainingLogResource.js
 * ✅ Эндпоинты: logs/*, stats/*, users/*shared
 * ============================================================================
*/

import { TrainingBaseResource } from './TrainingBaseResource.js'
import { logDebugUtils } from '../utils/coreApiLoggerUtils.js'

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
    async getSharedResource(username, params = {}) {
        logDebugUtils('TrainingLogResource', 'getSharedResource', { username, params })
        return this.getBase(`/users/${username}/shared`, params)
    }
}

export default TrainingLogResource
