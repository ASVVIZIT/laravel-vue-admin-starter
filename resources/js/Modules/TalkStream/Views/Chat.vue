<template>
  <div class="chat">
    <h2>Чат с {{ selectedContact?.name }}</h2>

    <div class="messages">
      <div v-for="(msg, index) in chat.messages" :key="index" class="message">
        {{ msg.content }}
      </div>
    </div>

    <form @submit.prevent="send" class="chat-form">
      <input v-model="message" placeholder="Напишите сообщение..." />
      <button type="submit">Отправить</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useChatStore } from '@/modules/TalkStream/Stores/chatStore'

const route = useRoute()
const router = useRouter()
const chat = useChatStore()
const message = ref('')
const selectedContact = ref(null)

const contactId = route.query.to

if (contactId) {
  selectedContact.value = contactId
  chat.loadHistory(contactId)
}

onMounted(() => {
  if (!window.Echo) return

  window.Echo.private(`chat.${contactId}`)
      .listen('.NewMessage', (e) => {
        chat.addMessage(e.message)
      })
})

function send() {
  if (!message.value.trim()) return
  chat.sendMessage(message.value, contactId)
  message.value = ''
}
</script>

<style scoped>
.chat {
  padding: 1rem;
}

.messages {
  max-height: 500px;
  overflow-y: auto;
  border: 1px solid #eee;
  padding: 10px;
  height: 400px;
  margin-bottom: 10px;
}

.message {
  margin-bottom: 10px;
}

.chat-form input {
  width: 80%;
  padding: 10px;
  margin-right: 10px;
}

.chat-form button {
  padding: 10px 20px;
}
</style>
