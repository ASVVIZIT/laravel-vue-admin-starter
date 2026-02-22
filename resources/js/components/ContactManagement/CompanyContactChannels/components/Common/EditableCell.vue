<template>
  <div class="editable-cell" ref="cellRef">
    <!-- ★★★ РЕЖИМ ПРОСМОТРА ★★★ -->
    <div
        v-if="!isEditing"
        class="cell-display"
        @dblclick.stop="startEditing"
    >
      <slot name="display" :value="props.modelValue">
        <span class="cell-text" :title="displayValue">{{ displayValue }}</span>
      </slot>
      <el-button
          v-if="!props.disabled && props.showEditButton"
          link
          type="primary"
          size="small"
          class="edit-button"
          @click.stop="startEditing"
      >
        <el-icon><Edit /></el-icon>
      </el-button>
    </div>

    <!-- ★★★ РЕЖИМ РЕДАКТИРОВАНИЯ (INLINE В ЯЧЕЙКЕ) ★★★ -->
    <div v-else class="cell-edit-inline">
      <el-input
          v-if="props.type === 'text'"
          ref="inputRef"
          v-model="tempValue"
          type="text"
          :placeholder="props.placeholder"
          :maxlength="props.maxLength"
          size="small"
          :disabled="props.disabled || props.loading"
          clearable
          @keyup.enter="saveEdit"
          @keyup.esc="cancelEdit"
          @blur="handleBlur"
          class="inline-input"
      />
      <el-input
          v-else-if="props.type === 'textarea'"
          ref="inputRef"
          v-model="tempValue"
          type="textarea"
          :placeholder="props.placeholder"
          :rows="1"
          :maxlength="props.maxLength"
          size="small"
          :disabled="props.disabled || props.loading"
          @keydown.ctrl.enter.exact.prevent="saveEdit"
          @keyup.esc="cancelEdit"
          @blur="handleBlur"
          class="inline-input"
      />
      <el-select
          v-else-if="props.type === 'select'"
          ref="inputRef"
          v-model="tempValue"
          :placeholder="props.placeholder"
          size="small"
          :disabled="props.disabled || props.loading"
          clearable
          filterable
          :teleported="true"
          @keyup.esc="cancelEdit"
          @blur="handleBlur"
          class="inline-select"
      >
        <slot name="options" />
      </el-select>

      <div v-if="props.showActionButtons" class="inline-actions">
        <el-button
            size="small"
            type="success"
            @click="saveEdit"
            :disabled="props.loading"
            class="action-btn-save"
            title="Сохранить (Enter)"
        >
          <el-icon><Check /></el-icon>
        </el-button>
        <el-button
            size="small"
            type="info"
            @click="cancelEdit"
            :disabled="props.loading"
            class="action-btn-cancel"
            title="Отмена (Esc)"
        >
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';
import { Edit, Check, Close } from '@element-plus/icons-vue';
import {
  EDITABLE_CELL_PROPS_CONFIG,
  EDITABLE_CELL_UI,
} from '../../utils/paginationOptions.js';

const props = defineProps(EDITABLE_CELL_PROPS_CONFIG);

const emit = defineEmits(['update:modelValue', 'save', 'cancel', 'start-edit', 'error']);

const cellRef = ref(null);
const inputRef = ref(null);
const isEditing = ref(false);
const tempValue = ref('');
const hasError = ref(false);
const isSaving = ref(false);
const isCanceling = ref(false);

const displayValue = computed(() => {
  if (
      props.modelValue === null ||
      props.modelValue === undefined ||
      props.modelValue === ''
  ) {
    return props.emptyText;
  }
  return String(props.modelValue);
});

const startEditing = () => {
  if (props.disabled || props.loading || isSaving.value) return;

  emit('start-edit');
  isEditing.value = true;
  tempValue.value = props.modelValue ?? '';
  hasError.value = false;
  isCanceling.value = false;

  nextTick(() => {
    if (inputRef.value) {
      const inputElement = inputRef.value.$el?.querySelector('input, textarea, .el-input__inner');
      if (inputElement) {
        inputElement.focus();
        if (props.type === 'text' && inputElement.setSelectionRange) {
          const len = inputElement.value.length;
          inputElement.setSelectionRange(len, len);
        }
      }
    }
  });
};

