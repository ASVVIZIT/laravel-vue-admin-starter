<template>
  <div class="template-builder">
    <div class="builder-header">
      <div class="header-left">
        <h1>Редактор шаблона</h1>
        <el-form-item label="Название шаблона" prop="name" style="margin-left: 20px; width: 300px;">
          <el-input
              v-model="template.name"
              placeholder="Введите название шаблона"
          />
        </el-form-item>
      </div>
      <div class="header-actions">
        <div class="add-column-section">
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
          <el-button
              type="primary"
              :disabled="!newColumnType"
              @click="addColumn"
          >
            <el-icon><Plus /></el-icon> Добавить колонку
          </el-button>
        </div>
        <el-button @click="cancel">Отмена</el-button>
        <el-button
            type="primary"
            :loading="saving"
            :disabled="!canSave"
            @click="saveTemplate"
        >
          {{ template.id ? 'Сохранить изменения' : 'Создать шаблон' }}
        </el-button>
      </div>
    </div>

    <div class="columns-section">
      <div class="table-container">
        <div class="table-header">
          <div class="header-cell sort-handle"></div>
          <div class="header-cell name">Название колонки</div>
          <div class="header-cell type">Тип данных</div>
          <div class="header-cell settings">Настройки</div>
          <div class="header-cell actions">Действия</div>
        </div>
        <div class="table-rows-wrapper" ref="rowsWrapper">
          <div class="columns-list" ref="columnsList">
            <div
                v-for="(column, index) in template.columns"
                :key="column.tempId"
                class="table-row"
                :class="{
                'dragging': currentDragIndex === index,
                'dragover-top': dragOverIndex === index && dragDirection === 'top',
                'dragover-bottom': dragOverIndex === index && dragDirection === 'bottom',
                'selected': selectedColumnIndex === index
              }"
                @dragover.prevent="dragOver($event, index)"
                @dragenter.prevent="dragEnter($event, index)"
                @dragleave="dragLeave($event, index)"
                @drop="dropItem($event, index)"
                draggable="true"
                @dragstart="startDrag($event, index)"
                @click="selectColumn(index)"
            >
              <div class="cell sort-handle">
                <el-icon :size="18"><Menu /></el-icon>
              </div>
              <div class="cell name">
                <div class="name-cell">
                  <div
                      class="column-title"
                      :title="column.label"
                      @click.stop="startInlineEdit(index)"
                  >
                    {{ column.label }}
                  </div>
                </div>
                <el-input
                    v-if="isEditingColumn(index)"
                    ref="inlineEditInput"
                    v-model="editingColumn.value"
                    @blur="saveInlineEdit"
                    @keyup.enter="saveInlineEdit"
                    @keyup.esc="cancelInlineEdit"
                    @click.stop
                />
              </div>
              <div class="cell type">
                <div class="type-cell">
                  <div
                      class="type-label"
                      @click.stop="startTypeEdit(index)"
                      :class="{ 'editing': editingTypeIndex === index }"
                  >
                    {{ columnTypes.find(t => t.value === column.type)?.label }}
                  </div>
                </div>
                <div
                    v-if="editingTypeIndex === index"
                    class="type-selector-overlay"
                    @click.stop
                >
                  <div class="type-selector">
                    <div class="type-selector-header">
                      <span>Изменить тип колонки</span>
                      <el-icon @click="editingTypeIndex = null"><Close /></el-icon>
                    </div>
                    <div class="type-options">
                      <div
                          v-for="type in columnTypes"
                          :key="type.value"
                          class="type-option"
                          :class="{ 'active': column.type === type.value }"
                          @click="changeColumnType(column, type.value)"
                      >
                        {{ type.label }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="cell settings">
                <div class="settings-content" :class="{ 'expanded': isEditingColumn(index) }">
                  <div v-if="column.type === 'text'">
                    <div class="setting-row">
                      <label>Тип данных:</label>
                      <div class="data-type-selector">
                        <div
                            class="data-type-label"
                            @click.stop="startDataTypeEdit(index)"
                            :class="{ 'editing': editingDataTypeIndex === index }"
                        >
                          {{ dataTypeLabel(column.dataType) }}
                        </div>
                      </div>
                      <div
                          v-if="editingDataTypeIndex === index"
                          class="type-selector-overlay"
                          @click.stop
                      >
                        <div class="type-selector">
                          <div class="type-selector-header">
                            <span>Выберите тип данных</span>
                            <el-icon @click="editingDataTypeIndex = null"><Close /></el-icon>
                          </div>
                          <div class="type-options">
                            <div
                                v-for="type in dataTypes"
                                :key="type.value"
                                class="type-option"
                                :class="{ 'active': column.dataType === type.value }"
                                @click="column.dataType = type.value; editingDataTypeIndex = null"
                            >
                              {{ type.label }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-else-if="column.type === 'number'">
                    <div class="setting-row">
                      <label>Единица измерения:</label>
                      <el-input v-model="column.unit" placeholder="Например: Вт, А, мм" />
                    </div>
                  </div>

                  <div v-else-if="column.type === 'select'">
                    <div class="setting-row">
                      <label>Варианты выбора:</label>
                      <div class="options-list">
                        <div
                            v-for="(option, optIndex) in column.options"
                            :key="optIndex"
                            class="option-item"
                        >
                          <el-input v-model="column.options[optIndex]" />
                          <el-button
                              circle
                              size="small"
                              type="danger"
                              @click.stop="removeOption(column, optIndex)"
                          >
                            <el-icon><Delete /></el-icon>
                          </el-button>
                        </div>
                      </div>
                    </div>
                    <div class="add-option-row">
                      <el-button
                          type="primary"
                          plain
                          size="small"
                          @click="column.options.push('')"
                      >
                        <el-icon><Plus /></el-icon> Добавить вариант
                      </el-button>
                    </div>
                  </div>

                  <!-- Настройки для справочника -->
                  <div v-if="column.type === 'reference'" class="reference-settings">
                    <div class="setting-row">
                      <label>Тип справочника:</label>
                      <div class="select-with-icon">
                        <el-select
                            v-model="column.reference.entityType"
                            placeholder="Выберите тип справочника"
                            filterable
                        >
                          <el-option
                              v-for="tpl in entityTypes"
                              :key="tpl.value"
                              :label="tpl.label"
                              :value="tpl.value"
                          />
                        </el-select>
                      </div>
                    </div>

                    <div class="setting-row">
                      <label>Поля для отображения:</label>
                      <div class="format-builder">
                        <div class="format-keys-container">
                          <div class="format-keys-header">Доступные поля</div>
                          <div class="format-keys">
                            <div
                                v-for="key in getAvailableKeys(column.reference.entityType)"
                                :key="key.key"
                                class="format-key"
                                draggable="true"
                                @dragstart="startKeyDrag($event, key)"
                            >
                              {{ key.label }}
                            </div>
                          </div>
                        </div>
                        <div
                            class="format-input"
                            @dragover.prevent
                            @drop="dropKey($event, column)"
                            @dragenter.prevent
                            @dragleave="dragKeyLeave($event)"
                        >
                          {{ column.reference.displayFormat || getExampleFormat(column.reference.entityType) }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-if="column.type === 'boolean'">
                    <div class="setting-row">
                      <label>Тип отображения:</label>
                      <el-radio-group
                          :model-value="getBooleanSetting(column, 'displayType')"
                          @update:model-value="value => setBooleanSetting(column, 'displayType', value)"
                      >
                        <el-radio label="toggle">Переключатель</el-radio>
                        <el-radio label="checkbox">Чекбокс</el-radio>
                        <el-radio label="text">Текст</el-radio>
                      </el-radio-group>
                    </div>

                    <div v-if="getBooleanSetting(column, 'displayType') === 'text'" class="boolean-text-settings">
                      <div class="text-setting">
                        <span>Да:</span>
                        <el-input
                            :value="getBooleanSetting(column, 'trueLabel')"
                            @input="value => setBooleanSetting(column, 'trueLabel', value)"
                            placeholder="Да"
                        />
                      </div>
                      <div class="text-setting">
                        <span>Нет:</span>
                        <el-input
                            :value="getBooleanSetting(column, 'falseLabel')"
                            @input="value => setBooleanSetting(column, 'falseLabel', value)"
                            placeholder="Нет"
                        />
                      </div>
                    </div>
                  </div>

                  <div v-if="column.type === 'date'">
                    <div class="setting-row">
                      <label>Формат даты:</label>
                      <div class="date-format-selector">
                        <div
                            class="date-format-label"
                            @click.stop="startDateEdit(index)"
                            :class="{ 'editing': editingDateIndex === index }"
                        >
                          {{ dateFormatLabel(column.dateFormat) }}
                        </div>
                      </div>
                      <div
                          v-if="editingDateIndex === index"
                          class="type-selector-overlay"
                          @click.stop
                      >
                        <div class="type-selector">
                          <div class="type-selector-header">
                            <span>Выберите формат даты</span>
                            <el-icon @click="editingDateIndex = null"><Close /></el-icon>
                          </div>
                          <div class="type-options">
                            <div
                                v-for="format in dateFormats"
                                :key="format.value"
                                class="type-option"
                                :class="{ 'active': column.dateFormat === format.value }"
                                @click="column.dateFormat = format.value; editingDateIndex = null"
                            >
                              {{ format.label }} ({{ format.example }})
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="date-example">
                        Пример: {{ formatDateExample(column.dateFormat || 'YYYY-MM-DD') }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="cell actions">
                <el-button
                    circle
                    size="small"
                    @click.stop="startInlineEdit(index)"
                >
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button
                    circle
                    size="small"
                    type="danger"
                    @click.stop="removeColumn(index)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>

            <div
                class="insert-placeholder top"
                v-if="dragOverIndex !== null && dragDirection === 'top' && currentDragIndex !== null"
                :style="{
                top: `${dragPlaceholderTop}px`,
                height: `${dragPlaceholderHeight}px`
              }"
            >
              <div class="placeholder-content">
                <div class="placeholder-line"></div>
                <span>Вставить здесь</span>
              </div>
            </div>

            <div
                class="insert-placeholder bottom"
                v-if="dragOverIndex !== null && dragDirection === 'bottom' && currentDragIndex !== null"
                :style="{
                top: `${dragPlaceholderTop + dragPlaceholderHeight}px`,
                height: `${dragPlaceholderHeight}px`
              }"
            >
              <div class="placeholder-content">
                <div class="placeholder-line"></div>
                <span>Вставить здесь</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="preview-section">
      <h2>Предпросмотр шаблона</h2>
      <div class="preview-table-container">
        <table class="preview-table" ref="previewTable">
          <thead>
          <tr>
            <th
                v-for="(column, index) in template.columns"
                :key="index"
                class="preview-th"
                :class="{
                  'preview-dragover-left': previewDragOverIndex === index && previewDragDirection === 'left',
                  'preview-dragover-right': previewDragOverIndex === index && previewDragDirection === 'right',
                  'preview-selected': selectedPreviewColumnIndex === index
                }"
                @dragover.prevent="previewDragOver($event, index)"
                @dragenter.prevent="previewDragEnter($event, index)"
                @dragleave="previewDragLeave($event, index)"
                @drop="previewDrop($event, index)"
                draggable="true"
                @dragstart="startPreviewDrag($event, index)"
                @click="selectPreviewColumn(index)"
            >
              {{ column.label }}
            </th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td
                v-for="(column, index) in template.columns"
                :key="index"
                class="preview-td"
                :class="{
                  'preview-selected': selectedPreviewColumnIndex === index
                }"
            >
              <div v-if="column.type === 'text'">
                <el-input v-model="previewData[column.tempId]" />
              </div>
              <div v-else-if="column.type === 'number'">
                <el-input-number v-model="previewData[column.tempId]" :min="0" />
              </div>
              <div v-else-if="column.type === 'select'">
                <el-select v-model="previewData[column.tempId]">
                  <el-option
                      v-for="(option, optIndex) in column.options"
                      :key="optIndex"
                      :label="option"
                      :value="option"
                  />
                </el-select>
              </div>
              <div v-else-if="column.type === 'date'">
                <el-date-picker
                    v-model="previewData[column.tempId]"
                    :type="column.dateFormat === 'YYYY-MM-DD' ? 'date' : 'datetime'"
                    placeholder="Выберите дату"
                />
              </div>
              <div v-else-if="column.type === 'boolean'">
                <el-switch
                    v-if="getBooleanSetting(column, 'displayType') === 'toggle'"
                    v-model="previewData[column.tempId]"
                />
                <el-checkbox
                    v-else-if="getBooleanSetting(column, 'displayType') === 'checkbox'"
                    v-model="previewData[column.tempId]"
                />
                <div v-else-if="getBooleanSetting(column, 'displayType') === 'text'" class="boolean-text">
                  <span v-if="previewData[column.tempId]">{{ getBooleanSetting(column, 'trueLabel') || 'Да' }}</span>
                  <span v-else>{{ getBooleanSetting(column, 'falseLabel') || 'Нет' }}</span>
                </div>
              </div>
              <div v-else-if="column.type === 'reference'">
                <el-select
                    v-model="previewData[column.tempId]"
                    @change="simulateReferenceChange(column)"
                >
                  <el-option
                      v-for="item in referenceOptions[column.reference.entityType] || []"
                      :key="item.id"
                      :label="formatReferenceDisplay(item, column)"
                      :value="item.id"
                  />
                </el-select>
              </div>
            </td>
          </tr>
          </tbody>
        </table>

        <div
            class="preview-insert-placeholder"
            v-if="previewPlaceholderHeight > 0"
            :style="{
            top: `${previewPlaceholderTop}px`,
            left: `${previewPlaceholderLeft}px`,
            width: `${previewPlaceholderWidth}px`,
            height: `${previewPlaceholderHeight}px`
          }"
        >
          <div class="placeholder-content">
            <div class="placeholder-line-vertical"></div>
            <span>Вставить здесь</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElNotification } from 'element-plus';
