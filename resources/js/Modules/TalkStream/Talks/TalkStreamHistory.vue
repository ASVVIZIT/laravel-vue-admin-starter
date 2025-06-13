<template>
  <div class="talkstream-history" ref="historyContainer">
    <MessageItem
        v-for="message in messages"
        :key="message.id"
        :contact="contact"
        :message="message"
    />
  </div>
</template>

<script setup>
import {defineProps, ref, defineExpose} from 'vue'
import MessageItem from '@/modules/TalkStream/Components/MessageItem.vue'

const props = defineProps(['contact', 'messages'])
const historyContainer = ref(null)

function scrollToBottom() {
  if (historyContainer.value) {
    historyContainer.value.scrollTop = historyContainer.value.scrollHeight
  }
}

defineExpose({scrollToBottom})
</script>

<style module lang="scss">
.talkstream-history {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  max-height: calc(100vh - 120px);
  background-color: #f9f9f9;
  border-radius: 8px;
  margin: 1rem;
}
</style>
