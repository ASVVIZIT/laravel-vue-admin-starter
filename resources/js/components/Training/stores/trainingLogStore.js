import { defineStore } from 'pinia'
import { TrainingLogResource } from '@/components/Training/api/core/resource/TrainingLogResource.js'
import { useTrainingSettingsStore } from './trainingSettingsStore.js'

export const TAB_CONFIG = {
    'mine': {
        label: 'Мои тренировки',
        apiFlag: null,
        emptyText: 'Записей не найдено'
    },
    'shared-with-me': {
        label: 'Доступные мне',
        apiFlag: 'shared_with_me',
        emptyText: 'Вам ещё не расшарили ни одной тренировки'
    },
    'shared-by-me': {
        label: 'Я поделился',
        apiFlag: 'shared_by_me',
        emptyText: 'Вы ещё не поделились ни одной записью'
    },
}

const createTabState = () => ({
    logs: [],
    loading: false,
    error: null,
    pagination: { page: 1, per_page: 50, total: 0, last_page: 1 },
    isGrouped: false
})

const FILTERS_STORAGE_KEY = 'training_filters_mine'

export const useTrainingLogStore = defineStore('trainingLog', {
    state: () => ({
        tabsData: {
            'mine': createTabState(),
            'shared-with-me': createTabState(),
            'shared-by-me': createTabState(),
        },
        activeTab: 'mine',

        // Фильтры (применяются ТОЛЬКО к вкладке 'mine' на бэкенде)
        dateFilter: null,
        exerciseFilter: null,
        dateRange: { from: null, to: null },

        stats: null,
        summary: null
    }),

    getters: {
        currentTab: (state) => state.tabsData[state.activeTab],
        currentLogs: (state) => state.tabsData[state.activeTab]?.logs || [],
        currentLoading: (state) => state.tabsData[state.activeTab]?.loading || false,
        currentError: (state) => state.tabsData[state.activeTab]?.error || null,
        currentPagination: (state) => state.tabsData[state.activeTab]?.pagination || createTabState().pagination,
        isGrouped: (state) => state.tabsData[state.activeTab]?.isGrouped || false,

        hasLogs: (state) => state.tabsData[state.activeTab]?.logs?.length > 0,
        isEmpty: (state) => {
            const tab = state.tabsData[state.activeTab]
            return !tab?.loading && !tab?.logs?.length
        },
        config: (state) => TAB_CONFIG[state.activeTab] || TAB_CONFIG['mine']
    },

    actions: {
        // ====================================================================
        // LOCALSTORAGE: сохранение/загрузка фильтров
        // ====================================================================
        saveFiltersToStorage() {
            try {
                const filters = {
                    dateFilter: this.dateFilter,
                    exerciseFilter: this.exerciseFilter,
                    dateRange: this.dateRange
                }
                localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters))
            } catch (e) {
                console.warn('[Store] Failed to save filters:', e)
            }
        },

        loadFiltersFromStorage() {
            try {
                const saved = localStorage.getItem(FILTERS_STORAGE_KEY)
                if (saved) {
                    const filters = JSON.parse(saved)
                    this.dateFilter = filters.dateFilter || null
                    this.exerciseFilter = filters.exerciseFilter || null
                    this.dateRange = filters.dateRange || { from: null, to: null }
                    console.log('[Store] ✅ Filters restored:', filters)
                }
            } catch (e) {
                console.warn('[Store] Failed to load filters:', e)
            }
        },

        // ====================================================================
        // ПРИМЕНИТЬ ФИЛЬТРЫ — единая точка входа для TrainingFilterBar
        // ====================================================================
        async applyFilters(params = {}) {
            // 🔥 ВСЕГДА обновляем state фильтров (независимо от вкладки)
            // Это нужно, чтобы крестик работал на любой вкладке
            if ('date' in params) this.dateFilter = params.date ?? null
            if ('exercise_id' in params) this.exerciseFilter = params.exercise_id ?? null
            if ('from' in params) this.dateRange.from = params.from ?? null
            if ('to' in params) this.dateRange.to = params.to ?? null

            // Пагинация текущей вкладки
            const tab = this.tabsData[this.activeTab]
            if ('page' in params) tab.pagination.page = params.page
            if ('per_page' in params) tab.pagination.per_page = params.per_page

            this.saveFiltersToStorage()
            await this.refreshCurrentTab()
        },

        // ====================================================================
        // УМНАЯ ЗАГРУЗКА — автовыбор режима (frontend/server)
        // ====================================================================
        async refreshCurrentTab() {
            const settingsStore = useTrainingSettingsStore()
            await settingsStore.fetchSettingsStore(this.activeTab)

            const isServerGrouping = settingsStore.isServerGroupingActiveStore(this.activeTab)

            if (isServerGrouping) {
                console.log(`[Store] 🖥 Server grouping for tab: ${this.activeTab}`)
                await this.fetchGroupedTab()
            } else {
                console.log(`[Store] 📱 Frontend mode for tab: ${this.activeTab}`)
                await this.fetchTab(this.activeTab)
            }
        },

        // ====================================================================
        // СЕРВЕРНАЯ ГРУППИРОВКА
        // ====================================================================
        async fetchGroupedTab() {
            const tabKey = this.activeTab
            const tab = this.tabsData[tabKey]
            const settingsStore = useTrainingSettingsStore()

            tab.loading = true
            tab.error = null
            tab.isGrouped = true

            try {
                const queryParams = {
                    tab: tabKey,
                    group_by: settingsStore.serverSettings.grouping_by || 'user',
                    page: tab.pagination.page,
                    per_page: settingsStore.serverSettings.grouping_per_page || 10
                }

                const response = await new TrainingLogResource().getGroupedLogsResource(queryParams)

                tab.logs = response.data || []
                tab.pagination = {
                    ...tab.pagination,
                    ...(response.meta?.pagination || {})
                }
            } catch (error) {
                tab.error = error.response?.data?.message || 'Ошибка загрузки сгруппированных данных'
                tab.logs = []
            } finally {
                tab.loading = false
            }
        },

        // ====================================================================
        // ОБЫЧНАЯ ЗАГРУЗКА (фронтенд-режим)
        // ====================================================================
        async fetchTab(tabKey) {
            const config = TAB_CONFIG[tabKey]
            if (!config) {
                console.error(`[Store] Unknown tab: ${tabKey}`)
                return
            }

            const tab = this.tabsData[tabKey]
            tab.loading = true
            tab.error = null
            tab.isGrouped = false

            try {
                const queryParams = {
                    page: tab.pagination.page,
                    per_page: tab.pagination.per_page
                }

                if (config.apiFlag) {
                    queryParams[config.apiFlag] = 1
                }

                // 🔥 Фильтры применяются ТОЛЬКО к вкладке 'mine'
                if (tabKey === 'mine') {
                    if (this.dateFilter) queryParams.date = this.dateFilter
                    if (this.exerciseFilter) queryParams.exercise_id = this.exerciseFilter
                    if (this.dateRange?.from) queryParams.from = this.dateRange.from
                    if (this.dateRange?.to) queryParams.to = this.dateRange.to
                }

                const response = await new TrainingLogResource().getListResource(queryParams)

                tab.logs = response.data || []
                tab.pagination = { ...tab.pagination, ...(response.meta?.pagination || {}) }

                // Статистика только для 'mine'
                if (tabKey === 'mine') {
                    this.fetchStats().catch(() => {})
                    this.fetchSummary().catch(() => {})
                }
            } catch (error) {
                tab.error = error.response?.data?.message || 'Ошибка загрузки'
                tab.logs = []
            } finally {
                tab.loading = false
            }
        },

        // ====================================================================
        // УПРАВЛЕНИЕ ВКЛАДКАМИ И ПАГИНАЦИЕЙ
        // ====================================================================
        setActiveTab(tabKey) {
            if (!TAB_CONFIG[tabKey]) return
            this.activeTab = tabKey
        },

        setPage(page) {
            const tab = this.tabsData[this.activeTab]
            if (!tab) return
            tab.pagination.page = page
            this.refreshCurrentTab()
        },

        setPerPage(size) {
            const tab = this.tabsData[this.activeTab]
            if (!tab) return
            tab.pagination.per_page = size
            tab.pagination.page = 1
            this.refreshCurrentTab()
        },

        async clearFilters() {
            this.dateFilter = null
            this.exerciseFilter = null
            this.dateRange = { from: null, to: null }
            this.tabsData['mine'].pagination.page = 1
            this.saveFiltersToStorage()
            await this.refreshCurrentTab()
        },

        // ====================================================================
        // CRUD
        // ====================================================================
        async createLog(data) {
            const response = await new TrainingLogResource().createResource(data)
            await this.refreshCurrentTab()
            return response
        },

        async updateLog(id, data) {
            const response = await new TrainingLogResource().updateResource(id, data)
            await this.refreshCurrentTab()
            return response
        },

        async deleteLog(id) {
            await new TrainingLogResource().deleteResource(id)
            await this.refreshCurrentTab()
        },

        // ====================================================================
        // СТАТИСТИКА
        // ====================================================================
        async fetchStats() {
            try {
                const params = {}
                if (this.exerciseFilter) params.exercise_id = this.exerciseFilter
                if (this.dateRange?.from) params.from = this.dateRange.from
                if (this.dateRange?.to) params.to = this.dateRange.to
                this.stats = await new TrainingLogResource().getStatsResource(params)
            } catch (error) {
                console.error('[Store] fetchStats:', error)
            }
        },

        async fetchSummary() {
            try {
                this.summary = await new TrainingLogResource().getSummaryResource()
            } catch (error) {
                console.error('[Store] fetchSummary:', error)
            }
        }
    }
})

export default useTrainingLogStore
