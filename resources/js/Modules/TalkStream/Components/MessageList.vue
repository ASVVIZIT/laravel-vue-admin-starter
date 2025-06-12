<template>
  <ul class="message-list">
    <MessageItem v-for="(msg, index) in messages" :key="index" :message="msg" />
  </ul>
</template>

<script setup>
import MessageItem from './MessageItem.vue'
import { defineProps } from 'vue'

defineProps({
  messages: {
    type: Array,
    required: true
  }
})
</script>

<style scoped>
.message-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
</style>
