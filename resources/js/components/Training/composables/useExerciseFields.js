/**
 * ============================================================================
 * USE EXERCISE FIELDS — ДИНАМИЧЕСКИЕ ПОЛЯ ФОРМЫ ПО ТИПУ УПРАЖНЕНИЯ
 * ============================================================================
 * 📁 Путь: @/components/Training/composables/useExerciseFields.js
 * ✅ Назначение: Маппинг type → видимые поля (reps/weight/duration/distance)
 * ✅ Возврат: { visibleFields, defaultSet, placeholderMap, unitMap }
 * ============================================================================
 */

export const useExerciseFields = (exerciseType = 'bodyweight') => {
    // Конфигурация полей по типам упражнений
    const fieldConfig = {
        bodyweight: {
            fields: ['reps'],
            labels: { reps: 'Повторы' },
            placeholders: { reps: 'шт' },
            units: { reps: '' },
            defaults: { reps: null, weight: null, duration: null, distance: null }
        },
        weighted: {
            fields: ['reps', 'weight'],
            labels: { reps: 'Повторы', weight: 'Вес' },
            placeholders: { reps: 'шт', weight: 'кг' },
            units: { reps: '', weight: 'кг' },
            defaults: { reps: null, weight: null, duration: null, distance: null }
        },
        cardio: {
            fields: ['duration', 'distance'],
            labels: { duration: 'Длительность', distance: 'Дистанция' },
            placeholders: { duration: 'сек', distance: 'м' },
            units: { duration: 'сек', distance: 'м' },
            defaults: { reps: null, weight: null, duration: null, distance: null }
        },
        other: {
            fields: ['reps', 'duration'],
            labels: { reps: 'Повторы', duration: 'Время' },
            placeholders: { reps: 'шт', duration: 'мин' },
            units: { reps: '', duration: 'мин' },
            defaults: { reps: null, weight: null, duration: null, distance: null }
        }
    };

    // Fallback для неизвестного типа
    const config = fieldConfig[exerciseType] || fieldConfig.bodyweight;

    /**
     * Видимые поля для текущего типа упражнения
     */
    const visibleFields = config.fields;

    /**
     * Значения по умолчанию для нового подхода
     */
    const defaultSet = { ...config.defaults };

    /**
     * Маппинг поле → плейсхолдер
     */
    const placeholderMap = config.placeholders;

    /**
     * Маппинг поле → единица измерения
     */
    const unitMap = config.units;

    /**
     * Получить лейбл поля
     */
    const getFieldLabel = (field) => config.labels[field] || field;

    /**
     * Проверить, нужно ли показывать поле
     */
    const isFieldVisible = (field) => visibleFields.includes(field);

    /**
     * Сбросить невидимые поля в null (для очистки перед отправкой)
     */
    const sanitizeSet = (set) => {
        const cleaned = { ...config.defaults };
        visibleFields.forEach(field => {
            if (set[field] !== null && set[field] !== undefined) {
                cleaned[field] = set[field];
            }
        });
        // Всегда копируем notes если есть
        if (set.notes) cleaned.notes = set.notes;
        return cleaned;
    };

    return {
        visibleFields,
        defaultSet,
        placeholderMap,
        unitMap,
        getFieldLabel,
        isFieldVisible,
        sanitizeSet
    };
};

export default useExerciseFields;
