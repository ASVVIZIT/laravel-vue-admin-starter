<!-- resources/js/components/DynamicTable/TemplateBuilder/TemplateBuilder.vue -->
<template>
  <div class="template-builder">
    <TemplateHeader
        :template="template"
        :saving="saving"
        :can-save="canSave"
        @save="saveTemplate"
        @reset="resetForm"
        @refresh-preview="updatePreviewData"
        @cancel="cancel"
    />

    <TemplateNameForm
        v-model:name="template.name"
        :rules="rules.name"
    />

    <TemplatePreview
        :columns="sortedTemplateColumns"
        :rows="previewRows"
        :selected-column-index="selectedColumnIndex"
        :selected-row-index="selectedRowIndex"
        @column-select="selectColumn"
        @row-select="selectRow"
        @update-rows="updateRows"
        @test-mode-change="onTestModeChange"
        @reset-test-mode="resetTestMode"
        @update-manual-test-data="handleUpdateManualTestData"
    />

    <div class="builder-content">
      <ColumnList
          v-model:columns="template.columns"
          :selected-column-index="selectedColumnIndex"
          :column-types="columnTypes"
          @column-select="selectColumn"
          @remove="removeColumn"
          @add="addColumn"
          @order-update="handleColumnOrderUpdate"
      />

      <ColumnSettings
          :column="selectedColumn"
          :column-types="columnTypes"
          :text-data-types="textDataTypes"
          :date-formats="dateFormats"
          :entity-types="entityTypes"
          :reference-fields="referenceFields"
          :loading-reference-types="loadingReferenceTypes"
          :loading-reference-fields="loadingReferenceFields"
          :reference-error="referenceError"
          @update-column="updateColumn"
          @reference-type-change="onReferenceTypeChange"
          @option-add="addOption"
          @option-remove="removeOption"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus';
import TemplateHeader from './TemplateBuilder/TemplateHeader.vue';
import TemplateNameForm from './TemplateBuilder/TemplateNameForm.vue';
import TemplatePreview from './TemplateBuilder/TablePreview/TemplatePreview.vue';
import ColumnList from './TemplateBuilder/ColumnList/ColumnList.vue';
import ColumnSettings from './TemplateBuilder/ColumnSettings/ColumnSettings.vue';
import { templateService } from './services/templateService';
import {
  getEntityTypes,
  getReferenceFields,
  getReferenceData
} from './services/referenceService';
import {
  columnTypes,
  textDataTypes,
  dateFormats
} from './utils/constants';
import {
  generateTempId,
  formatReferenceDisplay
} from './utils/templateBuilderUtils';
import { MOCK_REFERENCE_DATA } from './services/mockData';
import { usePreviewStore } from './stores/previewStore';
import { dataSource } from './services/dataSource';

const props = defineProps({
  template: { type: Object, required: true, default: () => ({ id: null, name: '', columns: [] }) },
  rows: { type: Array, required: true, default: () => [] },
  selectedColumnIndex: { type: Number, default: null },
  selectedRowIndex: { type: Number, default: null }
});

const emit = defineEmits([
  'update:template',
  'update:rows',
  'column-select',
  'row-select',
  'column-remove',
  'column-add',
  'column-update',
  'column-order-update',
  'option-add',
  'option-remove',
  'reference-type-change',
  'test-mode-change',
  'reset-test-mode',
  'update-manual-test-data'
]);

// === Состояния ===
const route = useRoute();
const router = useRouter();
const template = ref({ ...props.template });
const selectedColumnIndex = ref(props.selectedColumnIndex);
const selectedRowIndex = ref(props.selectedRowIndex);
const saving = ref(false);
const loading = ref(false);
const error = ref(null);
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
const previewRows = ref([]);
const referenceFields = ref([]);
const loadingReferenceFields = ref(false);

const previewStore = usePreviewStore();
const localTestMode = ref(previewStore.testMode);
const showTestControls = ref(true);

