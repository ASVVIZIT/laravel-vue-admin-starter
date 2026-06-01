/**
 * ============================================================================
 * TRAINING BASE RESOURCE — БАЗОВЫЙ API КЛИЕНТ МОДУЛЯ TRAINING
 * ============================================================================
 * 📁 Путь: @/components/Training/api/core/resource/TrainingBaseResource.js
 * ✅ Контекст: Базовый URL `/training`, логирование, retry
 * ✅ Совместимость: `request.js` (возвращает распакованные данные)
 * ✅ Исправлено: корректная работа с распакованным ответом
 * ============================================================================
 */

import request from '@/utils/request.js'
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

    // 🔹 Вспомогательный метод для выполнения запроса с логированием
    async _executeRequest(method, path, config = {}) {
        const url = this.buildUrlBase(path)
        const requestId = logRequestUtils(this.constructor.name, method, url, config.data || config.params)
        const start = performance.now()

        try {
            // request() возвращает уже распакованные данные (response.data)
            const data = await retryUtils(
                () => request({
                    url,
                    method,
                    timeout: this.defaultTimeout,
                    ...config
                }),
                this.maxRetries,
                this.retryDelay
            )

            // Не можем получить реальный статус, т.к. request() его "съел"
            // Логируем 200 как успешный ответ (поскольку ошибка выбросила бы исключение)
            logResponseUtils(this.constructor.name, requestId, 200, performance.now() - start, {
                hasData: !!data,
                dataType: Array.isArray(data) ? 'array' : typeof data
            })

            return data
        } catch (error) {
            logRequestErrorUtils(this.constructor.name, requestId, error, performance.now() - start)
            throw error
        }
    }

    // 🔹 Публичные методы — теперь тонкие обёртки над _executeRequest
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
