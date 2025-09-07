<!-- resources/js/components/DynamicTable/TemplateBuilder/ColumnSettings/ReferenceColumnSettings.vue -->
<template>
  <div class="reference-column-settings">
    <el-form label-position="top" :model="localColumn" class="settings-form">
      <el-form-item label="Тип справочника">
        <el-select
            v-model="selectedEntityType"
            @change="onReferenceTypeChange"
            placeholder="Выберите тип справочника"
            :loading="loadingReferenceTypes"
            filterable
        >
          <el-option
              v-for="entity in entityTypes"
              :key="entity.value"
              :label="entity.label"
              :value="entity.value"
          >
            <span style="float: left">{{ entity.label }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{ entity.description }}</span>
          </el-option>
        </el-select>
      </el-form-item>

      <div v-if="selectedEntityType && referenceInfo" class="reference-structure">
        <el-form-item label="Формат отображения">
          <div class="reference-format-builder">
            <!-- Блок перетаскиваемых ключей -->
            <div class="format-keys">
              <h5>Доступные поля:</h5>
              <div class="keys-container">
                <div
                    v-for="(field, index) in availableFields"
                    :key="index"
                    class="format-key"
                    draggable="true"
                    @dragstart="dragStartKey($event, field)"
                    @click="addKeyToFormat(field)"
                >
                  {{ field.path }}
                </div>
              </div>
            </div>

            <!-- Блок конструктора формата -->
            <div class="format-constructor">
              <h5>Конструктор формата:</h5>
              <div
                  class="format-preview"
                  @dragover.prevent="dragOverFormat"
                  @drop="dropKey"
                  @click="focusFormatInput"
                  contenteditable="true"
                  ref="formatInput"
                  v-html="formatPreviewHtml"
                  @input="updateFormatInput"
              ></div>

              <div class="format-hint">
                Пример: <span class="format-example">{{ formatExample }}</span>
              </div>
            </div>

            <!-- Блок ручного редактирования -->
            <div class="format-manual">
              <h5>Ручное редактирование:</h5>
              <el-input
                  v-model="displayFormat"
                  placeholder="Введите формат отображения"
                  @blur="updateFormatFromInput"
              />
            </div>
          </div>
        </el-form-item>

        <el-form-item label="Пример отображения">
          <div class="reference-preview">{{ getFormattedReferencePreview }}</div>
        </el-form-item>
      </div>

      <div v-if="loadingReference" class="loading-reference">
        <el-icon class="is-loading">
          <Loading />
        </el-icon>
        Загрузка данных справочника...
      </div>

      <div v-if="referenceError" class="reference-error">
        <el-alert
            type="error"
            :title="referenceError"
            :closable="false"
        />
      </div>
    </el-form>
  </div>
</template>

<script setup>
/**
 * @component ReferenceColumnSettings
 *
 * Компонент настроек для колонки типа "Справочник".
 * Позволяет выбрать тип справочника и настроить формат отображения данных.
 *
 * @props {Object} column - Объект колонки типа "reference"
 *
 * @emits {Event} update:column - Событие обновления колонки
 * @param {Object} updatedColumn - Объект обновленной колонки
 * @emits {Event} reference-type-change - Событие изменения типа справочника
 * @param {string} entityType - Новый тип справочника
 */
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { ElMessage, ElIcon, ElAlert } from 'element-plus';
import { Loading } from '@element-plus/icons-vue';
import draggable from 'vuedraggable';
import { dataSource } from '@/components/DynamicTable/services/dataSource';
import { formatReferenceDisplay } from '@/components/DynamicTable/utils/referenceUtils';
import { MOCK_REFERENCE_DATA } from '@/components/DynamicTable/services/mockData';

const props = defineProps({
  /**
   * Объект колонки типа "reference"
   * @type {Object}
   */
  column: {
    type: Object,
    required: true
  }
});

const emit = defineEmits([
  /**
   * Событие обновления колонки
   * @param {Object} updatedColumn - Объект обновленной колонки
   */
  'update:column',
  /**
   * Событие изменения типа справочника
   * @param {string} entityType - Новый тип справочника
   */
  'reference-type-change'
]);

