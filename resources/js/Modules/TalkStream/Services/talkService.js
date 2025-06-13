import Resource from '@/api/resource'
import request from "@utils/request.js";

export default class TalkService extends Resource {
    constructor() {
        super('talkstream') // префикс для всех запросов: /api/talkstream/...
    }

    getContacts(query = {}, path = '') {
        return this.list(query, path)
    }

    getIncomingFriends(query = {}, path = '') {
        return this.list(query, path)
    }

    // Список друзей
    getFriends(query = {}, path = 'friends') {
        return this.list(query, path)
    }

    isFriend(userId) {
        return this.get(userId, 'friends/is-friend')
    }

    // Добавь методы для работы с друзьями
    // Добавить в друзья
    sendFriendRequest(friend_id) {
        return this.store({ friend_id }, 'friends/send')
    }
    async getSentRequests(friend_id) {
        try {
            const res = await this.list({friend_id}, 'friends/sent')
            return res.data.filter(r => r.friend)
        } catch (e) {
            console.error('[TalkService] Не удалось получить исходящие запросы:', e)
            return []
        }
    }

    // Принять запрос в друзья
    acceptFriendRequest(id) {
        return this.store({ id }, `friends/accept/${id}`)
    }

    getFriendsList() {
        return this.list({}, 'friends')
    }

    // Входящие запросы
    getIncomingRequests() {
        return this.list({}, 'friends/incoming')
    }

    getHistory(userId, path = 'history') {
        return this.get(userId, path)
    }

    getCallHistory(userId, path = 'call/history') {
        return this.get(userId, path)
    }

    sendMessage(content, to_id) {
        return this.store({ content, to_id }, 'send')
    }

    startCall(to_id, type = 'video') {
        return this.store({ to_id, type }, 'call/start')
    }

    endCall() {
        return this.store({}, 'call/end')
    }
}
