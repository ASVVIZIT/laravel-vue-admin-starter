/**
 * ============================================================================
 * API UTILS — ОБЩИЕ УТИЛИТЫ API
 * ============================================================================
 * 📁 Путь: api/core/utils/coreApiUtils.js
 * ✅ Используется: Все API ресурсы, Services, Controllers
 * ✅ Интеграция: coreApiContext, coreApiLogger
 * ============================================================================
 */

import { coreApiContext } from './coreApiContext.js';
import { logDebug, logInfo, logWarn, logError } from './coreApiLogger.js';

/**
 * ============================================================================
 * ApiUtils — КЛАСС ДЛЯ РАБОТЫ С API
 * ============================================================================
 */
export class ApiUtils {
    /**
     * Логирование запроса
     */
    static logApiRequest(method, url, data = null) {
        const requestId = coreApiContext.getNextRequestId();
        const prefix = coreApiContext.getLogPrefix();

        if (coreApiContext.shouldLog('debug')) {
            console.log(`${prefix} [REQUEST] ${method} ${url}`, {
                requestId,
                timestamp: new Date().toISOString(),
                data
            });
        }

        return requestId;
    }

    /**
     * Логирование ответа
     */
    static logApiResponse(method, url, response, requestId = null) {
        const prefix = coreApiContext.getLogPrefix();

        if (coreApiContext.shouldLog('debug')) {
            console.log(`${prefix} [RESPONSE] ${method} ${url}`, {
                requestId,
                timestamp: new Date().toISOString(),
                status: response.status,
                data: response.data
            });
        }
    }

    /**
     * Логирование ошибки
     */
    static logApiError(method, url, error, requestId = null) {
        const prefix = coreApiContext.getLogPrefix();

        console.error(`${prefix} [ERROR] ${method} ${url}`, {
            requestId,
            timestamp: new Date().toISOString(),
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
    }

    /**
     * Проверка debug режима
     */
    static isDebugMode() {
        return coreApiContext.isDebug();
    }

    /**
     * Задержка выполнения
     */
    static async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Получить фейковый ответ (для демо/тестов)
     */
    static getFakeResponse(success = true, message = 'OK', data = {}) {
        return {
            success,
            message,
            data,
            timestamp: new Date().toISOString(),
            isFake: true
        };
    }

    /**
     * Обработка ошибок API
     */
    static handleApiError(error, context = 'ApiUtils') {
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || error.message || 'Неизвестная ошибка';

        logError(context, 'API Error', {
            status,
            message,
            url: error.config?.url,
            method: error.config?.method
        });

        return {
            success: false,
            message,
            status,
            error: error.response?.data || error
        };
    }

    /**
     * Retry с экспоненциальной задержкой
     */
    static async retry(fn, maxRetries = 3, delayMs = 1000) {
        let lastError;

        for (let i = 0; i < maxRetries; i++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;
                const exponentialDelay = delayMs * Math.pow(2, i);
                logWarn('ApiUtils', `Attempt ${i + 1}/${maxRetries} failed, retrying in ${exponentialDelay}ms`);
                await this.delay(exponentialDelay);
            }
        }

        throw lastError;
    }

    /**
     * Получить timeout из контекста
     */
    static getTimeout() {
        return coreApiContext.getTimeout();
    }

    /**
     * Получить количество retry попыток
     */
    static getRetryAttempts() {
        return coreApiContext.getRetryAttempts();
    }

    /**
     * Получить задержку retry
     */
    static getRetryDelay() {
        return coreApiContext.getRetryDelay();
    }

    /**
     * Проверка онлайн статуса
     */
    static isOnline() {
        return typeof navigator !== 'undefined' ? navigator.onLine : true;
    }

    /**
     * Валидация ответа API
     */
    static validateResponse(response) {
        if (!response) {
            return { valid: false, error: 'Пустой ответ' };
        }
        if (response.success === false) {
            return { valid: false, error: response.message || 'Ошибка API' };
        }
        return { valid: true };
    }

    /**
     * Форматирование даты
     */
    static formatDate(date, locale = 'ru-RU') {
        return new Date(date).toLocaleString(locale);
    }

    /**
     * Форматирование timestamps
     */
    static formatTimestamp(timestamp) {
        return new Date(timestamp).toISOString();
    }

    /**
     * Генерация UUID
     */
    static generateUUID() {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Проверка на пустой объект
     */
    static isEmpty(obj) {
        return obj === null || obj === undefined || (typeof obj === 'object' && Object.keys(obj).length === 0);
    }

    /**
     * Проверка на пустую строку
     */
    static isEmptyString(str) {
        return str === null || str === undefined || str.trim() === '';
    }

    /**
     * Глубокое слияние объектов
     */
    static deepMerge(target, source) {
        const output = Object.assign({}, target);
        if (typeof target === 'object' && typeof source === 'object') {
            Object.keys(source).forEach(key => {
                if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                    output[key] = this.deepMerge(output[key], source[key]);
                } else {
                    output[key] = source[key];
                }
            });
        }
        return output;
    }
}

/**
 * ============================================================================
 * STANDALONE FUNCTIONS — ДЛЯ ОБРАТНОЙ СОВМЕСТИМОСТИ
 * ============================================================================
 */
export const isEmpty = (obj) => ApiUtils.isEmpty(obj);
export const isEmptyString = (str) => ApiUtils.isEmptyString(str);
export const deepMerge = (target, source) => ApiUtils.deepMerge(target, source);
export const delay = (ms) => ApiUtils.delay(ms);
export const retry = (fn, maxRetries = 3, delayMs = 1000) => ApiUtils.retry(fn, maxRetries, delayMs);
export const formatDate = (date, locale = 'ru-RU') => ApiUtils.formatDate(date, locale);
export const formatTimestamp = (timestamp) => ApiUtils.formatTimestamp(timestamp);
export const generateUUID = () => ApiUtils.generateUUID();
export const isOnline = () => ApiUtils.isOnline();

/**
 * ============================================================================
 * DEFAULT EXPORT
 * ============================================================================
 */
export default ApiUtils;
