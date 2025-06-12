<template>
  <div class="chat">
    <h3>Чат с {{ selectedContact?.name }}</h3>

    <MessageList :messages="messages" />

    <form @submit.prevent="send" class="chat-form">
      <input v-model="newMessage" placeholder="Напишите сообщение..." />
      <button type="submit">Отправить</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useChatStore } from '@/modules/TalkStream/Stores/chatStore'
import { useContactStore } from '@/modules/TalkStream/Stores/contactStore'
import MessageList from '@/modules/TalkStream/Components/MessageList.vue'

const router = useRouter()
const route = useRoute()
const chatStore = useChatStore()
const contactStore = useContactStore()

const newMessage = ref('')
const messages = ref([])
const selectedContact = ref(null)

const contactId = Number(route.query.to)

onMounted(async () => {

  if (isNaN(contactId)) {
    console.warn('[Chat] to_id не указан или неверный')
    await router.push({name: 'contacts.list'})
  }

  if (!contactId) return

  if (!contactStore.contacts.length) await contactStore.loadContacts()

  // Получаем собеседника
  selectedContact.value = contactStore.contacts.find(c => c.id === contactId)

  if (!selectedContact.value && !isNaN(contactId)) {
    try {
      selectedContact.value = await contactStore.getContact(contactId)
    } catch (e) {
      console.error('[Chat] Не удалось загрузить контакт:', e)
    }
  }

  // Загружаем историю
  messages.value = await chatStore.loadHistory(contactId)

  // Подписка на новые сообщения
  if (window.echoTalkStream && contactId) {
    window.echoTalkStream.private(`chat.${contactId}`)
        .listen('.NewMessage', (e) => {
          messages.value.push(e.message)
        })
  }
})

function send() {
  if (!newMessage.value.trim()) return

  chatStore.sendMessage(newMessage.value, contactId)
  newMessage.value = ''
}
</script>

<style scoped>
.chat {
  padding: 1rem;
  max-width: 500px;
  margin: auto;
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
