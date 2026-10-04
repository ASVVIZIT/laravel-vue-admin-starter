// resources/js/Modules/TalkStream/api/talkstream.ts
// @ts-ignore - Если у вас нет строгих типов для @utils/request, игнорируем для совместимости
import request from '@utils/request'
import type { Message, Contact, FriendRequest, ApiResponse } from '../types'

export const TalkStreamAPI = {
    /**
     * Получение списка контактов
     */
    getContacts(): Promise<ApiResponse<Contact[]>> {
        return request.get('/api/talkstream/contacts')
    },

    /**
     * Получение истории переписки с конкретным пользователем
     */
    getHistory(userId: number): Promise<ApiResponse<Message[]>> {
        return request.get(`/api/talkstream/history/${userId}`)
    },

    /**
     * Отправка сообщения
     */
    sendMessage(to_id: number, content: string): Promise<ApiResponse<Message>> {
        return request.post('/api/talkstream/send', {
            to_id,
            content
        })
    },

    /**
     * Получение заявок в друзья (входящие)
     */
    getIncomingRequests(): Promise<ApiResponse<FriendRequest[]>> {
        return request.get('/api/talkstream/friends/incoming')
    },

    /**
     * Отправка заявки в друзья
     */
    sendFriendRequest(friend_id: number): Promise<ApiResponse<any>> {
        return request.post('/api/talkstream/friends/send', { friend_id })
    },

    /**
     * Принятие заявки в друзья
     */
    acceptFriendRequest(id: number): Promise<ApiResponse<any>> {
        return request.post(`/api/talkstream/friends/accept/${id}`)
    }
}
