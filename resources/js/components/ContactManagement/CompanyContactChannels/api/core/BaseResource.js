import request from '@/utils/request.js';

export class BaseResource {
    constructor(basePath) {
        this.basePath = basePath;
    }

    async get(path = '', params = {}) {
        const url = this.buildUrl(path);
        try {
            const response = await request({
                url,
                method: 'get',
                params
            });
            // request.js УЖЕ вернул response.data
            // Возвращаем response КАК ЕСТЬ, чтобы сохранить meta и links
            return response; // <-- ИСПРАВЛЕНО: было response.data
        } catch (error) {
            this.handleNetworkError(error);
            throw error;
        }
    }

    async post(path, data = {}) {
        const url = this.buildUrl(path);
        try {
            const response = await request({
                url,
                method: 'post',
                data
            });
            return response; // <-- ИСПРАВЛЕНО
        } catch (error) {
            this.handleNetworkError(error);
            throw error;
        }
    }

    async put(path, data = {}) {
        const url = this.buildUrl(path);
        try {
            const response = await request({
                url,
                method: 'put',
                data
            });
            return response; // <-- ИСПРАВЛЕНО
        } catch (error) {
            this.handleNetworkError(error);
            throw error;
        }
    }

    async delete(path) {
        const url = this.buildUrl(path);
        try {
            const response = await request({
                url,
                method: 'delete',
            });
            return response; // <-- ИСПРАВЛЕНО
        } catch (error) {
            this.handleNetworkError(error);
            throw error;
        }
    }

    buildUrl(path = '') {
        if (!path) return this.basePath;
        let basePath = this.basePath.endsWith('/') ? this.basePath.slice(0, -1) : this.basePath;
        path = path.startsWith('/') ? path.slice(1) : path;
        return `${basePath}/${path}`;
    }

    handleNetworkError(error) {
        console.error('Network error in BaseResource:', error);
        if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
            throw new Error('Connection error. Please check network settings.');
        }
        if (error.response) {
            const serverMsg = error.response.data?.message || error.response.data?.error || error.response.statusText;
            throw new Error(`Server error: ${error.response.status} ${serverMsg}`);
        }
        throw error;
    }
}
