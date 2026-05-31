/**
 * ============================================================================
 * TRAINING VALIDATORS — ПРАВИЛА ВАЛИДАЦИИ ФОРМ
 * ============================================================================
 * 📁 Путь: @/components/Training/utils/appValidatorsUtils.js
 * ✅ Назначение: Валидация sets, rating, shared_with, дат
 * ✅ Совместимость: Element Plus Form Rules
 * ============================================================================
 */

/**
 * Валидация массива подходов (sets)
 */
export const validateSets = (rule, value, callback, exerciseType = 'bodyweight') => {
    if (!Array.isArray(value) || value.length === 0) {
        return callback(new Error('Добавьте хотя бы один подход'));
    }

    for (let i = 0; i < value.length; i++) {
        const set = value[i];
        const index = i + 1;

        if (exerciseType === 'bodyweight' || exerciseType === 'weighted' || exerciseType === 'other') {
            if (!set.reps || set.reps < 0) {
                return callback(new Error(`Подход #${index}: укажите количество повторений`));
            }
            if (set.reps > 1000) {
                return callback(new Error(`Подход #${index}: слишком большое значение`));
            }
        }

        if (exerciseType === 'weighted') {
            if (set.weight !== null && set.weight !== undefined && set.weight < 0) {
                return callback(new Error(`Подход #${index}: вес не может быть отрицательным`));
            }
            if (set.weight > 1000) {
                return callback(new Error(`Подход #${index}: слишком большой вес`));
            }
        }

        if (exerciseType === 'cardio') {
            if (!set.duration && !set.distance) {
                return callback(new Error(`Подход #${index}: укажите длительность или дистанцию`));
            }
            if (set.duration && (set.duration < 0 || set.duration > 86400)) {
                return callback(new Error(`Подход #${index}: некорректная длительность`));
            }
            if (set.distance && (set.distance < 0 || set.distance > 42195)) {
                return callback(new Error(`Подход #${index}: некорректная дистанция`));
            }
        }
    }

    callback();
};

/**
 * Валидация оценки (1-5)
 */
export const validateRating = (rule, value, callback) => {
    if (value === null || value === undefined || value === '') {
        return callback(); // опциональное поле
    }
    const num = parseInt(value);
    if (isNaN(num) || num < 1 || num > 5) {
        return callback(new Error('Оценка должна быть от 1 до 5'));
    }
    callback();
};

/**
 * Валидация shared_with (массив ID пользователей)
 */
export const validateSharedWith = (rule, value, callback, currentUserId) => {
    if (!value || !Array.isArray(value)) {
        return callback(); // опциональное поле
    }

    if (value.length > 10) {
        return callback(new Error('Можно поделиться максимум с 10 пользователями'));
    }

    if (value.includes(currentUserId)) {
        return callback(new Error('Нельзя добавить себя в список доступа'));
    }

    const unique = new Set(value);
    if (unique.size !== value.length) {
        return callback(new Error('Пользователи не должны повторяться'));
    }

    callback();
};

/**
 * Валидация даты (не в будущем)
 */
export const validateDateNotFuture = (rule, value, callback) => {
    if (!value) return callback();
    const date = new Date(value);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (date > today) {
        return callback(new Error('Дата не может быть в будущем'));
    }
    callback();
};

/**
 * Валидация времени (формат HH:mm)
 */
export const validateTimeFormat = (rule, value, callback) => {
    if (!value) return callback();
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(value)) {
        return callback(new Error('Время должно быть в формате ЧЧ:ММ'));
    }
    callback();
};

/**
 * Валидация заметок (макс. длина)
 */
export const validateNotes = (rule, value, callback, maxLength = 1000) => {
    if (!value) return callback();
    if (value.length > maxLength) {
        return callback(new Error(`Максимальная длина: ${maxLength} символов`));
    }
    callback();
};

/**
 * Генерация правил для Element Plus Form
 */
export const getFormRules = (exerciseType = 'bodyweight', currentUserId = null) => {
    return {
        exercise_id: [
            { required: true, message: 'Выберите упражнение', trigger: 'change' }
        ],
        date: [
            { required: true, message: 'Укажите дату', trigger: 'blur' },
            { validator: validateDateNotFuture, trigger: 'blur' }
        ],
        time: [
            { required: true, message: 'Укажите время', trigger: 'blur' },
            { validator: validateTimeFormat, trigger: 'blur' }
        ],
        sets: [
            { validator: (r, v, c) => validateSets(r, v, c, exerciseType), trigger: 'blur' }
        ],
        rating: [
            { validator: validateRating, trigger: 'blur' }
        ],
        shared_with: [
            { validator: (r, v, c) => validateSharedWith(r, v, c, currentUserId), trigger: 'change' }
        ],
        notes: [
            { validator: (r, v, c) => validateNotes(r, v, c), trigger: 'blur' }
        ]
    };
};

/**
 * Быстрая валидация числа в диапазоне
 */
export const numberInRange = (min, max, message = null) => (rule, value, callback) => {
    if (value === null || value === undefined || value === '') return callback();
    const num = parseFloat(value);
    if (isNaN(num) || num < min || num > max) {
        return callback(new Error(message || `Значение должно быть от ${min} до ${max}`));
    }
    callback();
};

export default {
    validateSets,
    validateRating,
    validateSharedWith,
    validateDateNotFuture,
    validateTimeFormat,
    validateNotes,
    getFormRules,
    numberInRange
};
