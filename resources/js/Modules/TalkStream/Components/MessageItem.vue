<template>
  <div class="message-item" :class="isSent ? 'sent' : 'received'">
    <div class="message-content">{{ message.content }}</div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  contact: {
    type: Object,
    required: true
  },
  message: {
    type: Object,
    required: true
  }
})

const isSent = props.message.from_id === props.contact.id
</script>

<style module lang="scss">
.message-item {
  max-width: 70%;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  background-color: #e0e0e0;
  color: #333;

  &.sent {
    align-self: flex-end;
    background-color: #d1e7dd;
    margin-left: auto;
  }
}
</style>
