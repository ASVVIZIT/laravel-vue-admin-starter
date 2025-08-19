<template>
  <div class="reference-settings">
    <el-form label-position="top" class="settings-form">
      <el-form-item label="Тип справочника">
        <el-select
            v-model="selectedEntityType"
            @change="handleEntityTypeChange"
            placeholder="Выберите тип справочника"
            filterable
            :loading="loadingTypes"
        >
          <el-option
              v-for="entity in referenceTypes"
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
          <div class="reference-preview">
            {{ getFormattedReferencePreview }}
          </div>
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
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { referenceService } from './services/referenceService';

const props = defineProps({
  column: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:column']);

// Состояние
const referenceTypes = ref([]);
const loadingTypes = ref(false);
const referenceInfo = ref(null);
const loadingReference = ref(false);
const referenceError = ref(null);
const formatInput = ref(null);
const selectedEntityType = ref(props.column.reference?.entityType || '');
const displayFormat = ref(props.column.reference?.displayFormat || '');

// Вычисляемые свойства
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

  return formatReferenceDisplay(referenceInfo.value.example);
});

const getFormattedReferencePreview = computed(() => {
  if (!referenceInfo.value || !referenceInfo.value.example) {
    return '';
  }

  return formatReferenceDisplay(referenceInfo.value.example);
});

// Методы
const formatReferenceDisplay = (item) => {
  if (!displayFormat.value || !item) {
    return '';
  }

  // Заменяем все {ключ} на соответствующие значения
  return displayFormat.value.replace(/\{([^}]+)\}/g, (match, key) => {
    const value = getNestedValue(item, key);
    return value !== undefined && value !== null ? value : match;
  });
};

const getNestedValue = (obj, path) => {
  if (!obj || !path) return undefined;

  return path.split('.').reduce((value, key) => {
    return value && value[key] !== undefined ? value[key] : undefined;
  }, obj);
};

const dragStartKey = (event, field) => {
  event.dataTransfer.setData('field', field.path);
  event.dataTransfer.effectAllowed = 'move';
};

const dragOverFormat = (event) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
};

const dropKey = (event) => {
  event.preventDefault();

  const fieldPath = event.dataTransfer.getData('field');
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

const handleEntityTypeChange = async (entityType) => {
  if (!entityType) {
    return;
  }

  try {
    loadingReference.value = true;
    referenceError.value = null;

    // Загружаем информацию о справочнике
    referenceInfo.value = await referenceService.getInfo(entityType);

    // Если у колонки еще нет displayFormat, устанавливаем пример
    if (!props.column.reference?.displayFormat && referenceInfo.value.exampleFormat) {
      displayFormat.value = referenceInfo.value.exampleFormat;
    }

    // Обновляем колонку
    const updatedColumn = {
      ...props.column,
      reference: {
        ...props.column.reference,
        entityType,
        displayFormat: displayFormat.value
      }
    };

    emit('update:column', updatedColumn);
  } catch (error) {
    referenceError.value = 'Не удалось загрузить информацию о справочнике';
    console.error(`Ошибка загрузки информации о справочнике ${entityType}:`, error);
  } finally {
    loadingReference.value = false;
  }
};

// Хуки
onMounted(async () => {
  try {
    loadingTypes.value = true;

    // Загружаем типы справочников
    const types = await referenceService.getTypes();

    // Преобразуем в формат для select
    referenceTypes.value = types.map(type => ({
      value: type.name,
      label: type.label,
      description: type.description
    }));

    // Если у колонки уже есть entityType, загружаем информацию
    if (props.column.reference?.entityType) {
      selectedEntityType.value = props.column.reference.entityType;
      referenceInfo.value = await referenceService.getInfo(props.column.reference.entityType);

      // Если у колонки нет displayFormat, устанавливаем пример
      if (!props.column.reference.displayFormat && referenceInfo.value.exampleFormat) {
        displayFormat.value = referenceInfo.value.exampleFormat;
      }
    }
  } catch (error) {
    ElMessage({
      message: 'Не удалось загрузить типы справочников',
      type: 'error'
    });
    console.error('Ошибка загрузки типов справочников:', error);
  } finally {
    loadingTypes.value = false;
  }
});

// Следим за изменениями displayFormat
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
.reference-settings {
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
  margin-top: 15px;
}

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

.loading-reference {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
    color: #606266;

  .el-icon {
    margin-right: 5px;
  }
}

.reference-error {
  margin-top: 10px;
}
</style>
