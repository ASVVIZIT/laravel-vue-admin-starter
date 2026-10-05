import { useChatStore } from '@/modules/TalkStream/Stores/chatStore'
import type { Message } from '@/modules/TalkStream/types'
import logger from '@/modules/TalkStream/utils/logger'

interface NewMessagePayload {
    message: Message
}

interface MessageReadPayload {
    from_id: number
    to_id: number
    updated_count: number
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
            logger.info(`[ChatEvents] Messages marked as read by ${e.from_id}`)
            chatStore.markAsRead(e.from_id)
        })

        return { userChannel, readChannel }
    } catch (error) {
        logger.error('[ChatEvents] Setup failed:', (error as Error)?.message)
        return null
    }
}
