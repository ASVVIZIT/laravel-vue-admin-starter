<!-- resources/js/components/FenixIconVue/icons/i18n/extras/FenixBell.vue -->
<template>
  <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 24 24"
      :width="Number(props.size)"
      :height="Number(props.size)"
      aria-label="Notification"
      role="img"
  >
    <defs>
      <linearGradient v-if="props.useGradients" id="bellGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" :stop-color="gradientStart"/>
        <stop offset="100%" :stop-color="gradientEnd"/>
      </linearGradient>
    </defs>

    <!-- Колокольчик -->
    <path
        d="M18 16 V11 C18 7.69 16.31 5 13 4.5 V4 C13 3.45 12.55 3 12 3 C11.45 3 11 3.45 11 4 V4.5 C7.69 5 6 7.69 6 11 V16 L4 18 V19 H20 V18 L18 16 Z"
        fill="none"
        :stroke="props.useGradients ? 'url(#bellGradient)' : props.color"
        stroke-width="1.5"
        stroke-linejoin="round"
    />

    <!-- Язычок -->
    <path
        d="M10 20 C10 21.1 10.9 22 12 22 C13.1 22 14 21.1 14 20"
        fill="none"
        :stroke="props.useGradients ? 'url(#bellGradient)' : props.color"
        stroke-width="1.5"
        stroke-linecap="round"
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
export default { name: 'FenixBell', inheritAttrs: false }
</script>

<style scoped>
svg { display: inline-block; vertical-align: middle; fill: v-bind(color); }
</style>
