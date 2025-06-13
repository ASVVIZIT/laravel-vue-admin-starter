<template>
  <div class="talkstream-header">
    <div v-if="props.contact">
        <div class="user-avatar" :style="{ backgroundImage: `url(${props.contact.avatar || '/images/default-avatar.png' })`}"></div>
        <div class="user-name">{{ contact.name || 'Без имени' }}</div>
    </div>
    <div v-else-if="!props.contact">
        Выберите контакт
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  contact: {
    type: Object,
    required: true
  }
})
</script>

<style scoped lang="scss">
.talkstream-header {
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: #f5f5f5;
  border-bottom: 1px solid #eaeaea;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  margin-right: 1rem;
}

.user-name {
  font-weight: bold;
  font-size: 1rem;
  color: #333;
}

.user-role {
  font-size: 0.85rem;
  color: #999;
}
</style>
