import { defineStore } from 'pinia'
import TalkService from '../Services/talkService'

export const useCallStore = defineStore('call', {
    state: () => ({
        activeCall: null,
        localStream: null,
        remoteStream: null,
        isCalling: false,
        talkService: new TalkService()
    }),
    actions: {
        async initiateCall(to_id, type = 'video') {
            await this.talkService.startCall(to_id, type)
            this.activeCall = { to_id, type, status: 'calling' }
        },

        async acceptCall(caller) {
            this.activeCall = { ...caller, status: 'active' }
            this.isCalling = true
            await this.setupLocalStream()
        },

        endCall() {
            if (this.localStream) {
                this.localStream.getTracks().forEach(track => track.stop())
            }

            this.talkService.endCall()
            this.activeCall = null
            this.isCalling = false
            this.remoteStream = null
        },

        async setupLocalStream() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                this.localStream = stream
                return stream
            } catch (err) {
                console.error('[callStore] Не удалось получить медиапоток:', err)
                return null
            }
        }
    }
})
