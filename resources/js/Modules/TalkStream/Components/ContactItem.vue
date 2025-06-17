<template>
  <li class="contact-item" :class="{ online: isOnline, friend: isFriend }" @click="select">
    <!-- Аватарка + статус онлайн -->
    <div class="contact-avatar-wrapper">
      <div class="contact-avatar" :style="{ backgroundImage: `url(${contact.avatar || '/images/default-avatar.png'})` }"></div>
      <span class="status-indicator">{{ isOnline ? '🟢' : '⚪' }}</span>
    </div>

    <!-- Информация о контакте -->
    <div class="contact-info" :class="{ friend: isFriend }">
      {{ contact?.name || defaultName }}
    </div>

    <!-- Кнопки действий -->
    <div class="contact-actions">
      <button v-if="isFriend" disabled class="btn btn-friend">
        {{ statusText }}
      </button>
      <button v-else-if="hasIncoming" @click.stop="accept" class="btn btn-accept">
        {{ statusText }}
      </button>
      <button v-else-if="hasSent" disabled class="btn btn-sent">
        {{ statusText }}
      </button>
      <button v-else @click.stop="add" class="btn btn-add">
        {{ statusText }}
      </button>
    </div>
  </li>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue'
import { useRouter } from 'vue-router'

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

const emit = defineEmits(['select', 'add-friend', 'accept-request'])

const router = useRouter()
const defaultName = 'Без имени'

const statusText = computed(() => {
  if (props.isFriend) return '✔ Друг'
  if (props.hasIncoming) return '✔ Запрос в друзья'
  if (props.hasSent) return '⏳ Запрос отправлен'
  return '➕ Добавить'
})

function select() {
  emit('select', props.contact)
}

function add() {
  emit('add-friend', props.contact)
}

function accept() {
  emit('accept-request', props.contact)
}
</script>

<style scoped lang="scss">
.contact-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.35rem 0.45rem;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s ease;
  max-width: 100%;
  width: 100%;
  box-sizing: border-box;
  position: relative;
}

.contact-item:hover {
  background-color: #f9f9f9;
}

/* ———————————————————————— */
/* Аватарка и статус онлайн */
/* ———————————————————————— */
.contact-avatar-wrapper {
  position: relative;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  margin-right: 0.8rem;
}

.contact-avatar {
  width: 28px;
  height: 28px;
  border: 0.12rem solid #b8c4cc;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
}

.status-indicator {
  position: absolute;
  bottom: 1px;
  left: 1px;
  font-size: 0.40rem;
  color: #42b983;
  z-index: 1;
  user-select: none;
  pointer-events: none;
}

/* ———————————————————————— */
/* Информация о контакте */
/* ———————————————————————— */
.contact-info {
  flex-grow: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-weight: 500;
  font-size: 0.8rem;
  color: #333;
}

.contact-info.friend {
  font-weight: bold;
  color: #42b983;
}

/* ———————————————————————— */
/* Кнопки действий */
/* ———————————————————————— */
.contact-actions {
  min-width: 80px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.1rem;
  width: 100%;
  padding: 0.2rem 0.35rem;
  border: none;
  border-radius: 3px;
  font-size: 0.60rem;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: background-color 0.2s ease;
  text-align: left;

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
    color: #2c2a2a;
    cursor: not-allowed;

    &:hover {
      background-color: #919090;
    }
  }
}
</style>
