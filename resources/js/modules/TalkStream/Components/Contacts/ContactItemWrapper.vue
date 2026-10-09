<template>
  <ContactItem
      :contact="contact"
      :is-online="isOnline"
      :is-friend="isFriend"
      :is-selected="isSelected"
      :has-incoming="hasIncoming"
      :has-sent="hasSent"
      :request-created-at="requestCreatedAt"
      :is-typing="isTyping"
      @select="handleSelect"
      @add-friend="handleAddFriend"
      @accept-request="handleAcceptRequest"
  />
</template>

<script setup lang="ts">
import ContactItem from '@modules/TalkStream/Components/Contacts/ContactItem.vue'
import { useContactStore } from '@modules/TalkStream/Stores/contactStore'
import { useFriendStore } from '@modules/TalkStream/Stores/friendStore'

import type { Contact } from '@modules/TalkStream/Types/talkStreamType'

const props = withDefaults(defineProps<{
  contact: Contact
  isTyping?: boolean
}>(), {
  isTyping: false,
})

const emit = defineEmits<{
  select: [contact: Contact]
  addFriend: [contact: Contact]
  acceptRequest: [contact: Contact]
}>()

const contactStore = useContactStore()
const friendStore = useFriendStore()

const isOnline = computed((): boolean => {
  return contactStore.isOnline(props.contact.id)
})

/**
 * Читаем состояние дружбы напрямую из store state.
 * Это проще и надёжнее для реактивности, чем вызывать actions в computed.
 */
const isFriend = computed((): boolean => {
  return friendStore.friends.includes(props.contact.id)
})

const hasIncoming = computed((): boolean => {
  return friendStore.incomingRequests.some(
      (request) => Number(request?.user_id) === props.contact.id,
  )
})

const hasSent = computed((): boolean => {
  return friendStore.sentRequests.includes(props.contact.id)
})

/**
 * Дата заявки:
 *   1. если входящая — берём created_at из incomingRequests;
 *   2. если исходящая — берём из sentRequestsById;
 *   3. иначе null.
 */
const requestCreatedAt = computed((): string | null => {
  const incoming = friendStore.incomingRequests.find(
      (request) => Number(request?.user_id) === props.contact.id,
  )

  if (incoming?.created_at) {
    return incoming.created_at
  }

  const sentDate = friendStore.sentRequestsById[props.contact.id]

  return sentDate ? sentDate : null
})

/**
 * Выбор контакта только через contactStore.
 * Без localStorage, без auto-select в onMounted.
 */
const isSelected = computed((): boolean => {
  return contactStore.selectedContact?.id === props.contact.id
})

function handleSelect(): void {
  contactStore.selectContact(props.contact)
  emit('select', props.contact)
}

function handleAddFriend(): void {
  emit('addFriend', props.contact)
}

function handleAcceptRequest(): void {
  emit('acceptRequest', props.contact)
}
</script>
