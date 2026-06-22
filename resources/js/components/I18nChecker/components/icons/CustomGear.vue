<template>
  <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      :width="props.size"
      :height="props.size"
  >
    <defs v-if="props.useGradients">
      <linearGradient id="gearGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#4e54c8"/>
        <stop offset="100%" stop-color="#8f94fb"/>
      </linearGradient>
    </defs>

    <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" fill="none" :stroke="strokeColor" stroke-width="1.5"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
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

const strokeColor = computed(() => props.useGradients ? 'url(#gearGrad)' : props.color)
</script>

<script>
export default { name: 'CustomGear', inheritAttrs: false }
</script>

<style scoped>
svg { display: inline-block; vertical-align: middle; }
</style>
