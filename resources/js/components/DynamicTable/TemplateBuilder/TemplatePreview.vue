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
            <th class="system-column" :style="{ width: '40px' }">#</th>
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
            <td class="system-column" :style="{ width: '40px' }">{{ rowIndex + 1 }}</td>
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
/**
 * @component TemplatePreview
 *
 * Компонент предварительного просмотра шаблона таблицы.
 * Отображает таблицу с примерными данными и позволяет редактировать настройки колонок.
 *
 * @props {Array} columns - Массив колонок шаблона
 * @props {Array} rows - Массив строк с примерными данными
 * @props {number|null} selectedColumnIndex - Индекс выбранной колонки
 * @props {number|null} selectedRowIndex - Индекс выбранной строки
 *
 * @emits {Event} column-select - Событие выбора колонки
 * @param {number} index - Индекс выбранной колонки
 * @emits {Event} row-select - Событие выбора строки
 * @param {number} index - Индекс выбранной строки
 * @emits {Event} update-rows - Событие обновления строк
 * @param {Array} newRows - Новый массив строк
 */
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { dataSource } from '@/components/DynamicTable/services/dataSource';
import { MOCK_REFERENCE_DATA } from '@/components/DynamicTable/services/mockData';
import PreviewCell from './PreviewCell.vue';

const props = defineProps({
  /**
   * Массив колонок шаблона
   * @type {Array}
   */
  columns: {
    type: Array,
    required: true,
    default: () => []
  },
  /**
   * Массив строк с примерными данными
   * @type {Array}
   */
  rows: {
    type: Array,
    required: true,
    default: () => []
  },
  /**
   * Индекс выбранной колонки
   * @type {number|null}
   */
  selectedColumnIndex: {
    type: Number,
    default: null
  },
  /**
   * Индекс выбранной строки
   * @type {number|null}
   */
  selectedRowIndex: {
    type: Number,
    default: null
  }
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
  'update-rows'
]);

// === Состояния ===
const previewTableContainer = ref(null);
const previewTableHeader = ref(null);
const previewTableBody = ref(null);
const columnWidths = ref([]);
const referenceData = ref({});
const loadingReferences = ref(new Set());
const selectedPreviewColumnIndex = ref(null);
const selectedPreviewRowIndex = ref(null);
const editingCell = ref(null);

// === Вычисляемые свойства ===
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
    // === ИСПРАВЛЕНИЕ: Проверяем MOCK_REFERENCE_DATA ===
    if (MOCK_REFERENCE_DATA[column.reference.entityType] && Array.isArray(MOCK_REFERENCE_DATA[column.reference.entityType])) {
      return MOCK_REFERENCE_DATA[column.reference.entityType];
    }
    // === КОНЕЦ ИСПРАВЛЕНИЯ ===

    // Если моковых данных нет, проверяем загруженные данные
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

