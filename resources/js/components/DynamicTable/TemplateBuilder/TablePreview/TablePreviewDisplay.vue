<!-- resources/js/components/DynamicTable/TemplateBuilder/TablePreview/TablePreviewDisplay.vue -->
<template>
  <div class="table-preview-display">
    <div class="preview-table-container" ref="previewTableContainer">
      <div class="preview-table-header" ref="previewTableHeader">
        <table class="preview-table header-table">
          <colgroup>
            <col class="system-column" :style="{ width: '30px' }">
            <col
                v-for="(column, index) in columns"
                :key="`header-col-${column.tempId}`"
                :style="getColumnWidthStyle(index)"
            >
          </colgroup>
          <thead>
          <tr>
            <th class="system-column" :style="{ width: '30px' }">#</th>
            <th
                v-for="(column, index) in columns"
                :key="`header-${column.tempId}`"
                :class="{ 'active': selectedColumnIndex === index }"
                @click="$emit('column-select', index)"
                :style="getColumnWidthStyle(index)"
            >
              <div class="column-header">
                <span class="sort-handle">☰</span>
                {{ column.label || `Колонка ${index + 1}` }}
              </div>
            </th>
          </tr>
          </thead>
        </table>
      </div>

      <div class="preview-table-body" ref="previewTableBody" @scroll="handleBodyScroll">
        <table class="preview-table body-table">
          <colgroup>
            <col class="system-column" :style="{ width: '30px' }">
            <col
                v-for="(column, index) in columns"
                :key="`body-col-${column.tempId}`"
                :style="getColumnWidthStyle(index)"
            >
          </colgroup>
          <tbody>
          <tr
              v-for="(row, rowIndex) in rows"
              :key="`row-${rowIndex}`"
              :class="{ 'active': selectedRowIndex === rowIndex }"
              @click="selectRow(rowIndex)"
          >
            <td class="system-column" :style="{ width: '30px' }">{{ rowIndex + 1 }}</td>
            <td
                v-for="(column, colIndex) in columns"
                :key="`cell-${rowIndex}-${column.tempId}`"
                :class="{
                  'loading-reference': isReferenceLoading(column),
                  'active-cell': isCellActive(rowIndex, colIndex)
                }"
                @dblclick.stop="startEditingCell(rowIndex, colIndex)"
                :style="getColumnWidthStyle(colIndex)"
            >
              <!-- Компонент управления ячейками предпросмотра -->
              <TablePreviewCellManager
                  :value="getCellValue(row, column)"
                  :column="column"
                  :row-index="rowIndex"
                  :col-index="colIndex"
                  :is-editing="isCellEditing(rowIndex, colIndex)"
                  :reference-data="getReferenceData(column)"
                  @start-edit="startEditingCell(rowIndex, colIndex)"
                  @update-value="updateCellValue(rowIndex, colIndex, $event)"
              />
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * @component TablePreviewDisplay
 *
 * Компонент отображения таблицы предпросмотра.
 * Отображает структуру таблицы с примерными данными.
 *
 * @props {Array} columns - Массив колонок шаблона
 * @props {Array} rows - Массив строк с примерными данными
 * @props {number|null} selectedColumnIndex - Индекс выбранной колонки
 * @props {number|null} selectedRowIndex - Индекс выбранной строки
 * @props {Array} columnWidths - Массив ширин колонок
 *
 * @emits {Event} column-select - Событие выбора колонки
 * @param {number} index - Индекс выбранной колонки
 * @emits {Event} row-select - Событие выбора строки
 * @param {number} index - Индекс выбранной строки
 * @emits {Event} update-rows - Событие обновления строк
 * @param {Array} newRows - Новый массив строк
 * @emits {Event} test-mode-change - Событие изменения режима тестирования
 * @param {string} mode - Новый режим тестирования ('auto' | 'manual')
 * @emits {Event} reset-test-mode - Событие сброса тестовых данных
 * @emits {Event} update-manual-test-data - Событие обновления ручных тестовых данных
 * @param {number} rowIndex - Индекс строки
 * @param {number} colIndex - Индекс колонки
 * @param {*} newValue - Новое значение
 */
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { ElMessage, ElIcon, ElAlert } from 'element-plus';
import { Loading } from '@element-plus/icons-vue';
import { dataSource } from '@/components/DynamicTable/services/dataSource';
import { formatReferenceDisplay } from '@/components/DynamicTable/utils/referenceUtils';
import { MOCK_REFERENCE_DATA } from '@/components/DynamicTable/services/mockData';
import TablePreviewCellManager from './TablePreviewCellManager.vue';

