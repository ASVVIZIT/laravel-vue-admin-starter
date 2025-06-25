// utils/logger.js
const logLevels = ['DEBUG', 'INFO', 'WARN', 'ERROR']
const currentLevel = import.meta.env.VITE_LOG_LEVEL || 'INFO'

function shouldLog(level) {
    return logLevels.indexOf(level) >= logLevels.indexOf(currentLevel)
}

export default {
    debug(...args) {
        if (shouldLog('DEBUG')) console.debug('[Loader][DEBUG]', ...args)
    },
    info(...args) {
        if (shouldLog('INFO')) console.info('[Loader][INFO]', ...args)
    },
    warn(...args) {
        if (shouldLog('WARN')) console.warn('[Loader][WARN]', ...args)
    },
    error(...args) {
        if (shouldLog('ERROR')) console.error('[Loader][ERROR]', ...args)
    }
}
