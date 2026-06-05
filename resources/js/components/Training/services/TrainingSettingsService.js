/**
 * ============================================================================
 * TRAINING SETTINGS SERVICE — БИЗНЕС-ЛОГИКА НАСТРОЕК
 * ============================================================================
 * 📁 Путь: @/components/Training/services/TrainingSettingsService.js
 * ✅ Используется: trainingSettingsStore
 * ✅ Отвечает за:
 *    • Кэширование фронтенд-настроек в localStorage
 *    • Нормализацию данных перед отправкой на бэкенд
 *    • Обработку ошибок валидации
 *    • Логику fallback при недоступности API
 * ============================================================================
 */

import { TrainingSettingsApi } from '@/components/Training/api/core/TrainingSettingsApi.js'
import { logDebugUtils, logErrorUtils } from '@/components/Training/api/core/utils/coreApiLoggerUtils.js'

// Ключи localStorage
const CACHE_KEYS = {
    FRONTEND_SETTINGS: 'training_frontend_settings',
    COLUMNS_CONFIG: 'training_columns_config',
    LAST_GROUPING_MODE: 'training_last_grouping_mode'
}

// Значения по умолчанию
const DEFAULT_SERVER_SETTINGS = {
    grouping_mode: 'auto',
    grouping_auto_threshold: 500,
    grouping_by: 'user',
    grouping_per_page: 10,
    logs_per_page: 50,
    enable_stats: true,
    enable_sharing: true
}

const DEFAULT_FRONTEND_SETTINGS = {
    default_tab: 'mine',
    show_grouping_toggle: true,
    filters_collapsed_mobile: true,
    compact_view: false
}

const DEFAULT_COLUMNS_CONFIG = {
    'mine': { date: true, time: true, exercise: true, sharing: true, sets: true, reps: true, volume: true, rating: true, actions: true },
    'shared-with-me': { date: true, time: true, exercise: true, sharing: true, sets: true, reps: true, volume: true, rating: true, actions: false },
    'shared-by-me': { date: true, time: true, exercise: true, sharing: true, sets: true, reps: true, volume: true, rating: true, actions: true }
}

export class TrainingSettingsService {
    constructor() {
        this.api = TrainingSettingsApi
    }

    // ========================================================================
    // ПОЛУЧЕНИЕ НАСТРОЕК
    // ========================================================================

    async getSettingsService(tab = 'mine') {
        logDebugUtils('TrainingSettingsService', 'getSettingsService', { tab })
        try {
            const result = await this.api.getSettingsApi(tab)

            if (result.success && result.data) {
                if (result.data.frontend) {
                    this._cacheFrontendSettings(result.data.frontend)
                }
                if (result.data.columns) {
                    this._cacheColumnsConfig(result.data.columns)
                }
                if (result.data.grouping) {
                    this._cacheGroupingMode(tab, result.data.grouping)
                }
            }

            return result
        } catch (error) {
            logErrorUtils('TrainingSettingsService', 'getSettingsService error', error)
            return this._handleError('Не удалось загрузить настройки', error)
        }
    }

    async getServerSettingsService() {
        logDebugUtils('TrainingSettingsService', 'getServerSettingsService')
        try {
            const result = await this.api.getServerSettingsApi()

            if (result.success) {
                return {
                    success: true,
                    message: result.message,
                    data: this._normalizeServerSettings(result.data)
                }
            }

            return {
                success: false,
                message: result.message || 'Используются настройки по умолчанию',
                data: { ...DEFAULT_SERVER_SETTINGS },
                isFallback: true
            }
        } catch (error) {
            logErrorUtils('TrainingSettingsService', 'getServerSettingsService error', error)
            return {
                success: false,
                message: 'Не удалось загрузить серверные настройки',
                data: { ...DEFAULT_SERVER_SETTINGS },
                isFallback: true
            }
        }
    }

    async getFrontendSettingsService() {
        logDebugUtils('TrainingSettingsService', 'getFrontendSettingsService')
        try {
            const result = await this.api.getFrontendSettingsApi()

            if (result.success && result.data) {
                const normalized = this._normalizeFrontendSettings(result.data)
                this._cacheFrontendSettings(normalized)
                return {
                    success: true,
                    message: result.message,
                    data: normalized
                }
            }

            const cached = this._getCachedFrontendSettings()
            if (cached) {
                return {
                    success: false,
                    message: 'Используются кэшированные настройки',
                    data: cached,
                    isCached: true
                }
            }

            return {
                success: false,
                message: 'Используются настройки по умолчанию',
                data: { ...DEFAULT_FRONTEND_SETTINGS },
                isFallback: true
            }
        } catch (error) {
            logErrorUtils('TrainingSettingsService', 'getFrontendSettingsService error', error)
            const cached = this._getCachedFrontendSettings()
            return {
                success: false,
                message: 'Не удалось загрузить фронтенд-настройки',
                data: cached || { ...DEFAULT_FRONTEND_SETTINGS },
                isCached: !!cached,
                isFallback: !cached
            }
        }
    }

