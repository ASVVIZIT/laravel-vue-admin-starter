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
    formatStreak,
    formatRating,
    getExerciseIcon,
    getExerciseTagType
};
