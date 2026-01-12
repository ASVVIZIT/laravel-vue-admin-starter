<template>
  <component
      :is="icon"
      :size="iconSize"
      class="icon-wrapper"
      v-bind="$attrs"
  />
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  icon: {
    type: Object,
    required: true
  },
  size: {
    type: String,
    default: 'default',
    validator: value => ['mini', 'small', 'default', 'large'].includes(value)
  }
});

// Маппинг размеров иконок
const sizeMap = {
  mini: 12,
  small: 16,
  default: 20,
  large: 24
};

// Вычисляем числовое значение размера
const iconSize = computed(() => {
  return sizeMap[props.size] || sizeMap.default;
});
</script>

<style scoped>
.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
}
</style>
