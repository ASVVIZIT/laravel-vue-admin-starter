<template>
  <div class="editable-cell">
    <!-- Режим просмотра -->
    <div v-if="!isEditing" class="cell-display" @dblclick="startEditing">
      <span class="cell-text" :title="displayValue">{{ displayValue }}</span>
      <el-button
          v-if="!disabled"
          link
          type="primary"
          size="small"
          class="edit-button"
          @click.stop="startEditing"
      >
        <el-icon><Edit /></el-icon>
      </el-button>
    </div>

    <!-- Режим редактирования -->
    <div v-else class="cell-edit" :class="{ 'is-error': hasError }">
      <el-input
          v-if="type === 'text'"
          ref="inputRef"
          v-model="tempValue"
          :type="type"
          :placeholder="placeholder"
          :rows="rows"
          :maxlength="maxLength"
          size="small"
          @keyup.enter="saveEdit"
          @keyup.esc="cancelEdit"
          @blur="saveEdit"
      />
      <el-input
          v-else-if="type === 'textarea'"
          ref="inputRef"
          v-model="tempValue"
          type="textarea"
          :placeholder="placeholder"
          :rows="rows"
          :maxlength="maxLength"
          size="small"
          @keydown.ctrl.enter.exact.prevent="saveEdit"
          @keydown.meta.enter.exact.prevent="saveEdit"
          @keyup.esc="cancelEdit"
          @blur="saveEdit"
      />
      <el-button-group class="edit-actions">
        <el-button size="small" type="success" @click="saveEdit" :disabled="hasError">
          <el-icon><Check /></el-icon>
        </el-button>
        <el-button size="small" type="info" @click="cancelEdit">
          <el-icon><Close /></el-icon>
        </el-button>
      </el-button-group>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, computed } from 'vue';
import { Edit, Check, Close } from '@element-plus/icons-vue';

const props = defineProps({
  modelValue: { type: String, required: true },
  disabled: { type: Boolean, default: false },
  type: {
    type: String,
    default: 'text',
    validator: (value) => ['text', 'textarea'].includes(value),
  },
  placeholder: { type: String, default: '' },
  rows: { type: Number, default: 1 },
  maxLength: { type: Number, default: undefined },
  validator: { type: Function, default: () => true },
});

const emit = defineEmits(['update:modelValue', 'save', 'cancel']);

const isEditing = ref(false);
const tempValue = ref('');
const inputRef = ref(null);
const hasError = ref(false);

const displayValue = computed(() => {
  return props.modelValue || '-';
});

/**
 * Начало редактирования
 * ← КУРСОР В КОНЕЦ ТЕКСТА (вместо выделения всего)
 */
const startEditing = () => {
  if (props.disabled) return;
  isEditing.value = true;
  tempValue.value = props.modelValue || '';
  hasError.value = false;

  nextTick(() => {
    inputRef.value?.focus();

    // ← Получаем input/textarea элемент
    const inputElement = inputRef.value?.$el?.querySelector('input, textarea');

    if (inputElement) {
      inputElement.focus();

      const valueLength = inputElement.value.length;
      inputElement.setSelectionRange(valueLength, valueLength);

      console.log('[EditableCell] Cursor placed at end:', valueLength);
    }
  });
};

const saveEdit = () => {
  const isValid = props.validator(tempValue.value);
  if (!isValid) {
    hasError.value = true;
    return;
  }

  hasError.value = false;
  if (tempValue.value !== props.modelValue) {
    emit('update:modelValue', tempValue.value);
    emit('save', tempValue.value);
  }
  finishEditing();
};

const cancelEdit = () => {
  tempValue.value = props.modelValue;
  finishEditing();
};

const finishEditing = () => {
  isEditing.value = false;
  tempValue.value = '';
};
</script>

<style scoped>
.editable-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cell-display {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 24px;
  cursor: pointer;
}

.cell-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 4px;
  font-size: 12px;
  line-height: 14px;
}

.edit-button {
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.2s;
  font-size: 14px;
  width: auto;
  height: auto;
  padding: 2px;
}

.cell-display:hover .edit-button {
  opacity: 1;
}

.cell-edit {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
}

.cell-edit.is-error {
  outline: 1px solid #f56c6c;
  border-radius: 4px;
}

.edit-actions {
  flex-shrink: 0;
  font-size: 14px;
  line-height: 1;
}

.edit-actions .el-button {
  padding: 2px 4px;
  margin: 0;
  border-radius: 0;
}

.edit-actions .el-button:first-child {
  border-radius: 3px 0 0 3px;
}

.edit-actions .el-button:last-child {
  border-radius: 0 3px 3px 0;
}

/* Компактный input */
:deep(.el-input--small .el-input__wrapper) {
  padding: 2px 8px;
  height: 24px;
}

:deep(.el-input--small .el-input__inner) {
  font-size: 12px;
  line-height: 14px;
}

:deep(.el-textarea--small .el-textarea__inner) {
  font-size: 12px;
  line-height: 14px;
  padding: 4px 8px;
}
</style>
