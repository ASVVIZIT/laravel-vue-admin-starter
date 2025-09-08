<!-- resources/js/components/DynamicTable/TemplateBuilder/ColumnSettings/components/ReferenceColumnSettings.vue -->
<template>
  <div class="reference-column-settings">
    <el-form label-position="top" :model="localColumn" class="settings-form" size="small">

      <!-- Компактная строка 1: Выбор типа + Режим редактирования -->
      <div class="compact-row compact-row--main-select">
        <el-form-item label="Тип справочника" class="form-item--flex-grow">
          <el-select
              v-model="selectedEntityType"
              @change="onReferenceTypeChange"
              placeholder="Выберите тип справочника"
              :loading="loadingReferenceTypes"
              filterable
              size="small"
          >
            <el-option
                v-for="entity in entityTypes"
                :key="entity.value"
                :label="entity.label"
                :value="entity.value"
            >
              <span style="float: left">{{ entity.label }}</span>
              <span style="float: right; color: #8492a6; font-size: 10px">{{ entity.description }}</span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="Режим" class="form-item--shrink">
          <el-radio-group v-model="editMode" size="small">
            <el-radio-button label="text" style="padding: 4px 8px; font-size: 12px;">Текст</el-radio-button>
            <el-radio-button label="blocks" style="padding: 4px 8px; font-size: 12px;">Блоки</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </div>

      <!-- Компактная строка 2: Ручной ввод + Пример -->
      <div v-if="selectedEntityType && referenceInfo" class="reference-structure">
        <div class="compact-row compact-row--manual-example">
          <el-form-item label="Ручной ввод формата" class="form-item--flex-grow">
            <el-input
                v-model="displayFormat"
                placeholder="Введите формат отображения"
                size="small"
            />
          </el-form-item>

          <el-form-item label="Пример" class="form-item--shrink example-preview">
            <div class="reference-preview-mini">{{ previewComputed }}</div>
          </el-form-item>
        </div>

        <!-- Формат отображения (основная область) -->
        <el-form-item label="Формат отображения" style="margin-bottom: 0;">
          <div class="reference-format-builder">

            <!-- Панель доступных полей справочника (с прокруткой) -->
            <div class="format-keys-panel">
              <h5 style="margin: 0 0 3px 0; font-size: 11px; color: #606266;">Доступные поля:</h5>
              <div class="keys-container-scrollable">
                <div
                    v-for="(field, index) in availableFields"
                    :key="index"
                    class="format-key"
                    draggable="true"
                    @dragstart="dndHandlers.handleDragStart($event, field)"
                    @click="dndHandlers.handleAddKey(field)"
                >
                  {{ field.path }}
                </div>
              </div>
            </div>

            <!-- Панель конструктора формата -->
            <div class="format-constructor-panel">

              <!-- ТЕКСТОВЫЙ РЕЖИМ -->
              <div v-if="editMode === 'text'" class="format-mode-area">
                <div
                    class="format-preview format-preview--text"
                    @dragover="dndHandlers.handleDragOver"
                    @drop="dndHandlers.handleDropTextMode"
                    @click="focusFormatInput"
                    @input="updateFormatInput"
                    @blur="updateFormatInput"
                    contenteditable="true"
                    ref="formatInput"
                    :textContent="displayFormat"
                ></div>
              </div>

              <!-- БЛОЧНЫЙ РЕЖИМ -->
              <div v-else-if="editMode === 'blocks'" class="format-mode-area">
                <div
                    class="format-preview format-preview--blocks"
                    @dragover="dndHandlers.handleDragOver"
                    @drop="dndHandlers.handleDropBlocksMode"
                    ref="formatBlocksContainer"
                >
                  <template v-for="(block, index) in formatBlocks" :key="index">
                    <span
                        v-if="block.type === 'tag'"
                        class="format-block format-block--tag"
                        :data-field-path="block.value"
                        draggable="true"
                        @dragstart="dndHandlers.handleDragStartBlock($event, block)"
                    >
                        <span v-text="`{${block.value}}`"></span>
                        <span class="format-block__delete" @click.stop="removeBlock(index)">&times;</span>
                    </span>
                    <span
                        v-else-if="block.type === 'text'"
                        class="format-block format-block--text"
                        contenteditable="true"
                        @input="updateTextBlock(index, $event)"
                        @blur="updateTextBlock(index, $event)"
                        @keydown="handleTextBlockKeydown(index, $event)"
                        v-text="block.value"
                    ></span>
                  </template>
                  <div v-if="formatBlocks.length === 0" class="format-blocks-placeholder">
                    Перетащите сюда поля или введите текст
                  </div>
                </div>
              </div>

              <div class="format-hint">
                Пример: <span class="format-example">{{ formatExampleComputed }}</span>
              </div>
            </div>
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
            style="padding: 4px 8px; font-size: 12px;"
        />
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { ElMessage, ElIcon, ElAlert } from 'element-plus';
import { Loading } from '@element-plus/icons-vue';
import { dataSource } from '@/components/DynamicTable/services/dataSource';
import { formatReferenceDisplay } from '@/components/DynamicTable/utils/referenceUtils';
import { MOCK_REFERENCE_DATA } from '@/components/DynamicTable/services/mockData';
import * as dndService from '../services/ReferenceColumnSettingsDND';
import * as formatService from '../services/formatService';

