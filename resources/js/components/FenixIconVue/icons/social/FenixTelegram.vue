<!-- resources/js/components/FenixIconVue/icons/FenixTelegram.vue -->
<template>
  <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      viewBox="0 0 240 240"
      style="enable-background:new 0 0 240 240;"
      :width="Number(props.size)"
      :height="Number(props.size)"
      aria-label="Telegram"
      role="img"
  >
    <defs>
      <!--  ОРИГИНАЛЬНЫЙ ГРАДИЕНТ TELEGRAM (когда useGradients = false) -->
      <linearGradient v-if="!props.useGradients" id="telegramGradient" gradientUnits="userSpaceOnUse" x1="120" y1="0" x2="120" y2="240">
        <stop offset="0" stop-color="#37aee2"/>
        <stop offset="1" stop-color="#1e96c8"/>
      </linearGradient>

      <!--  ПОЛЬЗОВАТЕЛЬСКИЙ ГРАДИЕНТ (когда useGradients = true) -->
      <linearGradient v-if="props.useGradients" id="telegramGradientCustom" gradientUnits="userSpaceOnUse" x1="120" y1="0" x2="120" y2="240">
        <stop offset="0" :stop-color="gradientStart"/>
        <stop offset="1" :stop-color="gradientEnd"/>
      </linearGradient>
    </defs>

    <!--  Фон: оригинальный ИЛИ пользовательский градиент -->
    <circle cx="120" cy="120" r="120" :fill="props.useGradients ? 'url(#telegramGradientCustom)' : 'url(#telegramGradient)'"/>

    <!--  Самолётик (ВСЕГДА белый — для узнаваемости бренда) -->
    <path d="M55 117.5c-7.9 3.2-7.8 7.6-1.4 9.5l29.7 9.3L152 93c3.2-2 6.2-.9 3.8 1.3L100 144.4l48.4 35.7c5.5 3 9.5 1.5 10.9-5.1L179 82.2c2-8.1-3.1-11.7-8.4-9.3L55 117.5z" fill="#ffffff"/>
    <path d="M98 175c-3.9 0-3.2-1.5-4.6-5.2L82 132.2 152.8 88l8.3 2.2-6.9 18.8L98 175z" fill="#c8daea"/>
    <path d="M98 175c3 0 4.3-1.4 6-3 2.6-2.5 36-35 36-35l-20.5-5-19 12-2.5 30v1z" fill="#a9c9dd"/>
  </svg>
</template>

<script setup>
import { computed } from 'vue'
import { lightenColor, darkenColor } from '@components/FenixIconVue/utils/gradientUtils.js'

/**
 *  Бренд-логотип Telegram
 * - useGradients = false → оригинальный синий градиент Telegram
 * - useGradients = true → пользовательский градиент из color
 * - Самолётик ВСЕГДА белый (для узнаваемости)
 */
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
  name: 'FenixTelegram',
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
