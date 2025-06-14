<template>
  <!-- Контейнер сообщения -->
  <div
     class="message-wrapper"
     :class="{
        sent: isSent,
        received: !isSent,
        'group-start': isGroupStart,
        'group-top': isFirstInGroup,
        'group-bottom': isLastInGroup
      }">
    <!-- Аватарка для исходящих -->
    <div class="message-avatar-wrapper" v-if="!isSent">
      <div class="message-avatar" v-if="isLastInGroup">
        <img class="avatar-img" :src="userFrom.avatar" :alt="userFrom.name" />
      </div>
    </div>

    <!-- Блок сообщения -->
    <div class="message-bubble">
      <div class="message-content">{{ message.content }}</div>

      <!-- Meta + Status -->
      <div class="message-footer">
        <div class="message-meta">
          {{ formatTime(message.created_at) }}
        </div>
        <!-- Статус -->
        <div class="message-status">
          <span v-if="isSent && !message.read_at" class="status-icon status-sent-unread">✔✔</span>
          <span v-if="isSent && message.read_at" class="status-icon status-sent-read">✔✔</span>
          <span v-if="!isSent" class="status-icon status-received">✔</span>
        </div>
      </div>
    </div>

    <!-- Аватарка для входящих -->
    <div class="message-avatar-wrapper" v-if="isSent">
      <div class="message-avatar sent" v-if="isLastInGroup">
        <img class="avatar-img" :src="contact.avatar" :alt="contact.name" />
        <span class="status-indicator">{{ isOnline ? '🟢' : '⚪' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import { useChatStore } from '@/modules/TalkStream/Stores/chatStore'
const chatStore = useChatStore()

const props = defineProps({
  userFrom: {
    type: Object,
    required: true
  },
  contact: {
    type: Object,
    required: true
  },
  message: {
    type: Object,
    required: true
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  isFirstInGroup: { // Первое в группе
    type: Boolean,
    default: false
  },
  isLastInGroup: { // Последнее в группе
    type: Boolean,
    default: false
  },
  isGroupStart: {  // Начало новой группы
    type: Boolean,
    default: false
  },
})

const isSent = props.message.from_id === props.contact.id

function formatTime(time) {
  const date = new Date(time)
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

onMounted(() => {
  // Если уже есть в кэше — не делаем лишних запросов
  if (props.message.read_at) {
    // Отправляем событие о прочтении
    chatStore.markAsRead(props.message.to_id)
  } else if (props.message.from_id === props.contact.id) {
    // Нужно отправить событие о прочтении
  }
})
</script>
<style lang="scss">
.message-wrapper {
  display: flex;
  align-items: self-start;
  padding: 4px 8px;

  &.group-start {
    margin-top: 0.6rem;
  }

  &:not(.group-start) {
    margin-top: 0;
  }

  &.sent {
    justify-content: flex-end;
    border-radius: 0px 0px;
    background-color: #131f2a;
    margin-left: 30%;
    min-width: 120px;;

    // Стиль для одиночных сообщений (которые одновременно и первое и последнее)
    &.group-top.group-bottom {
      border-radius: 8px !important;
    }

    .message-bubble {
      background-color: #4a82c2;
      color: #f6f6f6;
    }

    // Для sent сообщений
    &.group-top {
      background-color: #131f2a;
      border-radius: 8px 8px 0 0;
    }

    &.group-bottom {
      background-color: #131f2a;
      border-radius: 0 0 8px 8px;
    }
  }

  &.received {
    justify-content: flex-start;
    border-radius: 0px 0px;
    background-color: #1b1c1c;
    margin-right: 30%;
    min-width: 120px;;

    // Стиль для одиночных сообщений (которые одновременно и первое и последнее)
    &.group-top.group-bottom {
      border-radius: 8px !important;
    }

    .message-bubble {
      background-color: rgba(46, 83, 112, 0.69);
      color: #e5e5e5;
    }

    // Для received сообщений
    &.group-top {
      background-color: #1b1c1c;
      border-radius: 8px 8px 0 0;
    }

    &.group-bottom {
      background-color: #1b1c1c;
      border-radius: 0 0 8px 8px;
    }
  }

  .message-bubble {
    min-width: 50px;
    border-radius: 8px !important;
  }

  .message-avatar-wrapper {
    position: relative;
    width: 45px;
    height: 45px;
    flex-shrink: 0;
    align-self: center;
  }

  .message-avatar {
    width: 40px;
    height: 40px;
    border: 0.12rem solid #b8c4cc;
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: auto;
    margin-bottom: auto;

    &.sent {
      margin-left: 0.45rem;
      margin-right: 0rem;
      position: relative;
    }

    &:not(.sent) {
      margin-right: 0.45rem;
      margin-left: 0rem;
    }

    &.sent .status-indicator {
      position: absolute;
      bottom: 1px;
      left: 1px;
      font-size: 0.40rem;
      color: #42b983;
      z-index: 1;
      user-select: none;
      pointer-events: none;
    }
  }

  .avatar-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    display: block;
  }

  .message-bubble {
    min-width: 20%;
    padding: 0.45rem 0.75rem;
    font-size: 0.85rem;
    line-height: 1.4;
    display: flex;
    flex-direction: column;
    border-radius: 0;
  }

  .message-content {
    word-break: break-word;
    white-space: pre-wrap;
    flex: 1;
    min-width: 0;
  }

  .message-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    font-size: 0.45rem;
    color: #a6a5a5;
    margin-top: 0.15rem;
    white-space: nowrap;
    position: relative;
  }

  .message-meta {
    margin-right: 0.05rem;
  }

  .message-status {
    display: flex;
    align-items: center;
    color: #999;
    margin-top: 0.25rem;
    position: absolute;
    bottom: 0.25rem;
    right: 0.5rem;
    white-space: nowrap;
    margin-left: 0.05rem;
    font-size: 0.50rem;
    z-index: 1;

    .status-icon {
      display: inline-block;
      text-align: center;
      line-height: 1;
      font-weight: bold;
      font-size: 0.50rem;
      color: #999;
      user-select: none;
      pointer-events: none;
      margin-left: 0.05rem;
      letter-spacing: -0.10rem;
    }
  }

  .status-sent-unread {
    color: #a9a9a9;
  }

  .status-sent-read {
    color: #007AFF;
  }

  .status-received {
    color: #34C759;
  }
}
</style>
