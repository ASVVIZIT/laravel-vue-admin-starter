import request from '@utils/request'
import type { Message, Contact, FriendRequest, ApiResponse, CallData } from '../Types'

export const TalkStreamAPI = {

    // ========================================================================
    // КОНФИГУРАЦИЯ МОДУЛЯ
    // ========================================================================
    getConfig(): Promise<ApiResponse<{
        ui: { enable_read_receipts: boolean; messages_per_page: number };
        limits: { max_message_length: number };
    }>> {
        return request.get('/talkstream/config')
    },

    // ========================================================================
    // ПОЛЬЗОВАТЕЛЬ
    // ========================================================================
    getUser(): Promise<ApiResponse<Contact>> {
        return request.get('/talkstream/user')
    },

    // ========================================================================
    // КОНТАКТЫ
    // ========================================================================
    getContacts(): Promise<ApiResponse<Contact[]>> {
        return request.get('/talkstream/contacts')
    },

    getContact(id: number): Promise<ApiResponse<Contact>> {
        return request.get(`/talkstream/contacts/${id}`)
    },

    // ========================================================================
    // ИСТОРИЯ СООБЩЕНИЙ
    // ========================================================================
    getHistory(userId: number): Promise<ApiResponse<Message[]>> {
        return request.get(`/talkstream/history/${userId}`)
    },

    sendMessage(to_id: number, content: string): Promise<ApiResponse<Message>> {``
        return request.post('/talkstream/send', { to_id, content })
    },

    // 🔥 НОВОЕ (проблема 1а): отметка входящих как прочитанных на бэкенде.
    // POST /talkstream/read/{userReadId}, где userReadId = ID собеседника,
    // чьи сообщения мы прочитали. Бэкенд проставляет read_at и рассылает
    // MessageRead отправителю (нам сюда приходит эхо-нет, см. шаг 3b).
    markAsRead(userId: number): Promise<ApiResponse<any>> {
        return request.post(`/talkstream/read/${userId}`)
    },

    // ========================================================================
    // ДРУЗЬЯ
    // ========================================================================
    getFriendsList(): Promise<ApiResponse<Contact[]>> {
        return request.get('/talkstream/friends')
    },

    getIncomingRequests(): Promise<ApiResponse<FriendRequest[]>> {
        return request.get('/talkstream/friends/incoming')
    },

    getSentRequests(): Promise<ApiResponse<FriendRequest[]>> {
        return request.get('/talkstream/friends/sent')
    },

    isFriend(userId: number): Promise<ApiResponse<{ isFriend: boolean }>> {
        return request.get(`/talkstream/friends/is-friend/${userId}`)
    },

    sendFriendRequest(friend_id: number): Promise<ApiResponse<any>> {
        return request.post('/talkstream/friends/send', { friend_id })
    },

    acceptFriendRequest(id: number): Promise<ApiResponse<any>> {
        return request.post(`/talkstream/friends/accept/${id}`)
    },

    // ========================================================================
    // ЗВОНКИ (все 6 методов из routes/api.php)
    // ========================================================================

    /**
     * POST /talkstream/call/initiate — инициировать звонок
     */
    initiateCall(to_id: number, type: 'audio' | 'video'): Promise<ApiResponse<CallData>> {
        return request.post('/talkstream/call/initiate', { to_id, type })
    },

    /**
     * POST /talkstream/call/start — старт звонка (после принятия)
     */
    startCall(to_id: number, type: 'audio' | 'video' = 'video'): Promise<ApiResponse<CallData>> {
        return request.post('/talkstream/call/start', { to_id, type })
    },

    /**
     * POST /talkstream/call/accept — принять входящий звонок
     */
    acceptCall(call_id: number): Promise<ApiResponse<CallData>> {
        return request.post('/talkstream/call/accept', { call_id })
    },

    /**
     * POST /talkstream/call/decline — отклонить входящий звонок
     */
    declineCall(call_id: number): Promise<ApiResponse<any>> {
        return request.post('/talkstream/call/decline', { call_id })
    },

    /**
     * POST /talkstream/call/end — завершить звонок (старый метод)
     */
    endCall(call_id: number): Promise<ApiResponse<any>> {
        return request.post('/talkstream/call/end', { call_id })
    },

    /**
     * POST /talkstream/call/end-call — завершить звонок (новый метод)
     */
    endCallFixed(call_id: number): Promise<ApiResponse<any>> {
        return request.post('/talkstream/call/end-call', { call_id })
    }
}
