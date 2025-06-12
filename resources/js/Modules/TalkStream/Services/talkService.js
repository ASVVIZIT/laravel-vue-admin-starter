import Resource from '@/api/resource'

export default class TalkService extends Resource {
    constructor() {
        super('talkstream')
    }

    // Отправить запрос на начало звонка
    startCall(to_id, type = 'video') {
        return this.store({ to_id, type }, 'call/start')
    }

    // Завершить звонок
    endCall() {
        return this.store({}, 'call/end')
    }

    // Получить историю звонков (опционально)
    getCallHistory(userId) {
        return this.get(`call/history/${userId}`)
    }
}
