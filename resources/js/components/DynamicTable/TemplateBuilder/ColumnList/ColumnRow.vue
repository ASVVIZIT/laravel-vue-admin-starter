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
import { ref, nextTick } from 'vue';
import { Edit, Delete, Rank, Setting } from '@element-plus/icons-vue';

const props = defineProps({
  column: { type: Object, required: true },
  index: { type: Number, required: true },
  isActive: { type: Boolean, default: false }
});

const emit = defineEmits(['click', 'remove', 'update-column']);

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
  emit('click', props.index);
};

const handleRemove = () => {
  emit('remove', props.index);
};

const startInlineEdit = () => {
  isEditingName.value = true;
  editingNameValue.value = props.column.label || '';
  nextTick(() => {
    if (inlineEditInputRef.value && inlineEditInputRef.value.focus) {
      inlineEditInputRef.value.focus();
    }
  });
};

const saveInlineEdit = () => {
  if (editingNameValue.value.trim() !== '') {
    const updatedColumn = {
      ...props.column,
      label: editingNameValue.value.trim()
    };
    emit('update-column', updatedColumn);
  }
  cancelInlineEdit();
};

const cancelInlineEdit = () => {
  isEditingName.value = false;
  editingNameValue.value = '';
};
</script>

<style lang="scss" scoped>
.column-row {
  display: flex;
  align-items: center;
  padding: 4px 6px;
  border-radius: 3px;
  border-top: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 2px solid rgba(230, 230, 236, 0.19);
  border-right: 2px solid rgba(230, 230, 236, 0.19);
  position: relative;
  height: 32px;

  &:hover {
    background-color: #f5f7fa;
    border-color: #dcdfe6;
  }

  &.active {
    background-color: #ecf5ff;
    border-left: 2px solid #409eff;
    border-right: 2px solid #409eff;
  }

  .sort-handle {
    cursor: move;
    padding: 0 3px;
    color: #909399;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    margin-right: 4px;

    .el-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 14px;
      height: 14px;

      > svg {
        width: 14px;
        height: 14px;
      }
    }
  }

  .column-name {
    flex: 1;
    padding: 0 4px;
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
          margin-right: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
          font-size: 12px;
        }

        .edit-icon {
          opacity: 0;
          transition: opacity 0.2s;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          color: #909399;

          .el-icon {
            width: 100%;
            height: 100%;

            > svg {
              width: 12px;
              height: 12px;
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
        font-size: 10px;
        margin-left: 4px;
        flex-shrink: 0;
        background-color: #f0f2f5;
        padding: 0 3px;
        border-radius: 2px;
        height: 18px;
        line-height: 18px;
      }
    }

    .inline-edit {
      width: 100%;

      .el-input {
        :deep(.el-input__wrapper) {
          padding: 0 3px;
          border-radius: 2px;
          border: 1px solid #dcdfe6;
          height: 20px;

          &:hover {
            border-color: #c0c4cc;
          }
        }
        :deep(.el-input__inner) {
          height: 18px;
          line-height: 18px;
          padding: 0 3px;
          font-size: 12px;
        }
      }
    }
  }

  .column-actions {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
    margin-left: 4px;

    .el-button {
      padding: 0;
      width: 24px;
      height: 24px;
      min-width: 24px;
      flex-shrink: 0;

      .el-icon {
        width: 16px;
        height: 16px;

        > svg {
          width: 16px;
          height: 16px;
        }
      }
    }
  }
}
</style>
