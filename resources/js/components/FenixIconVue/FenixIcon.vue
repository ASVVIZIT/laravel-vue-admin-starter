<template>
  <!-- Кастомная SVG иконка из реестра -->
  <component
      v-if="customIcon"
      :is="customIcon"
      :size="size"
      :width="width"
      :height="height"
      :color="color"
      :class="['fenix-icon', customClass]"
      v-bind="$attrs"
  />

  <!-- Fallback на Bootstrap Icons -->
  <i
      v-else
      :class="bootstrapClasses"
      :style="iconStyle"
      aria-hidden="true"
  ></i>
</template>

<script setup>
import { computed } from 'vue';
import { useFenixIconsStore } from './store/fenixIconsStore.js';

const props = defineProps({
  // Имя иконки (без префикса)
  name: {
    type: String,
    required: true
  },

  // Размер иконки (для SVG и Bootstrap)
  size: {
    type: [Number, String],
    default: 24
  },

  // Ширина (только для SVG с разными пропорциями)
  width: {
    type: [Number, String],
    default: null
  },

  // Высота (только для SVG с разными пропорциями)
  height: {
    type: [Number, String],
    default: null
  },

  // Цвет иконки
  color: {
    type: String,
    default: 'currentColor'
  },

  // Дополнительный CSS класс
  customClass: {
    type: String,
    default: ''
  },

  // Принудительно использовать Bootstrap Icons (игнорировать кастомные)
  forceBootstrap: {
    type: Boolean,
    default: false
  }
});

const iconsStore = useFenixIconsStore();

// Проверяем есть ли кастомная иконка в реестре
const customIcon = computed(() => {
  if (props.forceBootstrap) return null;

  // Формируем имя с префиксом Fenix
  const fenixName = props.name.startsWith('Fenix')
      ? props.name
      : `Fenix${props.name.charAt(0).toUpperCase() + props.name.slice(1)}`;

  return iconsStore.getIconByName(fenixName);
});

// Классы для Bootstrap Icons
const bootstrapClasses = computed(() => {
  return [
    'fenix-icon',
    'bi',
    `bi-${props.name}`,
    props.customClass
  ].filter(Boolean);
});

// Стили для иконки
const iconStyle = computed(() => {
  const sizeValue = typeof props.size === 'number' ? `${props.size}px` : props.size;

  return {
    fontSize: sizeValue,
    color: props.color,
    width: sizeValue,
    height: sizeValue
  };
});
</script>

<style lang="scss">
.fenix-icon {
  display: inline-block;
  vertical-align: middle;
  line-height: 1;

  // Для SVG иконок
  svg {
    display: inline-block;
    vertical-align: middle;
  }
}
</style>
