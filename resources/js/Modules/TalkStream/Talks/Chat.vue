<template>
  <div class="chat-container">
    <!-- Заголовок -->
    <div class="chat-header">
      {{ selectedContact.name || 'Выберите контакт' }}
    </div>

    <!-- История -->
    <div class="chat-messages" ref="messagesContainer">
      <MessageItem
          v-for="message in messages"
          :key="message.id"
          :message="message"
          :contact="contactStore"
      />
    </div>

    <!-- Форма отправки -->
    <form class="chat-form" @submit.prevent="send">
      <input v-model="newMessage" placeholder="Напишите сообщение..." />
      <button type="submit">Отправить</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useContactStore } from '@/modules/TalkStream/Stores/contactStore'
import { friendStore } from '@/modules/TalkStream/Stores/friendStore'

const route = useRoute()
const contactStore = useContactStore()
const useFriendStore = friendStore()

const contactId = Number(route.query.to)
const messages = ref([])
const newMessage = ref('')
const messagesContainer = ref(null)

onMounted(async () => {
  if (!contactId) return

  // Загрузка истории
  messages.value = await contactStore.getHistory(contactId)

  // Подписка на новые сообщения
  if (window.Echo && contactId) {
    window.Echo.private(`chat.${contactId}`)
        .listen('.NewMessage', (e) => {
          messages.value.push(e.message)
          scrollToBottom()
        })
  }

  // Получаем текущий контакт
  selectedContact.value = contactStore.contacts.find(c => c.id === contactId)
  if (!selectedContact.value) {
    selectedContact.value = await contactStore.getContact(contactId)
  }
})

function send() {
  if (!newMessage.value.trim()) return
  contactStore.sendMessage(newMessage.value, contactId)
  newMessage.value = ''
  scrollToBottom()
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}
</script>

<style scoped lang="scss">
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 100%;
}

.chat-header {
  padding: 1rem;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  font-weight: 600;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background-color: #f9f9f9;
  min-height: 300px;
}

.chat-form {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background-color: #fff;
  border-top: 1px solid #eee;

  input {
    flex: 1;
    padding: 0.5rem 0.75rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 0.9rem;
  }

  button {
    margin-left: 0.5rem;
    padding: 0.5rem 1rem;
    background-color: #42b983;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      background-color: #36a871;
    }
  }
}
</style>
