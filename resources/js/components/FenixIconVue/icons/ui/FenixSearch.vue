<!-- resources/js/components/FenixIconVue/icons/FenixSearch.vue -->
<template>
  <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 24 24"
      :width="props.size"
      :height="props.size"
  >
    <defs>
      <linearGradient v-if="props.useGradients" id="searchGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#4facfe"/>
        <stop offset="100%" stop-color="#00f2fe"/>
      </linearGradient>
    </defs>
    <circle cx="10.5" cy="10.5" r="7" fill="none" :stroke="strokeColor" stroke-width="2.5"/>
    <line x1="15.5" y1="15.5" x2="21" y2="21" :stroke="strokeColor" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="8" cy="8" r="1.5" :fill="fillColor" opacity="0.6"/>
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: { type: [Number, String], default: 24 },
  color: { type: String, default: 'currentColor' },
  useGradients: { type: Boolean, default: false }
})

const strokeColor = computed(() => props.useGradients ? 'url(#searchGradient)' : props.color)
const fillColor = computed(() => props.useGradients ? 'url(#searchGradient)' : props.color)
</script>

<script>
export default { name: 'FenixSearch', inheritAttrs: false }
</script>

<style scoped>
svg {
  display: inline-block;
  vertical-align: middle;
  fill: v-bind(color);
}
</style>
