/**
 * Форматирование дат присутствия/активности.
 *
 * Не зависит от moment/dayjs, чтобы presence-компонент можно было
 * переиспользовать в любом месте фронтенда без лишних связей.
 *
 * По умолчанию использует часовой пояс проекта:
 *   Asia/Yekaterinburg
 *
 * Позже timeZone можно передавать из appStore / backend config,
 * чтобы не хардкодить зону в компонентах.
 */

export type DateInput = string | number | Date | null | undefined

export interface FormatPresenceDateOptions {
    /**
     * Часовой пояс, например Asia/Yekaterinburg.
     */
    timeZone?: string

    /**
     * Момент "сейчас" для relative-форматов.
     * Удобно для тестов.
     */
    now?: Date

    /**
     * Стиль вывода:
     *
     * relative:
     *   сегодня 14:32
     *   вчера 14:32
     *   08.10 14:32
     *   07.10.2026 14:32
     *
     * absolute:
     *   07.10.2026 14:32
     *
     * date:
     *   07.10.2026
     *
     * time:
     *   14:32
     */
    style?: 'relative' | 'absolute' | 'date' | 'time'

    /**
     * Что возвращать, если дата пустая/битая.
     */
    fallback?: string
}

const DEFAULT_TIME_ZONE = 'Asia/Yekaterinburg'
const DAY_MS = 86_400_000

interface DateParts {
    year: number
    month: number
    day: number
    hour: number
    minute: number
}

function pad(value: number): string {
    return String(value).padStart(2, '0')
}

function toDate(value: DateInput): Date | null {
    if (value === null || value === undefined || value === '') {
        return null
    }

    const date = value instanceof Date ? value : new Date(value)

    return Number.isNaN(date.getTime()) ? null : date
}

function getDateParts(date: Date, timeZone: string): DateParts {
    const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    } as Intl.DateTimeFormatOptions)

    const parts = formatter.formatToParts(date)

    const get = (type: Intl.DateTimeFormatPartTypes): string => {
        return parts.find((part) => part.type === type)?.value ?? '0'
    }

    let hour = Number(get('hour'))

    // В некоторых окружениях hour12:false может отдать 24 для полуночи.
    if (hour === 24) {
        hour = 0
    }

    return {
        year: Number(get('year')),
        month: Number(get('month')),
        day: Number(get('day')),
        hour,
        minute: Number(get('minute')),
    }
}

function dayKey(parts: DateParts): number {
    return Date.UTC(parts.year, parts.month - 1, parts.day)
}

function formatTime(parts: DateParts): string {
    return `${pad(parts.hour)}:${pad(parts.minute)}`
}

function formatDate(parts: DateParts, withYear: boolean): string {
    return `${pad(parts.day)}.${pad(parts.month)}${withYear ? `.${parts.year}` : ''}`
}

/**
 * Основной форматтер.
 *
 * Примеры:
 *   formatPresenceDate('2026-10-08T14:32:00+05:00')
 *   => "сегодня 14:32"
 *
 *   formatPresenceDate(null)
 *   => ""
 */
export function formatPresenceDate(
    value: DateInput,
    options: FormatPresenceDateOptions = {},
): string {
    const {
        timeZone = DEFAULT_TIME_ZONE,
        now = new Date(),
        style = 'relative',
        fallback = '',
    } = options

    const date = toDate(value)

    if (!date) {
        return fallback
    }

    const parts = getDateParts(date, timeZone)
    const nowParts = getDateParts(now, timeZone)

    const time = formatTime(parts)

    if (style === 'time') {
        return time
    }

    if (style === 'date') {
        return formatDate(parts, true)
    }

    if (style === 'absolute') {
        return `${formatDate(parts, true)} ${time}`
    }

    const dateKey = dayKey(parts)
    const nowKey = dayKey(nowParts)

    if (dateKey === nowKey) {
        return `сегодня ${time}`
    }

    if (dateKey === nowKey - DAY_MS) {
        return `вчера ${time}`
    }

    if (parts.year === nowParts.year) {
        return `${formatDate(parts, false)} ${time}`
    }

    return `${formatDate(parts, true)} ${time}`
}
