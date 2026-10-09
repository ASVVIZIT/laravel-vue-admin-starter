import { useChatStore } from '@/modules/TalkStream/Stores/chatStore'
import type { Message } from '@/modules/TalkStream/Types/talkStreamType'
import logger from '@/modules/TalkStream/Utils/loggerTalkStreamUtil'

interface NewMessagePayload {
    message: Message
}

// 🔥 ИСПРАВЛЕНО (форма payload): бэкенд MessageRead::broadcastWith() возвращает
// ['message' => $this->message], т.е. данные ОБЁРНУТЫ в ключ 'message' — ровно как у NewMessage.
// Поле помечено '?', потому что рантайм-гарантии нет: если бэк по какой-то причине не пришлёт
// обёртку — guard ниже спасёт от краша, а не уронит рендер.
interface MessageReadPayload {
    message?: {
        from_id: number
        to_id: number
        updated_count: number
    }
}

export function setupChatEventsChannel(echo: any, myUserId: number) {
    if (!echo || !myUserId) {
        logger.warn('[ChatEvents] Echo or UserId not provided')
        return null
    }

    const chatStore = useChatStore()
    let userChannel: any = null
    let readChannel: any = null

    try {
        // 1. Новые сообщения (Private Channel: user.{id})
        userChannel = echo.private(`user.${myUserId}`)
        userChannel.listen('.NewMessage', (e: NewMessagePayload) => {
            const msg = e.message
            logger.info(`[ChatEvents] New message from ${msg.from_id}:`, msg.content)

            chatStore.addIncomingMessage(msg)
        })

        // 2. Прочтение сообщений (Private Channel: chat.read.{id})
        readChannel = echo.private(`chat.read.${myUserId}`)
        readChannel.listen('.MessageRead', (e: MessageReadPayload) => {
            // 🔥 ИСПРАВЛЕНО (форма): разворачиваем обёртку 'message', как в ветке NewMessage.
            const payload = e.message
            if (!payload) {
                logger.warn('[ChatEvents] MessageRead payload missing "message" wrapper, skipped')
                return
            }

            // 🔥 ИСПРАВЛЕНО (семантика полей + функция):
            // Событие летит на канал chat.read.{from_id} -> toOthers() -> ОТПРАВИТЕЛЮ.
            // Значит myUserId === payload.from_id (это мы), а прочитал СОБЕСЕДНИК = payload.to_id.
            // Красим ИСХОДЯЩИЕ к собеседнику (markSentAsRead), а не входящие (markAsRead):
            // у отправителя в этом диалоге входящих-непрочитанных нет, старый вызов резал пустоту.
            logger.info(`[ChatEvents] Messages marked as read by ${payload.to_id}`)
            chatStore.markSentAsRead(payload.to_id)
        })

        return { userChannel, readChannel }
    } catch (error) {
        logger.error('[ChatEvents] Setup failed:', (error as Error)?.message)
        return null
    }
}
