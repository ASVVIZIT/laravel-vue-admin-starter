import { defineStore } from 'pinia'
import { TalkStreamAPI } from '@/modules/TalkStream/api/talkstream'
import type { Message, ApiResponse } from '@/modules/TalkStream/types'
import { userStore } from '@/store/userStore'

export const useChatStore = defineStore('chat', {
    state: () => ({
        messages: [] as Message[],
        history: {} as Record<string, Message[]>,
        readStatus: {} as Record<string, boolean>,
        isTyping: false as boolean,
    }),

    actions: {
        /**
         * Загрузка истории сообщений для контакта
         */
        async loadHistory(contactId: number): Promise<void> {
            const uStore = userStore()
            const userId = uStore.id

            if (!userId) {
                console.error('[ChatStore] User ID not loaded')
                return
            }

            const cacheKey = `${userId}_${contactId}`

            // Если история уже загружена, не делаем запрос
            if (this.history[cacheKey] && this.history[cacheKey].length > 0) {
                this.messages = this.history[cacheKey]
                return
            }

            try {
                const response = await TalkStreamAPI.getHistory(contactId)
                if (response.data) {
                    const enrichedMessages = response.data.map((msg) => ({
                        ...msg,
                        is_mine: msg.from_id === userId
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

        /**
         * Отправка сообщения
         */
        async sendMessage(to_id: number, content: string): Promise<void> {
            const uStore = userStore()
            const userId = uStore.id

            if (!userId || !content.trim()) return

            const tempId = Date.now()
            const tempMessage: Message = {
                id: tempId,
                from_id: userId,
                to_id: to_id,
                content: content,
                type: 'text',
                created_at: new Date().toISOString(),
                is_mine: true,
                isLocal: true
            }

            // Оптимистичное обновление UI
            this.messages.push(tempMessage)

            try {
                const response = await TalkStreamAPI.sendMessage(to_id, content)

                if (response.data) {
                    // Заменяем локальное сообщение на реальное от сервера
                    this.replaceLocalMessage(tempId, response.data)
                }
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error'
                console.error('[ChatStore] Failed to send message:', errorMessage)
                // Удаляем локальное сообщение при ошибке
                this.removeLocalMessage(tempId)
            }
        },

        /**
         * Замена локального сообщения на серверное
         */
        replaceLocalMessage(tempId: number, realMessage: Message): void {
            const index = this.messages.findIndex(m => m.id === tempId)
            if (index !== -1) {
                // Сохраняем флаг isLocal, чтобы UI мог отличить локальные от серверных
                const enrichedMessage = {
                    ...realMessage,
                    is_mine: true,
                    isLocal: false
                }
                this.messages[index] = enrichedMessage

                // Обновляем кэш истории
                const uStore = userStore()
                const userId = uStore.id
                const contactId = realMessage.to_id === userId ? realMessage.from_id : realMessage.to_id
                const cacheKey = `${userId}_${contactId}`

                if (this.history[cacheKey]) {
                    const histIndex = this.history[cacheKey].findIndex(m => m.id === tempId)
                    if (histIndex !== -1) {
                        this.history[cacheKey][histIndex] = enrichedMessage
                    }
                }
            }
        },

        /**
         * Удаление локального сообщения
         */
        removeLocalMessage(tempId: number): void {
            this.messages = this.messages.filter(m => m.id !== tempId)

            // Также удаляем из кэша истории, если там есть
            const uStore = userStore()
            const userId = uStore.id
            for (const key in this.history) {
                const msgIndex = this.history[key].findIndex(m => m.id === tempId)
                if (msgIndex !== -1) {
                    this.history[key].splice(msgIndex, 1)
                    break
                }
            }
        },

        /**
         * Добавление входящего сообщения (через WebSocket)
         */
        addIncomingMessage(message: Message): void {
            const uStore = userStore()
            const userId = uStore.id

            const msgWithStatus = {
                ...message,
                is_mine: message.from_id === userId,
                isLocal: false
            }

            // Если сообщение не для текущего открытого чата, все равно добавляем в историю
            this.messages.push(msgWithStatus)

            const contactId = message.from_id === userId ? message.to_id : message.from_id
            const cacheKey = `${userId}_${contactId}`

            if (this.history[cacheKey]) {
                this.history[cacheKey].push(msgWithStatus)
            } else {
                this.history[cacheKey] = [msgWithStatus]
            }
        },

        /**
         * Добавление локального сообщения (для мгновенного отображения перед отправкой)
         */
        addLocalMessage(message: Message): void {
            const uStore = userStore()
            const userId = uStore.id
            const enrichedMessage = {
                ...message,
                is_mine: message.from_id === userId,
                isLocal: true
            }
            this.messages.push(enrichedMessage)
        },

        /**
         * Очистка текущего чата (при смене контакта)
         */
        clearCurrentChat(): void {
            this.messages = []
        },

        /**
         * Отметка сообщений как прочитанных
         */
        markAsRead(contactId: number): void {
            const uStore = userStore()
            const userId = uStore.id
            const now = new Date().toISOString()

            this.messages.forEach(m => {
                if (m.to_id === userId && m.from_id === contactId && !m.read_at) {
                    m.read_at = now
                }
            })

            // Обновляем кэш истории
            const cacheKey = `${userId}_${contactId}`
            if (this.history[cacheKey]) {
                this.history[cacheKey].forEach(m => {
                    if (m.to_id === userId && m.from_id === contactId && !m.read_at) {
                        m.read_at = now
                    }
                })
            }
        },

        /**
         * Сброс стора
         */
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
            return state.messages.filter(m => m.to_id === userId && !m.read_at).length
        }
    }
})
