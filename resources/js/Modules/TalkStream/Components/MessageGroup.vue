<template>
  <div class="message-group" :class="{ mine: isMine, theirs: !isMine }">
    <!-- Аватар СОБЕСЕДНИКА (слева) -->
    <div
        v-if="!isMine && showAvatar"
        class="group-avatar theirs-avatar"
        :class="{ visible: avatarVisible }"
    >
      <div
          class="avatar-img"
          :style="{ backgroundImage: 'url(' + avatarUrl + ')' }"
      ></div>
      <span class="status-indicator">{{ isOnline ? '🟢' : '⚪' }}</span>
    </div>

    <!-- Контейнер с сообщениями -->
    <div class="message-group-container">
      <slot
          v-for="(msg, index) in messages"
          :key="msg.id"
          :message="msg"
          :isFirstInGroup="index === 0"
          :isLastInGroup="index === messages.length - 1"
      />
    </div>

    <!-- Аватар МОЙ (справа) -->
    <div
        v-if="isMine && showAvatar"
        class="group-avatar mine-avatar"
        :class="{ visible: avatarVisible }"
    >
      <div
          class="avatar-img"
          :style="{ backgroundImage: 'url(' + avatarUrl + ')' }"
      ></div>
      <span class="status-indicator">{{ isOnline ? '🟢' : '⚪' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Message } from '@/modules/TalkStream/types'

// ТУПОЙ КОМПОНЕНТ: принимает только готовые данные, ноль бизнес-логики
const props = defineProps<{
  avatarUrl: string
  isMine: boolean
  messages: Message[]
  isOnline: boolean
  showAvatar: boolean
}>()

const avatarVisible = ref(false)

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
  width: 100%;
  position: relative;
  margin-bottom: 2px;
  transition: all 0.3s ease;

  // МОИ сообщения — весь блок прижат вправо
  &.mine {
    justify-content: flex-end;

    .message-group-container {
      align-items: flex-end;
    }
  }

  // СООБЩЕНИЯ СОБЕСЕДНИКА — весь блок прижат влево
  &.theirs {
    justify-content: flex-start;

    .message-group-container {
      align-items: flex-start;
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

    // Индикатор — эмодзи (как в ContactItem.vue), НЕ CSS-кружок
    .status-indicator {
      position: absolute;
      bottom: -2px;
      left: -2px;
      font-size: 0.5rem;
      line-height: 1;
      color: #42b983;
      z-index: 2;
      user-select: none;
      pointer-events: none;
      text-shadow: 0 0 2px rgba(255, 255, 255, 0.8);
    }

    // Аватар собеседника — слева
    &.theirs-avatar {
      margin-right: 8px;
      order: 1;
    }

    // Мой аватар — справа
    &.mine-avatar {
      margin-left: 8px;
      order: 3;
    }
  }

  // Контейнер сообщений: потолок 80% ширины строки, сжимается по контенту
  .message-group-container {
    display: flex;
    flex-direction: column;
    max-width: 80%;
    order: 2;
    transition: transform 0.3s ease;
  }
}
</style>
