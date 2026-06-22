<!-- resources/js/components/FenixIconVue/icons/i18n/extras/FenixHelp.vue -->
<template>
  <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 24 24"
      :width="Number(props.size)"
      :height="Number(props.size)"
      aria-label="Help"
      role="img"
  >
    <defs>
      <linearGradient v-if="props.useGradients" id="helpGradient" x1="0%" y1="0%" x2="100%" y2="100%">
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
        :stroke="props.useGradients ? 'url(#helpGradient)' : props.color"
        stroke-width="1.5"
    />

    <!-- Вопросительный знак (верхняя часть) -->
    <path
        d="M9 9 C9 7 10.5 6 12 6 C13.5 6 15 7 15 9 C15 11 12 11.5 12 14"
        fill="none"
        :stroke="props.useGradients ? 'url(#helpGradient)' : props.color"
        stroke-width="2"
        stroke-linecap="round"
    />

    <!-- Точка -->
    <circle
        cx="12"
        cy="17.5"
        r="1"
        :fill="props.useGradients ? 'url(#helpGradient)' : props.color"
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
export default { name: 'FenixHelp', inheritAttrs: false }
</script>

<style scoped>
svg { display: inline-block; vertical-align: middle; fill: v-bind(color); }
</style>
