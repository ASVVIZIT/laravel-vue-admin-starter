import { BaseResource } from './BaseResource.js';

export class CompanyResource extends BaseResource {
    constructor() {
        super('companies');
    }

    async getCompanies(params = {}) {
        return this.get('', params);
    }

    async getCompaniesCount(params = {}) {
        return this.get('meta/total', params);
    }

    async getCompanyById(id) {
        return this.get(`/${id}`);
    }

    async createCompany(data) {
        return this.post('', data);
    }

    async updateCompany(id, data) {
        return this.put(`/${id}`, data);
    }

    async deleteCompany(id) {
        return this.delete(`/${id}`);
    }
}