// === Состояния ===
const localColumn = ref({ ...props.column });
const selectedEntityType = ref(props.column.reference?.entityType || '');
const displayFormat = ref(props.column.reference?.displayFormat || '');
const entityTypes = ref([]);
const referenceInfo = ref(null);
const loadingReferenceTypes = ref(false);
const loadingReference = ref(false);
const referenceError = ref(null);
const formatInput = ref(null);
const referenceFields = ref({});
const loadingReferenceFields = ref(false);
const referenceFieldLoadError = ref(null);
const referenceData = ref({});

// === Вычисляемые свойства ===
const availableFields = computed(() => {
  if (!referenceInfo.value || !referenceInfo.value.fields) {
    return [];
  }

  // Преобразуем поля в плоский список с путями
  const flattenFields = (fields, prefix = '') => {
    return fields.flatMap(field => {
      const path = prefix ? `${prefix}.${field.name}` : field.name;

      if (field.type === 'object' && field.fields) {
        return [
          { ...field, path, isObject: true },
          ...flattenFields(field.fields, path)
        ];
      }

      return [{ ...field, path }];
    });
  };

  return flattenFields(referenceInfo.value.fields);
});

const formatPreviewHtml = computed(() => {
  const format = displayFormat.value || '';

  // Заменяем все {ключ} на кликабельные элементы
  return format.replace(/\{([^}]+)\}/g, (match, key) => {
    return `<span class="format-key-tag" data-key="${key}">${match}</span>`;
  });
});

const formatExample = computed(() => {
  if (!referenceInfo.value || !referenceInfo.value.example) {
    return '';
  }

  return formatReferenceDisplay(referenceInfo.value.example, { reference: { displayFormat: displayFormat.value } });
});

const getFormattedReferencePreview = computed(() => {
  if (!referenceInfo.value || !referenceInfo.value.example) {
    return '';
  }

  return formatReferenceDisplay(referenceInfo.value.example, { reference: { displayFormat: displayFormat.value } });
});

// === Методы ===
const getNestedValue = (obj, path) => {
  if (!obj || !path) return undefined;

  return path.split('.').reduce((value, key) => {
    return value && value[key] !== undefined ? value[key] : undefined;
  }, obj);
};

const dragStartKey = (event, field) => {
  event.dataTransfer.setData('text/plain', `{${field.path}}`);
  event.dataTransfer.effectAllowed = 'move';
};

const dragOverFormat = (event) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
};

const dropKey = (event) => {
  event.preventDefault();

  const fieldPath = event.dataTransfer.getData('text/plain');
  if (fieldPath) {
    insertKeyIntoFormat(fieldPath);
  }
};

