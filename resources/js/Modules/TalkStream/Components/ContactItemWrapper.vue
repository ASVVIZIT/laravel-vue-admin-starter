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
import ContactItem from '@/modules/TalkStream/Components/ContactItem.vue'
import { useContactStore } from '@/modules/TalkStream/Stores/contactStore'
import { useFriendStore } from '@/modules/TalkStream/Stores/friendStore'

import type { Contact } from '@/modules/TalkStream/types'

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

const isOnline = computed((): boolean => contactStore.isOnline(props.contact.id))
const isFriend = computed((): boolean => friendStore.isFriend(props.contact.id))
const hasIncoming = computed((): boolean => friendStore.hasIncoming(props.contact.id))
const hasSent = computed((): boolean => friendStore.hasSent(props.contact.id))

const requestCreatedAt = computed((): string | null => {
  return friendStore.getRequestCreatedAt(props.contact.id)
})

/**
 * Важно для стабильности скролла:
 * selected вычисляем ТОЛЬКО по contactStore.selectedContact.
 *
 * Никакого localStorage в isSelected.
 * Никакого auto-select в onMounted.
 * Иначе при монтировании списка может происходить лишняя смена класса
 * и браузер/скролл-anchoring дёргает позицию.
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
