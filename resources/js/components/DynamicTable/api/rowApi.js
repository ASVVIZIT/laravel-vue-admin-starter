// resources/js/api/rowApi.js
import request from '@/utils/request';

export const rowApi = {
    // Получение строк таблицы
    list(params) {
        return request({
            url: 'table-rows',
            method: 'get',
            params
        });
    },

    // Создание новой строки
    create(data) {
        return request({
            url: 'table-rows',
            method: 'post',
            data
        });
    },

    // Обновление строки
    update(id, data) {
        return request({
            url: `table-rows/${id}`,
            method: 'put',
            data
        });
    },

    // Удаление строки
    delete(id) {
        return request({
            url: `table-rows/${id}`,
            method: 'delete'
        });
    }
};
