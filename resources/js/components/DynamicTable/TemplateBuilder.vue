<!-- resources/js/components/DynamicTable/TemplateBuilder.vue -->
<template>
  <!-- Шаблон без изменений -->
  <div class="template-builder">
    <div class="builder-header">
      <h2>Конструктор шаблона таблицы</h2>
      <div class="builder-actions">
        <el-button
            type="primary"
            @click="saveTemplate"
            :loading="saving"
            :disabled="!canSave"
        >
          <el-icon v-if="saving">
            <Loading />
          </el-icon>
          <span v-else>
            <el-icon>
              <Edit />
            </el-icon>
            {{ template.id ? 'Обновить шаблон' : 'Создать шаблон' }}
          </span>
        </el-button>
        <el-button @click="resetForm">
          <el-icon>
            <Refresh />
          </el-icon>
          Сбросить
        </el-button>
        <el-button @click="cancel">
          <el-icon>
            <Close />
          </el-icon>
          Отмена
        </el-button>
      </div>
    </div>

    <div class="form-section">
      <el-form :model="template" :rules="rules" ref="templateForm" label-width="120px">
        <el-form-item label="Название" prop="name">
          <el-input
              v-model="template.name"
              placeholder="Введите название шаблона"
          >
            <template #suffix>
              <el-icon>
                <Edit />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
    </div>

    <!-- Блок предварительного просмотра теперь выше, как и требуется -->
    <div class="preview-section">
      <h3>Предварительный просмотр</h3>
      <div class="table-preview">
        <div v-if="template.columns.length === 0" class="preview-empty">
          <el-empty description="Нет колонок для отображения" :image-size="60" />
        </div>
        <div v-else class="preview-table-container" ref="previewTableContainer">
          <table class="preview-table" ref="previewTable">
            <thead>
            <tr>
              <th class="sort-handle"></th>
              <th
                  v-for="(column, index) in template.columns"
                  :key="index"
                  class="preview-th"
                  :class="{
                    'active': selectedPreviewColumnIndex === index,
                    'preview-dragover-left': previewDragOverIndex === index && previewDragDirection === 'left',
                    'preview-dragover-right': previewDragOverIndex === index && previewDragDirection === 'right'
                  }"
                  @click="selectPreviewColumn(index)"
                  @dragover="previewDragOver($event, index)"
                  @dragenter="previewDragEnter($event, index)"
                  @dragleave="previewDragLeave($event, index)"
                  @drop="previewDrop($event, index)"
                  :style="{ width: columnWidths[index] ? `${columnWidths[index]}px` : 'auto' }"
              >
                {{ column.label }}
              </th>
              <!-- Заполнитель для вставки -->
              <th
                  v-if="previewDragOverIndex === template.columns.length"
                  class="preview-th preview-dragover-right"
                  :class="{
                    'preview-dragover-left': previewDragDirection === 'left',
                    'preview-dragover-right': previewDragDirection === 'right'
                  }"
                  @dragover="previewDragOver($event, template.columns.length)"
                  @dragenter="previewDragEnter($event, template.columns.length)"
                  @dragleave="previewDragLeave($event, template.columns.length)"
                  @drop="previewDrop($event, template.columns.length)"
                  :style="{ width: columnWidths[columnWidths.length - 1] ? `${columnWidths[columnWidths.length - 1]}px` : '100px' }"
              >
                &nbsp;
              </th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(row, rowIndex) in previewRows" :key="rowIndex">
              <td class="sort-handle">
                <el-icon>
                  <MoreFilled />
                </el-icon>
              </td>
              <td
                  v-for="(column, colIndex) in template.columns"
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
                    :value="row.data[column.tempId]"
                    :is-editing="isCellEditing(rowIndex, colIndex)"
                    :edit-value="getEditValue(rowIndex, colIndex)"
                    @start-edit="startEditingCell(rowIndex, colIndex, $event)"
                    @stop-edit="stopEditingCell"
                    @update-value="updatePreviewCellValue"
                    :reference-data="getReferenceDataForColumn(column)"
                    @loading="handleReferenceLoading(column, $event)"
                />
              </td>
            </tr>
            </tbody>
          </table>

          <!-- Заполнитель для drag-and-drop в превью -->
          <div
              v-if="previewPlaceholderWidth > 0"
              class="preview-drag-placeholder"
              :style="{
              left: `${previewPlaceholderLeft}px`,
              top: `${previewPlaceholderTop}px`,
              width: `${previewPlaceholderWidth}px`,
              height: `${previewPlaceholderHeight}px`
            }"
          >
            Вставить здесь
          </div>
        </div>
      </div>
    </div>

    <!-- Блок колонок шаблона теперь ниже блока предпросмотра -->
    <div class="builder-content">
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
              <el-icon>
                <Plus />
              </el-icon>
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

        <div class="columns-table-container">
          <div class="columns-table" ref="columnsList">
            <draggable
                v-model="template.columns"
                @start="dragStart"
                @end="dragEnd"
                handle=".sort-handle"
                ghost-class="drag-ghost"
                chosen-class="drag-chosen"
                drag-class="drag-class"
                item-key="tempId"
            >
              <template #item="{ element, index }">
                <div class="column-row" :class="{ 'active': selectedColumnIndex === index }">
                  <div class="sort-handle">
                    <el-icon>
                      <Rank />
                    </el-icon>
                  </div>

                  <div class="column-name" @click="selectColumn(index)" @dblclick="startInlineEdit(index)">
                    <div class="name-header">
                      <!-- Инлайн редактирование названия колонки -->
                      <div v-if="isEditingColumn(index)" class="inline-edit">
                        <el-input
                            ref="inlineEditInputRef"
                            v-model="editingColumnValue"
                            @blur="saveInlineEdit"
                            @keyup.enter="saveInlineEdit"
                            @keyup.esc="cancelInlineEdit"
                            @click.stop
                            autofocus
                            class="inline-edit-input"
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
                    >
                      <el-icon>
                        <Setting />
                      </el-icon>
                    </el-button>
                    <el-button
                        size="small"
                        type="danger"
                        circle
                        @click.stop="removeColumn(index)"
                    >
                      <el-icon>
                        <Delete />
                      </el-icon>
                    </el-button>
                  </div>
                </div>
              </template>
            </draggable>
          </div>
        </div>
      </div>

      <div class="column-settings-panel">
        <div v-if="selectedColumn" class="column-settings">
          <h4>
            <el-icon>
              <Setting />
            </el-icon>
            Настройки колонки: {{ selectedColumn.label }}
          </h4>

          <el-form label-position="top" class="settings-form">
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
                      @end="updatePreviewData"
                      handle=".option-handle"
                      ghost-class="drag-ghost"
                      chosen-class="drag-chosen"
                      drag-class="drag-class"
                      item-key="index"
                  >
                    <template #item="{ element, index }">
                      <div class="option-item">
                        <div class="option-handle">
                          <el-icon>
                            <Rank />
                          </el-icon>
                        </div>
                        <el-input
                            v-model="selectedColumn.options[index]"
                            @blur="updatePreviewData"
                        />
                        <el-button
                            type="danger"
                            size="small"
                            circle
                            @click="removeOption(index)"
                        >
                          <el-icon>
                            <Delete />
                          </el-icon>
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
                    <el-icon>
                      <Plus />
                    </el-icon>
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
                    v-model="selectedBooleanSettings.displayType"
                    @change="handleBooleanSettingChange('displayType', $event)"
                >
                  <el-radio label="toggle">Переключатель</el-radio>
                  <el-radio label="checkbox">Чекбокс</el-radio>
                  <el-radio label="text">Текст</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item
                  label="Подписи"
                  v-if="selectedBooleanSettings.displayType === 'text'"
              >
                <div class="boolean-text-settings">
                  <div class="text-input">
                    <span>Да:</span>
                    <el-input
                        v-model="selectedBooleanSettings.trueLabel"
                        @input="handleBooleanSettingChange('trueLabel', $event)"
                        size="small"
                        placeholder="Да"
                    />
                  </div>
                  <div class="text-input">
                    <span>Нет:</span>
                    <el-input
                        v-model="selectedBooleanSettings.falseLabel"
                        @input="handleBooleanSettingChange('falseLabel', $event)"
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
                      placeholder="Введите формат отображения"
                  />
                  <div class="format-hint">
                    Доступные поля:
                    <span
                        v-for="(key, index) in getAvailableKeys(selectedColumn.reference.entityType)"
                        :key="index"
                        class="format-key"
                        draggable="true"
                        @dragstart="dragStartKey($event, key)"
                    >
                      {{ key }}
                    </span>
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
// Импорты без изменений
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElNotification } from 'element-plus';
import {
  Edit,
  Close,
  Refresh,
  Plus,
  Delete,
  Rank,
  MoreFilled,
  Loading,
  Setting
} from '@element-plus/icons-vue';
import draggable from 'vuedraggable';
import ReferenceSelector from './ReferenceSelector.vue';
import TableCell from './TableCell.vue';

