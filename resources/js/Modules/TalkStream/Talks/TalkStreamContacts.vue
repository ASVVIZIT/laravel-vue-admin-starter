<template>
  <el-card class="contacts-container">
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
    <div>
      <h3>Общий список пользователей</h3>
    </div>
    <!-- Обёртка для прокрутки -->
    <div class="contacts-wrap">
      <!-- Список всех пользователей -->
      <ul class="contact-list">
        <ContactItem
            v-for="contact in contacts"
            :key="contact.id"
            :contact="contact"
            :is-online="contactStore.isOnline(contact.id)"
            :is-friend="useFriendStore.isFriend(contact.id)"
            :has-incoming="useFriendStore.hasIncoming(contact.id)"
            :has-sent="useFriendStore.hasSent(contact.id)"
            @select="selectContact"
            @add-friend="sendRequest"
            @accept-request="acceptRequest"
        />
      </ul>
    </div>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useContactStore } from '@/modules/TalkStream/Stores/contactStore'
import { friendStore } from '@/modules/TalkStream/Stores/friendStore'
import ContactItem from '@/modules/TalkStream/Components/ContactItem.vue'
import { userStore } from '@/store/user'

const props = defineProps(['contacts'])
const emit = defineEmits(['select', 'add-friend', 'accept-request'])

const router = useRouter()
const contactStore = useContactStore()
const useFriendStore = friendStore()

const route = useRoute()
const useUserStore = userStore()

const contacts = computed(() => contactStore.contacts)
const currentMode = ref(route.params.mode || 'chat')

const isFriend = (userId) => {
  return useFriendStore.friends.some(f => f.id === userId)
}

const hasIncomingRequest = (userId) => {
  return useFriendStore.incomingRequests.some(r => r.user_id === userId)
}

const hasSentRequest = (userId) => {
  return useFriendStore.sentRequests.some(r => r.friend_id === userId)
}

function selectContact(contact) {
  //router.push({ name: 'chat', query: { to: contact.id }})
   emit('select', contact)
}

function sendRequest(contact) {
  useFriendStore.sendRequest(contact.id)
  //emit('add-friend', contact)
}

function acceptRequest(contact) {
  useFriendStore.acceptRequest(contact.id)
 /// emit('accept-request', contact)
}

function switchMode(mode) {
  currentMode.value = mode
 // router.push(`/talkstream/${mode}`)
}
</script>

<style scoped lang="scss">
.contacts-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1rem;
}

.mode-switcher {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.contacts-wrap {
  flex-grow: 1;
  overflow-y: auto;
  max-height: calc(100vh - 220px);
}

.contact-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
</style>
