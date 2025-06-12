import { defineStore } from 'pinia'
import talkService from '@/modules/TalkStream/Services/talkService'

export const useChatStore = defineStore('chat', {
    state: () => ({
        messages: [],
        talkService: new talkService()
    }),
    actions: {
        addMessage(message) {
            console.log('[chatStore] Получено сообщение:', message)
            this.messages.push(message)
        },
        async sendMessage(content, to_id) {
            try {
                await this.talkService.sendMessage(content, to_id)
            } catch (e) {
                console.error('[chatStore] Ошибка отправки:', e)
            }
        },
        async loadHistory(userId) {
            try {
                const response = await this.talkService.getHistory(userId)
                this.messages = response.data
            } catch (e) {
                console.error('[chatStore] Ошибка загрузки истории:', e)
            }
        }
    }
})