// Используем относительные пути (./) вместо глобальных (@/)
import {
  formatReferenceDisplay,
  getExampleFormat,
  getAvailableKeys,
  getNestedValue
} from './utils/referenceUtils';
import {
  getBooleanSetting,
  setBooleanSetting,
  parseBooleanValue
} from './utils/booleanUtils';
import { templateService } from './services/templateService';
import { dataSource } from './services/DataSource';

// Получаем параметры маршрута
const route = useRoute();
const router = useRouter();
const templateId = route.params.id ? parseInt(route.params.id) : null;
const templateForm = ref(null);
// Состояние
const template = ref({
  id: null,
  name: '',
  columns: []
});

const previewData = ref({}); // Хранит примерные данные для каждой колонки по tempId
const columnWidths = ref([]);
const saving = ref(false);
const selectedColumnIndex = ref(null);
const selectedPreviewColumnIndex = ref(null);
const previewTable = ref(null);
const previewTableContainer = ref(null); // Ref для контейнера предпросмотра
const columnsList = ref(null);
const inlineEditInputRef = ref([]);
// editInputRef больше не нужен, так как редактирование будет обрабатываться TableCell

// Для drag-and-drop
const currentDragIndex = ref(null);
const dragOverIndex = ref(null);
const dragDirection = ref(null);
const currentPreviewColumn = ref(null);
const previewDragOverIndex = ref(null);
const previewDragDirection = ref(null);

// Позиции заполнителей
const dragPlaceholderTop = ref(0);
const dragPlaceholderHeight = ref(0);
const previewPlaceholderLeft = ref(0);
const previewPlaceholderWidth = ref(0);
const previewPlaceholderTop = ref(0);
const previewPlaceholderHeight = ref(0);

// Для инлайн-редактирования
const editingColumn = ref(null);
const newColumnType = ref(null);

// Для редактирования ячеек в превью
const editingCell = ref(null); // { rowIndex, colIndex, value }

// Для загрузки справочников
const referenceOptions = ref({}); // Хранилище данных справочников
const loadingReferences = ref(new Set()); // Отслеживаем загружаемые справочники
const loadedReferences = ref(new Set()); // Отслеживаем загруженные справочники

// Типы колонок
const columnTypes = [
  { value: 'text', label: 'Текст' },
  { value: 'number', label: 'Число' },
  { value: 'select', label: 'Выбор' },
  { value: 'date', label: 'Дата' },
  { value: 'datetime', label: 'Дата и время' },
  { value: 'boolean', label: 'Да/Нет' },
  { value: 'reference', label: 'Справочник' }
];

