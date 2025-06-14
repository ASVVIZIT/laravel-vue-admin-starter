import Resource from '@/api/resource'
import request from "@utils/request.js";

export default class TalkService extends Resource {
    constructor() {
        super('talkstream') // префикс для всех запросов: /api/talkstream/...
    }

    // Получение данных текущего пользователя
    getUserId(query = {}, path = 'user') {
        return this.list(query, path) // GET /api/talkstream/user
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

    isFriend(userId, path = 'friends/is-friend') {
        return this.get(userId, path)
    }

    // Добавь методы для работы с друзьями
    // Добавить в друзья
    sendFriendRequest(friend_id, path = 'friends/send') {
        return this.store({ friend_id }, path)
    }
    async getSentRequests() {
        try {
            const res = await this.list({}, 'friends/sent')
            console.log('getSentRequests res ', res)
            return res.data ? res.data.filter(r => r.friend) : [];
        } catch (e) {
            console.error('[TalkService] Не удалось получить исходящие запросы:', e)
            return []
        }
    }

    // Принять запрос в друзья
    acceptFriendRequest(id, path = `friends/accept/${id}`) {
        return this.store({ id }, path)
    }

    getFriendsList() {
        return this.list({}, 'friends')
    }

    // Входящие запросы
    getIncomingRequests() {
        return this.list({}, 'friends/incoming')
    }

    // Загрузка истории
    getHistory(userId, path = 'history') {
        return this.get(userId, path)
    }

    // Отметка как прочитанное
    async markAsRead(userId, path = `read/${userId}`) {
        return await this.store({userId}, path)
    }

    getCallHistory(userId, path = 'call/history') {
        return this.get(userId, path)
    }

    // Отправка сообщения
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
