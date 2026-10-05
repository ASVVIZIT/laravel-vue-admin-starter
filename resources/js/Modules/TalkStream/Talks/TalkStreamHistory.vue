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
            :avatar-url="getAvatarUrl(group.from_id)"
            :is-mine="isMine(group.from_id)"
            :messages="group.messages"
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

    <!-- КНОПКА-ШТОРКА: Появляется, если есть новые сообщения и пользователь не внизу -->
    <button
        class="scroll-down-button"
        :class="{ visible: showScrollButton }"
        @click="handleScrollToBottomAndMarkRead"
    >
      <ScrollDownButtonIcon />
      <!-- Счетчик новых сообщений -->
      <span v-if="newMessagesCount > 0" class="new-messages-badge">
        {{ newMessagesCount }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, defineExpose, watch, onMounted, onBeforeUnmount, computed, nextTick } from 'vue'
import type { Message, Contact, User } from '@/modules/TalkStream/types'
import ScrollDownButtonIcon from '@/modules/TalkStream/Components/Icons/ScrollDownButtonIcon.vue'
import MessageGroup from '@/modules/TalkStream/Components/MessageGroup.vue'
import MessageItem from '@/modules/TalkStream/Components/MessageItem.vue'
import { useChatStore } from '@/modules/TalkStream/Stores/chatStore'
import { TalkStreamAPI } from '@/modules/TalkStream/api/talkstream' // 🔥 НОВОЕ (3a)
import { userStore } from '@/store/userStore'

// 1. Строгая типизация props
const props = defineProps<{
  userFrom: User | null
  contact: Contact | null
  messages: Message[]
  isOnline: boolean
}>()

const chatStore = useChatStore()
const useUserStore = userStore()

// 2. Строгая типизация refs
const historyContainer = ref<HTMLElement | null>(null)
const showScrollButton = ref<boolean>(false)
const newMessagesCount = ref<number>(0)

// 3. Интерфейс для сгруппированных сообщений
interface GroupedMessage {
  from_id: number
  messages: Message[]
}

// 4. Группировка сообщений по отправителю (для аватарок и пузырей)
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

// 4.5. Хелперы для MessageGroup (вся логика "кто я" живёт здесь, в мозге)
// Фолбэк на userStore гарантирует работу даже если userFrom ещё null
const isMine = (fromId: number): boolean => {
  const currentUserId = props.userFrom?.id ?? useUserStore.id
  return currentUserId === fromId
}

const getAvatarUrl = (fromId: number): string => {
  if (isMine(fromId)) {
    // Моё сообщение → мой аватар (бэкенд уже подставил по полу)
    return props.userFrom?.avatar || useUserStore.avatar || '/images/avatar-main.png'
  }
  // Сообщение собеседника → его аватар
  return props.contact?.avatar || '/images/avatar-main.png'
}

// 🔥 НОВОЕ (проблема 1): единая точка отметки прочтения.
// Локально мутируем ВСЕГДА (оптимистично, мгновенно сбрасываем счётчик на моём экране).
// Сетевой POST /read шлём ТОЛЬКО если реально были непрочитанные (гейт по unreadCount) —
// так исключаем спам запросами, когда читать нечего.
const markCurrentChatAsRead = (): void => {
  const contactId = props.contact?.id
  if (!contactId) return

  const hadUnread = chatStore.unreadCount > 0

  chatStore.markAsRead(contactId) // локально (сущ. метод стора)

  if (hadUnread) {
    // fire-and-forget: не блокируем UI, ошибку пишем в консоль
    TalkStreamAPI.markAsRead(contactId).catch((error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('[TalkStreamHistory] Failed to POST /read:', errorMessage)
    })
  }
}

// 5. Плавный скролл вниз с использованием нативного API (аппаратное ускорение)
const scrollToBottom = (duration: number = 300): void => {
  const container = historyContainer.value
  if (!container) return

  container.scrollTo({
    top: container.scrollHeight,
    behavior: 'smooth'
  })

  showScrollButton.value = false
  newMessagesCount.value = 0
}

// 6. Скролл после рендера новых сообщений (гарантия, что DOM обновился)
const scrollToBottomAfterRender = async (): Promise<void> => {
  const container = historyContainer.value
  if (!container) return

  await nextTick()
  container.scrollTo({
    top: container.scrollHeight,
    behavior: 'smooth'
  })
}

// 7. Обработка скролла: проверка позиции и отметка "Прочитано"
const checkScrollPosition = (): void => {
  const container = historyContainer.value
  if (!container) return

  const threshold = 100
  const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight <= threshold

  showScrollButton.value = !isAtBottom

  // Если пользователь вручную доскроллил почти до низа, считаем, что он прочитал сообщения
  if (isAtBottom && newMessagesCount.value > 0 && props.contact) {
    newMessagesCount.value = 0
    markCurrentChatAsRead() // 🔥 было chatStore.markAsRead(props.contact.id)
  }
}

// 8. Комплексное действие: скролл вниз + сброс счетчика + отметка "Прочитано"
const handleScrollToBottomAndMarkRead = (): void => {
  scrollToBottom()
  markCurrentChatAsRead() // 🔥 было if(props.contact){ chatStore.markAsRead(...) }
}

// 9. Реакция на появление новых сообщений
watch(
    () => props.messages.length,
    (newLength: number, oldLength: number) => {
      // Игнорируем удаления или начальную загрузку
      if (newLength <= oldLength) return

      const container = historyContainer.value
      if (!container) return

      const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight <= 100

      if (isAtBottom) {
        // Если пользователь уже внизу, плавно скроллим за новым сообщением
        scrollToBottomAfterRender()
        // 🔥 НОВОЕ (проблема 1): входящее, увиденное внизу, сразу отмечает прочтение.
        // Без этого галочки у отправителя горели бы только после скролла/клика читателя.
        // Дабла нет: программный scrollTo триггерит checkScrollPosition, но там
        // newMessagesCount === 0 (в этой ветке не инкрементился) → повторного вызова не будет.
        markCurrentChatAsRead()
      } else {
        // Если пользователь читает историю вверху, показываем шторку и увеличиваем счетчик
        showScrollButton.value = true
        newMessagesCount.value++
      }
    }
)

// 10. Инициализация при монтировании
onMounted(() => {
  if (historyContainer.value) {
    scrollToBottomAfterRender()
  }
})

// 11. Очистка (на всякий случай, хотя утечек здесь нет)
onBeforeUnmount(() => {
  // Ресурсы освобождены
})

// 12. Предоставление метода родителю (если понадобится вызвать из TalkStream.vue)
defineExpose({
  scrollToBottom
})
</script>

<style lang="scss" scoped>
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
  width: 36px;
  height: 36px;
  bottom: 60px;
  right: 17px;
  overflow: visible;
  transform: translateY(10px);
  box-shadow: inset 0 0 0 1px #ededed, 0 4px 12px rgba(0, 0, 0, 0.15);

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
    opacity: 0.9;
    transform: translateY(0);
    pointer-events: auto;
  }
}

/* СТИЛИ ДЛЯ БЕЙДЖА НОВЫХ СООБЩЕНИЙ */
.new-messages-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background-color: #ef4444;
  color: white;
  font-size: 0.65rem;
  font-weight: bold;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 2px solid rgb(46, 47, 52);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes popIn {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
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