const handleBlur = () => {
  if (isCanceling.value) {
    isCanceling.value = false;
    return;
  }
  if (props.showActionButtons) {
    return;
  }
  saveEdit();
};

const saveEdit = () => {
  if (props.loading || isSaving.value) return;

  isSaving.value = true;

  const newValue = tempValue.value ?? '';

  if (props.validator && newValue !== '') {
    const isValid = props.validator(newValue);
    if (!isValid) {
      hasError.value = true;
      emit('error', newValue);
      isSaving.value = false;
      return;
    }
  }

  hasError.value = false;

  emit('update:modelValue', newValue);
  emit('save', newValue);

  finishEditing();
};

const cancelEdit = () => {
  if (props.loading || isSaving.value) return;

  isCanceling.value = true;
  emit('cancel');
  finishEditing();
};

const finishEditing = () => {
  isEditing.value = false;
  tempValue.value = '';
  hasError.value = false;
  isSaving.value = false;
  isCanceling.value = false;
};
</script>

<style scoped>
.editable-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: v-bind('EDITABLE_CELL_UI.INPUT_HEIGHT');
}

.cell-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: v-bind('EDITABLE_CELL_UI.INPUT_HEIGHT');
  cursor: pointer;
  gap: 2px;
}

.cell-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 2px;
  font-size: v-bind('EDITABLE_CELL_UI.FONT_SIZE');
  line-height: v-bind('EDITABLE_CELL_UI.LINE_HEIGHT');
  color: #303133;
}

.edit-button {
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.2s;
  font-size: v-bind('EDITABLE_CELL_UI.BUTTON_FONT_SIZE');
  width: auto;
  height: auto;
  padding: 0;
}

.cell-display:hover .edit-button {
  opacity: 1;
}

/* ★★★ INLINE РЕДАКТИРОВАНИЕ ★★★ */
.cell-edit-inline {
  display: flex;
  align-items: center;
  gap: 2px;
  width: 100%;
  min-height: v-bind('EDITABLE_CELL_UI.INPUT_HEIGHT');
}

.inline-input,
.inline-select {
  flex: 1;
  min-width: 0;
}

.inline-input :deep(.el-input__wrapper),
.inline-select :deep(.el-select__wrapper) {
  height: v-bind('EDITABLE_CELL_UI.INPUT_HEIGHT');
  padding: 0 4px;
  box-shadow: none;
  border-radius: 2px;
}

.inline-input :deep(.el-input__inner),
.inline-select :deep(.el-input__inner) {
  font-size: v-bind('EDITABLE_CELL_UI.FONT_SIZE');
  height: v-bind('EDITABLE_CELL_UI.INPUT_HEIGHT');
  padding: 0 4px;
}

/* ★★★ УЗКИЕ ВЫСОКИЕ КНОПКИ (12×18px) ★★★ */
.inline-actions {
  display: flex;
  align-items: center;
  gap: 1px;
  flex-shrink: 0;
  padding: 0;
  margin: 0;
}

/* ★★★ УБИРАЕМ Element Plus MARGIN ★★★ */
.inline-actions :deep(.el-button) {
  margin-left: 0 !important;
  margin-right: 0 !important;
}

.action-btn-save,
.action-btn-cancel {
  width: 12px;
  height: 18px;
  min-width: 12px;
  min-height: 18px;
  max-width: 12px;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  border: 1px solid transparent;
}

.action-btn-save :deep(.el-icon),
.action-btn-cancel :deep(.el-icon) {
  font-size: 10px;
  width: 10px;
  height: 10px;
}

.action-btn-save {
  background-color: #67C23A;
  color: #FFFFFF;
}

.action-btn-save:hover:not(:disabled) {
  background-color: #85CE61;
}

.action-btn-cancel {
  background-color: #909399;
  color: #FFFFFF;
}

.action-btn-cancel:hover:not(:disabled) {
  background-color: #A6A9AD;
}

.action-btn-save:disabled,
.action-btn-cancel:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

:deep(.el-textarea--small .el-textarea__inner) {
  font-size: v-bind('EDITABLE_CELL_UI.FONT_SIZE');
  padding: 0 4px;
}

:deep(.el-input__inner::placeholder) {
  color: #c0c4cc;
  font-size: v-bind('EDITABLE_CELL_UI.FONT_SIZE');
}

:deep(.el-input__clear) {
  font-size: 8px;
}

:deep(.el-select__caret) {
  font-size: 8px;
}
</style>
