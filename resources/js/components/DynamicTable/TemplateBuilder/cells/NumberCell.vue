<!-- resources/js/components/DynamicTable/TemplateBuilder/cells/NumberCell.vue -->
<template>
  <div @click="handleClick" class="number-cell">
    <span v-if="!isEditing" class="number-display">
      {{ displayValue }}
    </span>
    <div v-else class="number-editing">
      <el-input-number
        ref="editInput"
        v-model="editValue"
        @change="handleUpdateValue"
        controls-position="right"
        :min="-Infinity"
        :max="Infinity"
        :step="1"
        size="small"
        class="cell-edit-input cell-edit-input--number"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue';

const props = defineProps({
  value: { type: [String, Number], default: null },
  column: { type: Object, required: true },
  isEditing: { type: Boolean, default: false }
});

const emit = defineEmits(['update-value', 'start-edit']);

const editValue = ref(0);
const editInput = ref(null);

const displayValue = computed(() => {
  if (props.value === null || props.value === undefined) return '';
  let formatted = String(props.value);
  if (props.column.unit) {
    formatted += ` ${props.column.unit}`;
  }
  return formatted;
});

const handleClick = () => {
  if (!props.isEditing) {
    emit('start-edit');
  }
};

const handleUpdateValue = (newValue) => {
  let finalValue = newValue;
  const numValue = parseFloat(newValue);
  if (!isNaN(numValue)) {
    finalValue = numValue;
  } else {
    finalValue = '';
  }
  emit('update-value', finalValue);
};

const focusInput = () => {
  nextTick(() => {
    if (editInput.value && editInput.value.$el) {
      const input = editInput.value.$el.querySelector('input');
      if (input) {
        input.focus();
        // input.select(); // Не вызываем select для числовых полей
      }
    }
  });
};

watch(() => props.isEditing, (newVal) => {
  if (newVal) {
    const numValue = parseFloat(props.value);
    editValue.value = isNaN(numValue) ? 0 : numValue;
    focusInput();
  }
}, { immediate: true });
</script>

<style lang="scss" scoped>
.number-cell {
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

  .number-display {
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

  .number-editing {
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

      :deep(.el-input-number) {
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

        // === ИЗМЕНЕНИЕ: Стили для горизонтального расположения кнопок ===
        .el-input-number__decrease,
        .el-input-number__increase {
          // Убираем вертикальное разделение
          border-left: 1px solid #dcdfe6 !important;
          border-top: none !important;
          border-bottom: none !important;

          // Размеры и позиционирование
          width: 20px !important; // Ширина кнопок
          height: 50% !important; // Высота 50% от input-number
          line-height: 12px !important; // Центрирование текста
          font-size: 12px !important;

          // Стили кнопок
          background-color: #f5f7fa !important;
          color: #909399 !important;
          border-radius: 0 !important; // Убираем скругления

          // Позиционирование внутри input-number
          position: absolute !important;
          right: 0 !important;
          top: 0 !important; // Кнопка "+" сверху

          // Центрирование иконки
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;

          &:hover {
            color: #409eff !important;
            background-color: #ecf5ff !important;
          }

          &.is-disabled {
            color: #c0c4cc !important;
            background-color: #f5f7fa !important;
            cursor: not-allowed !important;
          }
        }

        .el-input-number__decrease {
          // Кнопка "-" снизу
          top: auto !important;
          bottom: 0 !important;
          border-top: 1px solid #dcdfe6 !important; // Линия сверху для кнопки "-"
        }

        .el-input-number__increase {
          // Кнопка "+" сверху (по умолчанию уже сверху)
        }
        // === КОНЕЦ ИЗМЕНЕНИЯ ===

        .el-input {
          width: calc(100% - 20px) !important; /* Учитываем ширину кнопок */
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
            padding: 4px 8px !important; /* Отступы текста внутри input */
            box-sizing: border-box !important;
            border: none !important;
            outline: none !important;
            font-family: inherit !important;
            font-size: inherit !important;
            background-color: transparent !important;
            color: inherit !important;
            border-radius: 0 !important;
            line-height: 24px; /* Примерная высота строки */
          }
        }
      }
    }
  }
}
</style>