import { Menu, Edit, Delete, Plus, Close } from '@element-plus/icons-vue';
import {
  formatReferenceDisplay,
  getExampleFormat,
  getAvailableKeys,
  getNestedValue
} from './utils/referenceUtils';
import {
  getBooleanSetting,
  setBooleanSetting,
  getBooleanDisplayValue,
  parseBooleanValue
} from './utils/booleanUtils';
import { dataSource } from './services/dataSource';
import dayjs from 'dayjs';

const route = useRoute();
const router = useRouter();
const templateId = route.params.id;

// Состояние
const templateForm = ref(null);
const saving = ref(false);
const previewLoading = ref(false);
const newColumnType = ref(null);
const editingColumn = ref(null);
const inlineEditInput = ref(null);
const editingTypeIndex = ref(null);
const editingDataTypeIndex = ref(null);
const editingDateIndex = ref(null);

// Данные шаблона
const template = reactive({
  id: null,
  name: '',
  columns: []
});

const previewData = reactive({});
const referenceOptions = reactive({
  accessory: [
    { id: 1, brand: { name: 'ABB' }, model: 'SH200', series: 'S200', name: 'ABB SH200' },
    { id: 2, brand: { name: 'Legrand' }, model: 'DX 3', series: 'DX3', name: 'Legrand DX 3' },
    { id: 3, brand: { name: 'IEK' }, model: 'VA47-29', series: 'VA47', name: 'IEK VA47-29' }
  ],
  brand: [
    { id: 1, name: 'ABB', country: 'Швейцария' },
    { id: 2, name: 'Legrand', country: 'Франция' },
    { id: 3, name: 'IEK', country: 'Россия' }
  ],
  device_type: [
    { id: 1, name: 'Автоматический выключатель', code: 'ACB' },
    { id: 2, name: 'УЗО', code: 'RCD' },
    { id: 3, name: 'Дифавтомат', code: 'RCBO' }
  ]
});

