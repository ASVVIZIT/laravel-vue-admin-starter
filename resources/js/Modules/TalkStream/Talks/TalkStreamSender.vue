<template>
  <div class="talkstream-sender">
    <textarea
        v-model="message"
        @input="adjustHeight"
        placeholder="Введите сообщение..."
        :rows="rows"
        ref="textarea"
    ></textarea>
    {{props.contact.id}}
    <button @click="sendMessage">Отправить</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { defineProps, defineEmits } from 'vue'

const props = defineProps(['contact'])
const emit = defineEmits(['send'])

const message = ref('')
const rows = ref(3)
const textarea = ref(null)

const MAX_ROWS = 10

function adjustHeight() {
  const textareaEl = textarea.value
  if (!textareaEl) return

  textareaEl.style.height = 'auto'
  textareaEl.style.height = `${Math.min(textareaEl.scrollHeight / 16, MAX_ROWS)}rem`
}

function sendMessage() {
  if (message.value.trim()) {
    emit('send', { content: message.value, to_id: props.contact.id })
    message.value = ''
  }
}
</script>

<style module lang="scss">
.talkstream-sender {
  display: flex;
  padding: 1rem;
  border-top: 1px solid #eaeaea;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin: 1rem;
}

textarea {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: none;
  overflow-y: auto;
  min-height: 4rem;
  max-height: 10rem;
  transition: height 0.2s ease;
}

button {
  padding: 0.5rem 1rem;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 0.5rem;

  &:hover {
    background-color: #36a871;
  }
}
</style>
