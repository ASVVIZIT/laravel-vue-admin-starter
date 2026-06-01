/**
 * ============================================================================
 * TRAINING USER RESOURCE — API слой для работы с пользователями (модуль Training)
 * ============================================================================
 * 📁 Путь: @/components/Training/api/core/resource/TrainingUserResource.js
 * ✅ Назначение: Единая точка доступа к эндпоинтам пользователей для шеринга тренировок
 * ============================================================================
 */

import { TrainingBaseResource } from './TrainingBaseResource.js'

export class TrainingUserResource extends TrainingBaseResource {
    /**
     * Конструктор
     * @param {string} endpoint - Базовый эндпоинт (по умолчанию /api/users)
     */
    constructor(endpoint = '/api/users') {
        super(endpoint)
    }

    /**
     * Поиск пользователей (для шеринга записей)
     * @param {string} query - Поисковый запрос
     * @param {Object} options - Доп. параметры (per_page, page и т.д.)
     * @returns {Promise<Array>} - Массив пользователей
     */
    async searchUsers(query, options = {}) {
        if (!query || query.trim().length < 2) return []

        const params = {
            search: query.trim(),
            per_page: 50,
            ...options
        }

        const response = await this.client.get(this.endpoint, { params })

        // Поддержка разных форматов ответа
        if (Array.isArray(response.data)) return response.data
        if (response.data?.data && Array.isArray(response.data.data)) return response.data.data
        return []
    }

    /**
     * Получение пользователей по списку ID (для загрузки начальных имён)
     * @param {Array<number>} ids - Массив ID пользователей
     * @returns {Promise<Array>} - Массив пользователей
     */
    async getUsersByIds(ids) {
        if (!Array.isArray(ids) || ids.length === 0) return []

        const response = await this.client.get(this.endpoint, {
            params: { id: ids.join(','), per_page: 100 }
        })

        if (Array.isArray(response.data)) return response.data
        if (response.data?.data && Array.isArray(response.data.data)) return response.data.data
        return []
    }

    /**
     * Получение текущего пользователя (если нужно)
     * @returns {Promise<Object|null>}
     */
    async getCurrentUser() {
        try {
            const response = await this.client.get(`${this.endpoint}/me`)
            return response.data?.data || response.data || null
        } catch {
            return null
        }
    }
}

export default TrainingUserResource
