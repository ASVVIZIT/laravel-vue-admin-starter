/**
 * ============================================================================
 * TRAINING BASE RESOURCE — БАЗОВЫЙ API КЛИЕНТ МОДУЛЯ TRAINING
 * ============================================================================
 * 📁 Путь: @/components/Training/api/core/resource/TrainingBaseResource.js
 * ✅ Методы: getBase/postBase/putBase/deleteBase (совместимость с дочерними классами)
 * ✅ Статусы: Опционально, через безопасную проверку (не ломает, если нет в request.js)
 * ✅ Контракт: Возвращает только data (сторы не ломаются)
 * ============================================================================
 */

import request from '@/utils/request.js'
import { logRequestUtils, logResponseUtils, logRequestErrorUtils } from '../utils/coreApiLoggerUtils.js'
import { retryUtils } from '../utils/coreApiUtils.js'

// Локальные константы (без импорта из request.js — защита от несуществующих экспортов)
const LOCAL_META_MODE = { BEFORE: 0, AFTER: 1 }

export class TrainingBaseResource {
    constructor(basePath = '/training') {
        this.basePath = basePath
        this.defaultTimeout = 30000
        this.maxRetries = 2
        this.retryDelay = 500

        // 🎛️ ПЕРЕКЛЮЧАТЕЛЬ МЕТА-РЕЖИМА
        // Включаем, только если в request.js есть поддержка (проверка ниже)
        this.USE_META_MODE = true
    }

    buildUrlBase(path = '') {
        if (!path) return this.basePath
        return `${this.basePath}${path.startsWith('/') ? path : '/' + path}`
    }

    /**
     * 🔹 Ядро: Выполнение запроса с авто-определением формата ответа
     */
    async _executeRequest(method, path, config = {}) {
        const url = this.buildUrlBase(path)

        // 🔍 Безопасная проверка: есть ли поддержка мета-режима в request.js?
        // Проверяем, экспортировал ли request.js функцию createMetaRequest
        const hasMetaSupport = typeof window?.__REQUEST_META_ENABLED !== 'undefined'
            ? window.__REQUEST_META_ENABLED
            : false

        const useMeta = this.USE_META_MODE && hasMetaSupport

        const requestId = logRequestUtils(this.constructor.name, method, url, config.data || config.params)
        const start = performance.now()

        try {
            let requestConfig = { url, method, timeout: this.defaultTimeout, ...config }

            // Если мета-режим включён и поддерживается — добавляем флаг
            if (useMeta) {
                requestConfig.__metaMode = LOCAL_META_MODE.AFTER
            }

            const response = await retryUtils(
                () => request(requestConfig),
                this.maxRetries,
                this.retryDelay
            )

            // 🔍 Определяем формат ответа
            let responseData, responseStatus = 200

            // Если ответ — объект с полем status, значит request.js вернул мета-данные
            if (useMeta && response && typeof response === 'object' && 'status' in response && 'data' in response) {
                responseData = response.data
                responseStatus = response.status
            } else {
                // Старый формат: response = data
                responseData = response
            }

            logResponseUtils(this.constructor.name, requestId, responseStatus, performance.now() - start, {
                hasData: !!responseData,
                dataType: Array.isArray(responseData) ? 'array' : typeof responseData
            })

            // Возвращаем в стор только данные (контракт не нарушен)
            return responseData

        } catch (error) {
            logRequestErrorUtils(this.constructor.name, requestId, error, performance.now() - start)
            throw error
        }
    }

    // ========================================================================
    // ПУБЛИЧНЫЕ МЕТОДЫ (имена должны совпадать с вызовами в дочерних классах!)
    // ========================================================================
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
}

export default TrainingBaseResource
