<!-- resources/js/components/FenixIconVue/icons/FenixLinkedIn.vue -->
<template>
  <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      viewBox="-4.8 -4.8 57.6 57.6"
      style="enable-background:new -4.8 -4.8 57.6 57.6;"
      :width="Number(props.size)"
      :height="Number(props.size)"
      aria-label="LinkedIn"
      role="img"
  >
    <!--  БРЕНД-ЦВЕТА LINKEDIN (НЕ МЕНЯЮТСЯ) -->
    <circle cx="24" cy="24" r="20" fill="#0077B5"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M18.7747 14.2839C18.7747 15.529 17.8267 16.5366 16.3442 16.5366C14.9194 16.5366 13.9713 15.529 14.0007 14.2839C13.9713 12.9783 14.9193 12 16.3726 12C17.8267 12 18.7463 12.9783 18.7747 14.2839ZM14.1199 32.8191V18.3162H18.6271V32.8181H14.1199V32.8191Z" fill="#FFFFFF"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M22.2393 22.9446C22.2393 21.1357 22.1797 19.5935 22.1201 18.3182H26.0351L26.2432 20.305H26.3322C26.9254 19.3854 28.4079 17.9927 30.8101 17.9927C33.7752 17.9927 35.9995 19.9502 35.9995 24.219V32.821H31.4922V24.7838C31.4922 22.9144 30.8404 21.6399 29.2093 21.6399C27.9633 21.6399 27.2224 22.4999 26.9263 23.3297C26.8071 23.6268 26.7484 24.0412 26.7484 24.4574V32.821H22.2411V22.9446H22.2393Z" fill="#FFFFFF"/>
  </svg>
</template>

<script setup>
/**
 *  Бренд-логотип LinkedIn
 * Цвета НЕ меняются через props color/useGradients
 * для сохранения узнаваемости бренда
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
</script>

<script>
export default {
  name: 'FenixLinkedIn',
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
