/**
 * ============================================================================
 * USE I18N SEARCH PERSISTENCE — СОХРАНЕНИЕ ПОИСКОВЫХ ЗАПРОСОВ
 * ============================================================================
 *
 * 📁 Файл: useI18nSearchPersistence.js
 * 📝 Описание: Composable для сохранения поисковых запросов в localStorage
 * 🔗 Используется во всех режимах: Simple, Scanner, Validator
 *
 * ============================================================================
 * КЛЮЧИ ХРАНЕНИЯ
 * ============================================================================
 *
 * Формат: i18n-search-{mode}-{section}-{field}
 *
 * Validator:
 *   i18n-search-validator-duplicates-query
 *   i18n-search-validator-duplicates-inPaths
 *   i18n-search-validator-wrongPaths-query
 *   i18n-search-validator-wrongPaths-inPaths
 *   i18n-search-validator-flatKeys-query
 *
 * Scanner:
 *   i18n-search-scanner-missing-query
 *   i18n-search-scanner-missing-inFiles
 *   i18n-search-scanner-missing-fileFilter
 *   i18n-search-scanner-unused-query
 *
 * Simple:
 *   i18n-search-simple-filters-lang
 *   i18n-search-simple-filters-category
 *   i18n-search-simple-filters-status
 *   i18n-search-simple-query-value
 *
 * ============================================================================
 */

const STORAGE_PREFIX = 'i18n-search-';
const DEBOUNCE_MS = 300;

// Debounce таймеры
const debounceTimers = new Map();

/**
 * Безопасная запись в localStorage с debounce
 */
function safeSetItem(key, value) {
    try {
        if (debounceTimers.has(key)) {
            clearTimeout(debounceTimers.get(key));
        }

        const timer = setTimeout(() => {
            try {
                if (value === '' || value === null || value === undefined) {
                    localStorage.removeItem(key);
                } else {
                    localStorage.setItem(key, String(value));
                }
            } catch (e) {
                // localStorage недоступен (private mode или переполнен)
            }
            debounceTimers.delete(key);
        }, DEBOUNCE_MS);

        debounceTimers.set(key, timer);
    } catch (e) {
        // Игнорируем ошибки
    }
}

/**
 * Безопасное чтение из localStorage
 */
function safeGetItem(key, defaultValue = '') {
    try {
        const value = localStorage.getItem(key);
        return value !== null ? value : defaultValue;
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
        // Игнорируем ошибки
    }
}

/**
 * Composable для работы с сохранением поисковых запросов
 */
export function useI18nSearchPersistence() {
    /**
     * Сохранить значение поиска
     * @param {string} mode - Режим (validator, scanner, simple)
     * @param {string} section - Секция (duplicates, missing, и т.д.)
     * @param {string} field - Поле (query, inPaths, inFiles, и т.д.)
     * @param {*} value - Значение для сохранения
     */
    const saveSearch = (mode, section, field, value) => {
        const key = `${STORAGE_PREFIX}${mode}-${section}-${field}`;
        safeSetItem(key, value);
    };

    /**
     * Восстановить значение поиска
     * @param {string} mode - Режим
     * @param {string} section - Секция
     * @param {string} field - Поле
     * @param {*} defaultValue - Значение по умолчанию
     * @returns {*} Восстановленное значение
     */
    const restoreSearch = (mode, section, field, defaultValue = '') => {
        const key = `${STORAGE_PREFIX}${mode}-${section}-${field}`;
        return safeGetItem(key, defaultValue);
    };

    /**
     * Восстановить boolean значение
     */
    const restoreBoolean = (mode, section, field, defaultValue = false) => {
        const key = `${STORAGE_PREFIX}${mode}-${section}-${field}`;
        const value = safeGetItem(key, null);
        if (value === null) return defaultValue;
        return value === 'true';
    };

    /**
     * Очистить конкретный поиск
     */
    const clearSearch = (mode, section, field) => {
        const key = `${STORAGE_PREFIX}${mode}-${section}-${field}`;
        safeRemoveItem(key);
    };

    /**
     * Очистить все сохранения для режима
     */
    const clearModeSearches = (mode) => {
        try {
            const prefix = `${STORAGE_PREFIX}${mode}-`;
            Object.keys(localStorage)
                .filter(key => key.startsWith(prefix))
                .forEach(key => safeRemoveItem(key));
        } catch (e) {
            // Игнорируем ошибки
        }
    };

    /**
     * Очистить ВСЕ сохранения поисков
     */
    const clearAllSearches = () => {
        try {
            Object.keys(localStorage)
                .filter(key => key.startsWith(STORAGE_PREFIX))
                .forEach(key => safeRemoveItem(key));
        } catch (e) {
            // Игнорируем ошибки
        }
    };

    /**
     * Проверить есть ли сохранённые данные для режима
     */
    const hasModeSearches = (mode) => {
        try {
            const prefix = `${STORAGE_PREFIX}${mode}-`;
            return Object.keys(localStorage).some(key => key.startsWith(prefix));
        } catch (e) {
            return false;
        }
    };

    return {
        saveSearch,
        restoreSearch,
        restoreBoolean,
        clearSearch,
        clearModeSearches,
        clearAllSearches,
        hasModeSearches
    };
}
