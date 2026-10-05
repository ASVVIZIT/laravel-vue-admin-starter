import { defineStore } from 'pinia'
// ✅ Абсолютный путь к API
import { TalkStreamAPI } from '@/modules/TalkStream/api/talkstream'
// ✅ Абсолютный путь к типам
import type { CallData } from '@/modules/TalkStream/types'

export const useCallStore = defineStore('call', {
    state: () => ({
        activeCall: null as CallData | null,
        incomingCall: null as CallData | null,
        localStream: null as MediaStream | null,
        remoteStream: null as MediaStream | null,
        peerConnection: null as RTCPeerConnection | null,
        isAudioEnabled: true,
        isVideoEnabled: true,
    }),

    actions: {
        /**
         * Инициировать исходящий звонок
         */
        async initiateCall(to_id: number, type: 'audio' | 'video' = 'video'): Promise<void> {
            try {
                // ✅ Абсолютный путь в действии
                const response = await TalkStreamAPI.initiateCall(to_id, type)
                if (response.data) {
                    this.activeCall = { ...response.data, status: 'calling' }
                    this.localStream = await this.setupLocalStream({
                        video: type === 'video',
                        audio: true
                    })
                }
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error'
                console.error('[callStore] initiateCall error:', errorMessage)
                throw error
            }
        },

        /**
         * Старт звонка (после принятия)
         */
        async startCall(to_id: number, type: 'audio' | 'video' = 'video'): Promise<void> {
            try {
                const response = await TalkStreamAPI.startCall(to_id, type)
                if (response.data) {
                    this.activeCall = { ...response.data, status: 'active' }
                    this.localStream = await this.setupLocalStream({
                        video: type === 'video',
                        audio: true
                    })
                    await this.setupPeerConnection()
                }
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error'
                console.error('[callStore] startCall error:', errorMessage)
                throw error
            }
        },

        /**
         * Принять входящий звонок
         */
        async acceptCall(call_id: number): Promise<void> {
            if (!this.incomingCall) return

            try {
                const response = await TalkStreamAPI.acceptCall(call_id)
                if (response.data) {
                    this.activeCall = { ...response.data, status: 'active' }
                    this.incomingCall = null
                    this.localStream = await this.setupLocalStream({
                        video: this.activeCall.type === 'video',
                        audio: true
                    })
                    await this.setupPeerConnection()
                }
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error'
                console.error('[callStore] acceptCall error:', errorMessage)
                throw error
            }
        },

        /**
         * Отклонить входящий звонок
         */
        async declineCall(call_id: number): Promise<void> {
            try {
                await TalkStreamAPI.declineCall(call_id)
                this.incomingCall = null
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error'
                console.error('[callStore] declineCall error:', errorMessage)
            }
        },

        /**
         * Завершить активный звонок
         */
        async endCall(): Promise<void> {
            if (!this.activeCall) return

            const callId = this.activeCall.id || 0

            try {
                try {
                    await TalkStreamAPI.endCallFixed(callId)
                } catch {
                    await TalkStreamAPI.endCall(callId)
                }
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error'
                console.warn('[callStore] endCall API error:', errorMessage)
            } finally {
                this.cleanup()
            }
        },

        /**
         * Обработка входящего звонка (вызывается из WebSocket)
         */
        handleIncomingCall(callData: CallData): void {
            this.incomingCall = callData
        },

        /**
         * Запросить доступ к камере/микрофону
         */
        async setupLocalStream(options: MediaStreamConstraints = { video: true, audio: true }): Promise<MediaStream | null> {
            try {
                const stream = await navigator.mediaDevices.getUserMedia(options)
                this.localStream = stream
                return stream
            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error'
                console.error('[callStore] Не удалось получить медиапоток:', errorMessage)
                return null
            }
        },

        /**
         * Настройка WebRTC соединения
         */
        async setupPeerConnection(): Promise<void> {
            const configuration: RTCConfiguration = {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            }

            const pc = new RTCPeerConnection(configuration)
            this.peerConnection = pc

            const stream = this.localStream
            if (stream) {
                const tracks = stream.getTracks()
                for (const track of tracks) {
                    pc.addTrack(track, stream)
                }
            }

            pc.ontrack = (event: RTCTrackEvent) => {
                this.remoteStream = event.streams[0] ?? null
            }

            pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
                if (event.candidate) {
                    console.log('[WebRTC] ICE candidate:', event.candidate)
                }
            }
        },

        /**
         * Переключение микрофона
         */
        toggleAudio(isEnabled: boolean): void {
            this.isAudioEnabled = isEnabled
            const stream = this.localStream
            if (stream) {
                const tracks = stream.getAudioTracks()
                for (const track of tracks) {
                    track.enabled = isEnabled
                }
            }
        },

        /**
         * Переключение камеры
         */
        toggleVideo(isEnabled: boolean): void {
            this.isVideoEnabled = isEnabled
            const stream = this.localStream
            if (stream) {
                const tracks = stream.getVideoTracks()
                for (const track of tracks) {
                    track.enabled = isEnabled
                }
            }
        },

        /**
         * Очистка ресурсов
         */
        cleanup(): void {
            const stream = this.localStream
            if (stream) {
                const tracks = stream.getTracks()
                for (const track of tracks) {
                    track.stop()
                }
            }

            const pc = this.peerConnection
            if (pc) {
                pc.close()
            }

            this.activeCall = null
            this.incomingCall = null
            this.localStream = null
            this.remoteStream = null
            this.peerConnection = null
        },

        reset(): void {
            this.cleanup()
        }
    },

    getters: {
        isCallActive(state): boolean {
            return state.activeCall?.status === 'active'
        },
        isCallPending(state): boolean {
            return state.activeCall?.status === 'calling'
        },
        hasIncomingCall(state): boolean {
            return state.incomingCall !== null
        },
        currentCallType(state): 'audio' | 'video' | null {
            return state.activeCall?.type ?? null
        }
    }
})
