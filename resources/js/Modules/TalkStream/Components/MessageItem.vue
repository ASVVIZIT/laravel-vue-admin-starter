<template>
  <li className="message-item">
    <strong>{{ message.sender.name }}</strong>: {{ message.content }}
  </li>
</template>

<script setup>
defineProps({
  message: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.message-item {
  margin-bottom: 10px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
}
</style>
