/**
 * ============================================================================
 * TRAINING BASE RESOURCE — БАЗОВЫЙ API КЛИЕНТ МОДУЛЯ TRAINING
 * ============================================================================
 * 📁 Путь: @/components/Training/api/core/resource/TrainingBaseResource.js
 * ✅ Контекст: Базовый URL `/training`, логирование, retry
 * ✅ Совместимость: `request.js` (уже возвращает `response.data`)
 * ============================================================================
 */

import request from '@/utils/request.js'
// ✅ Исправленный импорт: coreApi*Utils вместо api*Utils
import { logRequestUtils, logResponseUtils, logRequestErrorUtils } from '../utils/coreApiLoggerUtils.js'
import { retryUtils } from '../utils/coreApiUtils.js'

export class TrainingBaseResource {
    constructor(basePath = '/training') {
        this.basePath = basePath
        this.defaultTimeout = 30000
        this.maxRetries = 2
        this.retryDelay = 500
    }

    buildUrlBase(path = '') {
        if (!path) return this.basePath
        return `${this.basePath}${path.startsWith('/') ? path : '/' + path}`
    }

    async getBase(path = '', params = {}) {
        const url = this.buildUrlBase(path)
        const requestId = logRequestUtils(this.constructor.name, 'GET', url, params)
        const start = performance.now()

        try {
            const data = await retryUtils(
                () => request({ url, method: 'get', params, timeout: this.defaultTimeout }),
                this.maxRetries,
                this.retryDelay
            )
            logResponseUtils(this.constructor.name, requestId, 200, performance.now() - start)
            return data
        } catch (error) {
            logRequestErrorUtils(this.constructor.name, requestId, error, performance.now() - start)
            throw error
        }
    }

    async postBase(path, data = {}) {
        const url = this.buildUrlBase(path)
        const requestId = logRequestUtils(this.constructor.name, 'POST', url, data)
        const start = performance.now()

        try {
            const response = await retryUtils(
                () => request({ url, method: 'post', data, timeout: this.defaultTimeout }),
                this.maxRetries,
                this.retryDelay
            )
            logResponseUtils(this.constructor.name, requestId, response?.status || 201, performance.now() - start)
            return response
        } catch (error) {
            logRequestErrorUtils(this.constructor.name, requestId, error, performance.now() - start)
            throw error
        }
    }

    async putBase(path, data = {}) {
        const url = this.buildUrlBase(path)
        const requestId = logRequestUtils(this.constructor.name, 'PUT', url, data)
        const start = performance.now()

        try {
            const response = await retryUtils(
                () => request({ url, method: 'put', data, timeout: this.defaultTimeout }),
                this.maxRetries,
                this.retryDelay
            )
            logResponseUtils(this.constructor.name, requestId, response?.status || 200, performance.now() - start)
            return response
        } catch (error) {
            logRequestErrorUtils(this.constructor.name, requestId, error, performance.now() - start)
            throw error
        }
    }

    async deleteBase(path, params = {}) {
        const url = this.buildUrlBase(path)
        const requestId = logRequestUtils(this.constructor.name, 'DELETE', url, params)
        const start = performance.now()

        try {
            const response = await retryUtils(
                () => request({ url, method: 'delete', params, timeout: this.defaultTimeout }),
                this.maxRetries,
                this.retryDelay
            )
            logResponseUtils(this.constructor.name, requestId, response?.status || 200, performance.now() - start)
            return response
        } catch (error) {
            logRequestErrorUtils(this.constructor.name, requestId, error, performance.now() - start)
            throw error
        }
    }
}

export default TrainingBaseResource
