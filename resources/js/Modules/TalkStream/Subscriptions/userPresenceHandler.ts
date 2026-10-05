import { useContactStore } from '@/modules/TalkStream/Stores/contactStore'
import type { PresenceChannel } from 'laravel-echo'
import type Echo from 'laravel-echo'

const log = {
    info: (msg: string): void => console.log(`%c[Presence] ${msg}`, 'color: #1e90ff; font-weight: bold;'),
    warn: (msg: string): void => console.warn(`[Presence] ⚠️ ${msg}`),
    error: (msg: string): void => console.error(`[Presence] ❌ ${msg}`),
}

interface PresenceUser {
    id: number
    name?: string
    // Можно добавить другие поля, если бэкенд передает их (например, avatar)
}

/**
 * Подписка на presence-канал онлайн-статусов.
 *
 * ВАЖНО: echo.join('chat') → фактический канал в Reverb = 'presence-chat'.
 * Echo САМ добавляет префикс 'presence-'.
 * Правило в routes/channels.php: Broadcast::channel('presence-chat', ...)
 *
 * @param echo - экземпляр laravel-echo
 * @returns PresenceChannel | null
 */
export function setupUserPresenceChannel(echo: Echo): PresenceChannel | null {
    if (!echo) {
        log.warn('Echo не передан, подписка отменена')
        return null
    }

    try {
        // join('chat') → presence-chat
        const presenceChannel = echo.join('chat') as PresenceChannel

        presenceChannel
            .here((users: PresenceUser[]) => {
                log.info(`Онлайн: ${users.length}`)
                users.forEach((u) => setUserOnline(u.id))
            })
            .joining((user: PresenceUser) => {
                log.info(`Вошёл: ${user.id} (${user.name || ''})`)
                setUserOnline(user.id)
            })
            .leaving((user: PresenceUser) => {
                log.info(`Вышел: ${user.id}`)
                setUserOffline(user.id)
            })
            .error((err: unknown) => {
                const errorMessage = err instanceof Error ? err.message : JSON.stringify(err)
                log.error('Ошибка presence-канала: ' + errorMessage)
            })

        return presenceChannel
    } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : String(e)
        log.error('Не удалось подписаться: ' + errorMessage)
        return null
    }
}

function setUserOnline(userId: number): void {
    const store = getContactStore()
    if (!store) return

    if (!store.onlineUsers.includes(userId)) {
        store.setOnline(userId)
    }
}

function setUserOffline(userId: number): void {
    const store = getContactStore()
    if (!store) return

    store.setOffline(userId)
}

function getContactStore(): ReturnType<typeof useContactStore> | null {
    try {
        return useContactStore()
    } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : String(e)
        log.error('contactStore недоступен: ' + errorMessage)
        return null
    }
}
