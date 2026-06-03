/**
 * ============================================================================
 * TRAINING LOG STORE — Управление журналом тренировок
 * ============================================================================
 * 📁 Путь: @/components/Training/stores/trainingLogStore.js
 * ✅ Ответственность:
 *    - Хранение списка записей, фильтров, пагинации, статистики.
 *    - Выполнение CRUD-операций (create, read, update, delete).
 *    - Применение фильтров и обновление связанных данных.
 *
 * 🔧 Используемые методы (для поиска по коду):
 *    - applyFilters(params)     — загрузка записей с фильтрами
 *    - clearFilters()           — сброс фильтров
 *    - createLog(data)          — создание новой записи
 *    - updateLog(id, data)      — обновление существующей записи
 *    - deleteLog(id)            — удаление записи
 *    - fetchStats()             — загрузка статистики
 *    - fetchSummary()           — загрузка сводки для шапки
 *    - setPage(page)            — смена страницы пагинации
 *    - setPerPage(size)         — смена размера страницы
 *
 * 📦 Состояние (state):
 *    - logs: []                 — массив записей
 *    - loading: false           — флаг загрузки
 *    - error: null              — ошибка последнего запроса
 *    - dateFilter: null         — фильтр по одной дате
 *    - exerciseFilter: null     — фильтр по упражнению
 *    - dateRange: {from, to}    — фильтр по диапазону дат
 *    - pagination: {...}        — объект пагинации
 *    - stats: null              — статистика за период
 *    - summary: null            — сводка для шапки дашборда
 *
 * ⚠️ ВАЖНО:
 *    - persist УБРАН намеренно — фильтры не должны сохраняться между сессиями.
 *    - Все методы возвращают только `data` из ответа (контракт с Resource).
 *    - `applyFilters` автоматически обновляет статистику фоном.
 */

import { defineStore } from 'pinia'
import { TrainingLogResource } from '@/components/Training/api/core/resource/TrainingLogResource.js'

