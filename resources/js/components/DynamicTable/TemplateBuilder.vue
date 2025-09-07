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
        :selected-column-index="selectedPreviewColumnIndex"
        @column-select="selectPreviewColumn"
    />

    <div class="builder-content">
      <ColumnList
          v-model:columns="template.columns"
          :selected-column-index="selectedColumnIndex"
          :column-types="columnTypes"
          @column-select="selectColumn"
          @column-remove="removeColumn"
          @column-add="addColumn"
          @column-order-update="handleColumnOrderUpdate"
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
          @update:column="updateColumn"
          @reference-type-change="onReferenceTypeChange"
          @option-add="addOption"
          @option-remove="removeOption"
      />
    </div>
  </div>
</template>

<script setup>
/**
 * @component TemplateBuilder
 *
 * Основной компонент для создания и редактирования шаблонов динамических таблиц.
 */
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus';
import TemplateHeader from './TemplateBuilder/TemplateHeader.vue';
import TemplateNameForm from './TemplateBuilder/TemplateNameForm.vue';
import TemplatePreview from './TemplateBuilder/TemplatePreview.vue';
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

// === Состояния ===
const route = useRoute();
const router = useRouter();
const template = ref({
  id: null,
  name: '',
  columns: [],
});
const selectedColumnIndex = ref(null);
const saving = ref(false);
const loadingReferenceTypes = ref(false);
const loadingReferenceFields = ref(false);
const referenceFields = ref({}); // { entityType: [fields...] }
const entityTypes = ref([]); // Типы справочников
const previewRows = ref([]); // Данные для предпросмотра

// === Определение правил валидации ===
const rules = {
  name: [
    {
      required: true,
      message: 'Пожалуйста, введите название шаблона',
      trigger: 'blur'
    },
    {
      min: 3,
      max: 50,
      message: 'Название должно быть от 3 до 50 символов',
      trigger: 'blur'
    }
  ]
};

// === Вычисляемые свойства ===
const canSave = computed(() => {
  return template.value.name.trim() !== '' && template.value.columns.length > 0;
});

const selectedColumn = computed(() => {
  if (selectedColumnIndex.value === null || !template.value.columns) return null;
  return template.value.columns[selectedColumnIndex.value];
});

const selectedPreviewColumnIndex = computed(() => {
  return selectedColumnIndex.value;
});

const sortedTemplateColumns = computed(() => {
  return [...template.value.columns].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
});

