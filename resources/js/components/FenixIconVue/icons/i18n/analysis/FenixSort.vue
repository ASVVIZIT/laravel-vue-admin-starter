<!-- resources/js/components/FenixIconVue/icons/i18n/analysis/FenixSort.vue -->
<template>
  <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 24 24"
      :width="Number(props.size)"
      :height="Number(props.size)"
      aria-label="Sort"
      role="img"
  >
    <defs>
      <linearGradient v-if="props.useGradients" id="sortGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" :stop-color="gradientStart"/>
        <stop offset="100%" :stop-color="gradientEnd"/>
      </linearGradient>
    </defs>

    <!-- Стрелка вверх -->
    <path
        d="M8 4 L8 14 M5 7 L8 4 L11 7"
        fill="none"
        :stroke="props.useGradients ? 'url(#sortGradient)' : props.color"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
    />

    <!-- Стрелка вниз -->
    <path
        d="M16 20 L16 10 M13 17 L16 20 L19 17"
        fill="none"
        :stroke="props.useGradients ? 'url(#sortGradient)' : props.color"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
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
export default { name: 'FenixSort', inheritAttrs: false }
</script>

<style scoped>
svg { display: inline-block; vertical-align: middle; fill: v-bind(color); }
</style>
