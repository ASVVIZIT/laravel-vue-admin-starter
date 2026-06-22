<!-- resources/js/components/FenixIconVue/icons/i18n/extras/FenixTag.vue -->
<template>
  <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 24 24"
      :width="Number(props.size)"
      :height="Number(props.size)"
      aria-label="Tag"
      role="img"
  >
    <defs>
      <linearGradient v-if="props.useGradients" id="tagGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" :stop-color="gradientStart"/>
        <stop offset="100%" :stop-color="gradientEnd"/>
      </linearGradient>
    </defs>

    <!-- Контур тега -->
    <path
        d="M20.59 13.41 L13.42 20.58 C13.04 20.96 12.52 21.17 11.98 21.17 C11.44 21.17 10.92 20.96 10.54 20.58 L3 13.04 V3 H12.96 L20.59 10.63 C21.35 11.39 21.35 12.63 20.59 13.41 Z"
        fill="none"
        :stroke="props.useGradients ? 'url(#tagGradient)' : props.color"
        stroke-width="1.5"
        stroke-linejoin="round"
    />

    <!-- Дырка в теге -->
    <circle
        cx="7.5"
        cy="7.5"
        r="1.5"
        :fill="props.useGradients ? 'url(#tagGradient)' : props.color"
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
export default { name: 'FenixTag', inheritAttrs: false }
</script>

<style scoped>
svg { display: inline-block; vertical-align: middle; fill: v-bind(color); }
</style>
