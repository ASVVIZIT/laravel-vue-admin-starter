// resources/js/components/DynamicTable/services/apiService.js
import tableApi from '@/api/tableApi';
import rowApi from '@/api/rowApi';

export class ApiService {
    /**
     * Загрузка шаблона таблицы
     */
    async fetchTemplate(templateId) {
        return await tableApi.get(templateId);
    }

    /**
     * Загрузка данных таблицы
     */
    async fetchTableData(params) {
        return await rowApi.list({
            template_id: params.template_id,
            parent_id: params.parent_id,
            page: params.page,
            per_page: params.per_page
        });
    }

    /**
     * Загрузка дочерних строк
     */
    async fetchChildRows(params) {
        return await rowApi.list({
            template_id: params.template_id,
            parent_id: params.parent_id,
            per_page: 100
        });
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
}
