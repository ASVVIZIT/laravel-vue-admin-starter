<template>
  <div class="talkstream-container">
    <ConnectionStatus />
    <div
        v-loading-talk-small.contacts="{ text: 'Загрузка контактов...', background: '#ffffffaa' }"
        class="contacts-wrapper"
        :class="{ 'collapsed': isContactsPanelCollapsed }"
    >
      <TalkStreamContacts @select="handleSelectContact" />
    </div>
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '@/modules/TalkStream/Stores/uiStore'
import { useTalkStreamStore } from '@/modules/TalkStream/Stores/talkStreamStore'
import { useContactStore } from '@/modules/TalkStream/Stores/contactStore'
import { useChatStore } from '@/modules/TalkStream/Stores/chatStore'
import { useFriendStore } from '@/modules/TalkStream/Stores/friendStore'
import { userStore } from '@/store/userStore'
import { useLoading } from '@/modules/TalkStream/Composables/useLoading'
import type { Contact, Message } from '@/modules/TalkStream/types'
import ConnectionStatus from '@/modules/TalkStream/Components/ConnectionStatus.vue'
import TalkStreamContacts from '@/modules/TalkStream/Talks/TalkStreamContacts.vue'
import TalkStreamHeader from '@/modules/TalkStream/Talks/TalkStreamHeader.vue'
import TalkStreamHistory from '@/modules/TalkStream/Talks/TalkStreamHistory.vue'
import TalkStreamSender from '@/modules/TalkStream/Talks/TalkStreamSender.vue'

const router = useRouter()
const uiStore = useUiStore()
const chatStore = useChatStore()
const contactStore = useContactStore()
const friendStore = useFriendStore()
const useUserStore = userStore()
const talkStreamStore = useTalkStreamStore()

const selectedContact = ref<Contact | null>(null)
const historyRef = ref<any | null>(null)

const messages = computed<Message[]>(() => chatStore.messages)
const isContactsPanelCollapsed = computed<boolean>(() => uiStore.isContactsPanelCollapsed)

const { withLoading: withContactsLoading } = useLoading('contacts')
const { withLoading: withHistoryChatLoading } = useLoading('history')

const handleSelectContact = async (contact: Contact) => {
  if (!contact) return
  selectedContact.value = contact
  localStorage.setItem('last-selected-contact', String(contact.id))
  contactStore.selectContact(contact)
  if (selectedContact.value) {
    await withHistoryChatLoading(() => chatStore.loadHistory(contact.id))
  }
}

// 🔥 ИСПРАВЛЕНО: Удалено ручное создание tempMessage с положительным ID.
// Теперь за оптимистичное обновление отвечает ТОЛЬКО chatStore.sendMessage,
// который создает сообщение с отрицательным ID и сам его заменяет/удаляет.
const handleSendMessage = async (data: { content: string, to_id: number }) => {
  if (!selectedContact.value) return

  try {
    // chatStore.sendMessage сам создаст локальное сообщение, покажет его,
    // отправит на сервер и заменит на реальное при успехе.
    await chatStore.sendMessage(data.to_id, data.content)

    // Скроллим вниз после добавления сообщения в стор
    historyRef.value?.scrollToBottom()
  } catch (e) {
    console.error('[TalkStream] Ошибка отправки:', e)
    // chatStore.sendMessage уже удалил temp-сообщение внутри себя при ошибке
  }
}

onMounted(async () => {
  const savedState = localStorage.getItem('contactsPanelCollapsed')
  if (savedState !== null) {
    uiStore.setContactsPanelState(JSON.parse(savedState))
  }

  if (!contactStore.userId && useUserStore.id) {
    contactStore.userId = useUserStore.id
  }

  if (!talkStreamStore.isConnected) {
    talkStreamStore.initWebSockets()
  }

  if (!contactStore.contacts.length) {
    await withContactsLoading(() => contactStore.loadContacts())
  }

  // 🔥 КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Загружаем userFrom после загрузки контактов
  await contactStore.refreshUserFrom()

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
