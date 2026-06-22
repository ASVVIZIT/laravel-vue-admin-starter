<template>
  <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      :width="props.size"
      :height="props.size"
  >
    <defs v-if="props.useGradients">
      <linearGradient id="checkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#11998e"/>
        <stop offset="100%" stop-color="#38ef7d"/>
      </linearGradient>
    </defs>

    <circle cx="12" cy="12" r="10" fill="none" :stroke="strokeColor" stroke-width="1.5"/>
    <path d="M7 12 L10.5 15.5 L17 9"
          fill="none"
          :stroke="strokeColor"
          stroke-width="2"
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

const strokeColor = computed(() => props.useGradients ? 'url(#checkGrad)' : props.color)
</script>

<script>
export default { name: 'CustomCheckCircle', inheritAttrs: false }
</script>

<style scoped>
svg { display: inline-block; vertical-align: middle; }
</style>
