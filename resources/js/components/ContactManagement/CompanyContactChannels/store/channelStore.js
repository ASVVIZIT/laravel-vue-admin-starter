// ============================================================================
// CHANNEL STORE — PINIA STORE ДЛЯ КАНАЛОВ СВЯЗИ (С LOCALSTORAGE)
// ============================================================================
// 📁 Путь: store/channelStore.js
// ✅ Используется: ChannelList.vue, ChannelTable.vue, ChannelForm.vue
// ✅ Безопасно менять — влияет только на управление каналами
// ✅ Зависит от: pinia, ChannelResource.js
// ============================================================================

import { defineStore } from 'pinia';
import { ChannelResource } from '../api/core/ChannelResource.js';
import {
    CHANNEL_LIST_PROPS_CONFIG,
    CHANNEL_TYPES,
    CHANNEL_LIST_THRESHOLDS,
    CHANNEL_LIST_FILTERS,
    CHANNEL_USER_SETTINGS,
    CHANNEL_SORT_OPTIONS,
    getChannelUserSettings,
} from '../config/channels/appConfigChannelList.js';

const channelResource = new ChannelResource();

// ============================================================================
// CHANNEL STORE
// ============================================================================

export const useChannelStore = defineStore('channel', {
    // ========================================================================
    // STATE — НАЧАЛЬНОЕ СОСТОЯНИЕ
    // ========================================================================
    state: () => {
        // ✅ ЧИТАЕМ channel_user_settings (глобальные настройки пользователя)
        let userSettings = null;
        try {
            const saved = localStorage.getItem(CHANNEL_USER_SETTINGS.STORAGE_KEY);
            if (saved) {
                userSettings = JSON.parse(saved);
                console.log('🟢 [ChannelStore] User settings loaded:', userSettings);
            } else {
                console.log('🟡 [ChannelStore] No channel_user_settings in localStorage');
            }
        } catch (e) {
            console.error('🔴 [ChannelStore] Error loading user settings:', e);
        }

        // ✅ ЧИТАЕМ channel_filters (фильтры сессии)
        let sessionFilters = null;
        try {
            const saved = localStorage.getItem('channel_filters');
            if (saved) {
                sessionFilters = JSON.parse(saved);
                console.log('🟢 [ChannelStore] Session filters loaded:', sessionFilters);
            } else {
                console.log('🟡 [ChannelStore] No channel_filters in localStorage');
            }
        } catch (e) {
            console.error('🔴 [ChannelStore] Error loading session filters:', e);
        }

        // ✅ ОПРЕДЕЛЯЕМ ФИНАЛЬНЫЕ ЗНАЧЕНИЯ (filters > settings > defaults)
        const finalChunkSize = userSettings?.chunkSize || CHANNEL_USER_SETTINGS.DEFAULT_CHUNK_SIZE;
        const finalPageSize = sessionFilters?.pageSize || userSettings?.pageSize || CHANNEL_USER_SETTINGS.DEFAULT_PAGE_SIZE;
        const finalFilterCompanyId = sessionFilters?.filterCompanyId ?? userSettings?.filterCompanyId ?? null;
        const finalFilterType = sessionFilters?.filterType ?? userSettings?.filterType ?? null;
        const finalFilterIsActive = sessionFilters?.filterIsActive ?? userSettings?.filterIsActive ?? null;
        const finalSortBy = sessionFilters?.sortBy || userSettings?.sortBy || CHANNEL_SORT_OPTIONS.DEFAULT;

        // ✅ Сохраняем в channel_filters (если не было)
        if (!sessionFilters) {
            try {
                localStorage.setItem('channel_filters', JSON.stringify({
                    filterCompanyId: finalFilterCompanyId,
                    filterType: finalFilterType,
                    filterIsActive: finalFilterIsActive,
                    pageSize: finalPageSize,
                    sortBy: finalSortBy,
                }));
                console.log('🟢 [ChannelStore] channel_filters initialized from settings');
            } catch (e) {
                console.error('🔴 [ChannelStore] Error saving channel_filters:', e);
            }
        }

        const stateFromConfig = Object.fromEntries(
            Object.entries(CHANNEL_LIST_PROPS_CONFIG).map(([key, config]) => [
                key,
                config.default !== undefined ? config.default : null
            ])
        );

        return {
            // ✅ ДАННЫЕ
            channels: [],
            allChannels: [],

            // ✅ ФИЛЬТРЫ
            filters: {
                company_id: finalFilterCompanyId,
                type: finalFilterType,
                is_active: finalFilterIsActive,
                search: '',
                sort_by: finalSortBy,
                sort_direction: 'asc',
            },

            // ✅ ТЕКУЩИЙ КАНАЛ
            currentChannel: null,

            // ✅ СПИСОК КОМПАНИЙ
            companies: [],

            // ✅ ОШИБКИ И ЗАГРУЗКА
            error: null,
            validationErrors: {},
            loading: false,
            loadingInitial: false,
            loadingChunks: false,
            saving: false,
            deleting: false,
            reordering: false,

            // ✅ ПРОГРЕСС ЗАГРУЗКИ ЧАНКА (0-100)
            chunkLoadingProgress: 0,

            // ✅ REFRESH BACKUP (для отката при ошибке — КАК В COMPANIES!)
            refreshBackup: null,

            // ✅ CHUNK LOADING
            totalItems: 0,
            loadedChunks: 0,
            totalChunks: 0,
            chunkSize: finalChunkSize,
            allRecordsLoaded: false,

            // ✅ ПАГИНАЦИЯ
            currentPage: 1,
            perPage: finalPageSize,
            lastPage: 1,

            // ✅ МЕТАДАННЫЕ
            meta: {
                lastFetchedAt: null,
                lastUpdatedAt: null,
            },

            ...stateFromConfig
        };
    },

    // ========================================================================
    // GETTERS — ПОЛУЧАТЕЛИ (КАК В COMPANIES!)
    // ========================================================================
    getters: {
        // ✅ Получить все каналы
        allChannelsList: (state) => {
            if (!state.allChannels || !Array.isArray(state.allChannels)) {
                return [];
            }
            return state.allChannels;
        },

        // ✅ ФИЛЬТРОВАННЫЕ ДАННЫЕ (ИСПРАВЛЕННАЯ ПРОВЕРКА NULL!)
        filteredData: (state) => {
            if (!state.allChannels || state.allChannels.length === 0) {
                return [];
            }

            const search = state.filters?.search || '';
            const companyId = state.filters?.company_id;  // ← ← ← МОЖЕТ БЫТЬ NULL!
            const type = state.filters?.type;  // ← ← ← МОЖЕТ БЫТЬ NULL!
            const isActive = state.filters?.is_active;  // ← ← ← МОЖЕТ БЫТЬ NULL!
            const sortBy = state.filters?.sort_by || CHANNEL_SORT_OPTIONS.DEFAULT;

            // 1. ФИЛЬТРАЦИЯ
            let filtered = state.allChannels.filter(channel => {
                // ✅ ПОИСК
                const matchesSearch = search
                    ? channel.title?.toLowerCase().includes(search.toLowerCase()) ||
                    channel.identifier?.toLowerCase().includes(search.toLowerCase()) ||
                    channel.url?.toLowerCase().includes(search.toLowerCase()) ||
                    String(channel.id).includes(search)
                    : true;

                // ✅ КОМПАНИЯ (ПРОВЕРЯЕМ NULL, НЕ FALSE!)
                const matchesCompany = companyId !== null && companyId !== undefined
                    ? channel.company_id === companyId
                    : true;

                // ✅ ТИП (ПРОВЕРЯЕМ NULL, НЕ FALSE!)
                const matchesType = type !== null && type !== undefined
                    ? channel.type === type
                    : true;

                // ✅ СТАТУС (ПРОВЕРЯЕМ NULL, НЕ FALSE!)
                const matchesActive = isActive !== null && isActive !== undefined
                    ? channel.is_active === isActive
                    : true;

                return matchesSearch && matchesCompany && matchesType && matchesActive;
            });

            // 2. СОРТИРОВКА
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
                    if (field === 'title') {
                        valueA = (a.title || '').toLowerCase();
                        valueB = (b.title || '').toLowerCase();
                        return valueA.localeCompare(valueB, ['ru', 'en']) * multiplier;
                    }
                    if (field === 'type') {
                        valueA = (a.type || '').toLowerCase();
                        valueB = (b.type || '').toLowerCase();
                        return valueA.localeCompare(valueB, ['ru', 'en']) * multiplier;
                    }
                    if (field === 'order_column') {
                        valueA = a.order_column || 0;
                        valueB = b.order_column || 0;
                        return (valueA - valueB) * multiplier;
                    }
                    if (field === 'created_at') {
                        valueA = new Date(a.created_at || 0).getTime();
                        valueB = new Date(b.created_at || 0).getTime();
                        return (valueA - valueB) * multiplier;
                    }
                    if (field === 'company') {
                        valueA = (a.company?.name || '').toLowerCase();
                        valueB = (b.company?.name || '').toLowerCase();
                        return valueA.localeCompare(valueB, ['ru', 'en']) * multiplier;
                    }
                    valueA = a[field] || '';
                    valueB = b[field] || '';
                    if (typeof valueA === 'string' && typeof valueB === 'string') {
                        return valueA.localeCompare(valueB, ['ru', 'en']) * multiplier;
                    }
                    return (valueA - valueB) * multiplier;
                });
            }

            return filtered;
        },

        // ✅ КОЛИЧЕСТВО ПОСЛЕ ФИЛЬТРАЦИИ
        filteredCount: (state) => {
            return state.filteredData.length;
        },

        // ✅ ОБЩЕЕ КОЛИЧЕСТВО СТРАНИЦ
        totalPages: (state) => {
            if (state.perPage <= 0) return 0;
            return Math.ceil(state.filteredCount / state.perPage);
        },

        // ✅ ЗАГРУЖЕНО ВСЕГО
        loadedCount: (state) => {
            if (!state.allChannels || !Array.isArray(state.allChannels)) {
                return 0;
            }
            return state.allChannels.length;
        },

        // ✅ ПРОГРЕСС ЗАГРУЗКИ
        loadedPercentage: (state) => {
            if (!state.allChannels || !Array.isArray(state.allChannels)) {
                return 0;
            }
            if (state.totalItems === 0) return 0;
            return Math.round((state.allChannels.length / state.totalItems) * 100);
        },

        currentChunkProgress: (state) => state.chunkLoadingProgress,

        // ✅ КНОПКИ ЗАГРУЗКИ
        showLoadMoreButton: (state) => {
            return (
                !state.allRecordsLoaded &&
                state.totalItems > CHANNEL_LIST_THRESHOLDS.SHOW_LOAD_BUTTONS_MIN &&
                state.loadedCount < state.totalItems
            );
        },

        showLoadAllButton: (state) => {
            return (
                !state.allRecordsLoaded &&
                state.totalItems > CHANNEL_LIST_THRESHOLDS.SHOW_LOAD_BUTTONS_MIN &&
                state.loadedCount < state.totalItems &&
                state.totalItems > 0
            );
        },

        // ✅ Проверить загрузку
        isLoading: (state) => {
            return state.loading || state.loadingInitial || state.loadingChunks;
        },

        // ✅ Проверить сохранение
        isSaving: (state) => state.saving,

        // ✅ Проверить удаление
        isDeleting: (state) => state.deleting,

        // ✅ Проверить сортировку
        isReordering: (state) => state.reordering,

        // ✅ Проверить ошибку
        hasError: (state) => state.error !== null,

        // ✅ Проверить есть ли каналы
        hasChannels: (state) => {
            return state.channels && Array.isArray(state.channels) && state.channels.length > 0;
        },

        // ✅ Получить количество каналов
        channelsCount: (state) => {
            if (!state.channels || !Array.isArray(state.channels)) {
                return 0;
            }
            return state.channels.length;
        },

        // ✅ Получить каналы отсортированные (БЕЗ ФИЛЬТРАЦИИ)
        sortedChannels: (state) => {
            if (!state.channels || !Array.isArray(state.channels)) {
                return [];
            }
            return [...state.channels].sort((a, b) => {
                return (a.order_column || 0) - (b.order_column || 0);
            });
        },
    },

    // ========================================================================
    // ACTIONS — ДЕЙСТВИЯ (КАК В COMPANIES!)
    // ========================================================================
    actions: {
        // ====================================================================
        // RECALCULATE PAGINATION — ПЕРЕСЧЕТ ПАГИНАЦИИ
        // ====================================================================
        recalculatePagination(filteredData = null) {
            const dataToUse = filteredData || this.filteredData;
            if (this.currentPage > this.totalPages && this.totalPages > 0) {
                this.currentPage = 1;
            }
            console.log('🔵 [ChannelStore] recalculatePagination:', {
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

        // ====================================================================
        // SAVE FILTERS TO LOCALSTORAGE
        // ====================================================================
        saveFiltersToLocalStorage() {
            try {
                localStorage.setItem('channel_filters', JSON.stringify({
                    filterCompanyId: this.filters.company_id,
                    filterType: this.filters.type,
                    filterIsActive: this.filters.is_active,
                    pageSize: this.perPage,
                    sortBy: this.filters.sort_by,
                }));
                console.log('🟢 [ChannelStore] Filters saved to localStorage');
            } catch (e) {
                console.error('🔴 [ChannelStore] Error saving filters:', e);
            }
        },

        // ====================================================================
        // SET FILTERS — Установить фильтры
        // ====================================================================
        setFilters(filters) {
            if (filters.company_id !== undefined) this.filters.company_id = filters.company_id || null;
            if (filters.type !== undefined) this.filters.type = filters.type || null;
            if (filters.is_active !== undefined) this.filters.is_active = filters.is_active || null;
            if (filters.search !== undefined) this.filters.search = filters.search || '';
            if (filters.sort_by !== undefined) this.filters.sort_by = filters.sort_by || CHANNEL_SORT_OPTIONS.DEFAULT;
            if (filters.sort_direction !== undefined) this.filters.sort_direction = filters.sort_direction || 'asc';

            this.currentPage = 1;
            this.saveFiltersToLocalStorage();

            console.log('🔵 [ChannelStore] setFilters:', this.filters);
        },

        // ====================================================================
        // CLEAR FILTERS — Очистить фильтры
        // ====================================================================
        clearFilters() {
            this.filters = {
                company_id: null,
                type: null,
                is_active: null,
                search: '',
                sort_by: CHANNEL_SORT_OPTIONS.DEFAULT,
                sort_direction: 'asc',
            };
            this.currentPage = 1;
            localStorage.removeItem('channel_filters');
            console.log('🟢 [ChannelStore] Filters cleared');
        },

        // ============================================================================
        // APPLY USER SETTINGS — Применить настройки пользователя (ИСПРАВЛЕНО!)
        // ============================================================================
        applyUserSettings(settings) {
            console.log('🔵 [ChannelStore] applyUserSettings:', settings);

            if (settings.chunkSize) {
                this.chunkSize = settings.chunkSize;
                if (this.totalItems > 0) {
                    this.totalChunks = Math.ceil(this.totalItems / this.chunkSize);
                }
                console.log('🟢 [ChannelStore] chunkSize updated:', this.chunkSize);
            }

            if (settings.pageSize) {
                this.perPage = settings.pageSize;
                console.log('🟢 [ChannelStore] pageSize updated:', this.perPage);
            }

            // ✅ СИНХРОНИЗАЦИЯ СОРТИРОВКИ ИЗ НАСТРОЕК
            if (settings.defaultSortBy) {
                this.filters.sort_by = settings.defaultSortBy;
                console.log('🟢 [ChannelStore] sort_by updated:', this.filters.sort_by);
            }

            // ✅ СИНХРОНИЗАЦИЯ ФИЛЬТРОВ ИЗ НАСТРОЕК (КАК В COMPANIES!)
            if (settings.defaultFilterCompanyId !== undefined) {
                this.filters.company_id = settings.defaultFilterCompanyId;
                console.log('🟢 [ChannelStore] company_id updated:', this.filters.company_id);
            }

            if (settings.defaultFilterType !== undefined) {
                this.filters.type = settings.defaultFilterType;
                console.log('🟢 [ChannelStore] type updated:', this.filters.type);
            }

            if (settings.defaultFilterIsActive !== undefined) {
                this.filters.is_active = settings.defaultFilterIsActive;
                console.log('🟢 [ChannelStore] is_active updated:', this.filters.is_active);
            }

            if (settings.defaultSearch !== undefined) {
                this.filters.search = settings.defaultSearch;
                console.log('🟢 [ChannelStore] search updated:', this.filters.search);
            }

            localStorage.setItem(CHANNEL_USER_SETTINGS.STORAGE_KEY, JSON.stringify(settings));
            this.saveFiltersToLocalStorage();

            console.log('🟢 [ChannelStore] User settings applied');
        },

        // ====================================================================
        // SET PAGE SIZE — Установить размер страницы
        // ====================================================================
        setPageSize(size) {
            this.perPage = size;
            this.currentPage = 1;
            this.saveFiltersToLocalStorage();
            console.log('🟢 [ChannelStore] pageSize updated:', this.perPage);
        },

        // ====================================================================
        // FETCH ALL CHANNELS — Загрузить все каналы
        // ====================================================================
        async fetchAllChannels() {
            console.log('🔵 [ChannelStore] fetchAllChannels: START');

            this.loadingInitial = true;
            this.loading = true;
            this.error = null;

            try {
                const countResult = await this.fetchChannelsCount(this.filters);
                const realTotal = countResult.total;
                console.log('🔵 [ChannelStore] Total items:', realTotal);

                const response = await channelResource.getChannels({
                    page: 1,
                    per_page: this.chunkSize,
                    ...this.filters,
                });

                let data = response;
                if (response && typeof response === 'object' && !Array.isArray(response)) {
                    data = response.data || response.channels || response.items || [];
                }

                console.log('🔵 [ChannelStore] Data length:', data.length);

                this.allChannels = [];
                this.channels = [];

                data.forEach(channel => {
                    channel._refreshing = false;
                    channel._updating = false;
                    if (!channel.metadata) channel.metadata = {};
                    if (!channel.company) channel.company = {};
                    this.allChannels.push(channel);
                    this.channels.push(channel);
                });

                this.totalItems = realTotal;
                this.allRecordsLoaded = this.allChannels.length >= realTotal;
                this.totalChunks = Math.ceil(realTotal / this.chunkSize);
                this.loadedChunks = 1;
                this.recalculatePagination();

                console.log('🟢 [ChannelStore] fetchAllChannels: SUCCESS', {
                    total: realTotal,
                    loaded: this.allChannels.length,
                });

                return { success: true, data: this.channels };
            } catch (err) {
                console.error('🔴 [ChannelStore] fetchAllChannels: ERROR', err);
                this.error = err.message || 'Failed to fetch channels';
                return { success: false, error: this.error };
            } finally {
                this.loadingInitial = false;
                this.loading = false;
            }
        },

        // ====================================================================
        // FETCH CHANNELS COUNT — Получить общее количество каналов
        // ====================================================================
        async fetchChannelsCount(params = {}) {
            console.log('🔵 [ChannelStore] fetchChannelsCount: START', { params });
            try {
                const response = await channelResource.getChannelsCount(params);
                const total = response.total || response.data?.total || 0;
                console.log('🟢 [ChannelStore] fetchChannelsCount: SUCCESS', { total });
                return { success: true, total };
            } catch (err) {
                console.error('🔴 [ChannelStore] fetchChannelsCount: ERROR', err);
                return { success: false, error: err.message, total: 0 };
            }
        },

        // ====================================================================
        // LOAD NEXT CHUNK — Загрузить следующий чанк
        // ====================================================================
        async loadNextChunk() {
            if (this.allRecordsLoaded || this.loadingChunks) return false;

            this.loadingChunks = true;
            this.chunkLoadingProgress = 0;
            this.error = null;

            try {
                const nextPage = this.loadedChunks + 1;
                const remainingItems = this.totalItems - this.allChannels.length;
                const itemsToLoad = Math.min(this.chunkSize, remainingItems);

                const response = await channelResource.getChannels({
                    page: nextPage,
                    per_page: itemsToLoad,
                    ...this.filters,
                });

                let data = response;
                if (response && typeof response === 'object' && !Array.isArray(response)) {
                    data = response.data || response.channels || response.items || [];
                }

                data.forEach(channel => {
                    channel._refreshing = false;
                    channel._updating = false;
                    if (!channel.metadata) channel.metadata = {};
                    if (!channel.company) channel.company = {};
                    this.allChannels.push(channel);
                    this.channels.push(channel);
                });

                this.loadedChunks++;
                this.chunkLoadingProgress = 100;

                if (this.allChannels.length >= this.totalItems) {
                    this.allRecordsLoaded = true;
                }

                this.recalculatePagination();

                console.log('🟢 [ChannelStore] loadNextChunk: SUCCESS', {
                    loaded: data.length,
                    total: this.allChannels.length,
                });

                return data.length > 0;
            } catch (err) {
                console.error('🔴 [ChannelStore] loadNextChunk: ERROR', err);
                this.error = err.message || 'Failed to load chunk';
                return false;
            } finally {
                this.loadingChunks = false;
                setTimeout(() => {
                    this.chunkLoadingProgress = 0;
                }, 300);
            }
        },

        // ====================================================================
        // LOAD ALL RECORDS CHUNKED — Загрузить все записи чанками
        // ====================================================================
        async loadAllRecordsChunked(delay = 100) {
            if (this.allRecordsLoaded) return;
            this.error = null;

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

                console.log('🟢 [ChannelStore] loadAllRecordsChunked: COMPLETE', {
                    total: this.allChannels.length,
                });
            } catch (err) {
                console.error('🔴 [ChannelStore] loadAllRecordsChunked: ERROR', err);
                this.error = err.message || 'Failed to load all records';
                throw err;
            }
        },

        // ====================================================================
        // REFRESH SINGLE RECORD — ОБНОВЛЕНИЕ ОДНОЙ ЗАПИСИ
        // ====================================================================
        async refreshSingleRecord(channelId) {
            console.log('🔵 [ChannelStore] refreshSingleRecord: START', { channelId });
            this.error = null;

            // ✅ ИЗВЛЕКАЕМ ID ИЗ PROXY
            const numericId = typeof channelId === 'object'
                ? JSON.parse(JSON.stringify(channelId))
                : channelId;

            const index = this.allChannels.findIndex((c) => c.id === numericId);
            if (index === -1) {
                console.error('🔴 [ChannelStore] refreshSingleRecord: NOT FOUND', { channelId: numericId });
                return { success: false, error: 'Запись не найдена' };
            }

            const row = this.allChannels[index];

            this.refreshBackup = {
                channelId: numericId,
                index,
                data: JSON.parse(JSON.stringify(row)),
            };

            row._refreshing = true;
            this.allChannels = [...this.allChannels];
            this.channels = [...this.allChannels];

            try {
                const response = await channelResource.getChannel(numericId);
                const updatedData = response.data || response;

                if (!updatedData.metadata) updatedData.metadata = {};
                if (!updatedData.company) updatedData.company = {};

                Object.assign(row, {
                    ...updatedData,
                    _refreshing: false,
                    _updatedAt: new Date().toISOString(),
                });

                this.allChannels = [...this.allChannels];
                this.channels = [...this.filteredData];
                this.refreshBackup = null;

                console.log('🟢 [ChannelStore] refreshSingleRecord: SUCCESS', { channelId: numericId });
                return { success: true, updatedData };
            } catch (err) {
                console.error('🔴 [ChannelStore] refreshSingleRecord: ERROR', { channelId: numericId, error: err.message });

                if (this.refreshBackup && this.refreshBackup.channelId === numericId) {
                    this.allChannels[this.refreshBackup.index] = this.refreshBackup.data;
                    this.allChannels[this.refreshBackup.index]._refreshing = false;
                    this.allChannels = [...this.allChannels];
                    this.channels = [...this.filteredData];
                    this.refreshBackup = null;
                } else {
                    row._refreshing = false;
                    this.allChannels = [...this.allChannels];
                }

                this.error = err.message || 'Failed to refresh record';
                return { success: false, error: err.message, rolledBack: true };
            }
        },

        // ====================================================================
        // UPDATE CHANNEL — Обновить канал
        // ====================================================================
        async updateChannel(channelId, data) {
            console.log('🔵 [ChannelStore] updateChannel: START', { channelId, data });

            this.saving = true;
            this.error = null;
            this.validationErrors = {};

            try {
                const response = await channelResource.updateChannel(channelId, data);
                let updatedChannel = response;
                if (response && typeof response === 'object' && !Array.isArray(response)) {
                    updatedChannel = response.data || response.channel || response;
                }

                const index = this.channels.findIndex(c => c.id === channelId);
                if (index !== -1) {
                    this.channels.splice(index, 1, {
                        ...this.channels[index],
                        ...updatedChannel,
                        _updating: false,
                        _updatedAt: new Date().toISOString(),
                    });
                    this.allChannels.splice(index, 1, {
                        ...this.allChannels[index],
                        ...updatedChannel,
                        _updating: false,
                        _updatedAt: new Date().toISOString(),
                    });
                }

                this.meta.lastUpdatedAt = new Date().toISOString();
                this.recalculatePagination();

                console.log('🟢 [ChannelStore] updateChannel: SUCCESS', { id: channelId });
                return { success: true, data: updatedChannel };
            } catch (err) {
                console.error('🔴 [ChannelStore] updateChannel: ERROR', err);
                this.error = err.message || 'Failed to update channel';
                this.validationErrors = err.response?.data?.errors || {};
                return { success: false, error: this.error, errors: this.validationErrors };
            } finally {
                this.saving = false;
            }
        },

        // ====================================================================
        // DELETE CHANNEL — Удалить канал
        // ====================================================================
        async deleteChannel(channelId) {
            console.log('🔵 [ChannelStore] deleteChannel: START', { channelId });

            this.deleting = true;
            this.error = null;

            try {
                await channelResource.deleteChannel(channelId);

                this.channels = this.channels.filter(c => c.id !== channelId);
                this.allChannels = this.allChannels.filter(c => c.id !== channelId);
                this.totalItems = Math.max(0, this.totalItems - 1);
                this.meta.lastUpdatedAt = new Date().toISOString();
                this.recalculatePagination();

                console.log('🟢 [ChannelStore] deleteChannel: SUCCESS', { id: channelId });
                return { success: true, message: 'Канал удалён' };
            } catch (err) {
                console.error('🔴 [ChannelStore] deleteChannel: ERROR', err);
                this.error = err.message || 'Failed to delete channel';
                return { success: false, error: this.error };
            } finally {
                this.deleting = false;
            }
        },

        // ====================================================================
        // REORDER CHANNELS — Обновить порядок каналов
        // ====================================================================
        async reorderChannels(order) {
            console.log('🔵 [ChannelStore] reorderChannels: START', { order });

            this.reordering = true;
            this.error = null;

            try {
                await channelResource.reorderChannels(order);

                const channelsMap = new Map(this.channels.map(c => [c.id, c]));
                this.channels = order.map((id, index) => {
                    const channel = channelsMap.get(id);
                    if (channel) channel.order_column = index;
                    return channel;
                }).filter(Boolean);

                const allChannelsMap = new Map(this.allChannels.map(c => [c.id, c]));
                this.allChannels = order.map((id, index) => {
                    const channel = allChannelsMap.get(id);
                    if (channel) channel.order_column = index;
                    return channel;
                }).filter(Boolean);

                this.meta.lastUpdatedAt = new Date().toISOString();
                this.recalculatePagination();

                console.log('🟢 [ChannelStore] reorderChannels: SUCCESS');
                return { success: true, message: 'Порядок обновлён' };
            } catch (err) {
                console.error('🔴 [ChannelStore] reorderChannels: ERROR', err);
                this.error = err.message || 'Failed to reorder channels';
                return { success: false, error: this.error };
            } finally {
                this.reordering = false;
            }
        },

        // ====================================================================
        // RESET STORE — Сбросить store
        // ====================================================================
        resetStore() {
            console.log('🔵 [ChannelStore] resetStore');

            this.channels = [];
            this.allChannels = [];
            this.currentChannel = null;
            this.companies = [];
            this.loading = false;
            this.loadingInitial = false;
            this.loadingChunks = false;
            this.saving = false;
            this.deleting = false;
            this.reordering = false;
            this.chunkLoadingProgress = 0;
            this.error = null;
            this.validationErrors = {};
            this.filters = {
                company_id: null,
                type: null,
                is_active: null,
                search: '',
                sort_by: CHANNEL_SORT_OPTIONS.DEFAULT,
                sort_direction: 'asc',
            };
            this.totalItems = 0;
            this.loadedChunks = 0;
            this.totalChunks = 0;
            this.allRecordsLoaded = false;
            this.currentPage = 1;
            this.perPage = CHANNEL_USER_SETTINGS.DEFAULT_PAGE_SIZE;
            this.lastPage = 1;
            this.refreshBackup = null;
            this.meta = {
                lastFetchedAt: null,
                lastUpdatedAt: null,
            };
        },
    },
});
