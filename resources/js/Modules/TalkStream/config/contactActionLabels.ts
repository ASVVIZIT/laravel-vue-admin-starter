/**
 * Тексты действий/кнопок в списке контактов.
 *
 * Бизнес-логика дружбы живёт в friendStore/backend.
 * Здесь только подписи для состояний кнопки.
 */

export type ContactActionState =
    | 'friend'
    | 'incoming'
    | 'sent'
    | 'add'

export interface ContactActionLabelSet {
    labels: Record<ContactActionState, string>

    hints: {
        incoming: string
        incomingFallback: string
        sent: string
        sentFallback: string
    }

    titles: Record<ContactActionState, string>

    hintTitles: {
        incoming: string
        incomingFallback: string
        sent: string
        sentFallback: string
        friend: string
        add: string
    }
}

export const contactActionLabelsRu: ContactActionLabelSet = {
    labels: {
        friend: 'В друзьях',
        incoming: 'Принять',
        sent: 'Добавить',
        add: 'Добавить',
    },

    hints: {
        incoming: 'Вам {date}',
        incomingFallback: 'Вам отправили',
        sent: 'Отправлено {date}',
        sentFallback: 'Отправлено',
    },

    titles: {
        friend: 'Уже в друзьях',
        incoming: 'Принять заявку в друзья',
        sent: 'Заявка уже отправлена',
        add: 'Добавить в друзья',
    },

    hintTitles: {
        incoming: 'Входящая заявка от {date}',
        incomingFallback: 'Входящая заявка',
        sent: 'Исходящая заявка отправлена {date}',
        sentFallback: 'Исходящая заявка',
        friend: 'Уже в друзьях',
        add: 'Добавить в друзья',
    },
}

export type ContactActionLabels = ContactActionLabelSet

export const contactActionLabels: ContactActionLabels = contactActionLabelsRu
