<template>
  <div class="page-size-selector" :class="[props.className, { 'is-disabled': props.disabled }]">
        <span v-if="props.showLabel" class="page-size-label" :style="labelStyle">
            {{ props.label }}
        </span>
    <el-select
        v-model="localSize"
        @change="handleChange"
        :size="props.selectSize"
        :class="props.selectClass"
        :disabled="props.disabled"
        class="compact-size-selector"
    >
      <el-option
          v-for="(size, index) in calculatedSizes"
          :key="size"
          :label="getOptionLabel(size, index)"
          :value="size"
          :disabled="size > props.loadedCount"
      />
    </el-select>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import {
  PAGE_SIZE_SELECTOR_PROPS_CONFIG,
  PAGE_SIZE_SELECTOR_UI,
  PAGINATION_LABELS,
  PAGE_SIZE_OPTIONS,
  PAGINATION_UI,
} from '../../utils/appConfig.js';

const props = defineProps(PAGE_SIZE_SELECTOR_PROPS_CONFIG);

const emit = defineEmits(['update:modelValue', 'change']);

const localSize = ref(props.modelValue);
const suffix = PAGINATION_LABELS.PAGE_SIZE_SUFFIX;
const allLabel = props.allLabel || PAGINATION_LABELS.ALL_ITEMS;

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

const labelStyle = computed(() => ({
  color: PAGE_SIZE_SELECTOR_UI.LABEL_COLOR,
  fontSize: PAGE_SIZE_SELECTOR_UI.LABEL_FONT_SIZE,
  marginRight: PAGE_SIZE_SELECTOR_UI.GAP,
}));

const getOptionLabel = (size, index) => {
  const isAllItems = size >= props.loadedCount && props.loadedCount > 0;
  if (isAllItems) {
    return `${allLabel} (${size})`;
  }
  return `${size} ${suffix}`;
};

watch(() => props.modelValue, (newVal) => {
  localSize.value = newVal;
});

watch(() => props.loadedCount, (newVal) => {
  if (localSize.value > newVal && newVal > 0) {
    localSize.value = newVal;
  }
});

const handleChange = (value) => {
  emit('update:modelValue', value);
  emit('change', value);
};
</script>

<style scoped>
.page-size-selector {
  display: flex;
  align-items: center;
  gap: v-bind('PAGE_SIZE_SELECTOR_UI.GAP');
}

.page-size-selector.is-disabled {
  opacity: 0.5;
  pointer-events: none;
}

.page-size-selector .el-select {
  width: v-bind('PAGE_SIZE_SELECTOR_UI.SELECT_WIDTH');
}

.page-size-label {
  white-space: nowrap;
  font-weight: 500;
  font-size: v-bind('PAGE_SIZE_SELECTOR_UI.LABEL_FONT_SIZE');
}

.compact-size-selector :deep(.el-select) {
  --el-select-font-size: v-bind('PAGE_SIZE_SELECTOR_UI.LABEL_FONT_SIZE');
}

.compact-size-selector :deep(.el-select__wrapper) {
  height: v-bind('PAGINATION_UI.SELECT_HEIGHT');
  font-size: v-bind('PAGE_SIZE_SELECTOR_UI.LABEL_FONT_SIZE');
  box-shadow: none;
  padding: 0 4px;
}

.compact-size-selector :deep(.el-select__input) {
  font-size: v-bind('PAGE_SIZE_SELECTOR_UI.LABEL_FONT_SIZE');
  height: v-bind('PAGINATION_UI.SELECT_HEIGHT');
}

.compact-size-selector :deep(.el-select-dropdown__item) {
  font-size: v-bind('PAGINATION_UI.FONT_SIZE');
  padding: v-bind('PAGINATION_UI.DROPDOWN_PADDING');
  min-height: v-bind('PAGINATION_UI.BUTTON_HEIGHT');
}

.compact-size-selector :deep(.el-select__caret) {
  font-size: v-bind('PAGINATION_UI.FONT_SIZE');
}

.compact-size-selector :deep(.el-select-dropdown__item.is-disabled) {
  color: #c0c4cc;
  cursor: not-allowed;
}
</style>
