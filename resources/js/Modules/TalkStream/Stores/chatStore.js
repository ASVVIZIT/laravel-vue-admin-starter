// resources/js/modules/TalkStream/Stores/chatStore.js
import { defineStore } from 'pinia'
import TalkService from '@/modules/TalkStream/Services/talkService'

export const useChatStore = defineStore('chat', {
    state: () => ({
        messages: [],
        talkService: new TalkService()
    }),
    actions: {
        addMessage(message) {
            this.messages.push(message)
        },
        async sendMessage(content, to_id) {
            await this.talkService.sendMessage(content, to_id)
        },
        async loadHistory(userId) {
            const response = await this.talkService.getHistory(userId, 'history')
            this.messages = response.data
        }
    }
})
