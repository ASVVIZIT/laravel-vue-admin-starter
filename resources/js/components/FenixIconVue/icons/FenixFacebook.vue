<!-- resources/js/components/FenixIconVue/icons/FenixFacebook.vue -->
<template>
  <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      viewBox="0 0 48 48"
      style="enable-background:new 0 0 48 48;"
      :width="props.size"
      :height="props.size"
  >
    <path d="M24 44C12.954 44 4 35.046 4 24C4 12.954 12.954 4 24 4C35.046 4 44 12.954 44 24C44 35.046 35.046 44 24 44Z" fill="#4460A0"/>
    <path d="M26.5 32V23.5H29.5L30 20H26.5V18C26.5 17 27 16.5 28.5 16.5H31V13.5C30.5 13.5 29 13.5 27.5 13.5C24.5 13.5 22.5 15.5 22.5 19V20H20V23.5H22.5V32H26.5Z" fill="#FFFFFF"/>
  </svg>
</template>

<script setup>
const props = defineProps({
  size: {
    type: [Number, String],
    default: 24
  },
  color: {
    type: String,
    default: 'currentColor'
  }
})
</script>

<script>
export default {
  name: 'FenixFacebook',
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
