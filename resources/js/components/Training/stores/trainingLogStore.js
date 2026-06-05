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

const FILTERS_STORAGE_KEY = 'training_filters_all_tabs'

export const useTrainingLogStore = defineStore('trainingLog', {
    state: () => ({
        tabsData: {
            'mine': createTabState(),
            'shared-with-me': createTabState(),
            'shared-by-me': createTabState(),
        },
        activeTab: 'mine',

        // 🔥 Фильтры разделены по вкладкам
        filters: {
            'mine': { date: null, exercise_id: null, from: null, to: null },
            'shared-with-me': { date: null, exercise_id: null, from: null, to: null },
            'shared-by-me': { date: null, exercise_id: null, from: null, to: null }
        },

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

        // 🔥 Геттер для фильтров текущей активной вкладки
        currentFilters: (state) => state.filters[state.activeTab],

        hasLogs: (state) => state.tabsData[state.activeTab]?.logs?.length > 0,
        isEmpty: (state) => {
            const tab = state.tabsData[state.activeTab]
            return !tab?.loading && !tab?.logs?.length
        },
        config: (state) => TAB_CONFIG[state.activeTab] || TAB_CONFIG['mine']
    },

    actions: {
        saveFiltersToStorage() {
            try {
                localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(this.filters))
            } catch (e) {
                console.warn('[Store] Failed to save filters:', e)
            }
        },

        loadFiltersFromStorage() {
            try {
                const saved = localStorage.getItem(FILTERS_STORAGE_KEY)
                if (saved) {
                    const parsed = JSON.parse(saved)
                    // Безопасное слияние для защиты от изменений структуры
                    this.filters = {
                        'mine': { ...this.filters['mine'], ...(parsed['mine'] || {}) },
                        'shared-with-me': { ...this.filters['shared-with-me'], ...(parsed['shared-with-me'] || {}) },
                        'shared-by-me': { ...this.filters['shared-by-me'], ...(parsed['shared-by-me'] || {}) }
                    }
                    console.log('[Store] ✅ Filters restored:', this.filters)
                }
            } catch (e) {
                console.warn('[Store] Failed to load filters:', e)
            }
        },

        async applyFilters(params = {}) {
            const tab = this.activeTab

            // 🔥 Обновляем фильтры ТОЛЬКО для текущей вкладки
            if ('date' in params) this.filters[tab].date = params.date ?? null
            if ('exercise_id' in params) this.filters[tab].exercise_id = params.exercise_id ?? null
            if ('from' in params) this.filters[tab].from = params.from ?? null
            if ('to' in params) this.filters[tab].to = params.to ?? null

            // Пагинация
            const currentTabData = this.tabsData[tab]
            if ('page' in params) currentTabData.pagination.page = params.page
            if ('per_page' in params) currentTabData.pagination.per_page = params.per_page

            this.saveFiltersToStorage()
            await this.refreshCurrentTab()
        },

        async refreshCurrentTab() {
            const settingsStore = useTrainingSettingsStore()
            await settingsStore.fetchSettingsStore(this.activeTab)

            const isServerGrouping = settingsStore.isServerGroupingActiveStore(this.activeTab)

            if (isServerGrouping) {
                await this.fetchGroupedTab()
            } else {
                await this.fetchTab(this.activeTab)
            }
        },

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

                // 🔥 Применяем фильтры текущей вкладки
                const f = this.filters[tabKey]
                if (f.date) queryParams.date = f.date
                if (f.exercise_id) queryParams.exercise_id = f.exercise_id
                if (f.from) queryParams.from = f.from
                if (f.to) queryParams.to = f.to

                const response = await new TrainingLogResource().getGroupedLogsResource(queryParams)
                tab.logs = response.data || []
                tab.pagination = { ...tab.pagination, ...(response.meta?.pagination || {}) }
            } catch (error) {
                tab.error = error.response?.data?.message || 'Ошибка загрузки'
                tab.logs = []
            } finally {
                tab.loading = false
            }
        },

        async fetchTab(tabKey) {
            const config = TAB_CONFIG[tabKey]
            if (!config) return

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

                // 🔥 Применяем фильтры к ЛЮБОЙ вкладке (не только mine)
                const f = this.filters[tabKey]
                if (f.date) queryParams.date = f.date
                if (f.exercise_id) queryParams.exercise_id = f.exercise_id
                if (f.from) queryParams.from = f.from
                if (f.to) queryParams.to = f.to

                const response = await new TrainingLogResource().getListResource(queryParams)

                tab.logs = response.data || []
                tab.pagination = { ...tab.pagination, ...(response.meta?.pagination || {}) }

                // Статистика пока только для 'mine'
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
            const tab = this.activeTab
            // 🔥 Очищаем фильтры ТОЛЬКО для текущей вкладки
            this.filters[tab] = { date: null, exercise_id: null, from: null, to: null }
            this.tabsData[tab].pagination.page = 1

            this.saveFiltersToStorage()
            await this.refreshCurrentTab()
        },

        async createLog(data) {
            await new TrainingLogResource().createResource(data)
            await this.refreshCurrentTab()
        },

        async updateLog(id, data) {
            await new TrainingLogResource().updateResource(id, data)
            await this.refreshCurrentTab()
        },

        async deleteLog(id) {
            await new TrainingLogResource().deleteResource(id)
            await this.refreshCurrentTab()
        },

        async fetchStats() {
            try {
                const f = this.filters['mine']
                const params = {}
                if (f.exercise_id) params.exercise_id = f.exercise_id
                if (f.from) params.from = f.from
                if (f.to) params.to = f.to
                this.stats = await new TrainingLogResource().getStatsResource(params)
            } catch (error) { console.error('[Store] fetchStats:', error) }
        },

        async fetchSummary() {
            try {
                this.summary = await new TrainingLogResource().getSummaryResource()
            } catch (error) { console.error('[Store] fetchSummary:', error) }
        }
    }
})

export default useTrainingLogStore
