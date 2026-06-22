<!-- resources/js/components/FenixIconVue/icons/i18n/analysis/FenixDiff.vue -->
<template>
  <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 24 24"
      :width="Number(props.size)"
      :height="Number(props.size)"
      aria-label="Diff"
      role="img"
  >
    <defs>
      <linearGradient v-if="props.useGradients" id="diffGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" :stop-color="gradientStart"/>
        <stop offset="100%" :stop-color="gradientEnd"/>
      </linearGradient>
    </defs>

    <!-- Левый документ -->
    <rect
        x="2"
        y="4"
        width="8"
        height="16"
        rx="1"
        fill="none"
        :stroke="props.useGradients ? 'url(#diffGradient)' : props.color"
        stroke-width="1.5"
    />

    <!-- Правый документ -->
    <rect
        x="14"
        y="4"
        width="8"
        height="16"
        rx="1"
        fill="none"
        :stroke="props.useGradients ? 'url(#diffGradient)' : props.color"
        stroke-width="1.5"
    />

    <!-- Линии различия (левый) -->
    <line x1="4" y1="8" x2="8" y2="8" :stroke="props.useGradients ? 'url(#diffGradient)' : props.color" stroke-width="1" stroke-linecap="round"/>
    <line x1="4" y1="12" x2="7" y2="12" :stroke="props.useGradients ? 'url(#diffGradient)' : props.color" stroke-width="1" stroke-linecap="round"/>

    <!-- Линии различия (правый — отличаются) -->
    <line x1="16" y1="8" x2="20" y2="8" :stroke="props.useGradients ? 'url(#diffGradient)' : props.color" stroke-width="1" stroke-linecap="round"/>
    <line x1="16" y1="12" x2="19" y2="12" :stroke="props.useGradients ? 'url(#diffGradient)' : props.color" stroke-width="1" stroke-linecap="round" stroke-dasharray="2,1"/>
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
export default { name: 'FenixDiff', inheritAttrs: false }
</script>

<style scoped>
svg { display: inline-block; vertical-align: middle; fill: v-bind(color); }
</style>