const props = defineProps({
  /**
   * Массив колонок шаблона
   * @type {Array}
   */
  columns: { type: Array, required: true, default: () => [] },
  /**
   * Массив строк с примерными данными
   * @type {Array}
   */
  rows: { type: Array, required: true, default: () => [] },
  /**
   * Индекс выбранной колонки
   * @type {number|null}
   */
  selectedColumnIndex: { type: Number, default: null },
  /**
   * Индекс выбранной строки
   * @type {number|null}
   */
  selectedRowIndex: { type: Number, default: null },
  /**
   * Массив ширин колонок
   * @type {Array}
   */
  columnWidths: { type: Array, default: () => [] }
});

const emit = defineEmits([
  /**
   * Событие выбора колонки
   * @param {number} index - Индекс выбранной колонки
   */
  'column-select',
  /**
   * Событие выбора строки
   * @param {number} index - Индекс выбранной строки
   */
  'row-select',
  /**
   * Событие обновления строк
   * @param {Array} newRows - Новый массив строк
   */
  'update-rows',
  /**
   * Событие изменения режима тестирования
   * @param {string} mode - Новый режим тестирования ('auto' | 'manual')
   */
  'test-mode-change',
  /**
   * Событие сброса тестовых данных
   */
  'reset-test-mode',
  /**
   * Событие обновления ручных тестовых данных
   * @param {number} rowIndex - Индекс строки
   * @param {number} colIndex - Индекс колонки
   * @param {*} newValue - Новое значение
   */
  'update-manual-test-data'
]);

// === Состояния ===
const previewTableContainer = ref(null);
const previewTableHeader = ref(null);
const previewTableBody = ref(null);
const columnWidths = ref([]);
const entityTypes = ref([]);
const referenceData = ref({});
const loadingReferenceTypes = ref(false);
const loadingReference = ref(new Set());
const referenceError = ref(null);
const formatInput = ref(null);
const formatBlocksContainer = ref(null);
const formatBlocks = ref([]);
const selectedPreviewColumnIndex = ref(null);
const selectedPreviewRowIndex = ref(null);
const editingCell = ref(null);

// === Вычисляемые свойства ===
const getColumnWidthStyle = (index) => {
  const width = columnWidths.value[index] || 120;
  return { width: `${width}px` };
};

const tableWidthStyle = computed(() => {
  const totalWidth = props.columns.reduce((sum, _, index) => sum + (columnWidths.value[index] || 120), 30);
  return { width: `${totalWidth}px` };
});

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

const isCellActive = (rowIndex, colIndex) => {
  return selectedRowIndex.value === rowIndex && selectedColumnIndex.value === colIndex;
};

const isCellEditing = (rowIndex, colIndex) => {
  return editingCell.value &&
      editingCell.value.rowIndex === rowIndex &&
      editingCell.value.colIndex === colIndex;
};

// === Методы ===
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
    console.log(`[TablePreviewDisplay] Reference data for ${entityType} is already loading, skipping...`);
    return;
  }

  // Проверяем, есть ли уже данные
  if (referenceData.value[entityType] && referenceData.value[entityType].length > 0) {
    console.log(`[TablePreviewDisplay] Reference data for ${entityType} already loaded, skipping...`);
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
    console.error(`[TablePreviewDisplay] Ошибка загрузки данных справочника ${entityType}:`, error);
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
  console.log('[TablePreviewDisplay] Component mounted');
  try {
    loadingReferenceTypes.value = true;

    const types = await dataSource.getReferenceTypes();
    console.log('[TablePreviewDisplay] Types loaded:', types);

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
  console.log('[TablePreviewDisplay.watch.props.columns] Columns changed:', newVal);
  columnWidths.value = new Array(newVal.length).fill(120);

  // Загружаем данные для новых справочных колонок
  newVal.forEach(column => {
    if (column.type === 'reference' && column.reference?.entityType) {
      if (!referenceData.value[column.reference.entityType] || referenceData.value[column.reference.entityType].length === 0) {
        loadReferenceData(column.reference.entityType);
      }
    }
  });

  console.log('[TablePreviewDisplay.watch.props.columns] columnWidths.value SET:', columnWidths.value);
  console.log('[TablePreviewDisplay.watch.props.columns] FINISHED');
}, { deep: true });