const insertKeyIntoFormat = (fieldPath) => {
  if (!formatInput.value) {
    return;
  }

  // Сохраняем текущую позицию курсора
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const container = range.commonAncestorContainer;
  const offset = range.startOffset;

  // Вставляем ключ в текущую позицию
  const newKey = `{${fieldPath}}`;
  const currentFormat = displayFormat.value || '';

  // Определяем позицию вставки
  let pos;
  if (container.nodeType === Node.TEXT_NODE) {
    const textNode = container;
    const parent = textNode.parentNode;
    const html = parent.innerHTML;
    const textBefore = html.substring(0, textNode.compareDocumentPosition(range.startContainer) === Node.DOCUMENT_POSITION_PRECEDING ? offset : 0);
    pos = textBefore.length + offset;
  } else {
    pos = currentFormat.length;
  }

  // Вставляем ключ
  const newFormat = currentFormat.substring(0, pos) + newKey + currentFormat.substring(pos);
  displayFormat.value = newFormat;

  // Обновляем предпросмотр
  nextTick(() => {
    updateFormatInput();

    // Восстанавливаем позицию курсора
    setTimeout(() => {
      const textNode = formatInput.value.childNodes[0];
      if (textNode) {
        const range = document.createRange();
        const sel = window.getSelection();
        range.setStart(textNode, pos + newKey.length);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }, 0);
  });
};

const addKeyToFormat = (fieldPath) => {
  const newKey = `{${fieldPath}}`;
  const currentFormat = displayFormat.value || '';

  // Добавляем ключ в конец
  displayFormat.value = currentFormat + newKey;

  // Обновляем предпросмотр
  nextTick(updateFormatInput);
};

const focusFormatInput = () => {
  if (formatInput.value) {
    formatInput.value.focus();
  }
};

const updateFormatInput = () => {
  if (!formatInput.value) {
    return;
  }

  // Получаем текущее содержимое
  let html = formatInput.value.innerHTML;

  // Удаляем теги, оставляя только текст
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  const text = tempDiv.textContent || '';

  // Сохраняем в данные колонки
  displayFormat.value = text;
};

const updateFormatFromInput = () => {
  // Обновляем содержимое элемента
  if (formatInput.value) {
    formatInput.value.innerHTML = formatPreviewHtml.value;
  }
};

// === ИСПРАВЛЕНИЕ: Обновленный onReferenceTypeChange с правильной обработкой ответа ===
const onReferenceTypeChange = async (entityType) => {
  console.log(`[ReferenceColumnSettings.onReferenceTypeChange] CALLED with entityType: ${entityType}`);
  console.log(`[ReferenceColumnSettings.onReferenceTypeChange] localColumn.value (before):`, JSON.parse(JSON.stringify(localColumn.value)));

  if (!localColumn.value || localColumn.value.type !== 'reference') {
    console.warn('[ReferenceColumnSettings.onReferenceTypeChange] localColumn is not a reference type or is null');
    return;
  }

  try {
    loadingReference.value = true;
    referenceError.value = null;

    // Обновляем entityType в локальной колонке
    localColumn.value.reference.entityType = entityType;
    selectedEntityType.value = entityType; // Обновляем локальное состояние
    console.log(`[ReferenceColumnSettings.onReferenceTypeChange] localColumn.value.reference.entityType SET to: ${entityType}`);

    // === ИСПРАВЛЕНИЕ: Используем dataSource для загрузки информации о справочнике ===
    // Загружаем информацию о справочнике
    const infoResponse = await dataSource.getReferenceInfo(entityType);
    console.log(`[ReferenceColumnSettings.onReferenceTypeChange] Raw infoResponse from dataSource:`, infoResponse);

    // === КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: Правильная обработка структуры ответа ===
    // dataSource.getReferenceInfo может возвращать разные структуры ответа
    let processedInfo;

    // Проверяем различные возможные структуры ответа
    if (infoResponse && infoResponse.data !== undefined) {
      // Структура {  {  { fields: [...] } } }
      processedInfo = infoResponse.data;
    } else if (infoResponse && infoResponse.fields && Array.isArray(infoResponse.fields)) {
      // Структура {  [...] }
      processedInfo = infoResponse;
    } else {
      processedInfo = null;
    }
    // === КОНЕЦ КЛЮЧЕВОГО ИЗМЕНЕНИЯ ===

    // Убедимся, что processedInfo - это объект
    if (processedInfo && typeof processedInfo === 'object' && !Array.isArray(processedInfo)) {
      referenceInfo.value = processedInfo;
      console.log(`[ReferenceColumnSettings.onReferenceTypeChange] Processed reference info SET:`, referenceInfo.value);
    } else {
      console.error(`[ReferenceColumnSettings.onReferenceTypeChange] Expected object for reference info, got:`, processedInfo);
      referenceInfo.value = null;
      referenceError.value = 'Некорректная структура данных справочника';
      ElMessage.error(`Некорректная структура данных справочника "${entityType}"`);
      return;
    }
    // === КОНЕЦ ИСПРАВЛЕНИЯ ===

    // Если у колонки еще нет displayFormat, устанавливаем пример
    if (!localColumn.value.reference?.displayFormat && referenceInfo.value?.exampleFormat) {
      localColumn.value.reference.displayFormat = referenceInfo.value.exampleFormat;
      displayFormat.value = referenceInfo.value.exampleFormat; // Обновляем локальное состояние
      console.log(`[ReferenceColumnSettings.onReferenceTypeChange] displayFormat SET from exampleFormat: ${localColumn.value.reference.displayFormat}`);
    }

    // Загружаем данные справочника для предпросмотра
    await loadReferenceData(entityType);
    console.log(`[ReferenceColumnSettings.onReferenceTypeChange] Reference data loaded for: ${entityType}`);

    // Создаем обновленную копию колонки для эмита
    const updatedColumn = JSON.parse(JSON.stringify(localColumn.value));
    console.log(`[ReferenceColumnSettings.onReferenceTypeChange] updatedColumn prepared:`, updatedColumn);

    // === ИСПРАВЛЕНИЕ: Эмитим обновленную колонку ===
    console.log(`[ReferenceColumnSettings.onReferenceTypeChange] EMITTING 'update:column' with updatedColumn`);
    emit('update:column', updatedColumn);
    // === КОНЕЦ ИСПРАВЛЕНИЯ ===

    // Эмитим событие изменения типа справочника
    console.log(`[ReferenceColumnSettings.onReferenceTypeChange] EMITTING 'reference-type-change' with entityType: ${entityType}`);
    emit('reference-type-change', entityType);

  } catch (error) {
    console.error(`[ReferenceColumnSettings.onReferenceTypeChange] Error for ${entityType}:`, error);
    referenceError.value = 'Не удалось загрузить информацию о справочнике';
    ElMessage.error(`Не удалось загрузить информацию о справочнике "${entityType}": ${error.message}`);
  } finally {
    loadingReference.value = false;
    console.log(`[ReferenceColumnSettings.onReferenceTypeChange] FINISHED`);
  }
};
// === КОНЕЦ ИСПРАВЛЕНИЯ ===

// === ИСПРАВЛЕНИЕ: Обновленный loadReferenceData с правильной логикой загрузки ===
const loadReferenceData = async (entityType) => {
  if (!entityType) return;

  loadingReferenceFields.value = true;
  referenceFieldLoadError.value = null;
  // Используем деструктуризацию для реактивного обновления
  referenceFields.value = {
    ...referenceFields.value,
    [entityType]: [] // Инициализируем как пустой массив
  };

  try {
    console.log(`[ReferenceColumnSettings] Запрашиваем поля для справочника: ${entityType}`);
    // === ИСПРАВЛЕНИЕ: Используем dataSource для загрузки информации о справочнике ===
    const fields = await dataSource.getReferenceFields(entityType);
    console.log(`[ReferenceColumnSettings] Получены поля для ${entityType}:`, fields);

    // Убедимся, что fields - это массив
    if (Array.isArray(fields)) {
      // Реактивное обновление
      referenceFields.value = {
        ...referenceFields.value,
        [entityType]: fields
      };
      console.log(`[ReferenceColumnSettings] Поля для ${entityType} установлены`);
    } else {
      console.error(`Ожидался массив полей для ${entityType}, получен:`, fields);
      referenceFields.value = {
        ...referenceFields.value,
        [entityType]: []
      };
    }

    return fields;
  } catch (error) {
    console.error(`[ReferenceColumnSettings] Ошибка загрузки полей справочника (${entityType}):`, error);
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
// === КОНЕЦ ИСПРАВЛЕНИЯ ===

// === Lifecycle ===
onMounted(async () => {
  try {
    loadingReferenceTypes.value = true;

    // === ИСПРАВЛЕНИЕ: Используем dataSource для загрузки типов справочников ===
    // Загружаем типы справочников
    const types = await dataSource.getReferenceTypes();
    console.log('[ReferenceColumnSettings.onMounted] Types loaded:', types);

    // Преобразуем в формат для select
    entityTypes.value = Array.isArray(types) ? types.map(type => ({
      value: type.value,
      label: type.label,
      description: type.description
    })) : [];
    console.log('[ReferenceColumnSettings.onMounted] entityTypes.value SET:', entityTypes.value);

    // Если у колонки уже есть entityType, загружаем информацию
    if (props.column.reference?.entityType) {
      selectedEntityType.value = props.column.reference.entityType;
      // === ИСПРАВЛЕНИЕ: Используем dataSource для загрузки информации о справочнике ===
      referenceInfo.value = await dataSource.getReferenceInfo(props.column.reference.entityType);
      console.log('[ReferenceColumnSettings.onMounted] Reference info loaded for existing entityType:', referenceInfo.value);

      // Если у колонки нет displayFormat, устанавливаем пример
      if (!props.column.reference.displayFormat && referenceInfo.value?.exampleFormat) {
        displayFormat.value = referenceInfo.value.exampleFormat;
        console.log('[ReferenceColumnSettings.onMounted] displayFormat SET from exampleFormat:', displayFormat.value);
      }

      // Загружаем данные справочника для предпросмотра
      await loadReferenceData(props.column.reference.entityType);
      console.log('[ReferenceColumnSettings.onMounted] Reference data loaded for existing entityType');
    }
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

// === Watchers ===
watch(() => props.column, (newVal) => {
  localColumn.value = { ...newVal };
  selectedEntityType.value = newVal.reference?.entityType || '';
  displayFormat.value = newVal.reference?.displayFormat || '';
}, { deep: true });

watch(displayFormat, (newVal) => {
  if (selectedEntityType.value && referenceInfo.value) {
    const updatedColumn = {
      ...props.column,
      reference: {
        ...props.column.reference,
        entityType: selectedEntityType.value,
        displayFormat: newVal
      }
    };

    emit('update:column', updatedColumn);
  }
});
</script>

<style lang="scss" scoped>
.reference-column-settings {
  padding: 15px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-top: 15px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .settings-form {
    flex: 1;
    overflow-y: auto;
    padding-right: 5px;

    .el-form-item {
      margin-bottom: 18px;

      :deep(.el-form-item__label) {
        font-weight: 500;
        color: #606266;
        padding-bottom: 4px;
      }

      .el-input,
      .el-select,
      .el-date-picker {
        width: 100%;
      }
    }

    .reference-structure {
      .reference-format-builder {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;

        @media (max-width: 992px) {
          grid-template-columns: 1fr;
        }

        .format-keys {
          .keys-container {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 10px;

            .format-key {
              padding: 5px 10px;
              background-color: #f0f2f5;
              border-radius: 4px;
              cursor: move;
              transition: all 0.2s;
              font-size: 13px;

              &:hover {
                background-color: #e6f7ff;
                color: #1890ff;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              }
            }
          }
        }

        .format-constructor {
          .format-preview {
            min-height: 40px;
            padding: 8px 12px;
            border: 1px dashed #dcdfe6;
            border-radius: 4px;
            margin-top: 10px;
            background-color: #fafafa;
            cursor: text;
            outline: none;

            &:focus {
              border-color: #409eff;
              box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
            }

            .format-key-tag {
              background-color: #e6f7ff;
              color: #1890ff;
              padding: 2px 6px;
              border-radius: 4px;
              margin: 0 2px;
            }
          }

          .format-hint {
            margin-top: 8px;
            font-size: 13px;
            color: #606266;

            .format-example {
              font-weight: 500;
              color: #409eff;
            }
          }
        }

        .format-manual {
          grid-column: 1 / -1;
        }
      }

      .reference-preview {
        padding: 8px 12px;
        background-color: #ecf5ff;
        border-radius: 4px;
        font-size: 13px;
        color: #409eff;
        margin-top: 10px;
        min-height: 24px;
        border: 1px solid #d9ecff;
        white-space: pre-wrap;
      }
    }

    .loading-reference {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 10px;
      color: #606266;

      .el-icon {
        margin-right: 5px;

        &.is-loading {
          animation: rotating 2s linear infinite;
          margin-right: 5px;
        }
      }
    }

    .reference-error {
      margin-top: 10px;
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
