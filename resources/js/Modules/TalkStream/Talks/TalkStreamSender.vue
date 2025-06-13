<template>
  <form class="talkstream-sender" @submit.prevent="send">
    <textarea
        v-model="message"
        @input="adjustHeight"
        placeholder="Введите сообщение..."
        ref="textarea"
    />
    <button type="submit">Отправить</button>
  </form>
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
  const el = textarea.value
  if (!el) return

  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight / 16, MAX_ROWS)}rem`
}

function send() {
  if (!message.value.trim()) return

  emit('send', {
    content: message.value,
    to_id: props.contact.id
  })

  message.value = ''
}
</script>
