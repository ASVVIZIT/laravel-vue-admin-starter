<!-- resources/js/components/FenixIconVue/icons/i18n/editing/FenixEdit.vue -->
<template>
  <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 24 24"
      :width="Number(props.size)"
      :height="Number(props.size)"
      aria-label="Edit"
      role="img"
  >
    <defs>
      <linearGradient v-if="props.useGradients" id="editGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" :stop-color="gradientStart"/>
        <stop offset="100%" :stop-color="gradientEnd"/>
      </linearGradient>
    </defs>

    <!-- Карандаш -->
    <path
        d="M3 17.25 V21 H6.75 L17.81 9.94 L14.06 6.19 L3 17.25 Z"
        fill="none"
        :stroke="props.useGradients ? 'url(#editGradient)' : props.color"
        stroke-width="1.5"
        stroke-linejoin="round"
    />

    <!-- Кончик карандаша -->
    <path
        d="M14.06 6.19 L15.5 4.75 C16.28 3.97 17.54 3.97 18.32 4.75 L19.25 5.68 C20.03 6.46 20.03 7.72 19.25 8.5 L17.81 9.94"
        fill="none"
        :stroke="props.useGradients ? 'url(#editGradient)' : props.color"
        stroke-width="1.5"
        stroke-linejoin="round"
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
export default { name: 'FenixEdit', inheritAttrs: false }
</script>

<style scoped>
svg { display: inline-block; vertical-align: middle; fill: v-bind(color); }
</style>
