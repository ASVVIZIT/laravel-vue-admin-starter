import request from '@/utils/request'

const CACHE_TTL = 60000
let cache = { data: null, timestamp: 0 }

export const siteModeApi = {
    async get() {
        try {
            const response = await request.get('/landing/settings/public-mode')
            return response.data || response
        } catch (error) {
            return { mode: 'maintenance' }
        }
    },

    async getCached() {
        const now = Date.now()
        if (cache.data && (now - cache.timestamp) < CACHE_TTL) {
            return cache.data
        }
        const data = await this.get()
        cache = { data, timestamp: now }
        return data
    },

    // ✅ ИСПРАВЛЕНО: новый путь /switch/{mode}
    async switch(mode) {
        const result = await request.post(`/landing/settings/switch/${mode}`)
        this.clearCache()
        return result
    },

    async update(data) {
        const result = await request.post('/landing/settings/public-mode', data)
        this.clearCache()
        return result
    },

    clearCache() {
        cache = { data: null, timestamp: 0 }
    }
}
