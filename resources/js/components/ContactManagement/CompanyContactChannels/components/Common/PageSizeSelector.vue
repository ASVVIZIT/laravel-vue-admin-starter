<template>
  <div class="page-size-selector" :class="[props.className, { 'is-disabled': props.disabled }]">
    <!-- ✅ LABEL -->
    <span v-if="props.showLabel" class="page-size-label" :style="labelStyle">
      {{ props.label }}
    </span>

    <!-- ✅ SELECT С TOOLTIP -->
    <el-tooltip
        :content="tooltipContent"
        placement="top"
        :show-after="TIMINGS.TOOLTIP_DELAY"
        :hide-after="TIMINGS.TOOLTIP_HIDE_DELAY"
    >
      <el-select
          v-model="localSize"
          @change="handleChange"
          :size="props.selectSize"
          :class="props.selectClass"
          :disabled="props.disabled"
          class="compact-size-selector"
          :teleported="true"
      >
        <el-option
            v-for="(size, index) in calculatedSizes"
            :key="size"
            :label="getOptionLabel(size, index)"
            :value="size"
            :disabled="size > props.loadedCount"
        />
      </el-select>
    </el-tooltip>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';
import {
  PAGE_SIZE_SELECTOR_PROPS_CONFIG,
  PAGE_SIZE_SELECTOR_UI,
  PAGINATION_LABELS,
  PAGE_SIZE_OPTIONS,
  PAGINATION_UI,
  BREAKPOINTS,
  ANIMATIONS,
  TIMINGS,
  COLORS,
} from '../../config/appConfigIndex.js';

const props = defineProps({...PAGE_SIZE_SELECTOR_PROPS_CONFIG});

const emit = defineEmits(['update:modelValue', 'change']);

const localSize = ref(props.modelValue);
const suffix = PAGINATION_LABELS.PAGE_SIZE_SUFFIX;
const allLabel = props.allLabel || PAGINATION_LABELS.ALL_ITEMS;

// ✅ ТАЙМЕР ДЛЯ DEBOUNCE
let changeTimeout = null;

// ============================================================================
// COMPUTED — РАЗМЕРЫ СТРАНИЦ
// ============================================================================
const calculatedSizes = computed(() => {
  const baseSizes = props.availableSizes || PAGE_SIZE_OPTIONS.BASE_AVAILABLE;

  const filtered = baseSizes.filter(size => size <= props.loadedCount);

  if (props.loadedCount > 0 && !filtered.includes(props.loadedCount)) {
    filtered.push(props.loadedCount);
  }

  if (filtered.length === 0) {
    return baseSizes;
  }

  return filtered.sort((a, b) => a - b);
});

// ============================================================================
// COMPUTED — СТИЛИ LABEL
// ============================================================================
const labelStyle = computed(() => ({
  color: PAGE_SIZE_SELECTOR_UI.LABEL_COLOR,
  fontSize: PAGE_SIZE_SELECTOR_UI.LABEL_FONT_SIZE,
  marginRight: PAGE_SIZE_SELECTOR_UI.GAP,
}));

// ============================================================================
// COMPUTED — TOOLTIP CONTENT
// ============================================================================
const tooltipContent = computed(() => {
  return `Записей на страницу: ${localSize.value} из ${props.loadedCount}`;
});

// ============================================================================
// HELPER — LABEL ОПЦИИ
// ============================================================================
const getOptionLabel = (size, index) => {
  const isAllItems = size >= props.loadedCount && props.loadedCount > 0;
  if (isAllItems) {
    return `${allLabel} (${size})`;
  }
  return `${size} ${suffix}`;
};

// ============================================================================
// WATCH — MODEL VALUE
// ============================================================================
watch(() => props.modelValue, (newVal) => {
  localSize.value = newVal;
});

// ============================================================================
// WATCH — LOADED COUNT
// ============================================================================
watch(() => props.loadedCount, (newVal) => {
  if (localSize.value > newVal && newVal > 0) {
    localSize.value = newVal;
  }
});

// ============================================================================
// HANDLE CHANGE (С DEBOUNCE)
// ============================================================================
const handleChange = (value) => {
  // ✅ ОЧИСТКА ПРЕДЫДУЩЕГО ТАЙМЕРА
  if (changeTimeout) {
    clearTimeout(changeTimeout);
  }

  // ✅ DEBOUNCE 200ms
  changeTimeout = setTimeout(() => {
    emit('update:modelValue', value);
    emit('change', value);
  }, TIMINGS.DEBOUNCE_FILTER);
};

// ============================================================================
// CLEANUP — ОЧИСТКА ТАЙМЕРА
// ============================================================================
onUnmounted(() => {
  if (changeTimeout) {
    clearTimeout(changeTimeout);
  }
});
</script>

<style scoped>
/* ============================================================================
   CONTAINER
   ============================================================================ */
.page-size-selector {
  display: flex;
  align-items: center;
  gap: v-bind('PAGE_SIZE_SELECTOR_UI.GAP');
  /* ✅ TIMINGS — ПЛАВНЫЙ ПЕРЕХОД (150ms) */
  transition: all v-bind('TIMINGS.RECALCULATING_DURATION') v-bind('ANIMATIONS.EASING_EASE');
}

.page-size-selector.is-disabled {
  opacity: 0.5;
  pointer-events: none;
}

/* ============================================================================
   SELECT
   ============================================================================ */
.page-size-selector .el-select {
  width: v-bind('PAGE_SIZE_SELECTOR_UI.SELECT_WIDTH');
}

