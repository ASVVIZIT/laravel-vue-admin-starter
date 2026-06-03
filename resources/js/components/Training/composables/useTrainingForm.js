import { ref, computed, watch, toRaw } from 'vue';
import { useExerciseFields } from './useExerciseFields.js';
import { getFormRules } from '../utils/appValidatorsUtils.js';

export const useTrainingForm = (initialData = null, exercisesList = []) => {
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
        list.value.reduce((acc, ex) => { acc[ex.id] = ex; return acc; }, {})
    );

    const selectedExercise = computed(() =>
        form.value.exercise_id ? exercisesMap.value[form.value.exercise_id] : null
    );

    const exerciseType = computed(() => selectedExercise.value?.type || 'bodyweight');
    const rules = computed(() => getFormRules(exerciseType.value, window.__CURRENT_USER_ID__ || null));

    const { defaultSet, sanitizeSet } = useExerciseFields(exerciseType.value);

    const addSet = () => { form.value.sets.push({ ...defaultSet }); };
    const removeSet = (index) => { if (form.value.sets.length > 1) form.value.sets.splice(index, 1); };

    const resetForm = () => {
        form.value = {
            exercise_id: null,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toTimeString().slice(0, 5),
            sets: [{ ...defaultSet }],
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
        form.value.sets = data.sets?.length ? data.sets.map(s => ({ ...defaultSet, ...s })) : [{ ...defaultSet }];
        form.value.is_public = !!data.is_public;
        form.value.shared_with = Array.isArray(data.shared_with) ? data.shared_with.map(id => parseInt(id)) : [];
        form.value.notes = data.notes || '';
        form.value.rating = data.rating || null;
    };

    const getPlainPayload = () => {
        const raw = toRaw(form.value);

        return {
            exercise_id: raw.exercise_id,
            date: raw.date,
            time: raw.time,

            // 🔥 ФИЛЬТРАЦИЯ ПОДХОДОВ: сохраняем только заполненные поля + notes
            sets: raw.sets.map(set => {
                const cleaned = {};

                // Сохраняем числовые поля, только если они заполнены
                if (set.reps !== null && set.reps !== undefined && set.reps !== '') cleaned.reps = parseInt(set.reps);
                if (set.weight !== null && set.weight !== undefined && set.weight !== '') cleaned.weight = parseFloat(set.weight);
                if (set.duration !== null && set.duration !== undefined && set.duration !== '') cleaned.duration = parseInt(set.duration);
                if (set.distance !== null && set.distance !== undefined && set.distance !== '') cleaned.distance = parseFloat(set.distance);

                // 🔥 notes сохраняем всегда, если есть текст
                if (set.notes && typeof set.notes === 'string' && set.notes.trim()) {
                    cleaned.notes = set.notes.trim();
                }

                return cleaned;
            }),

            is_public: !!raw.is_public,

            // 🔥 shared_with: чистим массив от пустых значений
            shared_with: Array.isArray(raw.shared_with)
                ? raw.shared_with.map(id => parseInt(id)).filter(id => id > 0)
                : [],

            notes: raw.notes?.trim() || null,
            rating: raw.rating || null
        };
    };

    const validateForm = async (formRef) => {
        if (!formRef) throw new Error('formRef is required');
        return new Promise((resolve, reject) => {
            formRef.validate((valid) => valid ? resolve(true) : reject(new Error('Validation failed')));
        });
    };

    watch(() => exerciseType.value, (newType, oldType) => {
        if (newType !== oldType) {
            const { defaultSet: newDefaults, sanitizeSet: newSanitize } = useExerciseFields(newType);
            form.value.sets = form.value.sets.map(set => newSanitize(set));
        }
    });

    if (initialData) loadFormData(initialData);

    return { form, rules, selectedExercise, exerciseType, addSet, removeSet, resetForm, loadFormData, validateForm, getPlainPayload };
};

export default useTrainingForm;
