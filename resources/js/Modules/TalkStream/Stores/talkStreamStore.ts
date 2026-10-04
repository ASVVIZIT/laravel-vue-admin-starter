// resources/js/Modules/TalkStream/Stores/talkStreamStore.ts

import { defineStore } from 'pinia'
import { createEcho, disconnectEcho } from '../plugins/echoTalkStream'
import { useContactStore } from './contactStore'
import { useChatStore } from './chatStore'
import { userStore } from '@/store/userStore' // Проверьте путь к вашему userStore
import { isLogged } from '@/utils/auth'

export const useTalkStreamStore = defineStore('talkStream', {
    state: () => ({
        echo: null as any,
        isConnected: false,
        connectionError: null as string | null,
        reconnectAttempts: 0,
        maxReconnectAttempts: 5,
        reconnectTimer: null as ReturnType<typeof setTimeout> | null,
        subscribedChannels: [] as { name: string; channel: any }[],
        isHandlersBound: false,
    }),

    actions: {
        async initWebSockets() {
            if (!isLogged()) return

            const user = userStore()
            if (!user.id) {
                console.warn('[TalkStream] User ID not available')
                return
            }

            if (this.isConnected) return

            try {
                this.echo = createEcho()
                if (!this.echo?.connector?.pusher) {
                    console.error('[TalkStream] Echo init failed')
                    return
                }

                this.setupConnectionHandlers()
                this.echo.connect()
            } catch (e) {
                console.error('[TalkStream] Init error:', e)
            }
        },

        setupConnectionHandlers() {
            if (this.isHandlersBound) return

            const pusher = this.echo.connector.pusher

            pusher.connection.bind('connected', () => {
                console.log('[TalkStream] ✅ WebSocket connected')
                this.isConnected = true
                this.connectionError = null
                this.reconnectAttempts = 0
                this.subscribeToChannels()
            })

            pusher.connection.bind('disconnected', () => {
                console.warn('[TalkStream] 🔴 WebSocket disconnected')
                this.isConnected = false
                this.isHandlersBound = false
                this.scheduleReconnect()
            })

            pusher.connection.bind('error', (err: any) => {
                console.error('[TalkStream] Pusher error:', err)
                this.connectionError = err.message || 'Connection error'
            })

            this.isHandlersBound = true
        },

        subscribeToChannels() {
            const user = userStore()
            if (!user.id || !this.echo) return

            this.unsubscribeFromAllChannels()

            // 1. Private Channel: user.{id}
            try {
                const userChannel = this.echo.private(`user.${user.id}`)

                // Слушаем MessageSent (имя из конфига)
                userChannel.listen('MessageSent', (e: any) => {
                    console.log('[TalkStream]  New Message:', e.message)
                    const chatStore = useChatStore()
                    chatStore.addIncomingMessage(e.message)
                })

                // Слушаем MessageRead
                userChannel.listen('MessageRead', (e: any) => {
                    console.log('[TalkStream] 👁 Message Read:', e.message)
                    // Здесь можно обновить статус прочтения в chatStore
                })

                this.subscribedChannels.push({ name: `user.${user.id}`, channel: userChannel })
            } catch (e) {
                console.error('[TalkStream] User channel error:', e)
            }

            // 2. Presence Channel: chat
            try {
                const presenceChannel = this.echo.join('chat')
                presenceChannel
                    .here((users: any[]) => console.log('[Presence] Here:', users.length))
                    .joining((user: any) => console.log('[Presence] Joining:', user.name))
                    .leaving((user: any) => console.log('[Presence] Leaving:', user.name))

                this.subscribedChannels.push({ name: 'chat', channel: presenceChannel })
            } catch (e) {
                console.error('[TalkStream] Presence channel error:', e)
            }
        },

        unsubscribeFromAllChannels() {
            this.subscribedChannels.forEach(({ name, channel }) => {
                try {
                    this.echo.leave(name)
                } catch (e) {
                    console.warn(`[TalkStream] Leave error ${name}:`, e)
                }
            })
            this.subscribedChannels = []
        },

        scheduleReconnect() {
            this.clearReconnectTimer()
            if (this.reconnectAttempts >= this.maxReconnectAttempts) return

            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
            this.reconnectTimer = setTimeout(() => {
                this.reconnectAttempts++
                this.initWebSockets()
            }, delay)
        },

        clearReconnectTimer() {
            if (this.reconnectTimer) {
                clearTimeout(this.reconnectTimer)
                this.reconnectTimer = null
            }
        },

        disconnect() {
            this.clearReconnectTimer()
            this.unsubscribeFromAllChannels()
            if (this.echo) {
                disconnectEcho()
                this.echo = null
                this.isConnected = false
            }
        },
    },
})
