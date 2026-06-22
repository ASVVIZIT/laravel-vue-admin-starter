<!-- resources/js/components/FenixIconVue/icons/i18n/analysis/FenixCompare.vue -->
<template>
  <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 24 24"
      :width="Number(props.size)"
      :height="Number(props.size)"
      aria-label="Compare"
      role="img"
  >
    <defs>
      <linearGradient v-if="props.useGradients" id="compareGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" :stop-color="gradientStart"/>
        <stop offset="100%" :stop-color="gradientEnd"/>
      </linearGradient>
    </defs>

    <!-- Левая стрелка (вправо) -->
    <path
        d="M4 8 L10 8 L10 6 L14 9 L10 12 L10 10 L4 10 Z"
        :fill="props.useGradients ? 'url(#compareGradient)' : props.color"
    />

    <!-- Правая стрелка (влево) -->
    <path
        d="M20 14 L14 14 L14 12 L10 15 L14 18 L14 16 L20 16 Z"
        :fill="props.useGradients ? 'url(#compareGradient)' : props.color"
    />
  </svg>
</template>

<script setup>
import { computed } from 'vue'
import { lightenColor, darkenColor } from '@components/FenixIconVue/utils/gradientUtils.js'

const props = defineProps({
  size: { type: [Number, String], default: 24 },
  color: { type: String, default: 'currentColor' },
  useGradients: { type: Boolean, default: false }
})

const gradientStart = computed(() => lightenColor(props.color, 20))
const gradientEnd = computed(() => darkenColor(props.color, 20))
</script>

<script>
export default { name: 'FenixCompare', inheritAttrs: false }
</script>

<style scoped>
svg { display: inline-block; vertical-align: middle; fill: v-bind(color); }
</style>
