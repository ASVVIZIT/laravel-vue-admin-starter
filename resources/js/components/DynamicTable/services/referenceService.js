// resources/js/services/referenceService.js

import Resource from '../api/resource';

const referenceResource = new Resource('references');

export const referenceService = {
    /**
     * Получает список доступных типов справочников
     */
    async getTypes() {
        try {
            const response = await referenceResource.list({}, 'types');
            return response;
        } catch (error) {
            console.error('Ошибка загрузки типов справочников:', error);
            throw error;
        }
    },

    /**
     * Получает информацию о конкретном типе справочника
     */
    async getInfo(type) {
        try {
            const response = await referenceResource.get(type, 'info');
            return response;
        } catch (error) {
            console.error(`Ошибка загрузки информации о справочнике ${type}:`, error);
            throw error;
        }
    },

    /**
     * Получает данные справочника
     */
    async getData(type) {
        try {
            return await referenceResource.list({}, type);
        } catch (error) {
            console.error(`Ошибка загрузки данных справочника ${type}:`, error);
            throw error;
        }
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
