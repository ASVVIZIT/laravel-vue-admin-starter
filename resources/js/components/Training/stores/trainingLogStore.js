import { defineStore } from 'pinia';
import { ref } from 'vue';
import { TrainingLogResource } from '@/components/Training/api/core/resource/TrainingLogResource.js';

export const useTrainingLogStore = defineStore('training-log', () => {
    const logs = ref([]);
    const loading = ref(false);
    const error = ref(null);
    const stats = ref(null);
    const summary = ref(null);

    // Загружаем из LocalStorage ТОЛЬКО ОДИН РАЗ при создании стора
    const dateFilter = ref(localStorage.getItem('training-date-filter') || null);
    const exerciseFilter = ref(localStorage.getItem('training-exercise-filter') ? Number(localStorage.getItem('training-exercise-filter')) : null);
    const dateRange = ref({
        from: localStorage.getItem('training-date-from') || null,
        to: localStorage.getItem('training-date-to') || null
    });
    const pagination = ref({
        page: parseInt(localStorage.getItem('training-page') || '1'),
        per_page: parseInt(localStorage.getItem('training-per-page') || '50'),
        total: 0,
        last_page: 1
    });

    const parseResponse = (response) => {
        if (!response) return { list: [], meta: null };
        if (Array.isArray(response)) return { list: response, meta: null };
        if (response.data && Array.isArray(response.data)) return { list: response.data, meta: response.meta || {} };
        return { list: [], meta: null };
    };

    const fetchLogsStore = async () => {
        loading.value = true;
        error.value = null;
        try {
            const resource = new TrainingLogResource();
            const response = await resource.getListResource({
                page: pagination.value.page,
                per_page: pagination.value.per_page,
                date: dateFilter.value || undefined,
                exercise_id: exerciseFilter.value || undefined,
                from: dateRange.value.from || undefined,
                to: dateRange.value.to || undefined,
            });

            const { list, meta } = parseResponse(response);
            logs.value = Array.isArray(list) ? list : [];

            if (meta?.pagination) {
                pagination.value = {
                    page: meta.pagination.current_page || 1,
                    per_page: meta.pagination.per_page || 50,
                    total: meta.pagination.total || 0,
                    last_page: meta.pagination.last_page || 1,
                };
            }
        } catch (err) {
            error.value = err.response?.data?.message || 'Ошибка загрузки';
            logs.value = [];
        } finally {
            loading.value = false;
        }
    };

    // Явные методы применения фильтров (без watch!)
    const applyFilters = async (filters) => {
        if (filters.date !== undefined) dateFilter.value = filters.date;
        if (filters.exercise_id !== undefined) exerciseFilter.value = filters.exercise_id;
        if (filters.from !== undefined) dateRange.value.from = filters.from;
        if (filters.to !== undefined) dateRange.value.to = filters.to;

        localStorage.setItem('training-date-filter', dateFilter.value || '');
        localStorage.setItem('training-exercise-filter', exerciseFilter.value || '');
        localStorage.setItem('training-date-from', dateRange.value.from || '');
        localStorage.setItem('training-date-to', dateRange.value.to || '');

        pagination.value.page = 1;
        await fetchLogsStore();
    };

    const setPage = async (page) => {
        pagination.value.page = page;
        localStorage.setItem('training-page', page);
        await fetchLogsStore();
    };

    const setPerPage = async (perPage) => {
        pagination.value.per_page = perPage;
        pagination.value.page = 1;
        localStorage.setItem('training-per-page', perPage);
        await fetchLogsStore();
    };

    const clearFilters = async () => {
        dateFilter.value = null;
        exerciseFilter.value = null;
        dateRange.value = { from: null, to: null };
        localStorage.removeItem('training-date-filter');
        localStorage.removeItem('training-exercise-filter');
        localStorage.removeItem('training-date-from');
        localStorage.removeItem('training-date-to');
        pagination.value.page = 1;
        await fetchLogsStore();
    };

    const createLogStore = async (payload) => {
        await new TrainingLogResource().createResource(payload);
        pagination.value.page = 1;
        await Promise.all([fetchLogsStore(), fetchSummaryStore()]);
    };

    const updateLogStore = async (id, payload) => {
        await new TrainingLogResource().updateResource(id, payload);
        await fetchLogsStore();
    };

    const deleteLogStore = async (id) => {
        await new TrainingLogResource().deleteResource(id);
        await Promise.all([fetchLogsStore(), fetchSummaryStore()]);
    };

    const fetchStatsStore = async (period = 'week') => {
        try {
            const res = await new TrainingLogResource().getStatsResource({ period });
            stats.value = res?.data || res || null;
        } catch { stats.value = null; }
    };

    const fetchSummaryStore = async () => {
        try {
            const res = await new TrainingLogResource().getSummaryResource();
            summary.value = res || null;
        } catch { summary.value = null; }
    };

    return {
        logs, loading, error, dateFilter, exerciseFilter, dateRange, pagination, stats, summary,
        fetchLogsStore, fetchStatsStore, fetchSummaryStore,
        applyFilters, setPage, setPerPage, clearFilters,
        createLogStore, updateLogStore, deleteLogStore
    };
});

export default useTrainingLogStore;
