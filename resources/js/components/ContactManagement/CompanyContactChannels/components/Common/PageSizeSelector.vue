<template>
  <div class="page-size-selector" :class="className">
    <el-select
        v-model="localSize"
        @change="handleChange"
        :size="selectSize"
        :class="selectClass"
    >
      <el-option
          v-for="option in options"
          :key="option.value"
          :label="option.label"
          :value="option.value"
      />
    </el-select>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import {
  generatePageSizeOptions,
  PAGE_SIZE_SELECTOR_UI,
  PAGE_SIZE_SELECTOR_PROPS,
  PAGE_SIZE_OPTIONS,
  PAGINATION_LABELS
} from '../../utils/paginationOptions.js';

const props = defineProps({
  modelValue: { type: PAGE_SIZE_SELECTOR_PROPS.MODEL_VALUE_TYPE, required: PAGE_SIZE_SELECTOR_PROPS.MODEL_VALUE_REQUIRED },
  totalItems: { type: Number, default: PAGE_SIZE_SELECTOR_PROPS.TOTAL_ITEMS_DEFAULT },
  baseSizes: { type: Array, default: PAGE_SIZE_SELECTOR_PROPS.BASE_SIZES },
  allLabel: { type: String, default: PAGE_SIZE_SELECTOR_PROPS.ALL_LABEL },
  showLabel: { type: Boolean, default: PAGE_SIZE_SELECTOR_PROPS.SHOW_LABEL },
  label: { type: String, default: PAGE_SIZE_SELECTOR_PROPS.LABEL },
  selectSize: { type: String, default: PAGE_SIZE_SELECTOR_PROPS.SELECT_SIZE },
  className: { type: String, default: PAGE_SIZE_SELECTOR_PROPS.CLASS_NAME },
  selectClass: { type: String, default: PAGE_SIZE_SELECTOR_PROPS.SELECT_CLASS }
});

const emit = defineEmits(['update:modelValue', 'change']);
const localSize = ref(props.modelValue);

// ← Храним предыдущее значение totalItems для сравнения
let previousTotalItems = ref(props.totalItems);

// ← Вычисляем опции
const options = computed(() => {
  console.log('[PageSizeSelector] options recalculated, totalItems:', props.totalItems);
  return generatePageSizeOptions(
      props.totalItems,
      props.baseSizes,
      props.allLabel,
      PAGINATION_LABELS.PAGE_SIZE_SUFFIX
  );
});

// ← Отслеживаем изменение totalItems
watch(() => props.totalItems, (newVal, oldVal) => {
  console.log('[PageSizeSelector] totalItems changed:', oldVal, '→', newVal);
  if (localSize.value === oldVal) {
    console.log('[PageSizeSelector] "Все" было выбрано, обновляем:', oldVal, '→', newVal);
    localSize.value = newVal;
  }

  previousTotalItems.value = newVal;
});

// ← Отслеживаем изменение modelValue извне
watch(() => props.modelValue, (newVal) => {
  console.log('[PageSizeSelector] modelValue changed:', newVal);
  localSize.value = newVal;
});

const handleChange = (value) => {
  console.log('[PageSizeSelector] handleChange:', value);
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

.page-size-selector .el-select {
  width: v-bind('PAGE_SIZE_SELECTOR_UI.SELECT_WIDTH');
}

:deep(.el-select) {
  --el-select-font-size: 12px;
}

:deep(.el-select__wrapper) {
  height: 24px;
  font-size: 12px;
  box-shadow: none;
}

:deep(.el-select__input) {
  font-size: 12px;
  height: 24px;
}

:deep(.el-select-dropdown__item) {
  font-size: 12px;
  padding: 4px 10px;
}

:deep(.el-select__caret) {
  font-size: 12px;
}
</style>
