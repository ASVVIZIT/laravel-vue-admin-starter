/**
 * Утилита для логирования событий
 * Поддерживает разные уровни логирования
 * Работает в режиме отладки
 */

class SmartLightLogger {
    constructor(enabled = true) {
        this.enabled = enabled;
        this.prefix = '[SmartLight]';
    }

    log(level, message, data = {}) {
        if (!this.enabled) return;

        const timestamp = new Date().toISOString();
        const logMessage = `${this.prefix} [${level.toUpperCase()}] ${timestamp}: ${message}`;

        switch (level) {
            case 'debug':
                console.debug(logMessage, data);
                break;
            case 'info':
                console.info(logMessage, data);
                break;
            case 'warn':
                console.warn(logMessage, data);
                break;
            case 'error':
                console.error(logMessage, data);
                break;
            default:
                console.log(logMessage, data);
        }
    }

    debug(message, data = {}) {
        this.log('debug', message, data);
    }

    info(message, data = {}) {
        this.log('info', message, data);
    }

    warn(message, data = {}) {
        this.log('warn', message, data);
    }

    error(message, data = {}) {
        this.log('error', message, data);
    }
}

// Создаем экземпляр с включенным логированием в режиме разработки
const isDebugEnabled = import.meta.env.VITE_APP_DEBUG === 'true';
export const logger = new SmartLightLogger(isDebugEnabled);
