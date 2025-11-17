<!-- resources/js/components/DynamicTable/TemplateBuilder/PreviewCell.vue -->
<template>
  <div class="preview-cell">
    <div v-if="!isEditing" class="cell-content">
      <ReferenceCell
          v-if="column.type === 'reference' && referenceData && referenceData.length > 0"
          :value="value"
          :column="column"
          :reference-data="referenceData"
          class="cell-component"
      />
      <BooleanCell
          v-else-if="column.type === 'boolean'"
          :value="value"
          :column="column"
          class="cell-component"
      />
      <SelectCell
          v-else-if="column.type === 'select'"
          :value="value"
          :column="column"
          class="cell-component"
      />
      <DateCell
          v-else-if="column.type === 'date'"
          :value="value"
          :column="column"
          class="cell-component"
      />
      <DateTimeCell
          v-else-if="column.type === 'datetime'"
          :value="value"
          :column="column"
          class="cell-component"
      />
      <NumberCell
          v-else-if="column.type === 'number'"
          :value="value"
          :column="column"
          class="cell-component"
      />
      <TextCell
          v-else-if="column.type === 'text'"
          :value="value"
          :column="column"
          class="cell-component"
      />
      <span v-else class="cell-component">{{ value || '' }}</span>
    </div>

    <div v-else class="cell-editing">
      <ReferenceCell
          v-if="column.type === 'reference' && referenceData && referenceData.length > 0"
          :value="value"
          :column="column"
          :reference-data="referenceData"
          :is-editing="true"
          @update-value="$emit('update-value', $event)"
          class="cell-component"
      />
      <BooleanCell
          v-else-if="column.type === 'boolean'"
          :value="value"
          :column="column"
          :is-editing="true"
          @update-value="$emit('update-value', $event)"
          class="cell-component"
      />
      <SelectCell
          v-else-if="column.type === 'select'"
          :value="value"
          :column="column"
          :is-editing="true"
          @update-value="$emit('update-value', $event)"
          class="cell-component"
      />
      <DateCell
          v-else-if="column.type === 'date'"
          :value="value"
          :column="column"
          :is-editing="true"
          @update-value="$emit('update-value', $event)"
          class="cell-component"
      />
      <DateTimeCell
          v-else-if="column.type === 'datetime'"
          :value="value"
          :column="column"
          :is-editing="true"
          @update-value="$emit('update-value', $event)"
          class="cell-component"
      />
      <NumberCell
          v-else-if="column.type === 'number'"
          :value="value"
          :column="column"
          :is-editing="true"
          @update-value="$emit('update-value', $event)"
          class="cell-component"
      />
      <TextCell
          v-else-if="column.type === 'text'"
          :value="value"
          :column="column"
          :is-editing="true"
          @update-value="$emit('update-value', $event)"
          class="cell-component"
      />
      <span v-else class="cell-component">{{ value || '' }}</span>
    </div>

    <!-- === НОВОЕ: Спиннер загрузки для ячейки === -->
    <div v-if="isLoading" class="cell-loading-overlay">
      <el-icon class="is-loading"><Loading /></el-icon>
    </div>
    <!-- === КОНЕЦ НОВОГО === -->
  </div>
</template>

<script setup>
/**
 * @component PreviewCell
 *
 * Компонент ячейки предпросмотра таблицы.
 * Отображает и редактирует содержимое ячеек в зависимости от типа колонки.
 *
 * @props {Object} value - Значение ячейки
 * @props {Object} column - Объект колонки
 * @props {number} rowIndex - Индекс строки
 * @props {number} colIndex - Индекс колонки
 * @props {Boolean} isEditing - Флаг режима редактирования
 * @props {Array} referenceData - Данные справочника для выбора
 * @props {Boolean} isLoading - Флаг состояния загрузки
 *
 * @emits {Event} start-edit - Событие начала редактирования
 * @emits {Event} update-value - Событие обновления значения
 * @param {*} newValue - Новое значение
 */
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { ElMessage, ElIcon, ElAlert } from 'element-plus';
import { Loading } from '@element-plus/icons-vue';
import ReferenceCell from '../cells/ReferenceCell.vue';
import BooleanCell from '../cells/BooleanCell.vue';
import SelectCell from '../cells/SelectCell.vue';
import TextCell from '../cells/TextCell.vue';
import NumberCell from '../cells/NumberCell.vue';
import DateCell from '../cells/DateCell.vue';
import DateTimeCell from '../cells/DateTimeCell.vue';

