<!-- resources/js/components/FenixIconVue/icons/i18n/editing/FenixDelete.vue -->
<template>
  <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 24 24"
      :width="Number(props.size)"
      :height="Number(props.size)"
      aria-label="Delete"
      role="img"
  >
    <defs>
      <linearGradient v-if="props.useGradients" id="deleteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" :stop-color="gradientStart"/>
        <stop offset="100%" :stop-color="gradientEnd"/>
      </linearGradient>
    </defs>

    <!-- Крышка корзины -->
    <line
        x1="3"
        y1="6"
        x2="21"
        y2="6"
        :stroke="props.useGradients ? 'url(#deleteGradient)' : props.color"
        stroke-width="1.5"
        stroke-linecap="round"
    />

    <!-- Корзина -->
    <path
        d="M19 6 V20 C19 21.1 18.1 22 17 22 H7 C5.9 22 5 21.1 5 20 V6"
        fill="none"
        :stroke="props.useGradients ? 'url(#deleteGradient)' : props.color"
        stroke-width="1.5"
        stroke-linejoin="round"
    />

    <!-- Ручка -->
    <path
        d="M8 6 V4 C8 2.9 8.9 2 10 2 H14 C15.1 2 16 2.9 16 4 V6"
        fill="none"
        :stroke="props.useGradients ? 'url(#deleteGradient)' : props.color"
        stroke-width="1.5"
        stroke-linejoin="round"
    />

    <!-- Линии внутри корзины -->
    <line x1="10" y1="11" x2="10" y2="17" :stroke="props.useGradients ? 'url(#deleteGradient)' : props.color" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="14" y1="11" x2="14" y2="17" :stroke="props.useGradients ? 'url(#deleteGradient)' : props.color" stroke-width="1.5" stroke-linecap="round"/>
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
export default { name: 'FenixDelete', inheritAttrs: false }
</script>

<style scoped>
svg { display: inline-block; vertical-align: middle; fill: v-bind(color); }
</style>
