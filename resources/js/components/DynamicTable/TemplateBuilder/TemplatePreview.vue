<!-- resources/js/components/DynamicTable/TemplateBuilder/TemplatePreview.vue -->
<template>
  <div class="template-preview">
    <div class="preview-header">
      <h3>Предварительный просмотр</h3>
    </div>

    <div class="preview-table-container" ref="previewTableContainer">
      <div class="preview-table-header" ref="previewTableHeader">
        <table class="preview-table header-table">
          <thead>
          <tr>
            <th class="system-column" :style="{ width: '30px' }">#</th>
            <th
                v-for="(column, index) in columns"
                :key="column.tempId"
                :class="{ 'active': selectedColumnIndex === index }"
                @click="$emit('column-select', index)"
                :style="{ width: columnWidths[index] ? `${columnWidths[index]}px` : 'auto' }"
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
          <tbody>
          <tr
              v-for="(row, rowIndex) in rows"
              :key="rowIndex"
              :class="{ 'active': selectedRowIndex === rowIndex }"
              @click="selectRow(rowIndex)"
          >
            <td class="system-column" :style="{ width: '30px' }">{{ rowIndex + 1 }}</td>
            <td
                v-for="(column, colIndex) in columns"
                :key="column.tempId"
                :class="{
                  'loading-reference': isReferenceLoading(column),
                  'active-cell': isCellEditing(rowIndex, colIndex)
                }"
                @dblclick.stop="startEditingCell(rowIndex, colIndex)"
                :style="{ width: columnWidths[colIndex] ? `${columnWidths[colIndex]}px` : 'auto' }"
            >
              <PreviewCell
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
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { dataSource } from '@/components/DynamicTable/services/dataSource';
import { MOCK_REFERENCE_DATA } from '@/components/DynamicTable/services/mockData';
import PreviewCell from './PreviewCell.vue';

const props = defineProps({
  columns: { type: Array, required: true, default: () => [] },
  rows: { type: Array, required: true, default: () => [] },
  selectedColumnIndex: { type: Number, default: null },
  selectedRowIndex: { type: Number, default: null }
});

const emit = defineEmits(['column-select', 'row-select', 'update-rows']);

const previewTableContainer = ref(null);
const previewTableHeader = ref(null);
const previewTableBody = ref(null);
const columnWidths = ref([]);
const referenceData = ref({});
const loadingReferences = ref(new Set());
const selectedPreviewColumnIndex = ref(null);
const selectedPreviewRowIndex = ref(null);
const editingCell = ref(null);

const isReferenceLoading = (column) => {
  return column.type === 'reference' &&
      column.reference?.entityType &&
      loadingReferences.value.has(column.reference.entityType);
};

const getCellValue = (row, column) => {
  return row.rowData[column.tempId] || '';
};

const getReferenceData = (column) => {
  if (column.type === 'reference' && column.reference?.entityType) {
    if (MOCK_REFERENCE_DATA[column.reference.entityType] && Array.isArray(MOCK_REFERENCE_DATA[column.reference.entityType])) {
      return MOCK_REFERENCE_DATA[column.reference.entityType];
    }
    if (referenceData.value[column.reference.entityType] && Array.isArray(referenceData.value[column.reference.entityType])) {
      return referenceData.value[column.reference.entityType];
    }
  }
  return [];
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
};

const stopEditingCell = () => {
  editingCell.value = null;
};

const updateCellValue = async (rowIndex, colIndex, newValue) => {
  const column = props.columns[colIndex];
  const updatedRows = [...props.rows];

  if (column.type === 'reference' && referenceData.value[column.reference?.entityType]) {
    const data = await dataSource.getReferenceData(column.reference.entityType);
    const item = data.find(item => item.id == newValue);
    newValue = item ? item.id : newValue;
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

const loadReferenceData = async (entityType) => {
  if (!entityType) return;

  loadingReferences.value.add(entityType);
  referenceData.value = {
    ...referenceData.value,
    [entityType]: []
  };

  try {
    const data = await dataSource.getReferenceData(entityType);
    referenceData.value = {
      ...referenceData.value,
      [entityType]: data
    };
  } catch (error) {
    console.error(`Ошибка загрузки данных справочника ${entityType}:`, error);
    ElMessage.error(`Ошибка загрузки данных справочника "${entityType}": ${error.message}`);
    referenceData.value = {
      ...referenceData.value,
      [entityType]: []
    };
  } finally {
    loadingReferences.value.delete(entityType);
  }
};

onMounted(() => {
  columnWidths.value = new Array(props.columns.length).fill(120);
  props.columns.forEach(column => {
    if (column.type === 'reference' && column.reference?.entityType) {
      loadReferenceData(column.reference.entityType);
    }
  });
});

watch(() => props.columns, () => {
  columnWidths.value = new Array(props.columns.length).fill(120);
}, { deep: true });

watch(() => props.selectedColumnIndex, (newIndex) => {
  selectedPreviewColumnIndex.value = newIndex;
});

watch(() => props.selectedRowIndex, (newIndex) => {
  selectedPreviewRowIndex.value = newIndex;
});
</script>

<style lang="scss" scoped>
.template-preview {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 10px;
  margin-bottom: 10px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    flex-shrink: 0;

    h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: #303133;
    }
  }

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
        font-size: 12px;
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
