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
import { TRAINING_SETTINGS_DEFAULTS_CONFIG } from '@components/Training/config/trainingSettingsDefaultsConfig.js'
import { deepClone } from '@components/Training/utils/trainingSettingsHelpersUtils.js'

// Ключи localStorage
const CACHE_KEYS = {
    FRONTEND_SETTINGS: 'training_frontend_settings',
    COLUMNS_CONFIG: 'training_columns_config',
    LAST_GROUPING_MODE: 'training_last_grouping_mode',
    LIMITS: 'training_limits',
    FORM_META: 'training_form_meta'
}

const CACHE_TTL_MS = 5 * 60 * 1000

export class TrainingSettingsService {
    constructor() {
        this.api = TrainingSettingsApi
    }

    async getSettingsService(tab = 'mine') {
        logDebugUtils('TrainingSettingsService', 'getSettingsService', { tab })
        try {
            const result = await this.api.getSettingsApi(tab)

            if (result.success && result.data) {
                if (result.data.frontend) this._cacheFrontendSettings(result.data.frontend)
                if (result.data.columns) this._cacheColumnsConfig(result.data.columns)
                if (result.data.grouping) this._cacheGroupingMode(tab, result.data.grouping)
                if (result.data.limits) this._cacheLimits(result.data.limits)
                if (result.data.server?.form_meta) this._cacheFormMeta(result.data.server.form_meta)
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
                data: deepClone({ ...TRAINING_SETTINGS_DEFAULTS_CONFIG.display.server, ...TRAINING_SETTINGS_DEFAULTS_CONFIG.grouping.server }),
                isFallback: true
            }
        } catch (error) {
            logErrorUtils('TrainingSettingsService', 'getServerSettingsService error', error)
            return {
                success: false,
                message: 'Не удалось загрузить серверные настройки',
                data: deepClone({ ...TRAINING_SETTINGS_DEFAULTS_CONFIG.display.server, ...TRAINING_SETTINGS_DEFAULTS_CONFIG.grouping.server }),
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
                return { success: true, message: result.message, data: normalized }
            }

            const cached = this._getCachedFrontendSettings()
            if (cached) {
                return { success: false, message: 'Используются кэшированные настройки', data: cached, isCached: true }
            }

            return {
                success: false,
                message: 'Используются настройки по умолчанию',
                data: deepClone(TRAINING_SETTINGS_DEFAULTS_CONFIG.interface.frontend),
                isFallback: true
            }
        } catch (error) {
            logErrorUtils('TrainingSettingsService', 'getFrontendSettingsService error', error)
            const cached = this._getCachedFrontendSettings()
            return {
                success: false,
                message: 'Не удалось загрузить фронтенд-настройки',
                data: cached || deepClone(TRAINING_SETTINGS_DEFAULTS_CONFIG.interface.frontend),
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
                return { success: false, message: 'Используется кэшированный режим', data: cached, isCached: true }
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

    async updateSettingsService(settings) {
        logDebugUtils('TrainingSettingsService', 'updateSettingsService', { settings })

        const validation = this._validateSettings(settings)
        if (!validation.valid) {
            return { success: false, message: 'Ошибка валидации', errors: validation.errors }
        }

        try {
            const result = await this.api.updateSettingsApi(settings)

            if (result.success) {
                if (settings.frontend) this._cacheFrontendSettings(this._normalizeFrontendSettings(settings.frontend))
                if (settings.columns) this._cacheColumnsConfig(settings.columns)
                if (settings.limits) this._cacheLimits(this._normalizeLimits(settings.limits))
                if (settings.server?.form_meta) this._cacheFormMeta(settings.server.form_meta)
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

    resetCacheService() {
        logDebugUtils('TrainingSettingsService', 'resetCacheService')
        try {
            Object.values(CACHE_KEYS).forEach(key => localStorage.removeItem(key))
            return { success: true, message: 'Кэш сброшен' }
        } catch (error) {
            logErrorUtils('TrainingSettingsService', 'resetCacheService error', error)
            return { success: false, message: 'Не удалось сбросить кэш' }
        }
    }

    _normalizeServerSettings(raw) {
        if (!raw) return deepClone({ ...TRAINING_SETTINGS_DEFAULTS_CONFIG.display.server, ...TRAINING_SETTINGS_DEFAULTS_CONFIG.grouping.server })

        return {
            grouping_mode: raw.grouping_mode || TRAINING_SETTINGS_DEFAULTS_CONFIG.grouping.server.grouping_mode,
            grouping_auto_threshold: parseInt(raw.grouping_auto_threshold, 10) || TRAINING_SETTINGS_DEFAULTS_CONFIG.grouping.server.grouping_auto_threshold,
            grouping_by: raw.grouping_by || TRAINING_SETTINGS_DEFAULTS_CONFIG.grouping.server.grouping_by,
            grouping_per_page: parseInt(raw.grouping_per_page, 10) || TRAINING_SETTINGS_DEFAULTS_CONFIG.display.server.grouping_per_page,
            logs_per_page: parseInt(raw.logs_per_page, 10) || TRAINING_SETTINGS_DEFAULTS_CONFIG.display.server.logs_per_page,
            enable_stats: this._parseBoolean(raw.enable_stats, TRAINING_SETTINGS_DEFAULTS_CONFIG.display.server.enable_stats),
            enable_sharing: this._parseBoolean(raw.enable_sharing, TRAINING_SETTINGS_DEFAULTS_CONFIG.display.server.enable_sharing),
            enable_min_groups_check: this._parseBoolean(raw.enable_min_groups_check, TRAINING_SETTINGS_DEFAULTS_CONFIG.grouping.server.enable_min_groups_check),
            grouping_min_groups: parseInt(raw.grouping_min_groups, 10) || TRAINING_SETTINGS_DEFAULTS_CONFIG.grouping.server.grouping_min_groups,
        }
    }

    _normalizeFrontendSettings(raw) {
        if (!raw) return deepClone(TRAINING_SETTINGS_DEFAULTS_CONFIG.interface.frontend)

        return {
            default_tab: raw.default_tab || TRAINING_SETTINGS_DEFAULTS_CONFIG.interface.frontend.default_tab,
            show_grouping_toggle: this._parseBoolean(raw.show_grouping_toggle, TRAINING_SETTINGS_DEFAULTS_CONFIG.interface.frontend.show_grouping_toggle),
            filters_collapsed_mobile: this._parseBoolean(raw.filters_collapsed_mobile, TRAINING_SETTINGS_DEFAULTS_CONFIG.interface.frontend.filters_collapsed_mobile),
            compact_view: this._parseBoolean(raw.compact_view, TRAINING_SETTINGS_DEFAULTS_CONFIG.interface.frontend.compact_view)
        }
    }

    _normalizeLimits(raw) {
        if (!raw) return deepClone({ ...TRAINING_SETTINGS_DEFAULTS_CONFIG.search.limits, ...TRAINING_SETTINGS_DEFAULTS_CONFIG.display.limits })

        return {
            search_min_length: parseInt(raw.search_min_length, 10) || TRAINING_SETTINGS_DEFAULTS_CONFIG.search.limits.search_min_length,
            search_results_limit: parseInt(raw.search_results_limit, 10) || TRAINING_SETTINGS_DEFAULTS_CONFIG.search.limits.search_results_limit,
            max_shared_with: parseInt(raw.max_shared_with, 10) || TRAINING_SETTINGS_DEFAULTS_CONFIG.display.limits.max_shared_with,
            max_sets: parseInt(raw.max_sets, 10) || TRAINING_SETTINGS_DEFAULTS_CONFIG.display.limits.max_sets,
            max_notes_length: parseInt(raw.max_notes_length, 10) || TRAINING_SETTINGS_DEFAULTS_CONFIG.display.limits.max_notes_length,
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

    _validateSettings(settings) {
        const errors = {}

        if (settings.server) {
            const s = settings.server
            if (s.grouping_auto_threshold !== undefined) {
                const val = parseInt(s.grouping_auto_threshold, 10)
                if (isNaN(val) || val < 50 || val > 10000) errors['server.grouping_auto_threshold'] = ['Порог должен быть от 50 до 10000']
            }
            if (s.grouping_per_page !== undefined) {
                const val = parseInt(s.grouping_per_page, 10)
                if (isNaN(val) || val < 5 || val > 50) errors['server.grouping_per_page'] = ['Значение должно быть от 5 до 50']
            }
            if (s.logs_per_page !== undefined) {
                const val = parseInt(s.logs_per_page, 10)
                if (isNaN(val) || val < 10 || val > 200) errors['server.logs_per_page'] = ['Значение должно быть от 10 до 200']
            }
        }

        if (settings.limits) {
            const l = settings.limits
            if (l.search_min_length !== undefined) {
                const val = parseInt(l.search_min_length, 10)
                if (isNaN(val) || val < 1 || val > 10) errors['limits.search_min_length'] = ['Длина должна быть от 1 до 10']
            }
            if (l.search_results_limit !== undefined) {
                const val = parseInt(l.search_results_limit, 10)
                if (isNaN(val) || val < 10 || val > 500) errors['limits.search_results_limit'] = ['Лимит должен быть от 10 до 500']
            }
            if (l.max_shared_with !== undefined) {
                const val = parseInt(l.max_shared_with, 10)
                if (isNaN(val) || val < 1 || val > 500) errors['limits.max_shared_with'] = ['Лимит должен быть от 1 до 500']
            }
            if (l.max_sets !== undefined) {
                const val = parseInt(l.max_sets, 10)
                if (isNaN(val) || val < 1 || val > 200) errors['limits.max_sets'] = ['Лимит должен быть от 1 до 200']
            }
            if (l.max_notes_length !== undefined) {
                const val = parseInt(l.max_notes_length, 10)
                if (isNaN(val) || val < 50 || val > 5000) errors['limits.max_notes_length'] = ['Длина должна быть от 50 до 5000']
            }
        }

        return { valid: Object.keys(errors).length === 0, errors }
    }

    _normalizeValidationErrors(rawErrors) {
        const normalized = {}
        for (const [key, messages] of Object.entries(rawErrors)) {
            const cleanKey = key.replace(/^(server|frontend|columns|limits)\./, '')
            normalized[cleanKey] = Array.isArray(messages) ? messages : [messages]
        }
        return normalized
    }

    _cacheFrontendSettings(settings) {
        try { localStorage.setItem(CACHE_KEYS.FRONTEND_SETTINGS, JSON.stringify(settings)) }
        catch (e) { logErrorUtils('TrainingSettingsService', 'Cache frontend settings failed', e) }
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
        try { localStorage.setItem(CACHE_KEYS.COLUMNS_CONFIG, JSON.stringify(config)) }
        catch (e) { logErrorUtils('TrainingSettingsService', 'Cache columns config failed', e) }
    }

    _getCachedColumnsConfig() {
        try {
            const saved = localStorage.getItem(CACHE_KEYS.COLUMNS_CONFIG)
            if (!saved) return null
            return JSON.parse(saved)
        } catch (e) { return null }
    }

    _cacheGroupingMode(tab, grouping) {
        try {
            const cached = this._getAllCachedGroupingModes()
            cached[tab] = { ...grouping, cachedAt: Date.now() }
            localStorage.setItem(CACHE_KEYS.LAST_GROUPING_MODE, JSON.stringify(cached))
        } catch (e) { logErrorUtils('TrainingSettingsService', 'Cache grouping mode failed', e) }
    }

    _getCachedGroupingMode(tab) {
        try {
            const cached = this._getAllCachedGroupingModes()
            const entry = cached[tab]
            if (!entry) return null
            if (Date.now() - entry.cachedAt > CACHE_TTL_MS) return null
            return entry
        } catch (e) { return null }
    }

    _getAllCachedGroupingModes() {
        try {
            const saved = localStorage.getItem(CACHE_KEYS.LAST_GROUPING_MODE)
            return saved ? JSON.parse(saved) : {}
        } catch (e) { return {} }
    }

    _cacheLimits(limits) {
        try { localStorage.setItem(CACHE_KEYS.LIMITS, JSON.stringify(limits)) }
        catch (e) { logErrorUtils('TrainingSettingsService', 'Cache limits failed', e) }
    }

    _getCachedLimits() {
        try {
            const saved = localStorage.getItem(CACHE_KEYS.LIMITS)
            if (!saved) return null
            return this._normalizeLimits(JSON.parse(saved))
        } catch (e) {
            logErrorUtils('TrainingSettingsService', 'Read cached limits failed', e)
            localStorage.removeItem(CACHE_KEYS.LIMITS)
            return null
        }
    }

    _cacheFormMeta(meta) {
        try { localStorage.setItem(CACHE_KEYS.FORM_META, JSON.stringify(meta)) }
        catch (e) { logErrorUtils('TrainingSettingsService', 'Cache form meta failed', e) }
    }

    _getCachedFormMeta() {
        try {
            const saved = localStorage.getItem(CACHE_KEYS.FORM_META)
            if (!saved) return null
            return JSON.parse(saved)
        } catch (e) {
            logErrorUtils('TrainingSettingsService', 'Read cached form meta failed', e)
            localStorage.removeItem(CACHE_KEYS.FORM_META)
            return null
        }
    }

    _handleError(message, error) {
        return {
            success: false,
            message: error.response?.data?.message || message,
            error: error.response?.data || error
        }
    }
}

export default TrainingSettingsService
