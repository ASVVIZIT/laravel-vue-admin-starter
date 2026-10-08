import {
    contactActionLabels,
    type ContactActionLabels,
    type ContactActionState,
} from '@/modules/TalkStream/config/contactActionLabels'

import { formatPresenceDate } from '@/modules/TalkStream/utils/formatPresenceDate'

export interface ContactActionInput {
    isFriend: boolean
    hasIncoming: boolean
    hasSent: boolean
    requestCreatedAt?: string | null
    timeZone?: string
    labels?: ContactActionLabels
}

export interface ContactActionPresentation {
    state: ContactActionState
    label: string
    hint: string
    hintTitle: string
    title: string
    disabled: boolean
}

function interpolate(template: string, vars: Record<string, string>): string {
    return template.replace(/\{(\w+)\}/g, (_match, key: string) => {
        return vars[key] ?? ''
    })
}

function resolveState(input: ContactActionInput): ContactActionState {
    if (input.isFriend) {
        return 'friend'
    }

    if (input.hasIncoming) {
        return 'incoming'
    }

    if (input.hasSent) {
        return 'sent'
    }

    return 'add'
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

function formatFullDate(
    value: string | null | undefined,
    timeZone: string,
): string {
    if (!value) {
        return ''
    }

    return formatPresenceDate(value, {
        timeZone,
        style: 'absolute',
        fallback: '',
    })
}

/**
 * Собирает готовое состояние кнопки действия в контакте.
 */
export function presentContactAction(
    input: ContactActionInput,
): ContactActionPresentation {
    const labels = input.labels ?? contactActionLabels
    const timeZone = input.timeZone ?? 'Asia/Yekaterinburg'
    const state = resolveState(input)

    const relativeDate = formatDate(input.requestCreatedAt, timeZone)
    const absoluteDate = formatFullDate(input.requestCreatedAt, timeZone)

    let hint = ''
    let hintTitle = ''

    switch (state) {
        case 'friend':
            hintTitle = labels.hintTitles.friend
            break

        case 'incoming':
            if (relativeDate) {
                hint = interpolate(labels.hints.incoming, { date: relativeDate })
                hintTitle = absoluteDate
                    ? interpolate(labels.hintTitles.incoming, { date: absoluteDate })
                    : labels.hintTitles.incomingFallback
            } else {
                hint = labels.hints.incomingFallback
                hintTitle = labels.hintTitles.incomingFallback
            }
            break

        case 'sent':
            if (relativeDate) {
                hint = interpolate(labels.hints.sent, { date: relativeDate })
                hintTitle = absoluteDate
                    ? interpolate(labels.hintTitles.sent, { date: absoluteDate })
                    : labels.hintTitles.sentFallback
            } else {
                hint = labels.hints.sentFallback
                hintTitle = labels.hintTitles.sentFallback
            }
            break

        case 'add':
            hintTitle = labels.hintTitles.add
            break
    }

    return {
        state,
        label: labels.labels[state],
        hint,
        hintTitle,
        title: labels.titles[state],
        disabled: state === 'friend' || state === 'sent',
    }
}
