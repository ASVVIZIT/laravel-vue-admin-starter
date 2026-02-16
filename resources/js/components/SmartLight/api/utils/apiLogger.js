/**
 * Универсальное логирование для всего модуля
 */

/**
 * Логирование отладочной информации
 * @param {string} component - Название компонента
 * @param {string} message - Сообщение
 * @param {Object} data - Дополнительные данные
 */
export const logDebug = (component, message, data = {}) => {
    const timestamp = new Date().toISOString();
    const logData = {
        timestamp,
        component,
        message,
        ...data
    };

    console.debug(`[DEBUG] SmartLight: ${component} - ${message}`, logData);
    return logData;
};

/**
 * Логирование ошибок
 * @param {string} component - Название компонента
 * @param {string} message - Сообщение
 * @param {Error} error - Объект ошибки
 */
export const logError = (component, message, error) => {
    const timestamp = new Date().toISOString();
    const logData = {
        timestamp,
        component,
        message,
        error: error.message,
        stack: error.stack,
        config: error.config
    };

    console.error(`[ERROR] SmartLight: ${component} - ${message}`, logData);
    return logData;
};
