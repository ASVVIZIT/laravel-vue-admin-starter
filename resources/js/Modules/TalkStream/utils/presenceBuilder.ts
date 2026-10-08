import type { Contact } from '@/modules/TalkStream/types'
import type { PresenceStatus, PresenceViewModel } from '@/modules/TalkStream/types/presence'

export interface PresenceFlags {
    isOnline?: boolean
    isTyping?: boolean
    isInChat?: boolean | null
    status?: PresenceStatus
    lastActiveAt?: string | null
    lastLeftAt?: string | null
    lastLoginAt?: string | null
}

/**
 * Собирает PresenceViewModel из Contact и внешних флагов.
 *
 * Чистая функция:
 *   - не ходит в API;
 *   - не читает Pinia;
 *   - не знает про Vue;
 *   - не форматирует текст.
 */
export function buildPresenceViewModel(
    contact: Contact | null | undefined,
    flags: PresenceFlags = {},
): PresenceViewModel | null {
    if (!contact) {
        return null
    }

    const isOnline = Boolean(flags.isOnline || contact.is_online)

    const status: PresenceStatus =
        flags.status ?? (isOnline ? 'online' : 'offline')

    return {
        userId: contact.id,
        status,
        isOnline,
        isInChat: flags.isInChat ?? isOnline,
        isTyping: Boolean(flags.isTyping),
        lastActiveAt: flags.lastActiveAt ?? contact.last_seen_at ?? null,
        lastLeftAt: flags.lastLeftAt ?? null,
        lastLoginAt: flags.lastLoginAt ?? null,
    }
}
