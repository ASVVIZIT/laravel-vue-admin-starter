<!-- resources/js/components/FenixIconVue/icons/i18n/core/FenixTranslate.vue -->
<template>
  <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 24 24"
      :width="Number(props.size)"
      :height="Number(props.size)"
      aria-label="Translate"
      role="img"
  >
    <defs>
      <linearGradient v-if="props.useGradients" id="translateGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" :stop-color="gradientStart"/>
        <stop offset="100%" :stop-color="gradientEnd"/>
      </linearGradient>
    </defs>

    <!-- Глобус -->
    <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        :stroke="props.useGradients ? 'url(#translateGradient)' : props.color"
        stroke-width="1.5"
    />

    <!-- Меридианы глобуса -->
    <ellipse
        cx="12"
        cy="12"
        rx="4"
        ry="10"
        fill="none"
        :stroke="props.useGradients ? 'url(#translateGradient)' : props.color"
        stroke-width="1"
    />
    <line
        x1="2"
        y1="12"
        x2="22"
        y2="12"
        :stroke="props.useGradients ? 'url(#translateGradient)' : props.color"
        stroke-width="1"
    />

    <!-- Стрелки обмена (справа) -->
    <path
        d="M16 8 L19 8 L18 7 M19 8 L18 9"
        fill="none"
        :stroke="props.useGradients ? 'url(#translateGradient)' : props.color"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
    />

    <!-- Стрелки обмена (слева) -->
    <path
        d="M8 16 L5 16 L6 15 M5 16 L6 17"
        fill="none"
        :stroke="props.useGradients ? 'url(#translateGradient)' : props.color"
        stroke-width="1.5"
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
  name: 'FenixTranslate',
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
