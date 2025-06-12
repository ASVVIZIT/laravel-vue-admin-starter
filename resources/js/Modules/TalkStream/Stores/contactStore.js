import { defineStore } from 'pinia'
import talkService from '@/modules/TalkStream/Services/talkService'

export const useContactStore = defineStore('contact', {
    state: () => ({
        contacts: [],
        onlineUsers: [],
        talkService: new talkService()
    }),
    actions: {
        async loadContacts() {
            try {
                const response = await this.talkService.list()
                this.contacts = response.data
            } catch (e) {
                console.error('[contactStore] Ошибка загрузки контактов:', e)
            }
        },
        setOnline(userId) {
            if (!this.onlineUsers.includes(userId)) this.onlineUsers.push(userId)
        },
        setOffline(userId) {
            this.onlineUsers = this.onlineUsers.filter(id => id !== userId)
        },
        isOnline(userId) {
            return this.onlineUsers.includes(userId)
        }
    }
})