// === Определение правил валидации ===
const rules = {
  name: [
    { required: true, message: 'Введите название шаблона', trigger: 'blur' },
    { min: 1, max: 255, message: 'Название должно быть от 1 до 255 символов', trigger: 'blur' }
  ]
};

console.log('[TemplateBuilder] Component initializing with props:', props);

// === Вычисляемые свойства ===
const canSave = computed(() => {
  const result = template.value.name.trim() !== '' && template.value.columns.length > 0;
  console.log('[TemplateBuilder.canSave] Computed:', result);
  return result;
});

const selectedColumn = computed(() => {
  if (selectedColumnIndex.value === null || !template.value.columns) {
    console.log('[TemplateBuilder.selectedColumn] No column selected or no columns');
    return null;
  }
  const column = template.value.columns[selectedColumnIndex.value];
  console.log('[TemplateBuilder.selectedColumn] Computed:', column);
  return column;
});

const sortedTemplateColumns = computed(() => {
  const sorted = [...template.value.columns].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  console.log('[TemplateBuilder.sortedTemplateColumns] Computed:', sorted);
  return sorted;
});

// === Вспомогательные функции ===
const isReferenceLoading = (column) => {
  console.log('[TemplateBuilder.isReferenceLoading] Checking for column:', column);
  if (!column || typeof column !== 'object') {
    console.log('[TemplateBuilder.isReferenceLoading] Invalid column object');
    return false;
  }
  if (column.type !== 'reference') {
    console.log('[TemplateBuilder.isReferenceLoading] Not a reference column');
    return false;
  }
  const entityType = column.reference?.entityType;
  if (!entityType) {
    console.log('[TemplateBuilder.isReferenceLoading] No entity type specified');
    return false;
  }
  const isLoading = loadingReference.value.has(entityType);
  console.log('[TemplateBuilder.isReferenceLoading] Result:', isLoading);
  return isLoading;
};

const getReferenceDataForColumn = (column) => {
  console.log('[TemplateBuilder.getReferenceDataForColumn] Getting data for column:', column);
  if (!column || typeof column !== 'object') {
    console.log('[TemplateBuilder.getReferenceDataForColumn] Invalid column object');
    return [];
  }
  if (column.type !== 'reference') {
    console.log('[TemplateBuilder.getReferenceDataForColumn] Not a reference column');
    return [];
  }
  const entityType = column.reference?.entityType;
  if (!entityType) {
    console.log('[TemplateBuilder.getReferenceDataForColumn] No entity type specified');
    return [];
  }

  if (MOCK_REFERENCE_DATA[entityType]?.[0]) {
    console.log('[TemplateBuilder.getReferenceDataForColumn] Returning mock data for:', entityType);
    return MOCK_REFERENCE_DATA[entityType];
  }

  if (referenceData.value[entityType] && Array.isArray(referenceData.value[entityType])) {
    console.log('[TemplateBuilder.getReferenceDataForColumn] Returning cached data for:', entityType);
    return referenceData.value[entityType];
  }

  console.log('[TemplateBuilder.getReferenceDataForColumn] No data found for:', entityType);
  return [];
};

const isCellEditing = (rowIndex, colIndex) => {
  const result = editingCell.value &&
      editingCell.value.rowIndex === rowIndex &&
      editingCell.value.colIndex === colIndex;
  console.log('[TemplateBuilder.isCellEditing] Checking [' + rowIndex + '][' + colIndex + ']:', result);
  return result;
};

const handleBodyScroll = (event) => {
  console.log('[TemplateBuilder.handleBodyScroll] Scroll event triggered');
  if (previewTableHeader.value) {
    const scrollLeft = event.target.scrollLeft;
    previewTableHeader.value.scrollLeft = scrollLeft;
    console.log('[TemplateBuilder.handleBodyScroll] Header scrolled to:', scrollLeft);
  }
};

// === Обработчики событий предпросмотра ===
const selectRow = (index) => {
  console.log('[TemplateBuilder.selectRow] Selecting row:', index);
  selectedPreviewRowIndex.value = index;
  emit('row-select', index);
  console.log('[TemplateBuilder.selectRow] Emitted row-select with index:', index);
};

