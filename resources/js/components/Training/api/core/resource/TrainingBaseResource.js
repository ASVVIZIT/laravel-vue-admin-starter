/**
 * ============================================================================
 * TRAINING BASE RESOURCE — БАЗОВЫЙ API КЛИЕНТ МОДУЛЯ TRAINING
 * ============================================================================
 * 📁 Путь: @/components/Training/api/core/resource/TrainingBaseResource.js
 * ✅ Методы: getBase/postBase/putBase/deleteBase/getBlobBase
 * ✅ Контракт: Возвращает только data (сторы не ломаются)
 * ============================================================================
 */

import request from '@/utils/request.js'
import { logRequestUtils, logResponseUtils, logRequestErrorUtils } from '../utils/coreApiLoggerUtils.js'
import { retryUtils } from '../utils/coreApiUtils.js'

const LOCAL_META_MODE = { BEFORE: 0, AFTER: 1 }

export class TrainingBaseResource {
    constructor(basePath = '/training') {
        this.basePath = basePath
        this.defaultTimeout = 30000
        this.maxRetries = 2
        this.retryDelay = 500
        this.USE_META_MODE = true
    }

    buildUrlBase(path = '') {
        if (!path) return this.basePath
        return `${this.basePath}${path.startsWith('/') ? path : '/' + path}`
    }

    async _executeRequest(method, path, config = {}) {
        const url = this.buildUrlBase(path)
        const hasMetaSupport = typeof window?.__REQUEST_META_ENABLED !== 'undefined'
            ? window.__REQUEST_META_ENABLED
            : false
        const useMeta = this.USE_META_MODE && hasMetaSupport

        const requestId = logRequestUtils(this.constructor.name, method, url, config.data || config.params)
        const start = performance.now()

        try {
            let requestConfig = { url, method, timeout: this.defaultTimeout, ...config }
            if (useMeta) {
                requestConfig.__metaMode = LOCAL_META_MODE.AFTER
            }

            const response = await retryUtils(
                () => request(requestConfig),
                this.maxRetries,
                this.retryDelay
            )

            let responseData, responseStatus = 200

            if (useMeta && response && typeof response === 'object' && 'status' in response && 'data' in response) {
                responseData = response.data
                responseStatus = response.status
            } else {
                responseData = response
            }

            logResponseUtils(this.constructor.name, requestId, responseStatus, performance.now() - start, {
                hasData: !!responseData,
                dataType: Array.isArray(responseData) ? 'array' : typeof responseData
            })

            return responseData

        } catch (error) {
            logRequestErrorUtils(this.constructor.name, requestId, error, performance.now() - start)
            throw error
        }
    }

    async getBase(path = '', params = {}) {
        return this._executeRequest('get', path, { params })
    }

    async postBase(path, data = {}) {
        return this._executeRequest('post', path, { data })
    }

    async putBase(path, data = {}) {
        return this._executeRequest('put', path, { data })
    }

    async deleteBase(path, params = {}) {
        return this._executeRequest('delete', path, { params })
    }

    /**
     * 🔹 Загрузка файла (blob) с доступом к заголовкам
     * Используется для экспорта CSV, PDF и других файловых операций
     *
     * request.js автоматически возвращает { blob, headers, status, statusText }
     * для всех запросов с responseType: 'blob'
     */
    async getBlobBase(path = '', params = {}, headers = {}) {
        const url = this.buildUrlBase(path)
        const requestId = logRequestUtils(this.constructor.name, 'getBlob', url, params)
        const start = performance.now()

        try {
            const result = await retryUtils(
                () => request({
                    url,
                    method: 'get',
                    params,
                    responseType: 'blob',
                    headers: {
                        'Accept': 'application/octet-stream, text/csv, application/pdf',
                        ...headers
                    },
                    timeout: this.defaultTimeout * 2
                }),
                this.maxRetries,
                this.retryDelay
            )

            logResponseUtils(this.constructor.name, requestId, result.status || 200, performance.now() - start, {
                type: 'blob',
                size: result.blob?.size
            })

            return result

        } catch (error) {
            logRequestErrorUtils(this.constructor.name, requestId, error, performance.now() - start)
            throw error
        }
    }
}

export default TrainingBaseResource
