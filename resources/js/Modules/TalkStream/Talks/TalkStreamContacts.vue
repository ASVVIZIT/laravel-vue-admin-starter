<template>
  <div class="contacts-container">
    <!-- Меню режимов -->
    <div class="mode-switcher">
      <button
          v-for="mode in ['chat', 'call']"
          :key="mode"
          :class="['mode-button', { active: currentMode === mode }]"
          @click="switchMode(mode)"
      >
        {{ mode === 'chat' ? 'Чат' : 'Звонок' }}
      </button>
    </div>
    <div>
      <h3>Общий список пользователей</h3>
    </div>
    <!-- Обёртка для прокрутки -->
    <div class="contacts-wrap">
      <!-- Список всех пользователей -->
      <ul class="contact-list">
        <ContactItem
            v-for="contact in contacts"
            :key="contact.id"
            :contact="contact"
            :is-online="contactStore.isOnline(contact.id)"
            :is-friend="useFriendStore.isFriend(contact.id)"
            :has-incoming="useFriendStore.hasIncoming(contact.id)"
            :has-sent="useFriendStore.hasSent(contact.id)"
            @select="selectContact"
        />
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useContactStore } from '@/modules/TalkStream/Stores/contactStore'
import { friendStore } from '@/modules/TalkStream/Stores/friendStore'
import ContactItem from '@/modules/TalkStream/Components/ContactItem.vue'
import { userStore } from '@/store/user'
import { setupPresenceChannel } from '@/modules/TalkStream/Subscriptions/userOnlinePresenceHandler'
import { setupFriendRequestsChannel } from '@/modules/TalkStream/Subscriptions/friendshipEventsHandler'

const router = useRouter()
const route = useRoute()
const contactStore = useContactStore()
const useFriendStore = friendStore()
const useUserStore = userStore()

const contacts = ref([])
const currentMode = ref(route.params.mode || 'chat')

// Хранение каналов для отписки
const presenceChannel = ref(null)
const friendRequestsChannel = ref(null)

onMounted(async () => {
  // Загрузка контактов
  if (!contactStore.contacts.length) {
    await contactStore.loadContacts()
    contacts.value = contactStore.contacts
  }

  // Проверка авторизации
  try {
    if (!useUserStore.id) {
      await useUserStore.getInfo()
    }
  } catch (e) {
    console.warn('Пользователь не авторизован')
    router.push('/login')
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

  // Инициализация подписок
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
.talkstream-contacts {
  width: 250px;
  padding: 1rem;
  border-right: 1px solid #eaeaea;
  overflow-y: auto;
  height: 100vh;
}

.contact-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
</style>
