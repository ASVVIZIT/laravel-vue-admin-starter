<!-- resources/js/components/DynamicTable/TemplateBuilder.vue -->
<template>
  <div class="template-builder">
    <!-- Заголовок -->
    <div class="builder-header">
      <h2>{{ template.id ? `Редактирование шаблона: ${template.name}` : 'Создание нового шаблона' }}</h2>
      <div class="builder-actions">
        <el-button type="primary" @click="saveTemplate" :loading="saving" :disabled="!canSave">
          <el-icon v-if="saving"><Loading /></el-icon>
          <span v-else><el-icon><Edit /></el-icon>{{ template.id ? 'Обновить шаблон' : 'Создать шаблон' }}</span>
        </el-button>
        <el-button @click="resetForm">
          <el-icon><Refresh /></el-icon>Сбросить
        </el-button>
        <el-button @click="updatePreviewData">
          <el-icon><Refresh /></el-icon>Обновить предпросмотр
        </el-button>
        <el-button @click="cancel">
          <el-icon><Close /></el-icon>Отмена
        </el-button>
      </div>
    </div>

    <!-- Форма шаблона -->
    <div class="form-section">
      <el-form :model="template" :rules="rules" ref="templateForm" label-position="top">
        <el-form-item label="Название шаблона" prop="name">
          <el-input v-model="template.name" placeholder="Введите название шаблона" />
        </el-form-item>
      </el-form>
    </div>

    <!-- Блок предварительного просмотра -->
    <div class="preview-section">
      <h3>Предварительный просмотр</h3>
      <div class="table-preview-container" ref="previewTableContainerRef">
        <div v-if="template.columns.length === 0" class="preview-empty">
          <el-empty description="Нет колонок для отображения" :image-size="60" />
        </div>
        <table v-else class="preview-table" ref="previewTableRef">
          <thead>
          <tr>
            <th class="sort-handle">#</th>
            <th
                v-for="(column, index) in sortedTemplateColumns"
                :key="column.tempId"
                class="preview-th"
                :class="{
                  'active': selectedPreviewColumnIndex === index
                }"
                @click="selectPreviewColumn(index)"
                :style="{ width: columnWidths[index] ? `${columnWidths[index]}px` : 'auto' }"
            >
              {{ column.label }}
            </th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(row, rowIndex) in previewRows" :key="rowIndex">
            <td class="sort-handle">{{ rowIndex + 1 }}</td>
            <td
                v-for="(column, colIndex) in sortedTemplateColumns"
                :key="colIndex"
                class="preview-td"
                :class="{
                  'active': selectedPreviewColumnIndex === colIndex,
                  'loading-reference': isReferenceLoading(column)
                }"
                :style="{ width: columnWidths[colIndex] ? `${columnWidths[colIndex]}px` : 'auto' }"
            >
              <!-- Используем реальный компонент ячейки для предпросмотра -->
              <TableCell
                  :column="column"
                  :row-data="row"
                  :value="row.rowData[column.tempId]"
                  :is-editing="isCellEditing(rowIndex, colIndex)"
                  :edit-value="getEditValue(rowIndex, colIndex)"
                  @start-edit="startEditingCell(rowIndex, colIndex, $event)"
                  @stop-edit="stopEditingCell"
                  @update-value="updatePreviewCellValue"
                  :reference-data="getReferenceDataForColumn(column)"
              />
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Основной контент: Список колонок и Панель настроек -->
    <div class="builder-content">
      <!-- Список колонок -->
      <div class="columns-section">
        <div class="section-header">
          <h3>Колонки шаблона</h3>
          <div class="column-creation">
            <el-select
                v-model="newColumnType"
                placeholder="Тип колонки"
                clearable
                style="width: 150px; margin-right: 10px;"
            >
              <el-option
                  v-for="type in columnTypes"
                  :key="type.value"
                  :label="type.label"
                  :value="type.value"
              />
            </el-select>
            <el-button type="success" @click="addColumn">
              <el-icon><Plus /></el-icon>
              Добавить колонку
            </el-button>
          </div>
        </div>

        <el-alert
            v-if="template.columns.length === 0"
            type="info"
            :closable="false"
            style="margin-bottom: 10px;"
        >
          Добавьте хотя бы одну колонку для создания шаблона
        </el-alert>

        <div class="columns-table-container" ref="columnsListRef">
          <draggable
              v-model="template.columns"
              item-key="tempId"
              tag="div"
              class="columns-table"
              :animation="200"
              ghost-class="drag-ghost"
              chosen-class="drag-chosen"
              drag-class="drag-class"
              @end="dragEnd"
              handle=".sort-handle"
              :scroll-sensitivity="100"
              :scroll-speed="10"
              :force-fallback="true"
              :fallback-tolerance="5"
              :fallback-on-body="true"
              ref="columnsDraggableRef"
          >
            <template #item="{ element, index }">
              <div
                  class="column-row"
                  :class="{
                    'active': selectedColumnIndex === index,
                    'drag-over-top': dragOverIndex === index && dragDirection === 'top',
                    'drag-over-bottom': dragOverIndex === index && dragDirection === 'bottom'
                  }"
                  @click="selectColumn(index)"
                  @dragover="listDragOver($event, index)"
                  @dragenter="listDragEnter($event, index)"
                  @dragleave="listDragLeave"
                  @drop="listDrop($event, index)"
                  draggable="true"
                  @dragstart="listDragStart($event, index)"
                  @dragend="listDragEnd"
              >
                <div class="sort-handle">
                  <el-icon><Rank /></el-icon>
                </div>

                <div class="column-name" @dblclick="startInlineEdit(index)">
                  <div class="name-header">
                    <div v-if="isEditingColumn(index)" class="inline-edit">
                      <el-input
                          ref="inlineEditInputRef"
                          v-model="editingColumnValue"
                          @blur="saveInlineEdit"
                          @keyup.enter="saveInlineEdit"
                          @keyup.esc="cancelInlineEdit"
                          @click.stop
                          size="small"
                      />
                    </div>
                    <div v-else class="name-display">
                      <span class="name-text">{{ element.label || 'Без названия' }}</span>
                      <el-icon class="edit-icon" @click.stop="startInlineEdit(index)">
                        <Edit />
                      </el-icon>
                    </div>

                    <el-tag size="small" type="info" class="column-type">
                      {{ getColumnTypeName(element.type) }}
                    </el-tag>
                  </div>
                </div>

                <div class="column-actions">
                  <el-button
                      size="small"
                      type="primary"
                      circle
                      @click.stop="selectColumn(index)"
                      title="Настройки"
                  >
                    <el-icon><Setting /></el-icon>
                  </el-button>
                  <el-button
                      size="small"
                      type="danger"
                      circle
                      @click.stop="removeColumn(index)"
                      title="Удалить"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </template>
          </draggable>
        </div>
      </div>

      <!-- Панель настроек колонки -->
      <div class="column-settings-panel">
        <div v-if="selectedColumn" class="column-settings">
          <h4>
            <el-icon><Setting /></el-icon>
            Настройки колонки: {{ selectedColumn.label }}
          </h4>

          <el-form label-position="top" class="settings-form" size="small">
            <el-form-item label="Тип колонки">
              <el-select
                  v-model="selectedColumn.type"
                  @change="onColumnTypeChange"
                  placeholder="Выберите тип колонки"
              >
                <el-option
                    v-for="type in columnTypes"
                    :key="type.value"
                    :label="type.label"
                    :value="type.value"
                />
              </el-select>
            </el-form-item>

            <!-- Текстовые настройки -->
            <div v-if="selectedColumn.type === 'text'" class="text-settings">
              <el-form-item label="Тип данных">
                <el-select
                    v-model="selectedColumn.dataType"
                    placeholder="Выберите тип данных"
                >
                  <el-option
                      v-for="dataType in textDataTypes"
                      :key="dataType.value"
                      :label="dataType.label"
                      :value="dataType.value"
                  />
                </el-select>
              </el-form-item>
            </div>

            <!-- Числовые настройки -->
            <div v-if="selectedColumn.type === 'number'" class="number-settings">
              <el-form-item label="Единица измерения">
                <el-input
                    v-model="selectedColumn.unit"
                    placeholder="Введите единицу измерения (кг, см, шт и т.д.)"
                />
              </el-form-item>
            </div>

            <!-- Настройки выбора -->
            <div v-if="selectedColumn.type === 'select'" class="select-settings">
              <el-form-item label="Варианты выбора">
                <div class="options-list">
                  <draggable
                      v-model="selectedColumn.options"
                      item-key="index"
                      tag="div"
                      class="draggable-options-list"
                      :animation="200"
                      ghost-class="drag-ghost"
                      chosen-class="drag-chosen"
                      drag-class="drag-class"
                      @end="updatePreviewData"
                      handle=".option-handle"
                  >
                    <template #item="{ element, index }">
                      <div class="option-item">
                        <div class="option-handle">
                          <el-icon><Rank /></el-icon>
                        </div>
                        <el-input
                            v-model="selectedColumn.options[index]"
                            @blur="updatePreviewData"
                            size="small"
                        />
                        <el-button
                            type="danger"
                            size="small"
                            circle
                            @click="removeOption(index)"
                        >
                          <el-icon><Delete /></el-icon>
                        </el-button>
                      </div>
                    </template>
                  </draggable>

                  <el-button
                      type="primary"
                      size="small"
                      @click="addOption"
                      class="add-option-btn"
                  >
                    <el-icon><Plus /></el-icon>
                    Добавить вариант
                  </el-button>
                </div>
              </el-form-item>
            </div>

            <!-- Настройки даты -->
            <div v-if="selectedColumn.type === 'date' || selectedColumn.type === 'datetime'" class="date-settings">
              <el-form-item label="Формат даты">
                <el-select
                    v-model="selectedColumn.dateFormat"
                    placeholder="Выберите формат даты"
                    @change="updatePreviewData"
                >
                  <el-option
                      v-for="format in dateFormats"
                      :key="format.value"
                      :label="`${format.label} (${format.example})`"
                      :value="format.value"
                  />
                </el-select>
              </el-form-item>
            </div>

            <!-- Настройки булева значения -->
            <div v-if="selectedColumn.type === 'boolean'" class="boolean-settings">
              <el-form-item label="Тип отображения">
                <el-radio-group
                    v-model="selectedColumn.booleanSettings.displayType"
                    @change="onBooleanDisplayTypeChange"
                >
                  <el-radio label="toggle" size="small">Переключатель</el-radio>
                  <el-radio label="checkbox" size="small">Чекбокс</el-radio>
                  <el-radio label="text" size="small">Текст</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item
                  label="Подписи"
                  v-if="selectedColumn.booleanSettings.displayType === 'text'"
              >
                <div class="boolean-text-settings">
                  <div class="text-input">
                    <span>Да:</span>
                    <el-input
                        v-model="selectedColumn.booleanSettings.trueLabel"
                        @input="updatePreviewData"
                        size="small"
                        placeholder="Да"
                    />
                  </div>
                  <div class="text-input">
                    <span>Нет:</span>
                    <el-input
                        v-model="selectedColumn.booleanSettings.falseLabel"
                        @input="updatePreviewData"
                        size="small"
                        placeholder="Нет"
                    />
                  </div>
                </div>
              </el-form-item>
            </div>

            <!-- Настройки справочника -->
            <div v-if="selectedColumn.type === 'reference'" class="reference-settings">
              <el-form-item label="Тип справочника">
                <el-select
                    v-model="selectedColumn.reference.entityType"
                    @change="onReferenceTypeChange"
                    placeholder="Выберите тип справочника"
                    :loading="loadingReferenceTypes"
                >
                  <el-option
                      v-for="entity in entityTypes"
                      :key="entity.value"
                      :label="entity.label"
                      :value="entity.value"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="Формат отображения">
                <div class="format-input">
                  <el-input
                      v-model="selectedColumn.reference.displayFormat"
                      placeholder="Введите формат отображения (например, {name} ({country}))"
                      @input="updatePreviewData"
                  />
                  <div class="format-hint">
                    Доступные поля:
                    <span v-if="!selectedColumn.reference.entityType">Выберите тип справочника</span>
                    <span v-else-if="loadingReferenceFields && !referenceFields[selectedColumn.reference.entityType]">
                      <el-icon class="is-loading"><Loading /></el-icon> Загрузка...
                    </span>
                    <span v-else-if="referenceFieldLoadError">
                      <el-icon><Warning /></el-icon> {{ referenceFieldLoadError }}
                    </span>
                    <draggable
                        v-else-if="selectedColumn.reference.entityType && referenceFields[selectedColumn.reference.entityType]"
                        :list="referenceFields[selectedColumn.reference.entityType]"
                        item-key="key"
                        group="{ name: 'referenceFields', pull: 'clone', put: false }"
                        :sort="false"
                        :clone="cloneReferenceField"
                        ghost-class="ghost"
                        chosen-class="chosen"
                        drag-class="drag"
                        :force-fallback="true"
                        tag="span"
                        style="display: inline;"
                    >
                      <template #item="{ element }">
                        <span
                            class="format-key"
                            draggable="true"
                            @dragstart="dragStartKey($event, element.key)"
                            :title="`Перетащите {${element.key}} в поле формата`"
                        >
                          {{ element.key }}
                        </span>
                      </template>
                    </draggable>
                    <span v-else-if="selectedColumn.reference.entityType && !referenceFields[selectedColumn.reference.entityType]">
                        Нет доступных полей (ошибка загрузки?)
                    </span>
                    <span v-else>Выберите тип справочника</span>
                  </div>
                </div>
              </el-form-item>

              <el-form-item label="Пример отображения">
                <div class="reference-preview">
                  {{ getFormattedReferencePreview }}
                </div>
              </el-form-item>
            </div>
          </el-form>
        </div>

        <div v-else class="column-settings-placeholder">
          <el-empty description="Выберите колонку для настройки" :image-size="60" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus';
