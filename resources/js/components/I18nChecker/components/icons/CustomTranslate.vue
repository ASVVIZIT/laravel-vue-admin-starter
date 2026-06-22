<template>
  <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      :width="props.size"
      :height="props.size"
  >
    <defs v-if="props.useGradients">
      <linearGradient id="translateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#667eea"/>
        <stop offset="100%" stop-color="#764ba2"/>
      </linearGradient>
    </defs>

    <circle cx="12" cy="12" r="10" fill="none" :stroke="strokeColor" stroke-width="1.5"/>
    <text x="6" y="15" font-family="Arial" font-size="8" font-weight="bold" :fill="fillColor">A</text>
    <text x="14" y="15" font-family="Arial" font-size="8" font-weight="bold" :fill="fillColor">Я</text>
    <line x1="12" y1="4" x2="12" y2="20" :stroke="strokeColor" stroke-width="0.5" opacity="0.3"/>
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: { type: [Number, String], default: 24 },
  color: { type: String, default: 'currentColor' },
  useGradients: { type: Boolean, default: false }
})

const strokeColor = computed(() => props.useGradients ? 'url(#translateGrad)' : props.color)
const fillColor = computed(() => props.useGradients ? 'url(#translateGrad)' : props.color)
</script>

<script>
export default { name: 'CustomTranslate', inheritAttrs: false }
</script>

<style scoped>
svg { display: inline-block; vertical-align: middle; }
</style>
