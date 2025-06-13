<template>
  <div class="talkstream-history">
    <div v-for="message in messages" :key="message.id">
      <MessageItem :contact="props.contact" :message="message" />
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import MessageItem from '@/modules/TalkStream/Components/MessageItem.vue'

const props = defineProps({
  contact: {
    type: Object,
    required: true
  },
  messages: {
    type: Array,
    required: true
  }
})
</script>

<style module lang="scss">
.talkstream-history {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  min-height: calc(100vh - 100px);
  height: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  margin: 1rem;
}
</style>