// Типы данных для текста
const textDataTypes = [
  { value: 'string', label: 'Строка' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Телефон' },
  { value: 'url', label: 'URL' }
];

// Форматы даты
const dateFormats = [
  { value: 'YYYY-MM-DD', label: 'Год-Месяц-День', example: '2023-10-15' },
  { value: 'DD.MM.YYYY', label: 'День.Месяц.Год', example: '15.10.2023' },
  { value: 'MM/DD/YYYY', label: 'Месяц/День/Год', example: '10/15/2023' },
  { value: 'DD MMM YYYY', label: 'День Месяц Год', example: '15 Oct 2023' },
  { value: 'YYYY/MM/DD', label: 'Год/Месяц/День', example: '2023/10/15' },
  { value: 'DD-MM-YYYY', label: 'День-Месяц-Год', example: '15-10-2023' },
  { value: 'YYYY-MM-DD HH:mm', label: 'Год-Месяц-День Часы:Минуты', example: '2023-10-15 14:30' },
  { value: 'HH:mm', label: 'Часы:Минуты', example: '14:30' }
];

// Типы сущностей для справочника
const entityTypes = [
  { value: 'accessory', label: 'Аксессуар' },
  { value: 'brand', label: 'Бренд' },
  { value: 'device_type', label: 'Тип устройства' },
  { value: 'MeasurementCategory', label: 'Категория Единиц измерения' }
];

// Вычисляемое свойство для данных предпросмотра строк
// Каждая "строка" предпросмотра получает данные из previewData
const previewRows = computed(() => {
  return [
    {
      id: 1, // Фиктивный ID для строки предпросмотра
      data: { ...previewData.value } // Копируем все примерные данные в data строки
    }
  ];
});

// Вычисляемое свойство для текущей выбранной колонки
const selectedColumn = computed(() => {
  if (selectedColumnIndex.value === null) return null;
  return template.value.columns[selectedColumnIndex.value];
});

// Проверка, загружены ли данные для справочника
const hasReferenceData = (column) => {
  if (column.type !== 'reference' || !column.reference || !column.reference.entityType) {
    return true;
  }

  return loadedReferences.value.has(column.reference.entityType);
};

// Проверка, загружается ли справочник
const isReferenceLoading = (column) => {
  if (column.type !== 'reference' || !column.reference || !column.reference.entityType) {
    return false;
  }

  return loadingReferences.value.has(column.reference.entityType);
};

// Вычисляемое свойство для данных предпросмотра выбранной колонки
const getFormattedReferencePreview = computed(() => {
  if (!selectedColumn.value || selectedColumn.value.type !== 'reference' || !selectedColumn.value.reference) {
    return '';
  }

  const entityType = selectedColumn.value.reference.entityType;

  // Если данные еще не загружены, запускаем загрузку
  if (!loadedReferences.value.has(entityType) && !loadingReferences.value.has(entityType)) {
    loadReferenceData(entityType);
    return 'Загрузка...';
  }

  // Если данные загружаются, показываем статус
  if (loadingReferences.value.has(entityType)) {
    return 'Загрузка...';
  }

  // Если данные загружены, но пустые
  if (loadedReferences.value.has(entityType) && (!referenceOptions.value[entityType] || referenceOptions.value[entityType].length === 0)) {
    return 'Нет данных';
  }

  // Берем первый элемент из справочника для примера
  const item = referenceOptions.value[entityType][0];
  return formatReferenceDisplay(item, selectedColumn.value);
});

// Вычисляемое свойство для безопасного доступа к настройкам boolean
const selectedBooleanSettings = computed({
  get: () => {
    if (!selectedColumn.value || selectedColumn.value.type !== 'boolean') {
      return {
        displayType: 'toggle',
        trueLabel: 'Да',
        falseLabel: 'Нет'
      };
    }

    return {
      displayType: getBooleanSetting(selectedColumn.value, 'displayType') || 'toggle',
      trueLabel: getBooleanSetting(selectedColumn.value, 'trueLabel') || 'Да',
      falseLabel: getBooleanSetting(selectedColumn.value, 'falseLabel') || 'Нет'
    };
  },
  set: (newSettings) => {
    if (!selectedColumn.value || selectedColumn.value.type !== 'boolean') {
      return;
    }

    // Создаем объект настроек
    const settings = {
      displayType: newSettings.displayType || 'toggle',
      trueLabel: newSettings.trueLabel || 'Да',
      falseLabel: newSettings.falseLabel || 'Нет'
    };

    // Устанавливаем настройки в колонку
    setBooleanSetting(selectedColumn.value, settings);
  }
});

// Вычисляемое свойство для безопасного доступа к значению редактирования
const editingColumnValue = computed({
  get: () => {
    return editingColumn.value ? editingColumn.value.newValue : '';
  },
  set: (value) => {
    if (editingColumn.value) {
      editingColumn.value.newValue = value;
    }
  }
});

// === ИНТЕГРАЦИЯ TABLECELL: Новые методы и данные ===
// Получение значения для редактирования ячейки
const getEditValue = (rowIndex, colIndex) => {
  if (editingCell.value &&
      editingCell.value.rowIndex === rowIndex &&
      editingCell.value.colIndex === colIndex) {
    return editingCell.value.value;
  }
  return null; // или какое-то значение по умолчанию
};

// Получение данных справочника для конкретной колонки
const getReferenceDataForColumn = (column) => {
  if (column.type === 'reference' && column.reference && column.reference.entityType) {
    return referenceOptions.value[column.reference.entityType] || [];
  }
  return [];
};

// Обработчик события загрузки из ReferenceSelector (и TableCell)
const handleReferenceLoading = (column, isLoading) => {
  if (column.type === 'reference' && column.reference && column.reference.entityType) {
    if (isLoading) {
      loadingReferences.value.add(column.reference.entityType);
    } else {
      loadingReferences.value.delete(column.reference.entityType);
      loadedReferences.value.add(column.reference.entityType);
    }
  }
};

// Загрузка данных справочника
const loadReferenceData = async (entityType) => {
  if (!entityType || loadedReferences.value.has(entityType)) {
    return;
  }

  loadingReferences.value.add(entityType);

  try {
    // Загружаем данные через сервис
    const response = await dataSource.getReferenceData(entityType);

    console.log('TemplateBuilder loadReferenceData ', response)

    // Сохраняем данные
    referenceOptions.value[entityType] = response.data || [];;
    loadedReferences.value.add(entityType);
  } catch (error) {
    console.error(`Ошибка загрузки данных справочника (${entityType}):`, error);
    ElMessage.error(`Не удалось загрузить данные справочника "${entityType}"`);

    // Даже при ошибке помечаем как загруженный, чтобы не пытаться загружать повторно
    loadedReferences.value.add(entityType);
  } finally {
    loadingReferences.value.delete(entityType);
  }
};

// Обработчик изменения типа справочника
const onReferenceTypeChange = () => {
  // Если тип справочника изменен, загружаем данные
  if (selectedColumn.value.reference && selectedColumn.value.reference.entityType) {
    loadReferenceData(selectedColumn.value.reference.entityType);
  }
};

// Методы для редактирования ячеек в превью
const startEditingCell = (rowIndex, colIndex, value) => {
  editingCell.value = { rowIndex, colIndex, value };
};

const isCellEditing = (rowIndex, colIndex) => {
  return editingCell.value &&
      editingCell.value.rowIndex === rowIndex &&
      editingCell.value.colIndex === colIndex;
};

const stopEditingCell = () => {
  editingCell.value = null;
};

const cancelEditingCell = () => {
  editingCell.value = null;
};

// Обновление значения в previewData при изменении в TableCell
const updatePreviewCellValue = (newValue) => {
  if (editingCell.value) {
    const { rowIndex, colIndex } = editingCell.value;
    const column = template.value.columns[colIndex];
    if (column && column.tempId) {
      previewData.value[column.tempId] = newValue;
      // Обновляем данные в previewRows
      // В данном случае previewRows вычисляется из previewData, поэтому достаточно обновить previewData
    }
  }
  stopEditingCell();
};
// === КОНЕЦ ИНТЕГРАЦИИ TABLECELL ===

// Методы
const getColumnTypeName = (type) => {
  const columnType = columnTypes.find(ct => ct.value === type);
  return columnType ? columnType.label : 'Неизвестный тип';
};

const addColumn = () => {
  if (!newColumnType.value) return;

  const tempId = Date.now();
  const newColumn = {
    tempId,
    type: newColumnType.value,
    label: `Колонка ${template.value.columns.length + 1}`,
    order: template.value.columns.length
  };

  // Инициализация специфичных полей для каждого типа
  switch (newColumnType.value) {
    case 'reference':
      newColumn.reference = {
        entityType: 'accessory',
        displayFormat: getExampleFormat('accessory')
      };
      // Загружаем данные справочника
      loadReferenceData('accessory');
      break;

    case 'boolean':
      newColumn.booleanSettings = {
        displayType: 'toggle',
        trueLabel: 'Да',
        falseLabel: 'Нет'
      };
      break;

    case 'date':
    case 'datetime':
      newColumn.dateFormat = newColumnType.value === 'datetime' ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD';
      break;

    case 'select':
      newColumn.options = ['Вариант 1', 'Вариант 2'];
      break;

    case 'number':
      newColumn.unit = '';
      break;

    case 'text':
      newColumn.dataType = 'string';
      break;
  }

  template.value.columns.push(newColumn);

  // === КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: Инициализируем previewData для новой колонки ===
  previewData.value[tempId] = '';
  updatePreviewDataForColumn(newColumn); // Обновляем примерные данные для новой колонки
  // === КОНЕЦ КЛЮЧЕВОГО ИЗМЕНЕНИЯ ===

  // Выбираем новую колонку для настройки
  selectColumn(template.value.columns.length - 1);

  // Сбрасываем выбор типа колонки
  newColumnType.value = null;
};

const removeColumn = (index) => {
  const column = template.value.columns[index];
  if (column.tempId && previewData.value[column.tempId] !== undefined) {
    delete previewData.value[column.tempId];
  }
  template.value.columns.splice(index, 1);

  // Сбрасываем выбор колонки, если удаляемая была выбрана
  if (selectedColumnIndex.value === index) {
    selectedColumnIndex.value = null;
  }
  // Также сбрасываем выбор колонки предпросмотра
  if (selectedPreviewColumnIndex.value === index) {
    selectedPreviewColumnIndex.value = null;
  }
};

const selectColumn = (index) => {
  selectedColumnIndex.value = index;
  selectedPreviewColumnIndex.value = index;

  // Прокручиваем к выбранной колонке
  scrollToColumn(index);
};

const selectPreviewColumn = (index) => {
  selectedPreviewColumnIndex.value = index;
  selectedColumnIndex.value = index;

  // Прокручиваем к выбранной колонке в списке
  scrollToColumn(index);
};

// Инлайн редактирование
const startInlineEdit = (index) => {
  const column = template.value.columns[index];
  editingColumn.value = {
    index,
    originalValue: column.label,
    newValue: column.label
  };

  nextTick(() => {
    if (inlineEditInputRef.value && inlineEditInputRef.value[index]) {
      const input = inlineEditInputRef.value[index];
      if (input && input.focus) {
        input.focus();
        input.select();
      }
    }
  });
};

const isEditingColumn = (index) => {
  return editingColumn.value && editingColumn.value.index === index;
};

const saveInlineEdit = () => {
  if (editingColumn.value) {
    const { index, newValue } = editingColumn.value;
    template.value.columns[index].label = String(newValue || '');
    editingColumn.value = null;

    // Обновляем данные предпросмотра
    updatePreviewData();
  }
};

const cancelInlineEdit = () => {
  if (editingColumn.value) {
    const { index, originalValue } = editingColumn.value;
    template.value.columns[index].label = String(originalValue || '');
    editingColumn.value = null;
  }
};

// Drag-and-drop методы
const dragStart = (event) => {
  // draggable уже управляет моделью, но мы можем добавить дополнительную логику
  // если нужно. Например, сохранить индекс перетаскиваемого элемента.
  // event.item - это DOM элемент, который перетаскивается
};

const dragEnd = (event) => {
  // Сброс состояния DnD после завершения перетаскивания с помощью draggable
  resetDragState();
  // Обновляем данные предпросмотра, так как порядок колонок мог измениться
  updatePreviewData();
};

// Методы для DnD в списке колонок (для событий dragover, dragenter, dragleave, drop)
const dragOver = (event, index) => {
  event.preventDefault();
};

const dragEnter = (event, index) => {
  event.preventDefault();
  // Не обрабатываем, если это дочерний элемент
  const targetRow = event.target.closest('.column-row');
  if (!targetRow) return;

  const rect = targetRow.getBoundingClientRect();
  const y = event.clientY - rect.top;

  // Определяем направление вставки (сверху или снизу)
  if (y < rect.height / 2) {
    dragDirection.value = 'top';
  } else {
    dragDirection.value = 'bottom';
  }

  dragOverIndex.value = index;
  updatePlaceholderPositions();
};

const dragLeave = () => {
  // dragOverIndex.value = null;
  // dragDirection.value = null;
  // updatePlaceholderPositions();
};

const drop = (event, index) => {
  event.preventDefault();
  const draggedIndex = currentDragIndex.value;

  if (draggedIndex === null || draggedIndex === index) {
    resetDragState();
    return;
  }

  let targetIndex = index;
  // Корректируем индекс вставки в зависимости от направления
  if (dragDirection.value === 'bottom' && index >= draggedIndex) {
    targetIndex += 1;
  }
  if (dragDirection.value === 'top' && index > draggedIndex) {
    targetIndex -= 1;
  }

  // Перемещаем колонку
  const newColumns = [...template.value.columns];
  const [movedItem] = newColumns.splice(draggedIndex, 1);
  // Корректируем targetIndex после удаления элемента
  const adjustedTargetIndex = targetIndex > draggedIndex ? targetIndex - 1 : targetIndex;
  newColumns.splice(adjustedTargetIndex, 0, movedItem);

  // Обновляем порядок
  template.value.columns = newColumns.map((col, idx) => ({ ...col, order: idx }));

  // Сбрасываем состояние drag-and-drop
  resetDragState();
  // Обновляем данные предпросмотра
  updatePreviewData();
};

// Методы для DnD в предварительном просмотре
const previewDragOver = (event, index) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';

  const targetCell = event.target.closest('th, td');
  if (!targetCell) return;

  const rect = targetCell.getBoundingClientRect();
  const x = event.clientX - rect.left;

  // Определяем направление вставки (слева или справа)
  if (x < rect.width / 2) {
    previewDragDirection.value = 'left';
  } else {
    previewDragDirection.value = 'right';
  }

  previewDragOverIndex.value = index;
  updatePreviewPlaceholder();

  // Логика прокрутки
  if (previewTableContainer.value) {
    const containerRect = previewTableContainer.value.getBoundingClientRect();
    const scrollThreshold = 20; // Порог для начала прокрутки

    if (event.clientY < containerRect.top + scrollThreshold) {
      previewTableContainer.value.scrollTop -= 10; // Прокрутка вверх
    } else if (event.clientY > containerRect.bottom - scrollThreshold) {
      previewTableContainer.value.scrollTop += 10; // Прокрутка вниз
    }

    if (event.clientX < containerRect.left + scrollThreshold) {
      previewTableContainer.value.scrollLeft -= 10; // Прокрутка влево
    } else if (event.clientX > containerRect.right - scrollThreshold) {
      previewTableContainer.value.scrollLeft += 10; // Прокрутка вправо
    }
  }
};

