import { defineStore } from 'pinia';
import TalkService from '@/modules/TalkStream/Services/talkService';
import { userStore } from '@/store/userStore';

export const useContactStore = defineStore('contact', {
    state: () => ({
        contacts: [],
        onlineUsers: [], // Список ID пользователей онлайн
        talkService: new TalkService(),
        selectedContact: null,
        userId: null,
        userFrom: {
            id: null,
            name: '',
            avatar: '',
            email: '',
            roles: []
        }
    }),
    actions: {
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

        selectContact(contact) {
            this.selectedContact = contact
            localStorage.setItem('last-selected-contact', contact.id)
            console.log('[ContactStore] Выбран контакт:', contact.id)
        },

        async getContact(id) {
            const res = await this.talkService.get(id, 'contacts')
            const contact = res.data
            const index = this.contacts.findIndex(c => c.id === contact.id)

            if (index >= 0) {
                this.contacts[index] = contact
            } else {
                this.contacts.push(contact)
            }

            return contact
        },

        getFriendsOnly() {
            return this.contacts.filter(c => useFriendStore().isFriend(c.id))
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
            if (!this.onlineUsers.includes(userId)) {
                this.onlineUsers.push(userId)
            }
        },

        setOffline(userId) {
            this.onlineUsers = this.onlineUsers.filter(id => id !== userId)
        },

        isOnline(userId) {
            return this.onlineUsers.includes(userId)
        },

        async refreshUserFrom() {
            const useUserStore = userStore()
            await useUserStore.fetchInfo()

            this.userFrom = {
                id: useUserStore.id,
                name: useUserStore.name,
                avatar: useUserStore.avatar,
                email: useUserStore.email,
                roles: useUserStore.roles
            }
        }
    },
    getters: {
        isContactSelected: (state) => (contactId) => {
            return state.selectedContact?.id === contactId
        }
    }
})