const props = defineProps({
  column: { type: Object, required: true }
});

const emit = defineEmits(['update:column', 'reference-type-change']);

// === Состояния компонента ===
const localColumn = ref({ ...props.column });
const selectedEntityType = ref(props.column.reference?.entityType || '');
const displayFormat = ref(props.column.reference?.displayFormat || '');
const editMode = ref('text');
const entityTypes = ref([]);
const referenceInfo = ref(null);
const loadingReferenceTypes = ref(false);
const loadingReference = ref(false);
const referenceError = ref(null);
const formatInput = ref(null);
const formatBlocksContainer = ref(null);
const formatBlocks = ref([]);

// === Вычисляемые свойства ===
const availableFields = computed(() => {
  let keys = [];
  if (referenceInfo.value?.availableKeys) {
    keys = referenceInfo.value.availableKeys;
  } else if (referenceInfo.value?.fillable) {
    keys = referenceInfo.value.fillable;
  }
  return keys.map(key => ({ name: key, path: key, type: 'string' }));
});

const formatExampleComputed = computed(() => {
  let exampleItem = referenceInfo.value?.example ||
      (selectedEntityType.value && MOCK_REFERENCE_DATA[selectedEntityType.value]?.[0]);
  if (exampleItem) {
    try {
      return formatReferenceDisplay(exampleItem, { reference: { displayFormat: displayFormat.value } });
    } catch (e) {
      console.error('[ReferenceColumnSettings.formatExampleComputed] Error:', e);
      return 'Ошибка формата';
    }
  }
  return '';
});

const previewComputed = computed(() => {
  let exampleItem = referenceInfo.value?.example ||
      (selectedEntityType.value && MOCK_REFERENCE_DATA[selectedEntityType.value]?.[0]);
  if (exampleItem) {
    try {
      return formatReferenceDisplay(exampleItem, { reference: { displayFormat: displayFormat.value } });
    } catch (e) {
      console.error('[ReferenceColumnSettings.previewComputed] Error:', e);
      return 'Ошибка формата';
    }
  }
  return '';
});

// === Методы для работы с форматом ===
const initializeFormatBlocks = () => {
  console.log('[ReferenceColumnSettings] Initializing formatBlocks from:', displayFormat.value);
  formatBlocks.value = formatService.parseFormatStringToBlocks(displayFormat.value);
};

