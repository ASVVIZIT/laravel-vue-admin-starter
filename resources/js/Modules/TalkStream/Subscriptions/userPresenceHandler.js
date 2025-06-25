import { useContactStore } from '@/modules/TalkStream/Stores/contactStore'

// ————————————————————————
// Система логирования
// ————————————————————————

const createLogger = () => {
    const logLevels = ['DEBUG', 'INFO', 'WARN', 'ERROR']
    const currentLevel = import.meta.env.VITE_LOG_LEVEL || 'INFO'
    const shouldLog = (level) => {
        return logLevels.indexOf(level) >= logLevels.indexOf(currentLevel)
    }

    // Стили для вывода в консоль
    const styles = {
        default: 'color: #333;',
        here: 'color: #1e90ff; font-weight: bold;',
        joining: 'color: #32cd32; font-weight: bold;',
        leaving: 'color: #ff6347; font-weight: bold;',
        warn: 'color: #ff9800; font-weight: bold;',
        error: 'color: red; background: yellow; font-weight: bold;'
    }

    return {
        info: (message, type = '') => {
            if (!shouldLog('INFO')) return
            const style = styles[type] || styles.default
            console.log(`%c[Presence Channel] ${message}`, style)
        },
        warn: (message) => {
            if (!shouldLog('WARN')) return
            console.warn(`%c[Presence Channel] ⚠️ ${message}`, styles.warn)
        },
        error: (message) => {
            if (!shouldLog('ERROR')) return
            console.error(`%c[Presence Channel] ❌ ${message}`, styles.error)
        }
    }
}

const logger = createLogger()

export function setupUserPresenceChannel() {

    if (!window.Echo) {
        logger.warn('Echo ещё не создан')
        return null
    }

    try {
        const presenceChannel = window.Echo.join('presence-chat')

        presenceChannel
            .here((users) => {
                logger.info(`Пользователи онлайн: ${users.length}`, 'here')
                users.forEach(user => setUserOnline(user.id))
            })
            .joining((user) => {
                logger.info(`Кто-то вошёл: ${user.id}`, 'joining')
                setUserOnline(user.id)
            })
            .leaving((user) => {
                logger.warn(`Кто-то вышел: ${user.id}`, 'leaving')
                setUserOffline(user.id)
            })

        return presenceChannel
    } catch (error) {
        logger.error(`Ошибка при настройке presence-канала: ${error.message}`)
        return null
    }
}

function setUserOnline(userId) {
    const storeContact = getContactStore()
    if (!storeContact) return

    if (!storeContact.onlineUsers.includes(userId)) {
        storeContact.setOnline(userId)
        logger.info(`🟢 Пользователь ${userId} онлайн`, 'joining')
    }
}

function setUserOffline(userId) {
    const storeContact = getContactStore()
    if (!storeContact) return

    storeContact.setOffline(userId)
    logger.info(`⚪ Пользователь ${userId} оффлайн`, 'leaving')
}

function getContactStore() {
    try {
        return useContactStore()
    } catch (e) {
        logger.error('Не удалось получить контакт-стор:', e.message)
        return null
    }
}
