import { defineStore } from 'pinia'
import { ref } from 'vue'
import { TrainingLogResource } from '@/components/Training/api/core/resource/TrainingLogResource.js'

export const useTrainingLogStore = defineStore('training-log', () => {
    const logs = ref([]), loading = ref(false), error = ref(null)
    const stats = ref(null), summary = ref(null)
    const dateFilter = ref(null), exerciseFilter = ref(null)
    const dateRange = ref({ from: null, to: null })
    const pagination = ref({ page: 1, per_page: 50, total: 0, last_page: 1 })
    let isFetching = false

    const parse = (res) => res?.data && Array.isArray(res.data) ? { list: res.data, meta: res.meta || {} } : { list: [], meta: null }

    const fetch = async () => {
        if (isFetching) return; isFetching = true; loading.value = true
        try {
            const { list, meta } = parse(await new TrainingLogResource().getListResource({
                page: pagination.value.page, per_page: pagination.value.per_page,
                date: dateFilter.value || undefined, exercise_id: exerciseFilter.value || undefined,
                from: dateRange.value.from || undefined, to: dateRange.value.to || undefined
            }))
            logs.value = list || []
            if (meta?.pagination) pagination.value = { page: meta.pagination.current_page, per_page: meta.pagination.per_page, total: meta.pagination.total, last_page: meta.pagination.last_page }
        } catch (e) { error.value = e.response?.data?.message || 'Ошибка'; logs.value = [] }
        finally { loading.value = false; isFetching = false }
    }

    const applyFilters = async (p) => {
        if (p.date !== undefined) dateFilter.value = p.date
        if (p.exercise_id !== undefined) exerciseFilter.value = p.exercise_id
        if (p.from !== undefined) dateRange.value.from = p.from
        if (p.to !== undefined) dateRange.value.to = p.to
        localStorage.setItem('training-date-filter', dateFilter.value || '')
        localStorage.setItem('training-exercise-filter', exerciseFilter.value || '')
        localStorage.setItem('training-date-range', JSON.stringify(dateRange.value))
        pagination.value.page = 1; await fetch()
    }

    const setPage = async (v) => { pagination.value.page = v; localStorage.setItem('training-page', v); await fetch() }
    const setPerPage = async (v) => { pagination.value.per_page = v; pagination.value.page = 1; localStorage.setItem('training-per-page', v); await fetch() }
    const clearFilters = async () => {
        dateFilter.value = null; exerciseFilter.value = null; dateRange.value = { from: null, to: null }
        localStorage.removeItem('training-date-filter'); localStorage.removeItem('training-exercise-filter'); localStorage.removeItem('training-date-range')
        pagination.value.page = 1; await fetch()
    }

    const createLog = async (d) => {
        await new TrainingLogResource().createResource(d)
        pagination.value.page = 1
        await Promise.all([fetch(), fetchStats(), fetchSummary()])
    }

    const updateLog = async (id, d) => {
        await new TrainingLogResource().updateResource(id, d)
        await Promise.all([fetch(), fetchStats(), fetchSummary()])
    }

    const deleteLog = async (id) => {
        await new TrainingLogResource().deleteResource(id)
        await Promise.all([fetch(), fetchStats(), fetchSummary()])
    }

    const fetchStats = async (p='week') => {
        try { stats.value = (await new TrainingLogResource().getStatsResource({ period: p }))?.data }
        catch { stats.value = null }
    }

    const fetchSummary = async () => {
        try { summary.value = await new TrainingLogResource().getSummaryResource() }
        catch { summary.value = null }
    }

    return { logs, loading, error, dateFilter, exerciseFilter, dateRange, pagination, stats, summary,
        fetch, applyFilters, setPage, setPerPage, clearFilters, createLog, updateLog, deleteLog, fetchStats, fetchSummary }
})
export default useTrainingLogStore
