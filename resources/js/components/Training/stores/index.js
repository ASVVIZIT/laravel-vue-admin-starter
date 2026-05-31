import { useExerciseStore } from './exerciseStore.js';
import { useTrainingLogStore } from './trainingLogStore.js';

export const useTrainingStore = () => {
    const exerciseStore = useExerciseStore();
    const logStore = useTrainingLogStore();

    return {
        exercises: exerciseStore.exercises,
        exercisesMap: exerciseStore.exercisesMap,
        exercisesLoaded: exerciseStore.exercisesLoaded,
        exerciseLoading: exerciseStore.loading,
        exerciseError: exerciseStore.error,
        exercisesForDropdown: exerciseStore.exercisesForDropdownStore,
        fetchExercises: exerciseStore.fetchExercisesStore,
        initExercises: exerciseStore.initExercisesStore,

        logs: logStore.logs,
        loading: logStore.loading,
        error: logStore.error,
        dateFilter: logStore.dateFilter,
        exerciseFilter: logStore.exerciseFilter,
        dateRange: logStore.dateRange,
        pagination: logStore.pagination,
        stats: logStore.stats,
        summary: logStore.summary,

        fetchLogsStore: logStore.fetchLogsStore,
        applyFilters: logStore.applyFilters,
        setPage: logStore.setPage,
        setPerPage: logStore.setPerPage,
        clearFilters: logStore.clearFilters,
        createLog: logStore.createLogStore,
        updateLog: logStore.updateLogStore,
        deleteLog: logStore.deleteLogStore,
        fetchStats: logStore.fetchStatsStore,
        fetchSummary: logStore.fetchSummaryStore,
        init: async () => {
            await exerciseStore.initExercisesStore();
            await logStore.fetchLogsStore();
        }
    };
};

export { useExerciseStore } from './exerciseStore.js';
export { useTrainingLogStore } from './trainingLogStore.js';

export default {
    trainingStore: () => import('./index.js'),
    exerciseStore: () => import('./exerciseStore.js'),
    trainingLogStore: () => import('./trainingLogStore.js')
};
