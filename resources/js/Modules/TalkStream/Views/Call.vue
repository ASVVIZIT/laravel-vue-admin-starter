<template>
  <div class="call-container">
    <h2>Видеозвонок</h2>

    <!-- Выбор собеседника -->
    <div v-if="!isCalling" class="contact-selection">
      <select v-model="selectedContact" @change="onContactSelected">
        <option value="" disabled selected>Выберите контакт</option>
        <option v-for="contact in contacts" :key="contact.id" :value="contact.id">
          {{ contact.name }} {{ isOnline(contact.id) ? '(Онлайн)' : '' }}
        </option>
      </select>

      <button @click="startVideoCall" :disabled="!selectedContact">Видео звонок</button>
      <button @click="startAudioCall" :disabled="!selectedContact">Аудио звонок</button>
    </div>

    <!-- Экран звонка -->
    <div v-if="isCalling || incomingCall" class="in-call">
      <video ref="localVideo" :srcObject="localStream" autoplay muted></video>
      <video ref="remoteVideo" :srcObject="remoteStream" autoplay></video>

      <div class="call-controls">
        <button @click="endCall">Завершить</button>
        <button @click="toggleAudio">{{ isAudioEnabled ? 'Выключить микрофон' : 'Включить микрофон' }}</button>
        <button @click="toggleVideo">{{ isVideoEnabled ? 'Выключить камеру' : 'Включить камеру' }}</button>
      </div>
    </div>

    <!-- Входящий звонок -->
    <div v-if="incomingCall" class="incoming-call">
      <p>Входящий звонок от {{ incomingCall.from?.name }}</p>
      <button @click="acceptCall(incomingCall)">Принять</button>
      <button @click="declineCall(incomingCall.id)">Отклонить</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useCallStore } from '@/modules/TalkStream/Stores/callStore'
import { userStore } from '@/store/user'

const callStore = useCallStore()
const currentUserStore = userStore()

const selectedContact = ref(null)
const incomingCall = ref(null)
const isCalling = ref(false)

// Медиа-состояния
const localStream = ref(null)
const remoteStream = ref(null)
const isAudioEnabled = ref(true)
const isVideoEnabled = ref(true)

// Список контактов
const contacts = ref([])

// Подписка на входящие вызовы
onMounted(async () => {
  if (!currentUserStore.id) {
    console.warn('[Call.vue] Пользователь не авторизован')
    return
  }

  // Загрузим контакты
  const contactStore = useContactStore()
  await contactStore.loadContacts()
  contacts.value = contactStore.contacts

  // Подписка на входящие звонки
  if (window.Echo) {
    window.Echo.private(`talkstream.call.${currentUserStore.id}`)
        .listen('.IncomingCall', (e) => {
          incomingCall.value = e.call
        })
  }
})

function onContactSelected() {
  console.log('Выбран контакт:', selectedContact.value)
}

async function startVideoCall() {
  if (!selectedContact.value) return
  isCalling.value = true
  localStream.value = await callStore.setupLocalStream()
}

async function startAudioCall() {
  if (!selectedContact.value) return
  isCalling.value = true
  localStream.value = await callStore.setupLocalStream({ audio: true, video: false })
}

function endCall() {
  callStore.endCall()
  isCalling.value = false
  incomingCall.value = null
}
</script>

<style scoped>
.call-container {
  padding: 1rem;
  max-width: 600px;
  margin: auto;
}

.contact-selection select, .contact-selection button {
  padding: 8px 12px;
  margin-right: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

video {
  width: 100%;
  max-width: 400px;
  margin: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.call-controls {
  margin-top: 1rem;
}

.call-controls button {
  margin-right: 10px;
}

.incoming-call {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>