const updateAndEmitDisplayFormat = (newFormat) => {
  if (displayFormat.value !== newFormat) {
    console.log('[ReferenceColumnSettings] Display format updated to:', newFormat);
    displayFormat.value = newFormat;
    const updatedColumn = {
      ...props.column,
      reference: {
        ...props.column.reference,
        entityType: selectedEntityType.value,
        displayFormat: newFormat
      }
    };
    emit('update:column', updatedColumn);
  }
};

// === Обработчики редактирования ===
const focusFormatInput = () => {
  if (formatInput.value) {
    console.log('[ReferenceColumnSettings] Focusing text input');
    formatInput.value.focus();
  }
};

const updateFormatInput = () => {
  if (formatInput.value) {
    const currentTextContent = formatInput.value.textContent || '';
    if (displayFormat.value !== currentTextContent) {
      console.log('[ReferenceColumnSettings] Text input changed, updating model');
      updateAndEmitDisplayFormat(currentTextContent);
      if (editMode.value === 'blocks') {
        console.log('[ReferenceColumnSettings] Syncing blocks with text input');
        initializeFormatBlocks();
      }
    }
  }
};

const removeBlock = (index) => {
  console.log(`[ReferenceColumnSettings] Removing block at index ${index}`);
  formatBlocks.value.splice(index, 1);
  const newFormat = formatBlocks.value.map(b => b.type === 'tag' ? `{${b.value}}` : b.value).join('');
  updateAndEmitDisplayFormat(newFormat);
};

const updateTextBlock = (index, event) => {
  const newValue = event.target.textContent || '';
  console.log(`[ReferenceColumnSettings] Updating text block ${index} to: '${newValue}'`);
  const success = formatService.updateTextBlockValue(formatBlocks.value, index, newValue);
  if (success) {
    const newFormat = formatBlocks.value.map(b => b.type === 'tag' ? `{${b.value}}` : b.value).join('');
    updateAndEmitDisplayFormat(newFormat);
  }
};

const handleTextBlockKeydown = (index, event) => {
  const block = formatBlocks.value[index];
  if (block?.type === 'text') {
    const selection = window.getSelection();
    if (event.key === 'Backspace' && selection.toString() === '' && selection.anchorOffset === 0) {
      console.log(`[ReferenceColumnSettings] Backspace at start of text block ${index}`);
      event.preventDefault();
      const mergeResult = formatService.handleBackspaceInTextBlock(formatBlocks.value, index);
      if (mergeResult?.merged) {
        const newFormat = formatBlocks.value.map(b => b.type === 'tag' ? `{${b.value}}` : b.value).join('');
        updateAndEmitDisplayFormat(newFormat);

        if (mergeResult.focusIndex !== null && mergeResult.focusIndex !== undefined) {
          nextTick(() => {
            const focusBlockEl = formatBlocksContainer.value?.children[mergeResult.focusIndex];
            if (focusBlockEl) {
              if (focusBlockEl.classList.contains('format-block--text')) {
                const range = document.createRange();
                const sel = window.getSelection();
                const textNode = focusBlockEl.childNodes[0];
                if (textNode) {
                  const pos = mergeResult.focusEndPos !== null ? mergeResult.focusEndPos : (textNode.textContent?.length || 0);
                  range.setStart(textNode, pos);
                  range.collapse(true);
                  sel.removeAllRanges();
                  sel.addRange(range);
                }
              }
            }
          });
        }
      }
    }
  }
};

// === Создание объекта с обработчиками DnD для передачи в шаблон ===
const dndHandlers = {
  handleDragStart: (event, field) => dndService.handleDragStart(event, field),
  handleDragOver: (event) => dndService.handleDragOver(event),
  handleDropTextMode: (event) => {
    dndService.handleDropTextMode(event, {
      refs: { formatInput },
      updateModelFn: updateAndEmitDisplayFormat,
      messageFn: ElMessage.warning
    });
  },
  handleDropBlocksMode: (event) => {
    dndService.handleDropBlocksMode(event, {
      refs: { formatBlocksContainer },
      formatBlocks: formatBlocks.value,
      updateModelFn: updateAndEmitDisplayFormat
    });
  },
  handleDragStartBlock: (event, block) => dndService.handleDragStartBlock(event, block),
  handleAddKey: (field) => {
    dndService.handleAddKey(field, {
      editMode: editMode.value,
      formatBlocks: formatBlocks.value,
      updateModelFn: updateAndEmitDisplayFormat,
      onInsertText: (path) => {
        const newKey = `{${path}}`;
        const currentFormat = displayFormat.value || '';
        updateAndEmitDisplayFormat(currentFormat + newKey);
        nextTick(() => {
          if (formatInput.value) formatInput.value.textContent = displayFormat.value;
        });
      }
    });
  }
};
// === Конец обработчиков DnD ===

