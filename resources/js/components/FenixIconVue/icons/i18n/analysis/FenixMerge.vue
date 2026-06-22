<!-- resources/js/components/FenixIconVue/icons/i18n/analysis/FenixMerge.vue -->
<template>
  <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 24 24"
      :width="Number(props.size)"
      :height="Number(props.size)"
      aria-label="Merge"
      role="img"
  >
    <defs>
      <linearGradient v-if="props.useGradients" id="mergeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" :stop-color="gradientStart"/>
        <stop offset="100%" :stop-color="gradientEnd"/>
      </linearGradient>
    </defs>

    <!-- Левая линия (сверху) -->
    <path
        d="M4 6 L10 12"
        fill="none"
        :stroke="props.useGradients ? 'url(#mergeGradient)' : props.color"
        stroke-width="2"
        stroke-linecap="round"
    />

    <!-- Правая линия (сверху) -->
    <path
        d="M20 6 L14 12"
        fill="none"
        :stroke="props.useGradients ? 'url(#mergeGradient)' : props.color"
        stroke-width="2"
        stroke-linecap="round"
    />

    <!-- Центральная линия (снизу) -->
    <path
        d="M12 12 L12 20"
        fill="none"
        :stroke="props.useGradients ? 'url(#mergeGradient)' : props.color"
        stroke-width="2"
        stroke-linecap="round"
    />

    <!-- Точка слияния -->
    <circle
        cx="12"
        cy="12"
        r="2"
        :fill="props.useGradients ? 'url(#mergeGradient)' : props.color"
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
export default { name: 'FenixMerge', inheritAttrs: false }
</script>

<style scoped>
svg { display: inline-block; vertical-align: middle; fill: v-bind(color); }
</style>
