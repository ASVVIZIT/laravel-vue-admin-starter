<!-- resources/js/components/DynamicTable/TemplateBuilder/ColumnList/ColumnRow.vue -->
<template>
  <div
      class="column-row"
      :class="{ 'active': isActive }"
      @click="handleClick"
      draggable="true"
      @dragstart.prevent
      @dragend.prevent
  >
    <div class="sort-handle">
      <el-icon><Rank /></el-icon>
    </div>

    <div class="column-name" @dblclick="startInlineEdit">
      <div class="name-header">
        <div v-if="isEditingName" class="inline-edit">
          <el-input
              ref="inlineEditInputRef"
              v-model="editingNameValue"
              @blur="saveInlineEdit"
              @keyup.enter="saveInlineEdit"
              @keyup.esc="cancelInlineEdit"
              @click.stop
              size="small"
          />
        </div>
        <div v-else class="name-display">
          <span class="name-text">{{ column.label || 'Без названия' }}</span>
          <el-icon class="edit-icon" @click.stop="startInlineEdit">
            <Edit />
          </el-icon>
        </div>

        <el-tag size="small" type="info" class="column-type">
          {{ getColumnTypeName(column.type) }}
        </el-tag>
      </div>
    </div>

    <div class="column-actions">
      <el-button
          size="small"
          type="primary"
          circle
          @click.stop="handleClick"
          title="Настройки"
      >
        <el-icon><Setting /></el-icon>
      </el-button>
      <el-button
          size="small"
          type="danger"
          circle
          @click.stop="handleRemove"
          title="Удалить"
      >
        <el-icon><Delete /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<script setup>
/**
 * @component ColumnRow
 *
 * Компонент строки колонки в списке колонок.
 * Отображает информацию о колонке и предоставляет интерфейс для выбора и удаления.
 *
 * @props {Object} column - Объект колонки
 * @props {number} index - Индекс колонки в списке
 * @props {boolean} isActive - Флаг активной (выбранной) колонки
 *
 * @emits {Event} click - Событие клика по колонке
 * @param {number} index - Индекс колонки
 * @emits {Event} remove - Событие удаления колонки
 * @param {number} index - Индекс колонки
 * @emits {Event} update-column - Событие обновления колонки
 * @param {Object} updatedColumn - Объект обновленной колонки
 */
import { ref, nextTick } from 'vue';
import { Edit, Delete, Rank, Setting } from '@element-plus/icons-vue';

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
   * Индекс колонки в списке
   * @type {number}
   */
  index: {
    type: Number,
    required: true
  },
  /**
   * Флаг активной (выбранной) колонки
   * @type {boolean}
   */
  isActive: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([
  /**
   * Событие клика по колонке
   * @param {number} index - Индекс колонки
   */
  'click',
  /**
   * Событие удаления колонки
   * @param {number} index - Индекс колонки
   */
  'remove',
  /**
   * Событие обновления колонки
   * @param {Object} updatedColumn - Объект обновленной колонки
   */
  'update-column'
]);

const columnTypes = [
  { value: 'text', label: 'Текст' },
  { value: 'number', label: 'Число' },
  { value: 'select', label: 'Выбор' },
  { value: 'date', label: 'Дата' },
  { value: 'datetime', label: 'Дата и время' },
  { value: 'boolean', label: 'Да/Нет' },
  { value: 'reference', label: 'Справочник' },
];

const isEditingName = ref(false);
const editingNameValue = ref('');
const inlineEditInputRef = ref(null);

const getColumnTypeName = (type) => {
  const found = columnTypes.find(t => t.value === type);
  return found ? found.label : type;
};

const handleClick = () => {
  console.log(`[ColumnRow.handleClick] CALLED for index: ${props.index}`);
  emit('click', props.index);
  console.log(`[ColumnRow.handleClick] EMITTED 'click' event with index: ${props.index}`);
  console.log(`[ColumnRow.handleClick] FINISHED`);
};

const handleRemove = () => {
  console.log(`[ColumnRow.handleRemove] CALLED for index: ${props.index}`);
  emit('remove', props.index);
  console.log(`[ColumnRow.handleRemove] EMITTED 'remove' event with index: ${props.index}`);
  console.log(`[ColumnRow.handleRemove] FINISHED`);
};

const startInlineEdit = () => {
  console.log(`[ColumnRow.startInlineEdit] CALLED`);
  isEditingName.value = true;
  editingNameValue.value = props.column.label || '';
  nextTick(() => {
    if (inlineEditInputRef.value && inlineEditInputRef.value.focus) {
      inlineEditInputRef.value.focus();
    }
  });
  console.log(`[ColumnRow.startInlineEdit] FINISHED`);
};

const saveInlineEdit = () => {
  console.log(`[ColumnRow.saveInlineEdit] CALLED`);
  if (editingNameValue.value.trim() !== '') {
    const updatedColumn = {
      ...props.column,
      label: editingNameValue.value.trim()
    };
    console.log(`[ColumnRow.saveInlineEdit] Column label updated to: ${editingNameValue.value.trim()}`);
    emit('update-column', updatedColumn);
    console.log(`[ColumnRow.saveInlineEdit] EMITTED 'update-column' with updatedColumn`);
  }
  cancelInlineEdit();
  console.log(`[ColumnRow.saveInlineEdit] FINISHED`);
};

const cancelInlineEdit = () => {
  console.log(`[ColumnRow.cancelInlineEdit] CALLED`);
  isEditingName.value = false;
  editingNameValue.value = '';
  console.log(`[ColumnRow.cancelInlineEdit] FINISHED`);
};
</script>

<style lang="scss" scoped>
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

  .sort-handle {
    cursor: move;
    padding: 0 4px;
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
      min-width: 28px;
      flex-shrink: 0;
    }
  }
}
</style>
