<!-- resources/js/components/FenixIconVue/icons/i18n/actions/FenixExport.vue -->
<template>
  <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 24 24"
      :width="Number(props.size)"
      :height="Number(props.size)"
      aria-label="Export"
      role="img"
  >
    <defs>
      <linearGradient v-if="props.useGradients" id="exportGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" :stop-color="gradientStart"/>
        <stop offset="100%" :stop-color="gradientEnd"/>
      </linearGradient>
    </defs>

    <!-- Коробка (контейнер) -->
    <path
        d="M4 8 L4 20 L20 20 L20 8"
        fill="none"
        :stroke="props.useGradients ? 'url(#exportGradient)' : props.color"
        stroke-width="1.5"
        stroke-linejoin="round"
    />

    <!-- Стрелка вверх (из коробки) -->
    <path
        d="M12 14 L12 4"
        fill="none"
        :stroke="props.useGradients ? 'url(#exportGradient)' : props.color"
        stroke-width="2"
        stroke-linecap="round"
    />

    <!-- Наконечник стрелки -->
    <path
        d="M9 7 L12 4 L15 7"
        fill="none"
        :stroke="props.useGradients ? 'url(#exportGradient)' : props.color"
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
  name: 'FenixExport',
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
