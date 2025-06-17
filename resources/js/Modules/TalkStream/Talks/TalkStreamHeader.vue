<template>
  <div class="talkstream-header">
    <div v-if="contact" class="talkstream-header-line">
      <div class="user-avatar-wrapper">
        <div class="user-avatar" :style="{ backgroundImage: `url(${contact.avatar || '/images/default-avatar.png' })`}"></div>
        <span class="status-indicator">{{ contactIsOnline ? '🟢' : '⚪' }}</span>
      </div>

      <div class="user-name">{{ contact.name || 'Без имени' }}</div>
      <div class="user-id">ID: {{ contact.id || 'нет' }}</div>
    </div>

    <div v-else class="no-contact">
      Выберите контакт
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  contact: {
    type: Object,
    required: false,
    default: null
  },
  isOnline: {
    type: Boolean,
    default: false
  }
})

// Если контакт задан — проверяем по ID
const contactIsOnline = computed(() => {
  if (!props.contact) return false
  return props.isOnline || false
})
</script>

<style scoped lang="scss">
.talkstream-header {
  display: flex;
  align-items: center;
  padding: 0.3rem;
  background-color: #f5f5f5;
  border-bottom: 1px solid #eaeaea;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
.talkstream-header-line {
  display: inline-flex;
  align-items: center;
  padding: 2px 2px;
}

.user-avatar-wrapper {
  position: relative;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  margin-right: 0.8rem;
}
.user-avatar {
  flex-shrink: 0;
  position: relative;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  margin-right: 1rem;
  border: 0.12rem solid #b8c4cc;
  background-repeat: no-repeat;
  overflow: hidden;
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
.user-name {
  font-weight: bold;
  font-size: 1rem;
  color: #333;
  margin: 0 auto;
}

.user-id {
  font-weight: bold;
  font-size: 1rem;
  color: #333;
  padding-left: 2px;
  margin: 0 auto;
}

.user-role {
  font-size: 0.85rem;
  color: #999;
}
</style>
