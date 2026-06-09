import { ref, computed, toRaw } from 'vue';
import { useTrainingExerciseFields } from './useTrainingExerciseFields.js';
import { getFormRules } from '../utils/trainingValidatorsUtils.js';

export const useTrainingLogForm = (initialData = null, exercisesList = []) => {
    const form = ref({
        exercise_id: null,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        sets: [{ reps: null, weight: null, duration: null, distance: null, notes: '' }],
        is_public: false,
        shared_with: [],
        notes: '',
        rating: null
    });

    const list = computed(() => {
        if (typeof exercisesList === 'function') return exercisesList();
        if (exercisesList?.value) return exercisesList.value;
        return exercisesList || [];
    });

    const exercisesMap = computed(() =>
        list.value.reduce((acc, ex) => {
            acc[ex.id] = ex;
            acc[String(ex.id)] = ex;
            return acc;
        }, {})
    );

    const selectedExercise = computed(() => {
        const id = form.value.exercise_id;
        if (!id) return null;
        return exercisesMap.value[id] || exercisesMap.value[String(id)] || null;
    });

    const exerciseType = computed(() => selectedExercise.value?.type || 'bodyweight');
    const rules = computed(() => getFormRules(exerciseType.value, window.__CURRENT_USER_ID || null));

    const exerciseFields = computed(() => useTrainingExerciseFields(exerciseType.value));
    const defaultSet = computed(() => exerciseFields.value.defaultSet);

    const addSet = () => {
        const currentType = selectedExercise.value?.type || 'bodyweight'

        // 🔥 Умные дефолты: только то, что СЕМАНТИЧЕСКИ правильно
        const newSet = {
            reps: currentType === 'cardio' ? 1 : null,  // 1 для кардио (1 подход), null для силовых (сам введёт)
            weight: null,  // сам введёт
            duration: null,
            distance: null,
            notes: ''
        }

        form.value.sets.push(newSet)
    }

    const removeSet = (index) => {
        if (form.value.sets.length > 1) form.value.sets.splice(index, 1);
    };

    const resetForm = () => {
        form.value = {
            exercise_id: null,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toTimeString().slice(0, 5),
            sets: [{ ...defaultSet.value }],
            is_public: false,
            shared_with: [],
            notes: '',
            rating: null
        };
    };

    const loadFormData = (data) => {
        if (!data) return;
        form.value.exercise_id = data.exercise_id || null;
        form.value.date = data.date || form.value.date;
        form.value.time = data.time || form.value.time;

        const currentDefaultSet = defaultSet.value;
        form.value.sets = data.sets?.length
            ? data.sets.map(s => ({ ...currentDefaultSet, ...s }))
            : [{ ...currentDefaultSet }];

        form.value.is_public = !!data.is_public;
        form.value.shared_with = Array.isArray(data.shared_with)
            ? data.shared_with.map(id => parseInt(id))
            : [];
        form.value.notes = data.notes || '';
        form.value.rating = data.rating || null;
    };

    const getPlainPayload = () => {
        const raw = toRaw(form.value);
        const exerciseId = raw.exercise_id ? parseInt(raw.exercise_id, 10) : null;

        return {
            exercise_id: exerciseId,
            date: raw.date,
            time: raw.time,
            sets: raw.sets
                .map(set => {
                    const cleaned = {};
                    if (set.reps !== null && set.reps !== undefined && set.reps !== '')
                        cleaned.reps = parseInt(set.reps, 10);
                    if (set.weight !== null && set.weight !== undefined && set.weight !== '')
                        cleaned.weight = parseFloat(set.weight);
                    if (set.duration !== null && set.duration !== undefined && set.duration !== '')
                        cleaned.duration = parseInt(set.duration, 10);
                    if (set.distance !== null && set.distance !== undefined && set.distance !== '')
                        cleaned.distance = parseFloat(set.distance);
                    if (set.notes && String(set.notes).trim())
                        cleaned.notes = String(set.notes).trim();
                    return cleaned;
                })
                .filter(s => Object.keys(s).length > 0),
            is_public: !!raw.is_public,
            shared_with: Array.isArray(raw.shared_with)
                ? raw.shared_with.map(id => parseInt(id, 10)).filter(id => id > 0)
                : [],
            notes: raw.notes ? String(raw.notes).trim() : null,
            rating: raw.rating ? parseInt(raw.rating, 10) : null
        };
    };

    const validateForm = async (formRef) => {
        if (!formRef) throw new Error('formRef is required');
        return new Promise((resolve, reject) => {
            formRef.validate((valid) =>
                valid ? resolve(true) : reject(new Error('Validation failed'))
            );
        });
    };

    if (initialData) loadFormData(initialData);

    return {
        form,
        rules,
        selectedExercise,
        exerciseType,
        addSet,
        removeSet,
        resetForm,
        loadFormData,
        validateForm,
        getPlainPayload
    };
};

export default useTrainingLogForm;