const selectPreviewColumn = (index) => {
  selectedPreviewColumnIndex.value = index;
  emit('column-select', index);
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

  // Для справочников сохраняем только ID
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

/**
 * Получение данных справочника для конкретной колонки
 * @param {Object} column - Объект колонки
 * @returns {Array} Данные справочника
 */
const getReferenceDataForColumn = (column) => {
  if (column.type === 'reference' && column.reference?.entityType) {
    const entityType = column.reference.entityType;

    // === ИСПРАВЛЕНИЕ: Проверяем MOCK_REFERENCE_DATA ===
    // Сначала проверяем моковые данные
    if (MOCK_REFERENCE_DATA[entityType] && Array.isArray(MOCK_REFERENCE_DATA[entityType])) {
      console.log(`[TemplatePreview] Используем моковые данные для справочника: ${entityType}`);
      return MOCK_REFERENCE_DATA[entityType];
    }
    // === КОНЕЦ ИСПРАВЛЕНИЯ ===

    // Если моковых данных нет, проверяем загруженные данные
    if (referenceData.value[entityType] && Array.isArray(referenceData.value[entityType])) {
      console.log(`[TemplatePreview] Используем загруженные данные для справочника: ${entityType}`);
      return referenceData.value[entityType];
    }

    console.log(`[TemplatePreview] Нет данных для справочника: ${entityType}`);
  }

  return [];
};

const updatePreviewData = async () => {
  const rows = [];

  for (let i = 0; i < 10; i++) {
    const rowData = {};

    for (const column of props.columns) {
      let exampleValue;

      switch (column.type) {
        case 'text':
          exampleValue = `Пример текста ${i+1}`;
          break;
        case 'number':
          exampleValue = 100 + i;
          break;
        case 'select':
          exampleValue = column.options && column.options.length > 0 ? column.options[0] : `Выбор ${i+1}`;
          break;
        case 'date':
          exampleValue = i === 0 ? '2023-10-27' : '2024-01-15';
          break;
        case 'datetime':
          exampleValue = i === 0 ? '2023-10-27 10:30' : '2024-01-15 15:45';
          break;
        case 'boolean':
          exampleValue = i % 2 === 0;
          break;
        case 'reference':
          if (column.reference?.entityType) {
            try {
              // === ИСПРАВЛЕНИЕ: Проверяем MOCK_REFERENCE_DATA ===
              if (MOCK_REFERENCE_DATA[column.reference.entityType]?.[i]) {
                exampleValue = MOCK_REFERENCE_DATA[column.reference.entityType][i];
              } else {
                // === КОНЕЦ ИСПРАВЛЕНИЯ ===
                // Если моковых данных нет, пытаемся загрузить реальные данные
                const referenceData = await getReferenceData(column.reference.entityType);
                if (referenceData && referenceData.length > 0) {
                  // ИСПРАВЛЕНО: Проверяем, что данные существуют перед форматированием
                  const item = referenceData[i] || referenceData[0];
                  if (item) {
                    // ИСПРАВЛЕНО: Используем optional chaining для безопасного доступа
                    exampleValue = formatReferenceDisplay(item, column);
                  } else {
                    exampleValue = 'Нет данных';
                  }
                } else {
                  exampleValue = 'Нет данных в справочнике';
                }
              }
            } catch (error) {
              console.error(`Ошибка загрузки данных справочника ${column.reference.entityType}:`, error);
              exampleValue = `Ошибка: ${error.message}`;
            }
          } else {
            exampleValue = 'Выберите справочник';
          }
          break;
        default:
          exampleValue = column.type;
      }

      rowData[column.tempId] = exampleValue;
    }

    rows.push({ rowData, order: i });
  }

  emit('update-rows', rows);
};

// === Lifecycle ===
onMounted(() => {
  columnWidths.value = new Array(props.columns.length).fill(120);
  props.columns.forEach(column => {
    if (column.type === 'reference' && column.reference?.entityType) {
      loadReferenceData(column.reference.entityType);
    }
  });
  updatePreviewData();
});

// === Watchers ===
watch(() => props.columns, () => {
  columnWidths.value = new Array(props.columns.length).fill(120);
  updatePreviewData();
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
  padding: 15px;
  margin-bottom: 15px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    flex-shrink: 0;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }

  .preview-table-container {
    flex: 1;
    overflow: hidden;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    background-color: #fff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    position: relative;

    .preview-table-header {
      width: 100%;
      overflow-x: hidden;
      flex-shrink: 0;
    }

    .preview-table-body {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      position: relative;

      &::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }

      &::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
      }

      &::-webkit-scrollbar-thumb {
        background: #d1d1d1;
        border-radius: 4px;
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

      // === ИСПРАВЛЕНИЕ: Установка фиксированной высоты строки ===
      // === И ФЛЕКС-ПОЗИЦИОНИРОВАНИЕ СОДЕРЖИМОГО ===
      th, td {
        padding: 0; // Убираем padding, он будет на внутренних элементах
        border-right: 1px solid #ebeef5;
        border-bottom: 1px solid #ebeef5;
        text-align: left;
        font-size: 13px;
        color: #606266;
        // === КЛЮЧЕВОЕ ИЗМЕНЕНИЕ 1: Фиксированная высота строки ===
        height: 32px; // Фиксированная высота строки
        line-height: 32px; // Соответствует высоте
        box-sizing: border-box; // Включаем border в размеры
        // === КОНЕЦ КЛЮЧЕВОГО ИЗМЕНЕНИЯ 1 ===
        position: relative; // Для позиционирования ::after
        overflow: hidden; // Скрываем переполнение
        text-overflow: ellipsis; // Точки многоточия
        white-space: nowrap; // Одна строка

        // === КЛЮЧЕВОЕ ИЗМЕНЕНИЕ 2: Флекс-позиционирование содержимого ===
        display: flex; // Используем flexbox для центрирования
        align-items: center; // Центрируем по вертикали
        justify-content: flex-start; // Выравниваем по левому краю
        // === КОНЕЦ КЛЮЧЕВОГО ИЗМЕНЕНИЯ 2 ===

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

        // === КЛЮЧЕВОЕ ИЗМЕНЕНИЕ 3: Активная ячейка (без смещения) ===
        &.active-cell {
          // background-color: #f0f9eb; // Опционально: фон
          // ВМЕСТО border используем box-shadow, чтобы не смещало layout
          box-shadow: inset 0 0 0 1px #409eff; // Внутренняя рамка цвета #409eff
          z-index: 1; // Немного поднимаем над другими ячейками

          // УДАЛЯЕМ старый ::after, так как заменили на box-shadow
          /*
          &::after {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            border: 1px solid #409eff; // <-- ЭТО МОГЛО ВЫЗЫВАТЬ СМЕЩЕНИЕ
            pointer-events: none;
            box-sizing: border-box;
            z-index: 2;
          }
          */
        }
        // === КОНЕЦ КЛЮЧЕВОГО ИЗМЕНЕНИЯ 3 ===

        &.loading-reference {
          background-color: #f5f7fa;

          .el-icon.is-loading {
            animation: rotating 2s linear infinite;
            margin-right: 5px;
          }
        }

        .cell-content {
          // === КЛЮЧЕВОЕ ИЗМЕНЕНИЕ 4: Стили содержимого ячейки ===
          flex: 1; // Занимает всё доступное пространство
          height: 100%; // Заполняет высоту ячейки
          width: 100%; // Заполняет ширину ячейки
          display: flex; // Используем flexbox для содержимого
          align-items: center; // Центрируем по вертикали
          justify-content: flex-start; // Выравниваем по левому краю
          padding: 0 6px; // Внутренние отступы
          box-sizing: border-box; // Включаем padding в размеры
          overflow: hidden; // Скрываем переполнение
          text-overflow: ellipsis; // Точки многоточия
          white-space: nowrap; // Одна строка
          // === КОНЕЦ КЛЮЧЕВОГО ИЗМЕНЕНИЯ 4 ===
        }

        .cell-editing {
          // === КЛЮЧЕВОЕ ИЗМЕНЕНИЕ 5: Стили редактирования ячейки ===
          position: absolute; // Абсолютное позиционирование
          top: 0; // Прижимаем к верху
          left: 0; // Прижимаем к левому краю
          width: 100%; // Заполняет ширину ячейки
          height: 100%; // Заполняет высоту ячейки
          z-index: 10; // Выше других элементов
          padding: 0; // Нет отступов, input должен заполнить всё
          box-sizing: border-box; // Включаем padding/border в размеры
          border: 1px solid #409eff; // Явная рамка редактирования
          border-radius: 0; // Без скруглений
          background-color: #fff; // Фон
          overflow: hidden; // Скрываем переполнение

          .el-input,
          .el-select,
          .el-date-picker,
          .el-input-number {
            width: 100% !important; // Ширина 100%
            height: 100% !important; // Высота 100%
            margin: 0 !important; // Нет внешних отступов
            padding: 0 !important; // Нет внутренних отступов
            box-sizing: border-box !important; // Включаем padding/border в размеры
            border: none !important; // Граница на .cell-editing
            outline: none !important; // Нет outline
            font-family: inherit !important; // Наследуем шрифт
            font-size: inherit !important; // Наследуем размер шрифта
            background-color: transparent !important; // Наследуем фон
            color: inherit !important; // Наследуем цвет текста
            border-radius: 0 !important; // Без скруглений

            :deep(.el-input__wrapper) {
              width: 100% !important; // Ширина 100%
              height: 100% !important; // Высота 100%
              margin: 0 !important; // Нет внешних отступов
              padding: 0 !important; // Нет внутренних отступов
              box-sizing: border-box !important; // Включаем padding/border в размеры
              border: none !important; // Граница на .cell-editing
              outline: none !important; // Нет outline
              background-color: transparent !important; // Наследуем фон
              box-shadow: none !important; // Нет тени
              border-radius: 0 !important; // Без скруглений
            }

            :deep(.el-input__inner) {
              width: 100% !important; // Ширина 100%
              height: 100% !important; // Высота 100%
              margin: 0 !important; // Нет внешних отступов
              padding: 0 6px !important; // Внутренние отступы только слева и справа
              box-sizing: border-box !important; // Включаем padding/border в размеры
              border: none !important; // Граница на .cell-editing
              outline: none !important; // Нет outline
              font-family: inherit !important; // Наследуем шрифт
              font-size: inherit !important; // Наследуем размер шрифта
              background-color: transparent !important; // Наследуем фон
              color: inherit !important; // Наследуем цвет текста
              border-radius: 0 !important; // Без скруглений
              line-height: 30px; // Высота строки, соответствующая высоте ячейки (32px - 2px border)
            }
          }
          // === КОНЕЦ КЛЮЧЕВОГО ИЗМЕНЕНИЯ 5 ===
        }
      }
      // === КОНЕЦ ИСПРАВЛЕНИЯ ===

      thead {
        tr {
          th {
            background-color: #f5f7fa;
            color: #909399;
            font-weight: 500;
            height: 32px; // Фиксированная высота строки
            line-height: 32px; // Соответствует высоте
            position: sticky;
            top: 0;
            z-index: 10;
            box-shadow: 0 1px 0 #ebeef5;

            .column-header {
              display: flex;
              align-items: center;
              width: 100%;
              height: 100%;
              padding: 0 6px;
              box-sizing: border-box;

              .sort-handle {
                cursor: move;
                padding: 0 4px;
                color: #909399;
                opacity: 0.7;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 20px;
                height: 20px;
                flex-shrink: 0;
                margin-right: 2px;

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
