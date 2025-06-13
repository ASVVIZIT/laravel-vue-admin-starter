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
        async sendRequest(friend_id) {
            const res = await this.talkService.sendFriendRequest(friend_id)
            console.log('sendRequest res ', res)
            this.friendRequests.push(res.data)
        },
        async acceptRequest(id) {
            const res = await this.talkService.acceptFriendRequest(id)
            console.log('acceptRequest res ', res)
            this.friends.push(res.data)
        },
        async loadIncomingRequests() {
            const res = await this.talkService.getIncomingRequests()
            console.log('loadIncomingRequests res ', res)
            this.incomingRequests = res.data.map(r => Number(r.user_id))
        },
        async loadSentRequests() {
            const res = await this.talkService.getSentRequests()
            console.log('loadSentRequests res ', res)
            this.sentRequests = res.map(r => Number(r.friend_id))
        },
        async loadFriendsList() {
            const res = await this.talkService.getFriendsList()
            console.log('loadFriendsList res ', res)
            this.friends = res.data.map(f => Number(f.id))
        },

        async isFriend(userId) {
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
            console.log('hasIncoming userId', userId)
            if (isNaN(id)) return false

            console.log('hasIncoming isNaN(id)', isNaN(id))
            return this.incomingRequests.includes(id)
        },
        hasSent(userId) {
            console.log('hasSent userId', userId)
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
