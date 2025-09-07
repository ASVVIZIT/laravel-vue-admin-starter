// resources/js/components/DynamicTable/services/templateService.js
import Resource from '../api/resource';
const templateResource = new Resource('templates');

export const templateService = {
    /** Получение списка шаблонов */
    async list(params = {}) {
        try {
            const response = await templateResource.list(params);
            return response;
        } catch (error) {
            console.error('Ошибка загрузки шаблонов:', error);
            throw error;
        }
    },

    /** Получение шаблона по ID */
    async get(id) {
        try {
            const response = await templateResource.get(id);
            return response;
        } catch (error) {
            console.error(`Ошибка загрузки шаблона ${id}:`, error);
            throw error;
        }
    },

    /** Создание шаблона */
    async create(data) {
        try {
            const response = await templateResource.store(data);
            return response;
        } catch (error) {
            console.error('Ошибка создания шаблона:', error);
            throw error;
        }
    },

    /** Обновление шаблона */
    async update(id, data) {
        try {
            const response = await templateResource.update(id, data);
            return response;
        } catch (error) {
            console.error(`Ошибка обновления шаблона ${id}:`, error);
            throw error;
        }
    }
};
