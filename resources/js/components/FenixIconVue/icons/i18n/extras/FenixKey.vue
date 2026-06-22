<!-- resources/js/components/FenixIconVue/icons/i18n/extras/FenixKey.vue -->
<template>
  <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 24 24"
      :width="Number(props.size)"
      :height="Number(props.size)"
      aria-label="Key"
      role="img"
  >
    <defs>
      <linearGradient v-if="props.useGradients" id="keyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" :stop-color="gradientStart"/>
        <stop offset="100%" :stop-color="gradientEnd"/>
      </linearGradient>
    </defs>

    <!-- Кольцо ключа -->
    <circle
        cx="8"
        cy="15"
        r="4"
        fill="none"
        :stroke="props.useGradients ? 'url(#keyGradient)' : props.color"
        stroke-width="1.5"
    />

    <!-- Стержень ключа -->
    <path
        d="M11 12 L20 3"
        fill="none"
        :stroke="props.useGradients ? 'url(#keyGradient)' : props.color"
        stroke-width="1.5"
        stroke-linecap="round"
    />

    <!-- Зубцы ключа -->
    <path
        d="M17 6 L19 8 M15 8 L17 10"
        fill="none"
        :stroke="props.useGradients ? 'url(#keyGradient)' : props.color"
        stroke-width="1.5"
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
export default { name: 'FenixKey', inheritAttrs: false }
</script>

<style scoped>
svg { display: inline-block; vertical-align: middle; fill: v-bind(color); }
</style>
