<template>
  <div class="talkstream-header">
    <div class="header-info">
      <div class="user-avatar" :style="{ backgroundImage: `url(${contact.avatar})` }"></div>
      <div class="user-name">{{ contact.name }}</div>
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
}

.header-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
}

.user-name {
  font-weight: bold;
  font-size: 1rem;
}
</style>