const previewDragEnter = (event, index) => {
  event.preventDefault();
  currentPreviewColumn.value = index;
};

const previewDragLeave = () => {
  // currentPreviewColumn.value = null;
};

const previewDrop = (event, index) => {
  event.preventDefault();
  const draggedIndex = currentDragIndex.value;

  if (draggedIndex === null || draggedIndex === index) {
    resetDragState();
    return;
  }

  let targetIndex = index;
  // Корректируем индекс вставки в зависимости от направления
  if (previewDragDirection.value === 'right' && index >= draggedIndex) {
    targetIndex += 1;
  }
  if (previewDragDirection.value === 'left' && index > draggedIndex) {
    targetIndex -= 1;
  }

  // Перемещаем колонку
  const newColumns = [...template.value.columns];
  const [movedItem] = newColumns.splice(draggedIndex, 1);
  // Корректируем targetIndex после удаления элемента
  const adjustedTargetIndex = targetIndex > draggedIndex ? targetIndex - 1 : targetIndex;
  newColumns.splice(adjustedTargetIndex, 0, movedItem);

  // Обновляем порядок
  template.value.columns = newColumns.map((col, idx) => ({ ...col, order: idx }));

  // Сбрасываем состояние drag-and-drop
  resetDragState();
  // Обновляем данные предпросмотра
  updatePreviewData();
};

