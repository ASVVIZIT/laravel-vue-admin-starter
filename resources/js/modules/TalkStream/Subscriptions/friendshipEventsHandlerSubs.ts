import { useFriendStore } from '@/modules/TalkStream/Stores/friendStore'
import { useContactStore } from '@/modules/TalkStream/Stores/contactStore'
import { ElNotification } from 'element-plus'
import logger from '@/modules/TalkStream/Utils/loggerTalkStreamUtil'

interface FriendRequestPayload {
    id: number
    user_id: number
    friend_id: number
    user?: { id: number; name: string; avatar?: string }
}

export function setupFriendRequestsChannel(echo: any, myUserId: number) {
    if (!echo || !myUserId) {
        logger.warn('[FriendRequests] Echo or UserId not provided')
        return null
    }

    const friendStore = useFriendStore()
    const contactStore = useContactStore()
    const channelName = `friends.${myUserId}`

    try {
        const channel = echo.private(channelName)

        channel
            .listen('.FriendRequestSent', (e: { request: FriendRequestPayload }) => {
                const req = e.request
                logger.info('[FriendRequests] Incoming request from:', req.user_id)

                // Если я получатель
                if (req.friend_id === myUserId) {
                    friendStore.addIncoming(req.user_id)

                    if (req.user && !contactStore.contacts.some(c => c.id === req.user!.id)) {
                        contactStore.contacts.push(req.user as any)
                    }

                    ElNotification({
                        title: 'Новая заявка в друзья',
                        message: `Пользователь ${req.user?.name || req.user_id} хочет добавить вас в друзья`,
                        type: 'info',
                        duration: 4000
                    })
                }
            })
            .listen('.FriendRequestAccepted', (e: { request: { user_id: number; friend_id: number } }) => {
                const { user_id, friend_id } = e.request
                logger.info('[FriendRequests] Request accepted:', { user_id, friend_id })

                friendStore.addFriend(friend_id)

                if (user_id === myUserId) {
                    friendStore.removeSent(friend_id)
                    ElNotification({ title: 'Заявка принята', message: 'Теперь вы друзья', type: 'success' })
                } else {
                    friendStore.removeIncoming(user_id)
                    ElNotification({ title: 'Заявка принята', message: 'Пользователь принял вашу заявку', type: 'success' })
                }
            })
            .listen('.FriendRequestDeclined', (e: { request: { user_id: number; friend_id: number } }) => {
                const { user_id, friend_id } = e.request
                logger.warn('[FriendRequests] Request declined:', { user_id, friend_id })

                if (user_id === myUserId) {
                    friendStore.removeSent(friend_id)
                    ElNotification({ title: 'Заявка отклонена', message: 'Пользователь отклонил вашу заявку', type: 'warning' })
                } else {
                    friendStore.removeIncoming(user_id)
                    ElNotification({ title: 'Заявка отклонена', message: 'Вы отклонили заявку', type: 'warning' })
                }
            })
            .error((error: any) => {
                logger.error('[FriendRequests] Channel error:', error)
            })

        return channel
    } catch (error) {
        logger.error('[FriendRequests] Setup failed:', (error as Error)?.message)
        return null
    }
}
