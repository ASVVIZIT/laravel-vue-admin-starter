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

    getFriends(query = {}, path = '') {
        return this.list(query, path)
    }

    getHistory(userId, path = '') {
        return this.get(userId, path)
    }

    getCallHistory(userId) {
        return this.get(`call/history/${userId}`)
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
