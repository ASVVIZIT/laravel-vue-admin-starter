/**
 * ============================================================================
 * API LOGGER UTILS — ЛОГГЕР С КОНТЕКСТОМ ВЕРСИИ (УТИЛИТЫ)
 * ============================================================================
 * 📁 Путь: api/core/utils/coreApiLoggerUtils.js
 * ✅ Используется: Все API ресурсы для логирования
 * ✅ Контекст: Автоматически добавляет версию API к логам
 * ✅ Рефакторинг: все функции имеют суффикс Utils
 * ============================================================================
 */

import { coreApiContextUtils } from './coreApiContextUtils.js';

const formatMessageUtils = (level, component, message, data = null) => {
    const timestamp = new Date().toISOString();
    const prefix = coreApiContextUtils.getLogPrefix();
    const dataStr = data ? `\n${JSON.stringify(data, null, 2)}` : '';
    return `${timestamp} ${prefix} [${level.toUpperCase()}] ${component}: ${message}${dataStr}`;
};

const logToConsoleUtils = (level, component, message, data = null) => {
    if (!coreApiContextUtils.shouldLog(level)) return;
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
export const logDebugUtils = (component, message, data = null) => {
    logToConsoleUtils('debug', component, message, data);
};

export const logInfoUtils = (component, message, data = null) => {
    logToConsoleUtils('info', component, message, data);
};

export const logWarnUtils = (component, message, data = null) => {
    logToConsoleUtils('warn', component, message, data);
};

export const logErrorUtils = (component, message, error = null) => {
    const errorData = error ? { message: error.message, stack: error.stack, name: error.name, ...error } : null;
    logToConsoleUtils('error', component, message, errorData);
};

// ✅ Логгер для запросов (с суффиксом Utils)
export const logRequestUtils = (component, method, url, data = null) => {
    const requestId = coreApiContextUtils.getNextRequestId();
    logDebugUtils(component, `${method} ${url}`, { requestId, version: coreApiContextUtils.getVersion(), data });
    return requestId;
};

// ✅ Логгер для ответов (с суффиксом Utils)
export const logResponseUtils = (component, requestId, status, duration, data = null) => {
    logDebugUtils(component, `Response: ${status} (${duration}ms)`, {
        requestId, version: coreApiContextUtils.getVersion(), status, duration, data
    });
};

// ✅ Логгер для ошибок запросов (с суффиксом Utils)
export const logRequestErrorUtils = (component, requestId, error, duration) => {
    logErrorUtils(component, `Request failed: ${error.message}`, {
        requestId, version: coreApiContextUtils.getVersion(), duration,
        error: { message: error.message, code: error.code, status: error.status }
    });
};

// ✅ Управление уровнем логирования (с суффиксом Utils)
export const setLogLevelUtils = (level) => {
    coreApiContextUtils.updateConfig({ logLevel: level });
    logInfoUtils('coreApiLoggerUtils', `Log level set to: ${level}`);
};

export const getLogLevelUtils = () => coreApiContextUtils.getConfig().logLevel;

export const enableDebugUtils = () => {
    coreApiContextUtils.updateConfig({ debug: true, logLevel: 'debug' });
    logInfoUtils('coreApiLoggerUtils', 'Debug mode enabled');
};

export const disableDebugUtils = () => {
    coreApiContextUtils.updateConfig({ debug: false, logLevel: 'info' });
    logInfoUtils('coreApiLoggerUtils', 'Debug mode disabled');
};

// ✅ Экспорт по умолчанию
export default {
    logDebugUtils,
    logInfoUtils,
    logWarnUtils,
    logErrorUtils,
    logRequestUtils,
    logResponseUtils,
    logRequestErrorUtils,
    setLogLevelUtils,
    getLogLevelUtils,
    enableDebugUtils,
    disableDebugUtils,
    getContextUtils: () => coreApiContextUtils
};