// === Lifecycle & Watchers ===
const onReferenceTypeChange = async (entityType) => {
  console.log(`[ReferenceColumnSettings] Type changed to: ${entityType}`);
  try {
    loadingReference.value = true;
    referenceError.value = null;
    localColumn.value.reference.entityType = entityType;
    selectedEntityType.value = entityType;

    const infoObject = await dataSource.getReferenceInfoFields(entityType);
    if (infoObject && typeof infoObject === 'object' && !Array.isArray(infoObject)) {
      referenceInfo.value = infoObject;
      let defaultFormat = '{name}';
      if (!localColumn.value.reference.displayFormat && infoObject.defaultDisplayFormat) {
        defaultFormat = infoObject.defaultDisplayFormat;
      }
      updateAndEmitDisplayFormat(defaultFormat);
      if (editMode.value === 'blocks') {
        initializeFormatBlocks();
      }
    } else {
      referenceInfo.value = null;
      const msg = Object.keys(infoObject).length === 0 ? 'Информация о справочнике пуста' : 'Некорректная структура данных';
      referenceError.value = msg;
      ElMessage.warning(msg);
    }
    emit('reference-type-change', entityType);
  } catch (error) {
    console.error(`[ReferenceColumnSettings] Error loading type ${entityType}:`, error);
    referenceError.value = 'Не удалось загрузить информацию о справочнике';
    ElMessage.error(`Ошибка: ${error.message}`);
  } finally {
    loadingReference.value = false;
  }
};

onMounted(async () => {
  console.log('[ReferenceColumnSettings] Component mounted');
  try {
    loadingReferenceTypes.value = true;
    const types = await dataSource.getReferenceTypes();
    entityTypes.value = Array.isArray(types) ? types.map(t => ({...t})) : [];

    if (props.column.reference?.entityType) {
      selectedEntityType.value = props.column.reference.entityType;
      const infoObject = await dataSource.getReferenceInfoFields(props.column.reference.entityType);
      if (infoObject && typeof infoObject === 'object' && !Array.isArray(infoObject)) {
        referenceInfo.value = infoObject;
        const initialFormat = props.column.reference?.displayFormat || '{name}';
        displayFormat.value = initialFormat;
        if (editMode.value === 'blocks') {
          initializeFormatBlocks();
        }
      } else {
        referenceInfo.value = null;
        const msg = Object.keys(infoObject).length === 0 ? 'Информация о справочнике пуста' : 'Некорректная структура данных';
        ElMessage.warning(`onMounted: ${msg}`);
      }
    }
  } catch (error) {
    console.error('[ReferenceColumnSettings] Error on mount:', error);
    ElMessage.error('Ошибка загрузки типов справочников');
  } finally {
    loadingReferenceTypes.value = false;
  }
});

watch(editMode, (newMode, oldMode) => {
  console.log(`[ReferenceColumnSettings] Edit mode changed from ${oldMode} to ${newMode}`);
  if (newMode === 'blocks') {
    initializeFormatBlocks();
  }
});

watch(() => props.column, (newVal) => {
  console.log('[ReferenceColumnSettings] Props.column changed, syncing state');
  localColumn.value = { ...newVal };
  selectedEntityType.value = newVal.reference?.entityType || '';
  const newDisplayFormat = newVal.reference?.displayFormat || '';
  if (displayFormat.value !== newDisplayFormat) {
    displayFormat.value = newDisplayFormat;
    if (editMode.value === 'blocks') {
      initializeFormatBlocks();
    }
  }
}, { deep: true });
// === Конец Lifecycle & Watchers ===

