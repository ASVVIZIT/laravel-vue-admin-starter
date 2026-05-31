/**
 * ============================================================================
 * API CONTEXT — КОНТЕКСТ API (ВЕРСИЯ, НАСТРОЙКИ, СОСТОЯНИЕ)
 * ============================================================================
 * 📁 Путь: api/core/utils/coreApiContextUtils.js
 * ✅ Singleton: Один экземпляр на все приложение
 * ✅ Назначение: Хранение версии API, таймаутов, настроек логирования
 * ✅ Используется: CoreBaseResource, CoreApiLogger
 * ============================================================================
 */

class CoreApiContextUtils {
    constructor() {
        // ✅ ПО УМОЛЧАНИЮ: версия = null (маршруты без /v0/, /v1/)
        this._version = this._loadVersion();
        this._config = this._loadConfig();
        this._requestId = 0;
        this._initialized = false;
    }

    async init() {
        if (this._initialized) return;
        this._version = this._loadVersion();
        this._config = this._loadConfig();
        this._initialized = true;
        console.log(`[SmartLight:coreApiContextUtils] Initialized with version: ${this._version || '(none)'}`);
    }

    _loadVersion() {
        if (typeof window !== 'undefined' && window.localStorage) {
            const saved = localStorage.getItem('smartlight_api_version');
            return saved || null;
        }
        return null;
    }

    _loadConfig() {
        const defaultConfig = {
            debug: false,
            logLevel: 'info',
            apiBaseUrl: '/api', // ✅ Базовый префикс для всех запросов
            timeout: 30000,
            retryAttempts: 3,
            retryDelay: 1000
        };
        if (typeof window !== 'undefined' && window.localStorage) {
            try {
                const saved = localStorage.getItem('smartlight_api_config');
                if (saved) return { ...defaultConfig, ...JSON.parse(saved) };
            } catch (e) { console.warn('[SmartLight:coreApiContextUtils] Failed to load config', e); }
        }
        return defaultConfig;
    }

    getVersion() { return this._version; }

    setVersion(version) {
        this._version = version;
        if (typeof window !== 'undefined' && window.localStorage) {
            if (version) localStorage.setItem('smartlight_api_version', version);
            else localStorage.removeItem('smartlight_api_version');
        }
        console.log(`[SmartLight:ApiContext] Version set to: ${version || '(none)'}`);
    }

    getConfig() { return this._config; }

    updateConfig(newConfig) {
        this._config = { ...this._config, ...newConfig };
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('smartlight_api_config', JSON.stringify(this._config));
        }
    }

    getNextRequestId() { return `req_${this._version || 'core'}_${++this._requestId}_${Date.now()}`; }

    getLogPrefix() { return `[SmartLight:${(this._version || 'CORE').toUpperCase()}]`; }

    shouldLog(level) {
        const levels = { debug: 0, info: 1, warn: 2, error: 3 };
        return levels[level] >= levels[this._config.logLevel];
    }

    getTimeout() { return this._config.timeout; }
    getRetryAttempts() { return this._config.retryAttempts; }
    getRetryDelay() { return this._config.retryDelay; }
    isDebug() { return this._config.debug; }

    reset() {
        this._version = null;
        this._config = this._loadConfig();
        this._requestId = 0;
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.removeItem('smartlight_api_version');
        }
        console.log('[SmartLight:coreApiContextUtils] Reset to defaults');
    }
}

// ✅ Singleton instance
const coreApiContextUtils = new CoreApiContextUtils();

// ✅ Auto-init в браузере
if (typeof window !== 'undefined') {
    coreApiContextUtils.init();
}

export { coreApiContextUtils, CoreApiContextUtils };
export default coreApiContextUtils;
