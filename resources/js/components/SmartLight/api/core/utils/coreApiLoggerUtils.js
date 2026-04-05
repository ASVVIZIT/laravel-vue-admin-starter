/**
 * ============================================================================
 * API LOGGER — ЛОГГЕР С КОНТЕКСТОМ ВЕРСИИ
 * ============================================================================
 * 📁 Путь: api/core/utils/coreApiLogger.js
 * ✅ Используется: Все API ресурсы для логирования
 * ✅ Контекст: Автоматически добавляет версию API к логам
 * ============================================================================
 */

import { coreApiContext } from './coreApiContext.js';

const formatMessage = (level, component, message, data = null) => {
    const timestamp = new Date().toISOString();
    const prefix = coreApiContext.getLogPrefix();
    const dataStr = data ? `\n${JSON.stringify(data, null, 2)}` : '';
    return `${timestamp} ${prefix} [${level.toUpperCase()}] ${component}: ${message}${dataStr}`;
};

const logToConsole = (level, component, message, data = null) => {
    if (!coreApiContext.shouldLog(level)) return;
    const formattedMessage = formatMessage(level, component, message, data);

    switch (level) {
        case 'debug': console.debug(formattedMessage); break;
        case 'info': console.info(formattedMessage); break;
        case 'warn': console.warn(formattedMessage); break;
        case 'error': console.error(formattedMessage); break;
        default: console.log(formattedMessage);
    }
};

// Публичные функции логгера
export const logDebug = (component, message, data = null) => {
    logToConsole('debug', component, message, data);
};

export const logInfo = (component, message, data = null) => {
    logToConsole('info', component, message, data);
};

export const logWarn = (component, message, data = null) => {
    logToConsole('warn', component, message, data);
};

export const logError = (component, message, error = null) => {
    const errorData = error ? { message: error.message, stack: error.stack, name: error.name, ...error } : null;
    logToConsole('error', component, message, errorData);
};

// Логгер для запросов (с ID)
export const logRequest = (component, method, url, data = null) => {
    const requestId = coreApiContext.getNextRequestId();
    logDebug(component, `${method} ${url}`, { requestId, version: coreApiContext.getVersion(), data });
    return requestId;
};

// Логгер для ответов (с ID)
export const logResponse = (component, requestId, status, duration, data = null) => {
    logDebug(component, `Response: ${status} (${duration}ms)`, {
        requestId, version: coreApiContext.getVersion(), status, duration, data
    });
};

// Логгер для ошибок запросов
export const logRequestError = (component, requestId, error, duration) => {
    logError(component, `Request failed: ${error.message}`, {
        requestId, version: coreApiContext.getVersion(), duration,
        error: { message: error.message, code: error.code, status: error.status }
    });
};

export const setLogLevel = (level) => {
    coreApiContext.updateConfig({ logLevel: level });
    logInfo('coreApiLogger', `Log level set to: ${level}`);
};

export const getLogLevel = () => coreApiContext.getConfig().logLevel;

export const enableDebug = () => {
    coreApiContext.updateConfig({ debug: true, logLevel: 'debug' });
    logInfo('coreApiLogger', 'Debug mode enabled');
};

export const disableDebug = () => {
    coreApiContext.updateConfig({ debug: false, logLevel: 'info' });
    logInfo('coreApiLogger', 'Debug mode disabled');
};

export default {
    logDebug, logInfo, logWarn, logError, logRequest, logResponse, logRequestError,
    setLogLevel, getLogLevel, enableDebug, disableDebug,
    getContext: () => coreApiContext
};