const props = defineProps({
  /**
   * Значение ячейки
   * @type {Object}
   */
  value: { type: [String, Number, Boolean, Object, null, undefined], default: null },
  /**
   * Объект колонки
   * @type {Object}
   */
  column: { type: Object, required: true },
  /**
   * Индекс строки
   * @type {number}
   */
  rowIndex: { type: Number, required: true },
  /**
   * Индекс колонки
   * @type {number}
   */
  colIndex: { type: Number, required: true },
  /**
   * Флаг режима редактирования
   * @type {Boolean}
   */
  isEditing: { type: Boolean, default: false },
  /**
   * Данные справочника для выбора
   * @type {Array}
   */
  referenceData: { type: Array, default: () => [] },
  /**
   * Флаг состояния загрузки
   * @type {Boolean}
   */
  isLoading: { type: Boolean, default: false }
});

const emit = defineEmits([
  /**
   * Событие начала редактирования
   */
  'start-edit',
  /**
   * Событие обновления значения
   * @param {*} newValue - Новое значение
   */
  'update-value'
]);

// === Состояния ===
const editValue = ref('');
const editInput = ref(null);

// === Вычисляемые свойства ===
const displayValue = computed(() => {
  if (props.value === null || props.value === undefined) return '';
  return String(props.value);
});

// === Методы ===
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
        // input.select(); // Не вызываем select для текстовых полей при редактировании, чтобы избежать "прыжков"
      }
    }
  });
};

watch(() => props.isEditing, (newVal) => {
  if (newVal) {
    editValue.value = displayValue.value;
    focusInput();
  }
}, { immediate: true });

watch(() => props.isLoading, (newVal) => {
  console.log(`[PreviewCell.watch.props.isLoading] Changed from ${cellLoading.value} to ${newVal}`);
  cellLoading.value = newVal;
  console.log(`[PreviewCell.watch.props.isLoading] cellLoading.value SET to ${newVal}`);
  console.log(`[PreviewCell.watch.props.isLoading] FINISHED`);
}, { immediate: true });

const getCellValue = (row, column) => {
  return row.rowData[column.tempId] || '';
};

const getReferenceData = (column) => {
  if (column.type === 'reference' && column.reference?.entityType) {
    if (MOCK_REFERENCE_DATA[column.reference.entityType]?.[0]) {
      return MOCK_REFERENCE_DATA[column.reference.entityType];
    }
    if (referenceData.value[column.reference.entityType] && Array.isArray(referenceData.value[column.reference.entityType])) {
      return referenceData.value[column.reference.entityType];
    }
  }
  return [];
};

const isReferenceLoading = (column) => {
  return column.type === 'reference' &&
      column.reference?.entityType &&
      loadingReference.value.has(column.reference.entityType);
};

const isCellEditing = (rowIndex, colIndex) => {
  return editingCell.value &&
      editingCell.value.rowIndex === rowIndex &&
      editingCell.value.colIndex === colIndex;
};

const handleBodyScroll = (event) => {
  if (previewTableHeader.value) {
    previewTableHeader.value.scrollLeft = event.target.scrollLeft;
  }
};

const selectRow = (index) => {
  selectedPreviewRowIndex.value = index;
  emit('row-select', index);
};

const startEditingCell = (rowIndex, colIndex) => {
  editingCell.value = { rowIndex, colIndex };
  selectRow(rowIndex);
  selectPreviewColumn(colIndex);
};

const stopEditingCell = () => {
  editingCell.value = null;
};

