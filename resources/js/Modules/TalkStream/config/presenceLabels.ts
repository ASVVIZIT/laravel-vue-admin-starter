/**
 * Тексты статусов присутствия и пустых состояний шапки.
 *
 * Позже легко заменить на i18n-ключи.
 */

export interface PresenceLabelSet {
    typing: string
    online: string
    away: string
    dnd: string

    invisibleSelf: string
    invisibleOther: string

    notInChat: string

    wasInChat: string
    wasOnline: string
    login: string

    unknown: string

    selectContact: string
    noDialog: string
}

export const presenceLabelsRu: PresenceLabelSet = {
    typing: 'печатает...',
    online: 'в сети',
    away: 'отошёл',
    dnd: 'не беспокоить',

    invisibleSelf: 'невидимка',
    invisibleOther: 'не в сети',

    notInChat: 'не в чате',

    wasInChat: 'не в чате · был(а) в чате {date}',
    wasOnline: 'был(а) в сети {date}',
    login: 'вход: {date}',

    unknown: 'не в сети',

    selectContact: 'Выберите контакт',
    noDialog: 'диалог не выбран',
}

export type PresenceLabels = PresenceLabelSet

export const presenceLabels: PresenceLabels = presenceLabelsRu
