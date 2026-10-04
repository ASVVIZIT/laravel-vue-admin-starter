import { useContactStore } from '@/modules/TalkStream/Stores/contactStore'

const log = {
    info: (msg) => console.log(`%c[Presence] ${msg}`, 'color: #1e90ff; font-weight: bold;'),
    warn: (msg) => console.warn(`[Presence] ⚠️ ${msg}`),
    error: (msg) => console.error(`[Presence] ❌ ${msg}`),
}

/**
 * Подписка на presence-канал онлайн-статусов.
 *
 * ВАЖНО: echo.join('chat') → фактический канал в Reverb = 'presence-chat'.
 * Echo САМ добавляет префикс 'presence-'.
 * Правило в routes/channels.php: Broadcast::channel('presence-chat', ...)
 *
 * @param {Echo} echo - экземпляр laravel-echo
 * @returns {PresenceChannel|null}
 */
export function setupUserPresenceChannel(echo) {
    if (!echo) {
        log.warn('Echo не передан, подписка отменена')
        return null
    }

    try {
        // join('chat') → presence-chat
        const presenceChannel = echo.join('chat')

        presenceChannel
            .here((users) => {
                log.info(`Онлайн: ${users.length}`)
                users.forEach((u) => setUserOnline(u.id))
            })
            .joining((user) => {
                log.info(`Вошёл: ${user.id} (${user.name || ''})`)
                setUserOnline(user.id)
            })
            .leaving((user) => {
                log.info(`Вышел: ${user.id}`)
                setUserOffline(user.id)
            })
            .error((err) => {
                log.error('Ошибка presence-канала: ' + JSON.stringify(err))
            })

        return presenceChannel
    } catch (e) {
        log.error('Не удалось подписаться: ' + e.message)
        return null
    }
}

function setUserOnline(userId) {
    const store = getContactStore()
    if (!store) return

    if (!store.onlineUsers.includes(userId)) {
        store.setOnline(userId)
    }
}

function setUserOffline(userId) {
    const store = getContactStore()
    if (!store) return

    store.setOffline(userId)
}

function getContactStore() {
    try {
        return useContactStore()
    } catch (e) {
        log.error('contactStore недоступен: ' + e.message)
        return null
    }
}
