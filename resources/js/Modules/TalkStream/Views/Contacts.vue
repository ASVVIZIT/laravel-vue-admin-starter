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

    <!-- Список контактов -->
    <ul class="contact-list">
      <ContactItem
          v-for="contact in contacts"
          :key="contact.id"
          :contact="contact"
          :is-online="contactStore.isOnline(contact.id)"
          @select="selectContact"
      />
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useContactStore } from '@/modules/TalkStream/Stores/contactStore'
import ContactItem from '@/modules/TalkStream/Components/ContactItem.vue'

const router = useRouter()
const route = useRoute()
const contactStore = useContactStore()

const contacts = ref([])
const currentMode = ref(route.params.mode || 'chat')

onMounted(async () => {
  if (!contactStore.contacts.length) {
    await contactStore.loadContacts()
    contacts.value = contactStore.contacts
  }

  // Подписка на онлайн-статус
  if (window.echoTalkStream) {
    window.echoTalkStream.join('presence-chat')
        .here((users) => users.forEach(user => contactStore.setOnline(user.id)))
        .joining((user) => contactStore.setOnline(user.id))
        .leaving((user) => contactStore.setOffline(user.id))
  }
})

function switchMode(mode) {
  currentMode.value = mode
  router.push(`/talkstream/${mode}`)
}

function selectContact(contact) {
  const selectedMode = currentMode.value

  if (selectedMode === 'chat') {
    router.push({ name: 'chat', query: { to: contact.id } })
  } else if (selectedMode === 'call') {
    router.push({ name: 'call', query: { to: contact.id } })
  }
}
</script>

<style scoped>
.contacts-container {
  padding: 1rem;
}

.mode-switcher {
  margin-bottom: 1rem;
}

.mode-button {
  padding: 8px 16px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}

.mode-button.active {
  background-color: #42b983;
  color: white;
  border-color: #42b983;
}

.contact-list {
  list-style: none;
  padding: 0;
}
</style>
