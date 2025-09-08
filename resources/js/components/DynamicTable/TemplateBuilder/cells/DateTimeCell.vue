<!-- resources/js/components/DynamicTable/TemplateBuilder/cells/DateTimeCell.vue -->
<template>
  <div @click="handleClick" class="datetime-cell">
    <span v-if="!isEditing" class="datetime-display">
      {{ displayValue }}
    </span>
    <div v-else class="datetime-editing">
      <el-date-picker
          ref="editInput"
          v-model="editValue"
          @change="handleUpdateValue"
          @blur="handleUpdateValue"
          type="datetime"
          :format="displayFormat"
          :value-format="valueFormat"
          size="small"
          placeholder="Выберите дату и время"
          class="cell-edit-input cell-edit-input--datetime"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { formatDateDisplay } from '@/components/DynamicTable/utils/dateUtils';

const props = defineProps({
  value: { type: [String, Date], default: null },
  column: { type: Object, required: true },
  isEditing: { type: Boolean, default: false }
});

const emit = defineEmits(['update-value', 'start-edit']);

const editValue = ref(null);
const editInput = ref(null);

const displayFormat = computed(() => props.column.dateFormat || 'DD.MM.YYYY HH:mm');
const valueFormat = computed(() => 'YYYY-MM-DD HH:mm');
const displayValue = computed(() => {
  if (!props.value) return '';
  try {
    return formatDateDisplay(props.value, displayFormat.value);
  } catch (e) {
    console.error("Ошибка форматирования даты/времени:", e);
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

const focusInput = async () => {
  if (!props.isEditing) return;
  await nextTick();
  if (!editInput.value || !editInput.value.$el) return;

  try {
    let inputElement = null;
    const rootEl = editInput.value.$el;

    // Проверка 1: rootEl это HTMLElement
    if (rootEl instanceof HTMLElement) {
      inputElement = rootEl.querySelector('.el-input__inner') || rootEl.querySelector('input');
    }
    // Проверка 2: rootEl это текстовый узел (#text), ищем родительский HTMLElement
    else if (rootEl.nodeType === Node.TEXT_NODE) {
      const parentEl = rootEl.parentElement;
      if (parentEl && parentEl instanceof HTMLElement) {
        inputElement = parentEl.querySelector('.el-input__inner') || parentEl.querySelector('input');
      }
    }

    if (inputElement && typeof inputElement.focus === 'function') {
      inputElement.focus();
    } else {
    }
  } catch (error) {
    console.error("[DateTimeCell.focusInput] Error:", error);
  }
};

watch(() => props.isEditing, (newVal) => {
  if (newVal === true) {
    if (props.value && typeof props.value === 'string') {
      editValue.value = props.value.replace('T', ' ');
    } else if (props.value instanceof Date) {
      editValue.value = props.value.toISOString().replace('T', ' ').substr(0, 16);
    } else {
      editValue.value = null;
    }
    focusInput();
  }
}, { immediate: true });
</script>

<style lang="scss" scoped>
.datetime-cell {
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

  .datetime-display {
    display: block;
    width: 100%;
    height: 100%;
    padding: 0 4px;
    box-sizing: border-box;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
    vertical-align: middle;
    display: flex;
    align-items: center;
    font-size: 12px;
  }

  .datetime-editing {
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
            padding: 0 4px !important;
            box-sizing: border-box !important;
            border: none !important;
            outline: none !important;
            font-family: inherit !important;
            font-size: 12px !important;
            background-color: transparent !important;
            color: inherit !important;
            border-radius: 0 !important;
            line-height: 22px; /* Примерная высота строки для 24px ячейки */
          }
        }
      }
    }
  }
}
</style>