// Для редактирования колонок
const inlineEditInputRef = ref(null);

// Для drag-and-drop
const currentDragIndex = ref(null);
const dragOverIndex = ref(null);
const dragDirection = ref(null);
const dragPlaceholderTop = ref(0);
const dragPlaceholderHeight = ref(0);
const rowsWrapper = ref(null);
const columnsList = ref(null);
const originalContainerWidth = ref(null);

// Для синхронизации с превью
const previewDragOverIndex = ref(null);
const previewDragDirection = ref(null);
const currentPreviewColumn = ref(null);
const previewPlaceholderLeft = ref(0);
const previewPlaceholderWidth = ref(0);
const previewPlaceholderTop = ref(0);
const previewPlaceholderHeight = ref(0);
const previewTable = ref(null);
const previewTableHeaders = ref([]);

// Для зеркального выделения
const selectedColumnIndex = ref(null);
const selectedPreviewColumnIndex = ref(null);

// Для drag-and-drop ключей
const currentKeyDrag = ref(null);

// Типы колонок
const columnTypes = [
  { value: 'text', label: 'Текст' },
  { value: 'number', label: 'Число' },
  { value: 'select', label: 'Выбор' },
  { value: 'date', label: 'Дата' },
  { value: 'boolean', label: 'Да/Нет' },
  { value: 'reference', label: 'Справочник' }
];

// Типы данных для текстовых колонок
const dataTypes = [
  { value: 'string', label: 'Строка' },
  { value: 'email', label: 'Email' },
  { value: 'url', label: 'URL' },
  { value: 'phone', label: 'Телефон' }
];

// Типы сущностей для справочников
const entityTypes = [
  { value: 'accessory', label: 'Аксессуары' },
  { value: 'brand', label: 'Бренды' },
  { value: 'device_type', label: 'Типы устройств' }
];

// Форматы даты
const dateFormats = [
  { value: 'YYYY-MM-DD', label: 'Год-Месяц-День', example: '2023-10-15' },
  { value: 'DD.MM.YYYY', label: 'День.Месяц.Год', example: '15.10.2023' },
  { value: 'MM/DD/YYYY', label: 'Месяц/День/Год', example: '10/15/2023' },
  { value: 'DD MMM YYYY', label: 'День Месяц Год', example: '15 Oct 2023' },
  { value: 'YYYY/MM/DD', label: 'Год/Месяц/День', example: '2023/10/15' },
  { value: 'DD-MM-YYYY', label: 'День-Месяц-Год', example: '15-10-2023' }
];

// Загрузка шаблона
const loadTemplate = async () => {
  try {
    previewLoading.value = true;

    if (templateId) {
      const response = await dataSource.fetchTemplate(templateId);

      // Проверяем корректность данных
      if (!response || !response.id || !response.name) {
        throw new Error('Некорректный формат данных шаблона');
      }

      // Инициализируем шаблон
      template.id = response.id;
      template.name = response.name;

      // Обработка колонок
      if (response.columns && Array.isArray(response.columns)) {
        template.columns = response.columns.map(col => {
          const fixedCol = {
            ...col,
            label: col.label ? String(col.label) : '',
            tempId: col.id || Date.now(),
            // Гарантируем наличие структуры для reference
            reference: col.type === 'reference' ? {
              entityType: col.reference?.entityType || 'accessory',
              displayFormat: col.reference?.displayFormat || getExampleFormat(col.reference?.entityType || 'accessory')
            } : undefined,
            // Гарантируем наличие структуры для boolean
            booleanSettings: col.type === 'boolean' ? {
              displayType: col.booleanSettings?.displayType || 'toggle',
              trueLabel: col.booleanSettings?.trueLabel || 'Да',
              falseLabel: col.booleanSettings?.falseLabel || 'Нет'
            } : undefined,
            // Гарантируем наличие структуры для date
            dateFormat: col.type === 'date' ? col.dateFormat || 'YYYY-MM-DD' : undefined
          };
          return fixedCol;
        });
      } else {
        template.columns = [];
      }

      // Инициализируем previewData
      Object.keys(previewData).forEach(key => delete previewData[key]);
      template.columns.forEach(col => {
        if (col.tempId) {
          previewData[col.tempId] = '';
        }
      });

      // Загружаем данные для справочников
      template.columns.forEach(column => {
        if (column.type === 'reference' && column.reference?.entityType) {
          loadReferenceData(column.reference.entityType);
        }
      });
    } else {
      // Создание нового шаблона
      template.id = null;
      template.name = '';
      template.columns = [];

      // Инициализируем previewData
      Object.keys(previewData).forEach(key => delete previewData[key]);
    }
  } catch (error) {
    console.error('Ошибка загрузки шаблона:', error);
    let errorMessage = 'Не удалось загрузить шаблон';
    if (error.message.includes('Некорректный формат данных')) {
      errorMessage = 'Получены некорректные данные от сервера. Попробуйте позже.';
    }
    ElMessage.error(errorMessage);
    router.push({ name: 'TemplateList' });
  } finally {
    previewLoading.value = false;
  }
};

