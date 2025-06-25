<template>
  <ContactItem
      :contact="contact"
      :is-online="isOnline"
      :is-friend="isFriend"
      :is-selected="contact.id === selectedContactId"
      :has-incoming="hasIncoming"
      :has-sent="hasSent"
      @select="handleSelect"
      @add-friend="$emit('add-friend', contact)"
      @accept-request="$emit('accept-request', contact)"
  />
</template>

<script setup>
import {defineProps, defineEmits, computed, watch, onMounted} from 'vue'
import ContactItem from '@/modules/TalkStream/Components/ContactItem.vue'
import { useContactStore } from '@/modules/TalkStream/Stores/contactStore'
import { friendStore } from '@/modules/TalkStream/Stores/friendStore'

const props = defineProps({
  contact: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['select', 'add-friend', 'accept-request'])

const contactStore = useContactStore()
const useFriendStore = friendStore()

const selectedContactId = computed(() => contactStore.selectedContact?.id)

// Состояние пользователя
const isOnline = computed(() => contactStore.isOnline(props.contact.id))
const isSelected = computed(() => contactStore.isContactSelected(props.contact.id) === localStorage.getItem('last-selected-contact'))
const isFriend = computed(() => useFriendStore.isFriend(props.contact.id))
const hasIncoming = computed(() => useFriendStore.hasIncoming(props.contact.id))
const hasSent = computed(() => useFriendStore.hasSent(props.contact.id))

function handleSelect(contact) {
  // Сохраняем выбранный контакт в сторе
  contactStore.selectContact(contact)
  // Эмитируем событие для родителя
  emit('select', contact)
}

onMounted(async () => {
  const lastSelectedId = localStorage.getItem('last-selected-contact')

  if (lastSelectedId && props.contact.id === Number(lastSelectedId)) {
    contactStore.selectContact(props.contact)
  }
})
onUnmounted(() => {
  if (props.contact.id === selectedContactId.value) {
    contactStore.selectContact(null)
   // localStorage.removeItem('last-selected-contact')
  }
})

</script>
