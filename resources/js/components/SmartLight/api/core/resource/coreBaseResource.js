/**
 * ============================================================================
 * BASE RESOURCE — БАЗОВЫЙ API КЛИЕНТ С КОНТЕКСТОМ
 * ============================================================================
 * 📁 Путь: api/core/resource/coreBaseResource.js
 * ✅ Используется: Все Resources (Core, V0, V1, V2)
 * ✅ Контекст: Автоматическое логирование с версией API
 * ✅ Рефакторинг: методы с суффиксом Base(), импорты *Utils
 * ============================================================================
 */

import request from '@/utils/request.js';
import { coreApiContextUtils } from '../utils/coreApiContextUtils.js';
import {
    logRequestUtils,
    logResponseUtils,
    logRequestErrorUtils,
    logErrorUtils
} from '../utils/coreApiLoggerUtils.js';
import { retryUtils, delayUtils } from '../utils/coreApiUtils.js';

export class CoreBaseResource {
    constructor(basePath, version = null) {
        this.basePath = basePath;
        this.version = version || coreApiContextUtils.getVersion();
        this.context = coreApiContextUtils;
        this.defaultTimeout = coreApiContextUtils.getTimeout();
        this.maxRetries = coreApiContextUtils.getRetryAttempts();
        this.retryDelay = coreApiContextUtils.getRetryDelay();
    }

    /**
     * Построение URL с учетом версии (суффикс Base)
     */
    buildUrlBase(path = '') {
        const versionPrefix = this.version ? `/${this.version}` : '';
        if (!path) return `${this.basePath}${versionPrefix}`;
        return `${this.basePath}${versionPrefix}${path.startsWith('/') ? path : '/' + path}`;
    }

    /**
     * GET запрос с retryUtils логикой (суффикс Base)
     */
    async getBase(path = '', params = {}) {
        const url = this.buildUrlBase(path);
        const requestId = logRequestUtils(this.constructor.name, 'GET', url, params);
        const start = performance.now();

        try {
            const response = await retryUtils(
                () => request({
                    url,
                    method: 'get',
                    params,
                    timeout: this.defaultTimeout
                }),
                this.maxRetries,
                this.retryDelay
            );

            const duration = performance.now() - start;
            logResponseUtils(this.constructor.name, requestId, response.status, duration);
            return response;
        } catch (error) {
            const duration = performance.now() - start;
            logRequestErrorUtils(this.constructor.name, requestId, error, duration);
            throw error;
        }
    }

    /**
     * POST запрос с retryUtils логикой (суффикс Base)
     */
    async postBase(path, data = {}) {
        const url = this.buildUrlBase(path);
        const requestId = logRequestUtils(this.constructor.name, 'POST', url, data);
        const start = performance.now();

        try {
            const response = await retryUtils(
                () => request({
                    url,
                    method: 'post',
                    data,
                    timeout: this.defaultTimeout
                }),
                this.maxRetries,
                this.retryDelay
            );

            const duration = performance.now() - start;
            logResponseUtils(this.constructor.name, requestId, response.status, duration);
            return response;
        } catch (error) {
            const duration = performance.now() - start;
            logRequestErrorUtils(this.constructor.name, requestId, error, duration);
            throw error;
        }
    }

    /**
     * PUT запрос с retryUtils логикой (суффикс Base)
     */
    async putBase(path, data = {}) {
        const url = this.buildUrlBase(path);
        const requestId = logRequestUtils(this.constructor.name, 'PUT', url, data);
        const start = performance.now();

        try {
            const response = await retryUtils(
                () => request({
                    url,
                    method: 'put',
                    data,
                    timeout: this.defaultTimeout
                }),
                this.maxRetries,
                this.retryDelay
            );

            const duration = performance.now() - start;
            logResponseUtils(this.constructor.name, requestId, response.status, duration);
            return response;
        } catch (error) {
            const duration = performance.now() - start;
            logRequestErrorUtils(this.constructor.name, requestId, error, duration);
            throw error;
        }
    }

    /**
     * PATCH запрос с retryUtils логикой (суффикс Base)
     */
    async patchBase(path, data = {}) {
        const url = this.buildUrlBase(path);
        const requestId = logRequestUtils(this.constructor.name, 'PATCH', url, data);
        const start = performance.now();

        try {
            const response = await retryUtils(
                () => request({
                    url,
                    method: 'patch',
                    data,
                    timeout: this.defaultTimeout
                }),
                this.maxRetries,
                this.retryDelay
            );

            const duration = performance.now() - start;
            logResponseUtils(this.constructor.name, requestId, response.status, duration);
            return response;
        } catch (error) {
            const duration = performance.now() - start;
            logRequestErrorUtils(this.constructor.name, requestId, error, duration);
            throw error;
        }
    }

    /**
     * DELETE запрос с retryUtils логикой (суффикс Base)
     */
    async deleteBase(path) {
        const url = this.buildUrlBase(path);
        const requestId = logRequestUtils(this.constructor.name, 'DELETE', url);
        const start = performance.now();

        try {
            const response = await retryUtils(
                () => request({
                    url,
                    method: 'delete',
                    timeout: this.defaultTimeout
                }),
                this.maxRetries,
                this.retryDelay
            );

            const duration = performance.now() - start;
            logResponseUtils(this.constructor.name, requestId, response.status, duration);
            return response;
        } catch (error) {
            const duration = performance.now() - start;
            logRequestErrorUtils(this.constructor.name, requestId, error, duration);
            throw error;
        }
    }

    /**
     * Получить версию API (суффикс Base)
     */
    getVersionBase() {
        return this.version;
    }

    /**
     * Установить версию API (суффикс Base)
     */
    setVersionBase(version) {
        this.version = version;
    }

    /**
     * Получить контекст (суффикс Base)
     */
    getContextBase() {
        return this.context;
    }

    /**
     * Установить timeout (суффикс Base)
     */
    setTimeoutBase(timeout) {
        this.defaultTimeout = timeout;
    }

    /**
     * Установить количество retryUtils попыток (суффикс Base)
     */
    setMaxRetriesBase(retries) {
        this.maxRetries = retries;
    }

    /**
     * Установить задержку retryUtils (суффикс Base)
     */
    setRetryDelayBase(delay) {
        this.retryDelay = delay;
    }
}

export default CoreBaseResource;
