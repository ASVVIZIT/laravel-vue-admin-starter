<template>
  <div class="contact-item" :class="{ online: isOnline }" @click="select">
    {{ contact.name }}
    <span class="status">{{ isOnline ? '🟢 Онлайн' : '⚪ Офлайн' }}</span>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  contact: Object,
  isOnline: Boolean
})

const emit = defineEmits(['select'])

function select() {
  emit('select', props.contact)
}
</script>
