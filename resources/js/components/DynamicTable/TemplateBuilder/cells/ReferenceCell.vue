<!-- resources/js/components/DynamicTable/TemplateBuilder/cells/ReferenceCell.vue -->
<template>
  <div @click="handleClick" class="reference-cell">
    <span v-if="!isEditing" class="reference-display">
      {{ displayValue }}
    </span>
    <div v-else class="reference-editing">
      <el-select
          ref="editInput"
          v-model="editValue"
          @change="handleUpdateValue"
          @blur="handleUpdateValue"
          size="small"
          placeholder="Выберите значение"
          filterable
          :loading="loadingReference"
          class="cell-edit-input cell-edit-input--reference"
      >
        <el-option
            v-for="item in referenceData"
            :key="item.id"
            :label="formatReferenceDisplay(item, column)"
            :value="item.id"
        />
      </el-select>
    </div>
  </div>
</template>

<script setup>
/**
 * @component ReferenceCell
 *
 * Компонент ячейки для отображения и редактирования значений справочника.
 * Использует el-select для выбора значения из списка.
 *
 * @props {Object} value - Значение ячейки (ID или объект с ID)
 * @props {Object} column - Объект колонки типа "reference"
 * @props {Array} referenceData - Данные справочника для выбора
 * @props {Boolean} isEditing - Флаг режима редактирования
 *
 * @emits {Event} update-value - Событие обновления значения
 * @param {*} newValue - Новое значение
 * @emits {Event} start-edit - Событие начала редактирования
 */
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { formatReferenceDisplay } from '@/components/DynamicTable/utils/referenceUtils';
import { dataSource } from '@/components/DynamicTable/services/dataSource';

const props = defineProps({
  /**
   * Значение ячейки (ID или объект с ID)
   * @type {Object}
   */
  value: {
    type: [String, Number, Object, null, undefined],
    default: null
  },
  /**
   * Объект колонки типа "reference"
   * @type {Object}
   */
  column: {
    type: Object,
    required: true
  },
  /**
   * Данные справочника для выбора
   * @type {Array}
   */
  referenceData: {
    type: Array,
    default: () => []
  },
  /**
   * Флаг режима редактирования
   * @type {Boolean}
   */
  isEditing: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([
  /**
   * Событие обновления значения
   * @param {*} newValue - Новое значение
   */
  'update-value',
  /**
   * Событие начала редактирования
   */
  'start-edit'
]);

// === Состояние ===
const editValue = ref(null);
const editInput = ref(null);
const loadingReference = ref(false);
const internalReferenceData = ref([]);

// === Вычисляемые свойства ===
const displayValue = computed(() => {
  if (!props.referenceData || props.referenceData.length === 0) {
    return 'Справочник не загружен';
  }

  let value = props.value;
  if (typeof value === 'object' && value !== null && value.id !== undefined) {
    value = value.id;
  }

  if (value === null || value === undefined) {
    return 'Не выбрано';
  }

  const item = props.referenceData.find(item => item.id == value);
  return item ? formatReferenceDisplay(item, props.column) : `#${value} (не найдено)`;
});

// === Методы ===
const handleClick = () => {
  if (!props.isEditing) {
    emit('start-edit');
  }
};

const handleUpdateValue = (newValue) => {
  emit('update-value', newValue);
};

const focusInput = () => {
  nextTick(() => {
    if (editInput.value && editInput.value.$el) {
      const input = editInput.value.$el.querySelector('.el-input__inner');
      if (input) {
        input.focus();
      }
    }
  });
};

const loadReferenceData = async () => {
  if (!props.column.reference?.entityType) return;

  loadingReference.value = true;
  try {
    const data = await dataSource.getReferenceData(props.column.reference.entityType);
    internalReferenceData.value = data || [];
  } catch (error) {
    console.error(`Ошибка загрузки данных справочника ${props.column.reference.entityType}:`, error);
    ElMessage.error(`Не удалось загрузить данные справочника "${props.column.reference.entityType}"`);
    internalReferenceData.value = [];
  } finally {
    loadingReference.value = false;
  }
};

// === Lifecycle & Watchers ===
watch(() => props.isEditing, (newVal) => {
  if (newVal) {
    let value = props.value;
    if (typeof value === 'object' && value !== null && value.id !== undefined) {
      value = value.id;
    }
    editValue.value = value;
    focusInput();

    // Загружаем данные справочника при активации редактирования
    if (props.column.reference?.entityType && (!props.referenceData || props.referenceData.length === 0)) {
      loadReferenceData();
    }
  }
}, { immediate: true });

onMounted(() => {
  if (props.isEditing) {
    let value = props.value;
    if (typeof value === 'object' && value !== null && value.id !== undefined) {
      value = value.id;
    }
    editValue.value = value;
    focusInput();

    if (props.column.reference?.entityType && (!props.referenceData || props.referenceData.length === 0)) {
      loadReferenceData();
    }
  }
});

watch(() => props.column.reference?.entityType, (newEntityType) => {
  if (newEntityType && props.isEditing) {
    loadReferenceData();
  }
});
</script>

<style lang="scss" scoped>
.reference-cell {
  width: 100%;
  height: 100%;
  position: relative;
  cursor: pointer;
  box-sizing: border-box;
  padding: 0;
  border: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  .reference-display {
    display: block;
    width: 100%;
    height: 100%;
    padding: 0 4px;
    box-sizing: border-box;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
    vertical-align: middle;
    display: flex;
    align-items: center;
    font-size: 12px;
  }

  .reference-editing {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
    padding: 0;
    box-sizing: border-box;
    border: 1px solid #409eff;
    border-radius: 0;
    background-color: #fff;
    overflow: hidden;

    .cell-edit-input {
      width: 100% !important;
      height: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      box-sizing: border-box !important;
      border: none !important;
      outline: none !important;
      font-family: inherit !important;
      font-size: inherit !important;
      background-color: transparent !important;
      color: inherit !important;
      border-radius: 0 !important;

      :deep(.el-select) {
        width: 100% !important;
        height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        box-sizing: border-box !important;
        border: none !important;
        outline: none !important;
        background-color: transparent !important;
        box-shadow: none !important;
        border-radius: 0 !important;

        .el-input {
          width: 100% !important;
          height: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          box-sizing: border-box !important;
          border: none !important;
          outline: none !important;
          background-color: transparent !important;
          box-shadow: none !important;
          border-radius: 0 !important;

          .el-input__wrapper {
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
            border: none !important;
            outline: none !important;
            background-color: transparent !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }

          .el-input__inner {
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 4px !important;
            box-sizing: border-box !important;
            border: none !important;
            outline: none !important;
            font-family: inherit !important;
            font-size: 12px !important;
            background-color: transparent !important;
            color: inherit !important;
            border-radius: 0 !important;
            line-height: 22px; /* Примерная высота строки для 24px ячейки */
          }
        }
      }
    }
  }
}
</style>