</script>

<style lang="scss" scoped>
.reference-column-settings {
  padding: 3px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.1);
  margin-top: 2px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-size: 12px; /* Базовый размер шрифта для всего компонента */

  .settings-form {
    flex: 1;
    overflow-y: auto;
    padding-right: 2px;

    .el-form-item {
      margin-bottom: 3px; /* Ещё меньше отступ */
      :deep(.el-form-item__label) {
        font-weight: 500;
        color: #606266;
        padding-bottom: 2px; /* Ещё меньше отступ */
        font-size: 11px; /* Ещё меньше шрифт */
      }
      .el-input, .el-select, .el-date-picker, .el-radio-group {
        // width: 100%;
      }
    }

    /* === НОВОЕ: Компактные строки === */
    .compact-row {
      display: flex;
      gap: 4px; /* Ещё меньше отступ */
      margin-bottom: 3px; /* Ещё меньше отступ */
      align-items: flex-end;

      &.compact-row--main-select {
        .form-item--flex-grow {
          flex: 2;
        }
        .form-item--shrink {
          flex: 1;
        }
      }

      &.compact-row--manual-example {
        .form-item--flex-grow {
          flex: 3;
        }
        .form-item--shrink {
          flex: 2;
        }
      }

      .form-item--flex-grow {
        flex: 1;
      }
      .form-item--shrink {
        flex: 0 0 auto;
      }

      /* Стили для мини-примера */
      .example-preview {
        .reference-preview-mini {
          padding: 1px 2px; /* Ещё меньше padding */
          background-color: #f0f2f5;
          border-radius: 3px; /* Меньше радиус */
          font-size: 10px; /* Ещё меньше шрифт */
          color: #409eff;
          border: 1px solid #dcdfe6;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 150px; /* Меньше ширина */
        }
      }
    }
    /* === КОНЕЦ НОВОГО === */

    .reference-structure {
      .reference-format-builder {
        display: flex;
        flex-direction: column;
        gap: 3px; /* Ещё меньше отступ */

        /* === НОВОЕ: Панель полей справочника с вертикальной прокруткой === */
        .format-keys-panel {
          display: flex;
          flex-direction: column;
          flex-shrink: 0;

          h5 {
            margin: 0 0 3px 0; /* Ещё меньше отступ */
            font-size: 11px; /* Ещё меньше шрифт */
            color: #606266;
          }

          .keys-container-scrollable {
            flex: 1;
            overflow-y: auto;
            padding: 1px; /* Ещё меньше padding */
            border: 1px solid #dcdfe6;
            border-radius: 3px; /* Меньше радиус */
            background-color: #fafafa;
            display: flex;
            flex-wrap: wrap;
            gap: 3px; /* Ещё меньше отступ */
            max-height: 60px; /* Меньше высота */

            .format-key {
              padding: 0px 1px; /* Ещё меньше padding */
              background-color: #f0f2f5;
              border-radius: 2px; /* Меньше радиус */
              cursor: move;
              transition: all 0.15s;
              font-size: 7px; /* Ещё меньше шрифт */
              border: 1px solid #2b8aac6e; /* Цвет из запроса */
              line-height: 1.2; /* Более плотная строка */

              &:hover {
                background-color: #e6f7ff;
                color: #1890ff;
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
                border-color: #409eff;
              }
            }
          }
        }
        /* === КОНЕЦ НОВОГО === */

        /* === НОВОЕ: Панель конструктора формата === */
        .format-constructor-panel {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;

          .format-mode-area {
            flex: 1;
            min-height: 0;
            display: flex;
            flex-direction: column;

            .format-preview {
              flex: 1;
              min-height: 25px; /* Ещё меньше минимальная высота */
              padding: 2px 4px; /* Ещё меньше padding */
              border: 1px dashed #dcdfe6;
              border-radius: 3px; /* Меньше радиус */
              background-color: #fafafa;
              outline: none;
              overflow-y: auto;
              font-size: 11px; /* Меньше шрифт */

              &:focus {
                border-color: #409eff;
                box-shadow: 0 0 0 1px rgba(64, 158, 255, 0.2);
              }

              &.format-preview--blocks {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                gap: 2px; /* Ещё меньше отступ */
                padding: 2px 4px; /* Ещё меньше padding */

                .format-block {
                  padding: 1px 2px; /* Ещё меньше padding */
                  border-radius: 2px; /* Меньше радиус */
                  font-size: 10px; /* Ещё меньше шрифт */
                  line-height: 1.1; /* Более плотная строка */

                  &.format-block--tag {
                    background-color: #e6f7ff;
                    color: #1890ff;
                    border: 1px solid #91d5ff;
                    cursor: grab;
                    .format-block__delete {
                      margin-left: 2px; /* Ещё меньше отступ */
                      cursor: pointer;
                      font-weight: bold;
                      color: #ff4d4f;
                      font-size: 12px; /* Меньше шрифт */
                      &:hover { color: #f5222d; }
                    }
                  }

                  &.format-block--text {
                    background-color: #ffffff;
                    color: #333;
                    border: 1px dashed #d9d9d9;
                    cursor: text;
                    min-width: 1ch;
                    &:focus {
                      outline: none;
                      border-color: #409eff;
                      box-shadow: 0 0 0 1px rgba(64, 158, 255, 0.2);
                    }
                  }
                }

                .format-blocks-placeholder {
                  color: #bfbfbf;
                  font-style: italic;
                  padding: 1px 0; /* Ещё меньше padding */
                  font-size: 10px; /* Меньше шрифт */
                }
              }
              .format-key-tag {
                background-color: #e6f7ff;
                color: #1890ff;
                padding: 1px 3px; /* Ещё меньше padding */
                border-radius: 2px; /* Меньше радиус */
                margin: 0 1px; /* Ещё меньше отступ */
                font-size: 10px; /* Меньше шрифт */
              }
            }
          }

          .format-hint {
            margin-top: 3px; /* Ещё меньше отступ */
            font-size: 10px; /* Меньше шрифт */
            color: #606266;
            .format-example {
              font-weight: 500;
              color: #409eff;
            }
          }
        }
        /* === КОНЕЦ НОВОГО === */
      }

      .reference-preview {
        padding: 3px 5px; /* Ещё меньше padding */
        background-color: #ecf5ff;
        border-radius: 3px; /* Меньше радиус */
        font-size: 11px; /* Меньше шрифт */
        color: #409eff;
        margin-top: 5px; /* Ещё меньше отступ */
        min-height: 20px; /* Меньше высота */
        border: 1px solid #d9ecff;
        white-space: pre-wrap;
      }
    }

    .loading-reference, .reference-error {
      display: flex;
      align-items: center;
      padding: 3px; /* Ещё меньше padding */
      color: #606266;
      font-size: 11px; /* Меньше шрифт */
      .el-icon.is-loading { animation: rotating 1.5s linear infinite; margin-right: 3px; font-size: 14px; }
      margin-top: 3px; /* Ещё меньше отступ */
    }
    .reference-error { color: #f56c6c; }
  }
  @keyframes rotating {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
}

/* === ДОПОЛНИТЕЛЬНЫЕ СТИЛИ ДЛЯ ЕЩЁ БОЛЕЕ КОМПАКТНОГО ВИДА === */
/* Уменьшение высоты строки для маленьких элементов формы */
.el-form-item--small .el-form-item__content {
  line-height: 8px; /* Ещё меньше */
  min-height: 16px; /* Минимальная высота */
}
/* === КОНЕЦ ДОПОЛНИТЕЛЬНЫХ СТИЛЕЙ === */
</style>
