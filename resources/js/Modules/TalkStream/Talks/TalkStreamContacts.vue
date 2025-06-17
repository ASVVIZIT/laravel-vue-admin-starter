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
      <ConnectionStatus />
    </div>
    <div>
      <h3>Общий список пользователей</h3>
    </div>
    <!-- Обёртка для прокрутки -->
    <div class="contacts-wrap">
      <!-- Список всех пользователей -->
      <ul class="contact-list">
        <ContactItemWrapper
            v-for="contact in contacts"
            :key="contact.id"
            :contact="contact"
            @select="selectContact"
            @add-friend="sendRequest"
            @accept-request="acceptRequest"
        />
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { userStore } from '@/store/user'
import { useContactStore } from '@/modules/TalkStream/Stores/contactStore'
import { friendStore } from '@/modules/TalkStream/Stores/friendStore'
import ContactItemWrapper from '@/modules/TalkStream/Components/ContactItemWrapper.vue'
import ConnectionStatus from '@/modules/TalkStream/Components/ConnectionStatus.vue'

const props = defineProps(['contacts'])
const emit = defineEmits(['select', 'add-friend', 'accept-request'])

const router = useRouter()
const useUserStore = userStore()
const contactStore = useContactStore()
const useFriendStore = friendStore()

const route = useRoute()

const contacts = computed(() => contactStore.contacts)
const currentMode = ref(route.params.mode || 'chat')

function selectContact(contact) {
  emit('select', contact)
}

function sendRequest(contact) {
  useFriendStore.sendRequest(contact.id)
  emit('add-friend', contact)
}

function acceptRequest(contact) {
  useFriendStore.acceptRequest(contact.id)
  emit('accept-request', contact)
}

function switchMode(mode) {
  currentMode.value = mode
}
</script>

<style scoped lang="scss">
.contacts-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0.5rem;
  border-bottom: 1px solid #eaeaea;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.mode-switcher {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.contacts-wrap {
  flex-grow: 1;
  overflow-y: auto;
  max-height: calc(100vh - 160px);
}

.contact-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
</style>
