<template>
  <div class="editable-cell">
    <div
        v-if="!isEditing"
        class="cell-display"
        @dblclick.stop="startEditing"
    >
      <span class="cell-text" :title="displayValue">{{ displayValue }}</span>
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

    <div v-else class="cell-edit" :class="{ 'is-error': hasError }">
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
      />
      <el-input
          v-else-if="props.type === 'textarea'"
          ref="inputRef"
          v-model="tempValue"
          type="textarea"
          :placeholder="props.placeholder"
          :rows="props.rows"
          :maxlength="props.maxLength"
          size="small"
          :disabled="props.disabled || props.loading"
          @keydown.ctrl.enter.exact.prevent="saveEdit"
          @keyup.esc="cancelEdit"
          @blur="handleBlur"
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
          @keyup.esc="cancelEdit"
          @blur="handleBlur"
      >
        <slot name="options" />
      </el-select>

      <el-button-group
          v-if="props.showActionButtons"
          class="edit-actions"
      >
        <el-button
            size="small"
            type="success"
            @click="saveEdit"
            :disabled="props.loading"
        >
          <el-icon><Check /></el-icon>
        </el-button>
        <el-button
            size="small"
            type="info"
            @click="cancelEdit"
            :disabled="props.loading"
        >
          <el-icon><Close /></el-icon>
        </el-button>
      </el-button-group>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, computed } from 'vue';
import { Edit, Check, Close } from '@element-plus/icons-vue';
import {
  EDITABLE_CELL_PROPS_CONFIG,
  EDITABLE_CELL_UI,
} from '../../utils/paginationOptions.js';

const props = defineProps(EDITABLE_CELL_PROPS_CONFIG);

const emit = defineEmits(['update:modelValue', 'save', 'cancel', 'start-edit', 'error']);

const isEditing = ref(false);
const tempValue = ref('');
const inputRef = ref(null);
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
        if (inputElement.select) {
          inputElement.select();
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

.cell-edit {
  display: flex;
  align-items: center;
  gap: 2px;
  width: 100%;
}

.cell-edit.is-error {
  outline: 1px solid v-bind('EDITABLE_CELL_UI.ERROR_COLOR');
  border-radius: 2px;
  padding: 1px;
}

.edit-actions {
  flex-shrink: 0;
  font-size: v-bind('EDITABLE_CELL_UI.BUTTON_FONT_SIZE');
  line-height: 1;
}

.edit-actions .el-button {
  padding: 1px 2px;
  margin: 0;
  border-radius: 0;
}

.edit-actions .el-button:first-child {
  border-radius: 2px 0 0 2px;
}

.edit-actions .el-button:last-child {
  border-radius: 0 2px 2px 0;
}

:deep(.el-input--small .el-input__wrapper) {
  padding: v-bind('EDITABLE_CELL_UI.INPUT_PADDING');
  height: v-bind('EDITABLE_CELL_UI.INPUT_HEIGHT');
}

:deep(.el-input--small .el-input__inner) {
  font-size: v-bind('EDITABLE_CELL_UI.FONT_SIZE');
  line-height: v-bind('EDITABLE_CELL_UI.LINE_HEIGHT');
  height: v-bind('EDITABLE_CELL_UI.INPUT_HEIGHT');
}

:deep(.el-textarea--small .el-textarea__inner) {
  font-size: v-bind('EDITABLE_CELL_UI.FONT_SIZE');
  line-height: v-bind('EDITABLE_CELL_UI.LINE_HEIGHT');
  padding: v-bind('EDITABLE_CELL_UI.INPUT_PADDING');
}

:deep(.el-input__inner::placeholder) {
  color: #c0c4cc;
  font-size: v-bind('EDITABLE_CELL_UI.FONT_SIZE');
}

:deep(.el-input__clear) {
  font-size: v-bind('EDITABLE_CELL_UI.BUTTON_FONT_SIZE');
}
</style>
