// resources/js/modules/TalkStream/Stores/contactStore.js
import { defineStore } from 'pinia'
import TalkService from '@/modules/TalkStream/Services/talkService'

export const useContactStore = defineStore('contact', {
    state: () => ({
        contacts: [],
        onlineUsers: [],
        talkService: new TalkService()
    }),
    actions: {
        async loadContacts() {
            try {
                const res = await this.talkService.getContacts({}, 'contacts')
                console.log('res loadContacts', res.data)
                this.contacts = res.data
            } catch (e) {
                console.error('[contactStore] Ошибка загрузки контактов:', e)
            }
        },

        async getContact(id) {
            // Используем существующий сервис
            const res = await this.talkService.get(`contacts/${id}`)
            return res.data
        },

        async getIncomingRequests() {
            const res = await this.talkService.getIncomingFriends({}, 'friends/incoming')
            return res.data
        },
        async getFriendsList() {
            const res = await this.talkService.getFriends({}, 'friends')
            return res.data
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
