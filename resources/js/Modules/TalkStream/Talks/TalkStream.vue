<template>
  <div class="talkstream-container">
    <!-- Список контактов -->
    <TalkStreamContacts @select="handleSelectContact" />

    <!-- Чат -->
    <div class="talkstream-chat">
      <TalkStreamHeader :contact="selectedContact" />
      <TalkStreamHistory :contact="selectedContact" :messages="[
          {id: 1, content: 'Сообщение 1'},
          {id: 2, content: 'Сообщение 2'},
          {id: 3, content: 'Сообщение 3'},
          {id: 4, content: 'Сообщение 4'},
          {id: 5, content: 'Сообщение 5'},
          {id: 6, content: 'Сообщение 6'}
        ]" />
      <TalkStreamSender :contact="selectedContact" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useContactStore } from '@/modules/TalkStream/Stores/contactStore'
import { friendStore } from '@/modules/TalkStream/Stores/friendStore'
import { userStore } from '@/store/user'
import { setupPresenceChannel } from '@/modules/TalkStream/Subscriptions/userOnlinePresenceHandler'
import { setupFriendRequestsChannel } from '@/modules/TalkStream/Subscriptions/friendshipEventsHandler'
import TalkStreamContacts from '@/modules/TalkStream/Talks/TalkStreamContacts.vue'
import TalkStreamHeader from '@/modules/TalkStream/Talks/TalkStreamHeader.vue'
import TalkStreamHistory from '@/modules/TalkStream/Talks/TalkStreamHistory.vue'
import TalkStreamSender from '@/modules/TalkStream/Talks/TalkStreamSender.vue'

const router = useRouter()
const contactStore = useContactStore()
const useFriendStore = friendStore()
const useUserStore = userStore()

// Состояние для хранения выбранного контакта
const selectedContact = ref(null)

// Обработчик выбора контакта
const handleSelectContact = (contact) => {

  console.log('handleSelectContact ', contact)
  selectedContact.value = contact
}

// Подписки
const presenceChannel = ref(null)
const friendRequestsChannel = ref(null)

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