const updateCellValue = async (rowIndex, colIndex, newValue) => {
  const column = props.columns[colIndex];
  const updatedRows = [...props.rows];

  if (column.type === 'reference' && referenceData.value[column.reference?.entityType]) {
    try {
      const data = await dataSource.getReferenceData(column.reference.entityType);
      const item = data.find(item => item.id == newValue);
      newValue = item ? item.id : newValue;
    } catch (error) {
      console.error(`Ошибка загрузки данных справочника ${column.reference.entityType}:`, error);
      ElMessage.error(`Не удалось загрузить данные справочника "${column.reference.entityType}": ${error.message}`);
    }
  }

  updatedRows[rowIndex] = {
    ...updatedRows[rowIndex],
    rowData: {
      ...updatedRows[rowIndex].rowData,
      [column.tempId]: newValue
    }
  };

  emit('update-rows', updatedRows);
  stopEditingCell();
};

const onTestModeChange = (newMode) => {
  console.log(`[TemplatePreview.onTestModeChange] Mode changed to: ${newMode}`);
  previewStore.setTestMode(newMode);
  localTestMode.value = newMode;
  emit('test-mode-change', newMode);
  console.log(`[TemplatePreview.onTestModeChange] FINISHED`);
};

const resetTestMode = () => {
  console.log(`[TemplatePreview.resetTestMode] Resetting manual test data`);
  previewStore.resetManualTestData();
  emit('reset-test-mode');
  ElMessage.success('Тестовые данные сброшены');
  console.log(`[TemplatePreview.resetTestMode] FINISHED`);
};

const handleUpdateManualTestData = (rowIndex, colIndex, newValue) => {
  console.log(`[TemplatePreview.handleUpdateManualTestData] Updating manual data for [${rowIndex}][${colIndex}]:`, newValue);
  previewStore.updateManualTestData(rowIndex, colIndex, newValue);
  emit('update-manual-test-data', rowIndex, colIndex, newValue);
  console.log(`[TemplatePreview.handleUpdateManualTestData] FINISHED`);
};
</script>

<style lang="scss" scoped>
.preview-cell {
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

  .cell-content {
    // === ИСПРАВЛЕНИЕ: Гарантированная высота и корректное выравнивание ===
    width: 100%;
    height: 100%; /* Обязательно 100% */
    min-height: inherit; /* Наследуем min-height от родителя */
    display: flex;
    align-items: center;
    padding: 0 4px; /* Уменьшенные отступы */
    box-sizing: border-box;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
    vertical-align: middle;
    // === КОНЕЦ ИСПРАВЛЕНИЯ ===
  }

  .cell-editing {
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

    .cell-component {
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

      :deep(.el-input),
      :deep(.el-select),
      :deep(.el-date-picker),
      :deep(.el-input-number),
      :deep(.el-switch),
      :deep(.el-checkbox) {
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

        .el-input__wrapper,
        .el-select__wrapper,
        .el-date-editor__wrapper {
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

        .el-input__inner,
        .el-select__inner,
        .el-date-editor__inner {
          width: 100% !important;
          height: 100% !important;
          margin: 0 !important;
          padding: 0 4px !important; /* Уменьшенные отступы текста внутри input */
          box-sizing: border-box !important;
          border: none !important;
          outline: none !important;
          font-family: inherit !important;
          font-size: inherit !important;
          background-color: transparent !important;
          color: inherit !important;
          border-radius: 0 !important;
          line-height: 22px; /* Примерная высота строки для 24px ячейки */
        }
      }
    }
  }

  // === НОВОЕ: Стили для спиннера загрузки ячейки ===
  .cell-loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 255, 255, 0.8);
    z-index: 2000;
    border-radius: 0;

    .el-icon.is-loading {
      animation: rotating 1s linear infinite;
      color: #409eff;
      font-size: 16px;

      > svg {
        width: 16px;
        height: 16px;
      }
    }
  }
  // === КОНЕЦ НОВОГО ===
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