import {
  Loading,
  Edit,
  Close,
  Refresh,
  Rank,
  Plus,
  Delete,
  Setting,
  Warning
} from '@element-plus/icons-vue';
import draggable from 'vuedraggable';
import TableCell from './TableCell.vue';
import { templateService } from './services/templateService';
import { referenceService } from './services/referenceService';
import { MOCK_REFERENCE_DATA } from './services/mockData';
import { formatReferenceDisplay } from './utils/referenceUtils';

// === Определения типов и данных ===
const columnTypes = [
  { value: 'text', label: 'Текст' },
  { value: 'number', label: 'Число' },
  { value: 'select', label: 'Выбор' },
  { value: 'date', label: 'Дата' },
  { value: 'datetime', label: 'Дата и время' },
  { value: 'boolean', label: 'Да/Нет' },
  { value: 'reference', label: 'Справочник' },
];

const textDataTypes = [
  { value: 'string', label: 'Строка' },
  { value: 'email', label: 'Email' },
  { value: 'url', label: 'URL' },
];

const dateFormats = [
  { value: 'YYYY-MM-DD', label: 'ГГГГ-ММ-ДД', example: '2023-10-27' },
  { value: 'DD.MM.YYYY', label: 'ДД.ММ.ГГГГ', example: '27.10.2023' },
  { value: 'MM/DD/YYYY', label: 'ММ/ДД/ГГГГ', example: '10/27/2023' },
  { value: 'DD MMM YYYY', label: 'ДД МММ ГГГГ', example: '27 Oct 2023' },
  { value: 'YYYY-MM-DD HH:mm', label: 'ГГГГ-ММ-ДД ЧЧ:мм', example: '2023-10-27 14:30' },
  { value: 'DD.MM.YYYY HH:mm', label: 'ДД.ММ.ГГГГ ЧЧ:мм', example: '27.10.2023 14:30' },
];

