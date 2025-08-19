// resources/js/components/DynamicTable/services/apiService.js
import tableApi from '../api/tableApi';
import { rowApi } from '../api/rowApi';
import { referenceApi } from '../api/referenceApi';

export class ApiService {
    /**
     * Получение списка шаблонов
     */
    async list(params) {
        return await tableApi.list(params);
    }

    /**
     * Получение шаблона по ID
     */
    async get(id) {
        return await tableApi.get(id);
    }

    /**
     * Создание нового шаблона
     */
    async store(data) {
        return await tableApi.store(data);
    }

    /**
     * Обновление шаблона
     */
    async update(id, data) {
        return await tableApi.update(id, data);
    }

    /**
     * Удаление шаблона
     */
    async destroy(id) {
        return await tableApi.destroy(id);
    }

    /**
     * Загрузка данных таблицы
     */
    async fetchTableData(params) {
        return await rowApi.list(params);
    }

    /**
     * Загрузка дочерних строк
     */
    async fetchChildRows(parentId, params) {
        return await rowApi.listChildren(parentId, params);
    }

    /**
     * Создание новой строки
     */
    async createRow(data) {
        return await rowApi.store(data);
    }

    /**
     * Обновление строки
     */
    async updateRow(id, data) {
        return await rowApi.update(id, data);
    }

    /**
     * Удаление строки
     */
    async deleteRow(id) {
        return await rowApi.destroy(id);
    }

    /**
     * Получение списка типов справочников
     */
    async getReferenceTypes() {
        return await referenceApi.getTypes();
    }

    /**
     * Получение данных справочника
     */
    async getReferenceData(entityType) {
        return await referenceApi.getData(entityType);
    }
}