// Методы для позиционирования заполнителей
const updatePlaceholderPositions = () => {
  if (!columnsList.value || !previewTable.value) return;

  const rows = columnsList.value.querySelectorAll('.column-row');
  if (rows.length === 0 || dragOverIndex.value === null || dragDirection.value === null) {
    dragPlaceholderTop.value = 0;
    return;
  }

  const targetRow = rows[dragOverIndex.value];
  if (!targetRow) return;

  const containerRect = columnsList.value.getBoundingClientRect();
  const rowRect = targetRow.getBoundingClientRect();

  dragPlaceholderTop.value = rowRect.top - containerRect.top;
  dragPlaceholderHeight.value = 4; // Тонкая линия
};

const updatePreviewPlaceholder = () => {
  if (!previewTable.value || previewDragOverIndex.value === null || previewDragDirection.value === null) {
    previewPlaceholderLeft.value = null;
    previewPlaceholderTop.value = null;
    return;
  }

  const headers = previewTable.value.querySelectorAll('th.preview-th');
  if (headers.length === 0) return;

  const targetHeader = headers[previewDragOverIndex.value];
  if (!targetHeader) return;

  const headerRect = targetHeader.getBoundingClientRect();
  const tableRect = previewTable.value.getBoundingClientRect();

  previewPlaceholderWidth.value = 4; // Тонкая линия
  previewPlaceholderHeight.value = headerRect.height;
  previewPlaceholderTop.value = headerRect.top - tableRect.top;

  if (previewDragDirection.value === 'left') {
    previewPlaceholderLeft.value = headerRect.left - tableRect.left;
  } else {
    previewPlaceholderLeft.value = headerRect.right - tableRect.left;
  }
};

const resetDragState = () => {
  currentDragIndex.value = null;
  dragOverIndex.value = null;
  dragDirection.value = null;
  currentPreviewColumn.value = null;
  previewDragOverIndex.value = null;
  previewDragDirection.value = null;
  dragPlaceholderTop.value = 0;
  previewPlaceholderLeft.value = null;
  previewPlaceholderTop.value = null;
};

// Методы для предварительного просмотра данных
// === КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: Обновленная функция updatePreviewData ===
// Обновление previewData для ВСЕХ колонок
const updatePreviewData = () => {
  console.log("[TemplateBuilder] updatePreviewData called for ALL columns");

  // Очищаем previewData перед обновлением
  Object.keys(previewData.value).forEach(key => delete previewData.value[key]);

  // Обновляем данные для каждой колонки
  template.value.columns.forEach(col => {
    updatePreviewDataForColumn(col);
  });

  console.log("[TemplateBuilder] previewData after full update:", previewData.value);
};