// Загрузка данных справочника
const loadReferenceData = async (entityType) => {
  try {
    // В реальном приложении здесь будет запрос к API справочника
    // Для примера используем моковые данные
    await new Promise(resolve => setTimeout(resolve, 500));

    // Данные уже загружены
    if (referenceOptions[entityType] && referenceOptions[entityType].length > 0) {
      return;
    }

    // Загружаем моковые данные
    switch (entityType) {
      case 'accessory':
        referenceOptions[entityType] = [
          { id: 1, brand: { name: 'ABB' }, model: 'SH200', series: 'S200', name: 'ABB SH200' },
          { id: 2, brand: { name: 'Legrand' }, model: 'DX 3', series: 'DX3', name: 'Legrand DX 3' },
          { id: 3, brand: { name: 'IEK' }, model: 'VA47-29', series: 'VA47', name: 'IEK VA47-29' }
        ];
        break;
      case 'brand':
        referenceOptions[entityType] = [
          { id: 1, name: 'ABB', country: 'Швейцария' },
          { id: 2, name: 'Legrand', country: 'Франция' },
          { id: 3, name: 'IEK', country: 'Россия' }
        ];
        break;
      case 'device_type':
        referenceOptions[entityType] = [
          { id: 1, name: 'Автоматический выключатель', code: 'ACB' },
          { id: 2, name: 'УЗО', code: 'RCD' },
          { id: 3, name: 'Дифавтомат', code: 'RCBO' }
        ];
        break;
      default:
        referenceOptions[entityType] = [];
    }
  } catch (error) {
    console.error('Ошибка загрузки данных справочника:', error);
    ElMessage.error('Не удалось загрузить данные справочника');
  }
};

// Получение примера формата для справочника
const getFormattedReferencePreview = (column) => {
  if (column.type !== 'reference' || !column.reference?.entityType) {
    return '';
  }

  const entityType = column.reference.entityType;
  const items = referenceOptions[entityType];

  if (!items || items.length === 0) {
    return 'Пример отображения';
  }

  const item = items[0];
  return formatReferenceDisplay(item, column);
};

// Начать inline-редактирование колонки
const startInlineEdit = (index) => {
  const column = template.columns[index];
  editingColumn.value = {
    index,
    value: column.label ? String(column.label) : '',
    originalValue: column.label ? String(column.label) : '',
    tempId: column.tempId
  };
  nextTick(() => {
    if (inlineEditInput.value) {
      inlineEditInput.value.focus();
      if (inlineEditInput.value.select) {
        inlineEditInput.value.select();
      }
    }
  });
};

// Сохранить inline-редактирование
const saveInlineEdit = () => {
  if (editingColumn.value) {
    const { index, value } = editingColumn.value;
    if (value.trim() !== '') {
      template.columns[index].label = String(value || '');
    }
    editingColumn.value = null;
  }
};

// Отменить inline-редактирование
const cancelInlineEdit = () => {
  if (editingColumn.value) {
    const { index, originalValue } = editingColumn.value;
    template.columns[index].label = String(originalValue || '');
    editingColumn.value = null;
  }
};

// Проверка, редактируется ли колонка
const isEditingColumn = (index) => {
  return editingColumn.value && editingColumn.value.index === index;
};

// Начать редактирование типа колонки
const startTypeEdit = (index) => {
  editingTypeIndex.value = index;
};

// Начать редактирование типа данных для текстовой колонки
const startDataTypeEdit = (index) => {
  editingDataTypeIndex.value = index;
};

// Начать редактирование формата даты
const startDateEdit = (index) => {
  editingDateIndex.value = index;
};

// Удаление колонки
const removeColumn = (index) => {
  const column = template.columns[index];

  // Удаляем данные из previewData
  if (column.tempId && previewData[column.tempId] !== undefined) {
    delete previewData[column.tempId];
  }

  // Удаляем колонку
  template.columns.splice(index, 1);
};

// Добавление колонки
const addColumn = () => {
  if (!newColumnType.value) return;

  const tempId = Date.now();
  const newColumn = {
    tempId,
    type: newColumnType.value,
    label: `Новая колонка ${template.columns.length + 1}`,
    order: template.columns.length,
    options: []
  };

  // Инициализация специфичных полей для каждого типа
  switch (newColumnType.value) {
    case 'reference':
      newColumn.reference = {
        entityType: 'accessory',
        displayFormat: getExampleFormat('accessory')
      };
      break;

    case 'boolean':
      newColumn.booleanSettings = {
        displayType: 'toggle',
        trueLabel: 'Да',
        falseLabel: 'Нет'
      };
      break;

    case 'date':
      newColumn.dateFormat = 'YYYY-MM-DD';
      break;

    case 'select':
      newColumn.options = ['Вариант 1', 'Вариант 2'];
      break;
  }

  template.columns.push(newColumn);

  // Инициализируем previewData для новой колонки
  previewData[tempId] = '';

  // Сбрасываем выбор типа колонки
  newColumnType.value = null;
};

// Изменение типа колонки
const changeColumnType = (column, newType) => {
  // Сохраняем текущие настройки, которые могут быть сохранены
  const currentLabel = column.label;
  const currentOptions = column.options || [];

  // Очищаем существующие настройки
  column.type = newType;
  column.label = currentLabel;

  // Инициализация специфичных полей для каждого типа
  switch (newType) {
    case 'reference':
      column.reference = {
        entityType: 'accessory',
        displayFormat: getExampleFormat('accessory')
      };
      break;

    case 'boolean':
      column.booleanSettings = {
        displayType: 'toggle',
        trueLabel: 'Да',
        falseLabel: 'Нет'
      };
      break;

    case 'date':
      column.dateFormat = 'YYYY-MM-DD';
      break;

    case 'select':
      column.options = currentOptions.length > 0 ? currentOptions : ['Вариант 1', 'Вариант 2'];
      break;

    case 'number':
      column.unit = column.unit || '';
      break;

    case 'text':
      column.dataType = column.dataType || 'string';
      break;
  }

  // Скрываем селектор типов
  editingTypeIndex.value = null;
};

// Удаление варианта выбора
const removeOption = (column, index) => {
  column.options.splice(index, 1);
};

// Валидация формы
const validateForm = async () => {
  try {
    await templateForm.value.validate();
    return true;
  } catch (error) {
    ElMessage.error('Пожалуйста, заполните обязательные поля');
    return false;
  }
};

