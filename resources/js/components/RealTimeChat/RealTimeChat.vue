<template>
  <div>
    <div v-for="msg in messages" :key="msg.id">
      {{ msg.user.name }}: {{ msg.message }}
    </div>
    <input v-model="newMessage" @keyup.enter="send">
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const messages = ref([]);
const newMessage = ref('');

const loadMessages = async () => {
  const response = await axios.get('/api/messages');
  messages.value = response.data;
};

const send = async () => {
  await axios.post('/api/messages', {
    receiver_id: 2, // ID получателя
    message: newMessage.value
  });
  newMessage.value = '';
};

onMounted(() => {
  loadMessages();

  // Подписка на канал
  window.Echo.private(`chat.${userId}`) // ID текущего пользователя
      .listen('NewMessage', (e) => {
        messages.value.push(e.message);
      });
});
</script>
