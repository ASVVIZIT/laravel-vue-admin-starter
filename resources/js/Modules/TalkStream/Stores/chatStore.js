import { defineStore } from 'pinia'
import TalkService from '@/modules/TalkStream/Services/talkService'
import { useContactStore } from '@/modules/TalkStream/Stores/contactStore'

export const useChatStore = defineStore('chat', {
    state: () => ({
        /**
         * Текущий список сообщений (для UI)
         */
        messages: [],
        /**
         * Кэшированная история чатов
         * key: `${userId}_${contactId}`
         */
        history: {},
        /**
         * Статусы прочтения
         */
        readStatus: {},
        /**
         * API-сервис
         */
        talkService: new TalkService()
    }),

    actions: {
        // Получаем contactStore только внутри actions
        getContactStore() {
            try {
                const contactStore = useContactStore()
                return contactStore
            } catch (e) {
                console.error('[chatStore] Не удалось получить контакт-стор:', e)
                throw new Error('ContactStore ещё не доступен')
            }
        },

        // ———————————————————————
        // Добавление временного сообщения
        // ———————————————————————
        addLocalMessage(message) {
            console.log('[chatStore] Добавлено локальное сообщение с проверкой на дубли:', message)

            if (!this.messages.some(m => m.id === message.id)) {
                this.messages.push(message)
            }
        },

        // ———————————————————————
        // Отправка сообщения на сервер
        // ———————————————————————
        async sendMessage(content, to_id) {
            const contactStore = this.getContactStore()

            const tempMessage = {
                id: Date.now(),
                content,
                from_id: contactStore.userId,
                to_id,
                created_at: new Date().toISOString(),
                isLocal: true
            }

            this.addLocalMessage(tempMessage)

            try {
                const res = await this.talkService.sendMessage(content, to_id)
                this.replaceLocalMessage(tempMessage.id, res.data)
                return res.data
            } catch (err) {
                console.error('[chatStore] Ошибка отправки:', err)
                this.removeLocalMessage(tempMessage.id)
                throw err
            }
        },

        // ———————————————————————
        // Загрузка истории с сервера
        // ———————————————————————
        async loadHistory(contactId) {
            const contactStore = this.getContactStore()
            const userId = contactStore.userId
            const key = this.getHistoryKey(userId, contactId)

            if (this.history[key]) {
                this.messages = [...this.history[key]]
                console.log(`[chatStore] Использована кэшированная история для ${contactId}`)
                return
            }

            try {
                const res = await this.talkService.getHistory(contactId)
                this.history[key] = res.data
                this.messages = res.data
                console.log(`[chatStore] История загружена для ${contactId}`, res.data)
            } catch (err) {
                console.error(`[chatStore] Ошибка загрузки истории для ${contactId}:`, err)
                this.messages = []
            }
        },

        // ———————————————————————
        // Обновление локального сообщения
        // ———————————————————————
        replaceLocalMessage(tempId, serverMessage) {
            const index = this.messages.findIndex(m => m.id === tempId)
            if (index !== -1) {
                this.messages[index] = serverMessage
                this.messages = [...this.messages]
                console.log(`[chatStore] Сообщение ${tempId} обновлено`, serverMessage)
            }
        },

        // ———————————————————————
        // Удаление локального сообщения
        // ———————————————————————
        removeLocalMessage(tempId) {
            this.messages = this.messages.filter(m => m.id !== tempId)
            console.log(`[chatStore] Локальное сообщение ${tempId} удалено`)
        },

        // ———————————————————————
        // Получение ключа для кэша
        // ———————————————————————
        getHistoryKey(userId, contactId) {
            return [userId, contactId].sort((a, b) => a - b).join('_')
        },

        // ———————————————————————
        // Отметка сообщений как прочитанных
        // ———————————————————————
        markAsRead(contactId) {
            const contactStore = this.getContactStore()
            const userId = contactStore.userId

            this.messages.forEach(m => {
                if (m.to_id === userId && m.from_id === contactId && !m.read_at) {
                    m.read_at = new Date().toISOString()
                    m.read = true
                }
            })

            const key = this.getHistoryKey(userId, contactId)
            this.history[key] = this.messages.map(m => ({ ...m }))
            console.log(`[chatStore] Сообщения с ${contactId} отмечены как прочитанные`)
        }
    }
})