// === Состояния ===
const route = useRoute();
const router = useRouter();
const templateForm = ref(null);
const template = ref({
  id: null,
  name: '',
  columns: [],
});
const selectedColumnIndex = ref(null);
const selectedPreviewColumnIndex = ref(null);
const selectedColumn = computed(() => {
  if (selectedColumnIndex.value === null || !template.value.columns) return null;
  return template.value.columns[selectedColumnIndex.value];
});

const saving = ref(false);
// === Состояния для работы со справочниками ===
const loadingReferenceTypes = ref(false);
const entityTypes = ref([]);
const referenceFields = ref({}); // { entityType: [fields...] }
const loadingReferenceFields = ref(false);
const referenceFieldLoadError = ref('');

const newColumnType = ref('text');
const rules = {
  name: [
    { required: true, message: 'Пожалуйста, введите название шаблона', trigger: 'blur' },
    { min: 3, max: 100, message: 'Название должно быть от 3 до 100 символов', trigger: 'blur' }
  ]
};

// --- Inline Edit ---
const isEditingColumnName = ref(false);
const editingColumnIndex = ref(null);
const editingColumnValue = ref('');
const inlineEditInputRef = ref(null);

// --- Preview Data ---
// previewRows теперь массив объектов { rowData, order }
const previewRows = ref([]);
const previewData = ref({});
const columnWidths = ref([]);

// --- Cell Editing ---
const editingCell = ref({ rowIndex: null, colIndex: null, value: null });

// --- Drag & Drop состояния ---
const currentDragIndex = ref(null);
const dragOverIndex = ref(null);
const dragDirection = ref(null);

// --- Refs ---
const columnsListRef = ref(null);
const previewTableContainerRef = ref(null);
const previewTableRef = ref(null);
const columnsDraggableRef = ref(null);

// === Вычисляемые свойства ===
const canSave = computed(() => {
  return template.value.name.trim() !== '' && template.value.columns.length > 0;
});

// Сортировка колонок по order перед отображением в превью
const sortedTemplateColumns = computed(() => {
  return [...template.value.columns].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
});

// === Методы ===

