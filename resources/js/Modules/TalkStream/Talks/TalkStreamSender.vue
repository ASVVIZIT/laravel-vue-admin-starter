<template>
  <div class="talkstream-sender">
    <input type="textarea" v-model="message" @keyup.enter="sendMessage" placeholder="Введите сообщение..." />
    <button @click="sendMessage">Отправить</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { defineProps, defineEmits } from 'vue'

const props = defineProps(['contact'])
const emit = defineEmits(['send'])

const message = ref('')

function sendMessage() {
  if (message.value.trim()) {
    emit('send', { content: message.value, to_id: props.contact.id })
    message.value = ''
  }
}
</script>

<style scoped lang="scss">
.talkstream-sender {
  display: flex;
  padding: 1rem;
  width: 100%;
  border-top: 1px solid #eaeaea;
}

el-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-right: 0.5rem;
}

button {
  padding: 0.5rem 1rem;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #36a871;
  }
}
</style>
