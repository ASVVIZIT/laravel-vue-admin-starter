/**
 * ============================================================================
 * TRAINING FORMATTERS — ФОРМАТТЕРЫ ДАННЫХ
 * ============================================================================
 * 📁 Путь: @/components/Training/utils/appFormattersUtils.js
 * ✅ Назначение: Единое форматирование дат, веса, времени, статистики
 * ============================================================================
 */

/**
 * Форматирование даты: 2026-05-31 → "31 мая 2026"
 */
export const formatDate = (date, options = {}) => {
    if (!date) return '—';

    const d = new Date(date);
    if (isNaN(d.getTime())) return '—';

    const {
        withTime = false,
        short = false,
        locale = 'ru-RU'
    } = options;

    if (short) {
        return d.toLocaleDateString(locale, {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    if (withTime) {
        return d.toLocaleString(locale, {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    return d.toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

/**
 * Форматирование времени: "09:30" → "09:30"
 */
export const formatTime = (time) => {
    if (!time) return '—';
    return time.length === 5 ? time : time.slice(0, 5);
};

/**
 * Форматирование веса: 25.5 → "25.5 кг"
 */
export const formatWeight = (weight, unit = 'кг') => {
    if (weight === null || weight === undefined) return '—';
    const num = parseFloat(weight);
    if (isNaN(num)) return '—';
    return `${num % 1 === 0 ? num : num.toFixed(1)} ${unit}`;
};

/**
 * Форматирование объёма (тоннаж): 450.75 → "450.8 кг·повт"
 */
export const formatVolume = (volume) => {
    if (volume === null || volume === undefined) return '—';
    const num = parseFloat(volume);
    if (isNaN(num)) return '—';
    return `${num.toFixed(1)} кг·повт`;
};

/**
 * Форматирование длительности: 1800 → "30 мин"
 */
export const formatDuration = (seconds) => {
    if (!seconds) return '—';
    const sec = parseInt(seconds);
    if (isNaN(sec)) return '—';

    if (sec < 60) return `${sec} сек`;
    if (sec < 3600) return `${Math.round(sec / 60)} мин`;
    return `${(sec / 3600).toFixed(1)} ч`;
};

/**
 * Форматирование дистанции: 5.2 → "5.2 км"
 */
export const formatDistance = (meters) => {
    if (meters === null || meters === undefined) return '—';
    const m = parseFloat(meters);
    if (isNaN(m)) return '—';
    return m >= 1000 ? `${(m / 1000).toFixed(1)} км` : `${Math.round(m)} м`;
};

/**
 * Форматирование подхода: {reps: 20, weight: 10} → "20×10 кг"
 */
export const formatSet = (set, exerciseType = 'bodyweight') => {
    if (!set) return '—';

    const parts = [];

    if (set.reps) parts.push(`${set.reps}×`);
    if (exerciseType === 'weighted' && set.weight) parts.push(formatWeight(set.weight));
    if (exerciseType === 'cardio') {
        if (set.duration) parts.push(formatDuration(set.duration));
        if (set.distance) parts.push(formatDistance(set.distance));
    }

    return parts.join(' ') || '—';
};

/**
 * ============================================================================
 * НОВЫЕ ФУНКЦИИ ДЛЯ ТАБЛИЦЫ И ТУЛТИПОВ
 * ============================================================================
 */

/**
 * Компактное форматирование подхода для отображения в таблице (горизонтальный список)
 * Отличается от formatSet более коротким выводом
 * @param {Object} set - объект подхода { reps, weight, duration, distance }
 * @param {string} type - тип упражнения: bodyweight | weighted | cardio | other
 * @returns {string} компактная строка для ячейки таблицы
 */
export const formatSetPreview = (set, type) => {
    if (!set) return '—';

    // 🔥 1. Кардио: длительность и/или дистанция
    if (type === 'cardio') {
        const parts = [];
        if (set.duration) {
            const m = Math.floor(set.duration / 60);
            const s = set.duration % 60;
            parts.push(s > 0 ? `${m}м${s}с` : `${m}мин`);
        }
        if (set.distance) {
            parts.push(set.distance >= 1000 ? `${(set.distance / 1000).toFixed(1)}км` : `${set.distance}м`);
        }
        return parts.join('/') || '—';
    }

    // 🔥 2. Свободный вес с отягощением: "10×50кг" (БЕЗ пробелов!)
    if (type === 'weighted' && set.weight && set.weight > 0) {
        return `${set.reps || 0}×${set.weight}кг`;
    }

    // 🔥 3. Bodyweight / other — ТОЛЬКО повторения, без "×"
    // Отжимания: "15", Приседания: "20", Подтягивания: "12"
    if (set.reps) {
        return `${set.reps}`;
    }

    return '—';
};

/**
 * Подсчитывает общее количество повторов из массива подходов
 * @param {Array} sets - массив подходов
 * @returns {string|number} сумма повторов или '—'
 */
export const calculateTotalReps = (sets) => {
    if (!Array.isArray(sets) || sets.length === 0) return '—';
    const total = sets.reduce((sum, set) => sum + (Number(set.reps) || 0), 0);
    return total || '—';
};

/**
 * Функция сортировки для Element Plus table column по количеству повторов
 * @param {Object} a - первая строка таблицы
 * @param {Object} b - вторая строка таблицы
 * @returns {number} результат сравнения для сортировки
 */
export const sortByReps = (a, b) => {
    const repA = calculateTotalReps(a.sets);
    const repB = calculateTotalReps(b.sets);
    return (repA === '—' ? 0 : repA) - (repB === '—' ? 0 : repB);
};

/**
 * Получает список уникальных ID упражнений из массива логов
 * @param {Array} logs - массив записей тренировок
 * @returns {Set<string>} Set с уникальными exercise_id
 */
export const getUsedExerciseIds = (logs) => {
    if (!Array.isArray(logs)) return new Set();
    const ids = new Set();
    logs.forEach(log => {
        if (log?.exercise_id) ids.add(String(log.exercise_id));
    });
    return ids;
};

/**
 * Форматирует количество дополнительных подходов для тултипа
 * @param {number} count - количество скрытых подходов
 * @returns {string} форматированная строка "+N"
 */
export const formatMoreSets = (count) => {
    if (!count || count <= 0) return '';
    return `+${count}`;
};

/**
 * ============================================================================
 * КОНЕЦ НОВЫХ ФУНКЦИЙ
 * ============================================================================
 */

/**
 * Форматирование серии тренировок: 7 → "🔥 7 дней"
 */
export const formatStreak = (days) => {
    if (!days) return '—';
    if (days === 1) return '1 день';
    if (days < 5) return `${days} дня`;
    return `🔥 ${days} дней`;
};

/**
 * Форматирование оценки: 4 → "★★★★☆"
 */
export const formatRating = (rating) => {
    if (!rating) return '—';
    const r = Math.min(5, Math.max(1, parseInt(rating)));
    return '★'.repeat(r) + '☆'.repeat(5 - r);
};

/**
 * Получение иконки по типу упражнения
 */
export const getExerciseIcon = (type) => {
    const icons = {
        bodyweight: 'Trophy',
        weighted: 'Coin',
        cardio: 'Bicycle',
        other: 'MoreFilled'
    };
    return icons[type] || 'MoreFilled';
};

/**
 * Получение цвета по типу упражнения (для тегов)
 */
export const getExerciseTagType = (type) => {
    const types = {
        bodyweight: 'success',
        weighted: 'warning',
        cardio: 'info',
        other: 'info'
    };
    return types[type] || 'info';
};

export default {
    formatDate,
    formatTime,
    formatWeight,
    formatVolume,
    formatDuration,
    formatDistance,
    formatSet,
    formatSetPreview,
    calculateTotalReps,
    sortByReps,
    getUsedExerciseIds,
    formatMoreSets,
    formatStreak,
    formatRating,
    getExerciseIcon,
    getExerciseTagType
};
