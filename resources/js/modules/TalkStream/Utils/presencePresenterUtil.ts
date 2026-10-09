import { presenceLabels, type PresenceLabels } from '@/modules/TalkStream/Config/presenceLabelsConfig'
import { formatPresenceDate } from '@/modules/TalkStream/Utils/formatPresenceDateUtil'

import type {
    PresenceTone,
    PresenceVariant,
    PresenceViewModel,
} from '@/modules/TalkStream/Types/presenceType'

export interface PresencePresentation {
    text: string
    tone: PresenceTone
}

export interface PresentPresenceOptions {
    variant?: PresenceVariant
    timeZone?: string
    viewerIsSelf?: boolean
    labels?: PresenceLabels
    emptyText?: string
}

function interpolate(template: string, vars: Record<string, string>): string {
    return template.replace(/\{(\w+)\}/g, (_match, key: string) => {
        return vars[key] ?? ''
    })
}

function formatDate(
    value: string | null | undefined,
    timeZone: string,
): string {
    if (!value) {
        return ''
    }

    return formatPresenceDate(value, {
        timeZone,
        style: 'relative',
        fallback: '',
    })
}

/**
 * Превращает PresenceViewModel в готовый текст и тон.
 *
 * Приоритет:
 *   1. typing
 *   2. dnd
 *   3. away
 *   4. invisible
 *   5. online
 *   6. not in chat + lastLeftAt
 *   7. lastActiveAt
 *   8. lastLoginAt
 *   9. unknown
 */
export function presentPresence(
    presence: PresenceViewModel | null,
    options: PresentPresenceOptions = {},
): PresencePresentation {
    const labels = options.labels ?? presenceLabels
    const variant = options.variant ?? 'header'
    const timeZone = options.timeZone ?? 'Asia/Yekaterinburg'
    const viewerIsSelf = Boolean(options.viewerIsSelf)

    if (!presence) {
        return {
            text: options.emptyText ?? labels.unknown,
            tone: 'unknown',
        }
    }

    if (presence.isTyping) {
        return {
            text: labels.typing,
            tone: 'typing',
        }
    }

    if (presence.status === 'dnd') {
        return {
            text: labels.dnd,
            tone: 'dnd',
        }
    }

    if (presence.status === 'away') {
        return {
            text: labels.away,
            tone: 'away',
        }
    }

    if (presence.status === 'invisible') {
        return {
            text: viewerIsSelf ? labels.invisibleSelf : labels.invisibleOther,
            tone: 'invisible',
        }
    }

    if (presence.status === 'online' || presence.isOnline) {
        return {
            text: labels.online,
            tone: 'online',
        }
    }

    if (presence.isInChat === false) {
        const leftAt = formatDate(presence.lastLeftAt, timeZone)

        if (!leftAt) {
            return {
                text: labels.notInChat,
                tone: 'offline',
            }
        }

        if (variant === 'compact') {
            return {
                text: leftAt,
                tone: 'offline',
            }
        }

        return {
            text: interpolate(labels.wasInChat, { date: leftAt }),
            tone: 'offline',
        }
    }

    const lastActiveAt = formatDate(presence.lastActiveAt, timeZone)

    if (lastActiveAt) {
        if (variant === 'compact') {
            return {
                text: lastActiveAt,
                tone: 'offline',
            }
        }

        return {
            text: interpolate(labels.wasOnline, { date: lastActiveAt }),
            tone: 'offline',
        }
    }

    const lastLoginAt = formatDate(presence.lastLoginAt, timeZone)

    if (lastLoginAt) {
        return {
            text: interpolate(labels.login, { date: lastLoginAt }),
            tone: 'offline',
        }
    }

    return {
        text: options.emptyText ?? labels.unknown,
        tone: 'unknown',
    }
}
