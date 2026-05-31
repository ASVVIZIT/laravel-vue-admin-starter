/**
 * ============================================================================
 * API UTILS — ОБЩИЕ УТИЛИТЫ API
 * ============================================================================
 * 📁 Путь: api/core/utils/coreApiUtils.js
 * ✅ Используется: Все API ресурсы, Services, Controllers
 * ✅ Интеграция: coreApiContextUtils, coreApiLoggerUtils
 * ✅ Рефакторинг: все вызовы логгера используют суффикс Utils
 * ============================================================================
 */

import { coreApiContextUtils } from './coreApiContextUtils.js';
import {
    logDebugUtils,
    logInfoUtils,
    logWarnUtils,
    logErrorUtils,
    logRequestUtils,
    logResponseUtils,
    logRequestErrorUtils
} from './coreApiLoggerUtils.js';

export class CoreApiUtils {
    static logApiRequestUtils(method, url, data = null) {
        const requestId = logRequestUtils('CoreApiUtils', method, url, data);
        return requestId;
    }

    static logApiResponseUtils(method, url, response, requestId = null) {
        if (coreApiContextUtils.shouldLog('debug')) {
            logResponseUtils('CoreApiUtils', requestId, response.status, 0, { data: response.data });
        }
    }

    static logApiErrorUtils(method, url, error, requestId = null) {
        logRequestErrorUtils('CoreApiUtils', requestId, error, 0);
    }

    static isDebugModeUtils() { return coreApiContextUtils.isDebug(); }

    static async delayUtils(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

    static getFakeResponseUtils(success = true, message = 'OK', data = {}) {
        return { success, message, data, timestamp: new Date().toISOString(), isFake: true };
    }

    static handleApiErrorUtils(error, context = 'CoreApiUtils') {
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || error.message || 'Неизвестная ошибка';
        logErrorUtils(context, 'API Error', { status, message, url: error.config?.url, method: error.config?.method });
        return { success: false, message, status, error: error.response?.data || error };
    }

    static async retryUtils(fn, maxRetries = 3, delayMs = 1000) {
        let lastError;
        for (let i = 0; i < maxRetries; i++) {
            try { return await fn(); }
            catch (error) {
                lastError = error;
                const exponentialDelay = delayMs * Math.pow(2, i);
                logWarnUtils('CoreApiUtils', `Attempt ${i + 1}/${maxRetries} failed, retrying in ${exponentialDelay}ms`);
                await this.delayUtils(exponentialDelay);
            }
        }
        throw lastError;
    }

    static getTimeoutUtils() { return coreApiContextUtils.getTimeout(); }
    static getRetryAttemptsUtils() { return coreApiContextUtils.getRetryAttempts(); }
    static getRetryDelayUtils() { return coreApiContextUtils.getRetryDelay(); }
    static isOnlineUtils() { return typeof navigator !== 'undefined' ? navigator.onLine : true; }

    static validateResponseUtils(response) {
        if (!response) return { valid: false, error: 'Пустой ответ' };
        if (response.success === false) return { valid: false, error: response.message || 'Ошибка API' };
        return { valid: true };
    }

    static formatDateUtils(date, locale = 'ru-RU') { return new Date(date).toLocaleString(locale); }
    static formatTimestampUtils(timestamp) { return new Date(timestamp).toISOString(); }

    static generateUUIDUtils() {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    static isEmptyUtils(obj) { return obj === null || obj === undefined || (typeof obj === 'object' && Object.keys(obj).length === 0); }
    static isEmptyStringUtils(str) { return str === null || str === undefined || str.trim() === ''; }

    static deepMergeUtils(target, source) {
        const output = Object.assign({}, target);
        if (typeof target === 'object' && typeof source === 'object') {
            Object.keys(source).forEach(key => {
                if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                    output[key] = this.deepMergeUtils(output[key], source[key]);
                } else {
                    output[key] = source[key];
                }
            });
        }
        return output;
    }
}

// ✅ Standalone Functions (с суффиксом Utils)
export const isEmptyUtils = (obj) => CoreApiUtils.isEmptyUtils(obj);
export const isEmptyStringUtils = (str) => CoreApiUtils.isEmptyStringUtils(str);
export const deepMergeUtils = (target, source) => CoreApiUtils.deepMergeUtils(target, source);
export const delayUtils = (ms) => CoreApiUtils.delayUtils(ms);
export const retryUtils = (fn, maxRetries = 3, delayMs = 1000) => CoreApiUtils.retryUtils(fn, maxRetries, delayMs);
export const formatDateUtils = (date, locale = 'ru-RU') => CoreApiUtils.formatDateUtils(date, locale);
export const formatTimestampUtils = (timestamp) => CoreApiUtils.formatTimestampUtils(timestamp);
export const generateUUIDUtils = () => CoreApiUtils.generateUUIDUtils();
export const isOnlineUtils = () => CoreApiUtils.isOnlineUtils();

export default CoreApiUtils;
