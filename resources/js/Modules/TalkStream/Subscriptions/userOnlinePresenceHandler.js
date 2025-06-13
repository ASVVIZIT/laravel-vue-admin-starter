// src/modules/TalkStream/Subscriptions/userOnlinePresenceHandler.js
import { useContactStore } from '@/modules/TalkStream/Stores/contactStore'
import { friendStore } from '@/modules/TalkStream/Stores/friendStore'

const contactStore = useContactStore()
const useFriendStore = friendStore()

export function setupPresenceChannel() {
    const ENABLE_LOGGING = true

    if (!window.echoTalkStream) return null

    const channel = window.echoTalkStream.join('presence-chat')

    channel
        .here((users) => {
            if (ENABLE_LOGGING) {
                console.info('[Presence Channel] Пользователи в канале:', users)
            }
            users.forEach(setUserOnline)
        })
        .joining((user) => {
            if (ENABLE_LOGGING) {
                console.info(`[Presence Channel] Пользователь присоединился: ${user.id}`)
            }
            setUserOnline(user)
        })
        .leaving((user) => {
            if (ENABLE_LOGGING) {
                console.warn(`[Presence Channel] Пользователь покинул канал: ${user.id}`)
            }
            setUserOffline(user)
        })

    function setUserOnline(user) {
        if (ENABLE_LOGGING) {
            console.debug(`[Presence Channel] Обновляем статус пользователя ${user.id} на "онлайн"`)
        }

        if (user && user.id) {
            contactStore.setOnline(user.id)
        }
    }

    function setUserOffline(user) {
        if (ENABLE_LOGGING) {
            console.debug(`[Presence Channel] Обновляем статус пользователя ${user.id} на "офлайн"`)
        }

        if (user && user.id) {
            contactStore.setOffline(user.id)
        }
    }

    return channel
}
