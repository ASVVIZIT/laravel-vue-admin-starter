// resources/js/Modules/TalkStream/Stores/chatStore.ts

import { defineStore } from 'pinia'
import { TalkStreamAPI } from '../api/talkstream'
import type { Message, ApiResponse } from '../types'
import { useContactStore } from './contactStore'
import { useUserStore } from '@/store/userStore' // Проверьте путь к вашему userStore

export const useChatStore = defineStore('chat', {
    state: () => ({
        /**
         * Текущий список сообщений (активный чат)
         */
        messages: [] as Message[],

        /**
         * Кэш истории чатов: ключ (userId_contactId) -> массив сообщений
         */
        history: {} as Record<string, Message[]>,

        /**
         * Статусы прочтения (отслеживание, какие сообщения прочитаны)
         */
        readStatus: {} as Record<string, boolean>,

        /**
         * Индикатор набора текста (typing)
         */
        isTyping: false as boolean,
    }),

    actions: {
        /**
         * Загрузка истории чата с сервера (с кэшированием)
         */
        async loadHistory(contactId: number) {
            const userStore = useUserStore()
            const userId = userStore.id

            if (!userId) {
                console.error('[ChatStore] User ID not loaded')
                return
            }

            const cacheKey = `${userId}_${contactId}`

            // Если есть в кэше — возвращаем его
            if (this.history[cacheKey]) {
                this.messages = this.history[cacheKey]
                return
            }

            try {
                const response = await TalkStreamAPI.getHistory(contactId)

                if (response.data) {
                    // Обогащаем сообщения флагом is_mine для удобства в UI
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
            } catch (error) {
                console.error('[ChatStore] Failed to load history:', error)
                this.messages = []
            }
        },

        /**
         * Отправка сообщения (Optimistic UI)
         */
        async sendMessage(to_id: number, content: string) {
            const userStore = useUserStore()
            const userId = userStore.id

            if (!userId || !content.trim()) return

            // 1. Создаем временное сообщение (локальное)
            const tempId = Date.now()
            const tempMessage: Message = {
                id: tempId,
                from_id: userId,
                to_id: to_id,
                content: content,
                type: 'text',
                created_at: new Date().toISOString(),
                is_mine: true
            }

            // Добавляем в локальный список сразу
            this.messages.push(tempMessage)
            // Скроллим вниз (логику скролла лучше вынести в компонент, но здесь пока так)

            try {
                // 2. Реальный запрос на сервер
                const response = await TalkStreamAPI.sendMessage(to_id, content)

                if (response.data) {
                    // 3. Заменяем временное сообщение реальным (с новым ID от базы)
                    const realMsg = { ...response.data, is_mine: true }
                    this.replaceLocalMessage(tempId, realMsg)
                }
            } catch (error) {
                // 4. Если ошибка — удаляем временное сообщение
                console.error('[ChatStore] Failed to send message:', error)
                this.removeLocalMessage(tempId)
                // Тут можно добавить уведомление об ошибке
            }
        },

        /**
         * Замена временного сообщения на реальное от сервера
         */
        replaceLocalMessage(tempId: number, realMessage: Message) {
            const index = this.messages.findIndex(m => m.id === tempId)
            if (index !== -1) {
                this.messages[index] = realMessage
                // Сохраняем в кэш истории тоже
                const userStore = useUserStore()
                const contactId = realMessage.to_id === userStore.id ? realMessage.from_id : realMessage.to_id
                const cacheKey = `${userStore.id}_${contactId}`

                if (this.history[cacheKey]) {
                    const histIndex = this.history[cacheKey].findIndex(m => m.id === tempId)
                    if (histIndex !== -1) {
                        this.history[cacheKey][histIndex] = realMessage
                    }
                }
            }
        },

        /**
         * Удаление временного сообщения (при ошибке)
         */
        removeLocalMessage(tempId: number) {
            this.messages = this.messages.filter(m => m.id !== tempId)
        },

        /**
         * Добавление сообщения, полученного по WebSocket
         */
        addIncomingMessage(message: Message) {
            const userStore = useUserStore()
            const msgWithStatus = {
                ...message,
                is_mine: message.from_id === userStore.id
            }

            this.messages.push(msgWithStatus)

            // Обновляем кэш истории
            const contactId = message.from_id === userStore.id ? message.to_id : message.from_id
            const cacheKey = `${userStore.id}_${contactId}`

            if (this.history[cacheKey]) {
                this.history[cacheKey].push(msgWithStatus)
            }
        },

        /**
         * Очистка текущего чата
         */
        clearCurrentChat() {
            this.messages = []
        }
    }
})
