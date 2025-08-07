<template>
  <div class="talkstream-container">
    <ConnectionStatus />
    <!-- Обёртка для панели контактов с анимацией -->
    <div
        v-loading-talk-small.contacts="{ text: 'Загрузка контактов...', background: '#ffffffaa' }"
        class="contacts-wrapper" :class="{ 'collapsed': isContactsPanelCollapsed }"
    >
      <TalkStreamContacts @select="handleSelectContact"/>
    </div>

    <!-- Основной чат -->
    <div
        v-loading-talk.history="{ text: 'Загрузка истории...', background: '#ffffffaa' }"
        class="talkstream-chat" :class="{ 'full-width': isContactsPanelCollapsed }"
    >
      <TalkStreamHeader
          :contact="selectedContact"
          :is-online="contactStore.isOnline(selectedContact?.id)"
      />
      <TalkStreamHistory
          ref="history"
          v-if="selectedContact"
          :contact="selectedContact"
          :userFrom="contactStore.userFrom"
          :messages="messages"
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
import { useLoading } from '@/modules/TalkStream/Composables/useLoading'
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
// Stores
import { useUiStore } from '@/modules/TalkStream/stores/uiStore'
import { useTalkStreamStore } from '@/modules/TalkStream/Stores/talkStreamStore.js'
import { useContactStore } from '@/modules/TalkStream/Stores/contactStore'
import { useChatStore } from '@/modules/TalkStream/Stores/chatStore'
import { friendStore } from '@/modules/TalkStream/Stores/friendStore'
import { userStore } from '@/store/userStore'

// Компоненты
import ConnectionStatus from '@/modules/TalkStream/Components/ConnectionStatus.vue'
import TalkStreamContacts from '@/modules/TalkStream/Talks/TalkStreamContacts.vue'
import TalkStreamHeader from '@/modules/TalkStream/Talks/TalkStreamHeader.vue'
import TalkStreamHistory from '@/modules/TalkStream/Talks/TalkStreamHistory.vue'
import TalkStreamSender from '@/modules/TalkStream/Talks/TalkStreamSender.vue'

const router = useRouter()
const uiStore = useUiStore()
const chatStore = useChatStore()
const contactStore = useContactStore()
const useFriendStore = friendStore()
const useUserStore = userStore()

// Состояние для хранения выбранного контакта
const selectedContact = ref(null)
const history = ref(null)

// Сообщения из стора
const messages = computed(() => chatStore.messages)

// Состояние панели контактов
const isContactsPanelCollapsed = computed(() => uiStore.isContactsPanelCollapsed)

// Loading Для контактов
const { withLoading: withContactsLoading } = useLoading('contacts')
// Loading Для истории
const { withLoading: withHistoryChatLoading } = useLoading('history')

/**
 * Обработчик выбора контакта
 */
const handleSelectContact = async (contact) => {
  if (!contact) return

  selectedContact.value = contact
  localStorage.setItem('last-selected-contact', contact.id)
  contactStore.selectContact(contact)
  if (selectedContact.value) {
    await withHistoryChatLoading(() => chatStore.loadHistory(contact.id))
  }
}

/**
 * Обработчик отправки сообщения
 */
const handleSendMessage = (data) => {
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

// Загрузка контактов
async function loadContacts() {
  await withContactsLoading(() => contactStore.loadContacts())
}

// Загрузка истории
async function loadHistory(contactId) {
  await withHistoryChatLoading(() => chatStore.loadHistory(contactId))
}

onMounted(async () => {
  // Восстановление состояния панели контактов
  const savedState = localStorage.getItem('contactsPanelCollapsed')
  if (savedState !== null) {
    uiStore.setContactsPanelState(JSON.parse(savedState))
  }

  // Инициализация пользователя
  if (!useUserStore.id) {
    try {
      await useUserStore.fetchInfo()
      contactStore.userId = useUserStore.id
      console.log('Пользователь Авторизован')
    } catch (e) {
      console.warn('Пользователь не авторизован')
      router.push('/login')
    }
  } else {
    await contactStore.refreshUserFrom()
  }

  // Загрузка контактов с индикатором
  if (!contactStore.contacts.length) {
    await loadContacts()
  }
  // Загрузка истории с индикатором
  if (selectedContact.value) {
    if (!chatStore.messages.length) {
      await loadHistory(contact.id)
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

  // Мгновенная прокрутка без анимации при инициализации
  if (history.value) {
    history.value.scrollTop = history.value.scrollHeight
  }

  const lastContactId = localStorage.getItem('last-selected-contact')
  if (lastContactId && contactStore.contacts.some(c => c.id === Number(lastContactId))) {
    selectedContact.value = contactStore.contacts.find(c => c.id === Number(lastContactId))
    chatStore.loadHistory(selectedContact.value.id)
  }

  // Подписка на события
  const talkStream = useTalkStreamStore()
  talkStream.initWebSockets()
})
</script>

<style scoped lang="scss">
.talkstream-container {
  display: flex;
  height: 100%;
  margin: 0.6rem;
  border-radius: 12px;
  background-color: #f9f9f9;
  height: calc(100vh - 150px);
  overflow: hidden;
}

.contacts-wrapper {
  min-width: 160px;
  min-height: 200px;
  transition: all 0.3s ease;
  overflow: hidden;

  &.collapsed {
    min-width: 0;
    width: 0;
    opacity: 0;
    transform: translateX(-100%);
    margin-right: 0;
    padding: 0;
  }
}

.talkstream-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  min-width: 200px;
  min-height: 300px;
  transition: all 0.3s ease;

  &.full-width {
    margin-left: 0;
  }
}
</style>
