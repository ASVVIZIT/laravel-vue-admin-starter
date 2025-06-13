<template>
  <div class="talkstream-history">
    <div v-for="message in messages" :key="message.id" class="message" :class="message.from_id === currentUser.id ? 'sent' : 'received'">
      <div class="message-text">{{ message.content }}</div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  messages: {
    type: Array,
    required: true
  },
  currentUser: {
    type: Object,
    required: true
  }
})
</script>

<style scoped lang="scss">
.talkstream-history {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  height: calc(100vh - 120px);
}

.message {
  max-width: 70%;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  background-color: #e0e0e0;
  color: #333;
}

.message.sent {
  align-self: flex-end;
  background-color: #d1e7dd;
  margin-left: auto;
}
</style>
