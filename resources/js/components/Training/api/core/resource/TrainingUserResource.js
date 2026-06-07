import { TrainingBaseResource } from './TrainingBaseResource.js'

export class TrainingUserResource extends TrainingBaseResource {
    constructor() {
        super('/training')
    }

    async searchUsers(query, options = {}) {
        if (!query || query.trim().length < 2) return []

        const params = {
            search: query.trim(),
            // 🔥 per_page НЕ задаём жёстко — бэкенд сам применит лимит из TrainingSettingsController::LIMITS
            // Если нужно переопределить — передаём через options: searchUsers(query, { per_page: 50 })
            ...options
        }

        const response = await this.getBase('/users/search', params)

        if (Array.isArray(response)) return response
        if (response?.data && Array.isArray(response.data)) return response.data
        return response || []
    }

    async getUsersByIds(ids) {
        if (!Array.isArray(ids) || ids.length === 0) return []

        const params = { ids: ids.join(',') }
        const response = await this.getBase('/users/by-ids', params)

        if (Array.isArray(response)) return response
        if (response?.data && Array.isArray(response.data)) return response.data
        return response || []
    }

    async getCurrentUser() {
        try {
            const response = await this.getBase('/users/me')
            return response?.data || response || null
        } catch {
            return null
        }
    }
}

export default TrainingUserResource