// Подготовка данных для сохранения
const prepareTemplateData = () => {
  const fixedColumns = template.columns.map(column => {
    const baseColumn = {
      type: column.type,
      label: String(column.label || ''),
      order: column.order
    };

    // Добавляем специфичные данные для каждого типа
    switch (column.type) {
      case 'reference':
        baseColumn.reference = {
          entityType: column.reference?.entityType || 'accessory',
          displayFormat: column.reference?.displayFormat || getExampleFormat(column.reference?.entityType || 'accessory')
        };
        break;

      case 'select':
        baseColumn.options = column.options || [];
        break;

      case 'boolean':
        baseColumn.booleanSettings = {
          displayType: column.booleanSettings?.displayType || 'toggle',
          trueLabel: column.booleanSettings?.trueLabel || 'Да',
          falseLabel: column.booleanSettings?.falseLabel || 'Нет'
        };
        break;

      case 'date':
        baseColumn.dateFormat = column.dateFormat || 'YYYY-MM-DD';
        break;

      case 'number':
        baseColumn.unit = column.unit || '';
        break;

      case 'text':
        baseColumn.dataType = column.dataType || 'string';
        break;
    }

    return baseColumn;
  });

  return {
    name: template.name,
    columns: fixedColumns
  };
};

// Сохранение шаблона
const saveTemplate = async () => {
  if (!await validateForm()) return;

  try {
    saving.value = true;
    const templateData = prepareTemplateData();

    let response;
    if (template.id) {
      response = await dataSource.updateTemplate(template.id, templateData);
      template.id = response.id;
      ElNotification.success('Шаблон успешно обновлен');
    } else {
      response = await dataSource.createTemplate(templateData);
      template.id = response.id;
      ElNotification.success('Шаблон успешно создан');

      // После создания шаблона полностью перезагружаем его данные
      await loadTemplate();

      if (!templateId) {
        router.push({ name: 'TemplateEdit', params: { id: template.id } });
      }
    }
  } catch (error) {
    console.error('Ошибка сохранения шаблона:', error);
    ElMessage.error('Ошибка сохранения шаблона: ' + (error.response?.data?.message || error.message));
  } finally {
    saving.value = false;
  }
};

// Отмена изменений
const cancel = () => {
  router.push({ name: 'TemplateList' });
};

// Drag-and-drop методы для списка колонок
const startDrag = (event, index) => {
  event.dataTransfer.setData('index', index);
  currentDragIndex.value = index;
  currentPreviewColumn.value = index;

  // Сохраняем оригинальную ширину контейнера для предотвращения появления прокрутки
  if (columnsList.value) {
    originalContainerWidth.value = columnsList.value.style.width;
    columnsList.value.style.width = `${columnsList.value.offsetWidth}px`;
  }

  // Обновляем позиции заполнителей
  nextTick(() => {
    updatePlaceholderPositions();
    updatePreviewPlaceholder();
  });
};

const dragEnter = (event, index) => {
  event.preventDefault();

  // Не обрабатываем, если это дочерний элемент
  const targetRow = event.target.closest('.table-row');
  if (!targetRow) return;

  const rect = targetRow.getBoundingClientRect();
  const y = event.clientY - rect.top;

  // Определяем направление вставки
  if (y < rect.height / 2) {
    dragDirection.value = 'top';
  } else {
    dragDirection.value = 'bottom';
  }

  dragOverIndex.value = index;

  // Обновляем позиции заполнителей
  nextTick(() => {
    updatePlaceholderPositions();
    updatePreviewPlaceholder();
  });
};

const dragOver = (event, index) => {
  event.preventDefault();

  // Обновляем направление вставки при движении мыши
  const targetRow = event.target.closest('.table-row');
  if (!targetRow) return;

  const rect = targetRow.getBoundingClientRect();
  const y = event.clientY - rect.top;

  if (y < rect.height / 2) {
    dragDirection.value = 'top';
  } else {
    dragDirection.value = 'bottom';
  }

  dragOverIndex.value = index;

  // Обновляем позиции заполнителей
  nextTick(() => {
    updatePlaceholderPositions();
    updatePreviewPlaceholder();
  });
};

const dragLeave = (event, index) => {
  // Проверяем, уходим ли мы за пределы текущего элемента
  const rect = event.target.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  if (x < 0 || x >= rect.width || y < 0 || y >= rect.height) {
    // Сбрасываем, только если уходим за пределы
    if (dragOverIndex.value === index) {
      dragOverIndex.value = null;
      dragDirection.value = null;

      nextTick(() => {
        updatePlaceholderPositions();
        updatePreviewPlaceholder();
      });
    }
  }
};

const dropItem = (event, targetIndex) => {
  event.preventDefault();
  const sourceIndex = parseInt(event.dataTransfer.getData('index'));

  if (sourceIndex === targetIndex || sourceIndex === undefined || targetIndex === undefined) {
    resetDragState();
    return;
  }

  // Перемещаем элемент
  const newColumns = [...template.columns];
  const [movedItem] = newColumns.splice(sourceIndex, 1);

  // Корректируем targetIndex после удаления элемента
  let adjustedTargetIndex;
  if (dragDirection.value === 'top') {
    adjustedTargetIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
  } else {
    adjustedTargetIndex = sourceIndex < targetIndex ? targetIndex : targetIndex + 1;
  }

  newColumns.splice(adjustedTargetIndex, 0, movedItem);

  // Обновляем порядок
  template.columns = newColumns.map((col, idx) => ({
    ...col,
    order: idx
  }));

  // Сбрасываем состояние drag-and-drop
  resetDragState();
};

const resetDragState = () => {
  currentDragIndex.value = null;
  dragOverIndex.value = null;
  dragDirection.value = null;

  // Восстанавливаем оригинальную ширину контейнера
  if (columnsList.value && originalContainerWidth.value !== null) {
    columnsList.value.style.width = originalContainerWidth.value;
    originalContainerWidth.value = null;
  }
};

// Зеркальное выделение колонок
const selectColumn = (index) => {
  selectedColumnIndex.value = index;
  selectedPreviewColumnIndex.value = index;
  scrollToColumn(index);
};

const selectPreviewColumn = (index) => {
  selectedPreviewColumnIndex.value = index;
  selectedColumnIndex.value = index;
  scrollToPreviewColumn(index);
  scrollToColumn(index);
};

const scrollToColumn = (index) => {
  if (!columnsList.value || index === null) return;

  const rows = columnsList.value.querySelectorAll('.table-row');
  if (index >= 0 && index < rows.length) {
    const row = rows[index];
    const rowRect = row.getBoundingClientRect();
    const container = columnsList.value;
    const containerRect = container.getBoundingClientRect();

    // Если строка вне видимой области, прокручиваем
    if (rowRect.top < containerRect.top || rowRect.bottom > containerRect.bottom) {
      // Вычисляем позицию прокрутки так, чтобы строка была по центру
      const scrollTop = row.offsetTop - (container.offsetHeight / 2) + (row.offsetHeight / 2);
      container.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      });
    }
  }
};

