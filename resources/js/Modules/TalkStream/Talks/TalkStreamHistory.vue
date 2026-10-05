<template>
  <div class="talkstream-history-container">
    <div
        class="talkstream-history"
        ref="historyContainer"
        @scroll="checkScrollPosition"
    >
      <template v-if="messages.length > 0">
        <div class="spacer"></div>

        <MessageGroup
            v-for="(group, groupIndex) in groupedMessages"
            :key="groupIndex"
            :from-id="group.from_id"
            :messages="group.messages"
            :user-from="userFrom"
            :contact="contact"
            :is-online="isOnline"
            :show-avatar="true"
        >
          <template #default="{ message, isFirstInGroup, isLastInGroup }">
            <MessageItem
                :userFrom="userFrom"
                :contact="contact"
                :message="message"
                :is-first-in-group="isFirstInGroup"
                :is-last-in-group="isLastInGroup"
                :is-group-start="isFirstInGroup"
            />
          </template>
        </MessageGroup>
      </template>

      <template v-else>
        <div class="empty-state">
          <img src="/images/avatar.gif" alt="Приветствие" class="greeting-gif" />
          <p class="greeting-text">Привет! Как дела? 😊</p>
        </div>
      </template>
    </div>

    <button
        class="scroll-down-button"
        :class="{ visible: showScrollButton }"
        @click="scrollToBottom(600)"
    >
      <ScrollDownButtonIcon />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, defineExpose, watch, onMounted, onBeforeUnmount, computed, type Ref } from 'vue'
import type { Message, Contact, User } from '@/modules/TalkStream/types'
import ScrollDownButtonIcon from '@/modules/TalkStream/Components/Icons/ScrollDownButtonIcon.vue'
import MessageGroup from '@/modules/TalkStream/Components/MessageGroup.vue'
import MessageItem from '@/modules/TalkStream/Components/MessageItem.vue'

// ✅ 1. Строгая типизация props
const props = defineProps<{
  userFrom: User | null
  contact: Contact | null
  messages: Message[]
  isOnline: boolean
}>()

// ✅ 2. Строгая типизация refs (HTMLElement для DOM, ReturnType для setTimeout)
const historyContainer = ref<HTMLElement | null>(null)
const showScrollButton = ref<boolean>(false)
const scrollTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

// ✅ 3. Интерфейс для сгруппированных сообщений
interface GroupedMessage {
  from_id: number
  messages: Message[]
}

const groupedMessages = computed<GroupedMessage[]>(() => {
  const groups: GroupedMessage[] = []
  let currentGroup: GroupedMessage | null = null

  props.messages.forEach((msg) => {
    if (!currentGroup || msg.from_id !== currentGroup.from_id) {
      currentGroup = {
        from_id: msg.from_id,
        messages: [msg]
      }
      groups.push(currentGroup)
    } else {
      currentGroup.messages.push(msg)
    }
  })

  return groups
})

// ✅ 4. Строгая типизация параметров функции скролла
function smoothScrollTo(element: HTMLElement, to: number, duration: number): void {
  const start = element.scrollTop
  const change = to - start
  let currentTime = 0
  const increment = Math.min(Math.max(duration / 20, 10), 20)

  function easeInOut(t: number): number {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
  }

  function animateScroll(): void {
    currentTime += increment
    const val = easeInOut(currentTime / duration) * change + start
    element.scrollTop = val
    if (currentTime < duration) {
      setTimeout(animateScroll, increment)
    } else {
      element.scrollTop = to
    }
  }

  animateScroll()
}

const scrollToBottom = (duration: number = 300): void => {
  const container = historyContainer.value
  if (!container) return

  const targetScrollTop = container.scrollHeight - container.clientHeight
  smoothScrollTo(container, targetScrollTop, duration)
  showScrollButton.value = false
}

const scrollToBottomAfterRender = (duration: number = 300): void => {
  const container = historyContainer.value
  if (!container) return

  if (scrollTimeout.value) {
    clearTimeout(scrollTimeout.value)
    scrollTimeout.value = null
  }

  scrollTimeout.value = setTimeout(() => {
    scrollToBottom(duration)
  }, 50)
}

const checkScrollPosition = (): void => {
  const container = historyContainer.value
  if (!container) return

  const threshold = 100
  const isAtBottom =
      container.scrollHeight -
      container.scrollTop -
      container.clientHeight <= threshold

  showScrollButton.value = !isAtBottom
}

watch(
    () => props.messages.length,
    (newLength: number, oldLength: number) => {
      if (newLength <= oldLength) return

      const container = historyContainer.value
      if (!container) return

      const isAtBottom =
          container.scrollHeight -
          container.scrollTop -
          container.clientHeight <= 100

      if (isAtBottom) {
        scrollToBottomAfterRender(400)
      } else {
        showScrollButton.value = true
      }
    }
)

onMounted(() => {
  if (historyContainer.value) {
    scrollToBottomAfterRender(300)
  }
})

onBeforeUnmount(() => {
  if (scrollTimeout.value) {
    clearTimeout(scrollTimeout.value)
    scrollTimeout.value = null
  }
})

// ✅ 5. Явное предоставление метода родителю
defineExpose({
  scrollToBottom
})
</script>

<style lang="scss" scoped>
/* Стили остаются без изменений, они валидны */
.talkstream-history-container {
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 8px;
  box-shadow: inset 0 0 3px 2px #7bb0d9e8;
  background-color: rgb(46, 47, 52);
}

.spacer {
  flex: 1 0 auto;
}

.talkstream-history {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0px 4px 4px 0px;
  margin-left: 4px;
  margin-top: 4px;
  margin-right: 4px;
  margin-bottom: 4px;
  max-height: calc(100vh - 180px);
  overflow-y: auto;

  &::-webkit-scrollbar {
    height: 90%;
    width: 8px;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-track {
    border-radius: 4px;
    background: rgba(65, 66, 73, 0.93);
  }

  &::-webkit-scrollbar-thumb {
    min-height: 25px;
    background: #888;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
}

.scroll-down-button {
  position: absolute;
  border-radius: 50%;
  border: 1px solid white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 100;
  opacity: 0;
  pointer-events: all;
  color: #262626;
  background-color: #fff;
  width: 32px;
  height: 32px;
  bottom: 60px;
  right: 17px;
  overflow: hidden;
  transform: translateY(10px);
  box-shadow: inset 0 0 0 1px #ededed;

  &:hover {
    opacity: 1 !important;
    background-color: #3a465b;
    color: #9f9d9d;
    transform: scale(1.05) translateY(0) !important;
  }

  svg {
    width: 16px;
    height: 11px;
    fill: #2e2f34;
    stroke: #2e2f34;
    transition: fill 0.2s ease;
  }

  &:hover svg {
    fill: #9f9d9d;
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
