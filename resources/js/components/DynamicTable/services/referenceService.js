// resources/js/services/referenceService.js

import Resource from '../api/resource';

const referenceResource = new Resource('references');

export const referenceService = {
    /**
     * Получение списка типов справочников
     */
    async getTypes() {
        try {
            const response = await referenceResource.list({}, 'types');
            return response.data || [];
        } catch (error) {
            console.error('Ошибка загрузки типов справочников:', error);
            throw error;
        }
    },

    /**
     * Получение информации о конкретном типе справочника
     * (Может быть полезно для получения дополнительной информации о модели)
     */
    async getInfo(modelName) {
        if (!modelName) {
            console.warn('referenceService.getInfo: modelName is required');
            return Promise.resolve({});
        }

        try {
            // Делаем запрос к API: GET /api/references/{modelName}/info
            // Например, GET /api/references/accessory/info
            const response = await referenceResource.get(modelName, 'info'); // get(id, entityType)
            return response.data || {};
        } catch (error) {
            console.error(`referenceService.getInfo: Error fetching info for "${modelName}":`, error);
            return {};
        }
    },

    /**
     * УНИВЕРСАЛЬНЫЙ метод для получения данных справочника по типу (модели)
     * @param {string} modelName - Название модели в snake_case (например, 'accessory', 'brand')
     * @param {Object} params - Дополнительные параметры запроса (search, for_dropdown, per_page и т.д.)
     * @returns {Promise<Object>} - Промис с данными справочника
     */
    async getData(modelName, params = {}) {
        if (!modelName) {
            console.warn('referenceService.getData: modelName is required');
            return Promise.resolve({ data: [], meta: {} });
        }

        try {
            // Делаем запрос к универсальному API: GET /api/references/{modelName}?...
            // Например, GET /api/references/accessory?search=ABB&for_dropdown=1
            const response = await referenceResource.list(params, modelName); // list(params, entityType)
            // Предполагаем, что данные находятся в response.data, а метаинформация в response.meta
            return {
                data: response.data || [],
                meta: response.meta || {}
            };
        } catch (error) {
            console.error(`referenceService.getData: Error fetching data for "${modelName}":`, error);
            // ВАЖНО: Возвращаем пустой массив вместо того, чтобы "ломать" вызывающий код исключением
            return { data: [], meta: {} };
        }
    },


    /**
     * Получение данных справочника
     * @param {string} modelName - Название модели в snake_case (например, 'accessory', 'brand')
     * @returns {Promise<Array>} - Промис с массивом данных справочника
     */
    async getReferenceData(modelName) {
        if (this.source === 'mock') {
            return this.getMockReferenceData(modelName);
        }

        // ИСПОЛЬЗУЕМ НОВЫЙ УНИВЕРСАЛЬНЫЙ referenceService.getData
        // Передаем modelName и параметр for_dropdown: true для получения всех записей
        const response = await referenceService.getData(modelName, { for_dropdown: true });
        return response.data || [];
    },

    async getAllReferenceData() {
        try {
            const types = await this.getTypes();
            const referenceData = {};

            for (const type of types) {
                referenceData[type.value] = await this.getData(type.value);
            }

            return referenceData;
        } catch (error) {
            console.error('Ошибка загрузки всех данных справочников:', error);
            throw error;
        }
    }
};
