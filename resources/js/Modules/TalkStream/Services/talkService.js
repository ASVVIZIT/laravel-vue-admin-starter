import TalkResource from '@/modules/TalkStream/Services/talkResource'

export default class TalkService extends TalkResource {
    constructor() {
        super('talkstream') // Базовый URI: /talkstream
    }

    getUserId(query = {}, path = 'user') {
        return this.list(query, path) // GET /talkstream/user
    }

    getContacts(query = {}, path = 'contacts') {
        return this.list(query, path) // GET /talkstream/contacts
    }

    getIncomingFriendsRequest(query = {}, path = 'friends/incoming') {
        return this.list(query, path) // GET /talkstream/friends/incoming
    }

    getFriendsList(path = 'friends') {
        return this.list({}, path) // GET /talkstream/friends
    }

    isFriend(userId, path = 'friends/is-friend') {
        return this.get(userId, path) // GET /talkstream/friends/is-friend/{userId}
    }

    sendFriendRequest(friend_id, path = 'friends/send') {
        return this.store({ friend_id }, path) // POST /talkstream/friends/send
    }

    acceptFriendRequest(id, path = `friends/accept/${id}`) {
        return this.store({ id }, path) // POST /talkstream/friends/accept/{id}
    }

    getSentRequests(path = 'friends/sent') {
        return this.list({}, path) // GET /talkstream/friends/sent
    }

    getCallHistory(userId, path = 'call/history') {
        return this.get(userId, path) // GET /talkstream/call/history/{userId}
    }

    sendMessage(content, to_id) {
        return this.store({ content, to_id }, 'send') // POST /talkstream/send
    }

    startCall(to_id, type = 'video') {
        return this.store({ to_id, type }, 'call/start') // POST /talkstream/call/start
    }

    endCall() {
        return this.store({}, 'call/end') // POST /talkstream/call/end
    }

    markAsRead(userId, path = `read/${userId}`) {
        return this.store({ userId }, path) // POST /talkstream/read/{userId}
    }

    getHistory(userId, path = 'history') {
        return this.get(userId, path) // GET /talkstream/history/{userId}
    }
}
