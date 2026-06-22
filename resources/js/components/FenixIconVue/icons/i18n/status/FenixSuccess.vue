<!-- resources/js/components/FenixIconVue/icons/i18n/status/FenixSuccess.vue -->
<template>
  <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 24 24"
      :width="Number(props.size)"
      :height="Number(props.size)"
      aria-label="Success"
      role="img"
  >
    <defs>
      <linearGradient v-if="props.useGradients" id="successGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" :stop-color="gradientStart"/>
        <stop offset="100%" :stop-color="gradientEnd"/>
      </linearGradient>
    </defs>

    <!-- Круг (фон) -->
    <circle
        cx="12"
        cy="12"
        r="10"
        :fill="props.useGradients ? 'url(#successGradient)' : props.color"
        opacity="0.15"
    />

    <!-- Круг (контур) -->
    <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        :stroke="props.useGradients ? 'url(#successGradient)' : props.color"
        stroke-width="1.5"
    />

    <!-- Галочка -->
    <path
        d="M7 12 L10.5 15.5 L17 9"
        fill="none"
        :stroke="props.useGradients ? 'url(#successGradient)' : props.color"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
    />
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
  name: 'FenixSuccess',
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
