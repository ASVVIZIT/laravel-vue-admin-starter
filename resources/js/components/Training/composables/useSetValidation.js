export const validateSet = (set, type) => {
    const errors = {};
    const invalidFields = [];
    if (!set) return { isValid: false, errors: { _all: 'Пустой подход' }, invalidFields: ['_all'] };

    // Логика проверки полей
    if (type === 'weighted' || type === 'bodyweight') {
        if (!set.reps && set.reps !== 0) { errors.reps = 'Повторы'; invalidFields.push('reps'); }
    }
    if (type === 'weighted') {
        if (!set.weight && set.weight !== 0) { errors.weight = 'Вес'; invalidFields.push('weight'); }
    }
    if (type === 'cardio') {
        if (!set.duration && !set.distance) { errors.duration = 'Время или км'; invalidFields.push('duration'); }
    }
    if (type === 'other') {
        if (!set.duration && !set.reps) { errors.duration = 'Данные'; invalidFields.push('duration'); }
    }

    return { isValid: invalidFields.length === 0, errors, invalidFields };
};

export const useSetValidation = () => ({ validateSet });
