/**
 * ============================================================================
 * APP LOGGER — ЛОГИРОВАНИЕ ДЛЯ SMARTLIGHT
 * ============================================================================
 * 📁 Путь: utils/appLogger.js
 * ✅ Используется: Все сервисы, контроллеры, composables
 * ============================================================================
 */

/**
 * Логирование отладочной информации
 */
export const logDebug = (component, message, data = {}) => {
    const timestamp = new Date().toISOString();
    const logData = { timestamp, component, message, ...data };
    console.debug(`[DEBUG] ${component}: ${message}`, logData);
    return logData;
};

/**
 * Логирование ошибок приложения
 */
export const logError = (component, message, error) => {
    const timestamp = new Date().toISOString();
    const logData = {
        timestamp,
        component,
        message,
        error: error?.message || 'Unknown error',
        stack: error?.stack || ''
    };
    console.error(`[ERROR] ${component}: ${message}`, logData);
    return logData;
};

/**
 * Логирование информации
 */
export const logInfo = (component, message, data = {}) => {
    const timestamp = new Date().toISOString();
    const logData = { timestamp, component, message, ...data };
    console.info(`[INFO] ${component}: ${message}`, logData);
    return logData;
};

export default { logDebug, logError, logInfo };
