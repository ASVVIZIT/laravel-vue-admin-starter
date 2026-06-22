<!-- resources/js/components/FenixIconVue/icons/i18n/status/FenixPending.vue -->
<template>
  <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 24 24"
      :width="Number(props.size)"
      :height="Number(props.size)"
      aria-label="Pending"
      role="img"
  >
    <defs>
      <linearGradient v-if="props.useGradients" id="pendingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" :stop-color="gradientStart"/>
        <stop offset="100%" :stop-color="gradientEnd"/>
      </linearGradient>
    </defs>

    <!-- Круг (фон) -->
    <circle
        cx="12"
        cy="12"
        r="10"
        :fill="props.useGradients ? 'url(#pendingGradient)' : props.color"
        opacity="0.15"
    />

    <!-- Круг (контур) -->
    <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        :stroke="props.useGradients ? 'url(#pendingGradient)' : props.color"
        stroke-width="1.5"
    />

    <!-- Часовая стрелка -->
    <line
        x1="12"
        y1="12"
        x2="12"
        y2="8"
        :stroke="props.useGradients ? 'url(#pendingGradient)' : props.color"
        stroke-width="2"
        stroke-linecap="round"
    />

    <!-- Минутная стрелка -->
    <line
        x1="12"
        y1="12"
        x2="15"
        y2="14"
        :stroke="props.useGradients ? 'url(#pendingGradient)' : props.color"
        stroke-width="2"
        stroke-linecap="round"
    />

    <!-- Центральная точка -->
    <circle
        cx="12"
        cy="12"
        r="1"
        :fill="props.useGradients ? 'url(#pendingGradient)' : props.color"
    />
  </svg>
</template>

<script setup>
import { computed } from 'vue'
import { lightenColor, darkenColor } from '@components/FenixIconVue/utils/gradientUtils.js'

const props = defineProps({
  size: {
    type: [Number, String],
    default: 24
  },
  color: {
    type: String,
    default: 'currentColor'
  },
  useGradients: {
    type: Boolean,
    default: false
  }
})

const gradientStart = computed(() => lightenColor(props.color, 20))
const gradientEnd = computed(() => darkenColor(props.color, 20))
</script>

<script>
export default {
  name: 'FenixPending',
  inheritAttrs: false
}
</script>

<style scoped>
svg {
  display: inline-block;
  vertical-align: middle;
  fill: v-bind(color);
}
</style>
