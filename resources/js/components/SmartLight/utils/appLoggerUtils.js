/**
 * ============================================================================
 * APP LOGGER UTILS — ПРОСТОЙ ЛОГГЕР ДЛЯ ПРИЛОЖЕНИЯ (БЕЗ ЗАВИСИМОСТЕЙ)
 * ============================================================================
 * 📁 Путь: utils/appLoggerUtils.js
 * ✅ Используется: Все компоненты, сервисы, композиблы приложения
 * ✅ Назначение: Базовое логирование без зависимости от API-контекста
 * ✅ Рефакторинг: все функции имеют суффикс Utils, нет импорта coreApiContextUtils
 * ============================================================================
 */

// ✅ Внутренняя функция форматирования (с суффиксом Utils)
const formatMessageUtils = (level, component, message, data = null) => {
    const timestamp = new Date().toISOString();
    const dataStr = data ? `\n${JSON.stringify(data, null, 2)}` : '';
    return `${timestamp} [${level.toUpperCase()}] ${component}: ${message}${dataStr}`;
};

// ✅ Внутренняя функция вывода (с суффиксом Utils)
const logToConsoleUtils = (level, component, message, data = null) => {
    const formattedMessage = formatMessageUtils(level, component, message, data);

    switch (level) {
        case 'debug': console.debug(formattedMessage); break;
        case 'info': console.info(formattedMessage); break;
        case 'warn': console.warn(formattedMessage); break;
        case 'error': console.error(formattedMessage); break;
        default: console.log(formattedMessage);
    }
};

// ✅ Публичные функции логгера (с суффиксом Utils)

/**
 * Логирование отладочной информации
 */
export const logDebugUtils = (component, message, data = null) => {
    logToConsoleUtils('debug', component, message, data);
};

/**
 * Логирование информационной информации
 */
export const logInfoUtils = (component, message, data = null) => {
    logToConsoleUtils('info', component, message, data);
};

/**
 * Логирование предупреждений
 */
export const logWarnUtils = (component, message, data = null) => {
    logToConsoleUtils('warn', component, message, data);
};

/**
 * Логирование ошибок
 */
export const logErrorUtils = (component, message, error = null) => {
    const errorData = error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
        ...error
    } : null;
    logToConsoleUtils('error', component, message, errorData);
};

// ✅ Экспорт по умолчанию
export default {
    logDebugUtils,
    logInfoUtils,
    logWarnUtils,
    logErrorUtils
};
