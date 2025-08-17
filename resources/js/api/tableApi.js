// resources/js/api/tableApi.js
import request from '@/utils/request';

const API_URL = '/templates';

const tableApi = {
    list: async (params = {}) => {
        const response = await request({
            url: API_URL,
            method: 'get',
            params
        });
        return response;
    },

    get: async (id) => {
        const response = await request({
            url: `${API_URL}/${id}`,
            method: 'get'
        });
        return response;
    },

    store: async (data) => {
        const response = await request({
            url: API_URL,
            method: 'post',
            data
        });
        return response;
    },

    update: async (id, data) => {
        const response = await request({
            url: `${API_URL}/${id}`,
            method: 'put',
            data
        });
        return response;
    },

    destroy: async (id) => {
        const response = await request({
            url: `${API_URL}/${id}`,
            method: 'delete'
        });
        return response;
    },

    // Метод для работы с дочерними элементами
    listChildren: async (parentId, params = {}) => {
        const response = await request({
            url: '/table-rows',
            method: 'get',
            params: {
                parent_id: parentId,
                ...params
            }
        });
        return response;
    }
};

export default tableApi;