.page-size-label {
  white-space: nowrap;
  font-weight: 500;
  font-size: v-bind('PAGE_SIZE_SELECTOR_UI.LABEL_FONT_SIZE');
  color: v-bind('PAGE_SIZE_SELECTOR_UI.LABEL_COLOR');
}

/* ============================================================================
   COMPACT SELECT
   ============================================================================ */
.compact-size-selector :deep(.el-select) {
  --el-select-font-size: v-bind('PAGE_SIZE_SELECTOR_UI.LABEL_FONT_SIZE');
}

.compact-size-selector :deep(.el-select__wrapper) {
  height: v-bind('PAGINATION_UI.SELECT_HEIGHT');
  font-size: v-bind('PAGE_SIZE_SELECTOR_UI.LABEL_FONT_SIZE');
  box-shadow: none;
  padding: 0 4px;
  border-radius: v-bind('PAGINATION_UI.BORDER_RADIUS');
  /* ✅ TIMINGS — ПЛАВНЫЙ ПЕРЕХОД (100ms) */
  transition: all v-bind('TIMINGS.DELAY_FAST') v-bind('ANIMATIONS.EASING_EASE');
}

.compact-size-selector :deep(.el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px v-bind('COLORS.PRIMARY') inset;
}

.compact-size-selector :deep(.el-select__wrapper.is-focus) {
  box-shadow: 0 0 0 1px v-bind('COLORS.PRIMARY') inset;
}

.compact-size-selector :deep(.el-select__input) {
  font-size: v-bind('PAGE_SIZE_SELECTOR_UI.LABEL_FONT_SIZE');
  height: v-bind('PAGINATION_UI.SELECT_HEIGHT');
}

/* ============================================================================
   DROPDOWN ITEMS
   ============================================================================ */
.compact-size-selector :deep(.el-select-dropdown__item) {
  font-size: v-bind('PAGINATION_UI.FONT_SIZE');
  padding: v-bind('PAGINATION_UI.DROPDOWN_PADDING');
  min-height: v-bind('PAGINATION_UI.BUTTON_HEIGHT');
  /* ✅ TIMINGS — ПЛАВНЫЙ ПЕРЕХОД (100ms) */
  transition: background-color v-bind('TIMINGS.DELAY_FAST') v-bind('ANIMATIONS.EASING_EASE');
}

.compact-size-selector :deep(.el-select-dropdown__item:hover) {
  background-color: #f5f7fa;
}

.compact-size-selector :deep(.el-select-dropdown__item.selected) {
  color: v-bind('COLORS.PRIMARY');
  font-weight: 600;
  background-color: #f0f9eb;
}

/* ============================================================================
   CARET
   ============================================================================ */
.compact-size-selector :deep(.el-select__caret) {
  font-size: v-bind('PAGINATION_UI.FONT_SIZE');
  color: v-bind('COLORS.INFO');
  /* ✅ TIMINGS — ПЛАВНЫЙ ПЕРЕХОД (100ms) */
  transition: color v-bind('TIMINGS.DELAY_FAST') v-bind('ANIMATIONS.EASING_EASE');
}

.compact-size-selector :deep(.el-select__caret:hover) {
  color: v-bind('COLORS.PRIMARY');
}

.compact-size-selector :deep(.el-select-dropdown__item.is-disabled) {
  color: v-bind('COLORS.INFO');
  cursor: not-allowed;
  opacity: 0.6;
}

/* ============================================================================
   АДАПТИВ
   ============================================================================ */
@media (max-width: v-bind('BREAKPOINTS.XXXL')) {
  .page-size-selector {
    gap: v-bind('PAGINATION_UI.GAP');
  }

  .page-size-selector .el-select {
    width: 65px;
  }

  .page-size-label {
    font-size: 8px;
  }
}

@media (max-width: v-bind('BREAKPOINTS.XL')) {
  .page-size-selector {
    gap: 4px;
  }

  .page-size-selector .el-select {
    width: 60px;
  }

  .page-size-label {
    font-size: 7px;
  }

  .compact-size-selector :deep(.el-select__wrapper) {
    height: 24px;
  }

  .compact-size-selector :deep(.el-select__input) {
    font-size: 10px;
  }

  .compact-size-selector :deep(.el-select-dropdown__item) {
    font-size: 10px;
    min-height: 24px;
  }
}

@media (max-width: v-bind('BREAKPOINTS.XS')) {
  .page-size-selector {
    gap: 3px;
  }

  .page-size-selector .el-select {
    width: 50px;
  }

  .page-size-label {
    font-size: 6px;
  }

  .compact-size-selector :deep(.el-select__wrapper) {
    height: 20px;
    padding: 0 3px;
  }

  .compact-size-selector :deep(.el-select__input) {
    font-size: 9px;
  }

  .compact-size-selector :deep(.el-select-dropdown__item) {
    font-size: 9px;
    min-height: 20px;
    padding: 2px 6px;
  }

  .compact-size-selector :deep(.el-select__caret) {
    font-size: 8px;
  }
}

/* ============================================================================
   TOUCH DEVICES
   ============================================================================ */
@media (hover: none) and (pointer: coarse) {
  .page-size-selector .el-select {
    width: 80px;
  }

  .compact-size-selector :deep(.el-select__wrapper) {
    height: 36px;
  }

  .compact-size-selector :deep(.el-select__input) {
    font-size: 14px;
  }

  .compact-size-selector :deep(.el-select-dropdown__item) {
    font-size: 14px;
    min-height: 36px;
    padding: 8px 12px;
  }

  .page-size-label {
    font-size: 12px;
  }
}
</style>
