<template>
  <div class="talkstream-container">
    <!-- Список контактов -->
    <TalkStreamContacts @select="handleSelectContact" />

    <!-- Чат -->
    <div class="talkstream-chat">
      <TalkStreamHeader
          :contact="selectedContact"
          :is-online="contactStore.isOnline(selectedContact.id)"
      />
      <TalkStreamHistory
          ref="history"
          v-if="selectedContact"
          :contact="selectedContact"
          :userFrom="contactStore.userFrom"
          :messages="messages"
          :is-online="contactStore.isOnline(selectedContact.id)"
      />
      <TalkStreamSender
          v-if="selectedContact"
          :contact="selectedContact"
          @send="handleSendMessage"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useContactStore } from '@/modules/TalkStream/Stores/contactStore'
import { useChatStore } from '@/modules/TalkStream/Stores/chatStore'
import { friendStore } from '@/modules/TalkStream/Stores/friendStore'
import { userStore } from '@/store/user'
import { setupPresenceChannel } from '@/modules/TalkStream/Subscriptions/userOnlinePresenceHandler'
import { setupFriendRequestsChannel } from '@/modules/TalkStream/Subscriptions/friendshipEventsHandler'
import TalkStreamContacts from '@/modules/TalkStream/Talks/TalkStreamContacts.vue'
import TalkStreamHeader from '@/modules/TalkStream/Talks/TalkStreamHeader.vue'
import TalkStreamHistory from '@/modules/TalkStream/Talks/TalkStreamHistory.vue'
import TalkStreamSender from '@/modules/TalkStream/Talks/TalkStreamSender.vue'

const router = useRouter()
const chatStore = useChatStore()
const contactStore = useContactStore()
const useFriendStore = friendStore()
const useUserStore = userStore()

// Состояние для хранения выбранного контакта
const selectedContact = ref(null)
const history = ref(null)
const messages = computed(() => chatStore.messages)

// Обработчик выбора контакта
const handleSelectContact = (contact) => {

  console.log('handleSelectContact ', contact)
  selectedContact.value = contact
  localStorage.setItem('last-selected-contact', contact.id)
  // Загрузка истории
  chatStore.loadHistory(contact.id)
}

// Подписки
const presenceChannel = ref(null)
const friendRequestsChannel = ref(null)

function handleSendMessage(data) {
  const tempMessage = {
    id: Date.now(),
    content: data.content,
    from_id: contactStore.userId,
    to_id: data.to_id,
    created_at: new Date().toISOString(),
    read_at: null,
    isLocal: true
  }

  // Добавление во временный стор
  chatStore.addLocalMessage(tempMessage)

  // Отправка на сервер
  chatStore.sendMessage(data.content, data.to_id)
      .then(res => {
        // Замена временного сообщения на серверное
        chatStore.replaceLocalMessage(tempMessage.id, res)
      })
      .catch(err => {
        console.error('Ошибка отправки:', err)
        chatStore.removeLocalMessage(tempMessage.id)
      })
  // Автоскролл
  if (history.value?.scrollToBottom) {
    history.value.scrollToBottom()
  }
}

onMounted(async () => {
  // Инициализация пользователя
  if (!useUserStore.id) {
    try {
      await useUserStore.getInfo()

      contactStore.userId = useUserStore.id
      console.log('Пользователь Авторизован')
    } catch (e) {
      console.warn('Пользователь не авторизован')
      router.push('/login')
    }
  } else {
    await contactStore.refreshUserFrom()
  }


  // Загрузка контактов
  if (!contactStore.contacts.length) {
    await contactStore.loadContacts()
  }


  if (selectedContact.value) {
    if (!chatStore.messages.length) {
      await chatStore.loadHistory()
    }
  }
  // Загрузка друзей и запросов
  if (!useFriendStore.friends.length) {
    await useFriendStore.loadFriendsList()
  }

  if (!useFriendStore.incomingRequests.length) {
    await useFriendStore.loadIncomingRequests()
  }

  if (!useFriendStore.sentRequests.length) {
    await useFriendStore.loadSentRequests()
  }


  const lastContactId = localStorage.getItem('last-selected-contact')
  if (lastContactId && contactStore.contacts.some(c => c.id === Number(lastContactId))) {
    selectedContact.value = contactStore.contacts.find(c => c.id === Number(lastContactId))
    chatStore.loadHistory(selectedContact.value.id)
  }

  // Подписка на события
  if (window.Echo && contactStore.userId) {
    window.Echo.private(`chat.${contactStore.userId}`)
        .listen('.NewMessage', (e) => {
          // ❌ Не добавляем свои же сообщения
          if (e.message.from_id === contactStore.userId) return

          chatStore.addLocalMessage(e.message)
          if (history.value?.scrollToBottom) {
            history.value.scrollToBottom()
          }
        })

    window.Echo.private(`chat.read.${contactStore.userId}`)
        .listen('.MessageRead', (e) => {
          chatStore.markAsRead(e.message.from_id)
        })
  }

  // Подписка на события
  presenceChannel.value = setupPresenceChannel()
  friendRequestsChannel.value = setupFriendRequestsChannel()

})

onUnmounted(() => {
  // Отписка от каналов
  if (presenceChannel.value) {
    presenceChannel.value.leave()
  }

  if (friendRequestsChannel.value) {
    friendRequestsChannel.value.stopListening()
  }
})
</script>

<style scoped lang="scss">
.talkstream-container {
  display: flex;
  margin: 0.6rem;
  border-radius: 12px;
  background-color: #f9f9f9;
  height: calc(100vh - 170px);
}

.talkstream-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
