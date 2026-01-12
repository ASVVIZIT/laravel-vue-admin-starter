<template>
  <div
      class="message-wrapper"
      :class="{
      sent: !isSent,
      received: isSent,
      'group-top': isFirstInGroup,
      'group-bottom': isLastInGroup,
      'wide-message': isWideMessage,
      'narrow-message': !isWideMessage
    }"
  >
    <div
        class="message-bubble"
        :class="{
        'group-top': isFirstInGroup,
        'group-bottom': isLastInGroup,
        'wide': isWideMessage,
        'narrow': !isWideMessage
      }"
    >
      <div class="message-content">{{ message.content }}</div>

      <div class="message-footer">
        <div class="message-meta">
          {{ message.formatted_created_at }}
        </div>
        <div class="message-status">
          <span v-if="isSent && !message.read_at" class="status-icon status-sent-unread">✔✔</span>
          <span v-if="isSent && message.read_at" class="status-icon status-sent-read">✔✔</span>
          <span v-if="!isSent" class="status-icon status-received">✔</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue'

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
  isFirstInGroup: {
    type: Boolean,
    default: false
  },
  isLastInGroup: {
    type: Boolean,
    default: false
  },
  isGroupStart: {
    type: Boolean,
    default: false
  }
})

const isSent = computed(() => props.message.from_id !== props.contact.id)
const isWideMessage = computed(() => props.message.content.length < 40)
</script>

<style lang="scss" scoped>
.message-wrapper {
  display: flex;
  align-items: flex-start;
  padding: 4px 6px;
  position: relative;

  &.group-start {
    margin-top: 0.8rem;
  }

  &.sent {
    justify-content: flex-start;

    .message-bubble {
      background-color: rgba(46, 83, 112, 0.69);
      box-shadow: 0px 0px 2px 1px rgba(107, 130, 147, 0.94);
      color: #e5e5e5;

      /* Одиночные сообщения */
      &.group-top.group-bottom {
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
      }

      /* Верхние сообщения в группе */
      &.group-top:not(.group-bottom) {
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
      }

      /* Широкие верхние сообщения */
      &.group-top:not(.group-bottom).wide {
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
      }

      /* Узкие верхние сообщения */
      &.group-top:not(.group-bottom).narrow {
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
      }

      /* Нижние сообщения в группе */
      &.group-bottom:not(.group-top) {
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
      }

      /* Широкие нижние сообщения */
      &.group-bottom:not(.group-top).wide {
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
      }

      /* Узкие нижние сообщения */
      &.group-bottom:not(.group-top).narrow {
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
      }

      /* Средние сообщения */
      &:not(.group-top):not(.group-bottom) {
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
      }

      /* Широкие средние сообщения */
      &:not(.group-top):not(.group-bottom).wide {
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
      }

      /* Узкие средние сообщения */
      &:not(.group-top):not(.group-bottom).narrow {
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
      }
    }
  }

  &.received {
    justify-content: flex-end;

    .message-bubble {
      background-color: #5f84aec7;
      box-shadow: 0px 0px 2px 1px rgba(107, 130, 147, 0.94);
      color: #f6f6f6;

      /* Одиночные сообщения */
      &.group-top.group-bottom {
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
      }

      /* Верхние сообщения в группе */
      &.group-top:not(.group-bottom) {
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
      }

      /* Широкие верхние сообщения */
      &.group-top:not(.group-bottom).wide {
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
      }

      /* Узкие верхние сообщения */
      &.group-top:not(.group-bottom).narrow {
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
      }

      /* Нижние сообщения в группе */
      &.group-bottom:not(.group-top) {
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
      }

      /* Широкие нижние сообщения */
      &.group-bottom:not(.group-top).wide {
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
      }

      /* Узкие нижние сообщения */
      &.group-bottom:not(.group-top).narrow {
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
      }

      /* Средние сообщения */
      &:not(.group-top):not(.group-bottom) {
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
      }

      /* Широкие средние сообщения */
      &:not(.group-top):not(.group-bottom).wide {
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
      }

      /* Узкие средние сообщения */
      &:not(.group-top):not(.group-bottom).narrow {
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
      }
    }
  }

  .message-bubble {
    padding: 8px 12px;
    font-size: 0.95rem;
    line-height: 1.4;
    display: flex;
    flex-direction: column;
    position: relative;
    word-break: break-word;
    transition: all 0.3s ease;
    overflow: hidden;
  }

  .message-content {
    word-break: break-word;
    white-space: pre-wrap;
    position: relative;
    z-index: 1;
  }

  .message-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.7);
    margin-top: 4px;
    position: relative;
    z-index: 1;
  }

  .message-meta {
    margin-right: 6px;
  }

  .message-status {
    display: flex;
    align-items: center;
  }

  .status-icon {
    display: inline-block;
    font-size: 0.9rem;
    margin-left: 2px;
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
