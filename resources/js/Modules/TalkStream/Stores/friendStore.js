// resources/js/modules/TalkStream/Stores/friendStore.js
import { defineStore } from 'pinia'
import TalkService from '@/modules/TalkStream/Services/talkService'

export const friendStore = defineStore('friend', {
    state: () => ({
        friendRequests: [],
        friends: [],
        incomingRequests: [],
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
        async loadFriendsList() {
            const res = await this.talkService.getFriendsList()
            this.friends = res.data.map(f => Number(f.id))
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
        addFriend(userId) {
            if (!this.friends.includes(Number(userId))) {
                this.friends.push(Number(userId))
            }
        },
        addIncoming(userId) {
            if (!this.incomingRequests.includes(Number(userId))) {
                this.incomingRequests.push(Number(userId))
            }
        }
    }
})
