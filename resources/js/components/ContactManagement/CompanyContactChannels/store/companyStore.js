import { defineStore } from 'pinia';
import { CompanyResource } from '../api/core/CompanyResource.js';
import { getInitialPaginationState } from '../utils/paginationOptions.js';

const companyResource = new CompanyResource();

export const useCompanyStore = defineStore('company', {
    state: () => ({
        companies: [],
        loading: false,
        error: null,
        ...getInitialPaginationState(),
    }),

    getters: {
        totalPages: (state) => state.lastPage,
        pageSize: (state) => state.perPage,
    },

    actions: {
        async fetchCompanies(page = 1, size = this.perPage) {
            console.log('[Store] fetchCompanies:', { page, size });

            this.loading = true;
            this.error = null;

            if (size !== this.perPage) {
                this.perPage = size;
            }

            try {
                const response = await companyResource.getCompanies({ page, per_page: this.perPage });

                console.log('[Store] API Response:', response);

                this.companies = Array.isArray(response.data) ? response.data : response;

                // ← ВАЖНО: Сбрасываем _updating у всех компаний после загрузки
                this.companies.forEach(company => {
                    company._updating = false;
                });

                if (response.meta && typeof response.meta === 'object' && response.meta !== null) {
                    this.currentPage = response.meta.current_page;
                    this.lastPage = response.meta.last_page;
                    this.perPage = response.meta.per_page;
                    this.totalItems = response.meta.total;

                    console.log('[Store] Meta:', {
                        currentPage: this.currentPage,
                        lastPage: this.lastPage,
                        perPage: this.perPage,
                        totalItems: this.totalItems
                    });
                } else {
                    this.currentPage = page;
                    this.totalItems = this.companies.length;
                    this.lastPage = 1;
                }

            } catch (err) {
                console.error('[Store] fetchCompanies error:', err);
                this.error = err.message || 'Failed to fetch companies';
                throw err;
            } finally {
                this.loading = false;
                console.log('[Store] fetchCompanies finished, loading:', this.loading);
            }
        },

        async createCompany(companyData) {
            console.log('[Store] createCompany:', companyData);

            this.loading = true;
            this.error = null;

            try {
                const response = await companyResource.createCompany(companyData);
                console.log('[Store] createCompany success:', response);
                return response.data || response;
            } catch (err) {
                console.error('[Store] createCompany error:', err);
                this.error = err.message || 'Failed to create company';
                throw err;
            } finally {
                this.loading = false;
                console.log('[Store] createCompany finished, loading:', this.loading);
            }
        },

        async updateCompany(id, companyData) {
            console.log('[Store] updateCompany:', { id, companyData });

            this.loading = true;
            this.error = null;

            try {
                const response = await companyResource.updateCompany(id, companyData);
                const updatedCompany = response.data || response;

                console.log('[Store] updateCompany success:', updatedCompany);

                const index = this.companies.findIndex(c => c.id === id);
                if (index !== -1) {
                    this.companies.splice(index, 1, updatedCompany);
                }

                return updatedCompany;
            } catch (err) {
                console.error('[Store] updateCompany error:', err);
                this.error = err.message || 'Failed to update company';
                throw err;
            } finally {
                this.loading = false;
                console.log('[Store] updateCompany finished, loading:', this.loading);
            }
        },

        async deleteCompany(id) {
            console.log('[Store] deleteCompany:', id);

            this.loading = true;
            this.error = null;

            try {
                await companyResource.deleteCompany(id);
                this.companies = this.companies.filter(c => c.id !== id);
                console.log('[Store] deleteCompany success');
            } catch (err) {
                console.error('[Store] deleteCompany error:', err);
                this.error = err.message || 'Failed to delete company';
                throw err;
            } finally {
                this.loading = false;
                console.log('[Store] deleteCompany finished, loading:', this.loading);
            }
        },

        resetState() {
            console.log('[Store] resetState');
            this.companies = [];
            this.loading = false;
            this.error = null;
            Object.assign(this, getInitialPaginationState());
        }
    },
});