    async getGroupingModeService(tab = 'mine') {
        logDebugUtils('TrainingSettingsService', 'getGroupingModeService', { tab })
        try {
            const result = await this.api.getGroupingModeApi(tab)

            if (result.success && result.data) {
                this._cacheGroupingMode(tab, result.data)
                return result
            }

            const cached = this._getCachedGroupingMode(tab)
            if (cached) {
                return {
                    success: false,
                    message: 'Используется кэшированный режим',
                    data: cached,
                    isCached: true
                }
            }

            return {
                success: false,
                message: 'Режим по умолчанию',
                data: { mode: 'frontend', reason: 'Default fallback' },
                isFallback: true
            }
        } catch (error) {
            logErrorUtils('TrainingSettingsService', 'getGroupingModeService error', error)
            return {
                success: false,
                message: 'Не удалось определить режим группировки',
                data: { mode: 'frontend', reason: 'Error fallback' },
                isFallback: true
            }
        }
    }

    // ========================================================================
    // ОБНОВЛЕНИЕ НАСТРОЕК
    // ========================================================================

    async updateSettingsService(settings) {
        logDebugUtils('TrainingSettingsService', 'updateSettingsService', { settings })

        const validation = this._validateSettings(settings)
        if (!validation.valid) {
            return {
                success: false,
                message: 'Ошибка валидации',
                errors: validation.errors
            }
        }

        try {
            const result = await this.api.updateSettingsApi(settings)

            if (result.success) {
                if (settings.frontend) {
                    this._cacheFrontendSettings(this._normalizeFrontendSettings(settings.frontend))
                }
                if (settings.columns) {
                    this._cacheColumnsConfig(settings.columns)
                }
            }

            return result
        } catch (error) {
            logErrorUtils('TrainingSettingsService', 'updateSettingsService error', error)

            if (error.response?.status === 422) {
                const backendErrors = error.response?.data?.errors || {}
                return {
                    success: false,
                    message: 'Ошибка валидации',
                    errors: this._normalizeValidationErrors(backendErrors)
                }
            }

            return this._handleError('Не удалось сохранить настройки', error)
        }
    }

    // ========================================================================
    // СБРОС КЭША
    // ========================================================================

    resetCacheService() {
        logDebugUtils('TrainingSettingsService', 'resetCacheService')
        try {
            Object.values(CACHE_KEYS).forEach(key => {
                localStorage.removeItem(key)
            })
            return {
                success: true,
                message: 'Кэш сброшен'
            }
        } catch (error) {
            logErrorUtils('TrainingSettingsService', 'resetCacheService error', error)
            return {
                success: false,
                message: 'Не удалось сбросить кэш'
            }
        }
    }

    // ========================================================================
    // ПРИВАТНЫЕ МЕТОДЫ: НОРМАЛИЗАЦИЯ
    // ========================================================================

    _normalizeServerSettings(raw) {
        if (!raw) return { ...DEFAULT_SERVER_SETTINGS }

        return {
            grouping_mode: raw.grouping_mode || DEFAULT_SERVER_SETTINGS.grouping_mode,
            grouping_auto_threshold: parseInt(raw.grouping_auto_threshold, 10) || DEFAULT_SERVER_SETTINGS.grouping_auto_threshold,
            grouping_by: raw.grouping_by || DEFAULT_SERVER_SETTINGS.grouping_by,
            grouping_per_page: parseInt(raw.grouping_per_page, 10) || DEFAULT_SERVER_SETTINGS.grouping_per_page,
            logs_per_page: parseInt(raw.logs_per_page, 10) || DEFAULT_SERVER_SETTINGS.logs_per_page,
            enable_stats: this._parseBoolean(raw.enable_stats, DEFAULT_SERVER_SETTINGS.enable_stats),
            enable_sharing: this._parseBoolean(raw.enable_sharing, DEFAULT_SERVER_SETTINGS.enable_sharing)
        }
    }

    _normalizeFrontendSettings(raw) {
        if (!raw) return { ...DEFAULT_FRONTEND_SETTINGS }

        return {
            default_tab: raw.default_tab || DEFAULT_FRONTEND_SETTINGS.default_tab,
            show_grouping_toggle: this._parseBoolean(raw.show_grouping_toggle, DEFAULT_FRONTEND_SETTINGS.show_grouping_toggle),
            filters_collapsed_mobile: this._parseBoolean(raw.filters_collapsed_mobile, DEFAULT_FRONTEND_SETTINGS.filters_collapsed_mobile),
            compact_view: this._parseBoolean(raw.compact_view, DEFAULT_FRONTEND_SETTINGS.compact_view)
        }
    }