// Обновление previewData для одной конкретной колонки
const updatePreviewDataForColumn = (column) => {
  if (!column || !column.tempId) {
    console.warn("[TemplateBuilder] updatePreviewDataForColumn: Invalid column or missing tempId");
    return;
  }

  const tempId = column.tempId;
  console.log(`[TemplateBuilder] updatePreviewDataForColumn called for: ${column.label} (ID: ${tempId}, Type: ${column.type})`);

  let exampleValue;
  // Генерируем примерные данные в зависимости от типа
  switch (column.type) {
    case 'text':
      exampleValue = `Пример текста для ${column.label}`;
      break;
    case 'number':
      exampleValue = Math.floor(Math.random() * 1000) + 100;
      break;
    case 'select':
      exampleValue = column.options?.[0] || 'Вариант 1';
      break;
    case 'date':
    case 'datetime':
      const date = new Date();
      exampleValue = formatDate(date, column.dateFormat ||
          (column.type === 'datetime' ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD'));
      break;
    case 'boolean':
      // Убедимся, что сохраняем строго boolean
      exampleValue = true;
      break;
    case 'reference':
      // Генерируем примерные данные в зависимости от настроек колонки
      console.log(`[TemplateBuilder] Processing 'reference' type for column: ${column.label}`);

      // Проверяем, загружены ли данные справочника
      if (column.reference?.entityType && loadedReferences.value.has(column.reference.entityType)) {
        console.log(`[TemplateBuilder] Reference data for ${column.reference.entityType} is loaded.`);
        const options = referenceOptions.value[column.reference.entityType];
        if (options && options.length > 0) {
          // Берем ID первого элемента из загруженных данных
          exampleValue = options[0].id;
          console.log(`[TemplateBuilder] Using first item ID (${exampleValue}) from loaded reference data.`);
        } else {
          // Если данные загружены, но пустые
          console.log(`[TemplateBuilder] Reference data for ${column.reference.entityType} is loaded but empty.`);
          exampleValue = 1; // Устанавливаем примерный ID
        }
      } else {
        // Если данные справочника еще не загружены или entityType не задан
        console.log(`[TemplateBuilder] Reference data for ${column.reference?.entityType || 'unknown'} is not loaded or entityType is missing.`);
        // Устанавливаем примерный ID для отображения в предварительном просмотре
        exampleValue = 1; // Или другой примерный ID
      }
      break;
    default:
      exampleValue = 'Пример данных';
  }

  const oldValue = previewData.value[tempId];
  previewData.value[tempId] = exampleValue;
  console.log(`[TemplateBuilder] Set previewData[${tempId}] from`, oldValue, "to", exampleValue, `(type: ${typeof exampleValue})`);
};
// === КОНЕЦ КЛЮЧЕВОГО ИЗМЕНЕНИЯ ===

// Методы для колонки
const onColumnTypeChange = () => {
  // Инициализация специфичных полей для каждого типа
  switch (selectedColumn.value.type) {
    case 'reference':
      selectedColumn.value.reference = selectedColumn.value.reference || {
        entityType: 'accessory',
        displayFormat: getExampleFormat('accessory')
      };

      // Загружаем данные справочника
      if (selectedColumn.value.reference.entityType) {
        loadReferenceData(selectedColumn.value.reference.entityType);
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
    case 'datetime':
      selectedColumn.value.dateFormat = selectedColumn.value.dateFormat ||
          (selectedColumn.value.type === 'datetime' ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD');
      break;

    case 'select':
      selectedColumn.value.options = selectedColumn.value.options || [];
      break;

    case 'number':
      selectedColumn.value.unit = selectedColumn.value.unit || '';
      break;

    case 'text':
      selectedColumn.value.dataType = selectedColumn.value.dataType || 'string';
      break;
  }

  // Обновляем данные предпросмотра только для выбранной колонки
  updatePreviewDataForColumn(selectedColumn.value);
};

const addOption = () => {
  if (selectedColumn.value.type === 'select') {
    const newOption = `Вариант ${selectedColumn.value.options.length + 1}`;
    selectedColumn.value.options.push(newOption);
    updatePreviewDataForColumn(selectedColumn.value); // Обновляем только для этой колонки
  }
};

const removeOption = (index) => {
  if (selectedColumn.value.type === 'select') {
    selectedColumn.value.options.splice(index, 1);
    updatePreviewDataForColumn(selectedColumn.value); // Обновляем только для этой колонки
  }
};

const handleBooleanSettingChange = (setting, value) => {
  const newSettings = { ...selectedBooleanSettings.value };
  newSettings[setting] = value;

  // Создаем объект настроек
  const settings = {
    displayType: newSettings.displayType || 'toggle',
    trueLabel: newSettings.trueLabel || 'Да',
    falseLabel: newSettings.falseLabel || 'Нет'
  };

  // Устанавливаем настройки в колонку
  setBooleanSetting(selectedColumn.value, settings);
  updatePreviewDataForColumn(selectedColumn.value); // Обновляем только для этой колонки
};

const formatDate = (date, format) => {
  if (!date) return '';

  // Если это строка, преобразуем в объект Date
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Проверяем валидность даты
  if (isNaN(dateObj.getTime())) return date;

  const year = dateObj.getFullYear();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const day = dateObj.getDate().toString().padStart(2, '0');
  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthNamesFull = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

  switch (format) {
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'DD.MM.YYYY':
      return `${day}.${month}.${year}`;
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'DD MMM YYYY':
      return `${day} ${monthNames[dateObj.getMonth()]} ${year}`;
    case 'DD MMMM YYYY':
      return `${day} ${monthNamesFull[dateObj.getMonth()]} ${year}`;
    case 'YYYY/MM/DD':
      return `${year}/${month}/${day}`;
    case 'DD-MM-YYYY':
      return `${day}-${month}-${year}`;
    case 'YYYY-MM-DD HH:mm':
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    case 'HH:mm':
      return `${hours}:${minutes}`;
    default:
      return `${year}-${month}-${day}`;
  }
};

const canSave = computed(() => {
  return template.value.name.trim() !== '' && template.value.columns.length > 0;
});

const rules = {
  name: [
    { required: true, message: 'Пожалуйста, введите название шаблона', trigger: 'blur' },
    { min: 3, max: 50, message: 'Название должно быть от 3 до 50 символов', trigger: 'blur' }
  ]
};

const resetForm = () => {
  ElMessageBox.confirm(
      'Вы уверены, что хотите сбросить все изменения?',
      'Подтверждение сброса',
      {
        confirmButtonText: 'Да, сбросить',
        cancelButtonText: 'Отмена',
        type: 'warning',
      }
  ).then(() => {
    if (route.params.id) {
      loadTemplate();
    } else {
      template.value = {
        id: null,
        name: '',
        columns: []
      };
      // Очищаем previewData
      Object.keys(previewData.value).forEach(key => delete previewData.value[key]);
    }
  }).catch(() => {
    // Отмена
  });
};

const cancel = () => {
  router.push({ name: 'TemplateList' });
};

const saveTemplate = async () => {
  // Используем валидацию формы, как во втором фрагменте
  const valid = await templateForm.value?.validate();
  if (!valid) return;

  saving.value = true;
  try {
    const templateData = {
      name: template.value.name,
      columns: template.value.columns.map(column => ({
        // Убедитесь, что структура данных соответствует ожидаемой API
        type: column.type,
        label: column.label,
        order: column.order, // Или index, если порядок определяется позицией в массиве
        options: column.options || [],
        data_type: column.dataType || '',
        unit: column.unit || '',
        reference: column.type === 'reference' ? column.reference : null,
        boolean_settings: column.type === 'boolean' ? column.booleanSettings : null,
        date_format: column.type === 'date' || column.type === 'datetime' ? column.dateFormat : null
        // Добавьте другие поля, если они требуются API
      }))
    };

    let response; // <-- Используем response, как в первом фрагменте
    if (template.value.id) {
      // ИСПРАВЛЕНИЕ 1: Используем правильный метод templateService
      // БЫЛО: result = await templateService.updateTemplate(template.value.id, templateData);
      response = await templateService.update(template.value.id, templateData); // <-- ИСПРАВЛЕНО
      ElNotification({ // Или ElMessage, как в первом фрагменте
        title: 'Успех',
        message: 'Шаблон успешно обновлен',
        type: 'success'
      });
    } else {
      // ИСПРАВЛЕНИЕ 1: Используем правильный метод templateService
      // БЫЛО: result = await templateService.createTemplate(templateData);
      response = await templateService.create(templateData); // <-- ИСПРАВЛЕНО
      ElNotification({ // Или ElMessage, как в первом фрагменте
        title: 'Успех',
        message: 'Шаблон успешно создан',
        type: 'success'
      });

      // ИСПРАВЛЕНИЕ 2: Логика перенаправления из первого фрагмента лучше
      // БЫЛО: router.push({ name: 'TemplateList' });
      // СТАЛО (как в первом фрагменте):
      // Если это новый шаблон, перенаправляем на страницу редактирования
      if (!templateId) { // templateId определяется в setup: const templateId = route.params.id ? parseInt(route.params.id) : null;
        router.push({ name: 'TemplateEdit', params: { id: response.id } });
        // ВАЖНО: После push выполнение продолжается, поэтому нужно выйти
        return; // <-- ВЫХОД, чтобы не выполнять дальнейшую логику обновления состояния дважды
      }
      // ИСПРАВЛЕНИЕ 2 (КОНЕЦ)
    }

    // === НАЧАЛО БЛОКА ОБНОВЛЕНИЯ СОСТОЯНИЯ (из первого фрагмента) ===
    // Обновляем данные шаблона
    template.value.id = response.id;
    template.value.name = response.name;

    // Обновляем колонки (предполагая, что response.columns уже отформатированы)
    // templateService.formatTemplateResponse (из services/templateService.js) должен это делать
    template.value.columns = response.columns.map(col => ({
      ...col,
      tempId: col.id || col.tempId || Date.now() // Убедитесь в приоритетах ID
    }));

    // Обновляем previewData
    // Очищаем старые ключи
    Object.keys(previewData.value).forEach(key => delete previewData.value[key]);
    // Создаем новые ключи и устанавливаем пустые значения
    template.value.columns.forEach(col => {
      if (col.tempId) {
        previewData.value[col.tempId] = '';
      }
    });

    // Загружаем данные для всех справочников
    template.value.columns.forEach(column => {
      if (column.type === 'reference' && column.reference?.entityType) {
        // loadReferenceData должен быть определен в этом же <script setup>
        loadReferenceData(column.reference.entityType);
      }
    });

    // Обновляем данные предпросмотра
    updatePreviewData(); // <-- КРИТИЧЕСКИ ВАЖНО
    // === КОНЕЦ БЛОКА ОБНОВЛЕНИЯ СОСТОЯНИЯ ===

  } catch (error) {
    console.error('Ошибка сохранения шаблона:', error);
    ElMessage({ // Используем ElMessage, как в первом фрагменте
      message: error.response?.data?.message || 'Ошибка при сохранении шаблона',
      type: 'error'
    });
  } finally {
    saving.value = false;
  }
};

const loadTemplate = async () => {
  const templateId = route.params.id; // Или как у вас определен
  if (!templateId) return;

  try {
    // ИСПРАВЛЕНИЕ: Используем templateService
    // БЫЛО (пример): const response = await dataSource.get(templateId);
    const response = await templateService.get(templateId); // <-- ИСПРАВЛЕНО

    // Обновляем данные шаблона (используя formatTemplateResponse из templateService)
    template.value.id = response.id;
    template.value.name = response.name;
    template.value.columns = response.columns.map(col => ({
      ...col,
      tempId: col.id || col.tempId || Date.now()
    }));

    // Инициализируем previewData
    Object.keys(previewData.value).forEach(key => delete previewData.value[key]);
    template.value.columns.forEach(col => {
      if (col.tempId) {
        previewData.value[col.tempId] = '';
      }
    });

    // Загружаем данные для всех справочников
    template.value.columns.forEach(column => {
      if (column.type === 'reference' && column.reference?.entityType) {
        loadReferenceData(column.reference.entityType);
      }
    });

    // Обновляем данные предпросмотра
    updatePreviewData(); // <-- КРИТИЧЕСКИ ВАЖНО

  } catch (error) {
    console.error('Ошибка загрузки шаблона:', error);
    ElMessage({ message: 'Не удалось загрузить шаблон', type: 'error' });
    router.push({ name: 'TemplateList' }); // Или другая логика обработки ошибок
  }
};

// Прокрутка к колонке
const scrollToColumn = (index) => {
  if (!columnsList.value || index === null) return;

  const rows = columnsList.value.querySelectorAll('.column-row');
  if (rows.length === 0 || index < 0 || index >= rows.length) return;

  const row = rows[index];
  const rowRect = row.getBoundingClientRect();
  const containerRect = columnsList.value.getBoundingClientRect();

  // Если строка вне видимой области, прокручиваем
  if (rowRect.top < containerRect.top || rowRect.bottom > containerRect.bottom) {
    // Вычисляем позицию прокрутки так, чтобы строка была по центру
    const scrollTop = row.offsetTop - (containerRect.height / 2) + (rowRect.height / 2);
    columnsList.value.scrollTo({
      top: scrollTop,
      behavior: 'smooth'
    });
  }
};

// Хуки
onMounted(async () => {
  const templateId = route.params.id;
  if (templateId) {
    await loadTemplate();
  } else {
    // Инициализируем пустой шаблон
    template.value.id = null;
    template.value.name = '';
    template.value.columns = [];
    // Инициализируем пустой previewData
    Object.keys(previewData.value).forEach(key => delete previewData.value[key]);
     updatePreviewData(); // Не нужно для пустого шаблона
  }
  // Обновляем ширину колонок при первоначальной загрузке
  nextTick(adjustColumnWidths);
});

const adjustColumnWidths = () => {
  console.log("[TemplateBuilder] adjustColumnWidths called");

  // Проверяем, существует ли таблица и есть ли колонки
  if (!previewTable.value || template.value.columns.length === 0) {
    console.log("[TemplateBuilder] No preview table or no columns, skipping width adjustment.");
    // Сбрасываем ширины, если таблицы нет или колонок нет
    if (columnWidths.value.length > 0) {
      columnWidths.value = [];
      console.log("[TemplateBuilder] Reset columnWidths to empty array.");
    }
    return;
  }

  try {
    // Получаем все <th> элементы из таблицы
    // querySelectorAll('th') получит все заголовки, включая "Sort Handle"
    // Поэтому используем более точный селектор, если знаем структуру, или просто пропустим первый
    // Предположим, первая колонка - это "Sort Handle", остальные - данные колонок
    const thElementsNodeList = previewTable.value.querySelectorAll('thead th:not(.sort-handle)');
    console.log(`[TemplateBuilder] Found ${thElementsNodeList.length} data column headers.`);

    // Преобразуем NodeList в массив для удобства
    const thElements = Array.from(thElementsNodeList);

    // Проверяем соответствие количества заголовков и колонок шаблона
    if (thElements.length !== template.value.columns.length) {
      console.warn(`[TemplateBuilder] Mismatch between TH elements (${thElements.length}) and template columns (${template.value.columns.length}). Skipping adjustment.`);
      // Можно сбросить ширины или оставить текущие
      columnWidths.value = Array(template.value.columns.length).fill(100); // Значения по умолчанию
      return;
    }

    const newWidths = [];

    // Измеряем ширину каждого заголовка
    for (let i = 0; i < template.value.columns.length; i++) {
      const th = thElements[i];

      if (th) {
        // scrollWidth включает padding, но не border/margin
        // Добавляем немного запаса для padding, иконок, безопасности
        const measuredWidth = th.scrollWidth + 10;

        // Ограничиваем ширину между минимальной и максимальной
        const constrainedWidth = Math.min(Math.max(measuredWidth, 100), 200);

        newWidths.push(constrainedWidth);
        console.log(`[TemplateBuilder] Column ${i} (${template.value.columns[i].label}): measured=${measuredWidth}px, final=${constrainedWidth}px`);
      } else {
        // Если th не найден, используем значение по умолчанию
        newWidths.push(100);
        console.warn(`[TemplateBuilder] TH element for column ${i} not found, using default width.`);
      }
    }

    columnWidths.value = newWidths;
    console.log("[TemplateBuilder] Updated columnWidths:", newWidths);

  } catch (error) {
    console.error("[TemplateBuilder] Error in adjustColumnWidths:", error);
    // В случае ошибки устанавливаем значения по умолчанию
    columnWidths.value = Array(template.value.columns.length).fill(100);
  }
};

// Вызываем при изменении структуры колонок
watch(() => [
  template.value.columns.length,
  ...template.value.columns.map(c => c.label),
  ...template.value.columns.map(c => c.type)
], () => {
  nextTick(adjustColumnWidths);
}, { deep: true });

// Следим за изменением колонок для обновления предпросмотра
 watch(() => template.value.columns, () => {
   nextTick(() => {
     updatePlaceholderPositions();
     updatePreviewPlaceholder();
   });
 }, { deep: true });

</script>

<style lang="scss" scoped>
/* Стили без изменений */
.template-builder {
  padding: 10px;
  max-width: 1400px;
  margin: 0 auto;

  .builder-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;

    .builder-actions {
      display: flex;
      gap: 5px;

      .el-button {
        height: 32px;
        padding: 0 10px;

        &.is-circle {
          padding: 0;
          width: 28px;
          height: 28px;

          .el-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;

            > svg {
              width: 16px;
              height: 16px;
            }
          }
        }
      }
    }
  }

  .form-section {
    background-color: #fff;
    padding: 10px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.3);
    margin-bottom: 10px;

    :deep(.el-form-item--small) {
      margin-bottom: 2px;

      .el-form-item__content {
        line-height: 28px;

        .el-input__inner,
        .el-select .el-input__inner {
          height: 28px;
          line-height: 28px;
          padding: 0 10px;
        }
      }
    }
  }

  /* Блок предварительного просмотра теперь выше, с margin-bottom вместо margin-top */
  .preview-section {
    background-color: #fff;
    padding: 10px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.3);
    margin-bottom: 10px;

    .table-preview {
      margin-top: 10px;
      overflow-x: auto;

      .preview-empty {
        text-align: center;
        padding: 10px 0;
        font-size: 14px;
      }

      .preview-table-container {
        position: relative;
        min-width: 100%;

        .preview-table {
          width: 100%;
          border-collapse: collapse;

          th, td {
            padding: 2px 6px;
            border: 1px solid #ebeef5;
            text-align: left;
            font-size: 13px;

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
            height: 20px;

            &.active {
              background-color: #ecf5ff;
            }

            &.sort-handle {
              width: 26px;
              cursor: move;
              padding: 0;

              .el-icon {
                width: 100%;
                height: 100%;
              }
            }

            /* Стили для подсветки при drag-and-drop */
            &.preview-dragover-left {
              position: relative;

              &::before {
                content: '';
                position: absolute;
                left: 0;
                top: 0;
                bottom: 0;
                width: 2px;
                background-color: #409eff;
              }
            }

            &.preview-dragover-right {
              position: relative;

              &::after {
                content: '';
                position: absolute;
                right: 0;
                top: 0;
                bottom: 0;
                width: 2px;
                background-color: #409eff;
              }
            }
          }

          td {
            height: 20px;

            &.active {
              background-color: #ecf5ff;
            }

            &.sort-handle {
              width: 26px;
              text-align: center;
              cursor: move;
              padding: 0;

              .el-icon {
                width: 100%;
                height: 100%;
              }
            }

            /* Стили для загрузки справочника */
            &.loading-reference {
              background-color: #f5f7fa;

              .el-icon.is-loading {
                animation: rotating 2s linear infinite;
                margin-right: 5px;
              }
            }
          }
        }

        .preview-drag-placeholder {
          position: absolute;
          background-color: #409eff;
          color: white;
          font-size: 11px;
          padding: 1px 6px;
          border-radius: 2px;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: translateY(-50%);
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
        }
      }
    }
  }

  .builder-content {
    display: flex;
    gap: 5px;

    .columns-section {
      flex: 1;
      background-color: #fff;
      padding: 10px;
      border-radius: 8px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.3);

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;

        .column-creation {
          display: flex;
          align-items: center;
          gap: 5px;

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
              margin-right: 3px;
            }
          }
        }
      }

      .columns-table-container {
        max-height: 300px;
        overflow-y: auto;
        border: 1px solid #ebeef5;
        border-radius: 4px;

        .columns-table {
          width: 100%;

          .column-row {
            display: flex;
            align-items: center;
            padding: 5px;
            border-bottom: 1px solid #ebeef5;
            cursor: pointer;
            transition: background-color 0.2s;

            &:hover {
              background-color: #f5f7fa;
            }

            &.active {
              background-color: #ecf5ff;
              border-left: 3px solid #409eff;
            }

            &:last-child {
              border-bottom: none;
            }

            .sort-handle {
              cursor: move;
              padding: 0 6px;
              color: #909399;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 20px;
              height: 20px;

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
              cursor: pointer;

              .name-header {
                display: flex;
                align-items: center;

                .name-display {
                  display: flex;
                  align-items: center;
                  flex: 1;

                  .name-text {
                    font-weight: 500;
                    margin-right: 6px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 300px;
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
                  min-width: 60px;
                  background-color: #f5f7fa;
                  padding: 1px 4px;
                  border-radius: 2px;
                }
              }

              .inline-edit {
                width: 100%;

                .inline-edit-input {
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
              gap: 3px;

              .el-button {
                padding: 0;
                width: 24px;
                height: 24px;
                border-radius: 2px;

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
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.3);
      overflow: hidden;
      display: flex;
      flex-direction: column;

      .column-settings, .column-settings-placeholder {
        padding: 10px;
        flex: 1;
        overflow-y: auto;

        h4 {
          margin-bottom: 10px;
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
            margin-bottom: 2px;

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
                width: 20px;
                height: 20px;

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
                width: 22px;
                height: 22px;
                min-width: 22px;

                .el-icon {
                  width: 100%;
                  height: 100%;

                  > svg {
                    width: 13px;
                    height: 13px;
                  }
                }
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
            gap: 10px;
            margin-top: 4px;

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
              .format-hint {
                margin-top: 6px;
                font-size: 12px;
                color: #606266;

                .format-key {
                  background-color: #e6f7ff;
                  color: #1890ff;
                  padding: 1px 4px;
                  border-radius: 2px;
                  margin: 0 1px;
                  cursor: move;
                  font-size: 12px;
                }
              }
            }

            .reference-preview {
              padding: 6px 8px;
              background-color: #fafafa;
              border-radius: 2px;
              font-size: 12px;
              margin-top: 4px;
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
        padding: 10px;
      }
    }
  }
}

/* Исправление центровки иконок по горизонтали и вертикали */
.el-button.is-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;

  .el-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;

    > svg {
      width: 14px;
      height: 14px;
    }
  }
}

/* Уменьшение отступа для маленьких форм */
.el-form-item--small {
  margin-bottom: 2px !important;

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

/* Специфичные стили для настроек колонок */
.column-settings {
  .el-form-item {
    margin-bottom: 5px;

    &.el-form-item--small {
      margin-bottom: 2px;
    }

    .el-radio-group {
      line-height: 26px;

      .el-radio {
        line-height: 26px;

        .el-radio__label {
          padding-left: 3px;
          font-size: 12px;
        }
      }
    }
  }
}

/* Стили для drag-and-drop */
.drag-ghost {
  opacity: 0.8;
  background-color: #ecf5ff;
  border: 1px dashed #409eff;
}

.drag-chosen {
  background-color: #ecf5ff;
}

.drag-class {
  display: none;
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

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
