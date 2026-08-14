/**
 * ============================================================================
 * USE TABLE FILTERS PERSISTENCE — УНИВЕРСАЛЬНОЕ СОХРАНЕНИЕ ФИЛЬТРОВ ТАБЛИЦ
 * ============================================================================
 *
 * 📁 Файл: useTableFiltersPersistence.js
 * 📝 Описание: Composable для сохранения фильтров, пагинации и сортировки таблиц
 * 🔗 Используется во всех таблицах: Users, SmartLight, Training, Entities и т.д.
 *
 * ============================================================================
 * ФОРМАТ КЛЮЧЕЙ ХРАНЕНИЯ
 * ============================================================================
 *
 * table-filters-{entity}-{section}-{field}
 *
 * Примеры:
 *   table-filters-users-filters-search
 *   table-filters-users-filters-roles
 *   table-filters-users-filters-status
 *   table-filters-users-pagination-current_page
 *   table-filters-users-pagination-per_page
 *   table-filters-smartlight-filters-device_type
 *   table-filters-training-filters-difficulty
 *
 * ============================================================================
 */

const STORAGE_PREFIX = 'table-filters-';
const DEBOUNCE_MS = 300;

// Debounce таймеры для каждого ключа
const debounceTimers = new Map();

/**
 * Безопасная запись в localStorage с debounce
 * Поддерживает строки, числа, boolean, массивы и объекты
 */
function safeSetItem(key, value) {
    try {
        // Очищаем предыдущий таймер для этого ключа
        if (debounceTimers.has(key)) {
            clearTimeout(debounceTimers.get(key));
        }

        const timer = setTimeout(() => {
            try {
                if (value === '' || value === null || value === undefined) {
                    localStorage.removeItem(key);
                } else if (typeof value === 'object') {
                    // Для объектов и массивов используем JSON
                    localStorage.setItem(key, JSON.stringify(value));
                } else {
                    localStorage.setItem(key, String(value));
                }
            } catch (e) {
                console.warn(`[TableFilters] Failed to save key "${key}":`, e);
            }
            debounceTimers.delete(key);
        }, DEBOUNCE_MS);

        debounceTimers.set(key, timer);
    } catch (e) {
        console.warn(`[TableFilters] Error setting debounce timer:`, e);
    }
}

/**
 * Безопасное чтение из localStorage с автопарсингом JSON
 */
function safeGetItem(key, defaultValue = '') {
    try {
        const value = localStorage.getItem(key);
        if (value === null) return defaultValue;

        // Пытаемся распарсить как JSON (для массивов и объектов)
        try {
            return JSON.parse(value);
        } catch {
            // Если не JSON, возвращаем как строку
            return value;
        }
    } catch (e) {
        return defaultValue;
    }
}

/**
 * Безопасное удаление из localStorage
 */
function safeRemoveItem(key) {
    try {
        localStorage.removeItem(key);
    } catch (e) {
        console.warn(`[TableFilters] Failed to remove key "${key}":`, e);
    }
}

/**
 * Composable для работы с сохранением фильтров таблиц
 *
 * @param {string} entity - Название сущности (users, smartlight, training и т.д.)
 */
export function useTableFiltersPersistence(entity) {
    if (!entity) {
        throw new Error('[TableFilters] Entity name is required');
    }

    /**
     * Сохранить значение фильтра
     * @param {string} section - Секция (filters, pagination, sorting)
     * @param {string} field - Поле (search, roles, status, current_page и т.д.)
     * @param {*} value - Значение для сохранения
     */
    const saveFilter = (section, field, value) => {
        const key = `${STORAGE_PREFIX}${entity}-${section}-${field}`;
        safeSetItem(key, value);
    };

    /**
     * Восстановить значение фильтра
     * @param {string} section - Секция
     * @param {string} field - Поле
     * @param {*} defaultValue - Значение по умолчанию
     * @returns {*} Восстановленное значение
     */
    const restoreFilter = (section, field, defaultValue = '') => {
        const key = `${STORAGE_PREFIX}${entity}-${section}-${field}`;
        return safeGetItem(key, defaultValue);
    };

    /**
     * Восстановить boolean значение
     */
    const restoreBoolean = (section, field, defaultValue = false) => {
        const key = `${STORAGE_PREFIX}${entity}-${section}-${field}`;
        const value = safeGetItem(key, null);
        if (value === null) return defaultValue;
        return value === 'true' || value === true;
    };

    /**
     * Восстановить числовое значение
     */
    const restoreNumber = (section, field, defaultValue = 0) => {
        const key = `${STORAGE_PREFIX}${entity}-${section}-${field}`;
        const value = safeGetItem(key, null);
        if (value === null) return defaultValue;
        const num = Number(value);
        return isNaN(num) ? defaultValue : num;
    };

    /**
     * Восстановить массив
     */
    const restoreArray = (section, field, defaultValue = []) => {
        const key = `${STORAGE_PREFIX}${entity}-${section}-${field}`;
        const value = safeGetItem(key, null);
        if (value === null) return defaultValue;
        return Array.isArray(value) ? value : defaultValue;
    };

    /**
     * Очистить конкретный фильтр
     */
    const clearFilter = (section, field) => {
        const key = `${STORAGE_PREFIX}${entity}-${section}-${field}`;
        safeRemoveItem(key);
    };

    /**
     * Очистить все фильтры для секции
     */
    const clearSection = (section) => {
        try {
            const prefix = `${STORAGE_PREFIX}${entity}-${section}-`;
            Object.keys(localStorage)
                .filter(key => key.startsWith(prefix))
                .forEach(key => safeRemoveItem(key));
        } catch (e) {
            console.warn(`[TableFilters] Failed to clear section "${section}":`, e);
        }
    };

    /**
     * Очистить ВСЕ сохранения для сущности
     */
    const clearAllFilters = () => {
        try {
            const prefix = `${STORAGE_PREFIX}${entity}-`;
            Object.keys(localStorage)
                .filter(key => key.startsWith(prefix))
                .forEach(key => safeRemoveItem(key));
        } catch (e) {
            console.warn(`[TableFilters] Failed to clear all filters:`, e);
        }
    };

    /**
     * Проверить есть ли сохранённые данные для сущности
     */
    const hasSavedFilters = () => {
        try {
            const prefix = `${STORAGE_PREFIX}${entity}-`;
            return Object.keys(localStorage).some(key => key.startsWith(prefix));
        } catch (e) {
            return false;
        }
    };

    /**
     * Проверить есть ли сохранённые данные для секции
     */
    const hasSectionFilters = (section) => {
        try {
            const prefix = `${STORAGE_PREFIX}${entity}-${section}-`;
            return Object.keys(localStorage).some(key => key.startsWith(prefix));
        } catch (e) {
            return false;
        }
    };

    /**
     * Получить все сохранённые ключи для сущности
     */
    const getSavedKeys = () => {
        try {
            const prefix = `${STORAGE_PREFIX}${entity}-`;
            return Object.keys(localStorage)
                .filter(key => key.startsWith(prefix))
                .map(key => key.replace(prefix, ''));
        } catch (e) {
            return [];
        }
    };

    return {
        saveFilter,
        restoreFilter,
        restoreBoolean,
        restoreNumber,
        restoreArray,
        clearFilter,
        clearSection,
        clearAllFilters,
        hasSavedFilters,
        hasSectionFilters,
        getSavedKeys
    };
}
