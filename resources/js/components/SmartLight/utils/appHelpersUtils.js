/**
 * ============================================================================
 * HELPERS UTILS — ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ (УТИЛИТЫ)
 * ============================================================================
 * 📁 Путь: utils/appHelpersUtils.js
 * ✅ Используется: Все сервисы и компоненты
 * ✅ Рефакторинг: файл переименован, функции получили суффикс Utils
 * ============================================================================
 */

/**
 * Приведение строки к числу с валидацией (суффикс Utils)
 */
export const toNumberUtils = (value, defaultValue = 0) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && !isNaN(parseFloat(value))) return parseFloat(value);
    return defaultValue;
};

/**
 * Глубокое клонирование объекта (суффикс Utils)
 */
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

/**
 * Проверка на пустое значение (суффикс Utils)
 */
export const isEmptyUtils = (value) => {
    return value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0);
};

/**
 * Безопасное получение свойства из объекта (суффикс Utils)
 */
export const safeGetUtils = (obj, path, defaultValue = null) => {
    try {
        return path.split('.').reduce((acc, part) => acc?.[part], obj) ?? defaultValue;
    } catch {
        return defaultValue;
    }
};

export default { toNumberUtils, deepCloneUtils, isEmptyUtils, safeGetUtils };
