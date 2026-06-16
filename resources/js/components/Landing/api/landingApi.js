import request from '@/utils/request'

export const landingApi = {
    /**
     * Получить публичный список опубликованных лендингов (БЕЗ авторизации)
     */
    async getPublicList() {
        return request.get('/landing/public')
    },

    /**
     * Получить публичный лендинг по slug (без авторизации)
     */
    async getPublic(slug) {
        return request.get(`/landing/public/${slug}`)
    },

    /**
     * Получить лендинг по ID (требует авторизации)
     */
    async getById(id) {
        return request.get(`/landing/pages/${id}`)
    },

    /**
     * Получить список лендингов (требует авторизации)
     */
    async getList() {
        return request.get('/landing/pages')
    },

    /**
     * Создать лендинг (требует авторизации)
     */
    async create(data) {
        return request.post('/landing/pages', data)
    },

    /**
     * Обновить лендинг (требует авторизации)
     */
    async update(id, data) {
        return request.put(`/landing/pages/${id}`, data)
    },

    /**
     * Удалить лендинг (требует авторизации)
     */
    async delete(id) {
        return request.delete(`/landing/pages/${id}`)
    },

    /**
     * Опубликовать/снять публикацию (требует авторизации)
     */
    async publish(id) {
        return request.post(`/landing/pages/${id}/publish`)
    },

    async getPublicMode() {
        return request.get('/api/landing/settings/public-mode')
    },

    async updatePublicMode(data) {
        return request.post('/api/landing/settings/public-mode', data)
    },

    async switchMode(mode) {
        return request.post(`/api/landing/settings/switch/${mode}`)
    }
}
