import { defineStore } from 'pinia';
import { CompanyResource } from '../api/core/CompanyResource.js';
import {
    getInitialPaginationState,
    PAGE_SIZE_OPTIONS,
    CHUNK_CONFIG,
} from '../utils/appConfig.js';

const companyResource = new CompanyResource();

export const useCompanyStore = defineStore('company', {
    state: () => ({
        companies: [],
        allCompanies: [],
        loading: false,
        loadingInitial: false,
        loadingChunks: false,
        chunkLoadingProgress: 0,
        error: null,
        allLoaded: false,
        allRecordsLoaded: false,
        ...getInitialPaginationState(),
        totalItems: 0,
        loadedChunks: 0,
        totalChunks: 0,
        chunkSize: CHUNK_CONFIG.SIZE,
        useServerPagination: false,
        refreshBackup: null,

        // ★★★ ДЛЯ ФИЛЬТРАЦИИ ★★★
        searchQuery: '',
        filterHasIcon: '',
        sortBy: 'id_asc',
        filteredCount: 0,
        filteredTotalPages: 0,
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
        // ========================================================================
        // ЦЕНТРАЛИЗОВАННЫЙ ПЕРЕСЧЁТ ПАГИНАЦИИ
        // ========================================================================

        recalculatePagination(filteredData = null) {
            const dataToUse = filteredData || this.allCompanies;

            this.filteredCount = dataToUse.length;
            this.filteredTotalPages = Math.ceil(dataToUse.length / this.perPage);

            if (this.currentPage > this.filteredTotalPages && this.filteredTotalPages > 0) {
                this.currentPage = 1;
            }

            console.log('[Store] recalculatePagination:', {
                total: dataToUse.length,
                pages: this.filteredTotalPages,
                current: this.currentPage,
            });

            return {
                filteredCount: this.filteredCount,
                filteredTotalPages: this.filteredTotalPages,
                currentPage: this.currentPage,
            };
        },

        setFilters({ searchQuery, filterHasIcon, sortBy }) {
            if (searchQuery !== undefined) this.searchQuery = searchQuery;
            if (filterHasIcon !== undefined) this.filterHasIcon = filterHasIcon;
            if (sortBy !== undefined) this.sortBy = sortBy;
            this.currentPage = 1;

            console.log('[Store] setFilters:', {
                searchQuery: this.searchQuery,
                filterHasIcon: this.filterHasIcon,
                sortBy: this.sortBy,
            });
        },

        resetFilters() {
            this.searchQuery = '';
            this.filterHasIcon = '';
            this.sortBy = 'id_asc';
            this.currentPage = 1;

            console.log('[Store] resetFilters');
        },

        // ========================================================================
        // ЗАГРУЗКА ДАННЫХ
        // ========================================================================

        async fetchAllCompanies() {
            console.log('[Store] fetchAllCompanies: START');

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

                data.forEach(company => {
                    company._refreshing = false;
                    company._updating = false;
                });

                this.allCompanies = data;
                this.companies = [...this.allCompanies];
                this.allLoaded = true;

                this.totalItems = realTotal;
                this.useServerPagination = realTotal > PAGE_SIZE_OPTIONS.MAX;
                this.allRecordsLoaded = this.allCompanies.length >= realTotal;
                this.totalChunks = Math.ceil(realTotal / this.chunkSize);
                this.loadedChunks = 1;
                this.chunkLoadingProgress = 100;

                this.recalculatePagination();

                console.log('[Store] fetchAllCompanies: SUCCESS', {
                    total: realTotal,
                    loaded: this.allCompanies.length,
                });

                setTimeout(() => { this.chunkLoadingProgress = 0; }, 100);
            } catch (err) {
                console.error('[Store] fetchAllCompanies: ERROR', err);
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

                data.forEach(company => {
                    company._refreshing = false;
                    company._updating = false;
                });

                this.allCompanies.push(...data);
                this.companies = [...this.allCompanies];
                this.loadedChunks++;

                if (this.allCompanies.length >= this.totalItems) {
                    this.allRecordsLoaded = true;
                    this.useServerPagination = false;
                }

                this.recalculatePagination();

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

        // ========================================================================
        // CRUD ОПЕРАЦИИ
        // ========================================================================

        async createCompany(companyData) {
            console.log('[Store] createCompany: START', companyData);

            if (window.SIMULATE_API_ERROR === true) {
                console.warn('[Store] createCompany: SIMULATED ERROR');
                await new Promise(resolve => setTimeout(resolve, 1000));
                throw new Error('Simulated create error');
            }

            this.loading = true;
            this.error = null;

            try {
                const response = await companyResource.createCompany(companyData);
                const newCompany = response.data || response;

                newCompany._refreshing = false;
                newCompany._updating = false;

                this.allCompanies.unshift(newCompany);
                this.companies.unshift(newCompany);
                this.totalItems++;

                this.recalculatePagination();

                console.log('[Store] createCompany: SUCCESS', { id: newCompany.id });

                return newCompany;
            } catch (err) {
                console.error('[Store] createCompany: ERROR', err);
                this.error = err.message || 'Failed to create company';
                throw err;
            } finally {
                this.loading = false;
            }
        },

        async updateCompany(id, companyData) {
            console.log('[Store] updateCompany: START', { id, companyData });

            if (window.SIMULATE_API_ERROR === true) {
                console.warn('[Store] updateCompany: SIMULATED ERROR');
                await new Promise(resolve => setTimeout(resolve, 1000));
                throw new Error('Simulated update error');
            }

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

                this.recalculatePagination();

                console.log('[Store] updateCompany: SUCCESS', { id });

                return updatedCompany;
            } catch (err) {
                console.error('[Store] updateCompany: ERROR', err);
                this.error = err.message || 'Failed to update company';
                throw err;
            } finally {
                this.loading = false;
            }
        },

        async deleteCompany(id) {
            console.log('[Store] deleteCompany: START', { id });

            if (window.SIMULATE_API_ERROR === true) {
                console.warn('[Store] deleteCompany: SIMULATED ERROR');
                await new Promise(resolve => setTimeout(resolve, 1000));
                throw new Error('Simulated delete error');
            }

            this.loading = true;
            this.error = null;

            try {
                await companyResource.deleteCompany(id);

                this.companies = this.companies.filter((c) => c.id !== id);
                this.allCompanies = this.allCompanies.filter((c) => c.id !== id);
                this.totalItems--;

                this.recalculatePagination();

                console.log('[Store] deleteCompany: SUCCESS', { id });
            } catch (err) {
                console.error('[Store] deleteCompany: ERROR', err);
                this.error = err.message || 'Failed to delete company';
                throw err;
            } finally {
                this.loading = false;
            }
        },

        // ========================================================================
        // REFRESH
        // ========================================================================

        async refreshSingleRecordWithRollback(companyId) {
            console.log('[Store] refreshSingleRecordWithRollback: START', { companyId });

            this.error = null;

            const index = this.allCompanies.findIndex((c) => c.id === companyId);
            if (index === -1) {
                console.error('[Store] refreshSingleRecordWithRollback: NOT FOUND', { companyId });
                return { success: false, error: 'Запись не найдена' };
            }

            const row = this.allCompanies[index];

            this.refreshBackup = {
                companyId,
                index,
                data: JSON.parse(JSON.stringify(row)),
            };

            console.log('[Store] refreshSingleRecordWithRollback: BACKUP CREATED', {
                companyId,
                backup: this.refreshBackup.data,
            });

            row._refreshing = true;
            this.allCompanies = [...this.allCompanies];

            try {
                console.log('[Store] refreshSingleRecordWithRollback: API REQUEST START');

                if (window.SIMULATE_API_ERROR === true) {
                    console.warn('[Store] refreshSingleRecordWithRollback: SIMULATED ERROR');
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    throw new Error('Simulated refresh error');
                }

                const response = await companyResource.getCompanyById(companyId);
                const updatedData = response.data || response;

                console.log('[Store] refreshSingleRecordWithRollback: API RESPONSE', { updatedData });

                Object.assign(row, {
                    ...updatedData,
                    _refreshing: false,
                    _updatedAt: new Date().toISOString(),
                });

                this.allCompanies = [...this.allCompanies];
                this.companies = [...this.allCompanies];

                this.refreshBackup = null;

                console.log('[Store] refreshSingleRecordWithRollback: SUCCESS', { companyId });

                return {
                    success: true,
                    updatedData,
                };
            } catch (err) {
                console.error('[Store] refreshSingleRecordWithRollback: ERROR', {
                    companyId,
                    error: err.message,
                    hasBackup: !!this.refreshBackup,
                });

                if (this.refreshBackup && this.refreshBackup.companyId === companyId) {
                    console.log('[Store] refreshSingleRecordWithRollback: ROLLBACK START');

                    this.allCompanies[this.refreshBackup.index] = this.refreshBackup.data;
                    this.allCompanies[this.refreshBackup.index]._refreshing = false;
                    this.allCompanies = [...this.allCompanies];
                    this.companies = [...this.allCompanies];

                    console.log('[Store] refreshSingleRecordWithRollback: ROLLBACK COMPLETE');

                    this.refreshBackup = null;
                } else {
                    row._refreshing = false;
                    this.allCompanies = [...this.allCompanies];
                }

                this.error = err.message || 'Failed to refresh record';

                return {
                    success: false,
                    error: err.message,
                    rolledBack: true,
                };
            }
        },

        rollbackRefresh(companyId) {
            console.log('[Store] rollbackRefresh: MANUAL ROLLBACK', { companyId });

            if (!this.refreshBackup || this.refreshBackup.companyId !== companyId) {
                console.warn('[Store] rollbackRefresh: NO BACKUP FOUND', { companyId });
                return false;
            }

            const row = this.allCompanies[this.refreshBackup.index];
            if (row) {
                Object.assign(row, {
                    ...this.refreshBackup.data,
                    _refreshing: false,
                });
                this.allCompanies = [...this.allCompanies];
                this.companies = [...this.allCompanies];
                console.log('[Store] rollbackRefresh: COMPLETE');
            }

            this.refreshBackup = null;
            return true;
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
                    await this.loadAllRecordsChunked(CHUNK_CONFIG.DELAY);
                    return { success: true, newRecords };
                }

                return { success: true, newRecords: 0 };
            } catch (err) {
                this.error = err.message || 'Failed to refresh data';
                throw err;
            } finally {
                this.loadingInitial = false;
            }
        },

        // ========================================================================
        // ПАГИНАЦИЯ
        // ========================================================================

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
                    company._refreshing = false;
                });

                if (meta && typeof meta.total === 'number') {
                    this.currentPage = meta.current_page || page;
                    this.lastPage = meta.last_page || 1;
                    this.perPage = meta.per_page || pageSize;
                    this.totalItems = meta.total;
                }

                this.recalculatePagination();
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

        // ========================================================================
        // СБРОС
        // ========================================================================

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
            this.refreshBackup = null;
            this.searchQuery = '';
            this.filterHasIcon = '';
            this.sortBy = 'id_asc';
            this.filteredCount = 0;
            this.filteredTotalPages = 0;
            Object.assign(this, getInitialPaginationState());
        },
    },
});
