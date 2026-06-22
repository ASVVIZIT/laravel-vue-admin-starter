<!-- resources/js/components/FenixIconVue/icons/i18n/actions/FenixRefresh.vue -->
<template>
  <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 24 24"
      :width="Number(props.size)"
      :height="Number(props.size)"
      aria-label="Refresh"
      role="img"
  >
    <defs>
      <linearGradient v-if="props.useGradients" id="refreshGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" :stop-color="gradientStart"/>
        <stop offset="100%" :stop-color="gradientEnd"/>
      </linearGradient>
    </defs>

    <!-- Круговая стрелка -->
    <path
        d="M4 12 C4 7.58 7.58 4 12 4 C14.76 4 17.2 5.35 18.7 7.5"
        fill="none"
        :stroke="props.useGradients ? 'url(#refreshGradient)' : props.color"
        stroke-width="2"
        stroke-linecap="round"
    />

    <!-- Наконечник стрелки (вверх) -->
    <path
        d="M16 7.5 L18.7 7.5 L18.7 4.8"
        fill="none"
        :stroke="props.useGradients ? 'url(#refreshGradient)' : props.color"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
    />

    <!-- Вторая часть круга -->
    <path
        d="M20 12 C20 16.42 16.42 20 12 20 C9.24 20 6.8 18.65 5.3 16.5"
        fill="none"
        :stroke="props.useGradients ? 'url(#refreshGradient)' : props.color"
        stroke-width="2"
        stroke-linecap="round"
    />

    <!-- Второй наконечник (вниз) -->
    <path
        d="M8 16.5 L5.3 16.5 L5.3 19.2"
        fill="none"
        :stroke="props.useGradients ? 'url(#refreshGradient)' : props.color"
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
  name: 'FenixRefresh',
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
