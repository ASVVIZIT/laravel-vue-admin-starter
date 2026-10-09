<template>
  <div
      class="message-wrapper"
      :class="{
      'message-mine': isMine,
      'message-theirs': !isMine,
      'group-top': isFirstInGroup,
      'group-bottom': isLastInGroup,
      'wide-message': isWideMessage,
      'narrow-message': !isWideMessage
    }"
  >
    <div
        class="message-bubble"
        :class="{
        'group-top': isFirstInGroup,
        'group-bottom': isLastInGroup,
        'wide': isWideMessage,
        'narrow': !isWideMessage
      }"
    >
      <div class="message-content">{{ message.content }}</div>

      <div class="message-footer">
        <div class="message-meta">
          {{ message.formatted_created_at }}
        </div>

        <!-- 🔥 НОВОЕ (Шаг 6): ⋮ переключатель времени прочтения.
             Показывается только на своих сообщениях, где собеседник реально прочитал
             (formatted_read_at непустой). Клик — toggle, не ховер (надёжнее на тач). -->
        <span
            v-if="hasReadReceipt"
            class="read-receipt-toggle"
            @click.stop="toggleReadTime"
            :title="showReadTime ? 'Скрыть время прочтения' : 'Показать время прочтения'"
        >⋮</span>

        <!-- Галочки ТОЛЬКО на своих сообщениях (Telegram-логика) -->
        <div v-if="isMine" class="message-status">
          <!-- 🔥 НОВОЕ (Шаг 6): ветка ошибки отправки. Клик = retry. -->
          <span
              v-if="isFailed"
              class="status-icon status-failed"
              title="Не отправлено. Нажмите, чтобы повторить"
              @click.stop="handleRetry"
          >✖</span>

          <!-- 🔥 НОВОЕ (Шаг 6): раскрытое время прочтения (вместо галочек, пока ⋮ нажат) -->
          <span
              v-else-if="showReadTime"
              class="read-receipt-text"
          >Прочитано: {{ message.formatted_read_at }}</span>

          <!-- Обычные галочки (sending / delivered / read / unread) -->
          <span
              v-else
              :class="['status-icon', statusClass]"
              :title="statusTooltip"
          >{{ statusIcon }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Message, Contact, User } from '@/modules/TalkStream/Types/talkStreamType'
import { userStore } from '@/store/userStore.js'
// 🔥 НОВОЕ (Шаг 6): импорт стора для retryMessage.
// Логика retry живёт рядом с логикой статусов (statusClass/statusIcon/statusTooltip),
// что естественно для презентационного пузыря. MessageGroup остаётся тупым.
import { useChatStore } from '@/modules/TalkStream/Stores/chatStore'

const props = defineProps<{
  userFrom?: User | null
  contact?: Contact | null
  message: Message
  isOnline?: boolean
  isFirstInGroup?: boolean
  isLastInGroup?: boolean
  isGroupStart?: boolean
}>()

const useUserStore = userStore()
const chatStore = useChatStore()

// 🔥 НОВОЕ (Шаг 6): локальное состояние раскрытия ⋮
const showReadTime = ref<boolean>(false)

// ИСПРАВЛЕНО: моё сообщение = from_id совпадает с ID авторизованного пользователя
const isMine = computed((): boolean => {
  return props.message.from_id === useUserStore.id
})

// Ширина сообщения для скругления углов
const isWideMessage = computed((): boolean => props.message.content.length < 40)

// 🔥 НОВОЕ (Шаг 6): есть ли что показывать в ⋮ (своё + собеседник прочитал)
const hasReadReceipt = computed((): boolean => {
  return isMine.value && !!props.message.formatted_read_at
})

// 🔥 НОВОЕ (Шаг 6): сообщение упало при отправке
const isFailed = computed((): boolean => {
  return props.message.status === 'failed'
})

// 🔥 НОВОЕ (Шаг 6): toggle ⋮
const toggleReadTime = (): void => {
  showReadTime.value = !showReadTime.value
}

// 🔥 НОВОЕ (Шаг 6): повторная отправка failed-сообщения
const handleRetry = (): void => {
  chatStore.retryMessage(props.message.id)
}

// Класс для цвета/анимации галочек
const statusClass = computed((): string => {
  switch (props.message.status) {
    case 'read':
      return 'status-sent-read'
    case 'delivered':
      return 'status-sent-delivered'
    case 'sending':
      return 'status-sending'
    default:
      return 'status-sent-unread'
  }
})

// Иконка статуса
const statusIcon = computed((): string => {
  switch (props.message.status) {
    case 'read':
      return '✔✔'
    case 'delivered':
      return '✔✔'
    case 'sending':
      return '🕒'
    default:
      return '✔'
  }
})

// Подсказка при наведении
const statusTooltip = computed((): string => {
  switch (props.message.status) {
    case 'read':
      return 'Прочитано'
    case 'delivered':
      return 'Доставлено'
    case 'sending':
      return 'Отправка...'
    default:
      return 'Отправлено'
  }
})
</script>

