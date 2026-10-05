import TalkResource from '@/modules/TalkStream/Services/talkResource'
import type { AxiosResponse } from 'axios'

/**
 * Сервис бизнес-логики модуля TalkStream.
 * Наследует базовые CRUD-методы и добавляет конкретные endpoints.
 * Все типы строго проверены (noImplicitAny: true).
 */
export default class TalkService extends TalkResource {
    constructor() {
        super('talkstream')
    }

    // ========================================================================
    // КОНТАКТЫ
    // ========================================================================

    getUserId<T = unknown>(query: Record<string, unknown> = {}, path: string = 'user'): Promise<AxiosResponse<T>> {
        return this.list<T>(query, path)
    }

    getContacts<T = unknown>(query: Record<string, unknown> = {}, path: string = 'contacts'): Promise<AxiosResponse<T>> {
        return this.list<T>(query, path)
    }

    // ========================================================================
    // ИСТОРИЯ И СООБЩЕНИЯ
    // ========================================================================

    getHistory<T = unknown>(userId: number | string, path: string = 'history'): Promise<AxiosResponse<T>> {
        return this.get<T>(userId, path)
    }

    sendMessage<T = unknown>(content: string, to_id: number | string): Promise<AxiosResponse<T>> {
        return this.store<T>({ content, to_id }, 'send')
    }

    // ========================================================================
    // ДРУЗЬЯ
    // ========================================================================

    getFriendsList<T = unknown>(path: string = 'friends'): Promise<AxiosResponse<T>> {
        return this.list<T>({}, path)
    }

    getIncomingFriendsRequest<T = unknown>(query: Record<string, unknown> = {}, path: string = 'friends/incoming'): Promise<AxiosResponse<T>> {
        return this.list<T>(query, path)
    }

    getSentRequests<T = unknown>(path: string = 'friends/sent'): Promise<AxiosResponse<T>> {
        return this.list<T>({}, path)
    }

    isFriend<T = unknown>(userId: number | string, path: string = 'friends/is-friend'): Promise<AxiosResponse<T>> {
        return this.get<T>(userId, path)
    }

    sendFriendRequest<T = unknown>(friend_id: number | string, path: string = 'friends/send'): Promise<AxiosResponse<T>> {
        return this.store<T>({ friend_id }, path)
    }

    acceptFriendRequest<T = unknown>(id: number | string, path: string = ''): Promise<AxiosResponse<T>> {
        const actualPath = path || `friends/accept/${id}`
        return this.store<T>({ id }, actualPath)
    }

    // ========================================================================
    // ЗВОНКИ (все 6 методов, как в routes/api.php)
    // ========================================================================

    initiateCall<T = unknown>(to_id: number | string, type: 'audio' | 'video'): Promise<AxiosResponse<T>> {
        return this.store<T>({ to_id, type }, 'call/initiate')
    }

    startCall<T = unknown>(to_id: number | string, type: 'audio' | 'video' = 'video'): Promise<AxiosResponse<T>> {
        return this.store<T>({ to_id, type }, 'call/start')
    }

    acceptCall<T = unknown>(call_id: number | string): Promise<AxiosResponse<T>> {
        return this.store<T>({ call_id }, 'call/accept')
    }

    declineCall<T = unknown>(call_id: number | string): Promise<AxiosResponse<T>> {
        return this.store<T>({ call_id }, 'call/decline')
    }

    endCall<T = unknown>(call_id: number | string): Promise<AxiosResponse<T>> {
        return this.store<T>({ call_id }, 'call/end')
    }

    endCallFixed<T = unknown>(call_id: number | string): Promise<AxiosResponse<T>> {
        return this.store<T>({ call_id }, 'call/end-call')
    }

    getCallHistory<T = unknown>(userId: number | string, path: string = 'call/history'): Promise<AxiosResponse<T>> {
        return this.get<T>(userId, path)
    }
}
