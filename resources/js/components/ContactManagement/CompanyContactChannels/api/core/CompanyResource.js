// resources/js/components/ContactManagement/CompanyContactChannels/api/core/CompanyResource.js
import { BaseResource } from '@components/ContactManagement/CompanyContactChannels/api/core/BaseResource.js';

export class CompanyResource extends BaseResource {
    constructor() {
        super('companies');
    }

    // Получить все компании (переопределяем, если нужно особое поведение)
    async getCompanies(params = {}) {
        return this.get('', params); // params могут содержать page, per_page и т.д.
    }

    // Получить одну компанию по ID
    async getCompanyById(id) {
        return this.get(`/${id}`);
    }

    // Создать новую компанию
    async createCompany(data) {
        return this.post('', data);
    }

    // Обновить существующую компанию
    async updateCompany(id, data) {
        return this.put(`/${id}`, data);
    }

    // Удалить компанию
    async deleteCompany(id) {
        return this.delete(`/${id}`);
    }

    // Добавьте другие специфичные методы, если нужно
    // Например, получить каналы связи компании: async getCompanyChannels(id) { ... }
}
