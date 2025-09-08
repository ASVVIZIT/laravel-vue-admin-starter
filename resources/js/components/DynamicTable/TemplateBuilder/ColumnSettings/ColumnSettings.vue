<!-- resources/js/components/DynamicTable/TemplateBuilder/ColumnSettings/ColumnSettings.vue -->
<template>
  <div class="column-settings">
    <div v-if="localColumn" class="column-settings-content">
      <h4>Настройки колонки: {{ localColumn.label }}</h4>
      <el-form label-position="top" :model="localColumn" class="settings-form">
        <!-- Базовые настройки -->
        <el-form-item label="Название колонки">
          <el-input
              v-model="localColumn.label"
              placeholder="Введите название колонки"
              @input="handleColumnUpdate"
          />
        </el-form-item>

        <el-form-item label="Тип данных">
          <el-select
              v-model="localColumn.type"
              placeholder="Выберите тип данных"
              @change="onColumnTypeChange"
          >
            <el-option
                v-for="type in columnTypes"
                :key="type.value"
                :label="type.label"
                :value="type.value"
            />
          </el-select>
        </el-form-item>

        <!-- Специализированные настройки -->
        <TextColumnSettings
            v-if="localColumn.type === 'text'"
            :column="localColumn"
            @update:column="handleSpecializedUpdate"
        />
        <NumberColumnSettings
            v-else-if="localColumn.type === 'number'"
            :column="localColumn"
            @update:column="handleSpecializedUpdate"
        />
        <SelectColumnSettings
            v-else-if="localColumn.type === 'select'"
            :column="localColumn"
            @update:column="handleSpecializedUpdate"
            @option-add="handleOptionAdd"
            @option-remove="handleOptionRemove"
        />
        <DateColumnSettings
            v-else-if="localColumn.type === 'date'"
            :column="localColumn"
            @update:column="handleSpecializedUpdate"
        />
        <DateTimeColumnSettings
            v-else-if="localColumn.type === 'datetime'"
            :column="localColumn"
            @update:column="handleSpecializedUpdate"
        />
        <BooleanColumnSettings
            v-else-if="localColumn.type === 'boolean'"
            :column="localColumn"
            @update:column="handleSpecializedUpdate"
        />
        <ReferenceColumnSettings
            v-else-if="localColumn.type === 'reference'"
            :column="localColumn"
            @update:column="handleSpecializedUpdate"
            @reference-type-change="handleReferenceTypeChange"
        />
      </el-form>
    </div>
    <div v-else class="column-settings-placeholder">
      <el-empty description="Выберите колонку для настройки" :image-size="60" />
    </div>
  </div>
</template>

<script setup>
/**
 * @component ColumnSettings
 *
 * Основной компонент настроек для колонки шаблона.
 * Отображает базовые настройки и подключает специализированные компоненты.
 *
 * @props {Object} column - Объект колонки
 * @props {Array} columnTypes - Доступные типы колонок
 *
 * @emits {Event} update:column - Событие обновления колонки
 * @param {Object} updatedColumn - Объект обновленной колонки
 * @emits {Event} reference-type-change - Событие изменения типа справочника
 * @param {string} entityType - Новый тип справочника
 * @emits {Event} option-add - Событие добавления опции
 * @emits {Event} option-remove - Событие удаления опции
 * @param {number} index - Индекс удаляемой опции
 */
