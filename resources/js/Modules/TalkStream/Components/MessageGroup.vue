<template>
  <div class="message-group" :class="{ sent: isSent, received: !isSent }">
    <!-- Для отправленных сообщений аватар слева -->
    <div
        class="group-avatar sent-avatar"
        v-if="isSent && showAvatarForLast"
        :class="{ visible: avatarVisible }"
    >
      <div
          class="avatar-img"
          :style="{ backgroundImage: 'url(' + avatarUrl + ')' }"
      ></div>
      <!-- Добавляем индикатор статуса для отправленных сообщений -->
      <span v-if="isOnline && isSent" class="status-indicator">●</span>
    </div>

    <div class="message-group-container">
      <slot
          v-for="(msg, index) in messages"
          :key="msg.id"
          :message="msg"
          :isFirstInGroup="index === 0"
          :isLastInGroup="index === messages.length - 1"
      />
    </div>

    <!-- Для полученных сообщений аватар справа -->
    <div
        class="group-avatar received-avatar"
        v-if="!isSent && showAvatarForLast"
        :class="{ visible: avatarVisible }"
    >
      <div
          class="avatar-img"
          :style="{ backgroundImage: 'url(' + avatarUrl + ')' }"
      ></div>
      <!-- Индикатор статуса для полученных сообщений -->
      <span v-if="isOnline && !isSent" class="status-indicator">●</span>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed, ref, onMounted } from 'vue'

const props = defineProps({
  fromId: {
    type: Number,
    required: true
  },
  messages: {
    type: Array,
    required: true
  },
  userFrom: {
    type: Object,
    required: true
  },
  contact: {
    type: Object,
    required: true
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  showAvatar: {
    type: Boolean,
    default: true
  }
})

const avatarVisible = ref(false)
const isSent = computed(() => props.contact.id === props.fromId)

const avatarUrl = computed(() =>
    isSent.value
        ? props.contact.avatar
        : props.userFrom.avatar || '/images/default-avatar.png'
)

const showAvatarForLast = computed(() => props.messages.length > 0 && props.showAvatar)

onMounted(() => {
  setTimeout(() => {
    avatarVisible.value = true
  }, 10)
})
</script>

<style lang="scss" scoped>
.message-group {
  display: flex;
  align-items: flex-end;
  position: relative;
  margin-bottom: 2px;
  transition: all 0.3s ease;

  &.sent {
    justify-content: flex-start;

    .message-group-container {
      align-items: flex-start;
    }
  }

  &.received {
    justify-content: flex-end;

    .message-group-container {
      align-items: flex-end;
    }
  }

  .group-avatar {
    flex-shrink: 0;
    width: 30px;
    height: 30px;
    position: relative;
    margin-bottom: 4px;
    opacity: 0;
    transform: translateY(10px) scale(0.8);
    transition: all 0.3s ease;

    &.visible {
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    .avatar-img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      box-shadow: 0px 0px 5px 2px #7bb0d9e8;
      transition: all 0.3s ease;
    }

    .status-indicator {
      position: absolute;
      bottom: -1px;
      right: -1px;
      width: 10px;
      height: 10px;
      background-color: #42b983;
      border: 2px solid #2e2f34;
      border-radius: 50%;
      z-index: 2;
    }

    &.received-avatar {
      margin-left: 2px;
      margin-right: 2px;
      order: 3;
    }

    &.sent-avatar {
      margin-right: 2px;
      margin-left: 2px;
      order: 1;
    }
  }

  .message-group-container {
    display: flex;
    flex-direction: column;
    max-width: 80%;
    order: 2;
    transition: transform 0.3s ease;
  }
}
</style>
