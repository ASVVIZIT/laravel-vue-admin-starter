/**
 * ============================================================================
 * CENTRAL REQUEST — ЕДИНАЯ ТОЧКА ДОСТУПА К API
 * ============================================================================
 * 📁 Путь: @/utils/request.js
 * 🎯 Назначение: Глобальный HTTP-клиент с поддержкой мета-режимов
 * ✅ Совместимость: 100% обратная совместимость (режим BEFORE по умолчанию)
 * 🔄 Миграция: Постепенное внедрение через флаги __metaMode
 * ============================================================================
 *
 * 🎯 СПЕЦИАЛЬНАЯ ОБРАБОТКА ТИПОВ ЗАПРОСОВ
 * ============================================================================
 *
 * Blob-запросы (responseType: 'blob'):
 * - Автоматически возвращают { blob, headers, status, statusText }
 * - Работают независимо от мета-режима (BEFORE/AFTER/HYBRID)
 * - Используются для экспорта файлов (CSV, PDF, Excel)
 * - Позволяют извлекать имя файла из заголовка Content-Disposition
 * - Автоматически увеличивают таймаут в 2 раза для больших файлов
 *
 * Пример использования:
 * const { blob, headers } = await request({
 *     url: '/training/export/csv',
 *     responseType: 'blob'
 * })
 * const fileName = headers['content-disposition'].match(/filename="?(.+)"?/)[1]
 *
 * ============================================================================
 */

import '@/bootstrap'
import Cookies from 'js-cookie'
import { ElMessage } from 'element-plus'
import { isLogged, getToken, setToken, getLoginType } from '@/utils/auth'

// ============================================================================
// 🎛️ КОНФИГУРАЦИЯ РЕЖИМОВ
// ============================================================================

/**
 * Режимы работы HTTP-клиента
 * @enum {number}
 */
export const RequestMetaMode = {
    /** Только данные (response.data) — дефолт, 100% совместимость */
    BEFORE: 0,

    /** Данные + метаданные ({ data, status, headers }) — для новых модулей */
    AFTER: 1,

    /** Авто-переключение по URL-паттернам — умная миграция */
    HYBRID: 2
}

/**
 * Глобальный режим (можно менять в runtime: window.__REQUEST_META_MODE = 1)
 * @type {RequestMetaMode}
 */
const GLOBAL_META_MODE = window.__REQUEST_META_MODE ?? RequestMetaMode.BEFORE

/**
 * URL-паттерны для HYBRID-режима
 * Модули в этом списке автоматически получат мета-данные
 * @type {string[]}
 */
const HYBRID_PATTERNS = [
    '/training'
    // Пример: '/smartlight', '/dynamic-table' — добавляй по мере миграции
]

// ============================================================================
// 🌐 СОЗДАНИЕ AXIOS-ИНСТАНСА
// ============================================================================

const service = window.axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 30000,
    withCredentials: true
})

// ============================================================================
// 📤 REQUEST INTERCEPTOR
// ============================================================================

service.interceptors.request.use(
    /**
     * Обработка исходящего запроса
     * @param {import('axios').InternalAxiosRequestConfig} config
     * @returns {import('axios').InternalAxiosRequestConfig}
     */
    config => {
        const token = getToken()
        const loginType = getLoginType()
        const csrfToken = Cookies.get('XSRF-TOKEN')

        // 🔹 Отладочное логирование (только в дев-режиме)
        if (import.meta.env.DEV && config.__debug) {
            const mode = resolveMetaMode(config)
            console.log(`[Request] ${config.method?.toUpperCase()} ${config.url} [mode:${mode}]`)
        }

        // 🔹 Авторизация
        if (token && isLogged()) {
            config.headers['Authorization'] = `Bearer ${token}`
        }

        // 🔹 CSRF-защита
        if (csrfToken) {
            config.headers['X-XSRF-TOKEN'] = csrfToken
        }

        // 🔹 Авто-префикс для админ-панели
        if (loginType === 'admin' && !config.url?.startsWith('/admin')) {
            config.url = `/admin${config.url}`
        }

        // 🔥 Увеличенный таймаут для blob-запросов (экспорт файлов)
        if (config.responseType === 'blob') {
            config.timeout = (config.timeout || 30000) * 2
        }

        return config
    },

    /**
     * Обработка ошибки запроса
     * @param {Error} error
     * @returns {Promise<never>}
     */
    error => {
        console.error('[AXIOS] Request error:', error)
        return Promise.reject(error)
    }
)

// ============================================================================
// 📥 RESPONSE INTERCEPTOR — СЕРДЦЕ ПЕРЕКЛЮЧАТЕЛЯ
// ============================================================================

