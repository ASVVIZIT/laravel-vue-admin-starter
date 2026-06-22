<template>
  <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      :width="props.size"
      :height="props.size"
  >
    <defs v-if="props.useGradients">
      <linearGradient id="exclGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#eb3349"/>
        <stop offset="100%" stop-color="#f45c43"/>
      </linearGradient>
    </defs>

    <circle cx="12" cy="12" r="10" fill="none" :stroke="strokeColor" stroke-width="1.5"/>
    <rect x="11" y="6" width="2" height="8" rx="1" :fill="fillColor"/>
    <circle cx="12" cy="17" r="1.2" :fill="fillColor"/>
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: { type: [Number, String], default: 24 },
  color: { type: String, default: 'currentColor' },
  useGradients: { type: Boolean, default: false }
})

const strokeColor = computed(() => props.useGradients ? 'url(#exclGrad)' : props.color)
const fillColor = computed(() => props.useGradients ? 'url(#exclGrad)' : props.color)
</script>

<script>
export default { name: 'CustomExclamationCircle', inheritAttrs: false }
</script>

<style scoped>
svg { display: inline-block; vertical-align: middle; }
</style>
