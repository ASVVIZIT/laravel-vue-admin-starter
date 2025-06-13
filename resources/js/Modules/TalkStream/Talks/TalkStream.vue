<template>
  <div class="talkstream-container">
    <!-- Список контактов -->
    <TalkStreamContacts @select="handleSelectContact" />

    <!-- Чат -->
    <div class="talkstream-chat">
      <TalkStreamHeader :contact="selectedContact" />
      <TalkStreamHistory :contact="selectedContact" :messages="messages" />
      <TalkStreamSender :contact="selectedContact" @send="handleSendMessage"/>
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
const messages = ref([
  {id: 143434, from_id: 1, to_id: 4, content: 'Сообщение 1', created_at: new Date().toISOString(), isLocal: true},
  {id: 2411231, from_id: 1, to_id: 4, content: 'Сообщение 2', created_at: new Date().toISOString(), isLocal: true},
  {id: 2522, from_id: 1, to_id: 4, content: 'Сообщение 3', created_at: new Date().toISOString(), isLocal: true},
  {id: 423, from_id: 1, to_id: 4, content: 'Сообщение 4', created_at: new Date().toISOString(), isLocal: true},
])

// Обработчик выбора контакта
const handleSelectContact = (contact) => {

  console.log('handleSelectContact ', contact)
  selectedContact.value = contact
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
    isLocal: true
  }

  messages.value.push(tempMessage)

  // Автоскролл
  if (history.value?.scrollToBottom) {
    history.value.scrollToBottom()
  }

  // Отправка на сервер
  chatStore.sendMessage(data.content, data.to_id)
      .then(() => {
        // Убираем флаг isLocal после отправки
        tempMessage.isLocal = false
      })
      .catch(err => {
        console.error('Ошибка отправки:', err)
      })
}

onMounted(async () => {
  // Инициализация пользователя
  if (!useUserStore.id) {
    try {
      await useUserStore.getInfo()
    } catch (e) {
      console.warn('Пользователь не авторизован')
      router.push('/login')
    }
  }

  // Загрузка контактов
  if (!contactStore.contacts.length) {
    await contactStore.loadContacts()
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
  height: calc(100vh - 180px);
}

.talkstream-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
