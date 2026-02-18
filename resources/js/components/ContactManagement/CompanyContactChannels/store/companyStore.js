import { defineStore } from 'pinia';
import { CompanyResource } from '../api/core/CompanyResource.js';

const companyResource = new CompanyResource();

export const useCompanyStore = defineStore('company', {
    state: () => ({
        companies: [],
        loading: false,
        error: null,
        currentPage: 1,
        lastPage: 1,
        perPage: 15,
        totalItems: 0,
    }),

    getters: {
        totalPages: (state) => state.lastPage,
        pageSize: (state) => state.perPage,
    },

    actions: {
        async fetchCompanies(page = 1, size = this.perPage) {
            console.log("STORE: fetchCompanies called with page:", page, "and size:", size);
            this.loading = true;
            this.error = null;

            // Обновляем perPage в состоянии store
            if (size !== this.perPage) {
                console.log("STORE: Updating perPage from", this.perPage, "to", size);
                this.perPage = size;
            }

            try {
                const response = await companyResource.getCompanies({ page, per_page: this.perPage });

                console.log("STORE: Raw API Response received:", response);

                // Обновляем список компаний
                this.companies = Array.isArray(response.data) ? response.data : response;

                // Обновляем пагинацию из meta
                if (response.meta && typeof response.meta === 'object' && response.meta !== null) {
                    console.log("STORE: Pagination meta found:", response.meta);

                    this.currentPage = response.meta.current_page;
                    this.lastPage = response.meta.last_page;
                    this.perPage = response.meta.per_page;
                    this.totalItems = response.meta.total;

                    console.log("STORE: Pagination updated - lastPage:", this.lastPage, "totalItems:", this.totalItems);
                } else {
                    console.warn("STORE: No meta in response. Using fallback.");
                    this.currentPage = page;
                    this.totalItems = this.companies.length;
                    this.lastPage = 1;
                }

            } catch (err) {
                console.error('STORE: Error fetching companies:', err);
                this.error = err.message || 'Failed to fetch companies';
                throw err;
            } finally {
                this.loading = false;
            }
        },

        async createCompany(companyData) {
            this.loading = true;
            this.error = null;
            try {
                const response = await companyResource.createCompany(companyData);
                return response.data || response;
            } catch (err) {
                console.error('STORE: Error creating company:', err);
                this.error = err.message || 'Failed to create company';
                throw err;
            } finally {
                this.loading = false;
            }
        },

        async updateCompany(id, companyData) {
            this.loading = true;
            this.error = null;
            try {
                const response = await companyResource.updateCompany(id, companyData);
                const updatedCompany = response.data || response;
                const index = this.companies.findIndex(c => c.id === id);
                if (index !== -1) {
                    this.companies.splice(index, 1, updatedCompany);
                }
                return updatedCompany;
            } catch (err) {
                console.error('STORE: Error updating company:', err);
                this.error = err.message || 'Failed to update company';
                throw err;
            } finally {
                this.loading = false;
            }
        },

        async deleteCompany(id) {
            this.loading = true;
            this.error = null;
            try {
                await companyResource.deleteCompany(id);
                this.companies = this.companies.filter(c => c.id !== id);
            } catch (err) {
                console.error('STORE: Error deleting company:', err);
                this.error = err.message || 'Failed to delete company';
                throw err;
            } finally {
                this.loading = false;
            }
        },

        resetState() {
            this.companies = [];
            this.loading = false;
            this.error = null;
        }
    },
});
