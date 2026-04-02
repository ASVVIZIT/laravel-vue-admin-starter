/**
 * ============================================================================
 * HELPERS — ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
 * ============================================================================
 * 📁 Путь: utils/appHelpers.js
 * ✅ Используется: Все сервисы и компоненты
 * ============================================================================
 */

/**
 * Приведение строки к числу с валидацией
 */
export const toNumber = (value, defaultValue = 0) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && !isNaN(parseFloat(value))) return parseFloat(value);
    return defaultValue;
};

/**
 * Глубокое клонирование объекта
 */
export const deepClone = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (Array.isArray(obj)) return obj.map(item => deepClone(item));
    const cloned = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }
    return cloned;
};

/**
 * Проверка на пустое значение
 */
export const isEmpty = (value) => {
    return value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0);
};

/**
 * Безопасное получение свойства из объекта
 */
export const safeGet = (obj, path, defaultValue = null) => {
    try {
        return path.split('.').reduce((acc, part) => acc?.[part], obj) ?? defaultValue;
    } catch {
        return defaultValue;
    }
};

export default { toNumber, deepClone, isEmpty, safeGet };