service.interceptors.response.use(
    /**
     * Обработка успешного ответа
     * @param {import('axios').AxiosResponse} response
     * @returns {Promise<any>}
     */
    response => {
        // 🔹 Авто-обновление токена (если бэкенд вернул новый)
        const authToken = response.data?.token || response.headers?.['authorization']
        if (authToken) {
            const tokenValue = authToken.replace('Bearer ', '')
            setToken(tokenValue)
        }

        // 🔥 СПЕЦИАЛЬНАЯ ОБРАБОТКА BLOB-ЗАПРОСОВ (для экспорта файлов)
        // Автоматически возвращает { blob, headers, status, statusText }
        // независимо от мета-режима (BEFORE/AFTER/HYBRID)
        if (response.config.responseType === 'blob') {
            return {
                blob: response.data,
                headers: response.headers,
                status: response.status,
                statusText: response.statusText
            }
        }

        // 🔹 Определяем режим для этого запроса
        const mode = resolveMetaMode(response.config)

        // ────────────────────────────────────────────────────────────────
        // РЕЖИМ 0: BEFORE (Только данные) — 100% обратная совместимость
        // ────────────────────────────────────────────────────────────────
        if (mode === RequestMetaMode.BEFORE) {
            return response.data
        }

        // ────────────────────────────────────────────────────────────────
        // РЕЖИМ 1: AFTER (Данные + метаданные) — для новых модулей
        // ────────────────────────────────────────────────────────────────
        if (mode === RequestMetaMode.AFTER) {
            return {
                data: response.data,
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
                config: {
                    url: response.config.url,
                    method: response.config.method,
                    params: response.config.params
                }
            }
        }

        // ────────────────────────────────────────────────────────────────
        // РЕЖИМ 2: HYBRID (Авто) — фолбэк на BEFORE
        // ────────────────────────────────────────────────────────────────
        return response.data
    },

    /**
     * Обработка ошибки ответа — ЕДИНАЯ для всех режимов
     * @param {import('axios').AxiosError} error
     * @returns {Promise<never>}
     */
    error => {
        // 🔹 401: Редирект на вход
        if (error.response?.status === 401) {
            const loginType = getLoginType()
            window.location.href = loginType === 'admin' ? '/admin/login' : '/login'
            return Promise.reject(error)
        }

        // 🔹 Формирование сообщения об ошибке
        const message =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            'Network error'

        // 🔹 Тихие ошибки (для фоновых запросов, чтобы не спамить пользователя)
        const isSilent = error.config?.__silentErrors && [404, 422].includes(error.response?.status)

        if (!isSilent) {
            ElMessage.error(message)
        }

        return Promise.reject(error)
    }
)

// ============================================================================
// 🧠 ЛОГИКА РАЗРЕШЕНИЯ РЕЖИМА
// ============================================================================

/**
 * Определяет активный режим для запроса
 * Приоритет: явный флаг в конфиге → HYBRID по URL → глобальный режим
 *
 * @param {import('axios').InternalAxiosRequestConfig} config
 * @returns {RequestMetaMode}
 */
function resolveMetaMode(config) {
    // 1️⃣ Приоритет: явный флаг в конфиге запроса
    if (config.__metaMode !== undefined) {
        return config.__metaMode
    }

    // 2️⃣ HYBRID-режим: авто-определение по паттернам URL
    if (GLOBAL_META_MODE === RequestMetaMode.HYBRID) {
        const url = config.url || ''
        if (HYBRID_PATTERNS.some(pattern => url.includes(pattern))) {
            return RequestMetaMode.AFTER
        }
        return RequestMetaMode.BEFORE
    }

    // 3️⃣ Глобальный режим (дефолт: BEFORE)
    return GLOBAL_META_MODE
}

// ============================================================================
// 🎛️ ПУБЛИЧНЫЙ API ДЛЯ УПРАВЛЕНИЯ РЕЖИМАМИ
// ============================================================================

/**
 * Установить глобальный режим для всех запросов
 * @param {RequestMetaMode} mode
 * @example
 * setGlobalMetaMode(RequestMetaMode.AFTER) // Включить мета-режим
 * setGlobalMetaMode(1) // То же самое (числовой вариант)
 */
export const setGlobalMetaMode = mode => {
    window.__REQUEST_META_MODE = mode
    const modeName = { 0: 'BEFORE', 1: 'AFTER', 2: 'HYBRID' }[mode] || 'UNKNOWN'
    console.log(`[request.js] ✅ Global mode: ${modeName}`)
}

/**
 * Получить текущий глобальный режим
 * @returns {RequestMetaMode}
 */
export const getGlobalMetaMode = () =>
    window.__REQUEST_META_MODE ?? RequestMetaMode.BEFORE

/**
 * Создать конфиг запроса с включённым мета-режимом
 * @param {Object} config - Базовый конфиг запроса
 * @param {RequestMetaMode} [mode=RequestMetaMode.AFTER] - Желаемый режим
 * @returns {Object} Конфиг с флагом __metaMode
 * @example
 * request(createMetaRequest({ url: '/users' }, RequestMetaMode.AFTER))
 */
export const createMetaRequest = (config, mode = RequestMetaMode.AFTER) => ({
    ...config,
    __metaMode: mode
})

/**
 * Проверить, включён ли мета-режим для данного конфига
 * @param {Object} [config={}] - Конфиг запроса
 * @returns {boolean}
 */
export const isMetaModeEnabled = (config = {}) =>
    resolveMetaMode(config) !== RequestMetaMode.BEFORE

/**
 * Отладочная утилита: вывести все активные режимы в консоль
 * @example
 * debugRequestModes()
 */
export const debugRequestModes = () => {
    console.group('🔍 Request Modes Debug')
    console.log('Global mode:', getGlobalMetaMode())
    console.log('HYBRID patterns:', HYBRID_PATTERNS)
    console.log(
        'Active modules (by URL):',
        HYBRID_PATTERNS.map(
            p => `${p}: ${isMetaModeEnabled({ url: p }) ? 'AFTER' : 'BEFORE'}`
        )
    )
    console.groupEnd()
}

// ============================================================================
// 📦 ЭКСПОРТ ПО УМОЛЧАНИЮ
// ============================================================================

export default service
