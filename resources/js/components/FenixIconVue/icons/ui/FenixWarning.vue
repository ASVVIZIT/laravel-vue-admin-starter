<!-- resources/js/components/FenixIconVue/icons/FenixWarning.vue -->
<template>
  <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 24 24"
      :width="Number(props.size)"
      :height="Number(props.size)"
      aria-label="Warning"
      role="img"
  >
    <defs>
      <linearGradient v-if="props.useGradients" id="fireGradient" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stop-color="#ff0000"/>
        <stop offset="40%" stop-color="#ff6600"/>
        <stop offset="80%" stop-color="#ffcc00"/>
        <stop offset="100%" stop-color="#ffff66"/>
      </linearGradient>
      <filter v-if="props.useGradients" id="fireGlow">
        <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>

    <!-- Огненный треугольник -->
    <path
        d="M12 2 L22 20 L2 20 Z"
        :fill="triangleFill"
        :filter="props.useGradients ? 'url(#fireGlow)' : undefined"
        :stroke="props.useGradients ? '#ff3300' : props.color"
        stroke-width="0.5"
    />

    <!-- Восклицательный знак (всегда белый) -->
    <rect x="11" y="9" width="2" height="6" rx="1" :fill="exclamationFill"/>
    <circle cx="12" cy="17.5" r="1.2" :fill="exclamationFill"/>

    <!-- Языки пламени по краям (только с градиентом) -->
    <path v-if="props.useGradients" d="M6 18 Q5 15 7 14 Q6 16 8 17 Z" fill="#ff6600" opacity="0.8"/>
    <path v-if="props.useGradients" d="M18 18 Q19 15 17 14 Q18 16 16 17 Z" fill="#ff6600" opacity="0.8"/>
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: { type: [Number, String], default: 24 },
  color: { type: String, default: 'currentColor' },
  useGradients: { type: Boolean, default: false }
})

const triangleFill = computed(() => props.useGradients ? 'url(#fireGradient)' : props.color)
const exclamationFill = computed(() => '#fff')
</script>

<script>
export default { name: 'FenixWarning', inheritAttrs: false }
</script>

<style scoped>
svg {
  display: inline-block;
  vertical-align: middle;
  fill: v-bind(color); /*  ВОЗВРАЩЁНО для обратной совместимости */
}
</style>
