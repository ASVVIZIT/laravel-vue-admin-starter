// resources/js/components/SmartLight/api/core/BaseResource.js
import request from '@/utils/request.js';

export class BaseResource {
    constructor(basePath) {
        this.basePath = basePath;
    }

    async get(path = '', params = {}) {
        const url = this.buildUrl(path);
        try {
            return await request({
                url,
                method: 'get',
                params
            });
        } catch (error) {
            this.handleNetworkError(error);
            throw error;
        }
    }

    async post(path, data = {}) {
        const url = this.buildUrl(path);
        try {
            return await request({
                url,
                method: 'post',
                data
            });
        } catch (error) {
            this.handleNetworkError(error);
            throw error;
        }
    }

    async put(path, data = {}) {
        const url = this.buildUrl(path);
        try {
            return await request({
                url,
                method: 'put',
                data
            });
        } catch (error) {
            this.handleNetworkError(error);
            throw error;
        }
    }

    async delete(path) {
        const url = this.buildUrl(path);
        try {
            return await request({
                url,
                method: 'delete',
            });
        } catch (error) {
            this.handleNetworkError(error);
            throw error;
        }
    }

    buildUrl(path = '') {
        if (!path) return this.basePath;
        return `${this.basePath}${path.startsWith('/') ? '' : '/'}${path}`;
    }

    handleNetworkError(error) {
        console.error('Network error - check CORS configuration');
        if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
            throw new Error('Ошибка соединения с сервером. Проверьте CORS настройки');
        }
    }
}