const startEditingCell = (rowIndex, colIndex) => {
  console.log('[TemplateBuilder.startEditingCell] Starting edit for [' + rowIndex + '][' + colIndex + ']');
  editingCell.value = { rowIndex, colIndex };
  selectRow(rowIndex);
  selectPreviewColumn(colIndex);
  console.log('[TemplateBuilder.startEditingCell] Editing cell set:', editingCell.value);
};

const stopEditingCell = () => {
  console.log('[TemplateBuilder.stopEditingCell] Stopping cell edit');
  editingCell.value = null;
  console.log('[TemplateBuilder.stopEditingCell] Editing cell cleared');
};

const updateCellValue = async (rowIndex, colIndex, newValue) => {
  console.log('[TemplateBuilder.updateCellValue] Updating cell [' + rowIndex + '][' + colIndex + '] with value:', newValue);

  const column = template.value.columns[colIndex];
  if (!column) {
    console.warn('[TemplateBuilder.updateCellValue] Column not found at index:', colIndex);
    return;
  }

  const updatedRows = [...previewRows.value];
  if (!updatedRows[rowIndex]) {
    console.warn('[TemplateBuilder.updateCellValue] Row not found at index:', rowIndex);
    return;
  }

  // Обработка справочников
  if (column.type === 'reference' && referenceData.value[column.reference?.entityType]) {
    try {
      console.log('[TemplateBuilder.updateCellValue] Loading reference data for:', column.reference.entityType);
      const data = await dataSource.getReferenceData(column.reference.entityType);
      const item = data.find(item => item.id == newValue);
      newValue = item ? item.id : newValue;
      console.log('[TemplateBuilder.updateCellValue] Reference value resolved to:', newValue);
    } catch (error) {
      console.error('[TemplateBuilder.updateCellValue] Error loading reference ', error);
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

  previewRows.value = updatedRows;
  emit('update-rows', updatedRows);
  stopEditingCell();
  console.log('[TemplateBuilder.updateCellValue] Cell updated and edit stopped');
};

const selectPreviewColumn = (index) => {
  console.log('[TemplateBuilder.selectPreviewColumn] Selecting preview column:', index);
  selectedPreviewColumnIndex.value = index;
  emit('column-select', index);
  console.log('[TemplateBuilder.selectPreviewColumn] Emitted column-select with index:', index);
};

const onTestModeChange = (newMode) => {
  console.log('[TemplateBuilder.onTestModeChange] Test mode changing to:', newMode);
  previewStore.setTestMode(newMode);
  localTestMode.value = newMode;
  emit('test-mode-change', newMode);
  updatePreviewData(); // Обновляем предпросмотр при смене режима
  console.log('[TemplateBuilder.onTestModeChange] Test mode changed and preview updated');
};

const resetTestMode = () => {
  console.log('[TemplateBuilder.resetTestMode] Resetting manual test data');
  previewStore.resetManualTestData();
  emit('reset-test-mode');
  ElMessage.success('Тестовые данные сброшены');
  updatePreviewData(); // Обновляем предпросмотр после сброса
  console.log('[TemplateBuilder.resetTestMode] Manual test data reset and preview updated');
};

const handleUpdateManualTestData = (rowIndex, colIndex, newValue) => {
  console.log('[TemplateBuilder.handleUpdateManualTestData] Updating manual data [' + rowIndex + '][' + colIndex + ']:', newValue);
  previewStore.updateManualTestData(rowIndex, colIndex, newValue);
  emit('update-manual-test-data', rowIndex, colIndex, newValue);
  updatePreviewData(); // Обновляем предпросмотр при изменении ручных данных
  console.log('[TemplateBuilder.handleUpdateManualTestData] Manual data updated and preview refreshed');
};

// === Загрузка данных справочников ===
const loadReferenceData = async (entityType) => {
  console.log('[TemplateBuilder.loadReferenceData] Loading reference data for:', entityType);

  if (!entityType) {
    console.log('[TemplateBuilder.loadReferenceData] No entity type provided');
    return;
  }

  if (loadingReference.value.has(entityType)) {
    console.log('[TemplateBuilder.loadReferenceData] Already loading, skipping:', entityType);
    return;
  }

  if (referenceData.value[entityType] && referenceData.value[entityType].length > 0) {
    console.log('[TemplateBuilder.loadReferenceData] Data already loaded, skipping:', entityType);
    return;
  }

  try {
    loadingReference.value.add(entityType);
    console.log('[TemplateBuilder.loadReferenceData] Added to loading set:', entityType);

    referenceData.value = {
      ...referenceData.value,
      [entityType]: []
    };

    console.log('[TemplateBuilder.loadReferenceData] Calling dataSource.getReferenceData for:', entityType);
    const data = await dataSource.getReferenceData(entityType);
    console.log('[TemplateBuilder.loadReferenceData] Received data for ' + entityType + ':', data?.length || 0, 'items');

    referenceData.value = {
      ...referenceData.value,
      [entityType]: Array.isArray(data) ? data : []
    };

    console.log('[TemplateBuilder.loadReferenceData] Cached data for:', entityType);
  } catch (error) {
    console.error('[TemplateBuilder.loadReferenceData] Error loading data for ' + entityType + ':', error);
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
    console.log('[TemplateBuilder.loadReferenceData] Removed from loading set:', entityType);
  }
};

// Новый метод для загрузки полей справочника
const loadReferenceFields = async (entityType) => {
  console.log('[TemplateBuilder.loadReferenceFields] Loading reference fields for:', entityType);

  if (!entityType) {
    console.log('[TemplateBuilder.loadReferenceFields] No entity type provided');
    return;
  }

  loadingReferenceFields.value = true;
  referenceError.value = null;

  try {
    console.log('[TemplateBuilder.loadReferenceFields] Calling getReferenceFields for:', entityType);
    const fields = await getReferenceFields(entityType);
    console.log('[TemplateBuilder.loadReferenceFields] Received fields for ' + entityType + ':', fields?.length || 0, 'items');

    referenceFields.value = Array.isArray(fields) ? fields : [];
    console.log('[TemplateBuilder.loadReferenceFields] Reference fields updated');
  } catch (err) {
    console.error('[TemplateBuilder.loadReferenceFields] Error loading fields for ' + entityType + ':', err);
    referenceError.value = err.message || 'Ошибка загрузки полей справочника';
    referenceFields.value = [];
  } finally {
    loadingReferenceFields.value = false;
    console.log('[TemplateBuilder.loadReferenceFields] Finished loading fields for:', entityType);
  }
};

// === Основные методы компонента ===
const saveTemplate = async () => {
  console.log('[TemplateBuilder.saveTemplate] Starting template save');

  if (!canSave.value) {
    console.log('[TemplateBuilder.saveTemplate] Validation failed');
    ElMessage.warning('Заполните название шаблона и добавьте хотя бы одну колонку');
    return;
  }

  saving.value = true;
  try {
    console.log('[TemplateBuilder.saveTemplate] Preparing template data');
    const templateData = {
      name: template.value.name.trim(),
      columns: template.value.columns.map((column, index) => ({
        id: column.id,
        tempId: column.tempId || column.id || generateTempId(),
        type: column.type,
        label: column.label?.trim() || `Колонка ${index + 1}`,
        order: index,
        options: column.type === 'select' ? (column.options || []).filter(opt => opt.trim() !== '') : undefined,
        data_type: column.type === 'text' ? (column.dataType || 'string') : undefined,
        unit: column.type === 'number' ? (column.unit || '') : undefined,
        reference: column.type === 'reference' ? {
          entity_type: column.reference?.entityType || '',
          display_format: column.reference?.displayFormat || ''
        } : undefined,
        boolean_settings: column.type === 'boolean' ? column.booleanSettings : undefined,
        date_format: (column.type === 'date' || column.type === 'datetime') ? (column.dateFormat || 'DD.MM.YYYY') : undefined
      }))
    };

    console.log('[TemplateBuilder.saveTemplate] Template data prepared:', templateData);

    let response;
    if (template.value.id) {
      console.log('[TemplateBuilder.saveTemplate] Updating existing template:', template.value.id);
      response = await templateService.update(template.value.id, templateData);
      console.log('[TemplateBuilder.saveTemplate] Update response received:', response);
    } else {
      console.log('[TemplateBuilder.saveTemplate] Creating new template');
      response = await templateService.create(templateData);
      console.log('[TemplateBuilder.saveTemplate] Create response received:', response);
    }

    // Обновляем локальное состояние
    template.value.id = response.id;
    template.value.name = response.name;
    template.value.columns = response.columns.map(col => ({
      ...col,
      tempId: col.id || col.tempId || generateTempId(),
      order: col.order !== undefined ? col.order : 0
    }));

    if (template.value.id && !props.template.id) {
      console.log('[TemplateBuilder.saveTemplate] Redirecting to edit page for new template:', response.id);
      router.push({ name: 'TemplateEdit', params: { id: response.id } });
    } else {
      console.log('[TemplateBuilder.saveTemplate] Showing success notification');
      ElNotification.success({
        title: 'Успех',
        message: template.value.id ? 'Шаблон успешно обновлён' : 'Шаблон успешно создан',
        type: 'success'
      });
    }
  } catch (error) {
    console.error('[TemplateBuilder.saveTemplate] Error saving template:', error);
    let errorMessage = 'Ошибка при сохранении шаблона';
    if (error.response?.data) {
      if (error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data.errors) {
        const firstErrorField = Object.keys(error.response.data.errors)[0];
        const firstErrorMessage = error.response.data.errors[firstErrorField][0];
        errorMessage = `${firstErrorField}: ${firstErrorMessage}`;
      }
    } else if (error.code === 'ERR_NETWORK') {
      errorMessage = 'Ошибка сети (CORS) при сохранении шаблона.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    ElMessage.error(errorMessage);
  } finally {
    saving.value = false;
    console.log('[TemplateBuilder.saveTemplate] Save operation completed');
  }
};

const resetForm = () => {
  console.log('[TemplateBuilder.resetForm] Confirming form reset');
  ElMessageBox.confirm('Вы уверены, что хотите сбросить форму?', 'Подтверждение', {
    confirmButtonText: 'Да, сбросить',
    cancelButtonText: 'Отмена',
    type: 'warning',
  }).then(() => {
    console.log('[TemplateBuilder.resetForm] Form reset confirmed');
    if (template.value.id) {
      console.log('[TemplateBuilder.resetForm] Would reload template (function not implemented)');
      ElMessage.info('Форма сброшена к сохранённому состоянию');
    } else {
      template.value = { id: null, name: '', columns: [] };
      selectedColumnIndex.value = null;
      previewRows.value = [];
      updatePreviewData();
      console.log('[TemplateBuilder.resetForm] Form cleared');
      ElMessage.info('Форма очищена');
    }
  }).catch(() => {
    console.log('[TemplateBuilder.resetForm] Form reset cancelled');
  });
};

const cancel = () => {
  console.log('[TemplateBuilder.cancel] Navigating to template list');
  router.push({ name: 'TemplateList' });
};

const selectColumn = (index) => {
  console.log('[TemplateBuilder.selectColumn] Selecting column at index:', index);

  if (index >= 0 && index < template.value.columns.length) {
    selectedColumnIndex.value = index;
    console.log('[TemplateBuilder.selectColumn] Column selected:', template.value.columns[index]);

    const column = selectedColumn.value;
    if (column && column.type === 'reference') {
      console.log('[TemplateBuilder.selectColumn] Handling reference column');
      column.reference = column.reference || { entityType: '', displayFormat: '' };
      const entityType = column.reference.entityType;

      if (entityType) {
        console.log('[TemplateBuilder.selectColumn] Reference entity type:', entityType);
        if (!referenceData.value[entityType] || referenceData.value[entityType].length === 0) {
          console.log('[TemplateBuilder.selectColumn] Loading reference data');
          loadReferenceData(entityType);
        }
        // Загружаем поля справочника при выборе колонки
        loadReferenceFields(entityType);
      }
    }
  } else {
    console.log('[TemplateBuilder.selectColumn] Invalid index or no columns, deselecting');
    selectedColumnIndex.value = null;
  }
};

const addColumn = (columnData) => {
  console.log('[TemplateBuilder.addColumn] Adding new column:', columnData);
  const newColumn = {
    ...columnData,
    tempId: generateTempId(),
    order: template.value.columns.length
  };
  template.value.columns.push(newColumn);
  emit('column-add', newColumn);
  console.log('[TemplateBuilder.addColumn] Column added, total columns:', template.value.columns.length);
};

const removeColumn = (index) => {
  console.log('[TemplateBuilder.removeColumn] Removing column at index:', index);
  const removedColumn = template.value.columns[index];
  template.value.columns.splice(index, 1);
  emit('column-remove', index);

  // Обновляем индекс выбранной колонки
  if (selectedColumnIndex.value === index) {
    selectedColumnIndex.value = template.value.columns.length > 0 ?
        Math.min(index, template.value.columns.length - 1) : null;
    console.log('[TemplateBuilder.removeColumn] Selected column index updated to:', selectedColumnIndex.value);
  }

  console.log('[TemplateBuilder.removeColumn] Column removed, total columns:', template.value.columns.length);
};

const updateColumn = (index, updatedColumn) => {
  console.log('[TemplateBuilder.updateColumn] Updating column at index ' + index + ':', updatedColumn);
  template.value.columns.splice(index, 1, updatedColumn);
  emit('column-update', index, updatedColumn);

  // Если тип колонки изменился на reference, загружаем данные
  if (updatedColumn.type === 'reference' && updatedColumn.reference?.entityType) {
    const entityType = updatedColumn.reference.entityType;
    console.log('[TemplateBuilder.updateColumn] Updated column is reference, loading data for:', entityType);
    if (!referenceData.value[entityType] || referenceData.value[entityType].length === 0) {
      loadReferenceData(entityType);
    }
    loadReferenceFields(entityType);
  }

  console.log('[TemplateBuilder.updateColumn] Column updated');
};

const handleColumnOrderUpdate = (newColumns) => {
  console.log('[TemplateBuilder.handleColumnOrderUpdate] Updating column order, new order:', newColumns.map(c => c.tempId));
  template.value.columns = newColumns;
  emit('column-order-update', newColumns);
  console.log('[TemplateBuilder.handleColumnOrderUpdate] Column order updated');
};

const addOption = (option) => {
  console.log('[TemplateBuilder.addOption] Adding option:', option);
  emit('option-add', option);
  console.log('[TemplateBuilder.addOption] Option added');
};

const removeOption = (index) => {
  console.log('[TemplateBuilder.removeOption] Removing option at index:', index);
  emit('option-remove', index);
  console.log('[TemplateBuilder.removeOption] Option removed');
};

const onReferenceTypeChange = (entityType) => {
  console.log('[TemplateBuilder.onReferenceTypeChange] Reference type changed to:', entityType);
  emit('reference-type-change', entityType);
  if (entityType) {
    console.log('[TemplateBuilder.onReferenceTypeChange] Loading data and fields for:', entityType);
    loadReferenceData(entityType);
    loadReferenceFields(entityType);
  }
  console.log('[TemplateBuilder.onReferenceTypeChange] Reference type change handled');
};

// === Генерация данных предпросмотра ===
const updatePreviewData = async () => {
  console.log('[TemplateBuilder.updatePreviewData] Starting preview data update');

  try {
    loading.value = true;
    error.value = null;

    const rows = [];
    const columns = template.value.columns;
    const testMode = previewStore.testMode;
    const manualTestData = previewStore.manualTestData;

    console.log('[TemplateBuilder.updatePreviewData] Generating data for', columns.length, 'columns in', testMode, 'mode');

    for (let i = 0; i < 10; i++) {
      const rowData = {};

      for (const [colIndex, column] of columns.entries()) {
        let exampleValue;

        // Логика в зависимости от режима тестирования
        if (testMode === 'manual' && manualTestData[i] && manualTestData[i][colIndex] !== undefined) {
          // Используем ручное значение из хранилища
          exampleValue = manualTestData[i][colIndex];
          console.log('[TemplateBuilder.updatePreviewData] Using manual data for [' + i + '][' + colIndex + ']:', exampleValue);
        } else {
          // Генерируем автоматическое значение
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
                  console.log('[TemplateBuilder.updatePreviewData] Loading reference data for column', colIndex, ':', column.reference.entityType);

                  // Проверяем MOCK_REFERENCE_DATA
                  if (MOCK_REFERENCE_DATA[column.reference.entityType]?.[i]) {
                    exampleValue = MOCK_REFERENCE_DATA[column.reference.entityType][i];
                    console.log('[TemplateBuilder.updatePreviewData] Using mock data for reference');
                  } else {
                    // Если моковых данных нет, пытаемся загрузить реальные данные
                    const referenceData = await dataSource.getReferenceData(column.reference.entityType);
                    console.log('[TemplateBuilder.updatePreviewData] Loaded', referenceData?.length || 0, 'reference items');

                    if (referenceData && referenceData.length > 0) {
                      const item = referenceData[i] || referenceData[0];
                      if (item) {
                        exampleValue = formatReferenceDisplay(item, column);
                        console.log('[TemplateBuilder.updatePreviewData] Formatted reference value:', exampleValue);
                      } else {
                        exampleValue = 'Нет данных';
                        console.log('[TemplateBuilder.updatePreviewData] No item found in reference data');
                      }
                    } else {
                      exampleValue = 'Нет данных в справочнике';
                      console.log('[TemplateBuilder.updatePreviewData] Empty reference data');
                    }
                  }
                } catch (error) {
                  console.error('[TemplateBuilder.updatePreviewData] Error loading reference ', error);
                  ElMessage.error(`Не удалось загрузить данные справочника "${column.reference.entityType}": ${error.message}`);
                }
              } else {
                exampleValue = 'Выберите справочник';
                console.log('[TemplateBuilder.updatePreviewData] No reference entity type specified');
              }
              break;
            default:
              exampleValue = column.type;
          }
        }

        rowData[column.tempId] = exampleValue;
        console.log('[TemplateBuilder.updatePreviewData] Set value for column', column.tempId, ':', exampleValue);
      }

      rows.push({ rowData, order: i });
    }

    previewRows.value = rows;
    emit('update-rows', rows);
    console.log('[TemplateBuilder.updatePreviewData] Preview data updated, total rows:', rows.length);
  } catch (err) {
    console.error('[TemplateBuilder.updatePreviewData] Error updating preview ', err);
    error.value = 'Ошибка загрузки данных предпросмотра: ' + (err.response?.data?.message || err.message);
    ElMessage.error(error.value);
  } finally {
    loading.value = false;
    console.log('[TemplateBuilder.updatePreviewData] Preview data update completed');
  }
};

