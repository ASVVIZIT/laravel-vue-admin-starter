<!-- resources/js/components/FenixIconVue/icons/FenixGoogleMaps.vue -->
<template>
  <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      viewBox="-51.2 -51.2 614.4 614.4"
      style="enable-background:new -51.2 -51.2 614.4 614.4;"
      :width="Number(props.size)"
      :height="Number(props.size)"
      aria-label="Google Maps"
      role="img"
  >
    <rect id="a" width="512" height="512" x="0" y="0" rx="15%" fill="#ffffff"/>
    <clipPath id="b">
      <use xlink:href="#a"></use>
    </clipPath>
    <g clip-path="url(#b)">
      <path fill="#35a85b" d="M0 512V0h512z"/>
      <path fill="#5881ca" d="M256 288L32 512h448z"/>
      <path fill="#c1c0be" d="M288 256L512 32v448z"/>
      <path stroke="#fadb2a" stroke-width="71" d="M0 512L512 0"/>
      <path fill="none" stroke="#f2f2f2" stroke-width="22" d="M175 173h50a50 54 0 1 1-15-41"/>
      <path fill="#de3738" d="M353 85a70 70 0 0 1 140 0c0 70-70 70-70 157 0-87-70-87-70-157"/>
      <circle cx="423" cy="89" r="25" fill="#7d2426"/>
    </g>
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
  name: 'FenixGoogleMaps',
  inheritAttrs: false
}
</script>
