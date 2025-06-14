<template>
  <div class="talkstream-history" ref="historyContainer">
    <MessageItem
        v-for="(message, index) in messages"
        :key="message.id"
        :userFrom="userFrom"
        :contact="contact"
        :message="message"
        :is-online="props.isOnline"
        :is-first-in-group="isFirstInGroup(index)"
        :is-last-in-group="isLastInGroup(index)"
        :is-group-start="isGroupStart(index)"
    />
  </div>
</template>

<script setup>
import {defineProps, ref, defineExpose} from 'vue'
import MessageItem from '@/modules/TalkStream/Components/MessageItem.vue'

const props = defineProps(['userFrom','contact', 'messages', 'isOnline'])
const historyContainer = ref(null)


// Проверяем, является ли сообщение первым в группе одинаковых сообщений
function isFirstInGroup(index) {
  if (index === 0) return true
  return props.messages[index].from_id !== props.messages[index - 1].from_id
}

// Проверяем, является ли сообщение последним в группе одинаковых сообщений
function isLastInGroup(index) {
  if (index === props.messages.length - 1) return true
  return props.messages[index].from_id !== props.messages[index + 1].from_id
}

// Проверяем, является ли сообщение началом новой группы
function isGroupStart(index) {
  if (index === 0) return true
  return props.messages[index].from_id !== props.messages[index - 1].from_id
}


function scrollToBottom() {
  if (historyContainer.value) {
    historyContainer.value.scrollTop = historyContainer.value.scrollHeight
  }
}

defineExpose({scrollToBottom})
</script>

<style lang="scss">
.talkstream-history {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  max-height: calc(100vh - 160px);
  background-color: #2e2f34;
  margin: 0.6rem;
}
</style>
