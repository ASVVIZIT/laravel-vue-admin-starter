<!-- resources/js/components/DynamicTable/TemplateBuilder/cells/DateCell.vue -->
<template>
  <div @click="handleClick" class="date-cell">
    <span v-if="!isEditing" class="date-display">
      {{ displayValue }}
    </span>
    <div v-else class="date-editing">
      <el-date-picker
          ref="editInput"
          v-model="editValue"
          @change="handleUpdateValue"
          @blur="handleUpdateValue"
          type="date"
          :format="displayFormat"
          :value-format="valueFormat"
          size="small"
          placeholder="Выберите дату"
          class="cell-edit-input cell-edit-input--date"
      />
    </div>
  </div>
</template>

<script setup>
/**
 * @component DateCell
 *
 * Компонент ячейки для отображения и редактирования значений даты.
 * Использует el-date-picker для выбора даты.
 *
 * @props {Object} value - Значение ячейки (строка даты или объект Date)
 * @props {Object} column - Объект колонки типа "date"
 * @props {Boolean} isEditing - Флаг режима редактирования
 *
 * @emits {Event} update-value - Событие обновления значения
 * @param {*} newValue - Новое значение
 * @emits {Event} start-edit - Событие начала редактирования
 */
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { formatDateDisplay } from '@/components/DynamicTable/utils/dateUtils';

const props = defineProps({
  /**
   * Значение ячейки (строка даты или объект Date)
   * @type {Object}
   */
  value: {
    type: [String, Date],
    default: null
  },
  /**
   * Объект колонки типа "date"
   * @type {Object}
   */
  column: {
    type: Object,
    required: true
  },
  /**
   * Флаг режима редактирования
   * @type {Boolean}
   */
  isEditing: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([
  /**
   * Событие обновления значения
   * @param {*} newValue - Новое значение
   */
  'update-value',
  /**
   * Событие начала редактирования
   */
  'start-edit'
]);

// === Состояние ===
const editValue = ref(null);
const editInput = ref(null);

// === Вычисляемые свойства ===
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

// === Методы ===
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
  if (!props.isEditing) {
    return;
  }

  await nextTick();

  if (!editInput.value) {
    return;
  }

  try {
    let inputElement = null;

    // Проверяем, есть ли у editInput.value.$el HTMLElement
    if (editInput.value.$el && editInput.value.$el instanceof HTMLElement) {
      // Ищем input внутри $el компонента el-date-picker
      inputElement = editInput.value.$el.querySelector('.el-input__inner') || editInput.value.$el.querySelector('input');
    } else {
      // Если $el не HTMLElement, пытаемся получить input напрямую
      if (editInput.value instanceof HTMLInputElement) {
        inputElement = editInput.value;
      }
      // Или пытаемся получить input из других свойств
      else if (editInput.value.input) {
        inputElement = editInput.value.input;
      }
    }

    if (inputElement && typeof inputElement.focus === 'function') {
      inputElement.focus();
    } else {
    }
  } catch (error) {
    console.error("[DateCell.focusInput] Error:", error);
  }
};
// === КОНЕЦ ИСПРАВЛЕНИЯ ===

// === Lifecycle & Watchers ===
watch(() => props.isEditing, (newVal, oldVal) => {
  if (newVal === true) {
    if (props.value && typeof props.value === 'string') {
      editValue.value = props.value.replace('T', ' ');
    } else if (props.value instanceof Date) {
      editValue.value = props.value.toISOString().split('T')[0];
    } else {
      editValue.value = null;
    }
    focusInput();
  }
}, { immediate: true });

onMounted(() => {
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
