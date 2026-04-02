/**
 * ============================================================================
 * API CONTEXT — КОНТЕКСТ API (ВЕРСИЯ, НАСТРОЙКИ, СОСТОЯНИЕ)
 * ============================================================================
 * 📁 Путь: api/core/utils/coreApiContext.js
 * ✅ Используется: Все Resources для определения контекста вызова
 * ✅ Singleton: Один экземпляр на все приложение
 * ============================================================================
 */

class CoreApiContext {
    constructor() {
        this._version = this._loadVersion();
        this._config = this._loadConfig();
        this._requestId = 0;
        this._initialized = false;
    }

    /**
     * Инициализация контекста
     */
    async init() {
        if (this._initialized) return;

        this._version = this._loadVersion();
        this._config = this._loadConfig();
        this._initialized = true;

        console.log(`[SmartLight:ApiContext] Initialized with version: ${this._version}`);
    }

    /**
     * Загрузка версии API из localStorage
     */
    _loadVersion() {
        if (typeof window !== 'undefined' && window.localStorage) {
            return localStorage.getItem('smartlight_api_version') || 'v0';
        }
        return 'v0';
    }

    /**
     * Загрузка конфигурации
     */
    _loadConfig() {
        const defaultConfig = {
            debug: false,
            logLevel: 'info',
            apiBaseUrl: '/api',
            timeout: 30000,
            retryAttempts: 3,
            retryDelay: 1000
        };

        if (typeof window !== 'undefined' && window.localStorage) {
            try {
                const saved = localStorage.getItem('smartlight_api_config');
                if (saved) {
                    return { ...defaultConfig, ...JSON.parse(saved) };
                }
            } catch (e) {
                console.warn('[SmartLight:ApiContext] Failed to load config', e);
            }
        }

        return defaultConfig;
    }

    /**
     * Получить текущую версию API
     */
    getVersion() {
        return this._version;
    }

    /**
     * Установить версию API
     */
    setVersion(version) {
        this._version = version;
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('smartlight_api_version', version);
        }
        console.log(`[SmartLight:ApiContext] Version set to: ${version}`);
    }

    /**
     * Получить конфигурацию
     */
    getConfig() {
        return this._config;
    }

    /**
     * Обновить конфигурацию
     */
    updateConfig(newConfig) {
        this._config = { ...this._config, ...newConfig };
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('smartlight_api_config', JSON.stringify(this._config));
        }
    }

    /**
     * Получить уникальный ID запроса
     */
    getNextRequestId() {
        return `req_${this._version}_${++this._requestId}_${Date.now()}`;
    }

    /**
     * Получить префикс для логов
     */
    getLogPrefix() {
        return `[SmartLight:${this._version.toUpperCase()}]`;
    }

    /**
     * Проверить уровень логирования
     */
    shouldLog(level) {
        const levels = { debug: 0, info: 1, warn: 2, error: 3 };
        return levels[level] >= levels[this._config.logLevel];
    }

    /**
     * Получить timeout для запросов
     */
    getTimeout() {
        return this._config.timeout;
    }

    /**
     * Получить количество попыток retry
     */
    getRetryAttempts() {
        return this._config.retryAttempts;
    }

    /**
     * Получить задержку retry
     */
    getRetryDelay() {
        return this._config.retryDelay;
    }

    /**
     * Проверить debug режим
     */
    isDebug() {
        return this._config.debug;
    }

    /**
     * Сбросить контекст
     */
    reset() {
        this._version = 'v0';
        this._config = this._loadConfig();
        this._requestId = 0;
        console.log('[SmartLight:ApiContext] Reset to defaults');
    }
}

//   Singleton instance
const coreApiContext = new CoreApiContext();

//   Auto-init
if (typeof window !== 'undefined') {
    coreApiContext.init();
}

export { coreApiContext, CoreApiContext };
export default coreApiContext;