// --- Инициализация ---
const loadTemplate = async () => {
  const templateId = route.params.id;
  if (!templateId) return;

  try {
    const response = await templateService.get(templateId);
    template.value = {
      ...response,
      columns: response.columns.map(col => ({
        ...col,
        tempId: col.tempId || col.id || Date.now() + Math.random(),
        booleanSettings: col.type === 'boolean' ? (col.booleanSettings || {
          displayType: 'toggle',
          trueLabel: 'Да',
          falseLabel: 'Нет'
        }) : undefined,
        reference: col.type === 'reference' ? (col.reference || {
          entityType: '',
          displayFormat: ''
        }) : undefined,
        options: col.options || [],
        dataType: col.dataType || 'string',
        unit: col.unit || '',
        dateFormat: col.dateFormat || 'DD.MM.YYYY'
      }))
    };
    if (template.value.columns.length > 0) {
      selectColumn(0);
    }
    updatePreviewData();
    ElMessage.success('Шаблон загружен');
  } catch (error) {
    let errorMessage = 'Не удалось загрузить шаблон';
    if (error.response?.status === 404) {
      errorMessage = 'Шаблон не найден';
      router.push({ name: 'TemplateList' });
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.code === 'ERR_NETWORK') {
      errorMessage = 'Ошибка сети: Проверьте подключение или настройки CORS сервера.';
    }
    ElMessage.error(errorMessage);
  }
};

