// resources/js/api/rowApi.js
import request from '@/utils/request';

const API_URL = '/table-rows';

const rowApi = {
    list: async (params = {}) => {
        const response = await request({
            url: API_URL,
            method: 'get',
            params
        });
        return response.data || response;
    },

    get: async (id) => {
        const response = await request({
            url: `${API_URL}/${id}`,
            method: 'get'
        });
        return response.data || response;
    },

    store: async (data) => {
        const response = await request({
            url: API_URL,
            method: 'post',
            data
        });
        return response.data || response;
    },

    update: async (id, data) => {
        if (!id) {
            throw new Error('ID строки не определен');
        }
        const response = await request({
            url: `${API_URL}/${id}`,
            method: 'put',
            data
        });
        return response.data || response;
    },

    destroy: async (id) => {
        if (!id) {
            throw new Error('ID строки не определен');
        }
        const response = await request({
            url: `${API_URL}/${id}`,
            method: 'delete'
        });
        return response.data || response;
    },

    listChildren: async (parentId, params = {}) => {
        // Добавляем проверку ID
        if (parentId === null || parentId === undefined) {
            throw new Error('ID родительской строки не определен');
        }
        const response = await request({
            url: API_URL,
            method: 'get',
            params: {
                parent_id: parentId,
                ...params
            }
        });
        return response.data || response;
    }
};

export default rowApi;
