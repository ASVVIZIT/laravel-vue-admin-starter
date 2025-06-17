<template>
  <div class="talkstream-history-container">
    <div
        class="talkstream-history"
        ref="historyContainer"
        @scroll="checkScrollPosition"
    >
      <!-- Сообщения -->
      <template v-if="messages.length > 0">
        <div class="spacer"></div>
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
      </template>

      <!-- Приветствие при отсутствии сообщений -->
      <template v-else>
        <div class="empty-state">
          <img src="/images/avatar.gif" alt="Приветствие" class="greeting-gif" />
          <p class="greeting-text">Привет! Как дела? 😊</p>
        </div>
      </template>
    </div>

    <!-- Кнопка прокрутки вниз -->
    <button
        class="scroll-down-button"
        :class="{ visible: showScrollButton }"
        @click="scrollToBottom"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { defineProps, ref, defineExpose, watch, onMounted, onBeforeUnmount } from 'vue'
import MessageItem from '@/modules/TalkStream/Components/MessageItem.vue'

const props = defineProps(['userFrom', 'contact', 'messages', 'isOnline'])
const historyContainer = ref(null)
const showScrollButton = ref(false)
const scrollTimeout = ref(null)

// Проверяем, является ли сообщение первым/последним/началом группы
function isFirstInGroup(index) {
  return index === 0 || props.messages[index].from_id !== props.messages[index - 1].from_id
}

function isLastInGroup(index) {
  return index === props.messages.length - 1 || props.messages[index].from_id !== props.messages[index + 1].from_id
}

function isGroupStart(index) {
  return isFirstInGroup(index)
}

// Прокрутка вниз
const scrollToBottom = () => {
  if (historyContainer.value) {
    historyContainer.value.scrollTop = historyContainer.value.scrollHeight
  }
  showScrollButton.value = false
}

// Прокрутка с задержкой, чтобы подождать рендера
const scrollToBottomAfterRender = () => {
  if (!historyContainer.value) return

  if (scrollTimeout.value) {
    clearTimeout(scrollTimeout.value)
    scrollTimeout.value = null
  }

  scrollTimeout.value = setTimeout(() => {
    scrollToBottom()
  }, 50)
}

// Проверяет, находится ли пользователь у самого низа
const checkScrollPosition = () => {
  if (!historyContainer.value) return

  const threshold = 100
  const isAtBottom =
      historyContainer.value.scrollHeight - historyContainer.value.scrollTop - historyContainer.value.clientHeight <= threshold

  showScrollButton.value = !isAtBottom
}

// Автоматическая прокрутка при добавлении новых сообщений
watch(
    () => props.messages.length,
    (newLength, oldLength) => {
      if (newLength <= oldLength) return

      if (!historyContainer.value) return

      const isAtBottom =
          historyContainer.value.scrollHeight -
          historyContainer.value.scrollTop -
          historyContainer.value.clientHeight <=
          100

      if (isAtBottom) {
        scrollToBottomAfterRender()
      } else {
        showScrollButton.value = true
      }
    }
)

// Монтирование
onMounted(() => {
  if (historyContainer.value) {
    // Прокрутка при монтировании
    scrollToBottomAfterRender()
  }
})

// Удаление таймеров
onBeforeUnmount(() => {
  if (scrollTimeout.value) {
    clearTimeout(scrollTimeout.value)
  }
})

defineExpose({ scrollToBottom })
</script>

<style lang="scss">
.talkstream-history-container {
  position: relative;
  flex: 1;
  background-color: #2e2f34;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.spacer {
  flex: 1 0 auto;
}

.talkstream-history {
  flex: 1;
  max-height: calc(100vh - 170px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: 16px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #2e2f34;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
}

.scroll-down-button {
  position: absolute;
  right: 20px;
  bottom: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #b2b5b7;
  border: 1px solid white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 100;

  opacity: 0;
  transform: translateY(10px);
  pointer-events: none;

  &:hover {
    opacity: 1 !important;
    background-color: #2d3748;
    transform: scale(1.05) translateY(0) !important;
  }

  svg {
    width: 24px;
    height: 24px;
    fill: #2e2f34;
  }

  &.visible {
    opacity: 0.8;
    transform: translateY(0);
    pointer-events: auto;
  }
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #ccc;
  padding: 20px;
}

.greeting-gif {
  width: 150px;
  height: auto;
  margin-bottom: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.greeting-text {
  font-size: 1.2rem;
  font-weight: 500;
}
</style>
