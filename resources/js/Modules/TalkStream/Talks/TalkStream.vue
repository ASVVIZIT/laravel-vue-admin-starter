<template>
  <div class="talkstream-container">
    <!-- Статус подключения -->
    <ConnectionStatus />

    <!-- Панель контактов -->
    <div
        v-loading-talk-small.contacts="{ text: 'Загрузка контактов...', background: '#ffffffaa' }"
        class="contacts-wrapper"
        :class="{ 'collapsed': isContactsPanelCollapsed }"
    >
      <!-- Используем абсолютный путь к компоненту -->
      <TalkStreamContacts @select="handleSelectContact" />
    </div>

    <!-- Основная область чата -->
    <div
        v-loading-talk.history="{ text: 'Загрузка истории...', background: '#ffffffaa' }"
        class="talkstream-chat"
        :class="{ 'full-width': isContactsPanelCollapsed }"
    >
      <TalkStreamHeader
          :contact="selectedContact"
          :is-online="contactStore.isOnline(selectedContact?.id)"
      />

      <TalkStreamHistory
          ref="historyRef"
          v-if="selectedContact"
          :contact="selectedContact"
          :user-from="contactStore.userFrom"
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

<script setup lang="ts">
// ✅ АБСОЛЮТНЫЕ ИМПОРТЫ (Строгий стандарт)
import { ref, onMounted, computed, type Ref } from 'vue'
import { useRouter } from 'vue-router'

// Stores
import { useUiStore } from '@/modules/TalkStream/Stores/uiStore'
import { useTalkStreamStore } from '@/modules/TalkStream/Stores/talkStreamStore'
import { useContactStore } from '@/modules/TalkStream/Stores/contactStore'
import { useChatStore } from '@/modules/TalkStream/Stores/chatStore'
import { useFriendStore } from '@/modules/TalkStream/Stores/friendStore'
import { userStore } from '@/store/userStore'

// Composables
import { useLoading } from '@/modules/TalkStream/Composables/useLoading'

// Types
import type { Contact, Message } from '@/modules/TalkStream/types'

// Components (Views & Components mixed properly via alias)
import ConnectionStatus from '@/modules/TalkStream/Components/ConnectionStatus.vue'
import TalkStreamContacts from '@/modules/TalkStream/Talks/TalkStreamContacts.vue'
import TalkStreamHeader from '@/modules/TalkStream/Talks/TalkStreamHeader.vue'
import TalkStreamHistory from '@/modules/TalkStream/Talks/TalkStreamHistory.vue'
import TalkStreamSender from '@/modules/TalkStream/Talks/TalkStreamSender.vue'

// --- Логика ---

const router = useRouter()
const uiStore = useUiStore()
const chatStore = useChatStore()
const contactStore = useContactStore()
const friendStore = useFriendStore()
const useUserStore = userStore()
const talkStreamStore = useTalkStreamStore()

// Refs
const selectedContact = ref<Contact | null>(null)
const historyRef = ref<any | null>(null) // Можно уточнить тип, если экспортируем методы из History

// Computed
const messages = computed<Message[]>(() => chatStore.messages)
const isContactsPanelCollapsed = computed<boolean>(() => uiStore.isContactsPanelCollapsed)

// Loading Zones
const { withLoading: withContactsLoading } = useLoading('contacts')
const { withLoading: withHistoryChatLoading } = useLoading('history')

// --- Methods ---

const handleSelectContact = async (contact: Contact) => {
  if (!contact) return

  selectedContact.value = contact
  localStorage.setItem('last-selected-contact', String(contact.id))
  contactStore.selectContact(contact)

  // Загружаем историю для выбранного контакта
  if (selectedContact.value) {
    await withHistoryChatLoading(() => chatStore.loadHistory(contact.id))
  }
}

const handleSendMessage = async (data: { content: string, to_id: number }) => {
  if (!selectedContact.value) return

  const tempMessage: Message = {
    id: Date.now(),
    content: data.content,
    from_id: useUserStore.id!,
    to_id: data.to_id,
    created_at: new Date().toISOString(),
    read_at: null,
    isLocal: true,
    type: 'text',
    is_mine: true
  }

  chatStore.addLocalMessage(tempMessage)

  // Скролл вниз сразу
  historyRef.value?.scrollToBottom()

  try {
    const response = await chatStore.sendMessage(data.to_id, data.content)
    // В реальном приложении здесь можно заменить tempMessage на ответ от сервера,
    // но chatStore уже делает это внутри (replaceLocalMessage)
  } catch (e) {
    console.error('[TalkStream] Ошибка отправки:', e)
    chatStore.removeLocalMessage(tempMessage.id)
  }
}

// --- Lifecycle ---

onMounted(async () => {
  // 1. Восстановление UI состояния
  const savedState = localStorage.getItem('contactsPanelCollapsed')
  if (savedState !== null) {
    uiStore.setContactsPanelState(JSON.parse(savedState))
  }

  // 2. Синхронизация ID пользователя (если вдруг не подтянулось)
  if (!contactStore.userId && useUserStore.id) {
    contactStore.userId = useUserStore.id
  }

  // 3. Инициализация WebSocket (Один раз)
  if (!talkStreamStore.isConnected) {
    talkStreamStore.initWebSockets()
  }

  // 4. Загрузка данных
  if (!contactStore.contacts.length) {
    await withContactsLoading(() => contactStore.loadContacts())
  }

  // 5. Восстановление последнего выбранного чата
  const lastContactId = localStorage.getItem('last-selected-contact')
  if (lastContactId && contactStore.contacts.length > 0) {
    const contact = contactStore.contacts.find(c => c.id === Number(lastContactId))
    if (contact) {
      selectedContact.value = contact
      chatStore.loadHistory(contact.id)
    }
  }
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
  position: relative;
}

.contacts-wrapper {
  min-width: 160px;
  min-height: 200px;
  transition: all 0.3s ease;
  overflow: hidden;
  background: #fff;

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
  background: #fff;
  border-radius: 8px;

  &.full-width {
    margin-left: 0;
  }
}
</style>