const updateRows = (newRows) => {
  console.log('[TemplateBuilder.updateRows] Updating rows, new count:', newRows?.length || 0);
  previewRows.value = newRows;
  emit('update-rows', newRows);
  console.log('[TemplateBuilder.updateRows] Rows updated');
};

// === Lifecycle & Watchers ===
onMounted(async () => {
  console.log('[TemplateBuilder.onMounted] Component mounted');

  try {
    loadingReferenceTypes.value = true;
    console.log('[TemplateBuilder.onMounted] Loading reference types');

    const types = await dataSource.getReferenceTypes();
    console.log('[TemplateBuilder.onMounted] Reference types loaded:', types?.length || 0, 'items');

    entityTypes.value = Array.isArray(types) ? types.map(t => ({...t})) : [];
    console.log('[TemplateBuilder.onMounted] Entity types updated');

    columnWidths.value = new Array(template.value.columns.length).fill(120);
    console.log('[TemplateBuilder.onMounted] Column widths initialized');

    // Загружаем данные для справочных колонок
    template.value.columns.forEach((column, index) => {
      if (column.type === 'reference' && column.reference?.entityType) {
        console.log('[TemplateBuilder.onMounted] Loading reference data for column', index, ':', column.reference.entityType);
        loadReferenceData(column.reference.entityType);
      }
    });

    // Инициализируем предпросмотр
    console.log('[TemplateBuilder.onMounted] Initializing preview data');
    updatePreviewData();
  } catch (error) {
    console.error('[TemplateBuilder.onMounted] Error during mount:', error);
    ElMessage({
      message: 'Не удалось загрузить типы справочников',
      type: 'error'
    });
  } finally {
    loadingReferenceTypes.value = false;
    console.log('[TemplateBuilder.onMounted] Mount process completed');
  }
});

