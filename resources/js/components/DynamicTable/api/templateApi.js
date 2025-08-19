// resources/js/api/templateApi.js
import request from '@/utils/request';

export const templateApi = {
    // Получение списка шаблонов
    list(params) {
        return request({
            url: 'templates',
            method: 'get',
            params
        });
    },

    // Получение шаблона по ID
    get(id) {
        return request({
            url: `templates/${id}`,
            method: 'get'
        });
    },

    // Создание нового шаблона
    create(data) {
        return request({
            url: 'templates',
            method: 'post',
            data
        });
    },

    // Обновление шаблона
    update(id, data) {
        return request({
            url: `templates/${id}`,
            method: 'put',
            data
        });
    },

    // Удаление шаблона
    delete(id) {
        return request({
            url: `templates/${id}`,
            method: 'delete'
        });
    }
};
