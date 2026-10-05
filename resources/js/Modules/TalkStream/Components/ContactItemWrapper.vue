<template>
  <ContactItem
      :contact="contact"
      :is-online="isOnline"
      :is-friend="isFriend"
      :is-selected="isSelected"
      :has-incoming="hasIncoming"
      :has-sent="hasSent"
      @select="handleSelect"
      @add-friend="$emit('add-friend', contact)"
      @accept-request="$emit('accept-request', contact)"
  />
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed, onMounted } from 'vue'
import ContactItem from '@/modules/TalkStream/Components/ContactItem.vue'
import { useContactStore } from '@/modules/TalkStream/Stores/contactStore'
import { useFriendStore } from '@/modules/TalkStream/Stores/friendStore'
import type { Contact } from '@/modules/TalkStream/types'

// ✅ Строгая типизация Props
const props = defineProps<{
  contact: Contact
}>()

// ✅ Строгая типизация Emits
const emit = defineEmits<{
  select: [contact: Contact]
  addFriend: [contact: Contact]
  acceptRequest: [contact: Contact]
}>()

const contactStore = useContactStore()
const friendStore = useFriendStore()

// Вычисляемые состояния
const isOnline = computed((): boolean => contactStore.isOnline(props.contact.id))
const isFriend = computed((): boolean => friendStore.isFriend(props.contact.id))
const hasIncoming = computed((): boolean => friendStore.hasIncoming(props.contact.id))
const hasSent = computed((): boolean => friendStore.hasSent(props.contact.id))

// ✅ ИСПРАВЛЕНО: Надежная проверка выбора без конфликтов типов и мерцания
const isSelected = computed((): boolean => {
  const lastSelectedId = localStorage.getItem('last-selected-contact')
  const isStoreSelected = contactStore.selectedContact?.id === props.contact.id
  const isLocalStorageSelected = lastSelectedId === String(props.contact.id)
  return isStoreSelected || isLocalStorageSelected
})

function handleSelect(): void {
  contactStore.selectContact(props.contact)
  emit('select', props.contact)
}

onMounted(() => {
  // ✅ Автоматический выбор при загрузке, если контакт помечен в localStorage
  const lastSelectedId = localStorage.getItem('last-selected-contact')
  if (lastSelectedId && props.contact.id === Number(lastSelectedId)) {
    contactStore.selectContact(props.contact)
  }
})

// ⚠️ ВАЖНО: onUnmounted убран. В v-for он вызывается при любой перерисовке списка (фильтр/поиск),
// что ломало бы выбор контакта. Управление состоянием оставлено полностью на contactStore.
</script>
