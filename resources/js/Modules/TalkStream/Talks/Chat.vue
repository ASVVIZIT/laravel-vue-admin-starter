<template>
  <div class="chat-container">
    <!-- Заголовок -->
    <div class="chat-header">
      {{ selectedContact?.name || 'Выберите контакт' }}
    </div>

    <!-- История -->
    <div class="chat-messages" ref="messagesContainer">
      <MessageItem
          v-for="message in messages"
          :key="message.id"
          :message="message"
          :contact="selectedContact"
      />
    </div>

    <!-- Форма отправки -->
    <form class="chat-form" @submit.prevent="send">
      <input v-model="newMessage" placeholder="Напишите сообщение..." />
      <button type="submit" :disabled="!newMessage.trim()">Отправить</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import { useContactStore } from '@/modules/TalkStream/Stores/contactStore'
import { useChatStore } from '@/modules/TalkStream/Stores/chatStore' // Используем chatStore для истории
import { useFriendStore } from '@/modules/TalkStream/Stores/friendStore'
import type { Contact, Message } from '@/modules/TalkStream/types'
import MessageItem from '@/modules/TalkStream/Components/MessageItem.vue'

const route = useRoute()
const contactStore = useContactStore()
const chatStore = useChatStore()
const friendStore = useFriendStore()

// ✅ Строгая типизация refs
const contactId = Number(route.query.to)
const messages = ref<Message[]>([])
const newMessage = ref<string>('')
const messagesContainer = ref<HTMLElement | null>(null)
const selectedContact = ref<Contact | null>(null)

onMounted(async () => {
  if (!contactId) return

  // Загрузка истории через chatStore (стандартный паттерн)
  await chatStore.loadHistory(contactId)
  messages.value = chatStore.messages

  // Подписка на новые сообщения (если Echo доступен)
  if (window.Echo && contactId) {
    window.Echo.private(`chat.${contactId}`)
        .listen('.NewMessage', (e: { message: Message }) => {
          messages.value.push(e.message)
          scrollToBottom()
        })
  }

  // Получаем текущий контакт
  selectedContact.value = contactStore.contacts.find(c => c.id === contactId) || null

  if (!selectedContact.value) {
    // Если контакта нет в локальном списке, можно запросить его отдельно (если есть такой метод в API)
    // selectedContact.value = await contactStore.getContact(contactId)
  }
})

function send(): void {
  if (!newMessage.value.trim() || !selectedContact.value) return

  chatStore.sendMessage(selectedContact.value.id, newMessage.value)
  newMessage.value = ''
  scrollToBottom()
}

function scrollToBottom(): void {
  const container = messagesContainer.value
  if (container) {
    container.scrollTop = container.scrollHeight
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
    outline: none;

    &:focus {
      border-color: #42b983;
    }
  }

  button {
    margin-left: 0.5rem;
    padding: 0.5rem 1rem;
    background-color: #42b983;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover:not(:disabled) {
      background-color: #36a871;
    }

    &:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
  }
}
</style>
