<template>
  <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      :width="props.size"
      :height="props.size"
  >
    <defs v-if="props.useGradients">
      <linearGradient id="keyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f093fb"/>
        <stop offset="100%" stop-color="#f5576c"/>
      </linearGradient>
    </defs>

    <circle cx="8" cy="15" r="4" fill="none" :stroke="strokeColor" stroke-width="1.5"/>
    <path d="M11 12 L20 3 L22 5 L20 7 L18 5 L16 7 L14 5"
          fill="none"
          :stroke="strokeColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"/>
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: { type: [Number, String], default: 24 },
  color: { type: String, default: 'currentColor' },
  useGradients: { type: Boolean, default: false }
})

const strokeColor = computed(() => props.useGradients ? 'url(#keyGrad)' : props.color)
</script>

<script>
export default { name: 'CustomKey', inheritAttrs: false }
</script>

<style scoped>
svg { display: inline-block; vertical-align: middle; }
</style>
