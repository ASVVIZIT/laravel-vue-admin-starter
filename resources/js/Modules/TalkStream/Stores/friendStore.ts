import TalkService from '@/modules/TalkStream/Services/talkService'
import type { FriendRequest } from '@/modules/TalkStream/types'

const talkService = new TalkService()

export const useFriendStore = defineStore('friend', {
    state: () => ({
        friendRequests: [] as FriendRequest[],
        friends: [] as number[],
        incomingRequests: [] as FriendRequest[],

        /**
         * 🔥 ВАЖНО:
         * Хранит ID пользователей (friend_id), КОМУ мы отправили запрос,
         * а не ID самой записи в БД.
         */
        sentRequests: [] as number[],

        /**
         * 🔥 НОВОЕ:
         * Дата/время исходящей заявки по friend_id.
         *
         * Используется UI:
         *   "Отправлено сегодня 14:32"
         *
         * Если бэкенд не прислал created_at, здесь может лежать пустая строка.
         */
        sentRequestsById: {} as Record<number, string>,

        userId: null as number | null,

        /**
         * 🔥 Флаг для предотвращения повторных запросов
         * и гонки состояний при рендере.
         */
        _initialized: false,
    }),

    actions: {
        /**
         * Глобальная инициализация данных дружбы.
         *
         * Вызывается 1 раз при старте модуля.
         * Гарантирует, что все списки загружены до того,
         * как UI начнет их проверять.
         */
        async init(): Promise<void> {
            if (this._initialized) {
                return
            }

            await Promise.all([
                this.loadFriendsList(),
                this.loadIncomingRequests(),
                this.loadSentRequests(),
            ])

            this._initialized = true
        },

        /**
         * Отправить запрос в друзья.
         */
        async sendRequest(friendId: number | string): Promise<void> {
            const id = Number(friendId)

            if (!id) {
                console.warn('[friendStore] sendRequest: friendId не указан')
                return
            }

            try {
                const res = await talkService.sendFriendRequest(id)

                const data = res?.data as {
                    friend_id?: number | string
                    created_at?: string
                } | undefined

                if (data) {
                    const targetId = Number(data.friend_id ?? id)

                    if (targetId) {
                        if (!this.sentRequests.includes(targetId)) {
                            this.sentRequests.push(targetId)
                        }

                        const createdAt = data.created_at ? String(data.created_at) : ''

                        /**
                         * Если дата пришла — сохраняем.
                         * Если дата не пришла, но записи ещё нет — фиксируем пустую строку,
                         * чтобы UI знал: заявка есть, дата неизвестна.
                         *
                         * Если уже была реальная дата, пустой ответ её не затирает.
                         */
                        if (createdAt || this.sentRequestsById[targetId] === undefined) {
                            this.sentRequestsById[targetId] = createdAt
                        }
                    }
                }
            } catch (e: unknown) {
                const errorMessage = e instanceof Error ? e.message : 'Unknown error'
                console.error('[friendStore] sendRequest error:', errorMessage)

                /**
                 * Если сервер вернул 409 (уже отправлен),
                 * мы все равно добавляем его в sentRequests для корректного UI.
                 */
                const err = e as {
                    response?: {
                        status?: number
                    }
                }

                if (err?.response?.status === 409) {
                    if (!this.sentRequests.includes(id)) {
                        this.sentRequests.push(id)
                    }

                    if (this.sentRequestsById[id] === undefined) {
                        this.sentRequestsById[id] = ''
                    }
                }
            }
        },

        /**
         * Принять входящий запрос.
         */
        async acceptRequest(requestId: number | string): Promise<void> {
            const reqId = Number(requestId)

            if (!reqId) {
                console.warn('[friendStore] acceptRequest: requestId не указан')
                return
            }

            try {
                await talkService.acceptFriendRequest(reqId)

                /**
                 * Находим объект запроса, чтобы узнать ID отправителя
                 * и добавить его в друзья.
                 */
                const req = this.incomingRequests.find(r => r.id === reqId)

                if (req) {
                    this.addFriend(req.user_id)

                    /**
                     * На случай, если где-то висел исходящий дубль — чистим.
                     */
                    this.removeSent(req.user_id)
                }

                // Удаляем из входящих.
                this.incomingRequests = this.incomingRequests.filter(r => r.id !== reqId)
            } catch (e: unknown) {
                const errorMessage = e instanceof Error ? e.message : 'Unknown error'
                console.error('[friendStore] acceptRequest error:', errorMessage)
            }
        },

        /**
         * Загрузить входящие запросы с сервера.
         */
        async loadIncomingRequests(): Promise<void> {
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
         * Загрузить исходящие запросы с сервера.
         */
        async loadSentRequests(): Promise<void> {
            try {
                console.log('[friendStore] Запрашиваем исходящие запросы...')

                const res = await talkService.getSentRequests()
                const data = Array.isArray(res?.data) ? res.data : []

                console.log('[friendStore] Получено исходящих запросов:', data.length)

                const ids: number[] = []
                const dates: Record<number, string> = {}

                /**
                 * 🔥 КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ:
                 * Мапим именно friend_id (получатель), а не id (первичный ключ записи).
                 *
                 * 🔥 ФИКС ДУБЛЕЙ:
                 * Используем проверку через undefined, а не truthy/falsy,
                 * потому что пустая строка "" — валидное значение "дата неизвестна".
                 */
                data.forEach((r: any) => {
                    const friendId = Number(r?.friend_id)

                    if (!friendId) {
                        return
                    }

                    if (dates[friendId] === undefined) {
                        ids.push(friendId)
                    }

                    dates[friendId] = r?.created_at ? String(r.created_at) : ''
                })

                this.sentRequests = ids
                this.sentRequestsById = dates
            } catch (e: unknown) {
                const errorMessage = e instanceof Error ? e.message : 'Unknown error'
                console.error('[friendStore] loadSentRequests error:', errorMessage)
                this.sentRequests = []
                this.sentRequestsById = {}
            }
        },

        /**
         * Загрузить список друзей.
         */
        async loadFriendsList(): Promise<void> {
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
         * Проверить дружбу на сервере.
         */
        async checkFriendWithServer(userId: number | string): Promise<boolean> {
            const id = Number(userId)

            if (!id) {
                return false
            }

            try {
                const isCached = this.friends.includes(id)

                if (isCached) {
                    return true
                }

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
         * Является ли пользователь другом.
         */
        isFriend(userId: number | string): boolean {
            const id = Number(userId)

            if (isNaN(id)) {
                return false
            }

            return this.friends.includes(id)
        },

        /**
         * Есть ли входящий запрос от этого пользователя.
         *
         * 🔥 КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ:
         * Проверяем user_id (кто прислал), а не id записи.
         */
        hasIncoming(userId: number | string): boolean {
            const id = Number(userId)

            if (isNaN(id)) {
                return false
            }

            return this.incomingRequests.some(r => r?.user_id === id)
        },

        /**
         * Отправили ли мы запрос этому пользователю.
         */
        hasSent(userId: number | string): boolean {
            const id = Number(userId)

            if (isNaN(id)) {
                return false
            }

            return this.sentRequests.includes(id)
        },

        /**
         * 🔥 НОВОЕ:
         * Получить дату/время заявки для UI.
         *
         * Возвращает:
         *   - created_at входящей заявки, если она есть;
         *   - created_at исходящей заявки, если она есть;
         *   - null, если дата неизвестна.
         */
        getRequestCreatedAt(userId: number | string): string | null {
            const id = Number(userId)

            if (!id || isNaN(id)) {
                return null
            }

            const incoming = this.incomingRequests.find(r => r?.user_id === id)

            if (incoming?.created_at) {
                return incoming.created_at
            }

            const sent = this.sentRequestsById[id]

            return sent ? sent : null
        },

        /**
         * Добавить друга в локальный список.
         */
        addFriend(userId: number | string): void {
            const id = Number(userId)

            if (isNaN(id)) {
                return
            }

            if (!this.friends.includes(id)) {
                this.friends.push(id)
            }
        },

        /**
         * Добавить входящий запрос через WebSocket.
         */
        addIncoming(userId: number | string): void {
            const id = Number(userId)

            if (isNaN(id)) {
                return
            }

            if (!this.incomingRequests.some(r => r?.user_id === id)) {
                this.incomingRequests.push({
                    id: Date.now(), // Временный ID для UI до перезагрузки
                    user_id: id,    // Кто прислал
                    friend_id: this.userId || 0,
                    accepted: null,
                    declined: null,
                    created_at: new Date().toISOString(),
                } as FriendRequest)
            }
        },

        /**
         * Убрать из исходящих, например если приняли или отменили.
         */
        removeSent(userId: number | string): void {
            const id = Number(userId)

            if (isNaN(id)) {
                return
            }

            this.sentRequests = this.sentRequests.filter(uid => uid !== id)

            if (this.sentRequestsById[id] !== undefined) {
                delete this.sentRequestsById[id]
            }
        },

        /**
         * Убрать из входящих.
         */
        removeIncoming(userId: number | string): void {
            const id = Number(userId)

            if (isNaN(id)) {
                return
            }

            this.incomingRequests = this.incomingRequests.filter(r => r?.user_id !== id)
        },

        /**
         * Статус ожидания.
         */
        isPending(userId: number | string): boolean {
            const id = Number(userId)

            if (isNaN(id)) {
                return false
            }

            return this.sentRequests.includes(id)
        },

        /**
         * Сброс стора.
         */
        reset(): void {
            this.friendRequests = []
            this.friends = []
            this.incomingRequests = []
            this.sentRequests = []
            this.sentRequestsById = {}
            this.userId = null
            this._initialized = false
        },
    },

    getters: {
        friendsCount: (state): number => state.friends.length,
        incomingCount: (state): number => state.incomingRequests.length,
        sentCount: (state): number => state.sentRequests.length,
    },
})
