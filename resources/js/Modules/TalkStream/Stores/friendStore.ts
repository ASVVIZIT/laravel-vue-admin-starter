import { defineStore } from 'pinia'
import TalkService from '@/modules/TalkStream/Services/talkService'
import type { FriendRequest } from '@/modules/TalkStream/types'

const talkService = new TalkService()

export const useFriendStore = defineStore('friend', {
    state: () => ({
        friendRequests: [] as FriendRequest[],
        friends: [] as number[],
        incomingRequests: [] as FriendRequest[],
        // 🔥 ВАЖНО: Хранит ID пользователей (friend_id), КОМУ мы отправили запрос, а не ID самой записи в БД
        sentRequests: [] as number[],
        userId: null as number | null,
        // 🔥 ДОБАВЛЕНО: Флаг для предотвращения повторных запросов и гонки состояний при рендере
        _initialized: false,
    }),

    actions: {
        /**
         * Глобальная инициализация данных дружбы (вызывается 1 раз при старте модуля)
         * Гарантирует, что все списки загружены до того, как UI начнет их проверять
         */
        async init(): Promise<void> {
            if (this._initialized) return

            await Promise.all([
                this.loadFriendsList(),
                this.loadIncomingRequests(),
                this.loadSentRequests()
            ])

            this._initialized = true
        },

        /**
         * Отправить запрос в друзья
         */
        async sendRequest(friendId: number | string) {
            const id = Number(friendId)
            if (!id) {
                console.warn('[friendStore] sendRequest: friendId не указан')
                return
            }

            try {
                const res = await talkService.sendFriendRequest(id)
                if (res?.data) {
                    // Добавляем именно friend_id, чтобы hasSent сработал корректно
                    const targetId = res.data.friend_id || id
                    if (!this.sentRequests.includes(targetId)) {
                        this.sentRequests.push(targetId)
                    }
                }
            } catch (e: unknown) {
                const errorMessage = e instanceof Error ? e.message : 'Unknown error'
                console.error('[friendStore] sendRequest error:', errorMessage)
                // Если сервер вернул 409 (уже отправлен), мы все равно добавляем его в sentRequests для корректного UI
                if ((e as any)?.response?.status === 409) {
                    if (!this.sentRequests.includes(id)) {
                        this.sentRequests.push(id)
                    }
                }
            }
        },

        /**
         * Принять входящий запрос
         */
        async acceptRequest(requestId: number | string) {
            const reqId = Number(requestId)
            if (!reqId) {
                console.warn('[friendStore] acceptRequest: requestId не указан')
                return
            }

            try {
                await talkService.acceptFriendRequest(reqId)

                // Находим объект запроса, чтобы узнать ID отправителя и добавить его в друзья
                const req = this.incomingRequests.find(r => r.id === reqId)
                if (req) {
                    this.addFriend(req.user_id)
                }

                // Удаляем из входящих
                this.incomingRequests = this.incomingRequests.filter(r => r.id !== reqId)
            } catch (e: unknown) {
                const errorMessage = e instanceof Error ? e.message : 'Unknown error'
                console.error('[friendStore] acceptRequest error:', errorMessage)
            }
        },

        /**
         * Загрузить входящие запросы (с сервера)
         */
        async loadIncomingRequests() {
            try {
                console.log('[friendStore] Запрашиваем входящие запросы...')
                const res = await talkService.getIncomingFriendsRequest()
                const data = Array.isArray(res?.data) ? (res.data as FriendRequest[]) : []
                console.log('[friendStore] Получено входящих запросов:', data.length)
                this.incomingRequests = data
            } catch (e: unknown) {
                const errorMessage = e instanceof Error ? e.message : 'Unknown error'
                console.error('[friendStore] loadIncomingRequests error:', errorMessage)
                this.incomingRequests = []
            }
        },

        /**
         * Загрузить исходящие запросы (с сервера)
         */
        async loadSentRequests() {
            try {
                console.log('[friendStore] Запрашиваем исходящие запросы...')
                const res = await talkService.getSentRequests()
                const data = Array.isArray(res?.data) ? res.data : []
                console.log('[friendStore] Получено исходящих запросов:', data.length)

                // 🔥 КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Мапим именно friend_id (получатель), а не id (первичный ключ записи)
                this.sentRequests = data.map((r: any) => Number(r?.friend_id)).filter(Boolean)
            } catch (e: unknown) {
                const errorMessage = e instanceof Error ? e.message : 'Unknown error'
                console.error('[friendStore] loadSentRequests error:', errorMessage)
                this.sentRequests = []
            }
        },

        /**
         * Загрузить список друзей
         */
        async loadFriendsList() {
            try {
                console.log('[friendStore] Запрашиваем список друзей...')
                const res = await talkService.getFriendsList()
                const data = Array.isArray(res?.data) ? res.data : []
                console.log('[friendStore] Получено друзей:', data.length)
                this.friends = data.map((f: any) => Number(f?.id)).filter(Boolean)
            } catch (e: unknown) {
                const errorMessage = e instanceof Error ? e.message : 'Unknown error'
                console.error('[friendStore] loadFriendsList error:', errorMessage)
                this.friends = []
            }
        },

        /**
         * Проверить дружбу на сервере
         */
        async checkFriendWithServer(userId: number | string) {
            const id = Number(userId)
            if (!id) return false

            try {
                const isCached = this.friends.includes(id)
                if (isCached) return true

                const res = await talkService.isFriend(id)
                if (res?.data?.isFriend) {
                    this.friends.push(id)
                    return true
                }
                return false
            } catch (e: unknown) {
                const errorMessage = e instanceof Error ? e.message : 'Unknown error'
                console.error('[friendStore] checkFriendWithServer error:', errorMessage)
                return false
            }
        },

        /**
         * Является ли пользователь другом
         */
        isFriend(userId: number | string): boolean {
            const id = Number(userId)
            if (isNaN(id)) return false
            return this.friends.includes(id)
        },

        /**
         * Есть ли входящий запрос от этого пользователя
         * 🔥 КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Проверяем user_id (кто прислал), а не id записи
         */
        hasIncoming(userId: number | string): boolean {
            const id = Number(userId)
            if (isNaN(id)) return false
            return this.incomingRequests.some(r => r?.user_id === id)
        },

        /**
         * Отправили ли мы запрос этому пользователю
         */
        hasSent(userId: number | string): boolean {
            const id = Number(userId)
            if (isNaN(id)) return false
            return this.sentRequests.includes(id)
        },

        /**
         * Добавить друга в локальный список
         */
        addFriend(userId: number | string) {
            const id = Number(userId)
            if (isNaN(id)) return
            if (!this.friends.includes(id)) {
                this.friends.push(id)
            }
        },

        /**
         * Добавить входящий запрос (через WebSocket)
         */
        addIncoming(userId: number | string) {
            const id = Number(userId)
            if (isNaN(id)) return

            if (!this.incomingRequests.some(r => r?.user_id === id)) {
                this.incomingRequests.push({
                    id: Date.now(), // Временный ID для UI до перезагрузки
                    user_id: id,    // Кто прислал
                    friend_id: this.userId || 0,
                    accepted: null,
                    declined: null,
                    created_at: new Date().toISOString()
                } as FriendRequest)
            }
        },

        /**
         * Убрать из исходящих (например, если приняли или отменили)
         */
        removeSent(userId: number | string) {
            const id = Number(userId)
            if (isNaN(id)) return
            this.sentRequests = this.sentRequests.filter(uid => uid !== id)
        },

        /**
         * Убрать из входящих
         */
        removeIncoming(userId: number | string) {
            const id = Number(userId)
            if (isNaN(id)) return
            this.incomingRequests = this.incomingRequests.filter(r => r?.user_id !== id)
        },

        /**
         * Статус ожидания
         */
        isPending(userId: number | string): boolean {
            const id = Number(userId)
            if (isNaN(id)) return false
            return this.sentRequests.includes(id)
        },

        /**
         * Сброс стора
         */
        reset() {
            this.friendRequests = []
            this.friends = []
            this.incomingRequests = []
            this.sentRequests = []
            this.userId = null
            this._initialized = false
        }
    },

    getters: {
        friendsCount: (state): number => state.friends.length,
        incomingCount: (state): number => state.incomingRequests.length,
        sentCount: (state): number => state.sentRequests.length
    }
})
