<!-- resources/js/components/FenixIconVue/icons/i18n/editing/FenixAdd.vue -->
<template>
  <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 24 24"
      :width="Number(props.size)"
      :height="Number(props.size)"
      aria-label="Add"
      role="img"
  >
    <defs>
      <linearGradient v-if="props.useGradients" id="addGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" :stop-color="gradientStart"/>
        <stop offset="100%" :stop-color="gradientEnd"/>
      </linearGradient>
    </defs>

    <!-- Круг -->
    <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        :stroke="props.useGradients ? 'url(#addGradient)' : props.color"
        stroke-width="1.5"
    />

    <!-- Плюс (горизонтальная линия) -->
    <line
        x1="8"
        y1="12"
        x2="16"
        y2="12"
        :stroke="props.useGradients ? 'url(#addGradient)' : props.color"
        stroke-width="2"
        stroke-linecap="round"
    />

    <!-- Плюс (вертикальная линия) -->
    <line
        x1="12"
        y1="8"
        x2="12"
        y2="16"
        :stroke="props.useGradients ? 'url(#addGradient)' : props.color"
        stroke-width="2"
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
export default { name: 'FenixAdd', inheritAttrs: false }
</script>

<style scoped>
svg { display: inline-block; vertical-align: middle; fill: v-bind(color); }
</style>
