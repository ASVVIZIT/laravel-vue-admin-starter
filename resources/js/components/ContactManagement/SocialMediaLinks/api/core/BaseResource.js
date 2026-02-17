// resources/js/components/ContactManagement/SocialMediaLinks/api/core/BaseResource.js
import request from '@utils/request.js'; // Импортируем глобальный axios-клиент

export class BaseResource {
    // Конструктор принимает базовый путь к API
    constructor(basePath) {
        this.basePath = basePath;
    }

    // Метод GET
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

    // Метод POST
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

    // Метод PUT
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

    // Метод DELETE
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

    // Вспомогательный метод для построения URL
    buildUrl(path = '') {
        if (!path) return this.basePath;
        // Убираем завершающий слеш из basePath
        let basePath = this.basePath.endsWith('/') ? this.basePath.slice(0, -1) : this.basePath;
        // Убираем начальный слеш из path
        path = path.startsWith('/') ? path.slice(1) : path;
        return `${basePath}/${path}`;
    }

    // Вспомогательный метод для обработки ошибок
    handleNetworkError(error) {
        console.error('Network error in BaseResource:', error);
        if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
            throw new Error('Connection error. Please check network settings.');
        }
        if (error.response) {
            throw new Error(`Server error: ${error.response.status} ${error.response.data.message || error.response.data.error || error.response.statusText}`);
        }
        throw error;
    }
}
