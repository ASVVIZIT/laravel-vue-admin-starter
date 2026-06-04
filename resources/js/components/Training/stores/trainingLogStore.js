import { defineStore } from 'pinia'
import { TrainingLogResource } from '@/components/Training/api/core/resource/TrainingLogResource.js'

// ============================================================================
// КОНФИГУРАЦИЯ ВКЛАДОК — добавление новой вкладки = +1 запись здесь
// ============================================================================
export const TAB_CONFIG = {
    'mine': {
        label: 'Мои тренировки',
        apiFlag: null, // Обычный запрос без флагов
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
    // Пример добавления новой вкладки в будущем:
    // 'archived': {
    //     label: 'Архив',
    //     apiFlag: 'archived',
    //     emptyText: 'Архив пуст'
    // },
}

const createTabState = () => ({
    logs: [],
    loading: false,
    error: null,
    pagination: { page: 1, per_page: 50, total: 0, last_page: 1 }
})

export const useTrainingLogStore = defineStore('trainingLog', {
    state: () => ({
        // 🔥 Единая структура: данные по каждой вкладке
        tabsData: {
            'mine': createTabState(),
            'shared-with-me': createTabState(),
            'shared-by-me': createTabState(),
        },
        activeTab: 'mine',

        // Общие для всех вкладок
        dateFilter: null,
        exerciseFilter: null,
        dateRange: { from: null, to: null },
        stats: null,
        summary: null
    }),

    getters: {
        // Текущая вкладка
        currentTab: (state) => state.tabsData[state.activeTab],
        currentLogs: (state) => state.tabsData[state.activeTab]?.logs || [],
        currentLoading: (state) => state.tabsData[state.activeTab]?.loading || false,
        currentError: (state) => state.tabsData[state.activeTab]?.error || null,
        currentPagination: (state) => state.tabsData[state.activeTab]?.pagination || createTabState().pagination,

        hasLogs: (state) => state.tabsData[state.activeTab]?.logs?.length > 0,
        isEmpty: (state) => {
            const tab = state.tabsData[state.activeTab]
            return !tab?.loading && !tab?.logs?.length
        },

        config: (state) => TAB_CONFIG[state.activeTab] || TAB_CONFIG['mine']
    },

    actions: {
        /**
         * 🔥 ЕДИНСТВЕННЫЙ МЕТОД ЗАГРУЗКИ — работает для любой вкладки
         * @param {string} tabKey - ключ вкладки из TAB_CONFIG
         * @param {Object} params - доп. параметры (page, per_page, date, etc.)
         */
        async fetchTab(tabKey, params = {}) {
            const config = TAB_CONFIG[tabKey]
            if (!config) {
                console.error(`[Store] Unknown tab: ${tabKey}`)
                return
            }

            const tab = this.tabsData[tabKey]
            tab.loading = true
            tab.error = null

            try {
                // Применяем общие фильтры только для вкладки 'mine'
                if (tabKey === 'mine') {
                    if ('date' in params) this.dateFilter = params.date
                    if ('exercise_id' in params) this.exerciseFilter = params.exercise_id
                    if ('from' in params) this.dateRange.from = params.from
                    if ('to' in params) this.dateRange.to = params.to
                    if ('page' in params) tab.pagination.page = params.page
                    if ('per_page' in params) tab.pagination.per_page = params.per_page
                } else {
                    if ('page' in params) tab.pagination.page = params.page
                    if ('per_page' in params) tab.pagination.per_page = params.per_page
                }

                const queryParams = {
                    page: tab.pagination.page,
                    per_page: tab.pagination.per_page
                }

                // 🔥 Флаг вкладки (если есть в конфиге)
                if (config.apiFlag) {
                    queryParams[config.apiFlag] = 1
                }

                // Общие фильтры для вкладки 'mine'
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

        // ===== УПРАВЛЕНИЕ ВКЛАДКАМИ =====

        setActiveTab(tabKey) {
            if (!TAB_CONFIG[tabKey]) return
            this.activeTab = tabKey
        },

        /** Загрузить текущую активную вкладку */
        async refreshCurrentTab(params = {}) {
            await this.fetchTab(this.activeTab, params)
        },

        setPage(page) {
            const tab = this.tabsData[this.activeTab]
            if (!tab) return
            tab.pagination.page = page
            this.fetchTab(this.activeTab)
        },

        setPerPage(size) {
            const tab = this.tabsData[this.activeTab]
            if (!tab) return
            tab.pagination.per_page = size
            tab.pagination.page = 1
            this.fetchTab(this.activeTab)
        },

        async clearFilters() {
            this.dateFilter = null
            this.exerciseFilter = null
            this.dateRange = { from: null, to: null }
            this.tabsData['mine'].pagination.page = 1
            await this.fetchTab('mine')
        },

        // ===== CRUD (обновляют текущую вкладку) =====

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

        // ===== СТАТИСТИКА (только для 'mine') =====

        async fetchStats() {
            try {
                const params = {}
                if (this.exerciseFilter) params.exercise_id = this.exerciseFilter
                if (this.dateRange?.from) params.from = this.dateRange.from
                if (this.dateRange?.to) params.to = this.dateRange.to
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
