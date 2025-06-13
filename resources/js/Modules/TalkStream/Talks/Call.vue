<template>
  <div class="call">
    <h3>Видео звонок с {{ selectedContact?.name }}</h3>

    <div v-if="!callActive && !incomingCall" class="contact-selection">
      <p>Выберите тип звонка:</p>
      <button @click="startVideoCall">Видео</button>
      <button @click="startAudioCall">Аудио</button>
    </div>

    <div v-if="callActive || incomingCall" class="in-call">
      <video ref="localVideo" :srcObject="localStream" autoplay muted></video>
      <video ref="remoteVideo" :srcObject="remoteStream" autoplay></video>

      <div class="call-controls">
        <button @click="endCall">Завершить</button>
        <button @click="toggleAudio">{{ isAudioEnabled ? 'Выключить микрофон' : 'Включить микрофон' }}</button>
        <button @click="toggleVideo">{{ isVideoEnabled ? 'Выключить камеру' : 'Включить камеру' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCallStore } from '@/modules/TalkStream/Stores/callStore'
import { useContactStore } from '@/modules/TalkStream/Stores/contactStore'
import VideoCallScreen from '@/modules/TalkStream/Components/VideoCallScreen.vue'

const route = useRoute()
const callStore = useCallStore()
const contactStore = useContactStore()

const selectedContact = ref(null)
const callActive = ref(false)
const incomingCall = ref(null)

const localStream = ref(null)
const remoteStream = ref(null)
const isAudioEnabled = ref(true)
const isVideoEnabled = ref(true)

const contactId = Number(route.query.to)

onMounted(() => {
  if (!contactId) return

  selectedContact.value = contactStore.contacts.find(c => c.id === contactId)

  if (window.echoTalkStream && contactId) {
    window.echoTalkStream.private(`call.${contactId}`)
        .listen('.IncomingCall', (e) => {
          console.log('Получен входящий звонок:', e.call)
          incomingCall.value = e.call
        })
  }
})

async function startVideoCall() {
  localStream.value = await callStore.setupLocalStream()
  callStore.initiateCall(contactId, 'video')
}

async function startAudioCall() {
  callActive.value = true
  localStream.value = await callStore.setupLocalStream({ video: false, audio: true })
  callStore.initiateCall(contactId, 'audio')
}

function endCall() {
  callStore.endCall()
  incomingCall.value = null
}

function toggleAudio() {
  isAudioEnabled.value = !isAudioEnabled.value
  if (localStream.value) {
    localStream.value.getAudioTracks().forEach(track => track.enabled = isAudioEnabled.value)
  }
}

function toggleVideo() {
  isVideoEnabled.value = !isVideoEnabled.value
  if (localStream.value) {
    localStream.value.getVideoTracks().forEach(track => track.enabled = isVideoEnabled.value)
  }
}
</script>

<style scoped>
.call {
  padding: 1rem;
}

.in-call {
  display: flex;
  flex-direction: column;
  align-items: center;
}

video {
  width: 100%;
  max-width: 400px;
  margin: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.call-controls button {
  margin: 5px;
}
</style>
