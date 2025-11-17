<!-- resources/js/components/DynamicTable/TemplateBuilder/TablePreview/TablePreviewCellManager.vue -->
<template>
  <div class="table-preview-cell-manager">
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
  </div>
</template>

<script setup>
/**
 * @component TablePreviewCellManager
 *
 * Компонент управления ячейками таблицы предпросмотра.
 * Отображает и редактирует содержимое ячеек в зависимости от типа колонки.
 *
 * @props {Object} value - Значение ячейки
 * @props {Object} column - Объект колонки
 * @props {number} rowIndex - Индекс строки
 * @props {number} colIndex - Индекс колонки
 * @props {Boolean} isEditing - Флаг режима редактирования
 * @props {Array} referenceData - Данные справочника для выбора
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
  referenceData: { type: Array, default: () => [] }
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
const cellContent = ref(null);
const cellEditing = ref(null);

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

const handleUpdateValue = () => {
  let newValue = editValue.value;
  const numValue = parseFloat(newValue);
  if (!isNaN(numValue)) {
    newValue = numValue;
  } else {
    newValue = '';
  }
  emit('update-value', newValue);
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

// === ИСПРАВЛЕНИЕ: Правильная реализация isReferenceLoading ===
const isReferenceLoading = (column) => {
  return column.type === 'reference' &&
      column.reference?.entityType &&
      loadingReference.value.has(column.reference.entityType);
};
// === КОНЕЦ ИСПРАВЛЕНИЯ ===

const getCellValue = (row, column) => {
  return row.rowData[column.tempId] || '';
};

// === ИСПРАВЛЕНИЕ: Правильная реализация getReferenceData ===
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
// === КОНЕЦ ИСПРАВЛЕНИЯ ===

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

// === ИСПРАВЛЕНИЕ: Обновленный loadReferenceData с правильной логикой ===
const loadReferenceData = async (entityType) => {
  if (!entityType) return;

  // Проверяем, не загружается ли уже этот тип
  if (loadingReference.value.has(entityType)) {
    console.log(`[TablePreviewCellManager] Reference data for ${entityType} is already loading, skipping...`);
    return;
  }

  // Проверяем, есть ли уже данные
  if (referenceData.value[entityType] && referenceData.value[entityType].length > 0) {
    console.log(`[TablePreviewCellManager] Reference data for ${entityType} already loaded, skipping...`);
    return;
  }

  try {
    loadingReference.value.add(entityType);
    referenceData.value = {
      ...referenceData.value,
      [entityType]: []
    };

    const data = await dataSource.getReferenceData(entityType);
    referenceData.value = {
      ...referenceData.value,
      [entityType]: Array.isArray(data) ? data : []
    };
  } catch (error) {
    console.error(`[TablePreviewCellManager] Ошибка загрузки данных справочника ${entityType}:`, error);
    let errorMessage = 'Ошибка загрузки данных справочника';
    if (error.code === 'ERR_NETWORK') {
      errorMessage = 'Ошибка сети (CORS) при загрузке данных справочника.';
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    ElMessage.error(`Ошибка загрузки данных справочника "${entityType}": ${errorMessage}`);
    referenceData.value = {
      ...referenceData.value,
      [entityType]: []
    };
  } finally {
    loadingReference.value.delete(entityType);
  }
};
// === КОНЕЦ ИСПРАВЛЕНИЯ ===

// === Lifecycle & Watchers ===
onMounted(async () => {
  console.log('[TablePreviewCellManager] Component mounted');
  try {
    loadingReferenceTypes.value = true;

    const types = await dataSource.getReferenceTypes();
    console.log('[TablePreviewCellManager] Types loaded:', types);

    entityTypes.value = Array.isArray(types) ? types.map(t => ({...t})) : [];

    columnWidths.value = new Array(props.columns.length).fill(120);

    // Загружаем данные для справочных колонок
    props.columns.forEach(column => {
      if (column.type === 'reference' && column.reference?.entityType) {
        loadReferenceData(column.reference.entityType);
      }
    });
  } catch (error) {
    ElMessage({
      message: 'Не удалось загрузить типы справочников',
      type: 'error'
    });
    console.error('Ошибка загрузки типов справочников:', error);
  } finally {
    loadingReferenceTypes.value = false;
  }
});

watch(() => props.columns, (newVal) => {
  console.log('[TablePreviewCellManager.watch.props.columns] Columns changed:', newVal);
  columnWidths.value = new Array(newVal.length).fill(120);

  // Загружаем данные для новых справочных колонок
  newVal.forEach(column => {
    if (column.type === 'reference' && column.reference?.entityType) {
      if (!referenceData.value[column.reference.entityType] || referenceData.value[column.reference.entityType].length === 0) {
        loadReferenceData(column.reference.entityType);
      }
    }
  });

  console.log('[TablePreviewCellManager.watch.props.columns] columnWidths.value SET:', columnWidths.value);
  console.log('[TablePreviewCellManager.watch.props.columns] FINISHED');
}, { deep: true });

watch(() => props.selectedColumnIndex, (newIndex) => {
  console.log(`[TablePreviewCellManager.watch.props.selectedColumnIndex] Changed from ${selectedPreviewColumnIndex.value} to ${newIndex}`);
  selectedPreviewColumnIndex.value = newIndex;
  console.log(`[TablePreviewCellManager.watch.props.selectedColumnIndex] selectedPreviewColumnIndex.value SET to ${newIndex}`);
  console.log(`[TablePreviewCellManager.watch.props.selectedColumnIndex] FINISHED`);
});

watch(() => props.selectedRowIndex, (newIndex) => {
  console.log(`[TablePreviewCellManager.watch.props.selectedRowIndex] Changed from ${selectedPreviewRowIndex.value} to ${newIndex}`);
  selectedPreviewRowIndex.value = newIndex;
  console.log(`[TablePreviewCellManager.watch.props.selectedRowIndex] selectedPreviewRowIndex.value SET to ${newIndex}`);
  console.log(`[TablePreviewCellManager.watch.props.selectedRowIndex] FINISHED`);
});
// === Конец Lifecycle & Watchers ===
</script>

<style lang="scss" scoped>
.table-preview-cell-manager {
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

  // === НОВОЕ: Стили для компонентов внутри .cell-content ===
  .cell-component {
    flex: 1;
    height: 100%;
    min-height: inherit;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
    display: block; /* Убедимся, что это блок */

    // === ИСПРАВЛЕНИЕ: Специфичные стили для span ===
    // Если .cell-component это span, убедимся, что он ведет себя как блок
    &:is(span) {
      display: block;
      width: 100%;
      height: 100%;
      line-height: inherit; /* Наследуем line-height */
    }
    // === КОНЕЦ ИСПРАВЛЕНИЯ ===
  }
  // === КОНЕЦ НОВОГО ===
}
</style>
