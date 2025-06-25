<template>
  <li
      class="contact-item"
      :class="{
          online: isOnline,
          friend: isFriend,
          selectedContact: isSelected
      }"
      @click="select"
  >
    <!-- Аватарка + статус онлайн -->
    <div class="contact-avatar-wrapper">
      <div
          class="contact-avatar"
          :style="{ backgroundImage: 'url(' + (contact.avatar || '/images/default-avatar.png') + ')' }"
      ></div>
      <span class="status-indicator">{{ isOnline ? '🟢' : '⚪' }}</span>
    </div>

    <!-- Информация о контакте -->
    <div class="contact-info" :class="{ friend: isFriend }">
      <div class="contact-indicator">
        <span class="contact-id">ID: {{ contact?.id }}</span>
        <span class="contact-meta">[{{ contact.main_role || 'Пользователь' }}]</span>
      </div>

      {{ contact?.name || defaultName }}
    </div>

    <!-- Кнопки действий -->
    <div class="contact-actions">
      <button v-if="isFriend" disabled class="btn btn-friend">
        <span class="btn-text">{{ statusText }}</span>
      </button>
      <button v-else-if="hasIncoming" @click.stop="accept" class="btn btn-accept">
        <span class="btn-text">{{ statusText }}</span>
      </button>
      <button v-else-if="hasSent" disabled class="btn btn-sent">
        <span class="btn-text">{{ statusText }}</span>
      </button>
      <button v-else @click.stop="add" class="btn btn-add">
        <span class="btn-text">{{ statusText }}</span>
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
  isSelected: {
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
  padding: 0.15rem .18rem 0.15rem .18rem;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  max-width: 100%;
  width: 100%;
  box-sizing: border-box;
  position: relative;
}
.contact-item:hover {
  background-color: #f9f9f9;
}

.contact-item.selectedContact {
  background-color: #d6ebff !important;
  transform: scale(1.02);
  z-index: 1;
  box-shadow: 0 0 3px rgba(52, 144, 220, 0.5); // Синяя тень
  font-weight: bold;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: linear-gradient(to bottom, #3490dc, #1c7ed6);
    z-index: 2;
  }

  .contact-info.friend {
    color: #3490dc;
  }
}

.contact-item.selectedContact::after {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 1px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(52, 144, 220, 0.4);
  }
  70% {
    box-shadow: 0 0 0 4px rgba(52, 144, 220, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(52, 144, 220, 0);
  }
}

.contact-item.selectedContact:hover {
  background-color: #7aade0;
}

  /* ———————————————————————— */
/* Аватарка и статус онлайн */
/* ———————————————————————— */
.contact-avatar-wrapper {
  position: relative;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  margin-right: 0.5rem;
  margin-left: 0.2rem;
}

.contact-avatar {
  width: 30px;
  height: 30px;
  box-shadow: inset 0 0 0 0.12rem #b8c4cc;
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
  bottom: -2px;
  left: -2px;
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
  position: relative;
  flex-grow: 1;
  overflow: hidden;
  margin-right: 0.7rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  line-height: 0.75rem;
  font-weight: 600;
  font-size: 0.70rem;
  color: #333;
}

.contact-info.friend {
  font-weight: bold;
  color: #42b983;
}

.contact-indicator {
  display: flex;
  justify-content: space-between;
  font-size: 0.50rem;
  color: #777;
  margin-bottom: 0.1rem;
  white-space: nowrap;
}

.contact-id {
  font-weight: bold;
  color: #888;
  background: rgba(200, 200, 200, 0.2);
  padding: 0.05rem 0.25rem;
  border-radius: 3px;
}

.contact-meta {
  font-style: italic;
  color: #999;
}

.contact-info.friend {
  font-weight: bold;
  color: #42b983;
}

/* ———————————————————————— */
/* Кнопки действий */
/* ———————————————————————— */
.contact-actions {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 0.04rem;
}

.btn {
  min-width: 60px;      // Минимальная ширина
  max-width: 60px;     // Максимальная ширина
  padding: 0.42rem 0.3rem;
  border: none;
  border-radius: 4px;
  font-size: 0.42rem;
  cursor: pointer;
  white-space: normal;   // Разрешаем перенос строк
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
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
.btn-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  line-height: 1.1em;
  max-height: 2.2em;
}
</style>
