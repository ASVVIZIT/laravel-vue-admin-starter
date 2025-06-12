<template>
  <li class="contact-item" :class="{ online: isOnline }" @click="select">
    {{ contact.name }}
    <button v-if="isFriend">Друг</button>
    <button v-else-if="hasIncoming">Принять</button>
    <button v-else>Добавить</button>
  </li>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  contact: Object,
  isOnline: Boolean,
  isFriend: Boolean,
  hasIncoming: Boolean
})

const emit = defineEmits(['select'])

function select() {
  emit('select', props.contact)
}
</script>
