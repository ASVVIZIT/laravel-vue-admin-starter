// src/modules/TalkStream/Subscriptions/friendshipEventsHandler.js
import { friendStore } from '@/modules/TalkStream/Stores/friendStore'

const useFriendStore = friendStore()

export function setupFriendRequestsChannel() {
    const ENABLE_LOGGING = true

    if (!window.talkStreamStore.echo) return null

    const channel = window.talkStreamStore.echo.private(`friends.${useFriendStore.userId}`)

    channel
        .listen('.FriendRequestSent', (e) => {
            if (ENABLE_LOGGING) {
                console.info('[Friend Requests] Получено событие FriendRequestSent:', e)
            }

            if (useFriendStore.userId === e.request.user_id) {
                useFriendStore.addIncoming(e.request.user_id)
            }
        })
        .listen('.FriendRequestAccepted', (e) => {
            if (ENABLE_LOGGING) {
                console.info('[Friend Requests] Получено событие FriendRequestAccepted:', e)
            }

            const { user_id, friend_id } = e.request
            if (user_id === useFriendStore.userId) {
                useFriendStore.addFriend(friend_id)
                useFriendStore.removeSent(friend_id)
            } else {
                useFriendStore.addFriend(friend_id)
                useFriendStore.removeIncoming(user_id)
            }
        })
        .listen('.FriendRequestDeclined', (e) => {
            if (ENABLE_LOGGING) {
                console.warn('[Friend Requests] Получено событие FriendRequestDeclined:', e)
            }

            const { user_id, friend_id } = e.request
            if (user_id === useFriendStore.userId) {
                useFriendStore.removeSent(friend_id)
            } else {
                useFriendStore.removeIncoming(user_id)
            }
        })

    return channel
}
