<!-- resources/js/components/FenixIconVue/icons/i18n/actions/FenixCopy.vue -->
<template>
  <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 24 24"
      :width="Number(props.size)"
      :height="Number(props.size)"
      aria-label="Copy"
      role="img"
  >
    <defs>
      <linearGradient v-if="props.useGradients" id="copyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" :stop-color="gradientStart"/>
        <stop offset="100%" :stop-color="gradientEnd"/>
      </linearGradient>
    </defs>

    <!-- Задний документ -->
    <rect
        x="8"
        y="2"
        width="12"
        height="16"
        rx="1"
        fill="none"
        :stroke="props.useGradients ? 'url(#copyGradient)' : props.color"
        stroke-width="1.5"
    />

    <!-- Передний документ -->
    <rect
        x="4"
        y="6"
        width="12"
        height="16"
        rx="1"
        fill="none"
        :stroke="props.useGradients ? 'url(#copyGradient)' : props.color"
        stroke-width="1.5"
    />

    <!-- Линии текста на переднем документе -->
    <line x1="7" y1="10" x2="13" y2="10" :stroke="props.useGradients ? 'url(#copyGradient)' : props.color" stroke-width="1" stroke-linecap="round"/>
    <line x1="7" y1="13" x2="13" y2="13" :stroke="props.useGradients ? 'url(#copyGradient)' : props.color" stroke-width="1" stroke-linecap="round"/>
    <line x1="7" y1="16" x2="11" y2="16" :stroke="props.useGradients ? 'url(#copyGradient)' : props.color" stroke-width="1" stroke-linecap="round"/>
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
  name: 'FenixCopy',
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
