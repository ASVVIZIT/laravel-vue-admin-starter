/**
 * ============================================================================
 * USE EXERCISE FIELDS — ДИНАМИЧЕСКИЕ ПОЛЯ ФОРМЫ ПО ТИПУ УПРАЖНЕНИЯ
 * ============================================================================
 */

export const useExerciseFields = (exerciseType = 'bodyweight') => {
    const fieldConfig = {
        bodyweight: {
            fields: ['reps'],
            labels: { reps: 'Повторы', weight: 'Вес', duration: 'Время', distance: 'Дистанция', notes: 'Заметка' },
            placeholders: { reps: 'Повторений', weight: 'Вес', duration: 'сек', distance: 'м', notes: 'Заметка' },
            units: { reps: '', weight: 'кг', duration: 'сек', distance: 'м', notes: '' },
            defaults: { reps: null, weight: null, duration: null, distance: null, notes: '' }
        },
        weighted: {
            fields: ['reps', 'weight'],
            labels: { reps: 'Повторы', weight: 'Вес', duration: 'Время', distance: 'Дистанция', notes: 'Заметка' },
            placeholders: { reps: 'Повторений', weight: 'Вес', duration: 'сек', distance: 'м', notes: 'Заметка' },
            units: { reps: '', weight: 'кг', duration: 'сек', distance: 'м', notes: '' },
            defaults: { reps: null, weight: null, duration: null, distance: null, notes: '' }
        },
        cardio: {
            fields: ['duration', 'distance'],
            labels: { reps: 'Повторы', weight: 'Вес', duration: 'Время', distance: 'Дистанция', notes: 'Заметка' },
            placeholders: { reps: 'Повторений', weight: 'Вес', duration: 'сек', distance: 'м', notes: 'Заметка' },
            units: { reps: '', weight: 'кг', duration: 'сек', distance: 'м', notes: '' },
            defaults: { reps: null, weight: null, duration: null, distance: null, notes: '' }
        },
        other: {
            fields: ['reps', 'duration'],
            labels: { reps: 'Повторы', weight: 'Вес', duration: 'Время', distance: 'Дистанция', notes: 'Заметка' },
            placeholders: { reps: 'Повторений', weight: 'Вес', duration: 'сек', distance: 'м', notes: 'Заметка' },
            units: { reps: '', weight: 'кг', duration: 'сек', distance: 'м', notes: '' },
            defaults: { reps: null, weight: null, duration: null, distance: null, notes: '' }
        }
    };

    const config = fieldConfig[exerciseType] || fieldConfig.bodyweight;

    const visibleFields = config.fields;
    const defaultSet = { ...config.defaults };
    const placeholderMap = config.placeholders;
    const unitMap = config.units;

    const getFieldLabel = (field) => config.labels[field] || field;
    const isFieldVisible = (field) => visibleFields.includes(field);

    const sanitizeSet = (set) => {
        const cleaned = { ...config.defaults };
        visibleFields.forEach(field => {
            if (set[field] !== null && set[field] !== undefined) cleaned[field] = set[field];
        });
        if (set.notes) cleaned.notes = set.notes;
        return cleaned;
    };

    return { visibleFields, defaultSet, placeholderMap, unitMap, getFieldLabel, isFieldVisible, sanitizeSet };
};

export default useExerciseFields;
