<template>
  <div class="video-call-screen">
    <div class="local-video">
      <video :srcObject="localStream" autoplay muted></video>
    </div>

    <div class="remote-video" v-if="remoteStream">
      <video :srcObject="remoteStream" autoplay></video>
    </div>

    <div class="call-actions">
      <button @click="$emit('end')">Завершить</button>
      <button @click="$emit('toggleAudio')">
        {{ isAudioEnabled ? 'Выключить микрофон' : 'Включить микрофон' }}
      </button>
      <button @click="$emit('toggleVideo')">
        {{ isVideoEnabled ? 'Выключить камеру' : 'Включить камеру' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

defineProps({
  localStream: Object,
  remoteStream: Object,
  isAudioEnabled: Boolean,
  isVideoEnabled: Boolean
})

const emit = defineEmits(['end', 'toggleAudio', 'toggleVideo'])
</script>

<style scoped>
.video-call-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.local-video, .remote-video {
  width: 100%;
  max-width: 400px;
  margin: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
}

.call-actions button {
  margin: 5px;
}
</style>
