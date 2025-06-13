<template>
  <li class="contact-item" :class="{ online: isOnline, friend: isFriend }" @click="select">
    <!-- Статус и действия -->
    <div class="contact-actions">
      <span class="status-indicator">{{ isOnline ? '🟢' : '⚪' }}</span>

      <button v-if="isFriend" disabled>Друг</button>
      <button v-else-if="hasIncoming" @click.stop="accept">Принять</button>
      <button v-else @click.stop="add">Добавить</button>
    </div>

    <!-- Информация о пользователе -->
    <div class="contact-info">
      <div class="contact-name">
        {{ contact.name }}
      </div>
    </div>
  </li>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { useRouter } from 'vue-router'
import { friendStore } from '@/modules/TalkStream/Stores/friendStore'

const props = defineProps({
  contact: {
    type: Object,
    required: true
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  isFriend: {
    type: Boolean,
    default: false
  },
  hasIncoming: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()
const emit = defineEmits(['select', 'add-friend', 'accept-request'])
const useFriendStore = friendStore()

if (!useFriendStore.friends.length) {

  console.log('useFriendStore ', useFriendStore)
  await useFriendStore.loadFriendsList()
}

function select() {
  router.push({ name: 'chat', query: { to: props.contact.id } })
  emit('select', props.contact)
}

function add() {
  useFriendStore.sendRequest(props.contact.id)
  emit('add-friend', props.contact)
}

function accept() {
  useFriendStore.acceptRequest(props.contact.id)
  emit('accept-request', props.contact)
}
</script>

<style scoped>
.contact-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.45rem 0.65rem;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s ease;
  max-width: 100%;
  width: 100%;
}

.contact-item:hover {
  background-color: #f9f9f9;
}

.contact-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 100px;
  justify-content: flex-start;
}

.status-indicator {
  font-size: 0.8rem;
  min-width: 20px;
  text-align: center;
}

.contact-actions button {
  font-size: 0.75rem;
  padding: 2px 4px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #42b983;
  color: white;
  flex-shrink: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.contact-actions button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.contact-info {
  flex-grow: 1;
  text-align: right;
  min-width: 70px;
  max-width: 110px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.contact-name {
  font-weight: 500;
  font-size: 0.9rem;
  color: #333;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
