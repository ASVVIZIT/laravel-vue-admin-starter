/**
 * ============================================================================
 * TRAINING STATS CONFIG — НАСТРОЙКИ ОТОБРАЖЕНИЯ СТАТИСТИКИ
 * ============================================================================
 * 📁 Путь: @/components/Training/config/statsConfig.js
 * ✅ Назначение: Управление метриками, типами, форматами и лейаутами
 * ============================================================================
 */

export const TRAINING_STATS_CONFIG = {
    // 🔹 Общие метрики (всегда отображаются)
    general: [
        { key: 'today.sessions', label: 'Сегодня', suffix: 'с.' },
        { key: 'week.sessions', label: 'Неделя', format: 'week_ratio' },
        { key: 'streak', label: '🔥', suffix: 'дн.' },
        { key: 'total_volume', label: '⚖️', format: 'volume' }
    ],

    // 🔹 Метрики по типам упражнений
    types: [
        {
            key: 'bodyweight',
            icon: '💪',
            label: 'Собств. вес',
            metric: 'reps',
            format: 'reps',
            color: '#409eff',
            bg: '#e8f4fd'
        },
        {
            key: 'weighted',
            icon: '🏋️',
            label: 'Тяжести',
            metric: 'volume',
            format: 'volume',
            color: '#67c23a',
            bg: '#f0f9eb'
        },
        {
            key: 'cardio',
            icon: '🏃',
            label: 'Кардио',
            metric: 'distance',
            format: 'distance',
            color: '#e6a23c',
            bg: '#fdf6ec'
        },
        {
            key: 'other',
            icon: '⚙️',
            label: 'Другое',
            metric: 'reps',
            format: 'reps',
            color: '#909399',
            bg: '#f4f4f5'
        }
    ],

    // 🔹 Поведение лейаутов
    layout: {
        mobileBreakpoint: 768,
        showTypesOnMobile: false,   // На мобильном показываем только общие метрики
        maxTypeItemsDesktop: 4,     // Макс. количество типов на десктопе
        compactMode: false          // Если true, убирает лейблы, оставляет только значения
    }
}

export default { TRAINING_STATS_CONFIG }
