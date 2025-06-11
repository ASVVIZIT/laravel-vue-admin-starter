<script setup>
import { onMounted } from 'vue';
import { talkStreamStore } from '@/store/talkStreamStore/talkStreamStore';
import { userStore } from '@/store/user';

const useUser = userStore();
const useTalkStream = talkStreamStore();

onMounted(() => {
  // Если пользователь уже авторизован, инициализируем WebSocket
  if (useUser.token) {
    useTalkStream.init();
  }
});
</script>

<template>
  <div class="chat-container">
    <!-- Индикатор состояния подключения -->
    <div v-if="useTalkStream.connectionError" class="alert alert-error">
      WebSocket Error: {{ useTalkStream.connectionError }}
    </div>
    <div v-else-if="!useTalkStream.isConnected" class="alert alert-warning">
      Connecting to chat server...
    </div>
    <div v-else class="alert alert-success">
      Chat connected!
    </div>

    <!-- Основной интерфейс чата -->
    <div class="chat-content">
      <div v-for="msg in useTalkStream.messages" :key="msg.id">
        {{ msg.content }}
      </div>
    </div>
  </div>
</template>
