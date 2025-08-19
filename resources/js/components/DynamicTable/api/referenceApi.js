// resources/js/api/referenceApi.js
import request from '@/utils/request';

export const referenceApi = {
    // Получение списка типов справочников
    getTypes() {
        return request({
            url: 'references/types',
            method: 'get'
        });
    },

    // Получение данных справочника по типу
    getData(entityType) {
        // Убираем завершающий слэш из entityType
        const cleanEntityType = entityType.replace(/\/$/, '');

        return request({
            url: `references/${cleanEntityType}`,
            method: 'get'
        });
    },

    // Получение информацию о структуре справочника
    getInfo(entityType) {
        // Убираем завершающий слэш из entityType
        const cleanEntityType = entityType.replace(/\/$/, '');

        return request({
            url: `references/info/${cleanEntityType}`,
            method: 'get'
        });
    },
};
