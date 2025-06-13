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
            this.friendRequests.push(res.data)
        },
        async acceptRequest(id) {
            const res = await this.talkService.acceptFriendRequest(id)
            this.friends.push(res.data)
        },
        async loadIncomingRequests() {
            const res = await this.talkService.getIncomingRequests()
            this.incomingRequests = res.data.map(r => Number(r.user_id))
        },
        async loadSentRequests() {
            const res = await this.talkService.getSentRequests()
            console.log('loadSentRequests res ', res)
            this.sentRequests = res.map(r => Number(r.friend_id))
        },
        async loadFriendsList() {
            const res = await this.talkService.getFriendsList()
            this.friends = res.data.map(f => Number(f.id))
        },

        async isFriend(userId) {
            const isCached = this.friends.includes(Number(userId))
            if (isCached) return true

            // Если не в кэше — запрос на сервер
            const res = await this.talkService.isFriend(userId)
            if (res.data.isFriend) {
                this.friends.push(Number(userId))
            }
            return res.data.isFriend
        },

        async checkFriend(userId) {
            const isFriend = await this.talkService.isFriend(userId)
            if (isFriend.data.isFriend) {
                this.friends.push(Number(userId))
            }
            return isFriend.data.isFriend
        },

        isFriend(userId) {
            const id = Number(userId)
            if (isNaN(id)) return false
            return this.friends.includes(id)
        },
        hasIncoming(userId) {
            const id = Number(userId)
            if (isNaN(id)) return false
            return this.incomingRequests.includes(id)
        },
        hasSent(userId) {
            return this.sentRequests.includes(Number(userId))
        },
        addFriend(userId) {
            const id = Number(userId)
            if (!this.isFriend(id)) {
                this.friends.push(id)
            }
        },
        addIncoming(userId) {
            if (!this.incomingRequests.includes(Number(userId))) {
                this.incomingRequests.push(Number(userId))
            }
        },

        removeSent(userId) {
            const id = Number(userId)
            this.sentRequests = this.sentRequests.filter(uid => uid !== id)
        },

        removeIncoming(userId) {
            const id = Number(userId)
            this.incomingRequests = this.incomingRequests.filter(uid => uid !== id)
        },

        isPending(userId) {
            return this.sentRequests.includes(Number(userId))
        }

    }
})
