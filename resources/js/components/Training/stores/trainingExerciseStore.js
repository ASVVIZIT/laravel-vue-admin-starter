/**
 * ============================================================================
 * EXERCISE STORE — УПРАВЛЕНИЕ СПРАВОЧНИКОМ УПРАЖНЕНИЙ
 * ============================================================================
 * 📁 Путь: stores/training/exerciseStore.js
 * ✅ Рефакторинг: методы с суффиксом Store(), прямой импорт Resource
 * ============================================================================
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { logDebugUtils, logErrorUtils } from '@components/Training/utils/trainingLoggerUtils.js';
import { TrainingExerciseResource } from '@/components/Training/api/core/resource/TrainingExerciseResource.js';

// Фолбэк-данные если API не отвечает
const FALLBACK_EXERCISES = [
    { id: 1, name: 'Отжимания', type: 'bodyweight', default_unit: 'reps' },
    { id: 2, name: 'Подтягивания', type: 'bodyweight', default_unit: 'reps' },
    { id: 3, name: 'Приседания', type: 'bodyweight', default_unit: 'reps' },
    { id: 6, name: 'Жим штанги', type: 'weighted', default_unit: 'reps' },
    { id: 10, name: 'Бег', type: 'cardio', default_unit: 'km' },
];

export const useTrainingExerciseStore = defineStore('training-exercise', () => {
    // === STATE ===
    const exercises = ref([]);
    const exercisesMap = ref({});
    const exercisesLoaded = ref(false);
    const loading = ref(false);
    const error = ref(null);

    // === GETTERS: Для <el-select> ===
    const exercisesForDropdownStore = computed(() =>
        exercises.value.map(ex => ({
            value: ex.id,
            label: ex.name,
            type: ex.type,
            unit: ex.default_unit
        }))
    );

    const exercisesByTypeStore = computed(() => {
        return exercises.value.reduce((acc, ex) => {
            if (!acc[ex.type]) acc[ex.type] = [];
            acc[ex.type].push(ex);
            return acc;
        }, {});
    });

    // === GETTERS: Поиск ===
    const getExerciseByIdStore = (id) => exercisesMap.value[id] || null;
    const getExerciseByNameStore = (name) =>
        exercises.value.find(ex => ex.name.toLowerCase() === name.toLowerCase()) || null;

    // === ACTIONS ===
    const fetchExercisesStore = async () => {
        if (exercisesLoaded.value && !loading.value) {
            return { success: true, cached: true };
        }

        loading.value = true;
        error.value = null;
        logDebugUtils('ExerciseStore', 'Fetching exercises from API...');

        try {
            const resource = new TrainingExerciseResource();
            const response = await resource.getListResource();

            // Парсинг ответа (поддержка разных форматов)
            let list = [];
            if (Array.isArray(response)) {
                list = response;
            } else if (response?.data && Array.isArray(response.data)) {
                list = response.data;
            } else if (response?.success && Array.isArray(response.data)) {
                list = response.data;
            }

            if (list.length > 0) {
                exercises.value = list;
                exercisesMap.value = list.reduce((acc, ex) => {
                    if (ex?.id) acc[ex.id] = ex;
                    return acc;
                }, {});
                exercisesLoaded.value = true;
                logDebugUtils('ExerciseStore', `Loaded ${list.length} exercises`);
                return { success: true };
            } else {
                throw new Error('Пустой ответ от сервера');
            }
        } catch (err) {
            logErrorUtils('ExerciseStore', 'Failed to fetch exercises', err);
            error.value = err.message || 'Не удалось загрузить упражнения';
            // Фолбэк на константы
            exercises.value = FALLBACK_EXERCISES;
            exercisesMap.value = FALLBACK_EXERCISES.reduce((acc, ex) => {
                acc[ex.id] = ex;
                return acc;
            }, {});
            return { success: false, error: err.message };
        } finally {
            loading.value = false;
        }
    };

    const refreshExercisesStore = async () => {
        exercisesLoaded.value = false;
        return await fetchExercisesStore();
    };

    const clearExercisesStore = () => {
        exercises.value = [];
        exercisesMap.value = {};
        exercisesLoaded.value = false;
        logDebugUtils('ExerciseStore', 'Cache cleared');
    };

    const initExercisesStore = async () => {
        if (!exercisesLoaded.value) {
            await fetchExercisesStore();
        }
    };

    // ========================================================================
    // EXPOSE
    // ========================================================================
    return {
        // State
        exercises,
        exercisesMap,
        exercisesLoaded,
        loading,
        error,

        // Getters
        exercisesForDropdownStore,
        exercisesByTypeStore,
        getExerciseByIdStore,
        getExerciseByNameStore,

        // Actions
        fetchExercisesStore,
        refreshExercisesStore,
        clearExercisesStore,
        initExercisesStore
    };
});

export default useTrainingExerciseStore;
