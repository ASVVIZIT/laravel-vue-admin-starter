<!-- resources/js/components/FenixIconVue/icons/i18n/editing/FenixSave.vue -->
<template>
  <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 24 24"
      :width="Number(props.size)"
      :height="Number(props.size)"
      aria-label="Save"
      role="img"
  >
    <defs>
      <linearGradient v-if="props.useGradients" id="saveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" :stop-color="gradientStart"/>
        <stop offset="100%" :stop-color="gradientEnd"/>
      </linearGradient>
    </defs>

    <!-- Дискета -->
    <path
        d="M19 21 H5 C3.9 21 3 20.1 3 19 V5 C3 3.9 3.9 3 5 3 H16 L21 8 V19 C21 20.1 20.1 21 19 21 Z"
        fill="none"
        :stroke="props.useGradients ? 'url(#saveGradient)' : props.color"
        stroke-width="1.5"
        stroke-linejoin="round"
    />

    <!-- Металлическая часть -->
    <rect
        x="7"
        y="3"
        width="10"
        height="6"
        fill="none"
        :stroke="props.useGradients ? 'url(#saveGradient)' : props.color"
        stroke-width="1.5"
    />

    <!-- Этикетка -->
    <rect
        x="7"
        y="14"
        width="10"
        height="7"
        fill="none"
        :stroke="props.useGradients ? 'url(#saveGradient)' : props.color"
        stroke-width="1.5"
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
export default { name: 'FenixSave', inheritAttrs: false }
</script>

<style scoped>
svg { display: inline-block; vertical-align: middle; fill: v-bind(color); }
</style>
