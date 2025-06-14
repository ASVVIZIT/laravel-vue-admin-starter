// resources/js/modules/TalkStream/Stores/contactStore.js

import { defineStore } from 'pinia'
import TalkService from '@/modules/TalkStream/Services/talkService'
import {friendStore} from "@modules/TalkStream/Stores/friendStore.js";
import { userStore } from '@/store/user'
const useFriendStore = friendStore()
const useUserStore = userStore()
export const useContactStore = defineStore('contact', {
    state: () => ({
        contacts: [],
        onlineUsers: [],
        talkService: new TalkService(),
        userId: null,
        userFrom: updateUserFrom(),
    }),
    actions: {

        // Загрузка ID текущего пользователя
        async loadUserId() {
            try {
                const res = await this.talkService.getUserId()
                this.userId = res.data.id
            } catch (e) {
                console.error('[contactStore] Не удалось получить ID пользователя')
                this.userId = null
            }
        },

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
            const res = await this.talkService.get(id, 'contacts')
            this.contacts.push(res.data)
            return res.data
        },

        getFriendsOnly() {
            return this.contacts.filter(c => useFriendStore.isFriend(c.id))
        },

        async getIncomingRequests() {
            const res = await this.talkService.getIncomingFriends({}, 'friends/incoming')
            return res.data
        },
        async getFriendsList() {
            const res = await this.talkService.getFriendsList()
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
        },
        async refreshUserFrom() {
            await useUserStore.getInfo()
            this.userFrom = updateUserFrom()
        }
    },
})
function updateUserFrom() {
    return {
        id: useUserStore.id,
        name: useUserStore.name,
        avatar: useUserStore.avatar,
        email: useUserStore.email,
        roles: useUserStore.roles
    }
}
