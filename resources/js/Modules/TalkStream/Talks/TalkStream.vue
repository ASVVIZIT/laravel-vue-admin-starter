<template>
  <div class="talkstream-container">
    <ConnectionStatus />

    <div
        class="contacts-wrapper"
        :class="{ 'collapsed': isContactsPanelCollapsed }"
    >
      <TalkStreamContacts @select="handleSelectContact" />
    </div>

    <div
        v-loading-talkstream.history
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

// Зоны загрузки.
// contacts - список контактов + дружба + userFrom.
// history  - загрузка истории выбранного чата.
// sender   - отправка сообщения.
const { withLoading: withContactsLoading } = useLoading('contacts')
const { withLoading: withHistoryChatLoading } = useLoading('history')

const senderLoading = useLoading('sender')
const senderPending = ref<number>(0)

/**
 * Безопасная обёртка для зоны sender.
 *
 * Нужна, чтобы можно было быстро кидать тестовые сообщения Enter'ом,
 * не блокируя ввод и не ломая лоадер при параллельных отправках.
 *
 * Лоадер скрывается только когда все текущие отправки завершились.
 */
const runSenderTask = async (task: () => Promise<unknown>): Promise<void> => {
  senderPending.value = senderPending.value + 1
  senderLoading.setLoading(true)

  try {
    await task()
  } finally {
    senderPending.value = Math.max(0, senderPending.value - 1)

    if (senderPending.value === 0) {
      senderLoading.setLoading(false)
    }
  }
}

const handleSelectContact = async (contact: Contact) => {
  if (!contact) return

  selectedContact.value = contact
  localStorage.setItem('last-selected-contact', String(contact.id))
  contactStore.selectContact(contact)

  if (selectedContact.value) {
    // История выбираемого контакта всегда идёт через зону history.
    await withHistoryChatLoading(() => chatStore.loadHistory(contact.id))
  }
}

/**
 * Отправка сообщения.
 *
 * Специально без защиты от двойной отправки:
 * сейчас это тестовый режим, нужно быстро лепить сообщения.
 * Анти-спам / debounce / блокировку повторной отправки вернём позже.
 */
const handleSendMessage = async (data: { content: string, to_id: number }) => {
  if (!selectedContact.value) return

  try {
    await runSenderTask(() => chatStore.sendMessage(data.to_id, data.content))

    // Скроллим вниз после добавления сообщения в стор.
    historyRef.value?.scrollToBottom()
  } catch (e) {
    console.error('[TalkStream] Ошибка отправки:', e)
    // chatStore.sendMessage уже обработал ошибку внутри себя:
    // сообщение помечается как failed, а не удаляется.
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

  // Единая точка начальной загрузки контактов/дружбы/userFrom.
  // Это убирает гонку с TalkStreamContacts, где раньше loadContacts вызывался без спиннера.
  await withContactsLoading(async () => {
    if (!contactStore.contacts.length) {
      await contactStore.loadContacts()
    }

    if (!friendStore._initialized) {
      await friendStore.init()
    }

    await contactStore.refreshUserFrom()
  })

  // Восстановление последнего открытого чата тоже должно показывать history-лоадер.
  const lastContactId = localStorage.getItem('last-selected-contact')
  if (lastContactId && contactStore.contacts.length > 0) {
    const contact = contactStore.contacts.find(c => c.id === Number(lastContactId))
    if (contact) {
      selectedContact.value = contact
      await withHistoryChatLoading(() => chatStore.loadHistory(contact.id))
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
  flex: 0 0 auto;

  width: auto;
  max-width: 210px;

  height: 100%;
  min-height: 0;

  overflow: hidden;
  background: #fff;

  transition:
      width 0.25s ease,
      min-width 0.25s ease,
      opacity 0.25s ease,
      transform 0.25s ease;

  &.collapsed {
    width: 0;
    min-width: 0;
    opacity: 0;
    transform: translateX(-100%);
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
