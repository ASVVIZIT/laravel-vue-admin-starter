// ============================================================================
// COMPANY STORE — PINIA (ПОЛНОСТЬЮ ИСПРАВЛЕННЫЙ)
// ============================================================================
// 📁 Путь: src/components/ContactManagement/CompanyContactChannels/store/companyStore.js
// ✅ Используется: CompanyList.vue, CompanyTable.vue, CompanyForm.vue
// ✅ Безопасно менять — влияет только на управление компаниями
// ============================================================================

import { defineStore } from 'pinia';
import { CompanyResource } from '../api/core/CompanyResource.js';
import {
    getInitialPaginationState,
    COMPANY_LIST_PROPS_CONFIG,
    PAGE_SIZE_OPTIONS,
    CHUNK_CONFIG,
    COMPANY_LIST_THRESHOLDS,
    COMPANY_LIST_FILTERS,
    SORT_OPTIONS,
} from '../config/appConfigIndex.js';

const companyResource = new CompanyResource();

export const useCompanyStore = defineStore('company', {
    // ============================================================================
    // STATE — НАЧАЛЬНОЕ СОСТОЯНИЕ
    // ============================================================================
    state: () => {
        // ✅ 1. Получаем начальные значения пагинации из конфига
        const paginationState = getInitialPaginationState();

        // ✅ 2. Получаем значения из COMPANY_LIST_PROPS_CONFIG
        const stateFromConfig = Object.fromEntries(
            Object.entries(COMPANY_LIST_PROPS_CONFIG).map(([key, config]) => [
                key,
                config.default !== undefined ? config.default : null
            ])
        );

        // ✅ 3. ЧИТАЕМ company_user_settings (глобальные настройки пользователя)
        let userSettings = null;
        try {
            const saved = localStorage.getItem('company_user_settings');
            if (saved) {
                userSettings = JSON.parse(saved);
                console.log('🟢 [Store] User settings loaded:', userSettings);
            } else {
                console.log('🟡 [Store] No company_user_settings in localStorage');
            }
        } catch (e) {
            console.error('🔴 [Store] Error loading user settings:', e);
        }

        // ✅ 4. ЧИТАЕМ company_filters (фильтры сессии)
        let sessionFilters = null;
        try {
            const saved = localStorage.getItem('company_filters');
            if (saved) {
                sessionFilters = JSON.parse(saved);
                console.log('🟢 [Store] Session filters loaded:', sessionFilters);
            } else {
                console.log('🟡 [Store] No company_filters in localStorage');
            }
        } catch (e) {
            console.error('🔴 [Store] Error loading session filters:', e);
        }

        // ✅ 5. ОПРЕДЕЛЯЕМ ФИНАЛЬНЫЕ ЗНАЧЕНИЯ (filters > settings > defaults)
        const finalPageSize = sessionFilters?.pageSize || userSettings?.pageSize || paginationState.perPage;
        const finalSortBy = sessionFilters?.sortBy || userSettings?.defaultSortBy || SORT_OPTIONS.DEFAULT;
        const finalFilterHasIcon = sessionFilters?.filterHasIcon ?? userSettings?.defaultFilterHasIcon ?? '';
        const finalSearchQuery = sessionFilters?.searchQuery || '';
        const finalChunkSize = userSettings?.chunkSize || CHUNK_CONFIG.SIZE;

        // ✅ 6. Сохраняем в company_filters (если не было)
        if (!sessionFilters) {
            try {
                localStorage.setItem('company_filters', JSON.stringify({
                    searchQuery: finalSearchQuery,
                    filterHasIcon: finalFilterHasIcon,
                    sortBy: finalSortBy,
                    pageSize: finalPageSize,
                }));
                console.log('🟢 [Store] company_filters initialized from settings');
            } catch (e) {
                console.error('🔴 [Store] Error saving company_filters:', e);
            }
        }

        return {
            // ========================================================================
            // ДАННЫЕ
            // ========================================================================
            companies: [],
            allCompanies: [],

            // ========================================================================
            // ОШИБКИ И ЗАГРУЗКА
            // ========================================================================
            error: null,
            loading: false,
            loadingInitial: false,
            loadingChunks: false,
            deletionLoading: false,

            // ========================================================================
            // ПРОГРЕСС ЗАГРУЗКИ ЧАНКА (0-100)
            // ========================================================================
            chunkLoadingProgress: 0,
            refreshBackup: null,

            // ========================================================================
            // ПАГИНАЦИЯ (с учётом настроек)
            // ========================================================================
            currentPage: 1,
            perPage: finalPageSize,              // ✅ ИЗ НАСТРОЕК (15 по умолчанию)
            lastPage: 1,

            // ========================================================================
            // ФИЛЬТРЫ (с учётом настроек)
            // ========================================================================
            searchQuery: finalSearchQuery,       // ✅ ИЗ НАСТРОЕК
            filterHasIcon: finalFilterHasIcon,   // ✅ ИЗ НАСТРОЕК
            sortBy: finalSortBy,                 // ✅ ИЗ НАСТРОЕК ('id_asc')

            // ========================================================================
            // CHUNKED ЗАГРУЗКА (из настроек пользователя)
            // ========================================================================
            totalItems: 0,
            loadedChunks: 0,
            totalChunks: 0,
            chunkSize: finalChunkSize,           // ✅ ИЗ company_user_settings (500 по умолчанию)
            useServerPagination: false,
            allRecordsLoaded: false,

            // ========================================================================
            // ИЗ COMPANY_LIST_PROPS_CONFIG
            // ========================================================================
            ...stateFromConfig
        };
    },

    // ============================================================================
    // GETTERS — ВЫЧИСЛЯЕМЫЕ СВОЙСТВА
    // ============================================================================
    getters: {
        loadedCount: (state) => state.allCompanies.length,

        loadedPercentage: (state) => {
            if (state.totalItems === 0) return 0;
            return Math.round((state.allCompanies.length / state.totalItems) * 100);
        },

        chunkProgress: (state) => {
            if (state.totalChunks === 0) return 0;
            return Math.round((state.loadedChunks / state.totalChunks) * 100);
        },

        currentChunkProgress: (state) => state.chunkLoadingProgress,  // ✅ 0-100

        filteredData: (state) => {
            if (!state.allCompanies || state.allCompanies.length === 0) {
                return [];
            }

            // ✅ ЗАЩИТА ОТ null/undefined
            const searchQuery = state.searchQuery || '';
            const filterHasIcon = state.filterHasIcon || '';
            const sortBy = state.sortBy || SORT_OPTIONS.DEFAULT;

            // ========================================================================
            // 1. ФИЛЬТРАЦИЯ
            // ========================================================================
            let filtered = state.allCompanies.filter(company => {
                // Поиск по тексту + ID
                const matchesSearch = searchQuery
                    ? company.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    company.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    company.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    String(company.id).includes(searchQuery)
                    : true;

                // Фильтр по иконке
                const iconValue = company.settings?.icon ?? company.icon ?? '';
                const hasIcon = iconValue !== '' && iconValue !== null && iconValue !== undefined;

                // ✅ ЗАЩИТА ОТ null — ЯВНОЕ СРАВНЕНИЕ
                const matchesIcon = filterHasIcon === '' || filterHasIcon === 'all' || filterHasIcon === null || filterHasIcon === undefined
                    ? true
                    : filterHasIcon === 'with'
                        ? hasIcon
                        : filterHasIcon === 'without'
                            ? !hasIcon
                            : true;

                return matchesSearch && matchesIcon;
            });

            // ========================================================================
            // 2. СОРТИРОВКА
            // ========================================================================
            if (sortBy) {
                const parts = sortBy.split('_');
                const direction = parts.pop();
                const field = parts.join('_');
                const multiplier = direction === 'desc' ? -1 : 1;

                filtered.sort((a, b) => {
                    let valueA, valueB;

                    if (field === 'id') {
                        valueA = a.id || 0;
                        valueB = b.id || 0;
                        return (valueA - valueB) * multiplier;
                    }

                    if (field === 'name') {
                        valueA = (a.name || '').toLowerCase();
                        valueB = (b.name || '').toLowerCase();
                        // ✅ ПОДДЕРЖКА КИРИЛЛИЦЫ + ЛАТИНИЦЫ
                        return valueA.localeCompare(valueB, ['ru', 'en']) * multiplier;
                    }

                    if (field === 'created_at' || field === 'createdAt') {
                        valueA = new Date(a.created_at || a.createdAt || 0).getTime();
                        valueB = new Date(b.created_at || b.createdAt || 0).getTime();
                        return (valueA - valueB) * multiplier;
                    }

                    if (field === 'updated_at' || field === 'updatedAt') {
                        valueA = new Date(a.updated_at || a.updatedAt || 0).getTime();
                        valueB = new Date(b.updated_at || b.updatedAt || 0).getTime();
                        return (valueA - valueB) * multiplier;
                    }

                    valueA = a[field] || '';
                    valueB = b[field] || '';
                    if (typeof valueA === 'string' && typeof valueB === 'string') {
                        // ✅ ПОДДЕРЖКА КИРИЛЛИЦЫ + ЛАТИНИЦЫ
                        return valueA.localeCompare(valueB, ['ru', 'en']) * multiplier;
                    }
                    return (valueA - valueB) * multiplier;
                });
            }

            return filtered;
        },

        filteredCount: (state) => state.filteredData.length,

        totalPages: (state) => {
            if (state.perPage <= 0) return 0;
            return Math.ceil(state.filteredCount / state.perPage);
        },

        isLoading: (state) => {
            return (
                state.loading ||
                state.loadingInitial ||
                state.loadingChunks
            );
        },

        isDisabled: (state) => state.disabled,

        showLoadMoreButton: (state) => {
            return (
                !state.allRecordsLoaded &&
                state.totalItems > COMPANY_LIST_THRESHOLDS.SHOW_LOAD_BUTTONS_MIN &&
                state.loadedCount < state.totalItems
            );
        },

        showLoadAllButton: (state) => {
            return (
                !state.allRecordsLoaded &&
                state.totalItems > COMPANY_LIST_THRESHOLDS.SHOW_LOAD_BUTTONS_MIN &&
                state.loadedCount < state.totalItems &&
                state.totalItems > 0
            );
        },

        hasNewRecords: (state) => state.totalItems > state.loadedCount,

        availablePageSizes: (state) => {
            return PAGE_SIZE_OPTIONS.BASE_AVAILABLE
                .filter(size => size <= state.totalItems)
                .concat(state.totalItems)
                .filter((value, index, self) => self.indexOf(value) === index)
                .sort((a, b) => a - b);
        },
    },

    // ============================================================================
    // ACTIONS — МЕТОДЫ
    // ============================================================================
    actions: {
        recalculatePagination(filteredData = null) {
            const dataToUse = filteredData || this.filteredData;

            if (this.currentPage > this.totalPages && this.totalPages > 0) {
                this.currentPage = 1;
            }

            console.log('🔵 [Store] recalculatePagination:', {
                total: dataToUse.length,
                pages: this.totalPages,
                current: this.currentPage,
            });

            return {
                filteredCount: this.filteredCount,
                totalPages: this.totalPages,
                currentPage: this.currentPage,
            };
        },

        setFilters({ searchQuery, filterHasIcon, sortBy }) {
            if (searchQuery !== undefined) this.searchQuery = searchQuery || '';
            if (filterHasIcon !== undefined) this.filterHasIcon = filterHasIcon || '';
            if (sortBy !== undefined) this.sortBy = sortBy || SORT_OPTIONS.DEFAULT;
            this.currentPage = 1;

            // ✅ СОХРАНЯЕМ В company_filters (сессия)
            localStorage.setItem('company_filters', JSON.stringify({
                searchQuery: this.searchQuery,
                filterHasIcon: this.filterHasIcon,
                sortBy: this.sortBy,
                pageSize: this.perPage,
            }));

            console.log('🔵 [Store] setFilters:', {
                searchQuery: this.searchQuery,
                filterHasIcon: this.filterHasIcon,
                sortBy: this.sortBy,
            });
        },

        resetFilters() {
            this.searchQuery = '';
            this.filterHasIcon = '';
            this.sortBy = SORT_OPTIONS.DEFAULT;
            this.currentPage = 1;
            localStorage.removeItem('company_filters');
        },

        // ✅ ЗАГРУЗКА НАСТРОЕК ИЗ SETTINGS MODAL
        applyUserSettings(settings) {
            console.log('🔵 [Store] applyUserSettings:', settings);

            // ✅ Обновляем chunkSize
            if (settings.chunkSize && settings.chunkSize !== this.chunkSize) {
                this.chunkSize = settings.chunkSize;

                // ✅ Пересчитываем totalChunks для нового chunkSize
                if (this.totalItems > 0) {
                    this.totalChunks = Math.ceil(this.totalItems / this.chunkSize);
                }

                console.log('🟢 [Store] chunkSize updated:', this.chunkSize);
            }

            // ✅ Обновляем pageSize
            if (settings.pageSize) {
                this.perPage = settings.pageSize;
            }

            // ✅ Обновляем фильтры по умолчанию
            if (settings.defaultSortBy) {
                this.sortBy = settings.defaultSortBy;
            }
            if (settings.defaultFilterHasIcon !== undefined) {
                this.filterHasIcon = settings.defaultFilterHasIcon;
            }

            // ✅ Сохраняем в company_user_settings
            localStorage.setItem('company_user_settings', JSON.stringify(settings));

            // ✅ Обновляем company_filters (синхронизируем)
            localStorage.setItem('company_filters', JSON.stringify({
                searchQuery: this.searchQuery,
                filterHasIcon: this.filterHasIcon,
                sortBy: this.sortBy,
                pageSize: this.perPage,
            }));

            console.log('🟢 [Store] User settings applied');
        },

        // ✅ ИЗМЕНЕНИЕ PAGE SIZE (С СОХРАНЕНИЕМ В company_filters)
        setPageSize(pageSize) {
            this.perPage = pageSize;
            this.currentPage = 1;

            // ✅ Сохраняем в company_filters
            const filters = {
                searchQuery: this.searchQuery,
                filterHasIcon: this.filterHasIcon,
                sortBy: this.sortBy,
                pageSize: this.perPage,
            };
            localStorage.setItem('company_filters', JSON.stringify(filters));

            console.log('🟢 [Store] pageSize changed:', pageSize);
        },

        // ✅ ИМИТАЦИЯ ПРОГРЕССА ЗАГРУЗКИ ЧАНКА
        simulateChunkProgress() {
            this.chunkLoadingProgress = 0;

            const interval = setInterval(() => {
                if (!this.loadingChunks) {
                    clearInterval(interval);
                    this.chunkLoadingProgress = 0;
                    return;
                }

                this.chunkLoadingProgress = Math.min(this.chunkLoadingProgress + 10, 90);

                if (this.chunkLoadingProgress >= 90) {
                    clearInterval(interval);
                }
            }, 100);

            return interval;
        },

        async fetchAllCompanies() {
            console.log('🔵 [Store] fetchAllCompanies: START');

            this.loadingInitial = true;
            this.loading = true;
            this.error = null;

            try {
                const countResponse = await companyResource.getCompaniesCount();
                const realTotal = countResponse.total || countResponse.data?.total || 0;
                console.log('🔵 [Store] Total items:', realTotal);

                const response = await companyResource.getCompanies({
                    page: 1,
                    per_page: this.chunkSize,
                });

                let data = response;
                if (response && typeof response === 'object' && !Array.isArray(response)) {
                    data = response.data || response.items || response.companies || [];
                }

                console.log('🔵 [Store] Data length:', data.length);

                data.forEach(company => {
                    company._refreshing = false;
                    company._updating = false;
                    if (!company.settings) {
                        company.settings = {};
                    }
                });

                this.allCompanies = data;
                this.totalItems = realTotal;
                this.companies = [...this.allCompanies];

                this.allRecordsLoaded = this.allCompanies.length >= realTotal;
                this.useServerPagination = realTotal > PAGE_SIZE_OPTIONS.MAX;
                this.totalChunks = Math.ceil(realTotal / this.chunkSize);
                this.loadedChunks = 1;

                this.recalculatePagination();

                console.log('🟢 [Store] fetchAllCompanies: SUCCESS', {
                    total: realTotal,
                    loaded: this.allCompanies.length,
                    companies: this.companies.length,
                    filteredCount: this.filteredCount,
                    totalPages: this.totalPages
                });
            } catch (err) {
                console.error('🔴 [Store] fetchAllCompanies: ERROR', err);
                this.error = err.message || 'Failed to fetch companies';
                throw err;
            } finally {
                this.loadingInitial = false;
                this.loading = false;
            }
        },

        // ✅ ИСПРАВЛЕНО — С chunkLoadingProgress
        async loadNextChunk() {
            if (this.allRecordsLoaded || this.loadingChunks) return false;

            this.loadingChunks = true;
            this.chunkLoadingProgress = 0;  // ✅ СБРОС ПРОГРЕССА
            this.error = null;

            // ✅ ЗАПУСКАЕМ ИМИТАЦИЮ ПРОГРЕССА
            const progressInterval = this.simulateChunkProgress();

            try {
                const nextPage = this.loadedChunks + 1;
                const remainingItems = this.totalItems - this.allCompanies.length;
                const itemsToLoad = Math.min(this.chunkSize, remainingItems);

                const response = await companyResource.getCompanies({
                    page: nextPage,
                    per_page: itemsToLoad,
                });

                let data = response;
                if (response && typeof response === 'object' && !Array.isArray(response)) {
                    data = response.data || response.items || response.companies || [];
                }

                data.forEach(company => {
                    company._refreshing = false;
                    company._updating = false;
                    if (!company.settings) {
                        company.settings = {};
                    }
                });

                this.allCompanies.push(...data);
                this.companies = [...this.allCompanies];

                // ✅ УВЕЛИЧИВАЕМ loadedChunks НА 1 (не пересчитываем!)
                this.loadedChunks++;

                // ✅ ЗАВЕРШАЕМ ПРОГРЕСС
                this.chunkLoadingProgress = 100;

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
                // ✅ ОСТАНАВЛИВАЕМ ИМИТАЦИЮ
                clearInterval(progressInterval);
                this.loadingChunks = false;
                this.chunkLoadingProgress = 0;  // ✅ СБРОС
            }
        },

        async loadAllRecordsChunked(delay = CHUNK_CONFIG.DELAY) {
            if (this.allRecordsLoaded) return;

            this.error = null;
            this.useServerPagination = false;

            try {
                let iteration = 0;
                const maxIterations = this.totalChunks + 5;

                while (!this.allRecordsLoaded && iteration < maxIterations) {
                    iteration++;
                    const hasMore = await this.loadNextChunk();
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

        async refreshSingleRecord(companyId) {
            console.log('🔵 [Store] refreshSingleRecord: START', { companyId });

            this.error = null;

            const index = this.allCompanies.findIndex((c) => c.id === companyId);
            if (index === -1) {
                console.error('🔴 [Store] refreshSingleRecord: NOT FOUND', { companyId });
                return { success: false, error: 'Запись не найдена' };
            }

            const row = this.allCompanies[index];

            this.refreshBackup = {
                companyId,
                index,
                data: JSON.parse(JSON.stringify(row)),
            };

            row._refreshing = true;
            this.allCompanies = [...this.allCompanies];

            try {
                if (window.SIMULATE_API_ERROR === true) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    throw new Error('Simulated refresh error');
                }

                const response = await companyResource.getCompanyById(companyId);
                const updatedData = response.data || response;

                if (!updatedData.settings) {
                    updatedData.settings = {};
                }

                Object.assign(row, {
                    ...updatedData,
                    _refreshing: false,
                    _updatedAt: new Date().toISOString(),
                });

                this.allCompanies = [...this.allCompanies];
                this.companies = [...this.filteredData];
                this.refreshBackup = null;

                console.log('🟢 [Store] refreshSingleRecord: SUCCESS', { companyId });

                return {
                    success: true,
                    updatedData,
                };
            } catch (err) {
                console.error('🔴 [Store] refreshSingleRecord: ERROR', {
                    companyId,
                    error: err.message,
                    hasBackup: !!this.refreshBackup,
                });

                if (this.refreshBackup && this.refreshBackup.companyId === companyId) {
                    this.allCompanies[this.refreshBackup.index] = this.refreshBackup.data;
                    this.allCompanies[this.refreshBackup.index]._refreshing = false;
                    this.allCompanies = [...this.allCompanies];
                    this.companies = [...this.filteredData];
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

        async createCompany(companyData) {
            console.log('🔵 [Store] createCompany: START', companyData);

            if (window.SIMULATE_API_ERROR === true) {
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

                if (!newCompany.settings) {
                    newCompany.settings = {};
                }

                this.allCompanies.push(newCompany);
                this.companies = [...this.filteredData];
                this.totalItems++;

                this.recalculatePagination();

                console.log('🟢 [Store] createCompany: SUCCESS', { id: newCompany.id });

                return newCompany;
            } catch (err) {
                console.error('🔴 [Store] createCompany: ERROR', err);
                this.error = err.message || 'Failed to create company';
                throw err;
            } finally {
                this.loading = false;
            }
        },

        async updateCompany(id, companyData) {
            console.log('🔵 [Store] updateCompany: START', { id, companyData });

            if (window.SIMULATE_API_ERROR === true) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                throw new Error('Simulated update error');
            }

            this.loading = true;
            this.error = null;

            try {
                const response = await companyResource.updateCompany(id, companyData);
                const updatedCompany = response.data || response;

                if (!updatedCompany.settings) {
                    updatedCompany.settings = {};
                }

                const index = this.allCompanies.findIndex((c) => c.id === id);
                if (index !== -1) {
                    this.allCompanies.splice(index, 1, {
                        ...this.allCompanies[index],
                        ...updatedCompany,
                        _updating: false,
                        _updatedAt: new Date().toISOString(),
                    });
                }

                this.companies = [...this.filteredData];
                this.recalculatePagination();

                console.log('🟢 [Store] updateCompany: SUCCESS', { id });

                return updatedCompany;
            } catch (err) {
                console.error('🔴 [Store] updateCompany: ERROR', err);
                this.error = err.message || 'Failed to update company';
                throw err;
            } finally {
                this.loading = false;
            }
        },

        async deleteCompany(id) {
            console.log('🔵 [Store] deleteCompany: START', { id });

            if (window.SIMULATE_API_ERROR === true) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                throw new Error('Simulated delete error');
            }

            this.deletionLoading = true;
            this.loading = true;
            this.error = null;

            try {
                await companyResource.deleteCompany(id);

                this.allCompanies = this.allCompanies.filter((c) => c.id !== id);
                this.companies = [...this.filteredData];
                this.totalItems = Math.max(0, this.totalItems - 1);

                this.recalculatePagination();

                console.log('🟢 [Store] deleteCompany: SUCCESS', { id });
            } catch (err) {
                console.error('🔴 [Store] deleteCompany: ERROR', err);
                this.error = err.message || 'Failed to delete company';
                throw err;
            } finally {
                this.deletionLoading = false;
                this.loading = false;
            }
        },

        async refreshData() {
            this.loadingInitial = true;
            this.error = null;

            try {
                const countResponse = await companyResource.getCompaniesCount();
                const newTotal = countResponse.total || countResponse.data?.total || 0;
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

        resetState() {
            this.companies = [];
            this.allCompanies = [];
            this.allRecordsLoaded = false;
            this.loading = false;
            this.loadingInitial = false;
            this.loadingChunks = false;
            this.deletionLoading = false;
            this.chunkLoadingProgress = 0;
            this.error = null;
            this.totalItems = 0;
            this.useServerPagination = false;
            this.loadedChunks = 0;
            this.totalChunks = 0;
            this.refreshBackup = null;
            this.searchQuery = '';
            this.filterHasIcon = '';
            this.sortBy = SORT_OPTIONS.DEFAULT;

            const paginationState = getInitialPaginationState();
            this.currentPage = paginationState.currentPage;
            this.perPage = paginationState.perPage;
            this.lastPage = paginationState.lastPage;
        },

        restoreFiltersFromStorage() {
            const saved = localStorage.getItem('company_filters');
            if (saved) {
                try {
                    const filters = JSON.parse(saved);
                    this.searchQuery = filters.searchQuery || '';
                    this.filterHasIcon = filters.filterHasIcon || '';
                    this.sortBy = filters.sortBy || SORT_OPTIONS.DEFAULT;
                    this.perPage = filters.perPage || filters.pageSize || PAGE_SIZE_OPTIONS.BASE_AVAILABLE[2];

                    console.log('🟢 [Store] Filters restored from localStorage:', filters);
                } catch (e) {
                    console.error('🔴 [Store] Error reading filters from localStorage:', e);
                }
            }
        },
    },
});

// ============================================================================
// GLOBAL DEBUG FLAGS
// ============================================================================
if (typeof window !== 'undefined') {
    window.SIMULATE_API_ERROR = false;
    window.DEBUG_LOGS = true;
}
