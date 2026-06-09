/**
 * ============================================================================
 * TRAINING HELPERS UTILS — ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
 * ============================================================================
 * 📁 Путь: @/components/Training/utils/trainingHelpersUtils.js
 * ✅ Рефакторинг: файл переименован, функции получили суффикс Utils
 * ============================================================================
 */

export const toNumberUtils = (value, defaultValue = 0) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && !isNaN(parseFloat(value))) return parseFloat(value);
    return defaultValue;
};

export const deepCloneUtils = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (Array.isArray(obj)) return obj.map(item => deepCloneUtils(item));
    const cloned = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            cloned[key] = deepCloneUtils(obj[key]);
        }
    }
    return cloned;
};

export const isEmptyUtils = (value) => {
    return value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0);
};

export const safeGetUtils = (obj, path, defaultValue = null) => {
    try {
        return path.split('.').reduce((acc, part) => acc?.[part], obj) ?? defaultValue;
    } catch {
        return defaultValue;
    }
};

/**
 * ============================================================================
 * ЭКСПОРТ ЛОГОВ В CSV (СУФФИКС Utils)
 * ============================================================================
 */
export const exportLogsToCsvUtils = (logs, columnsConfig, activeTab = 'mine') => {
    if (!logs || logs.length === 0) return false;

    const cols = columnsConfig[activeTab] || columnsConfig['mine'] || {};

    // 1. Формируем заголовки и ключи на основе включенных колонок
    const headers = [];
    const keys = [];

    if (cols.date) { headers.push('Дата'); keys.push('date'); }
    if (cols.time) { headers.push('Время'); keys.push('time'); }
    if (cols.exercise) { headers.push('Упражнение'); keys.push('exercise_name'); }
    if (cols.sharing) { headers.push('Доступ'); keys.push('access_type'); }
    if (cols.sets) { headers.push('Подходы (JSON)'); keys.push('sets'); }
    if (cols.reps) { headers.push('Всего повторов'); keys.push('total_reps'); }
    if (cols.volume) { headers.push('Объём (кг)'); keys.push('total_volume'); }
    if (cols.rating) { headers.push('Оценка'); keys.push('rating'); }

    // 2. Формируем строки данных
    const rows = logs.map(log => {
        return keys.map(key => {
            let val = '';
            if (key === 'exercise_name') {
                val = log.exercise?.name || 'Неизвестно';
            } else if (key === 'access_type') {
                val = log.is_public ? 'Публичный' : (log.shared_with?.length > 0 ? `Доступен (${log.shared_with.length})` : 'Личный');
            } else if (key === 'sets') {
                val = Array.isArray(log.sets) ? JSON.stringify(log.sets) : '';
            } else if (key === 'total_reps') {
                val = Array.isArray(log.sets) ? log.sets.reduce((sum, s) => sum + (Number(s.reps) || 0), 0) : 0;
            } else if (key === 'total_volume') {
                val = log.total_volume || 0;
            } else {
                val = log[key] ?? '';
            }

            // Экранирование для CSV (если есть точка с запятой, перенос строки или кавычки)
            if (typeof val === 'string' && (val.includes(';') || val.includes('\n') || val.includes('"'))) {
                val = `"${val.replace(/"/g, '""')}"`;
            }
            return val;
        }).join(';'); // Используем ';' для корректного открытия в русском Excel
    });

    // 3. Собираем итоговый текст с BOM (\uFEFF) для корректной кодировки UTF-8 в Excel
    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');

    // 4. Создаём и скачиваем файл
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `training_logs_${activeTab}_${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
};

export default {
    toNumberUtils,
    deepCloneUtils,
    isEmptyUtils,
    safeGetUtils,
    exportLogsToCsvUtils
};