<style lang="scss" scoped>
// БАЗОВЫЕ ЦВЕТА (Telegram Dark Style)
$color-mine-bg: #2b5278;       // Синий (Мои сообщения)
$color-theirs-bg: #182533;     // Тёмно-серый (Чужие сообщения)
$color-text: #ffffff;          // Белый текст
$color-meta: rgba(255, 255, 255, 0.5); // Полупрозрачный серый для времени

.message-wrapper {
  display: flex;
  width: 100%;
  margin-bottom: 6px;
  position: relative;
  box-sizing: border-box;

  // МОИ сообщения — пузырь прижимается СПРАВА
  &.message-mine {
    justify-content: flex-end;
    padding-right: 8px;
  }

  // ЧУЖИЕ сообщения — пузырь прижимается СЛЕВА
  &.message-theirs {
    justify-content: flex-start;
    padding-left: 8px;
  }
}

.message-bubble {
  max-width: 100%;        // ПОТОЛОК = ширина контейнера; сам пузырь сжимается по контенту
  min-width: 80px;
  padding: 8px 12px;
  border-radius: 12px;
  position: relative;
  word-break: break-word;
  color: $color-text;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  transition: background-color 0.2s ease;

  // ЦВЕТ + ХВОСТИК для моих
  .message-wrapper.message-mine & {
    background-color: $color-mine-bg;
    border-bottom-right-radius: 4px;
  }

  // ЦВЕТ + ХВОСТИК для чужих
  .message-wrapper.message-theirs & {
    background-color: $color-theirs-bg;
    border-bottom-left-radius: 4px;
  }

  // СРЕДНЕЕ в группе — все углы острые (склеивается с соседями)
  &:not(.group-top):not(.group-bottom) {
    border-radius: 4px;
  }

  // ВЕРХНЕЕ в группе — нижние углы острые
  &.group-top:not(.group-bottom) {
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
  }

  // НИЖНЕЕ в группе — верхние углы скруглённые
  &.group-bottom:not(.group-top) {
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
  }

  // ОДИНОЧНОЕ — все углы скруглённые
  &.group-top.group-bottom {
    border-radius: 12px;
  }
}

.message-content {
  font-size: 0.95rem;
  line-height: 1.4;
  white-space: pre-wrap;
  margin-bottom: 4px;
}

.message-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-size: 0.7rem;
  color: $color-meta;
  margin-top: 2px;
  gap: 6px;
}

.message-meta {
  margin-right: 2px;
}

.message-status {
  display: flex;
  align-items: center;
}

.status-icon {
  display: inline-block;
  font-size: 0.85rem;
  line-height: 1;
  letter-spacing: -1px;
  transition: color 0.2s ease, transform 0.2s ease;
}

// 🔥 НОВОЕ (Шаг 6): ⋮ переключатель времени прочтения
.read-receipt-toggle {
  cursor: pointer;
  font-size: 0.85rem;
  line-height: 1;
  color: $color-meta;
  user-select: none;
  transition: color 0.2s ease;

  &:hover {
    color: #4fc3f7;
  }
}

// 🔥 НОВОЕ (Шаг 6): текст раскрытого времени прочтения
.read-receipt-text {
  font-size: 0.65rem;
  color: #4fc3f7;
  white-space: nowrap;
}

// 🔥 НОВОЕ (Шаг 6): крестик ошибки отправки (кликабельный retry)
.status-failed {
  color: #ef4444;
  cursor: pointer;
  font-size: 0.85rem;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.2);
  }
}

// СТАТУСЫ (ЦВЕТА ГАЛОЧЕК)
.status-sent-unread {
  color: rgba(255, 255, 255, 0.6);
}

.status-sent-delivered {
  color: rgba(255, 255, 255, 0.8);
}

// Анимация прочтения (Синяя вспышка + пульс)
.status-sent-read {
  color: #4fc3f7;
  animation: readPulse 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  text-shadow: 0 0 6px rgba(79, 195, 247, 0.4);
}

// Часы при отправке
.status-sending {
  color: rgba(255, 255, 255, 0.5);
  animation: clockPulse 1.2s infinite ease-in-out;
}

// Входящие галочки (зарезервировано на будущее)
.status-received {
  color: #34C759;
}

@keyframes readPulse {
  0% { transform: scale(0.9); opacity: 0.7; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes clockPulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.9; transform: scale(1.1); }
}

// АДАПТИВ ДЛЯ УЗКИХ ЭКРАНОВ (МОБИЛЬНЫЕ) — всё влево
@media (max-width: 768px) {
  .message-wrapper.message-mine {
    justify-content: flex-start;
    padding-right: 0;
    padding-left: 8px;
  }

  .message-wrapper.message-mine .message-bubble {
    border-bottom-right-radius: 12px;
    border-bottom-left-radius: 4px;
  }
}
</style>
