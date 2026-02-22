import { defineStore } from 'pinia';
import { CompanyResource } from '../api/core/CompanyResource.js';
import {
    getInitialPaginationState,
    PAGE_SIZE_OPTIONS,
    CHUNK_CONFIG,
} from '../utils/paginationOptions.js';

const companyResource = new CompanyResource();

export const useCompanyStore = defineStore('company', {
    state: () => ({
        companies: [],
        allCompanies: [],
        loading: false,
        loadingInitial: false,
        loadingChunks: false,
        error: null,
        allLoaded: false,
        totalItems: 0,
        useServerPagination: false,
        allRecordsLoaded: false,
        loadedChunks: 0,
        totalChunks: 0,
        chunkSize: CHUNK_CONFIG.SIZE,
        chunkLoadingProgress: 0,
        ...getInitialPaginationState(),
    }),

    getters: {
        totalPages: (state) => state.lastPage,
        pageSize: (state) => state.perPage,
        loadedCount: (state) => state.allCompanies.length,
        loadedPercentage: (state) => {
            if (state.totalItems === 0) return 0;
            return Math.round((state.allCompanies.length / state.totalItems) * 100);
        },
        chunkProgress: (state) => {
            if (state.totalChunks === 0) return 0;
            return Math.round((state.loadedChunks / state.totalChunks) * 100);
        },
        currentChunkProgress: (state) => {
            return state.chunkLoadingProgress;
        },
    },

    actions: {
        async fetchAllCompanies() {
            if (this.allLoaded) return;

            this.loadingInitial = true;
            this.loading = true;
            this.error = null;
            this.chunkLoadingProgress = 0;

            try {
                const countResponse = await companyResource.getCompaniesCount();
                const realTotal = countResponse.total || 0;

                this.chunkLoadingProgress = 30;

                const response = await companyResource.getCompanies({
                    page: 1,
                    per_page: this.chunkSize,
                });

                this.chunkLoadingProgress = 70;

                const data = Array.isArray(response.data) ? response.data : [];

                this.allCompanies = data;
                this.companies = [...this.allCompanies];
                this.allLoaded = true;

                this.totalItems = realTotal;
                this.useServerPagination = realTotal > PAGE_SIZE_OPTIONS.MAX;
                this.allRecordsLoaded = this.allCompanies.length >= realTotal;
                this.totalChunks = Math.ceil(realTotal / this.chunkSize);
                this.loadedChunks = 1;
                this.chunkLoadingProgress = 100;

                setTimeout(() => {
                    this.chunkLoadingProgress = 0;
                }, 100);

            } catch (err) {
                this.error = err.message || 'Failed to fetch companies';
                throw err;
            } finally {
                this.loadingInitial = false;
                this.loading = false;
            }
        },

        async loadNextChunk() {
            if (this.allRecordsLoaded) return false;
            if (this.loadingChunks) return false;

            this.loadingChunks = true;
            this.error = null;

            try {
                const nextPage = this.loadedChunks + 1;
                const remainingItems = this.totalItems - this.allCompanies.length;
                const itemsToLoad = Math.min(this.chunkSize, remainingItems);

                const response = await companyResource.getCompanies({
                    page: nextPage,
                    per_page: itemsToLoad,
                });

                const data = Array.isArray(response.data) ? response.data : [];

                this.allCompanies.push(...data);
                this.companies = [...this.allCompanies];
                this.loadedChunks++;

                if (this.allCompanies.length >= this.totalItems) {
                    this.allRecordsLoaded = true;
                    this.useServerPagination = false;
                }

                return data.length > 0;

            } catch (err) {
                this.error = err.message || 'Failed to load chunk';
                throw err;
            } finally {
                this.loadingChunks = false;
            }
        },

        async loadAllRecordsChunked(delay = CHUNK_CONFIG.DELAY, onProgress = null) {
            if (this.allRecordsLoaded) return;

            this.error = null;
            this.useServerPagination = false;

            try {
                let iteration = 0;
                const maxIterations = this.totalChunks + 5;

                while (!this.allRecordsLoaded && iteration < maxIterations) {
                    iteration++;

                    const hasMore = await this.loadNextChunk();

                    if (onProgress) {
                        onProgress({
                            loaded: this.allCompanies.length,
                            total: this.totalItems,
                            percentage: this.loadedPercentage,
                            chunkProgress: this.chunkLoadingProgress,
                            chunks: {
                                loaded: this.loadedChunks,
                                total: this.totalChunks,
                            },
                        });
                    }

                    if (!hasMore) {
                        this.allRecordsLoaded = true;
                        break;
                    }

                    await new Promise((resolve) => setTimeout(resolve, delay));
                }

            } catch (err) {
                this.error = err.message || 'Failed to load all records';
                throw err;
            }
        },

        async refreshData() {
            this.loadingInitial = true;
            this.error = null;

            try {
                const countResponse = await companyResource.getCompaniesCount();
                const newTotal = countResponse.total || 0;
                const newRecords = newTotal - this.totalItems;

                if (newRecords > 0) {
                    this.totalItems = newTotal;
                    this.allRecordsLoaded = false;
                    this.totalChunks = Math.ceil(newTotal / this.chunkSize);

                    await this.loadAllRecordsChunked(CHUNK_CONFIG.DELAY, (progress) => {
                        console.log('[Store] refreshData: PROGRESS:', progress);
                    });

                    return { success: true, newRecords };
                } else {
                    return { success: true, newRecords: 0 };
                }
            } catch (err) {
                this.error = err.message || 'Failed to refresh data';
                throw err;
            } finally {
                this.loadingInitial = false;
            }
        },

        async loadPage(page, pageSize) {
            this.loading = true;
            this.error = null;
            this.useServerPagination = true;
            this.perPage = pageSize;
            this.currentPage = page;

            try {
                const response = await companyResource.getCompanies({
                    page,
                    per_page: pageSize,
                });

                const data = response.data || [];
                const meta = response.meta || {};

                this.companies = Array.isArray(data) ? data : [];
                this.companies.forEach((company) => {
                    company._updating = false;
                });

                if (meta && typeof meta.total === 'number') {
                    this.currentPage = meta.current_page || page;
                    this.lastPage = meta.last_page || 1;
                    this.perPage = meta.per_page || pageSize;
                    this.totalItems = meta.total;
                }
            } catch (err) {
                this.error = err.message || 'Failed to load page';
                throw err;
            } finally {
                this.loading = false;
            }
        },

        async fetchCompanies(page = 1, size = this.perPage) {
            return this.loadPage(page, size);
        },

        async createCompany(companyData) {
            this.loading = true;
            this.error = null;

            try {
                const response = await companyResource.createCompany(companyData);
                const newCompany = response.data || response;

                this.allCompanies.unshift(newCompany);
                this.companies.unshift(newCompany);
                this.totalItems++;

                return newCompany;
            } catch (err) {
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

                const index = this.companies.findIndex((c) => c.id === id);
                if (index !== -1) {
                    this.companies.splice(index, 1, updatedCompany);
                }

                const allIndex = this.allCompanies.findIndex((c) => c.id === id);
                if (allIndex !== -1) {
                    this.allCompanies.splice(allIndex, 1, updatedCompany);
                }

                return updatedCompany;
            } catch (err) {
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

                this.companies = this.companies.filter((c) => c.id !== id);
                this.allCompanies = this.allCompanies.filter((c) => c.id !== id);
                this.totalItems--;
            } catch (err) {
                this.error = err.message || 'Failed to delete company';
                throw err;
            } finally {
                this.loading = false;
            }
        },

        resetState() {
            this.companies = [];
            this.allCompanies = [];
            this.allLoaded = false;
            this.loading = false;
            this.loadingInitial = false;
            this.loadingChunks = false;
            this.chunkLoadingProgress = 0;
            this.error = null;
            this.totalItems = 0;
            this.useServerPagination = false;
            this.allRecordsLoaded = false;
            this.loadedChunks = 0;
            this.totalChunks = 0;
            Object.assign(this, getInitialPaginationState());
        },
    },
});
