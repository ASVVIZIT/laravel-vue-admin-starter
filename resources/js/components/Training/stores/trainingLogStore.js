import { defineStore } from 'pinia'
import { TrainingLogResource } from '@/components/Training/api/core/resource/TrainingLogResource.js'

export const useTrainingLogStore = defineStore('trainingLog', {
    state: () => ({
        logs: [],
        loading: false,
        error: null,
        dateFilter: null,
        exerciseFilter: null,
        dateRange: { from: null, to: null },
        pagination: { page: 1, per_page: 50, total: 0, last_page: 1 },
        stats: null,
        summary: null
    }),

    getters: {
        hasLogs: (state) => state.logs?.length > 0,
        isEmpty: (state) => !state.loading && state.logs?.length === 0
    },

    actions: {
        // ===== ВКЛАДКА: МОИ ТРЕНИРОВКИ =====
        async fetchMyLogs(params = {}) {
            this.loading = true
            this.error = null
            this.logs = [] // Очищаем перед загрузкой

            try {
                if ('date' in params) this.dateFilter = params.date
                if ('exercise_id' in params) this.exerciseFilter = params.exercise_id
                if ('from' in params) this.dateRange.from = params.from
                if ('to' in params) this.dateRange.to = params.to
                if ('page' in params) this.pagination.page = params.page
                if ('per_page' in params) this.pagination.per_page = params.per_page

                const queryParams = {
                    page: this.pagination.page,
                    per_page: this.pagination.per_page
                }
                if (this.dateFilter) queryParams.date = this.dateFilter
                if (this.exerciseFilter) queryParams.exercise_id = this.exerciseFilter
                if (this.dateRange?.from) queryParams.from = this.dateRange.from
                if (this.dateRange?.to) queryParams.to = this.dateRange.to

                const response = await new TrainingLogResource().getListResource(queryParams)
                this.logs = response.data || []
                this.pagination = { ...this.pagination, ...(response.meta?.pagination || {}) }

                this.fetchStats().catch(() => {})
                this.fetchSummary().catch(() => {})
            } catch (error) {
                this.error = error.response?.data?.message || 'Ошибка сети'
            } finally {
                this.loading = false
            }
        },

        // ===== ВКЛАДКА: ДОСТУПНЫЕ МНЕ =====
        async fetchSharedWithMe(params = {}) {
            this.loading = true
            this.error = null
            this.logs = [] // Очищаем

            try {
                const queryParams = {
                    page: params.page || this.pagination.page,
                    per_page: params.per_page || this.pagination.per_page,
                    shared_with_me: 1 // Явный флаг
                }

                const response = await new TrainingLogResource().getListResource(queryParams)
                this.logs = response.data || []
                this.pagination = { ...this.pagination, ...(response.meta?.pagination || {}) }
            } catch (error) {
                this.error = error.response?.data?.message || 'Ошибка загрузки'
            } finally {
                this.loading = false
            }
        },

        // ===== ВКЛАДКА: Я ПОДЕЛИЛСЯ =====
        async fetchSharedByMe(params = {}) {
            this.loading = true
            this.error = null
            this.logs = [] // Очищаем

            try {
                const queryParams = {
                    page: params.page || this.pagination.page,
                    per_page: params.per_page || this.pagination.per_page,
                    shared_by_me: 1 // Явный флаг
                }

                const response = await new TrainingLogResource().getListResource(queryParams)
                this.logs = response.data || []
                this.pagination = { ...this.pagination, ...(response.meta?.pagination || {}) }
            } catch (error) {
                this.error = error.response?.data?.message || 'Ошибка загрузки'
            } finally {
                this.loading = false
            }
        },

        setPage(page) {
            this.pagination.page = page
            // Перезагружаем текущую вкладку - вызов делается из Dashboard
        },

        setPerPage(size) {
            this.pagination.per_page = size
            this.pagination.page = 1
        },

        async clearFilters() {
            this.dateFilter = null
            this.exerciseFilter = null
            this.dateRange = { from: null, to: null }
            this.pagination.page = 1
            await this.fetchMyLogs({})
        },

        async fetchStats() {
            try {
                const params = {}
                if (this.exerciseFilter) params.exercise_id = this.exerciseFilter
                if (this.dateRange?.from) params.from = this.dateRange.from
                if (this.dateRange?.to) params.to = this.dateRange.to
                this.stats = await new TrainingLogResource().getStatsResource(params)
            } catch (error) { console.error('[Store] fetchStats error:', error) }
        },

        async fetchSummary() {
            try {
                this.summary = await new TrainingLogResource().getSummaryResource()
            } catch (error) { console.error('[Store] fetchSummary error:', error) }
        },

        async createLog(data) {
            const response = await new TrainingLogResource().createResource(data)
            await this.fetchMyLogs({})
            return response
        },

        async updateLog(id, data) {
            const response = await new TrainingLogResource().updateResource(id, data)
            await this.fetchMyLogs({})
            return response
        },

        async deleteLog(id) {
            await new TrainingLogResource().deleteResource(id)
            await this.fetchMyLogs({})
        }
    }
})

export default useTrainingLogStore