watch(() => template.value.columns, (newVal, oldVal) => {
  console.log('[TemplateBuilder.watch.columns] Columns changed from', oldVal?.length || 0, 'to', newVal?.length || 0);

  columnWidths.value = new Array(newVal.length).fill(120);
  console.log('[TemplateBuilder.watch.columns] Column widths updated');

  newVal.forEach((column, index) => {
    if (column.type === 'reference' && column.reference?.entityType) {
      if (!referenceData.value[column.reference.entityType] || referenceData.value[column.reference.entityType].length === 0) {
        console.log('[TemplateBuilder.watch.columns] Loading reference data for new column', index);
        loadReferenceData(column.reference.entityType);
      }
    }
  });

  // Обновляем предпросмотр при изменении колонок
  console.log('[TemplateBuilder.watch.columns] Updating preview data due to column change');
  updatePreviewData();
}, { deep: true });

watch(() => selectedColumnIndex.value, (newIndex, oldIndex) => {
  console.log('[TemplateBuilder.watch.selectedColumnIndex] Selected column index changed from', oldIndex, 'to', newIndex);
  selectedPreviewColumnIndex.value = newIndex;
});

watch(() => selectedRowIndex.value, (newIndex, oldIndex) => {
  console.log('[TemplateBuilder.watch.selectedRowIndex] Selected row index changed from', oldIndex, 'to', newIndex);
  selectedPreviewRowIndex.value = newIndex;
});

watch(() => previewStore.testMode, (newMode, oldMode) => {
  console.log('[TemplateBuilder.watch.testMode] Test mode changed from', oldMode, 'to', newMode);
  localTestMode.value = newMode;
  updatePreviewData(); // Обновляем предпросмотр при смене режима
});

// Дополнительное логирование для отладки
watch(() => template.value, (newVal, oldVal) => {
  console.log('[TemplateBuilder.watch.template] Template changed, name:', newVal.name, 'columns:', newVal.columns?.length || 0);
}, { deep: true });

watch(() => previewStore.manualTestData, (newVal, oldVal) => {
  console.log('[TemplateBuilder.watch.manualTestData] Manual test data changed, keys:', Object.keys(newVal || {}));
}, { deep: true });

console.log('[TemplateBuilder] Component setup completed');
</script>

<style lang="scss" scoped>
.template-builder {
  padding: 10px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-top: 2px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .builder-content {
    flex: 1;
    display: flex;
    gap: 15px;
    min-height: 0;

    @media (max-width: 992px) {
      flex-direction: column;
    }

    .column-list-section {
      flex: 1;
      min-width: 0;
    }

    .column-settings-section {
      flex: 2;
      min-width: 0;
    }
  }

  .preview-section {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
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