export const useTrainingLogStore = defineStore('trainingLog', {
    // 🔥 persist убран намеренно — фильтры не должны сохраняться между сессиями
    state: () => ({
        logs: [],
        loading: false,
        error: null,
        dateFilter: null,
        exerciseFilter: null,
        dateRange: { from: null, to: null },
        pagination: {
            page: 1,
            per_page: 50,
            total: 0,
            last_page: 1
        },
        stats: null,
        summary: null
    }),

    getters: {
        /**
         * Есть ли загруженные записи
         * @returns {boolean}
         */
        hasLogs: (state) => state.logs?.length > 0,

        /**
         * Пустое состояние (не загружено и не ошибка)
         * @returns {boolean}
         */
        isEmpty: (state) => !state.loading && state.logs?.length === 0
    },

    actions: {
        /**
         * 🔥 ГЛАВНЫЙ МЕТОД: Применение фильтров и загрузка записей
         * @param {Object} params - { date, exercise_id, from, to, page, per_page }
         * @returns {Promise<void>}
         */
        async applyFilters(params = {}) {
            console.log('[Store] applyFilters START', params)
            this.loading = true
            this.error = null

            try {
                // 1. Обновляем состояние фильтров (только переданные ключи)
                if ('date' in params) this.dateFilter = params.date
                if ('exercise_id' in params) this.exerciseFilter = params.exercise_id
                if ('from' in params) this.dateRange.from = params.from
                if ('to' in params) this.dateRange.to = params.to
                if ('page' in params) this.pagination.page = params.page
                if ('per_page' in params) this.pagination.per_page = params.per_page

                // 2. Формируем чистый запрос (без null/undefined)
                const queryParams = {
                    page: this.pagination.page,
                    per_page: this.pagination.per_page
                }
                if (this.dateFilter) queryParams.date = this.dateFilter
                if (this.exerciseFilter) queryParams.exercise_id = this.exerciseFilter
                if (this.dateRange?.from) queryParams.from = this.dateRange.from
                if (this.dateRange?.to) queryParams.to = this.dateRange.to

                console.log('[Store] Request payload:', queryParams)

                // 3. Выполняем запрос
                const response = await new TrainingLogResource().getListResource(queryParams)

                // 4. Обновляем данные (response уже содержит только data, см. TrainingBaseResource)
                this.logs = response.data || []
                this.pagination = {
                    ...this.pagination,
                    ...(response.meta?.pagination || {})
                }
                console.log('[Store] SUCCESS. Logs count:', this.logs.length)

                // 5. Обновляем статистику фоном (не блокируем UI)
                this.fetchStats().catch(() => {})
                this.fetchSummary().catch(() => {})

            } catch (error) {
                console.error('[Store] FAILED:', error)
                this.error = error.response?.data?.message || 'Ошибка сети'
                this.logs = []
            } finally {
                this.loading = false
                console.log('[Store] applyFilters END. Loading:', this.loading)
            }
        },

        /**
         * 🔹 Сброс всех фильтров и загрузка всех записей
         * @returns {Promise<void>}
         */
        async clearFilters() {
            console.log('[Store] clearFilters TRIGGERED')
            this.dateFilter = null
            this.exerciseFilter = null
            this.dateRange = { from: null, to: null }
            this.pagination.page = 1
            await this.applyFilters({})
        },

        /**
         * 🔹 Смена страницы пагинации
         * @param {number} page - номер страницы
         */
        setPage(page) {
            this.pagination.page = page
            this.applyFilters({})
        },

        /**
         * 🔹 Смена размера страницы пагинации
         * @param {number} size - количество записей на странице
         */
        setPerPage(size) {
            this.pagination.per_page = size
            this.pagination.page = 1
            this.applyFilters({})
        },

        /**
         * 🔹 Создание новой записи
         * @param {Object} data - данные формы (exercise_id, date, time, sets, ...)
         * @returns {Promise<Object>} - ответ сервера
         */
        async createLog(data) {
            const response = await new TrainingLogResource().createResource(data)
            // После создания обновляем список с текущими фильтрами
            await this.applyFilters({})
            return response
        },

        /**
         * 🔹 Обновление существующей записи
         * @param {number|string} id - ID записи
         * @param {Object} data - новые данные
         * @returns {Promise<Object>} - ответ сервера
         */
        async updateLog(id, data) {
            const response = await new TrainingLogResource().updateResource(id, data)
            // После обновления обновляем список с текущими фильтрами
            await this.applyFilters({})
            return response
        },

        /**
         * 🔹 Удаление записи
         * @param {number|string} id - ID записи
         * @returns {Promise<void>}
         */
        async deleteLog(id) {
            await new TrainingLogResource().deleteResource(id)
            // После удаления обновляем список с текущими фильтрами
            await this.applyFilters({})
        },

        /**
         * 🔹 Загрузка статистики за период (с учётом фильтров)
         * @returns {Promise<void>}
         */
        async fetchStats() {
            try {
                const params = {}
                if (this.exerciseFilter) params.exercise_id = this.exerciseFilter
                if (this.dateRange?.from) params.from = this.dateRange.from
                if (this.dateRange?.to) params.to = this.dateRange.to

                const response = await new TrainingLogResource().getStatsResource(params)
                // response уже содержит только data
                this.stats = response
            } catch (error) {
                console.error('[Store] fetchStats error:', error)
            }
        },

        /**
         * 🔹 Загрузка сводки для шапки дашборда (всегда полная, без фильтров)
         * @returns {Promise<void>}
         */
        async fetchSummary() {
            try {
                const response = await new TrainingLogResource().getSummaryResource()
                // response уже содержит только data
                this.summary = response
            } catch (error) {
                console.error('[Store] fetchSummary error:', error)
            }
        }
    }
})

export default useTrainingLogStore
