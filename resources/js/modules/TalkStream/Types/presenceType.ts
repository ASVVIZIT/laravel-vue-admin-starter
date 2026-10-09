/**
 * Презентационные типы статуса присутствия.
 *
 * Это НЕ backend-контракт и НЕ бизнес-логика.
 * Компонент статуса получает уже собранный view model.
 */

export type PresenceStatus =
    | 'online'
    | 'away'
    | 'dnd'
    | 'invisible'
    | 'offline'

export type PresenceVariant =
    | 'header'
    | 'list'
    | 'compact'

/**
 * Тон отображения. Нужен только для CSS-класса/цвета.
 */
export type PresenceTone =
    | 'typing'
    | 'online'
    | 'away'
    | 'dnd'
    | 'invisible'
    | 'offline'
    | 'unknown'

export interface PresenceViewModel {
    /**
     * ID пользователя. Нужен не для рендера, а для отладки/будущих keyed-списков.
     */
    userId?: number | null

    /**
     * Машинный статус присутствия.
     */
    status: PresenceStatus

    /**
     * Быстрый флаг "считаем онлайн".
     */
    isOnline: boolean

    /**
     * Находится ли пользователь именно в чате.
     */
    isInChat?: boolean | null

    /**
     * Печатает ли пользователь прямо сейчас.
     */
    isTyping?: boolean

    /**
     * Последняя активность в чате/приложении.
     */
    lastActiveAt?: string | null

    /**
     * Когда пользователь вышел из чата.
     */
    lastLeftAt?: string | null

    /**
     * Когда пользователь входил в приложение.
     */
    lastLoginAt?: string | null
}
