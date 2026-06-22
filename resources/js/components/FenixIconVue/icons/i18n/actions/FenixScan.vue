<!-- resources/js/components/FenixIconVue/icons/i18n/actions/FenixScan.vue -->
<template>
  <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 24 24"
      :width="Number(props.size)"
      :height="Number(props.size)"
      aria-label="Scan"
      role="img"
  >
    <defs>
      <linearGradient v-if="props.useGradients" id="scanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" :stop-color="gradientStart"/>
        <stop offset="100%" :stop-color="gradientEnd"/>
      </linearGradient>
    </defs>

    <!-- Лупа (круг) -->
    <circle
        cx="10"
        cy="10"
        r="6"
        fill="none"
        :stroke="props.useGradients ? 'url(#scanGradient)' : props.color"
        stroke-width="1.5"
    />

    <!-- Ручка лупы -->
    <line
        x1="14.5"
        y1="14.5"
        x2="20"
        y2="20"
        :stroke="props.useGradients ? 'url(#scanGradient)' : props.color"
        stroke-width="2"
        stroke-linecap="round"
    />

    <!-- Луч сканирования (горизонтальная линия в лупе) -->
    <line
        x1="6"
        y1="10"
        x2="14"
        y2="10"
        :stroke="props.useGradients ? 'url(#scanGradient)' : props.color"
        stroke-width="1"
        stroke-linecap="round"
        opacity="0.6"
    />

    <!-- Точки сканирования -->
    <circle cx="8" cy="8" r="0.5" :fill="props.useGradients ? 'url(#scanGradient)' : props.color"/>
    <circle cx="12" cy="8" r="0.5" :fill="props.useGradients ? 'url(#scanGradient)' : props.color"/>
    <circle cx="8" cy="12" r="0.5" :fill="props.useGradients ? 'url(#scanGradient)' : props.color"/>
    <circle cx="12" cy="12" r="0.5" :fill="props.useGradients ? 'url(#scanGradient)' : props.color"/>
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
  name: 'FenixScan',
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
