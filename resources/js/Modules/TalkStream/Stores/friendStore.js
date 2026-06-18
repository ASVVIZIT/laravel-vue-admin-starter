import { defineStore } from 'pinia'
import TalkService from '@/modules/TalkStream/Services/talkService'

// 🔥 Выносим экземпляр класса из state
const talkService = new TalkService()

export const friendStore = defineStore('friend', {
    state: () => ({
        friendRequests: [],
        friends: [],              // Массив ID друзей (числа)
        incomingRequests: [],     // Массив объектов запросов
        sentRequests: [],         // Массив ID исходящих запросов (числа)
    }),

    actions: {
        async sendRequest(friendId) {
            if (!friendId) {
                console.warn('[friendStore] sendRequest: friendId не указан')
                return
            }

            try {
                const res = await talkService.sendFriendRequest(friendId)
                if (res?.data) {
                    this.sentRequests.push(Number(friendId))
                }
            } catch (e) {
                console.error('[friendStore] sendRequest error:', e?.message)
            }
        },

        async acceptRequest(id) {
            if (!id) {
                console.warn('[friendStore] acceptRequest: id не указан')
                return
            }

            try {
                await talkService.acceptFriendRequest(id)
                this.incomingRequests = this.incomingRequests.filter(r => r?.id !== id)
            } catch (e) {
                console.error('[friendStore] acceptRequest error:', e?.message)
            }
        },

        async loadIncomingRequests() {
            try {
                console.log('[friendStore] Запрашиваем входящие запросы...')
                const res = await talkService.getIncomingFriendsRequest()
                const data = Array.isArray(res?.data) ? res.data : []
                console.log('[friendStore] Получено входящих запросов:', data.length)
                this.incomingRequests = data
            } catch (e) {
                console.error('[friendStore] loadIncomingRequests error:', e?.message)
                this.incomingRequests = []
            }
        },

        async loadSentRequests() {
            try {
                console.log('[friendStore] Запрашиваем исходящие запросы...')
                const res = await talkService.getSentRequests()
                const data = Array.isArray(res?.data) ? res.data : []
                console.log('[friendStore] Получено исходящих запросов:', data.length)
                // 🔥 Сохраняем ID (числа), не объекты
                this.sentRequests = data.map(r => Number(r?.id)).filter(Boolean)
            } catch (e) {
                console.error('[friendStore] loadSentRequests error:', e?.message)
                this.sentRequests = []
            }
        },

        async loadFriendsList() {
            try {
                console.log('[friendStore] Запрашиваем список друзей...')
                const res = await talkService.getFriendsList()
                const data = Array.isArray(res?.data) ? res.data : []
                console.log('[friendStore] Получено друзей:', data.length)
                this.friends = data.map(f => Number(f?.id)).filter(Boolean)
            } catch (e) {
                console.error('[friendStore] loadFriendsList error:', e?.message)
                this.friends = []
            }
        },

        // 🔥 ПЕРЕИМЕНОВАНО: было isFriend (async) → checkFriendWithServer
        async checkFriendWithServer(userId) {
            if (!userId) return false

            try {
                const isCached = this.friends.includes(Number(userId))
                if (isCached) return true

                const res = await talkService.isFriend(userId)
                if (res?.data?.isFriend) {
                    this.friends.push(Number(userId))
                    return true
                }
                return false
            } catch (e) {
                console.error('[friendStore] checkFriendWithServer error:', e?.message)
                return false
            }
        },

        // 🔥 ОСТАВЛЁН как есть (sync версия)
        isFriend(userId) {
            const id = Number(userId)
            if (isNaN(id)) return false
            return this.friends.includes(id)
        },

        // 🔥 ИСПРАВЛЕНО: сравниваем id объекта, а не сам объект
        hasIncoming(userId) {
            const id = Number(userId)
            if (isNaN(id)) return false
            return this.incomingRequests.some(r => r?.id === id)
        },

        hasSent(userId) {
            const id = Number(userId)
            if (isNaN(id)) return false
            return this.sentRequests.includes(id)
        },

        addFriend(userId) {
            const id = Number(userId)
            if (isNaN(id)) return
            if (!this.friends.includes(id)) {
                this.friends.push(id)
            }
        },

        addIncoming(userId) {
            const id = Number(userId)
            if (isNaN(id)) return
            if (!this.incomingRequests.some(r => r?.id === id)) {
                this.incomingRequests.push({ id })
            }
        },

        removeSent(userId) {
            const id = Number(userId)
            if (isNaN(id)) return
            this.sentRequests = this.sentRequests.filter(uid => uid !== id)
        },

        removeIncoming(userId) {
            const id = Number(userId)
            if (isNaN(id)) return
            this.incomingRequests = this.incomingRequests.filter(r => r?.id !== id)
        },

        isPending(userId) {
            const id = Number(userId)
            if (isNaN(id)) return false
            return this.sentRequests.includes(id)
        },

        // 🔥 НОВЫЙ: полная очистка (для logout)
        reset() {
            this.friendRequests = []
            this.friends = []
            this.incomingRequests = []
            this.sentRequests = []
        }
    },

    getters: {
        friendsCount: (state) => state.friends.length,
        incomingCount: (state) => state.incomingRequests.length,
        sentCount: (state) => state.sentRequests.length,
    }
})
