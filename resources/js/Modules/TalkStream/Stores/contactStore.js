import { defineStore } from 'pinia';
import TalkService from '@/modules/TalkStream/Services/talkService';
import { userStore } from '@/store/userStore';
import { friendStore } from '@/modules/TalkStream/Stores/friendStore'

// 🔥 Выносим экземпляр класса из state
const talkService = new TalkService();

export const useContactStore = defineStore('contact', {
    state: () => ({
        contacts: [],
        onlineUsers: [],
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
                const res = await talkService.getUserId()
                this.userId = res?.data?.id ?? null
            } catch (e) {
                console.error('[contactStore] Не удалось получить ID пользователя:', e?.message)
                this.userId = null
            }
        },

        async loadContacts() {
            try {
                const res = await talkService.getContacts({}, 'contacts')
                this.contacts = Array.isArray(res?.data) ? res.data : []
            } catch (e) {
                console.error('[contactStore] Ошибка загрузки контактов:', e)
                this.contacts = []
            }
        },

        selectContact(contact) {
            if (!contact?.id) {
                console.warn('[ContactStore] Попытка выбрать контакт без id')
                return
            }
            this.selectedContact = contact
            try {
                localStorage.setItem('last-selected-contact', String(contact.id))
            } catch (e) {
                console.warn('[ContactStore] Не удалось сохранить в localStorage')
            }
            console.log('[ContactStore] Выбран контакт:', contact.id)
        },

        async getContact(id) {
            if (!id) {
                console.warn('[ContactStore] getContact вызван без id')
                return null
            }

            try {
                const res = await talkService.get(id, 'contacts')
                const contact = res?.data
                if (!contact) return null

                const index = this.contacts.findIndex(c => c.id === contact.id)

                if (index >= 0) {
                    this.contacts[index] = contact
                } else {
                    this.contacts.push(contact)
                }

                return contact
            } catch (e) {
                console.error('[ContactStore] Ошибка getContact:', e?.message)
                return null
            }
        },

        // 🔥 useFriendStore теперь импортирован
        getFriendsOnly() {
            try {
                const friend = friendStore()  // ← Правильный вызов
                return this.contacts.filter(c => friend.isFriend(c?.id))
            } catch (e) {
                console.error('[ContactStore] Ошибка getFriendsOnly:', e?.message)
                return []
            }
        },

        async getIncomingRequests() {
            try {
                const res = await talkService.getIncomingFriends({}, 'friends/incoming')
                return Array.isArray(res?.data) ? res.data : []
            } catch (e) {
                console.error('[ContactStore] Ошибка getIncomingRequests:', e?.message)
                return []
            }
        },

        async getFriendsList() {
            try {
                const res = await talkService.getFriendsList()
                return Array.isArray(res?.data) ? res.data : []
            } catch (e) {
                console.error('[ContactStore] Ошибка getFriendsList:', e?.message)
                return []
            }
        },

        setOnline(userId) {
            if (!userId) return
            if (!this.onlineUsers.includes(userId)) {
                this.onlineUsers.push(userId)
            }
        },

        setOffline(userId) {
            if (!userId) return
            this.onlineUsers = this.onlineUsers.filter(id => id !== userId)
        },

        isOnline(userId) {
            if (!userId) return false
            return this.onlineUsers.includes(userId)
        },

        // доступ к userStor refreshUserFrom
        async refreshUserFrom() {
            try {
                const store = userStore()
                await store.fetchInfo()

                // ✅ Правильный доступ к свойствам userStore
                this.userFrom = {
                    id: store.id,           // ✅ ref → store.id (не store.user.id)
                    name: store.name,       // ✅ ref → store.name
                    avatar: store.avatar,   // ✅ ref → store.avatar
                    email: store.email,     // ✅ ref → store.email
                    roles: Array.isArray(store.roles) ? store.roles : []
                }
            } catch (e) {
                console.error('[ContactStore] Ошибка refreshUserFrom:', e?.message)
                this.userFrom = {
                    id: null, name: '', avatar: '', email: '', roles: []
                }
            }
        }
    },

    getters: {
        isContactSelected: (state) => (contactId) => {
            if (!contactId || !state.selectedContact) return false
            return state.selectedContact.id === contactId
        }
    }
})
