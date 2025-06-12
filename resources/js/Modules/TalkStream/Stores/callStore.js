import { defineStore } from 'pinia'
import TalkService from '@/modules/TalkStream/Services/talkService'

export const useCallStore = defineStore('call', {
    state: () => ({
        activeCall: null,
        localStream: null,
        remoteStream: null,
        talkService: new TalkService()
    }),
    actions: {
        async initiateCall(to_id, type = 'video') {
            await this.talkService.startCall(to_id, type)
            this.activeCall = { to_id, type, status: 'calling' }
        },
        async acceptCall(caller) {
            this.activeCall = { ...caller, status: 'active' }
            this.localStream = await this.setupLocalStream()
        },
        endCall() {
            if (this.localStream) {
                this.localStream.getTracks().forEach(track => track.stop())
            }

            this.talkService.endCall()
            this.activeCall = null
            this.remoteStream = null
        },
        async setupLocalStream(options = { video: true, audio: true }) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia(options)
                this.localStream = stream
                return stream
            } catch (err) {
                console.error('[callStore] Не удалось получить медиапоток:', err)
                return null
            }
        }
    }
})
