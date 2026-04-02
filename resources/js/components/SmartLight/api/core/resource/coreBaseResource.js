/**
 * ============================================================================
 * BASE RESOURCE — БАЗОВЫЙ API КЛИЕНТ С КОНТЕКСТОМ
 * ============================================================================
 * 📁 Путь: api/core/resource/coreBaseResource.js
 * ✅ Используется: Все Resources (Core, V0, V1, V2)
 * ✅ Контекст: Автоматическое логирование с версией API
 * ============================================================================
 */

import request from '@/utils/request.js';
import { coreApiContext } from '../utils/coreApiContext.js';
import { logRequest, logResponse, logRequestError, logError } from '../utils/coreApiLogger.js';
import { retry, delay } from '../utils/coreApiUtils.js';

export class CoreBaseResource {
    constructor(basePath, version = null) {
        this.basePath = basePath;
        this.version = version || coreApiContext.getVersion();
        this.context = coreApiContext;
        this.defaultTimeout = coreApiContext.getTimeout();
        this.maxRetries = coreApiContext.getRetryAttempts();
        this.retryDelay = coreApiContext.getRetryDelay();
    }

    /**
     * Построение URL с учетом версии
     */
    buildUrl(path = '') {
        const versionPrefix = this.version ? `/${this.version}` : '';
        if (!path) return `${this.basePath}${versionPrefix}`;
        return `${this.basePath}${versionPrefix}${path.startsWith('/') ? path : '/' + path}`;
    }

    /**
     * GET запрос с retry логикой
     */
    async get(path = '', params = {}) {
        const url = this.buildUrl(path);
        const requestId = logRequest(this.constructor.name, 'GET', url, params);
        const start = performance.now();

        try {
            const response = await retry(
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
            logResponse(this.constructor.name, requestId, response.status, duration);
            return response;
        } catch (error) {
            const duration = performance.now() - start;
            logRequestError(this.constructor.name, requestId, error, duration);
            throw error;
        }
    }

    /**
     * POST запрос с retry логикой
     */
    async post(path, data = {}) {
        const url = this.buildUrl(path);
        const requestId = logRequest(this.constructor.name, 'POST', url, data);
        const start = performance.now();

        try {
            const response = await retry(
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
            logResponse(this.constructor.name, requestId, response.status, duration);
            return response;
        } catch (error) {
            const duration = performance.now() - start;
            logRequestError(this.constructor.name, requestId, error, duration);
            throw error;
        }
    }

    /**
     * PUT запрос с retry логикой
     */
    async put(path, data = {}) {
        const url = this.buildUrl(path);
        const requestId = logRequest(this.constructor.name, 'PUT', url, data);
        const start = performance.now();

        try {
            const response = await retry(
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
            logResponse(this.constructor.name, requestId, response.status, duration);
            return response;
        } catch (error) {
            const duration = performance.now() - start;
            logRequestError(this.constructor.name, requestId, error, duration);
            throw error;
        }
    }

    /**
     * PATCH запрос с retry логикой
     */
    async patch(path, data = {}) {
        const url = this.buildUrl(path);
        const requestId = logRequest(this.constructor.name, 'PATCH', url, data);
        const start = performance.now();

        try {
            const response = await retry(
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
            logResponse(this.constructor.name, requestId, response.status, duration);
            return response;
        } catch (error) {
            const duration = performance.now() - start;
            logRequestError(this.constructor.name, requestId, error, duration);
            throw error;
        }
    }

    /**
     * DELETE запрос с retry логикой
     */
    async delete(path) {
        const url = this.buildUrl(path);
        const requestId = logRequest(this.constructor.name, 'DELETE', url);
        const start = performance.now();

        try {
            const response = await retry(
                () => request({
                    url,
                    method: 'delete',
                    timeout: this.defaultTimeout
                }),
                this.maxRetries,
                this.retryDelay
            );

            const duration = performance.now() - start;
            logResponse(this.constructor.name, requestId, response.status, duration);
            return response;
        } catch (error) {
            const duration = performance.now() - start;
            logRequestError(this.constructor.name, requestId, error, duration);
            throw error;
        }
    }

    /**
     * Получить версию API
     */
    getVersion() {
        return this.version;
    }

    /**
     * Установить версию API
     */
    setVersion(version) {
        this.version = version;
    }

    /**
     * Получить контекст
     */
    getContext() {
        return this.context;
    }

    /**
     * Установить timeout
     */
    setTimeout(timeout) {
        this.defaultTimeout = timeout;
    }

    /**
     * Установить количество retry попыток
     */
    setMaxRetries(retries) {
        this.maxRetries = retries;
    }

    /**
     * Установить задержку retry
     */
    setRetryDelay(delay) {
        this.retryDelay = delay;
    }
}

export default CoreBaseResource;
