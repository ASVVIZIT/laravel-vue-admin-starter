<template>
  <li class="contact-item" :class="{ online: isOnline, friend: isFriend }" @click="select">
    <!-- Статус и действия -->
    <div class="contact-actions">
      <span class="status-indicator">{{ isOnline ? '🟢' : '⚪' }}</span>

      <button v-if="isFriend" disabled class="btn btn-friend">✔ Друг</button>
      <button v-else-if="hasIncoming" @click.stop="accept" class="btn btn-accept">✔ Принять</button>
      <button v-else-if="hasSent" disabled class="btn btn-sent">⏳ Запрошено</button>
      <button v-else @click.stop="add" class="btn btn-add">➕ Добавить</button>
    </div>

    <!-- Информация о контакте -->
    <div class="contact-info">
      {{ contact.name }}
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
  },
  hasSent: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()
const emit = defineEmits(['select', 'add-friend', 'accept-request'])
const useFriendStore = friendStore()

/*if (!useFriendStore.friends.length) {

  console.log('useFriendStore ', useFriendStore)
  await useFriendStore.loadFriendsList()
}*/

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

<style scoped lang="scss">
.contact-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s ease;
  max-width: 100%;
  width: 100%;
  box-sizing: border-box;
}

.contact-item:hover {
  background-color: #f9f9f9;
}

.contact-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
  white-space: nowrap;
  font-size: 0.85rem;
}

.status-indicator {
  font-size: 0.8rem;
  min-width: 20px;
  text-align: center;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  padding: 2px 6px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  &.btn-add {
    background-color: #42b983;
    color: white;

    &:hover {
      background-color: #36a871;
    }
  }

  &.btn-accept {
    background-color: #3490dc;
    color: white;

    &:hover {
      background-color: #2779bf;
    }
  }

  &.btn-sent {
    background-color: #f0ad4e;
    color: white;

    &:hover {
      background-color: #ec971f;
    }
  }

  &.btn-friend {
    background-color: #ccc;
    color: #555;
    cursor: not-allowed;
  }
}

.contact-info {
  flex-grow: 1;
  margin-left: 12px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-weight: 500;
  font-size: 0.9rem;
  color: #333;
}
</style>