    _parseBoolean(value, defaultValue = false) {
        if (typeof value === 'boolean') return value
        if (typeof value === 'string') {
            if (value.toLowerCase() === 'true') return true
            if (value.toLowerCase() === 'false') return false
        }
        return defaultValue
    }

    // ========================================================================
    // ПРИВАТНЫЕ МЕТОДЫ: ВАЛИДАЦИЯ
    // ========================================================================

    _validateSettings(settings) {
        const errors = {}

        if (settings.server) {
            const s = settings.server
            if (s.grouping_auto_threshold !== undefined) {
                const val = parseInt(s.grouping_auto_threshold, 10)
                if (isNaN(val) || val < 50 || val > 10000) {
                    errors['server.grouping_auto_threshold'] = ['Порог должен быть от 50 до 10000']
                }
            }
            if (s.grouping_per_page !== undefined) {
                const val = parseInt(s.grouping_per_page, 10)
                if (isNaN(val) || val < 5 || val > 50) {
                    errors['server.grouping_per_page'] = ['Значение должно быть от 5 до 50']
                }
            }
            if (s.logs_per_page !== undefined) {
                const val = parseInt(s.logs_per_page, 10)
                if (isNaN(val) || val < 10 || val > 200) {
                    errors['server.logs_per_page'] = ['Значение должно быть от 10 до 200']
                }
            }
        }

        return {
            valid: Object.keys(errors).length === 0,
            errors
        }
    }

    _normalizeValidationErrors(rawErrors) {
        const normalized = {}
        for (const [key, messages] of Object.entries(rawErrors)) {
            const cleanKey = key.replace(/^(server|frontend|columns)\./, '')
            normalized[cleanKey] = Array.isArray(messages) ? messages : [messages]
        }
        return normalized
    }

    // ========================================================================
    // ПРИВАТНЫЕ МЕТОДЫ: КЭШИРОВАНИЕ
    // ========================================================================

    _cacheFrontendSettings(settings) {
        try {
            localStorage.setItem(CACHE_KEYS.FRONTEND_SETTINGS, JSON.stringify(settings))
        } catch (e) {
            logErrorUtils('TrainingSettingsService', 'Cache frontend settings failed', e)
        }
    }

    _getCachedFrontendSettings() {
        try {
            const saved = localStorage.getItem(CACHE_KEYS.FRONTEND_SETTINGS)
            if (!saved) return null
            return this._normalizeFrontendSettings(JSON.parse(saved))
        } catch (e) {
            logErrorUtils('TrainingSettingsService', 'Read cached frontend settings failed', e)
            localStorage.removeItem(CACHE_KEYS.FRONTEND_SETTINGS)
            return null
        }
    }

    _cacheColumnsConfig(config) {
        try {
            localStorage.setItem(CACHE_KEYS.COLUMNS_CONFIG, JSON.stringify(config))
        } catch (e) {
            logErrorUtils('TrainingSettingsService', 'Cache columns config failed', e)
        }
    }

    _getCachedColumnsConfig() {
        try {
            const saved = localStorage.getItem(CACHE_KEYS.COLUMNS_CONFIG)
            if (!saved) return null
            return JSON.parse(saved)
        } catch (e) {
            return null
        }
    }

    _cacheGroupingMode(tab, grouping) {
        try {
            const cached = this._getAllCachedGroupingModes()
            cached[tab] = { ...grouping, cachedAt: Date.now() }
            localStorage.setItem(CACHE_KEYS.LAST_GROUPING_MODE, JSON.stringify(cached))
        } catch (e) {
            logErrorUtils('TrainingSettingsService', 'Cache grouping mode failed', e)
        }
    }

    _getCachedGroupingMode(tab) {
        try {
            const cached = this._getAllCachedGroupingModes()
            const entry = cached[tab]
            if (!entry) return null
            if (Date.now() - entry.cachedAt > 5 * 60 * 1000) return null
            return entry
        } catch (e) {
            return null
        }
    }

    _getAllCachedGroupingModes() {
        try {
            const saved = localStorage.getItem(CACHE_KEYS.LAST_GROUPING_MODE)
            return saved ? JSON.parse(saved) : {}
        } catch (e) {
            return {}
        }
    }

    // ========================================================================
    // ПРИВАТНЫЕ МЕТОДЫ: ОБРАБОТКА ОШИБОК
    // ========================================================================

    _handleError(message, error) {
        return {
            success: false,
            message: error.response?.data?.message || message,
            error: error.response?.data || error
        }
    }
}

export default TrainingSettingsService