watch(() => props.selectedColumnIndex, (newIndex) => {
  console.log(`[TablePreviewDisplay.watch.props.selectedColumnIndex] Changed from ${selectedPreviewColumnIndex.value} to ${newIndex}`);
  selectedPreviewColumnIndex.value = newIndex;
  console.log(`[TablePreviewDisplay.watch.props.selectedColumnIndex] selectedPreviewColumnIndex.value SET to ${newIndex}`);
  console.log(`[TablePreviewDisplay.watch.props.selectedColumnIndex] FINISHED`);
});

watch(() => props.selectedRowIndex, (newIndex) => {
  console.log(`[TablePreviewDisplay.watch.props.selectedRowIndex] Changed from ${selectedPreviewRowIndex.value} to ${newIndex}`);
  selectedPreviewRowIndex.value = newIndex;
  console.log(`[TablePreviewDisplay.watch.props.selectedRowIndex] selectedPreviewRowIndex.value SET to ${newIndex}`);
  console.log(`[TablePreviewDisplay.watch.props.selectedRowIndex] FINISHED`);
});
// === Конец Lifecycle & Watchers ===
</script>

<style lang="scss" scoped>
.table-preview-display {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .preview-table-container {
    flex: 1;
    overflow: hidden;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    position: relative;
    display: flex;
    flex-direction: column;

    .preview-table-header {
      width: 100%;
      overflow-x: hidden;
      flex-shrink: 0;
    }

    .preview-table-body {
      flex: 1;
      overflow-y: auto;
      overflow-x: auto;
      position: relative;
      min-height: 72px;

      &::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }

      &::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 3px;
      }

      &::-webkit-scrollbar-thumb {
        background: #d1d1d1;
        border-radius: 3px;
      }

      &::-webkit-scrollbar-thumb:hover {
        background: #a8a8a8;
      }
    }

    .preview-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      table-layout: fixed;

      th, td {
        padding: 0;
        border-right: 1px solid #ebeef5;
        border-bottom: 1px solid #ebeef5;
        text-align: left;
        font-size: 11px;
        color: #606266;
        height: 24px;
        line-height: 24px;
        box-sizing: border-box;
        position: relative;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        &:first-child {
          border-left: 1px solid #ebeef5;
        }

        &:last-child {
          border-right: none;
        }

        &:hover:not(.active):not(.preview-dragover-left):not(.preview-dragover-right) {
          background-color: #f5f7fa;
          border-color: #dcdfe6;
        }

        &.active-cell {
          box-shadow: inset 0 0 0 1px #409eff;
          z-index: 1;
        }

        &.loading-reference {
          background-color: #f5f7fa;

          .el-icon.is-loading {
            animation: rotating 2s linear infinite;
            margin-right: 5px;
          }
        }

        &.system-column {
          text-align: center;
          display: table-cell;
          vertical-align: middle;
          font-weight: 500;
          color: #909399;
          background-color: #f5f7fa;
          width: 30px;
        }
      }

      thead {
        tr {
          th {
            background-color: #f5f7fa;
            color: #909399;
            font-weight: 500;
            height: 24px;
            line-height: 24px;
            position: sticky;
            top: 0;
            z-index: 10;
            box-shadow: 0 1px 0 #ebeef5;

            .column-header {
              display: flex;
              align-items: center;
              width: 100%;
              height: 100%;
              padding: 0 4px;
              box-sizing: border-box;

              .sort-handle {
                cursor: move;
                padding: 0 2px;
                color: #909399;
                opacity: 0.7;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 16px;
                height: 16px;
                flex-shrink: 0;
                margin-right: 2px;
                font-size: 10px;

                &:hover {
                  opacity: 1;
                }
              }
            }

            &.active {
              background-color: #e6f7ff;
              border-color: #91d5ff;
              color: #409eff;

              .sort-handle {
                color: #409eff;
              }
            }

            &.system-column {
              text-align: center;
              display: table-cell;
              vertical-align: middle;
            }
          }
        }
      }

      tbody {
        tr {
          display: table;
          width: 100%;
          table-layout: fixed;

          &.active {
            td {
              background-color: #ecf5ff;
              border-color: #a0cfff;

              &:hover:not(.active) {
                background-color: #ecf5ff;
                border-color: #a0cfff;
              }
            }
          }

          &:last-child {
            td {
              border-bottom: none;
            }
          }
        }
      }
    }
  }

  @keyframes rotating {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
}
</style>
