import { defineStore } from 'pinia'
import { TalkStreamAPI } from '@/modules/TalkStream/Api/talkStreamApi'
import type { Message, MessageStatus } from '@/modules/TalkStream/Types/talkStreamType'
import { userStore } from '@/store/userStore'
import { useContactStore } from '@/modules/TalkStream/Stores/contactStore'

export const useChatStore = defineStore('chat', {
    state: () => ({
        messages: [] as Message[],
        history: {} as Record<string, Message[]>,
        readStatus: {} as Record<string, boolean>,
        isTyping: false as boolean,
    }),

    actions: {
        async loadHistory(contactId: number): Promise<void> {
            const uStore = userStore()
            const userId = uStore.id

            if (!userId) {
                console.error('[ChatStore] User ID not loaded')
                return
            }

            const cacheKey = `${userId}_${contactId}`

            if (this.history[cacheKey] && this.history[cacheKey].length > 0) {
                this.messages = this.history[cacheKey]
                return
            }

            try {
                const response = await TalkStreamAPI.getHistory(contactId)
                if (response.data) {
                    const enrichedMessages = response.data.map((msg) => ({
                        ...msg,
                        is_mine: msg.from_id === userId,
                        isLocal: false,
                        status: (msg.read_at ? 'read' : 'delivered') as MessageStatus
                    }))

                    this.history[cacheKey] = enrichedMessages
                    this.messages = enrichedMessages
                } else {
                    this.messages = []
                    this.history[cacheKey] = []
                }
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error'
                console.error('[ChatStore] Failed to load history:', errorMessage)
                this.messages = []
            }
        },

        async sendMessage(to_id: number, content: string): Promise<void> {
            const uStore = userStore()
            const userId = uStore.id

            if (!userId || !content.trim()) return

            const tempId = -Date.now()

            const tempMessage: Message = {
                id: tempId,
                from_id: userId,
                to_id: to_id,
                content: content,
                type: 'text',
                created_at: new Date().toISOString(),
                is_mine: true,
                isLocal: true,
                status: 'sending'
            }

            this.messages.push(tempMessage)

            try {
                const response = await TalkStreamAPI.sendMessage(to_id, content)

                if (response.data) {
                    this.replaceLocalMessage(tempId, {
                        ...response.data,
                        status: 'delivered'
                    })
                }
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error'
                console.error('[ChatStore] Failed to send message:', errorMessage)
                // 🔥 ИСПРАВЛЕНО (проблема 3): вместо тихого удаления — помечаем как failed,
                // чтобы пузырь остался на экране с ✖ и возможностью повторной отправки.
                this.markFailed(tempId)
            }
        },

        replaceLocalMessage(tempId: number, realMessage: Message): void {
            // 🔥 Строгое приведение к Number, чтобы найти временный ID
            const index = this.messages.findIndex(m => Number(m.id) === Number(tempId))

            if (index !== -1) {
                const enrichedMessage = {
                    ...realMessage,
                    is_mine: true,
                    isLocal: false,
                    status: (realMessage.status || 'delivered') as MessageStatus
                }

                // Заменяем элемент в массиве (удаляем временный, вставляем реальный)
                this.messages.splice(index, 1, enrichedMessage)

                const uStore = userStore()
                const userId = uStore.id
                const contactId = realMessage.to_id === userId ? realMessage.from_id : realMessage.to_id
                const cacheKey = `${userId}_${contactId}`

                if (this.history[cacheKey]) {
                    const histIndex = this.history[cacheKey].findIndex(m => Number(m.id) === Number(tempId))
                    if (histIndex !== -1) {
                        this.history[cacheKey].splice(histIndex, 1, enrichedMessage)
                    }
                }
            }
        },

        removeLocalMessage(tempId: number): void {
            this.messages = this.messages.filter(m => Number(m.id) !== Number(tempId))

            const uStore = userStore()
            const userId = uStore.id
            for (const key in this.history) {
                const msgIndex = this.history[key].findIndex(m => Number(m.id) === Number(tempId))
                if (msgIndex !== -1) {
                    this.history[key].splice(msgIndex, 1)
                    break
                }
            }
        },

        addIncomingMessage(message: Message): void {
            const uStore = userStore()
            const userId = uStore.id
            const contactStore = useContactStore()

            if (this.messages.some(m => Number(m.id) === Number(message.id))) {
                return
            }

            const msgWithStatus = {
                ...message,
                is_mine: message.from_id === userId,
                isLocal: false,
                status: (message.read_at ? 'read' : 'delivered') as MessageStatus
            }

            const contactId = message.from_id === userId ? message.to_id : message.from_id
            const cacheKey = `${userId}_${contactId}`

            if (contactStore.selectedContact?.id === contactId) {
                this.messages.push(msgWithStatus)
            }

            if (this.history[cacheKey]) {
                this.history[cacheKey].push(msgWithStatus)
            } else {
                this.history[cacheKey] = [msgWithStatus]
            }
        },

        addLocalMessage(message: Message): void {
            const uStore = userStore()
            const userId = uStore.id
            const enrichedMessage = {
                ...message,
                is_mine: message.from_id === userId,
                isLocal: true,
                status: 'sending' as MessageStatus
            }
            this.messages.push(enrichedMessage)
        },

        clearCurrentChat(): void {
            this.messages = []
        },

        markAsRead(contactId: number): void {
            const uStore = userStore()
            const userId = uStore.id
            const now = new Date().toISOString()
            let updated = false

            // 🔥 Мутация ВХОДЯЩИХ (сообщения, которые мне написали).
            // Используется TalkStreamHistory при скролле/клике, чтобы мгновенно
            // сбросить счётчик непрочитанных на МОЁМ экране.
            // Сетевой POST /read (чтобы бэкенд проставил read_at и разослал
            // MessageRead отправителю) замыкается в TalkStreamHistory (шаг 3),
            // т.к. требует подтверждения пути в api/talkstream.ts.
            this.messages.forEach(m => {
                if (m.to_id === userId && m.from_id === contactId && m.status !== 'read') {
                    m.status = 'read'
                    m.read_at = now
                    updated = true
                }
            })

            if (updated) {
                const cacheKey = `${userId}_${contactId}`
                if (this.history[cacheKey]) {
                    this.history[cacheKey].forEach(m => {
                        if (m.to_id === userId && m.from_id === contactId && m.status !== 'read') {
                            m.status = 'read'
                            m.read_at = now
                        }
                    })
                }
            }
        },

        // 🔥 НОВОЕ (проблема 1в): мутация ИСХОДЯЩИХ (сообщения, которые Я отправил).
        // Вызывается из chatEventsHandler на событие MessageRead, которое прилетает
        // ОТПРАВИТЕЛЮ. Старый markAsRead резал только входящие, поэтому синие галочки
        // у отправителя никогда не загорались.
        markSentAsRead(contactId: number): void {
            const uStore = userStore()
            const userId = uStore.id
            const now = new Date().toISOString()
            let updated = false

            this.messages.forEach(m => {
                if (m.from_id === userId && m.to_id === contactId && m.status !== 'read') {
                    m.status = 'read'
                    m.read_at = now
                    updated = true
                }
            })

            if (updated) {
                const cacheKey = `${userId}_${contactId}`
                if (this.history[cacheKey]) {
                    this.history[cacheKey].forEach(m => {
                        if (m.from_id === userId && m.to_id === contactId && m.status !== 'read') {
                            m.status = 'read'
                            m.read_at = now
                        }
                    })
                }
            }
        },

        // 🔥 НОВОЕ (проблема 3): пометка исходящего как failed вместо удаления.
        markFailed(tempId: number): void {
            const target = this.messages.find(m => Number(m.id) === Number(tempId))
            if (!target) return

            target.status = 'failed'
            target.isLocal = true

            const uStore = userStore()
            const userId = uStore.id
            const contactId = target.to_id === userId ? target.from_id : target.to_id
            const cacheKey = `${userId}_${contactId}`

            if (this.history[cacheKey]) {
                const histMsg = this.history[cacheKey].find(m => Number(m.id) === Number(tempId))
                if (histMsg) {
                    histMsg.status = 'failed'
                    histMsg.isLocal = true
                }
            }
        },

        // 🔥 НОВОЕ (проблема 3): повторная отправка failed-сообщения.
        // Берёт сохранённые content/to_id из пузыря, зовёт ПОДТВЕРЖДЁННО рабочий
        // TalkStreamAPI.sendMessage (без угадывания путей), при успехе заменяет
        // на реальный id, при ошибке снова ставит failed. UX: клик по ✖ переотправляет молча.
        async retryMessage(tempId: number): Promise<void> {
            const uStore = userStore()
            const userId = uStore.id

            const failed = this.messages.find(m => Number(m.id) === Number(tempId))
            if (!failed || failed.status !== 'failed') return

            // Возвращаем в sending
            failed.status = 'sending'
            failed.isLocal = true

            try {
                const response = await TalkStreamAPI.sendMessage(failed.to_id, failed.content)

                if (response.data) {
                    this.replaceLocalMessage(tempId, {
                        ...response.data,
                        status: 'delivered'
                    })
                }
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error'
                console.error('[ChatStore] Retry failed:', errorMessage)
                this.markFailed(tempId)
            }
        },

        reset(): void {
            this.messages = []
            this.history = {}
            this.readStatus = {}
            this.isTyping = false
        }
    },

    getters: {
        messageCount: (state): number => state.messages.length,
        lastMessage: (state): Message | undefined => state.messages[state.messages.length - 1],
        unreadCount: (state): number => {
            const uStore = userStore()
            const userId = uStore.id
            return state.messages.filter(m => m.to_id === userId && m.status !== 'read').length
        }
    }
})