const scrollToPreviewColumn = (index) => {
  if (!previewTable.value || index === null) return;

  const headers = previewTable.value.querySelectorAll('th');
  if (index >= 0 && index < headers.length) {
    const header = headers[index];
    const headerRect = header.getBoundingClientRect();
    const container = previewTable.value.parentElement;
    const containerRect = container.getBoundingClientRect();

    // Если колонка вне видимой области, прокручиваем
    if (headerRect.left < containerRect.left || headerRect.right > containerRect.right) {
      // Вычисляем позицию прокрутки так, чтобы колонка была по центру
      const scrollLeft = header.offsetLeft - (container.offsetWidth / 2) + (header.offsetWidth / 2);
      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
  }
};

// Методы для drag-and-drop в превью
const startPreviewDrag = (event, index) => {
  event.dataTransfer.setData('preview-index', index);
  currentPreviewColumn.value = index;
  currentDragIndex.value = index;

  // Обновляем позиции заполнителей
  nextTick(() => {
    updatePlaceholderPositions();
    updatePreviewPlaceholder();
  });
};

const previewDragOver = (event, index) => {
  event.preventDefault();

  // Не обрабатываем, если это дочерний элемент
  const targetHeader = event.target.closest('.preview-th');
  if (!targetHeader) return;

  const rect = targetHeader.getBoundingClientRect();
  const x = event.clientX - rect.left;

  // Определяем направление вставки
  if (x < rect.width / 2) {
    previewDragDirection.value = 'left';
  } else {
    previewDragDirection.value = 'right';
  }

  previewDragOverIndex.value = index;

  // Синхронизируем с направлением в списке колонок
  dragDirection.value = previewDragDirection.value === 'left' ? 'top' : 'bottom';
  dragOverIndex.value = index;

  // Обновляем позиции заполнителей
  nextTick(() => {
    updatePlaceholderPositions();
    updatePreviewPlaceholder();
  });
};

const previewDragEnter = (event, index) => {
  event.preventDefault();

  // Не обрабатываем, если это дочерний элемент
  const targetHeader = event.target.closest('.preview-th');
  if (!targetHeader) return;

  const rect = targetHeader.getBoundingClientRect();
  const x = event.clientX - rect.left;

  // Определяем направление вставки
  if (x < rect.width / 2) {
    previewDragDirection.value = 'left';
  } else {
    previewDragDirection.value = 'right';
  }

  previewDragOverIndex.value = index;

  // Синхронизируем с направлением в списке колонок
  dragDirection.value = previewDragDirection.value === 'left' ? 'top' : 'bottom';
  dragOverIndex.value = index;

  // Обновляем позиции заполнителей
  nextTick(() => {
    updatePlaceholderPositions();
    updatePreviewPlaceholder();
  });
};

const previewDragLeave = (event, index) => {
  // Проверяем, уходим ли мы за пределы текущего элемента
  const targetHeader = event.target.closest('.preview-th');
  if (!targetHeader) return;

  const rect = targetHeader.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  if (x < 0 || x >= rect.width || y < 0 || y >= rect.height) {
    // Сбрасываем, только если уходим за пределы
    if (previewDragOverIndex.value === index) {
      previewDragOverIndex.value = null;
      previewDragDirection.value = null;
      dragOverIndex.value = null;
      dragDirection.value = null;

      nextTick(() => {
        updatePlaceholderPositions();
        updatePreviewPlaceholder();
      });
    }
  }
};

const previewDrop = (event, targetIndex) => {
  event.preventDefault();
  const sourceIndex = parseInt(event.dataTransfer.getData('preview-index'));

  if (sourceIndex === targetIndex || sourceIndex === undefined || targetIndex === undefined) {
    resetDragState();
    return;
  }

  // Перемещаем элемент
  const newColumns = [...template.columns];
  const [movedItem] = newColumns.splice(sourceIndex, 1);

  // Корректируем targetIndex после удаления элемента
  let adjustedTargetIndex;
  if (previewDragDirection.value === 'left') {
    adjustedTargetIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
  } else {
    adjustedTargetIndex = sourceIndex < targetIndex ? targetIndex : targetIndex + 1;
  }

  newColumns.splice(adjustedTargetIndex, 0, movedItem);

  // Обновляем порядок
  template.columns = newColumns.map((col, idx) => ({
    ...col,
    order: idx
  }));

  // Сбрасываем состояние drag-and-drop
  resetDragState();
};

// Обновление позиций заполнителей
const updatePlaceholderPositions = () => {
  if (dragOverIndex.value === null || !columnsList.value) return;

  const rows = columnsList.value.querySelectorAll('.table-row');
  if (rows.length === 0) return;

  // Вычисляем высоту строки
  const rowHeight = rows[0].offsetHeight;
  dragPlaceholderHeight.value = rowHeight;

  // Вычисляем позицию
  let top = 0;
  for (let i = 0; i < dragOverIndex.value; i++) {
    top += rowHeight;
  }

  dragPlaceholderTop.value = top;
};

// Обновление позиции заполнителя в превью
const updatePreviewPlaceholder = () => {
  if (!previewTable.value || previewDragOverIndex.value === null) {
    previewPlaceholderLeft.value = 0;
    previewPlaceholderWidth.value = 0;
    previewPlaceholderTop.value = 0;
    previewPlaceholderHeight.value = 0;
    return;
  }

  const thElements = previewTable.value.querySelectorAll('th');
  if (previewDragOverIndex.value >= thElements.length) {
    previewPlaceholderLeft.value = 0;
    previewPlaceholderWidth.value = 0;
    previewPlaceholderTop.value = 0;
    previewPlaceholderHeight.value = 0;
    return;
  }

  const targetHeader = thElements[previewDragOverIndex.value];
  const rect = targetHeader.getBoundingClientRect();
  const containerRect = previewTable.value.parentElement.getBoundingClientRect();

  // Вычисляем позицию и размеры
  if (previewDragDirection.value === 'left') {
    previewPlaceholderLeft.value = rect.left - containerRect.left;
    previewPlaceholderWidth.value = 2;
  } else {
    previewPlaceholderLeft.value = rect.left - containerRect.left + rect.width;
    previewPlaceholderWidth.value = 2;
  }

  previewPlaceholderTop.value = 0;
  previewPlaceholderHeight.value = rect.height;

  // Для превью таблицы - делаем заполнитель более заметным
  const tableBody = previewTable.value.querySelector('tbody');
  if (tableBody) {
    previewPlaceholderTop.value = tableBody.offsetTop;
  }
};

// Drag-and-drop методы для ключей справочников
const startKeyDrag = (event, key) => {
  event.dataTransfer.setData('key', JSON.stringify(key));
  currentKeyDrag.value = key;
};

const dropKey = (event, column) => {
  event.preventDefault();

  if (!currentKeyDrag.value) return;

  try {
    const key = currentKeyDrag.value;

    // Обновляем формат отображения
    if (!column.reference) {
      column.reference = {
        entityType: 'accessory',
        displayFormat: `{${key.key}}`
      };
    } else {
      if (!column.reference.displayFormat) {
        column.reference.displayFormat = `{${key.key}}`;
      } else {
        column.reference.displayFormat += `{${key.key}}`;
      }
    }
  } finally {
    currentKeyDrag.value = null;
  }
};

const dragKeyLeave = (event) => {
  // Проверяем, уходим ли мы за пределы контейнера
  const rect = event.target.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  if (x < 0 || x >= rect.width || y < 0 || y >= rect.height) {
    currentKeyDrag.value = null;
  }
};

// Эмуляция изменения справочника в превью
const simulateReferenceChange = (column) => {
  // Эмуляция автозаполнения в превью
  const referenceId = previewData[column.tempId];
  if (!referenceId) return;

  // Находим данные справочника
  if (!column.reference) return;
  const referenceItem = referenceOptions[column.reference.entityType].find(item => item.id === referenceId);
  if (!referenceItem) return;
};

// Форматирование примера даты
const formatDateExample = (format) => {
  return dayjs().format(format);
};

// Получение текстового представления типа данных
const dataTypeLabel = (dataType) => {
  const type = dataTypes.find(t => t.value === dataType);
  return type ? type.label : 'Строка';
};

// Получение текстового представления формата даты
const dateFormatLabel = (format) => {
  const type = dateFormats.find(t => t.value === format);
  return type ? `${type.label} (${type.example})` : 'Год-Месяц-День (2023-10-15)';
};

// Инициализация
onMounted(async () => {
  await loadTemplate();

  // Инициализация позиций для заполнителей
  nextTick(() => {
    updatePlaceholderPositions();
    updatePreviewPlaceholder();
  });

  // Обновляем позиции при изменении количества колонок
  watch(() => template.columns.length, () => {
    nextTick(() => {
      updatePlaceholderPositions();
      updatePreviewPlaceholder();
    });
  });
});
</script>

<style lang="scss" scoped>
.template-builder {
  padding: 20px;
  background-color: #fff;

  .builder-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;

    .header-left {
      display: flex;
      align-items: center;
      flex: 1;

      h1 {
        margin: 0;
        font-size: 24px;
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;

      .add-column-section {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-right: 20px;
      }
    }
  }

  .columns-section {
    margin-top: 15px;

    .table-container {
      border: 1px solid #ebeef5;
      border-radius: 4px;
      overflow: hidden;
      background-color: #fff;

      .table-header {
        display: flex;
        background-color: #f5f7fa;
        font-weight: 600;
        position: sticky;
        top: 0;
        z-index: 10;

        .header-cell {
          padding: 6px 10px;
          border-bottom: 1px solid #ebeef5;
          box-sizing: border-box;

          &.sort-handle {
            width: 40px;
          }

          &.name {
            flex: 1;
          }

          &.type {
            width: 150px;
          }

          &.settings {
            flex: 2;
          }

          &.actions {
            width: 120px;
            text-align: center;
          }
        }
      }

      .table-rows-wrapper {
        overflow-y: auto;
        flex: 1;
        min-height: 230px;
        max-height: 400px;
        position: relative;
        overflow-x: hidden;

        .columns-list {
          width: 100%;
          position: relative;
          transition: transform 0.3s ease;
          height: 100%;

          .table-row {
            display: flex;
            border-bottom: 1px solid #ebeef5;
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            font-size: 13px;
            background-color: #fff;
            position: relative;
            z-index: 1;
            will-change: transform, box-shadow;
            cursor: pointer;
            margin-bottom: 1px;

            &:last-child {
              border-bottom: none;
            }

            &:hover {
              background-color: #f9fafc;
            }

            &.dragging {
              opacity: 0.9;
              z-index: 100;
              border: 1px solid #409EFF;
              border-radius: 4px;
              transition: all 0.2s ease;
            }

            &.dragover-top {
              &::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 2px;
                background: #409EFF;
                border-radius: 1px;
              }
            }

            &.dragover-bottom {
              &::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 2px;
                background: #409EFF;
                border-radius: 1px;
              }
            }

            &.selected {
              background-color: #e6f7ff;
              border: 1px solid #409EFF;
              transition: all 0.2s ease;
              box-shadow: 0 0 0 1px #409EFF;
            }

            .cell {
              padding: 4px 8px;
              border-right: 1px solid #ebeef5;
              box-sizing: border-box;
              transition: background-color 0.2s ease;
              position: relative;

              &:last-child {
                border-right: none;
              }

              &.sort-handle {
                width: 40px;
                display: flex;
                align-items: center;
                justify-content: center;

                .drag-handle {
                  cursor: move;
                  color: #909399;
                  opacity: 0.7;
                  user-select: none;
                  transition: opacity 0.2s ease;

                  &:hover {
                    opacity: 1;
                  }
                }
              }

              &.name {
                flex: 1;
                min-width: 0;

                .name-cell {
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  position: relative;

                  .column-title {
                    flex: 1;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    line-height: 1.4;
                    padding-right: 20px;
                    cursor: pointer;

                    &:hover {
                      text-decoration: underline;
                    }
                  }
                }

                :deep(.el-input__inner) {
                  padding: 0;
                  border: none;
                  background: transparent;
                  font-weight: 500;

                  &:focus {
                    border-color: #409EFF;
                  }
                }
              }

              &.type {
                width: 150px;

                .type-cell {
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  position: relative;

                  .type-label {
                    flex: 1;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    line-height: 1.4;
                    padding-right: 20px;
                    cursor: pointer;
                    color: #606266;

                    &.editing {
                      color: #409EFF;
                      font-weight: 500;
                    }

                    &:hover {
                      text-decoration: underline;
                    }
                  }
                }

                .type-selector-overlay {
                  position: absolute;
                  top: 100%;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  background: rgba(0, 0, 0, 0.1);
                  z-index: 5;
                  display: flex;
                  justify-content: center;
                  align-items: center;

                  .type-selector {
                    background: white;
                    border-radius: 4px;
                    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
                    width: 240px;
                    max-height: 300px;
                    overflow: hidden;

                    .type-selector-header {
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                      padding: 8px 12px;
                      background: #f5f7fa;
                      border-bottom: 1px solid #ebeef5;
                      font-weight: 500;

                      .el-icon {
                        cursor: pointer;
                        &:hover {
                          color: #409EFF;
                        }
                      }
                    }

                    .type-options {
                      padding: 8px 0;
                      max-height: 250px;
                      overflow-y: auto;

                      .type-option {
                        padding: 8px 12px;
                        cursor: pointer;
                        transition: background 0.2s;

                        &:hover {
                          background: #f5f7fa;
                        }

                        &.active {
                          color: #409EFF;
                          font-weight: 500;
                          background: #f0f9ff;
                        }
                      }
                    }
                  }
                }
              }

              &.settings {
                flex: 2;
                min-height: 120px;
                max-height: 120px;
                overflow-y: auto;
                padding: 4px 0;

                .settings-content {
                  height: auto;
                  min-height: 100px;
                  transition: min-height 0.3s ease;

                  &.expanded {
                    min-height: 120px;
                  }

                  .setting-row {
                    margin-bottom: 8px;

                    label {
                      display: block;
                      margin-bottom: 4px;
                      font-size: 12px;
                      color: #606266;
                    }

                    .data-type-selector,
                    .date-format-selector {
                      display: flex;
                      align-items: center;
                      justify-content: space-between;
                      position: relative;
                      cursor: pointer;

                      .data-type-label,
                      .date-format-label {
                        flex: 1;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        line-height: 1.4;
                        padding-right: 20px;
                        color: #606266;

                        &.editing {
                          color: #409EFF;
                          font-weight: 500;
                        }

                        &:hover {
                          text-decoration: underline;
                        }
                      }
                    }

                    .select-with-icon {
                      position: relative;

                      :deep(.el-select) {
                        width: 100%;
                      }

                      :deep(.el-input__suffix) {
                        right: 5px;
                      }
                    }
                  }

                  .options-list {
                    .option-item {
                      display: flex;
                      align-items: center;
                      margin-bottom: 8px;

                      :deep(.el-input) {
                        flex: 1;
                        margin-right: 8px;
                      }
                    }
                  }

                  .reference-settings {
                    .format-builder {
                      display: flex;
                      flex-direction: column;
                      gap: 8px;
                      margin-top: 4px;

                      .format-keys-container {
                        border: 1px solid #ebeef5;
                        border-radius: 4px;
                        overflow: hidden;

                        .format-keys-header {
                          background-color: #f5f7fa;
                          padding: 4px 8px;
                          font-weight: 500;
                          font-size: 12px;
                          border-bottom: 1px solid #ebeef5;
                        }

                        .format-keys {
                          max-height: 230px;
                          overflow-y: auto;
                          padding: 4px;
                          background-color: #fafafa;
                          display: flex;
                          flex-wrap: wrap;
                          gap: 4px;

                          .format-key {
                            padding: 4px 8px;
                            margin-bottom: 4px;
                            background-color: #fff;
                            border: 1px solid #ebeef5;
                            border-radius: 4px;
                            cursor: grab;
                            font-size: 12px;
                            transition: all 0.2s ease;

                            &:active {
                              cursor: grabbing;
                            }

                            &:hover {
                              background-color: #f5f7fa;
                              border-color: #dcdfe6;
                            }
                          }
                        }
                      }

                      .format-input {
                        padding: 8px;
                        min-height: 32px;
                        border: 1px dashed #ebeef5;
                        border-radius: 4px;
                        background-color: #fafafa;
                        font-family: monospace;
                        font-size: 13px;
                        color: #606266;
                        transition: all 0.2s ease;
                        word-break: break-all;

                        &:hover {
                          border-color: #dcdfe6;
                        }
                      }
                    }
                  }

                  .boolean-text-settings {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    margin-top: 4px;

                    .text-setting {
                      display: flex;
                      align-items: center;
                      gap: 5px;

                      span {
                        width: 30px;
                        font-size: 12px;
                        color: #606266;
                      }

                      :deep(.el-input) {
                        width: 120px;
                      }
                    }
                  }

                  .date-example {
                    font-size: 11px;
                    color: #909399;
                    margin-top: 4px;
                  }
                }

                .add-option-row {
                  margin-top: 8px;
                  padding-top: 8px;
                  border-top: 1px solid #ebeef5;
                }
              }

              &.actions {
                width: 120px;
                text-align: center;

                :deep(.el-button) {
                  padding: 4px;

                  .el-icon {
                    font-size: 16px;
                  }
                }
              }
            }
          }
        }
      }

      /* Заполнители для вставки */
      .insert-placeholder {
        position: absolute;
        left: 0;
        right: 0;
        background: rgba(64, 158, 255, 0.15);
        border: 2px dashed #409EFF;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: pulse 1.5s infinite;
        z-index: 5;
        transition: all 0.3s ease;
        pointer-events: none;
        box-sizing: border-box;

        .placeholder-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #409EFF;
          font-size: 12px;
          font-weight: 500;

          .placeholder-line {
            width: 80%;
            height: 2px;
            background: linear-gradient(180deg, #409EFF, rgba(64, 158, 255, 0.3));
            border-radius: 1px;
            margin: 0 4px;
          }
        }
      }
    }
  }

  .preview-section {
    margin-top: 30px;

    h2 {
      margin-bottom: 15px;
      font-size: 20px;
    }

    .preview-table-container {
      position: relative;
      overflow-x: auto;

      .preview-table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
        position: relative;

        th, td {
          padding: 0;
          border: 1px solid #ebeef5;
          text-align: left;
          font-size: 13px;
          box-sizing: border-box;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          position: relative;
        }

        th {
          background-color: #f5f7fa;
          font-weight: 600;
          cursor: move;
          will-change: background-color, box-shadow;
          padding: 6px 8px;

          &:hover {
            background-color: #e6f7ff;
          }
        }

        .sort-handle {
          width: 40px;
        }

        .name {
          flex: 1;
        }

        .type {
          width: 150px;
        }

        .settings {
          flex: 2;
        }

        .actions {
          width: 120px;
        }
      }

      /* Заполнители для вставки в превью */
      .preview-insert-placeholder {
        position: absolute;
        background: rgba(64, 158, 255, 0.15);
        border: 2px dashed #409EFF;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: pulse 1.5s infinite;
        z-index: 5;
        transition: all 0.3s ease;
        pointer-events: none;
        box-sizing: border-box;

        .placeholder-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #409EFF;
          font-size: 12px;
          font-weight: 500;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);

          .placeholder-line-vertical {
            height: 80%;
            width: 2px;
            background: linear-gradient(180deg, #409EFF, rgba(64, 158, 255, 0.3));
            border-radius: 1px;
            margin: 0 4px;
          }
        }
      }
    }

    /* ПОЛНОЦЕННАЯ ПОДСВЕТКА КОЛОНКИ В ПРЕВЬЮ */
    .preview-th {
      &.preview-dragover-left,
      &.preview-dragover-right {
        position: relative;

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 100%;
          background: rgba(64, 158, 255, 0.1);
          border: 2px dashed #409EFF;
          border-radius: 4px;
          z-index: -1;
        }

        /* Добавляем надпись "Вставить здесь" по центру колонки */
        &::after {
          content: 'Вставить здесь';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: #409EFF;
          color: white;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          white-space: nowrap;
          z-index: 10;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      }

      &.preview-selected {
        background-color: #e6f7ff;
        border: 1px solid #409EFF;
        transition: all 0.2s ease;
        box-shadow: 0 0 0 1px #409EFF;
      }
    }
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(64, 158, 255, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(64, 158, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(64, 158, 255, 0);
  }
}
</style>
