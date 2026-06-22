<!-- resources/js/components/FenixIconVue/icons/i18n/extras/FenixJson.vue -->
<template>
  <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 24 24"
      :width="Number(props.size)"
      :height="Number(props.size)"
      aria-label="JSON File"
      role="img"
  >
    <defs>
      <linearGradient v-if="props.useGradients" id="jsonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" :stop-color="gradientStart"/>
        <stop offset="100%" :stop-color="gradientEnd"/>
      </linearGradient>
    </defs>

    <!-- Контур файла с загнутым уголком -->
    <path
        d="M14 2 H6 C4.9 2 4 2.9 4 4 V20 C4 21.1 4.9 22 6 22 H18 C19.1 22 20 21.1 20 20 V8 L14 2 Z"
        fill="none"
        :stroke="props.useGradients ? 'url(#jsonGradient)' : props.color"
        stroke-width="1.5"
        stroke-linejoin="round"
    />

    <!-- Загнутый уголок -->
    <path
        d="M14 2 V8 H20"
        fill="none"
        :stroke="props.useGradients ? 'url(#jsonGradient)' : props.color"
        stroke-width="1.5"
        stroke-linejoin="round"
    />

    <!-- Текст { } -->
    <text
        x="12"
        y="17"
        font-family="monospace"
        font-size="7"
        font-weight="bold"
        text-anchor="middle"
        :fill="props.useGradients ? 'url(#jsonGradient)' : props.color"
    >{ }</text>
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
export default { name: 'FenixJson', inheritAttrs: false }
</script>

<style scoped>
svg { display: inline-block; vertical-align: middle; fill: v-bind(color); }
</style>
