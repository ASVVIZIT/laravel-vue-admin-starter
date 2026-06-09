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
 * ЭКСПОРТ ЛОГОВ В CSV (СУФФИКС Utils) — ЗАЩИЩЕННАЯ ВЕРСИЯ (P0-P3)
 * ============================================================================
 */
export const exportLogsToCsvUtils = (logs, columnsConfig, activeTab = 'mine') => {
    if (!logs || logs.length === 0) return false;

    const cols = columnsConfig[activeTab] || columnsConfig['mine'] || {};

    // 1. Формируем заголовки и ключи
    const headers = [];
    const keys = [];

    if (cols.date) { headers.push('Дата'); keys.push('date'); }
    if (cols.time) { headers.push('Время'); keys.push('time'); }
    if (cols.exercise) { headers.push('Упражнение'); keys.push('exercise_name'); }
    if (cols.sharing) { headers.push('Доступ'); keys.push('access_type'); }
    if (cols.sets) { headers.push('Подходы'); keys.push('sets'); } // Убрали "(JSON)"
    if (cols.reps) { headers.push('Всего повторов'); keys.push('total_reps'); }
    if (cols.volume) { headers.push('Объём (кг)'); keys.push('total_volume'); }
    if (cols.rating) { headers.push('Оценка'); keys.push('rating'); }

    // --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ (P0/P1 FIXES) ---

    // P0 Fix: Безопасный парсинг даты БЕЗ сдвига часовых поясов
    const formatDateForCsv = (dateStr) => {
        if (!dateStr) return '';
        // Берем только "2026-06-06", разбиваем и переворачиваем в "06.06.2026"
        return String(dateStr).split('T')[0].split('-').reverse().join('.');
    };

    // P1 Fix: Умное форматирование подходов (включая кардио и защиту от null)
    const formatSetsForCsv = (sets) => {
        if (!Array.isArray(sets) || sets.length === 0) return 'Нет данных';

        return sets.map((set, idx) => {
            // P0 Fix: Защита от null/undefined внутри массива
            if (!set || typeof set !== 'object') return `${idx + 1}. Ошибка данных`;

            const parts = [];
            if (set.reps) parts.push(`${set.reps}x`);

            if (set.weight) {
                // P1 Fix: Заменяем точку на запятую для корректного распознавания чисел в RU Excel
                parts.push(`${String(set.weight).replace('.', ',')}кг`);
            }

            if (set.duration || set.distance) {
                const cardioParts = [];
                if (set.duration) {
                    const m = Math.floor(set.duration / 60);
                    const s = set.duration % 60;
                    cardioParts.push(s > 0 ? `${m}м${s}с` : `${m}мин`);
                }
                if (set.distance) {
                    const dist = set.distance >= 1000 ? `${(set.distance / 1000).toFixed(1).replace('.', ',')}км` : `${set.distance}м`;
                    cardioParts.push(dist);
                }
                parts.push(cardioParts.join(' / '));
            }

            let baseStr = parts.join('') || 'Без параметров';

            // P1 Fix: Жесткая очистка переносов строк и экранирование кавычек в заметках
            if (set.notes) {
                const cleanNote = String(set.notes).replace(/[\r\n]+/g, ' ').replace(/"/g, "'").trim();
                if (cleanNote) baseStr += ` (${cleanNote})`;
            }

            return `${idx + 1}. ${baseStr}`;
        }).join(' | '); // Разделитель подходов внутри одной ячейки
    };

    // 2. Формируем строки данных
    const rows = logs.map(log => {
        return keys.map(key => {
            let val = '';

            if (key === 'date') {
                val = formatDateForCsv(log.date);
            } else if (key === 'time') {
                // P2 Fix: Обрезаем секунды, если они есть (12:41:00 -> 12:41)
                val = log.time ? String(log.time).substring(0, 5) : '';
            } else if (key === 'exercise_name') {
                // P2 Fix: Фолбэки, если exercise это не объект
                val = (typeof log.exercise === 'object' ? log.exercise?.name : log.exercise_name) || 'Неизвестно';
            } else if (key === 'access_type') {
                val = log.is_public ? 'Публичный' : (log.shared_with?.length > 0 ? `Доступен (${log.shared_with.length})` : 'Личный');
            } else if (key === 'sets') {
                val = formatSetsForCsv(log.sets);
            } else if (key === 'total_reps') {
                // P1 Fix: Локализованное число (59, а не 59.0)
                val = Array.isArray(log.sets) ? log.sets.reduce((sum, s) => sum + (Number(s?.reps) || 0), 0).toLocaleString('ru-RU') : '0';
            } else if (key === 'total_volume') {
                // P1 Fix: Локализованное число с плавающей точкой (1 144,2 вместо 1144.2)
                val = (log.total_volume || 0).toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
            } else if (key === 'rating') {
                val = log.rating ? `${log.rating}/5` : '';
            } else {
                val = log[key] ?? '';
            }

            // Стандартное экранирование CSV: если есть ;, \n или ", оборачиваем в "" и удваиваем внутренние "
            if (typeof val === 'string' && (val.includes(';') || val.includes('\n') || val.includes('"'))) {
                val = `"${val.replace(/"/g, '""')}"`;
            }
            return val;
        }).join(';');
    });

    // 3. Собираем с BOM (\uFEFF) для Excel
    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');

    // 4. Скачивание
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
