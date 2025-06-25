// resources/js/modules/TalkStream/Stores/friendStore.js
import { defineStore } from 'pinia'
import TalkService from '@/modules/TalkStream/Services/talkService'

export const friendStore = defineStore('friend', {
    state: () => ({
        friendRequests: [],
        friends: [],
        incomingRequests: [],
        sentRequests: [],
        talkService: new TalkService()
    }),
    actions: {
        async sendRequest(friendId) {
            try {
                await this.talkService.sendFriendRequest(friendId).then(res => {
                    this.sentRequests.push(res.data)
                })
            } catch (e) {
                console.error('Не удалось загрузить запросы:', e.message)
                this.sentRequests = []
            }
        },
        async acceptRequest(id) {
            try {
                await this.talkService.acceptFriendRequest(id).then(() => {
                    this.incomingRequests = this.incomingRequests.filter(r => r.id !== id)
                })
            } catch (e) {
                console.error('Не удалось загрузить запросы:', e.message)
                this.incomingRequests = []
            }
        },
        async loadIncomingRequests() {
            try {
                console.log('Запрашиваем входящие запросы в друзья...')
                const res = await this.talkService.getIncomingFriendsRequest()
                console.log('Получено входящих запросов:', res.data.length)
                this.incomingRequests = res.data || []
            } catch (e) {
                console.error('Не удалось загрузить входящие запросы:', e.message)
                this.incomingRequests = []
            }
        },
        async loadSentRequests() {
            try {
                console.log('Запрашиваем исходящие запросы в друзья...')
                const res = await this.talkService.getSentRequests()
                console.log('Получено исходящих запросов:', res.data.length)
                this.sentRequests = res.data || []
            } catch (e) {
                console.error('Не удалось загрузить исходящие запросы:', e.message)
                this.sentRequests = []
            }
        },
        async loadFriendsList() {
            try {
                console.log('Запрашиваем список друзей...')
                const res = await this.talkService.getFriendsList()
                console.log('Получено друзей число:', res.data.length)
                this.friends = res.data.map(f => Number(f.id))
            } catch (e) {
                console.error('Не удалось загрузить друзей:', e.message)
                this.friends = []
            }
        },

        async isFriend(userId) {
            try {
                const isCached = this.friends.includes(Number(userId))
                if (isCached) return true
                console.log('isFriend isCached ', isCached)
                // Если не в кэше — запрос на сервер
                const res = await this.talkService.isFriend(userId)
                console.log('isFriend res ', res)
                if (res.data.isFriend) {
                    this.friends.push(Number(userId))
                }
                console.log('res.data.isFriend ', res.data.isFriend)
                return res.data.isFriend
            } catch (e) {
                console.error('Не удалось определить друзей:', e.message)
            }
        },

        async checkFriend(userId) {
            const isFriend = await this.talkService.isFriend(userId)
            if (isFriend.data.isFriend) {
                this.friends.push(Number(userId))
            }
            console.log('checkFriend ', isFriend.data.isFriend)
            return isFriend.data.isFriend
        },

        isFriend(userId) {
            const id = Number(userId)
            if (isNaN(id)) return false
            return this.friends.includes(id)
        },
        hasIncoming(userId) {
            const id = Number(userId)
            //console.log('hasIncoming userId', userId)
            if (isNaN(id)) return false

            //console.log('hasIncoming isNaN(id)', isNaN(id))
            return this.incomingRequests.includes(id)
        },
        hasSent(userId) {
            //console.log('hasSent userId', userId)
            return this.sentRequests.includes(Number(userId))
        },
        addFriend(userId) {
            const id = Number(userId)
            if (!this.isFriend(id)) {
                this.friends.push(id)
                console.log('addFriend ', this.friends)
            }
        },
        addIncoming(userId) {
            if (!this.incomingRequests.includes(Number(userId))) {
                this.incomingRequests.push(Number(userId))
                console.log('incomingRequests ', this.incomingRequests)
            }
        },

        removeSent(userId) {
            const id = Number(userId)
            this.sentRequests = this.sentRequests.filter(uid => uid !== id)
            console.log('sentRequests ', this.sentRequests)
        },

        removeIncoming(userId) {
            const id = Number(userId)
            this.incomingRequests = this.incomingRequests.filter(uid => uid !== id)
            console.log('incomingRequests ', this.incomingRequests)
        },

        isPending(userId) {
            return this.sentRequests.includes(Number(userId))
        }

    }
})
