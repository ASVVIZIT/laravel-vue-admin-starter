<!-- resources/js/components/DynamicTable/TemplateBuilder/cells/DateCell.vue -->
<template>
  <div @click="handleClick">
    <span v-if="!isEditing">
      {{ displayValue }}
    </span>
    <el-date-picker
        v-else
        v-model="editValue"
        @change="handleUpdateValue"
        @blur="handleUpdateValue"
        type="date"
        :format="displayFormat"
        :value-format="valueFormat"
        ref="editInput"
        size="small"
        placeholder="Выберите дату"
        style="width: 100%; height: 100%;"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { formatDateDisplay } from '@/components/DynamicTable/utils/dateUtils';

const props = defineProps({
  value: {
    type: [String, Date],
    default: null
  },
  column: {
    type: Object,
    required: true
  },
  isEditing: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([
  'update-value'
]);

const editValue = ref(null);
const editInput = ref(null);

const displayFormat = computed(() => {
  return props.column.dateFormat || 'DD.MM.YYYY';
});

const valueFormat = computed(() => {
  return 'YYYY-MM-DD';
});

const displayValue = computed(() => {
  if (!props.value) return '';
  try {
    return formatDateDisplay(props.value, displayFormat.value);
  } catch (e) {
    console.error("Ошибка форматирования даты:", e);
    return String(props.value);
  }
});

const handleClick = () => {
  if (!props.isEditing) {
    emit('start-edit');
  }
};

const handleUpdateValue = () => {
  emit('update-value', editValue.value);
};

// === ИСПРАВЛЕНИЕ: Улучшенная логика фокусировки ===
const focusInput = async () => {
  console.log("[DateCell.focusInput] Starting focus logic");
  if (!props.isEditing) {
    console.log("[DateCell.focusInput] Not in editing mode, exiting");
    return;
  }

  await nextTick();
  console.log("[DateCell.focusInput] nextTick completed");

  if (!editInput.value) {
    console.warn("[DateCell.focusInput] editInput ref is not set");
    return;
  }

  try {
    console.log("[DateCell.focusInput] editInput.value:", editInput.value);
    // === КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: Проверяем $el и ищем input внутри ===
    let inputElement = null;

    // Проверяем, есть ли у editInput.value.$el HTMLElement
    if (editInput.value.$el && editInput.value.$el instanceof HTMLElement) {
      console.log("[DateCell.focusInput] editInput.value.$el is HTMLElement");
      // Ищем input внутри $el компонента el-date-picker
      inputElement = editInput.value.$el.querySelector('.el-input__inner') || editInput.value.$el.querySelector('input');
    } else {
      // Если $el не HTMLElement, пытаемся получить input напрямую
      console.log("[DateCell.focusInput] editInput.value.$el is not HTMLElement, trying direct access");
      // Проверяем, является ли editInput.value самим input элементом
      if (editInput.value instanceof HTMLInputElement) {
        inputElement = editInput.value;
      }
      // Или пытаемся получить input из других свойств
      else if (editInput.value.input) {
        inputElement = editInput.value.input;
      }
    }

    console.log("[DateCell.focusInput] Found input element:", inputElement);

    if (inputElement && typeof inputElement.focus === 'function') {
      console.log("[DateCell.focusInput] Calling focus on:", inputElement);
      inputElement.focus();
    } else {
      console.warn("[DateCell.focusInput] Could not find focusable input or focus() is not a function.", inputElement);
    }
  } catch (error) {
    console.error("[DateCell.focusInput] Error during focus:", error);
  }
};
// === КОНЕЦ ИСПРАВЛЕНИЯ ===

watch(() => props.isEditing, (newVal, oldVal) => {
  console.log(`[DateCell.watch.isEditing] Changed from ${oldVal} to ${newVal}`);
  if (newVal === true) {
    console.log("[DateCell.watch.isEditing] Editing started, setting value and focusing");
    if (props.value && typeof props.value === 'string') {
      editValue.value = props.value;
    } else if (props.value instanceof Date) {
      editValue.value = props.value.toISOString().split('T')[0];
    } else {
      editValue.value = null;
    }
    console.log("[DateCell.watch.isEditing] editValue set to:", editValue.value);
    focusInput();
  }
}, { immediate: true });

onMounted(() => {
  console.log("[DateCell.onMounted] Component mounted");
});
</script>

<style lang="scss" scoped>
.date-cell {
  width: 100%;
  height: 100%;
  position: relative;
  cursor: pointer;
  box-sizing: border-box;
  padding: 0;
  border: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  .date-display {
    display: block;
    width: 100%;
    height: 100%;
    padding: 4px 8px;
    box-sizing: border-box;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
    vertical-align: middle;
  }

  .date-editing {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
    padding: 0;
    box-sizing: border-box;
    border: 1px solid #409eff;
    border-radius: 0;
    background-color: #fff;
    overflow: hidden;

    .cell-edit-input {
      width: 100% !important;
      height: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      box-sizing: border-box !important;
      border: none !important;
      outline: none !important;
      font-family: inherit !important;
      font-size: inherit !important;
      background-color: transparent !important;
      color: inherit !important;
      border-radius: 0 !important;

      :deep(.el-date-editor) {
        width: 100% !important;
        height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        box-sizing: border-box !important;
        border: none !important;
        outline: none !important;
        background-color: transparent !important;
        box-shadow: none !important;
        border-radius: 0 !important;

        .el-input {
          width: 100% !important;
          height: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          box-sizing: border-box !important;
          border: none !important;
          outline: none !important;
          background-color: transparent !important;
          box-shadow: none !important;
          border-radius: 0 !important;

          .el-input__wrapper {
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
            border: none !important;
            outline: none !important;
            background-color: transparent !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }

          .el-input__inner {
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 4px 8px !important;
            box-sizing: border-box !important;
            border: none !important;
            outline: none !important;
            font-family: inherit !important;
            font-size: inherit !important;
            background-color: transparent !important;
            color: inherit !important;
            border-radius: 0 !important;
            line-height: 24px;
          }
        }
      }
    }
  }
}
</style>
