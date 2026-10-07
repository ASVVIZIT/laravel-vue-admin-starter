<template>
  <div class="contacts-container">
    <div class="contacts-container-header">
      <span>Общий список пользователей</span>
    </div>

    <div
        class="contacts-wrap"
        v-loading-talkstream-small.contacts
    >
      <!-- ✅ Рендерим список ТОЛЬКО когда данные дружбы загружены -->
      <ul v-if="friendStore._initialized" class="contact-list">
        <ContactItem
            v-for="contact in contacts"
            :key="contact.id"
            :contact="contact"
            :is-online="isContactOnline(contact.id)"
            :is-friend="isContactFriend(contact.id)"
            :is-selected="isContactSelected(contact.id)"
            :has-incoming="hasIncomingRequest(contact.id)"
            :has-sent="hasSentRequest(contact.id)"
            @select="handleSelect"
            @add-friend="handleAddFriend"
            @accept-request="handleAcceptRequest"
        />
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useContactStore } from '@/modules/TalkStream/Stores/contactStore'
import { useFriendStore } from '@/modules/TalkStream/Stores/friendStore'
import ContactItem from '@/modules/TalkStream/Components/ContactItem.vue'
import type { Contact } from '@/modules/TalkStream/types'

const emit = defineEmits<{
  select: [contact: Contact]
}>()

const contactStore = useContactStore()
const friendStore = useFriendStore()

const contacts = computed<Contact[]>(() => contactStore.contacts)

const isContactOnline = (id: number): boolean => contactStore.isOnline(id)
const isContactFriend = (id: number): boolean => friendStore.isFriend(id)
const isContactSelected = (id: number): boolean => contactStore.isContactSelected(id)
const hasIncomingRequest = (id: number): boolean => friendStore.hasIncoming(id)
const hasSentRequest = (id: number): boolean => friendStore.hasSent(id)

function handleSelect(contact: Contact): void {
  contactStore.selectContact(contact)
  emit('select', contact)
}

async function handleAddFriend(contact: Contact): Promise<void> {
  await friendStore.sendRequest(contact.id)
}

async function handleAcceptRequest(contact: Contact): Promise<void> {
  const req = friendStore.incomingRequests.find(r => r.user_id === contact.id)
  if (req) {
    await friendStore.acceptRequest(req.id)
  }
}
</script>

<style scoped lang="scss">
.contacts-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 140px;
  max-width: 210px;
  height: calc(100vh - 130px);
  transition: all 0.2s ease;
  overflow: hidden;
}

.contacts-container-header {
  height: 30px;
  min-height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  font-size: 0.7rem;
  flex-shrink: 0;
  box-sizing: border-box;
  font-weight: 600;
  color: #555;
  border-bottom: 1px solid #eee;
  background-color: #f9f9f9;
}

.contacts-wrap {
  flex-grow: 1;
  overflow-y: auto;
  max-height: calc(100vh - 160px);
  min-height: 0;
  background-color: #fff;
}

.contact-list {
  list-style: none;
  padding-top: 4px;
  padding-left: 2px;
  padding-bottom: 4px;
  margin-right: 4px;
  margin: 0;
}

.contacts-wrap::-webkit-scrollbar {
  width: 6px;
}

.contacts-wrap::-webkit-scrollbar-track {
  background: transparent;
}

.contacts-wrap::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 3px;
}

.contacts-wrap::-webkit-scrollbar-thumb:hover {
  background-color: #aaa;
}
</style>