import { ref, computed, watch, onMounted } from 'vue';
import { ElMessage, ElIcon, ElEmpty, ElAlert } from 'element-plus';
import { Rank, Plus, Delete, Loading } from '@element-plus/icons-vue';
import draggable from 'vuedraggable';
// Импортируем специализированные компоненты
import TextColumnSettings from './components/TextColumnSettings.vue';
import NumberColumnSettings from './components/NumberColumnSettings.vue';
import SelectColumnSettings from './components/SelectColumnSettings.vue';
import DateColumnSettings from './components/DateColumnSettings.vue';
import DateTimeColumnSettings from './components/DateTimeColumnSettings.vue';
import BooleanColumnSettings from './components/BooleanColumnSettings.vue';
import ReferenceColumnSettings from './components/ReferenceColumnSettings.vue';
// Импортируем утилиты
import {
  getBooleanSetting,
  setBooleanSetting,
  parseBooleanValue
} from '@/components/DynamicTable/utils/booleanUtils';
import {
  columnTypes,
  textDataTypes,
  dateFormats
} from '@/components/DynamicTable/utils/constants';
import {
  formatDateDisplay,
  formatDateExample,
  convertDateFormat,
  parseFlexibleDate
} from '@/components/DynamicTable/utils/dateUtils';
import {
  formatReferenceDisplay,
  getExampleFormat,
  getAvailableKeys,
  getNestedValue
} from '@/components/DynamicTable/utils/referenceUtils';

const props = defineProps({
  /**
   * Объект колонки
   * @type {Object}
   */
  column: {
    type: Object,
    required: true
  },
  /**
   * Доступные типы колонок
   * @type {Array}
   */
  columnTypes: {
    type: Array,
    required: true,
    default: () => []
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
  'reference-type-change',
  /**
   * Событие добавления опции
   */
  'option-add',
  /**
   * Событие удаления опции
   * @param {number} index - Индекс удаляемой опции
   */
  'option-remove'
]);

// === Состояния ===
const localColumn = ref({ ...props.column });

// === Вычисляемые свойства ===
// (Базовые вычисляемые свойства, если есть)

// === Методы ===
const handleColumnUpdate = () => {
  if (localColumn.value) {
    emit('update:column', JSON.parse(JSON.stringify(localColumn.value)));
  }
};

const onColumnTypeChange = (newType) => {
  // Инициализация специфичных полей для каждого типа
  switch (newType) {
    case 'reference':
      localColumn.value.reference = localColumn.value.reference || { entityType: '', displayFormat: '' };
      break;
    case 'boolean':
      localColumn.value.booleanSettings = localColumn.value.booleanSettings || {
        displayType: 'toggle',
        trueLabel: 'Да',
        falseLabel: 'Нет'
      };
      break;
    case 'date':
    case 'datetime':
      localColumn.value.dateFormat = localColumn.value.dateFormat || (newType === 'datetime' ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD');
      break;
    case 'select':
      localColumn.value.options = localColumn.value.options || ['Вариант 1', 'Вариант 2'];
      break;
    case 'number':
      localColumn.value.unit = localColumn.value.unit || '';
      break;
    case 'text':
      localColumn.value.dataType = localColumn.value.dataType || 'string';
      break;
  }

  // Удаление настроек, не относящихся к текущему типу
  if (newType !== 'reference') delete localColumn.value.reference;
  if (newType !== 'boolean') delete localColumn.value.booleanSettings;
  if (newType !== 'select') delete localColumn.value.options;
  if (newType !== 'number') delete localColumn.value.unit;
  if (newType !== 'date' && newType !== 'datetime') delete localColumn.value.dateFormat;
  if (newType !== 'text') delete localColumn.value.dataType;

  handleColumnUpdate();
};

// Обработчики событий от специализированных компонентов
const handleSpecializedUpdate = (updatedColumn) => {
  localColumn.value = updatedColumn;
  handleColumnUpdate();
};

const handleReferenceTypeChange = (entityType) => {
  emit('reference-type-change', entityType);
};

const handleOptionAdd = () => {
  emit('option-add');
};

const handleOptionRemove = (index) => {
  emit('option-remove', index);
};

// === Watchers ===
watch(() => props.column, (newVal) => {
  localColumn.value = { ...newVal };
}, { deep: true });
</script>

<style lang="scss" scoped>
.column-settings {
  padding: 5px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;

  .settings-form {
    flex: 1;
    overflow-y: auto;
    padding-right: 5px;

    .el-form-item {
      margin-bottom: 4px;

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
  }

  .column-settings-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 200px;
    background-color: #fafafa;
    border-radius: 4px;
  }
}
</style>
