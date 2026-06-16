/**
 * API для работы с лендингами
 */
import request from '@/utils/request'

export const landingApi = {
    async getPublic(slug) {
        return request.get(`/landing/${slug}`)
    },

    async getById(id) {
        return request.get(`/landing/pages/${id}`)
    },

    async getList() {
        return request.get('/landing/pages')
    },

    async create(data) {
        return request.post('/landing/pages', data)
    },

    async update(id, data) {
        return request.put(`/landing/pages/${id}`, data)
    },

    async delete(id) {
        return request.delete(`/landing/pages/${id}`)
    },

    async publish(id) {
        return request.post(`/landing/pages/${id}/publish`)
    }
}
