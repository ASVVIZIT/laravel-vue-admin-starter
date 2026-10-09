const logLevels = ['DEBUG', 'INFO', 'WARN', 'ERROR'] as const
type LogLevel = typeof logLevels[number]

const currentLevel = (import.meta.env.VITE_LOG_LEVEL as LogLevel) || 'INFO'

function shouldLog(level: LogLevel): boolean {
    return logLevels.indexOf(level) >= logLevels.indexOf(currentLevel)
}

export default {
    debug(...args: unknown[]): void {
        if (shouldLog('DEBUG')) console.debug('[TalkStream][DEBUG]', ...args)
    },
    info(...args: unknown[]): void {
        if (shouldLog('INFO')) console.info('[TalkStream][INFO]', ...args)
    },
    warn(...args: unknown[]): void {
        if (shouldLog('WARN')) console.warn('[TalkStream][WARN]', ...args)
    },
    error(...args: unknown[]): void {
        if (shouldLog('ERROR')) console.error('[TalkStream][ERROR]', ...args)
    }
}
