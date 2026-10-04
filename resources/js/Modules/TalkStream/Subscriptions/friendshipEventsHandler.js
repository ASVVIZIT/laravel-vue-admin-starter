import { friendStore } from '@/modules/TalkStream/Stores/friendStore'

const ENABLE_LOGGING = true

/**
 * Подписка на события заявок в друзья.
 *
 * ВАЖНО: echo.private('friends.X') → фактический канал = 'private-friends.X'.
 * Правило в routes/channels.php: Broadcast::channel('private-friends.{userId}', ...)
 *
 * @param {Echo} echo
 * @returns {PrivateChannel|null}
 */
export function setupFriendRequestsChannel(echo) {
    if (!echo) {
        console.warn('[FriendRequests] Echo не передан')
        return null
    }

    // ✅ Стор вызывается ВНУТРИ функции, когда Pinia уже инициализирован
    const useFriendStore = friendStore()

    const userId = useFriendStore.userId || useFriendStore.user?.id
    if (!userId) {
        console.warn('[FriendRequests] Нет userId')
        return null
    }

    // private('friends.X') → private-friends.X
    const channel = echo.private(`friends.${userId}`)

    channel
        .listen('.FriendRequestSent', (e) => {
            if (ENABLE_LOGGING) console.info('[FriendRequests] Sent:', e)
            if (userId === e.request.user_id) {
                useFriendStore.addIncoming(e.request.user_id)
            }
        })
        .listen('.FriendRequestAccepted', (e) => {
            if (ENABLE_LOGGING) console.info('[FriendRequests] Accepted:', e)
            const { user_id, friend_id } = e.request
            useFriendStore.addFriend(friend_id)
            if (user_id === userId) {
                useFriendStore.removeSent(friend_id)
            } else {
                useFriendStore.removeIncoming(user_id)
            }
        })
        .listen('.FriendRequestDeclined', (e) => {
            if (ENABLE_LOGGING) console.warn('[FriendRequests] Declined:', e)
            const { user_id, friend_id } = e.request
            if (user_id === userId) {
                useFriendStore.removeSent(friend_id)
            } else {
                useFriendStore.removeIncoming(user_id)
            }
        })
        .error((err) => {
            console.error('[FriendRequests] Ошибка канала:', err)
        })

    return channel
}
