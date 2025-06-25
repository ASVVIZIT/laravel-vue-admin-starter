<template>
  <form class="talkstream-sender" @submit.prevent="send">
    <div class="sender-input-wrapper">
      <textarea
        v-model="message"
        @input="adjustHeight"
        @keydown.enter="handleEnter"
        placeholder="Введите сообщение..."
        ref="textarea"
        :rows="rows"
      />
      <button type="submit" :disabled="!message.trim()">
        <SendPlaneIcon />
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { defineProps, defineEmits } from 'vue'
import SendPlaneIcon from '@/modules/TalkStream/Components/Icons/SendPlaneIcon.vue'
const props = defineProps(['contact'])
const emit = defineEmits(['send'])

const message = ref('')
const textarea = ref(null)
const rows = ref(3)
const MAX_ROWS = 6

function adjustHeight() {
  const el = textarea.value
  if (!el) return

  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight / 16, MAX_ROWS)}rem`
}

function handleEnter(e) {
  if (e.shiftKey || e.ctrlKey || e.metaKey) return

  e.preventDefault()
  send()
}

function send() {
  if (!message.value.trim()) return

  emit('send', {
    content: message.value,
    to_id: props.contact.id
  })

  message.value = ''
  adjustHeight()
}
</script>
<style lang="scss">
.talkstream-sender {
  position: relative;
  padding: 0.4rem 0.2rem 0.4rem 0.2rem;
  background-color: #fff;
  border-top: 1px solid #eee;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.05);
}

 .send-button {
   background-color: #3490dc;
   color: white;
   padding: 0.4rem 0.8rem;
   border-radius: 20px;
   font-size: 0.85rem;
   display: flex;
   align-items: center;
   gap: 0.4rem;
   transition: all 0.2s ease;
 }

.send-button:hover {
  background-color: #2779bf;
}

.send-button .send-icon svg {
  transform: rotate(45deg);
  transition: transform 0.3s ease;
}

.send-button:hover .send-icon svg {
  transform: rotate(15deg) translateX(2px);
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