const loadEntityTypes = async () => {
  loadingReferenceTypes.value = true;
  try {
    const typesResponse = await referenceService.getTypes();
    entityTypes.value = typesResponse.data?.map(type => ({
      value: type.value || type.name,
      label: type.label || type.name,
      description: type.description
    })) || [];
  } catch (error) {
    let errorMessage = 'Не удалось загрузить типы справочников';
    if (error.code === 'ERR_NETWORK') {
      errorMessage = 'Ошибка сети (CORS) при загрузке типов справочников.';
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    ElMessage.error(errorMessage);
    entityTypes.value = [];
  } finally {
    loadingReferenceTypes.value = false;
  }
};

const generateTempId = () => {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// --- Работа с колонками ---
const addColumn = () => {
  const type = newColumnType.value || 'text';
  const newColumn = {
    tempId: generateTempId(),
    type: type,
    label: `Колонка ${template.value.columns.length + 1}`,
    order: template.value.columns.length,
    options: [],
    dataType: 'string',
    unit: '',
    reference: type === 'reference' ? {
      entityType: '',
      displayFormat: ''
    } : null,
    booleanSettings: type === 'boolean' ? {
      displayType: 'toggle',
      trueLabel: 'Да',
      falseLabel: 'Нет'
    } : null,
    dateFormat: type === 'date' ? 'DD.MM.YYYY' : (type === 'datetime' ? 'DD.MM.YYYY HH:mm' : 'DD.MM.YYYY')
  };
  template.value.columns.push(newColumn);
  selectColumn(template.value.columns.length - 1);
  updatePreviewData();
  newColumnType.value = 'text';
};

const removeColumn = (index) => {
  ElMessageBox.confirm('Вы уверены, что хотите удалить эту колонку?', 'Подтверждение', {
    confirmButtonText: 'Да',
    cancelButtonText: 'Отмена',
    type: 'warning',
  }).then(() => {
    const removedColumn = template.value.columns.splice(index, 1)[0];
    template.value.columns.forEach((col, i) => {
      col.order = i;
    });
    if (selectedColumnIndex.value >= template.value.columns.length) {
      selectedColumnIndex.value = template.value.columns.length > 0 ? template.value.columns.length - 1 : null;
    } else if (selectedColumnIndex.value === index) {
      selectedColumnIndex.value = template.value.columns.length > 0 ? Math.min(index, template.value.columns.length - 1) : null;
    }
    if (selectedPreviewColumnIndex.value >= template.value.columns.length) {
      selectedPreviewColumnIndex.value = template.value.columns.length > 0 ? template.value.columns.length - 1 : null;
    } else if (selectedPreviewColumnIndex.value === index) {
      selectedPreviewColumnIndex.value = template.value.columns.length > 0 ? Math.min(index, template.value.columns.length - 1) : null;
    }
    updatePreviewData();
    ElMessage.success(`Колонка "${removedColumn.label}" удалена`);
  });
};

const selectColumn = (index) => {
  selectedColumnIndex.value = index;
  selectedPreviewColumnIndex.value = index;
  const column = selectedColumn.value;

  if (column && column.type === 'reference') {
    column.reference = column.reference || { entityType: '', displayFormat: '' };
    const entityType = column.reference.entityType;

    if (entityType && (!referenceFields.value[entityType] || referenceFields.value[entityType].length === 0)) {
      loadReferenceFields(entityType);
    }
  }
};

const selectPreviewColumn = (index) => {
  selectColumn(index);
};

const getColumnTypeName = (type) => {
  const found = columnTypes.find(t => t.value === type);
  return found ? found.label : type;
};

// --- Inline Edit ---
const startInlineEdit = (index) => {
  isEditingColumnName.value = true;
  editingColumnIndex.value = index;
  editingColumnValue.value = template.value.columns[index].label || '';
  nextTick(() => {
    if (inlineEditInputRef.value && inlineEditInputRef.value.focus) {
      inlineEditInputRef.value.focus();
    }
  });
};

const saveInlineEdit = () => {
  if (editingColumnIndex.value !== null && editingColumnValue.value.trim() !== '') {
    template.value.columns[editingColumnIndex.value].label = editingColumnValue.value.trim();
    updatePreviewData();
  }
  cancelInlineEdit();
};

const cancelInlineEdit = () => {
  isEditingColumnName.value = false;
  editingColumnIndex.value = null;
  editingColumnValue.value = '';
};

const isEditingColumn = (index) => {
  return isEditingColumnName.value && editingColumnIndex.value === index;
};

// --- Настройки типа колонки ---
const onColumnTypeChange = async () => {
  if (!selectedColumn.value) return;

  if (selectedColumn.value.type === 'reference') {
    return;
  }

  switch (selectedColumn.value.type) {
    case 'reference':
      if (!selectedColumn.value.reference) {
        selectedColumn.value.reference = {
          entityType: '',
          displayFormat: ''
        };
      }
      break;
    case 'boolean':
      selectedColumn.value.booleanSettings = selectedColumn.value.booleanSettings || {
        displayType: 'toggle',
        trueLabel: 'Да',
        falseLabel: 'Нет'
      };
      break;
    case 'date':
      selectedColumn.value.dateFormat = selectedColumn.value.dateFormat || 'DD.MM.YYYY';
      break;
    case 'datetime':
      selectedColumn.value.dateFormat = selectedColumn.value.dateFormat || 'DD.MM.YYYY HH:mm';
      break;
    default:
      break;
  }
  updatePreviewData();
};

// --- Работа со справочниками ---
const onReferenceTypeChange = async (newEntityType) => {
  if (selectedColumn.value && selectedColumn.value.type === 'reference') {
    selectedColumn.value.reference = selectedColumn.value.reference || { entityType: '', displayFormat: '' };
    const oldEntityType = selectedColumn.value.reference.entityType;
    selectedColumn.value.reference.entityType = newEntityType;

    if (oldEntityType !== newEntityType || !selectedColumn.value.reference.displayFormat) {
      selectedColumn.value.reference.displayFormat = getExampleFormat(newEntityType);
    }

    if (newEntityType) {
      await loadReferenceFields(newEntityType);
    }

    updatePreviewData();
  }
};

const getExampleFormat = (entityType) => {
  switch(entityType) {
    case 'accessory': return '{name} ({model})';
    case 'brand': return '{name} ({country})';
    default: return '{id} - {name}';
  }
};

const loadReferenceFields = async (entityType) => {
  if (!entityType) {
    return;
  }

  if (referenceFields.value[entityType] && referenceFields.value[entityType].length > 0) {
    return;
  }

  loadingReferenceFields.value = true;
  referenceFieldLoadError.value = '';

  try {
    const fieldInfoRaw = await referenceService.getFieldInfo(entityType);

    if (!fieldInfoRaw || !fieldInfoRaw.data || !Array.isArray(fieldInfoRaw.data.availableKeys)) {
      throw new Error(`Invalid response structure from referenceService.getFieldInfo for ${entityType}.`);
    }

    const fieldInfoData = fieldInfoRaw.data;
    let fieldsToStore = [];
    if (Array.isArray(fieldInfoRaw.data.availableKeys) && fieldInfoRaw.data.availableKeys.length > 0) {
      fieldsToStore = fieldInfoRaw.data.availableKeys.map(key => ({
        key: key,
        label: key,
        type: 'string'
      }));
    }

    referenceFields.value[entityType] = fieldsToStore;

    if (selectedColumn.value &&
        selectedColumn.value.type === 'reference' &&
        selectedColumn.value.reference?.entityType === entityType) {

      if (!selectedColumn.value.reference.displayFormat || selectedColumn.value.reference.displayFormat.trim() === '') {
        let formatToSet = fieldInfoData.defaultDisplayFormat;
        if (!formatToSet) {
          formatToSet = getExampleFormat(entityType);
        }
        selectedColumn.value.reference.displayFormat = formatToSet;
        updatePreviewData();
      }
    }
  } catch (error) {
    let errorMessage = 'Unknown error';
    if (error.code === 'ERR_NETWORK') {
      errorMessage = 'Ошибка сети (CORS) при загрузке полей справочника.';
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    referenceFieldLoadError.value = errorMessage;
    ElMessage.error(`Ошибка загрузки полей справочника "${entityType}": ${errorMessage}`);
    referenceFields.value[entityType] = [];
  } finally {
    loadingReferenceFields.value = false;
  }
};

const cloneReferenceField = (field) => {
  return `{${field.key}}`;
};

const dragStartKey = (event, key) => {
  event.dataTransfer.setData('text/plain', `{${key}}`);
};

// --- Работа с опциями выбора ---
const addOption = () => {
  if (!selectedColumn.value || selectedColumn.value.type !== 'select') return;
  selectedColumn.value.options = selectedColumn.value.options || [];
  const newOption = `Вариант ${selectedColumn.value.options.length + 1}`;
  selectedColumn.value.options.push(newOption);
  updatePreviewData();
  ElMessage.success(`Опция "${newOption}" добавлена`);
};

const removeOption = (index) => {
  if (!selectedColumn.value || selectedColumn.value.type !== 'select' || !selectedColumn.value.options) return;
  const removedOption = selectedColumn.value.options.splice(index, 1)[0];
  updatePreviewData();
  ElMessage.success(`Опция "${removedOption}" удалена`);
};

// --- Предпросмотр ---
const updatePreviewData = () => {
  const newPreviewRows = [];
  const newPreviewData = {};
  // Создаем 10 строк для предпросмотра
  for (let i = 0; i < 10; i++) {
    const rowData = {};
    template.value.columns.forEach(column => {
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
          const entityType = column.reference?.entityType;
          if (entityType && MOCK_REFERENCE_DATA[entityType]?.[i]) {
            exampleValue = MOCK_REFERENCE_DATA[entityType][i];
          } else {
            exampleValue = MOCK_REFERENCE_DATA[entityType]?.[i] || { id: i+1, name: `Пример ${i+1}` };
          }
          break;
        default:
          exampleValue = column.type;
      }
      rowData[column.tempId] = exampleValue;
      newPreviewData[column.tempId] = exampleValue;
    });
    newPreviewRows.push({ rowData, order: i });
  }
  previewData.value = newPreviewData;
  previewRows.value = newPreviewRows;
  calculateColumnWidths();
};

const calculateColumnWidths = () => {
  const widths = [];
  sortedTemplateColumns.value.forEach(() => {
    widths.push(150);
  });
  columnWidths.value = widths;
};

// === ИСПРАВЛЕНИЕ: Вычисляемое свойство для отформатированного предпросмотра справочника ===
const getFormattedReferencePreview = computed(() => {
  if (!selectedColumn.value || selectedColumn.value.type !== 'reference' || !selectedColumn.value.reference) {
    return '';
  }
  const item = previewData.value[selectedColumn.value.tempId];
  if (!item || !selectedColumn.value.reference.displayFormat) return '...';
  try {
    return formatReferenceDisplay(item, selectedColumn.value);
  } catch (e) {
    return 'Ошибка формата';
  }
});

// === ИСПРАВЛЕНИЕ: Получение данных справочника для колонки ===
const getReferenceDataForColumn = (column) => {
  if (column.type !== 'reference' || !column.reference?.entityType) return [];
  return MOCK_REFERENCE_DATA[column.reference.entityType] || [];
};

// === ИСПРАВЛЕНИЕ: Проверка состояния загрузки справочника ===
const isReferenceLoading = (column) => {
  if (column.type !== 'reference' || !column.reference?.entityType) return false;
  return loadingReferenceFields.value && !referenceFields.value[column.reference.entityType];
};

// --- Cell Editing ---
const isCellEditing = (rowIndex, colIndex) => {
  return editingCell.value.rowIndex === rowIndex && editingCell.value.colIndex === colIndex;
};

const getEditValue = (rowIndex, colIndex) => {
  return editingCell.value.value;
};

const startEditingCell = (rowIndex, colIndex, value) => {
  editingCell.value = { rowIndex, colIndex, value };
};

const stopEditingCell = () => {
  editingCell.value = { rowIndex: null, colIndex: null, value: null };
};

const updatePreviewCellValue = (value) => {
  stopEditingCell();
};

// --- Drag & Drop ---
const dragEnd = () => {
  currentDragIndex.value = null;
  dragOverIndex.value = null;
  dragDirection.value = null;
  template.value.columns.forEach((col, index) => {
    col.order = index;
  });
  updatePreviewData();
};

// --- DnD в списке колонок ---
const listDragStart = (event, index) => {
  currentDragIndex.value = index;
  document.body.classList.add('template-builder-dragging-in-progress');
  event.dataTransfer.setData('text/plain', `column:${index}`);
  event.dataTransfer.effectAllowed = 'move';
};

const listDragEnd = () => {
  document.body.classList.remove('template-builder-dragging-in-progress');
};

const listDragOver = (event, index) => {
  event.preventDefault();
  const rect = event.currentTarget.getBoundingClientRect();
  const y = event.clientY - rect.top;
  const threshold = rect.height * 0.3;

  dragOverIndex.value = index;
  dragDirection.value = y < threshold ? 'top' : (y > (rect.height - threshold) ? 'bottom' : null);
};

const listDragEnter = (event, index) => {
  const targetRow = event.target.closest('.column-row');
  if (!targetRow) return;
  listDragOver(event, index);
};

const listDragLeave = () => {
  dragOverIndex.value = null;
  dragDirection.value = null;
};

const listDrop = (event, index) => {
  event.preventDefault();
  const draggedIndex = currentDragIndex.value;
  if (draggedIndex === null || draggedIndex === index) {
    return;
  }

  let targetIndex = index;
  if (dragDirection.value === 'bottom' && index >= draggedIndex) {
    targetIndex += 1;
  }
  if (dragDirection.value === 'top' && index > draggedIndex) {
    targetIndex -= 1;
  }

  const newColumns = [...template.value.columns];
  const [movedItem] = newColumns.splice(draggedIndex, 1);
  const adjustedTargetIndex = targetIndex > draggedIndex ? targetIndex - 1 : targetIndex;
  newColumns.splice(adjustedTargetIndex, 0, movedItem);
  template.value.columns = newColumns.map((col, idx) => ({ ...col, order: idx }));
};

// --- Сохранение и управление формой ---
const saveTemplate = async () => {
  if (!canSave.value) {
    ElMessage.warning('Заполните название шаблона и добавьте хотя бы одну колонку');
    return;
  }

  saving.value = true;
  try {
    await templateForm.value.validate();

    const templateData = {
      name: template.value.name.trim(),
      columns: template.value.columns.map((column, index) => ({
        id: column.id,
        tempId: column.tempId,
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

    let response;
    if (template.value.id) {
      response = await templateService.update(template.value.id, templateData);
      ElNotification.success({
        title: 'Успех',
        message: 'Шаблон успешно обновлён',
        type: 'success'
      });
    } else {
      response = await templateService.create(templateData);
      ElNotification.success({
        title: 'Успех',
        message: 'Шаблон успешно создан',
        type: 'success'
      });
      router.push({ name: 'TemplateEdit', params: { id: response.id } });
      return;
    }

    template.value.id = response.id;
    template.value.name = response.name;
    template.value.columns = response.columns.map(col => ({
      ...col,
      tempId: col.id || col.tempId || generateTempId()
    }));

    updatePreviewData();
  } catch (error) {
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
      errorMessage = 'Ошибка сети: Проверьте подключение или настройки CORS сервера.';
    }
    ElMessage.error(errorMessage);
  } finally {
    saving.value = false;
  }
};

const resetForm = () => {
  ElMessageBox.confirm('Вы уверены, что хотите сбросить форму?', 'Подтверждение', {
    confirmButtonText: 'Да, сбросить',
    cancelButtonText: 'Отмена',
    type: 'warning',
  }).then(() => {
    if (template.value.id) {
      loadTemplate();
      ElMessage.info('Форма сброшена к сохранённому состоянию');
    } else {
      template.value = { id: null, name: '', columns: [] };
      selectedColumnIndex.value = null;
      selectedPreviewColumnIndex.value = null;
      updatePreviewData();
      ElMessage.info('Форма очищена');
    }
  });
};

const cancel = () => {
  router.push({ name: 'TemplateList' });
};

// --- Lifecycle ---
onMounted(async () => {
  await Promise.all([loadEntityTypes(), loadTemplate()]);
  if (template.value.columns.length > 0 && selectedColumnIndex.value === null) {
    selectColumn(0);
  }
  updatePreviewData();
});
</script>

<style lang="scss" scoped>
/* ==== ОСНОВНАЯ СТРУКТУРА ==== */
.template-builder {
  padding: 10px;
  max-width: 1600px;
  margin: 0 auto;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .builder-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    flex-shrink: 0;

    h2 {
      margin: 0;
      font-size: 1.5em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 60%;
    }

    .builder-actions {
      display: flex;
      gap: 8px;
      flex-shrink: 0;

      .el-button {
        height: 32px;
        padding: 0 10px;
        display: flex;
        align-items: center;
        justify-content: center;

        .el-icon {
          margin-right: 5px;
        }

        &.is-circle {
          padding: 0;
          width: 28px;
          height: 28px;
        }
      }
    }
  }

  .form-section {
    background-color: #fff;
    padding: 12px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    margin-bottom: 10px;
    flex-shrink: 0;
  }

  .preview-section {
    background-color: #fff;
    padding: 12px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    margin-bottom: 10px;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    h3 {
      margin-top: 0;
      margin-bottom: 10px;
    }

    .table-preview-container {
      flex: 1;
      overflow: auto;
      position: relative;
      border: 1px solid #ebeef5;
      border-radius: 4px;

      .preview-empty {
        text-align: center;
        padding: 20px 0;
        color: #909399;
      }

      .preview-table-container {
        position: relative;
        min-width: 100%;

        .preview-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;

          th, td {
            padding: 4px 6px;
            border: 1px solid #ebeef5;
            text-align: left;
            font-size: 13px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;

            .el-icon {
              display: flex;
              align-items: center;
              justify-content: center;

              > svg {
                width: 14px;
                height: 14px;
              }
            }
          }

          th {
            background-color: #f5f7fa;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s;
            position: relative;
            height: 30px;

            &.active {
              background-color: #ecf5ff;
            }

            &.sort-handle {
              width: 40px;
              cursor: move;
              padding: 0;
              text-align: center;
              font-weight: bold;
              font-size: 0.9em;
            }
          }

          td {
            height: 30px;

            &.active {
              background-color: #ecf5ff;
            }

            &.sort-handle {
              width: 40px;
              text-align: center;
              cursor: move;
              padding: 0;
              font-weight: bold;
              font-size: 0.9em;
            }

            &.loading-reference {
              background-color: #f5f7fa;

              .el-icon.is-loading {
                animation: rotating 1s linear infinite;
                margin-right: 5px;
              }
            }
          }
        }
      }
    }
  }

  .builder-content {
    display: flex;
    gap: 15px;
    flex: 2;
    min-height: 0;

    .columns-section {
      flex: 1;
      background-color: #fff;
      padding: 12px;
      border-radius: 8px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      overflow: hidden;

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        flex-shrink: 0;

        h3 {
          margin: 0;
        }

        .column-creation {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;

          .el-select {
            width: 150px;

            :deep(.el-input__inner) {
              height: 28px;
              line-height: 28px;
            }
          }

          .el-button {
            height: 28px;
            padding: 0 8px;

            .el-icon {
              margin-right: 4px;
            }
          }
        }
      }

      .columns-table-container {
        flex: 1;
        overflow-y: auto;
        border: 1px solid #ebeef5;
        border-radius: 4px;
        padding: 2px;

        .columns-table {
          width: 100%;

          .draggable-columns-list {
            min-height: 50px;
          }

          .column-row {
            display: flex;
            align-items: center;
            padding: 6px 8px;
            border-radius: 4px;
            border-top: 1px solid #ebeef5;
            border-bottom: 1px solid #ebeef5;
            cursor: pointer;
            transition: all 0.2s ease;
            border-left: 3px solid rgba(230, 230, 236, 0.19);
            border-right: 3px solid rgba(230, 230, 236, 0.19);
            position: relative;

            &:hover {
              background-color: #f5f7fa;
              border-color: #dcdfe6;
            }

            &.active {
              background-color: #ecf5ff;
              border-left: 3px solid #409eff;
              border-right: 3px solid #409eff;
            }

            &.drag-over-top::before,
            &.drag-over-bottom::after {
              content: '';
              position: absolute;
              left: 0;
              right: 0;
              height: 3px;
              background-color: #67c23a;
              z-index: 10;
              border-radius: 2px;
              transition: all 0.2s ease;
            }

            &.drag-over-top::before {
              top: 0;
            }

            &.drag-over-bottom::after {
              bottom: 0;
            }

            &:last-child {
              border-bottom: none;
            }

            .sort-handle {
              cursor: move;
              padding: 2px 4px;
              color: #909399;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 24px;
              height: 24px;
              flex-shrink: 0;
              margin-right: 6px;

              .el-icon {
                display: flex;
                align-items: center;
                justify-content: center;

                > svg {
                  width: 16px;
                  height: 16px;
                }
              }
            }

            .column-name {
              flex: 1;
              padding: 0 6px;
              margin-right: 4px;
              cursor: pointer;
              min-width: 0;

              .name-header {
                display: flex;
                align-items: center;
                width: 100%;

                .name-display {
                  display: flex;
                  align-items: center;
                  flex: 1;
                  min-width: 0;

                  .name-text {
                    font-weight: 500;
                    margin-right: 6px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    flex: 1;
                    font-size: 13px;
                  }

                  .edit-icon {
                    opacity: 0;
                    transition: opacity 0.2s;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 18px;
                    height: 18px;
                    flex-shrink: 0;
                    color: #909399;

                    .el-icon {
                      width: 100%;
                      height: 100%;

                      > svg {
                        width: 14px;
                        height: 14px;
                      }
                    }

                    &:hover {
                      color: #409eff;
                    }
                  }
                }

                &:hover .edit-icon {
                  opacity: 0.7;
                }

                .column-type {
                  font-size: 11px;
                  margin-left: 6px;
                  flex-shrink: 0;
                  background-color: #f0f2f5;
                  padding: 1px 4px;
                  border-radius: 2px;
                }
              }

              .inline-edit {
                width: 100%;

                .el-input {
                  :deep(.el-input__wrapper) {
                    padding: 1px 4px;
                    border-radius: 2px;
                    border: 1px solid #dcdfe6;

                    &:hover {
                      border-color: #c0c4cc;
                    }
                  }

                  :deep(.el-input__inner) {
                    height: 22px;
                    line-height: 22px;
                    padding: 0 4px;
                    font-size: 13px;
                  }
                }
              }
            }

            .column-actions {
              display: flex;
              gap: 5px;
              flex-shrink: 0;
              margin-left: 6px;

              .el-button {
                padding: 0;
                width: 28px;
                height: 28px;
                border-radius: 4px;

                &.is-circle {
                  .el-icon {
                    width: 100%;
                    height: 100%;

                    > svg {
                      width: 14px;
                      height: 14px;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    .column-settings-panel {
      width: 340px;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;

      .column-settings, .column-settings-placeholder {
        padding: 12px;
        flex: 1;
        overflow-y: auto;

        h4 {
          margin-top: 0;
          margin-bottom: 12px;
          color: #303133;
          display: flex;
          align-items: center;
          font-size: 14px;

          .el-icon {
            margin-right: 6px;
            color: #409eff;
            width: 16px;
            height: 16px;

            > svg {
              width: 16px;
              height: 16px;
            }
          }
        }

        .settings-form {
          :deep(.el-form-item--small) {
            margin-bottom: 12px;

            .el-form-item__content {
              line-height: 26px;

              .el-input__inner,
              .el-select .el-input__inner {
                height: 26px;
                line-height: 26px;
                padding: 0 10px;
              }
            }
          }

          .options-list {
            .draggable-options-list {
              margin-bottom: 8px;
            }
            .option-item {
              display: flex;
              align-items: center;
              margin-bottom: 6px;

              .option-handle {
                cursor: move;
                padding: 0 6px;
                color: #909399;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 24px;
                height: 24px;
                flex-shrink: 0;

                .el-icon {
                  > svg {
                    width: 16px;
                    height: 16px;
                  }
                }
              }

              .el-input {
                flex: 1;
                margin: 0 6px;

                :deep(.el-input__inner) {
                  height: 26px;
                  line-height: 26px;
                  padding: 0 8px;
                }
              }

              .el-button {
                padding: 0;
                width: 24px;
                height: 24px;
                min-width: 24px;
                flex-shrink: 0;
              }
            }

            .add-option-btn {
              margin-top: 8px;
              height: 26px;
              padding: 0 8px;
              font-size: 13px;

              .el-icon {
                margin-right: 3px;
              }
            }
          }

          .boolean-text-settings {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-top: 6px;

            .text-input {
              display: flex;
              align-items: center;
              gap: 4px;

              span {
                width: 35px;
                font-weight: 500;
                font-size: 12px;
              }

              .el-input {
                flex: 1;

                :deep(.el-input__inner) {
                  height: 24px;
                  line-height: 24px;
                  padding: 0 6px;
                  font-size: 12px;
                }
              }
            }
          }

          .reference-settings {
            .format-input {
              .el-input {
                margin-bottom: 8px;
                :deep(.el-input__inner) {
                  font-size: 12px;
                }
              }
              .format-hint {
                font-size: 12px;
                color: #606266;
                line-height: 1.4;

                .format-key {
                  background-color: #e6f7ff;
                  color: #1890ff;
                  padding: 1px 4px;
                  border-radius: 2px;
                  margin: 0 1px;
                  cursor: move;
                  font-size: 11px;
                  border: 1px solid #91d5ff;
                  display: inline-block;
                  &:hover {
                    background-color: #bae7ff;
                    cursor: pointer;
                  }
                }
              }
            }

            .reference-preview {
              padding: 6px 8px;
              background-color: #fafafa;
              border-radius: 2px;
              font-size: 12px;
              margin-top: 4px;
              min-height: 24px;
              border: 1px solid #dcdfe6;
              white-space: pre-wrap;
            }
          }
        }
      }

      .column-settings-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        padding: 20px;
        text-align: center;
        color: #909399;
      }
    }
  }
}

/* Анимации */
@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Стили для drag-and-drop */
.drag-ghost {
  opacity: 0.9 !important;
  background-color: #f0f9eb !important;
  border: 1px solid #67c23a !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  user-select: none !important;
  pointer-events: none !important;
  z-index: 10000 !important;
  transform: scale(1.03) !important;
  transition: all 0.3s ease !important;
  > * { opacity: 0 !important; }
}

.drag-chosen {
  background-color: #f0f9eb;
}

.drag-class {
  display: none;
}

/* Плавная анимация при перемещении */
.column-row {
  transition: all 0.3s ease;

  &.active {
    transform: scale(1.02);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

/* Улучшенные стили для превью таблицы */
.preview-table {
  th, td {
    transition: all 0.2s;

    &:hover {
      background-color: #f5f7fa;
    }
  }

  tr {
    transition: all 0.2s;

    &:hover {
      background-color: #f5f7fa;
    }
  }
}

/* === НОВЫЕ/ОБНОВЛЕННЫЕ СТИЛИ ДЛЯ DND === */
.column-row {
  &.drag-over-top::before,
  &.drag-over-bottom::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    height: 3px;
    background-color: #67c23a;
    z-index: 10;
    border-radius: 2px;
    transition: all 0.2s ease;
  }

  &.drag-over-top::before {
    top: 0;
  }

  &.drag-over-bottom::after {
    bottom: 0;
  }
}

/* Глобально отключаем выделение текста при перетаскивании */
body.template-builder-dragging-in-progress {
  user-select: none !important;
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
}

/* Стили для перетаскиваемого элемента справочника */
.format-key {
  background-color: #e6f7ff;
  color: #1890ff;
  padding: 1px 4px;
  border-radius: 2px;
  margin: 0 1px;
  cursor: move;
  font-size: 11px;
  border: 1px solid #91d5ff;
  display: inline-block;
  &:hover {
    background-color: #bae7ff;
    cursor: pointer;
  }
}

/* Адаптивность (простой вариант) */
@media (max-width: 1200px) {
  .builder-content {
    flex-direction: column;
    .column-settings-panel {
      width: 100%;
      height: 400px;
    }
  }
}
</style>
