<template>
  <form class="talkstream-sender" @submit.prevent="send">
    <div class="sender-input-wrapper">
      <textarea
          ref="textarea"
          v-model="message"
          @input="adjustHeight"
          @keydown="handleKeydown"
          placeholder="Введите сообщение..."
          :rows="rows"
          autofocus
      />

      <!--
        Лоадер вешаем НЕ на сам button, а на обёртку.
        Иначе директива может вставлять свой inline-хост внутрь кнопки
        и ломать фокус / сабмит / поведение textarea.
      -->
      <div
          class="sender-button-wrap"
          v-loading-talkstream-inline.sender
      >
        <button
            type="submit"
            :disabled="!message.trim()"
        >
          <SendPlaneIcon />
        </button>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, watch } from 'vue'

import SendPlaneIcon from '@/modules/TalkStream/Components/Icons/IconSendPlane.vue'

// ✅ Строгая типизация Props
// Поле ввода специально не блокируется пропом sending:
// сейчас тестовый режим, нужно быстро вставлять и отправлять сообщения.
const props = defineProps<{
  contact: {
    id: number
  }
}>()

// ✅ Строгая типизация Emits
const emit = defineEmits<{
  send: [data: { content: string; to_id: number }]
}>()

const message = ref<string>('')
const textarea = ref<HTMLTextAreaElement | null>(null)
const rows = ref<number>(3)
const MAX_ROWS = 6

function focusInput(): void {
  nextTick(() => {
    textarea.value?.focus()
  })
}

function adjustHeight(): void {
  const el = textarea.value
  if (!el) return

  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight / 16, MAX_ROWS)}rem`
}

/**
 * Enter отправляет сообщение, если поле в фокусе.
 *
 * Перенос строки оставляем для:
 *   Shift + Enter
 *   Ctrl + Enter
 *   Meta + Enter
 *   Alt + Enter
 *
 * Также не отправляем во время IME-композиции, чтобы китайский/японский/другой
 * ввод не дёргал сабмит до подтверждения символа.
 */
function handleKeydown(event: KeyboardEvent): void {
  if (event.key !== 'Enter') {
    return
  }

  if (
      event.shiftKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      event.isComposing
  ) {
    return
  }

  event.preventDefault()
  send()
}

function send(): void {
  const text = message.value.trim()

  if (!text) {
    return
  }

  emit('send', {
    content: text,
    to_id: props.contact.id
  })

  message.value = ''

  nextTick(() => {
    adjustHeight()
    focusInput()
  })
}

onMounted(() => {
  focusInput()
  adjustHeight()
})

// При смене контакта тоже возвращаем фокус в поле ввода.
watch(
    () => props.contact?.id,
    () => {
      focusInput()
    }
)
</script>

<style lang="scss" scoped>
.talkstream-sender {
  position: relative;
  padding: 0.4rem 0.2rem 0.4rem 0.2rem;
  background-color: #fff;
  border-top: 1px solid #eee;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.05);
}

.sender-input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
}

.sender-input-wrapper textarea {
  flex: 1;
  min-height: 2.5rem;
  max-height: 10rem;
  height: auto;
  padding: 0.5rem 0.75rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 0.95rem;
  resize: none;
  overflow-y: auto;
  transition: all 0.2s ease;
  background-color: #f9f9f9;
  outline: none;
  width: 100%;
  box-sizing: border-box;

  &:focus {
    border-color: #42b983;
    background-color: #f0fff7;
    box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.2);
  }
}

.sender-button-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  flex-shrink: 0;
}

.sender-input-wrapper button {
  padding: 0.5rem 1rem;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  flex-shrink: 0;
  min-width: 80px;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;

  &:hover {
    border-color: #42b983;
    color: #1f2d3d;
    background-color: #f0fff7;
    box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.2);
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    opacity: 0.6;
  }
}
</style>
