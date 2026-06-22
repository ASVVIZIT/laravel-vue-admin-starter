<template>
  <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      :width="props.size"
      :height="props.size"
  >
    <defs v-if="props.useGradients">
      <linearGradient id="customSearchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#00c6ff"/>
        <stop offset="100%" stop-color="#0072ff"/>
      </linearGradient>
    </defs>

    <circle cx="11" cy="11" r="7" fill="none" :stroke="strokeColor" stroke-width="2"/>
    <line x1="16.5" y1="16.5" x2="21" y2="21" :stroke="strokeColor" stroke-width="2" stroke-linecap="round"/>
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: { type: [Number, String], default: 24 },
  color: { type: String, default: 'currentColor' },
  useGradients: { type: Boolean, default: false }
})

const strokeColor = computed(() => props.useGradients ? 'url(#customSearchGrad)' : props.color)
</script>

<script>
export default { name: 'CustomSearch', inheritAttrs: false }
</script>

<style scoped>
svg { display: inline-block; vertical-align: middle; }
</style>