// === Методы ===
const loadTemplate = async () => {
  const templateId = route.params.id;
  if (!templateId) return;

  try {
    const response = await templateService.get(templateId);

    // Функция для безопасного парсинга JSON
    const parseJsonField = (field) => {
      if (!field) return null;
      if (typeof field === 'object') return field;

      try {
        return JSON.parse(field);
      } catch (e) {
        console.error('Ошибка парсинга JSON:', e);
        return null;
      }
    };

    // Форматируем ответ от API
    template.value = {
      ...response,
      columns: response.columns.map(col => {
        // Обработка booleanSettings
        let booleanSettings = null;
        if (col.type === 'boolean') {
          booleanSettings = parseJsonField(col.boolean_settings || col.booleanSettings);

          // Если парсинг не удался или данные некорректны, используем значения по умолчанию
          if (!booleanSettings || typeof booleanSettings !== 'object') {
            booleanSettings = {
              displayType: 'toggle',
              trueLabel: 'Да',
              falseLabel: 'Нет'
            };
          }
        }

        // Обработка reference
        let reference = null;
        if (col.type === 'reference') {
          reference = parseJsonField(col.reference || col.reference_data);

          // Если парсинг не удался или данные некорректны, используем значения по умолчанию
          if (!reference || typeof reference !== 'object') {
            reference = {
              entityType: '',
              displayFormat: ''
            };
          }
        }

        // Обработка options для select
        let options = col.options;
        if (col.type === 'select') {
          options = parseJsonField(col.options) || [];
        }

        return {
          ...col,
          tempId: col.tempId || col.id || generateTempId(),
          booleanSettings: booleanSettings,
          reference: reference,
          options: options,
          dataType: col.dataType || 'string',
          unit: col.unit || '',
          dateFormat: col.dateFormat || 'DD.MM.YYYY'
        };
      })
    };

    // Сначала загружаем типы справочников, затем обрабатываем колонки
    await loadEntityTypes();

    if (template.value.columns.length > 0) {
      selectColumn(0);
    }

    // Загружаем типы справочников для колонок
    template.value.columns.forEach(column => {
      if (column.type === 'reference' && column.reference?.entityType) {
        loadReferenceFields(column.reference.entityType);
      }
    });

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
    const types = await getEntityTypes();
    console.log('[TemplateBuilder] Типы справочников успешно загружены:', types);

    // Убедимся, что types - это массив
    if (Array.isArray(types)) {
      entityTypes.value = types;
    } else {
      console.error('Ожидался массив типов справочников, получен:', types);
      entityTypes.value = [];
    }

    return entityTypes.value;
  } catch (error) {
    console.error('[TemplateBuilder] Ошибка загрузки типов справочников:', error);
    let errorMessage = 'Не удалось загрузить типы справочников';
    if (error.code === 'ERR_NETWORK') {
      errorMessage = 'Ошибка сети (CORS) при загрузке типов справочников.';
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    ElMessage.error(errorMessage);

    return [];
  } finally {
    loadingReferenceTypes.value = false;
  }
};

const loadReferenceFields = async (entityType) => {
  if (!entityType) {
    console.log('[TemplateBuilder] Не указан entityType для загрузки полей');
    return;
  }

  console.log(`[TemplateBuilder] Запрашиваем поля для справочника: ${entityType}`);

  // Проверяем, не загружены ли уже поля
  if (referenceFields.value[entityType] && referenceFields.value[entityType].length > 0) {
    console.log(`[TemplateBuilder] Поля для ${entityType} уже загружены`);
    return;
  }

  loadingReferenceFields.value = true;
  // Используем деструктуризацию для реактивного обновления
  referenceFields.value = {
    ...referenceFields.value,
    [entityType]: [] // Инициализируем как пустой массив
  };

  try {
    const fields = await getReferenceFields(entityType);
    console.log(`[TemplateBuilder] Получены поля для ${entityType}:`, fields);

    // Убедимся, что fields - это массив
    if (Array.isArray(fields)) {
      // Реактивное обновление
      referenceFields.value = {
        ...referenceFields.value,
        [entityType]: fields
      };
      console.log(`[TemplateBuilder] Поля для ${entityType} установлены`);
    } else {
      console.error(`Ожидался массив полей для ${entityType}, получен:`, fields);
      referenceFields.value = {
        ...referenceFields.value,
        [entityType]: []
      };
    }

    return fields;
  } catch (error) {
    console.error(`[TemplateBuilder] Ошибка загрузки полей справочника ${entityType}:`, error);
    let errorMessage = 'Ошибка загрузки полей справочника';
    if (error.code === 'ERR_NETWORK') {
      errorMessage = 'Ошибка сети (CORS) при загрузке полей справочника.';
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    ElMessage.error(`Ошибка загрузки полей справочника "${entityType}": ${errorMessage}`);

    referenceFields.value = {
      ...referenceFields.value,
      [entityType]: []
    };
    return [];
  } finally {
    loadingReferenceFields.value = false;
  }
};

const updatePreviewData = async () => {
  const rows = [];

  for (let i = 0; i < 10; i++) {
    const rowData = {};

    for (const column of template.value.columns) {
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
              // Сначала проверяем моковые данные
              if (MOCK_REFERENCE_DATA[column.reference.entityType]?.[i]) {
                exampleValue = MOCK_REFERENCE_DATA[column.reference.entityType][i];
              } else {
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

  previewRows.value = rows;
};

const saveTemplate = async () => {
  if (!canSave.value) {
    ElMessage.warning('Заполните название шаблона и добавьте хотя бы одну колонку');
    return;
  }

  saving.value = true;
  try {
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

    if (template.value.id) {
      const response = await templateService.update(template.value.id, templateData);
      template.value.id = response.id;
      template.value.name = response.name;
      template.value.columns = response.columns.map(col => ({
        ...col,
        tempId: col.id || col.tempId || generateTempId()
      }));
      ElNotification.success({
        title: 'Успех',
        message: 'Шаблон успешно обновлён',
        type: 'success'
      });
    } else {
      const response = await templateService.create(templateData);
      template.value.id = response.id;
      template.value.name = response.name;
      template.value.columns = response.columns.map(col => ({
        ...col,
        tempId: col.id || col.tempId || generateTempId()
      }));
      ElNotification.success({
        title: 'Успех',
        message: 'Шаблон успешно создан',
        type: 'success'
      });
      router.push({ name: 'TemplateEdit', params: { id: response.id } });
      return;
    }
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
      previewRows.value = [];
      updatePreviewData();
      ElMessage.info('Форма очищена');
    }
  });
};

const cancel = () => {
  router.push({ name: 'TemplateList' });
};

// === ИСПРАВЛЕНИЕ: Улучшенная логика selectColumn с расширенным логированием ===
const selectColumn = (index) => {
  console.log(`[TemplateBuilder.selectColumn] CALLED with index: ${index}`);
  console.log(`[TemplateBuilder.selectColumn] template.value.columns.length: ${template.value.columns.length}`);
  console.log(`[TemplateBuilder.selectColumn] template.value.columns:`, JSON.parse(JSON.stringify(template.value.columns)));

  if (index >= 0 && index < template.value.columns.length) {
    selectedColumnIndex.value = index;
    console.log(`[TemplateBuilder.selectColumn] SUCCESS: selectedColumnIndex.value SET to ${index}`);
    console.log(`[TemplateBuilder.selectColumn] Selected column object:`, JSON.parse(JSON.stringify(template.value.columns[index])));

    const column = selectedColumn.value;
    if (column && column.type === 'reference') {
      console.log(`[TemplateBuilder.selectColumn] Handling reference column:`, column);
      column.reference = column.reference || { entityType: '', displayFormat: '' };
      const entityType = column.reference.entityType;
      console.log(`[TemplateBuilder.selectColumn] Reference entityType: ${entityType}`);

      if (entityType && (!referenceFields.value[entityType] || referenceFields.value[entityType].length === 0)) {
        console.log(`[TemplateBuilder.selectColumn] Loading reference fields for: ${entityType}`);
        loadReferenceFields(entityType);
      } else {
        console.log(`[TemplateBuilder.selectColumn] Reference fields already loaded or not needed for: ${entityType}`);
      }
    }
  } else {
    console.warn(`[TemplateBuilder.selectColumn] INDEX OUT OF BOUNDS or COLUMNS EMPTY. Index: ${index}, Length: ${template.value.columns.length}`);
    selectedColumnIndex.value = null; // Убедимся, что индекс null, если вне диапазона
  }
  console.log(`[TemplateBuilder.selectColumn] FINISHED. Current selectedColumnIndex.value: ${selectedColumnIndex.value}`);
};
// === КОНЕЦ ИСПРАВЛЕНИЯ ===

const selectPreviewColumn = (index) => {
  selectColumn(index);
};

const removeColumn = (index) => {
  ElMessageBox.confirm('Вы уверены, что хотите удалить эту колонку?', 'Подтверждение', {
    confirmButtonText: 'Да',
    cancelButtonText: 'Отмена',
    type: 'warning',
  }).then(() => {
    template.value.columns.splice(index, 1);
    // Обновляем порядок
    template.value.columns.forEach((col, i) => {
      col.order = i;
    });
    // Обновляем индекс выбранной колонки
    if (selectedColumnIndex.value >= template.value.columns.length) {
      selectedColumnIndex.value = template.value.columns.length > 0 ? template.value.columns.length - 1 : null;
    }
    updatePreviewData();
    ElMessage.success('Колонка удалена');
  });
};

const updateColumn = (updatedColumn) => {
  const index = template.value.columns.findIndex(col => col.tempId === updatedColumn.tempId);
  if (index !== -1) {
    template.value.columns[index] = updatedColumn;
    updatePreviewData();
  }
};

const onReferenceTypeChange = async (entityType) => {
  if (selectedColumn.value && selectedColumn.value.type === 'reference') {
    selectedColumn.value.reference.entityType = entityType;
    await loadReferenceFields(entityType);
    updatePreviewData();
  }
};

const addOption = () => {
  if (!selectedColumn.value || selectedColumn.value.type !== 'select') return;
  selectedColumn.value.options = selectedColumn.value.options || [];
  const newOption = `Вариант ${selectedColumn.value.options.length + 1}`;
  selectedColumn.value.options.push(newOption);
  updatePreviewData();
};

const removeOption = (index) => {
  if (!selectedColumn.value || selectedColumn.value.type !== 'select' || !selectedColumn.value.options) return;
  selectedColumn.value.options.splice(index, 1);
  updatePreviewData();
};

const addColumn = (columnData) => {
  const newColumn = {
    tempId: generateTempId(),
    ...columnData,
    options: columnData.type === 'select' ? ['Вариант 1', 'Вариант 2'] : [],
    dataType: columnData.type === 'text' ? 'string' : undefined,
    unit: columnData.type === 'number' ? '' : undefined,
    reference: columnData.type === 'reference' ? {
      entityType: '',
      displayFormat: ''
    } : null,
    booleanSettings: columnData.type === 'boolean' ? {
      displayType: 'toggle',
      trueLabel: 'Да',
      falseLabel: 'Нет'
    } : null,
    dateFormat: columnData.type === 'date' ? 'DD.MM.YYYY' : (columnData.type === 'datetime' ? 'DD.MM.YYYY HH:mm' : 'DD.MM.YYYY')
  };
  template.value.columns.push(newColumn);
  selectColumn(template.value.columns.length - 1);
  updatePreviewData();
};

// === ИСПРАВЛЕНИЕ: Новый метод обработки обновления порядка колонок после DnD ===
const handleColumnOrderUpdate = (newOrderedColumns) => {
  console.log(`[TemplateBuilder.handleColumnOrderUpdate] CALLED`);
  console.log(`[TemplateBuilder.handleColumnOrderUpdate] Old columns:`, JSON.parse(JSON.stringify(template.value.columns)));
  console.log(`[TemplateBuilder.handleColumnOrderUpdate] New ordered columns from DnD:`, JSON.parse(JSON.stringify(newOrderedColumns)));

  // Создаем карту старых индексов для отслеживания изменений
  const oldIndexMap = {};
  template.value.columns.forEach((col, idx) => {
    oldIndexMap[col.tempId] = idx;
  });

  // Обновляем массив колонок в template
  template.value.columns = newOrderedColumns.map((col, newIndex) => {
    // Обновляем свойство order
    const updatedCol = { ...col, order: newIndex };
    // Проверяем, изменился ли индекс этой колонки
    const oldIndex = oldIndexMap[col.tempId];
    if (oldIndex !== undefined && oldIndex !== newIndex) {
      console.log(`[TemplateBuilder.handleColumnOrderUpdate] Column ${col.tempId} moved from index ${oldIndex} to ${newIndex}`);
    }
    return updatedCol;
  });

  console.log(`[TemplateBuilder.handleColumnOrderUpdate] Columns after reorder:`, JSON.parse(JSON.stringify(template.value.columns)));

  // Если выбранная колонка была перемещена, обновляем selectedColumnIndex
  if (selectedColumnIndex.value !== null) {
    const selectedTempId = newOrderedColumns[selectedColumnIndex.value]?.tempId;
    if (selectedTempId) {
      const newSelectedIndex = template.value.columns.findIndex(c => c.tempId === selectedTempId);
      if (newSelectedIndex !== selectedColumnIndex.value) {
        console.log(`[TemplateBuilder.handleColumnOrderUpdate] Selected column index changed from ${selectedColumnIndex.value} to ${newSelectedIndex}`);
        selectedColumnIndex.value = newSelectedIndex;
      }
    }
  }
  // Если selectedColumnIndex был за пределами нового массива, он может остаться прежним или быть обновлен в watch

  updatePreviewData();
  console.log(`[TemplateBuilder.handleColumnOrderUpdate] FINISHED. Current selectedColumnIndex.value: ${selectedColumnIndex.value}`);
};
// === КОНЕЦ ИСПРАВЛЕНИЯ ===

// === Lifecycle ===
onMounted(async () => {
  console.log('[TemplateBuilder] Инициализация компонента');
  await Promise.all([loadEntityTypes(), loadTemplate()]);
  console.log(`[TemplateBuilder] Инициализация завершена. Текущее название: "${template.value.name}"`);

  // Проверяем, что значение передается в дочерний компонент
  nextTick(() => {
    console.log('[TemplateBuilder] nextTick выполнено');
  });

  if (template.value.columns.length > 0 && selectedColumnIndex.value === null) {
    selectColumn(0);
  } else {
    updatePreviewData();
  }
});

// === Watchers ===
// Следим за изменениями в колонках и обновляем предпросмотр
watch(() => template.value.name, (newVal, oldVal) => {
  console.log(`[TemplateBuilder] template.name изменилось: "${oldVal}" → "${newVal}"`);
});

watch(() => template.value.columns, () => {
  updatePreviewData();
}, { deep: true });

// === ИСПРАВЛЕНИЕ: Watch для template.value.columns, чтобы сбросить выбор ===
watch(() => template.value.columns, (newColumns) => {
  console.log(`[TemplateBuilder] template.value.columns changed. New length: ${newColumns?.length}`);
  if (!newColumns || newColumns.length === 0) {
    console.log(`[TemplateBuilder] Columns are empty, resetting selectedColumnIndex to null`);
    selectedColumnIndex.value = null;
  } else if (selectedColumnIndex.value !== null) {
    // Если была выбрана колонка, проверим, что индекс всё ещё действителен
    if (selectedColumnIndex.value >= newColumns.length) {
      console.log(`[TemplateBuilder] Selected index is out of bounds after columns change, resetting to last column or null`);
      // Выбираем последнюю колонку или сбрасываем, если не осталось колонок
      selectedColumnIndex.value = newColumns.length > 0 ? newColumns.length - 1 : null;
    }
    // Если индекс действителен, selectedColumnIndex.value остаётся прежним
  }
  // Если selectedColumnIndex.value === null, оставляем его null
}, { deep: true });
// === КОНЕЦ ИСПРАВЛЕНИЯ ===
</script>

<style lang="scss" scoped>
/* Основные стили компонента (минимальные) */
.template-builder {
  padding: 10px;
  max-width: 1600px;
  margin: 0 auto;
  height: calc(100vh - 140px);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .builder-content {
    display: flex;
    gap: 15px;
    flex: 2;
    min-height: 0;
  }
}
</style>
