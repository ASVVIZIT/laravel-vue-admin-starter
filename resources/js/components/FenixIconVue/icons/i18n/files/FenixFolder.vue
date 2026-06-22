<!-- resources/js/components/FenixIconVue/icons/i18n/files/FenixFolder.vue -->
<template>
  <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 24 24"
      :width="Number(props.size)"
      :height="Number(props.size)"
      aria-label="Folder"
      role="img"
  >
    <defs>
      <linearGradient v-if="props.useGradients" id="folderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" :stop-color="gradientStart"/>
        <stop offset="100%" :stop-color="gradientEnd"/>
      </linearGradient>
    </defs>

    <!-- Папка -->
    <path
        d="M22 19 C22 20.1 21.1 21 20 21 H4 C2.9 21 2 20.1 2 19 V5 C2 3.9 2.9 3 4 3 H9 L11 6 H20 C21.1 6 22 6.9 22 8 V19 Z"
        fill="none"
        :stroke="props.useGradients ? 'url(#folderGradient)' : props.color"
        stroke-width="1.5"
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
  name: 'FenixFolder',
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
