<template>
  <div class="editable-cell" ref="cellRef">
    <div
        v-if="!isEditing"
        class="cell-display"
        :class="{ 'cell-disabled': !props.fieldAvailable }"
        @dblclick.stop="startEditing"
    >
      <slot name="display" :value="props.modelValue">
        <span class="cell-text" :title="displayValue">{{ displayValue }}</span>
      </slot>

      <!-- ✅ TOOLTIP ДЛЯ НЕДОСТУПНЫХ ПОЛЕЙ -->
      <el-tooltip
          v-if="!props.fieldAvailable && props.unavailableReason"
          :content="props.unavailableReason"
          placement="top"
          :show-after="TIMINGS.TOOLTIP_DELAY"
      >
        <el-icon class="disabled-icon"><CircleClose /></el-icon>
      </el-tooltip>

      <el-tooltip
          v-if="!props.disabled && props.showEditButton && props.fieldAvailable"
          content="Редактировать (DblClick)"
          placement="top"
          :show-after="TIMINGS.TOOLTIP_DELAY"
      >
        <el-button
            link
            type="primary"
            size="small"
            class="edit-button"
            @click.stop="startEditing"
        >
          <el-icon><Edit /></el-icon>
        </el-button>
      </el-tooltip>
    </div>

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
          @clear="onClear"
          @keyup.esc="cancelEdit"
          @blur="handleBlur"
          class="inline-select"
      >
        <slot name="options" />
      </el-select>

      <!-- ✅ КНОПКИ ДЕЙСТВИЙ (если showActionButtons) -->
      <div v-if="props.showActionButtons" class="inline-actions">
        <el-tooltip
            content="Сохранить (Enter)"
            placement="top"
            :show-after="TIMINGS.TOOLTIP_DELAY"
            :hide-after="TIMINGS.TOOLTIP_HIDE_DELAY"
        >
          <el-button
              size="small"
              type="success"
              @click="saveEdit"
              :disabled="props.loading || isSaving"
              class="action-btn-save"
          >
            <el-icon><Check /></el-icon>
          </el-button>
        </el-tooltip>

        <el-tooltip
            content="Отмена (Esc)"
            placement="top"
            :show-after="TIMINGS.TOOLTIP_DELAY"
            :hide-after="TIMINGS.TOOLTIP_HIDE_DELAY"
        >
          <el-button
              size="small"
              type="info"
              @click="cancelEdit"
              :disabled="props.loading || isSaving"
              class="action-btn-cancel"
          >
            <el-icon><Close /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onUnmounted } from 'vue';
import { Edit, Check, Close } from '@element-plus/icons-vue';
import {
  EDITABLE_CELL_PROPS_CONFIG,
  EDITABLE_CELL_UI,
  BREAKPOINTS,
  ANIMATIONS,
  TIMINGS,
  COLORS,
  validateField,
} from '../../config/appConfigIndex.js';

const props = defineProps({
  ...EDITABLE_CELL_PROPS_CONFIG,
});

const emit = defineEmits(['update:modelValue', 'save', 'cancel', 'start-edit', 'error']);

const cellRef = ref(null);
const inputRef = ref(null);
const isEditing = ref(false);
const tempValue = ref('');
const hasError = ref(false);
const isSaving = ref(false);
const isCanceling = ref(false);
const isClearing = ref(false);

let saveTimeout = null;
let blurTimeout = null;

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
  // ✅ БЛОКИРОВКА РЕДАКТИРОВАНИЯ ЕСЛИ ПОЛЕ НЕДОСТУПНО
  if (!props.fieldAvailable || props.disabled || props.loading || isSaving.value) {
    if (!props.fieldAvailable && props.unavailableReason) {
      ElMessage.warning(props.unavailableReason);
    }
    return;
  }

  emit('start-edit');
  isEditing.value = true;
  tempValue.value = props.modelValue ?? '';
  hasError.value = false;
  isCanceling.value = false;
  isClearing.value = false;

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

const onClear = () => {
  isClearing.value = true;
  tempValue.value = '';
};

const handleBlur = () => {
  if (isCanceling.value || isClearing.value) {
    isCanceling.value = false;
    isClearing.value = false;
    return;
  }

  if (props.showActionButtons) {
    return;
  }

  // Отложенное сохранение при blur
  if (blurTimeout) {
    clearTimeout(blurTimeout);
  }

  blurTimeout = setTimeout(() => {
    if (!isCanceling.value && !isClearing.value) {
      saveEdit();
    }
  }, TIMINGS.DEBOUNCE_FILTER);
};

const debouncedSave = () => {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  saveTimeout = setTimeout(() => {
    saveEdit();
  }, TIMINGS.DEBOUNCE_FILTER);
};

const saveEdit = () => {
  if (props.loading || isSaving.value) return;

  isSaving.value = true;

  const newValue = tempValue.value ?? '';

  // ✅ 1. КАСТОМНАЯ ВАЛИДАЦИЯ (если передана)
  if (props.validator) {
    const isValid = props.validator(newValue);
    if (!isValid) {
      hasError.value = true;
      emit('error', 'Ошибка валидации');
      isSaving.value = false;
      return;
    }
  }

  // ✅ 2. АВТОМАТИЧЕСКАЯ ВАЛИДАЦИЯ ПО ТИПУ ПОЛЯ
  if (props.fieldName) {
    const validation = validateField(props.fieldName, newValue, {
      type: props.channelType,
      min: props.min,
      max: props.maxLength,
    });

    if (!validation.valid) {
      hasError.value = true;
      emit('error', validation.message);
      ElMessage.warning(validation.message);
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
  isClearing.value = false;
};

// ✅ ОЧИСТКА ТАЙМЕРОВ ПРИ УНИЧТОЖЕНИИ
onUnmounted(() => {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  if (blurTimeout) {
    clearTimeout(blurTimeout);
  }
});
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
  transition: color v-bind('TIMINGS.DELAY_FAST') v-bind('ANIMATIONS.EASING_EASE');
}

.edit-button {
  flex-shrink: 0;
  opacity: 0;
  transition: opacity v-bind('TIMINGS.DELAY_FAST') v-bind('ANIMATIONS.EASING_EASE');
  font-size: v-bind('EDITABLE_CELL_UI.BUTTON_FONT_SIZE');
  width: auto;
  height: auto;
  padding: 0;
}

.cell-display:hover .edit-button {
  opacity: 1;
}

.cell-display:hover .cell-text {
  color: v-bind('COLORS.PRIMARY');
}

.cell-edit-inline {
  display: flex;
  align-items: center;
  gap: 2px;
  width: 100%;
  min-height: v-bind('EDITABLE_CELL_UI.INPUT_HEIGHT');
  animation: fadeIn v-bind('TIMINGS.DELAY_FAST') v-bind('ANIMATIONS.EASING_EASE');
}

/* ✅ НЕДОСТУПНЫЕ ПОЛЯ — СЕРЫЙ ЦВЕТ */
.cell-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cell-disabled .cell-text {
  color: #909399 !important;
}

.cell-disabled:hover .edit-button {
  opacity: 0 !important;
}

.disabled-icon {
  color: #909399;
  font-size: 14px;
  margin-left: 4px;
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
  transition: all v-bind('TIMINGS.DELAY_FAST') v-bind('ANIMATIONS.EASING_EASE');
}

.inline-input :deep(.el-input__wrapper:hover),
.inline-select :deep(.el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px v-bind('COLORS.PRIMARY') inset;
}

.inline-input :deep(.el-input__wrapper.is-focus),
.inline-select :deep(.el-select__wrapper.is-focus) {
  box-shadow: 0 0 0 1px v-bind('COLORS.PRIMARY') inset;
}

.inline-input :deep(.el-input__inner),
.inline-select :deep(.el-input__inner) {
  font-size: v-bind('EDITABLE_CELL_UI.FONT_SIZE');
  height: v-bind('EDITABLE_CELL_UI.INPUT_HEIGHT');
  padding: 0 4px;
}

.inline-actions {
  display: flex;
  align-items: center;
  gap: 1px;
  flex-shrink: 0;
  padding: 0;
  margin: 0;
  animation-delay: v-bind('TIMINGS.DELAY_FAST');
}

.inline-actions :deep(.el-button) {
  margin-left: 0 !important;
  margin-right: 0 !important;
}

.action-btn-save,
.action-btn-cancel {
  width: 16px;
  height: 20px;
  min-width: 16px;
  min-height: 20px;
  max-width: 16px;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  border: 1px solid transparent;
  transition: all v-bind('TIMINGS.DELAY_FAST') v-bind('ANIMATIONS.EASING_EASE');
}

.action-btn-save :deep(.el-icon),
.action-btn-cancel :deep(.el-icon) {
  font-size: 10px;
  width: 10px;
  height: 10px;
}

.action-btn-save {
  background-color: v-bind('COLORS.SUCCESS');
  color: #FFFFFF;
  border-color: v-bind('COLORS.SUCCESS');
}

.action-btn-save:hover:not(:disabled) {
  background-color: v-bind('COLORS.SUCCESS');
  filter: brightness(1.1);
  transform: scale(1.1);
}

.action-btn-cancel {
  background-color: v-bind('COLORS.INFO');
  color: #FFFFFF;
  border-color: v-bind('COLORS.INFO');
}

.action-btn-cancel:hover:not(:disabled) {
  background-color: v-bind('COLORS.INFO');
  filter: brightness(1.1);
  transform: scale(1.1);
}

.action-btn-save:disabled,
.action-btn-cancel:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.inline-input.error :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px v-bind('EDITABLE_CELL_UI.ERROR_COLOR') inset !important;
  animation: shake v-bind('TIMINGS.DELAY_FAST') v-bind('ANIMATIONS.EASING_EASE') !important;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

@media (max-width: v-bind('BREAKPOINTS.XXXL')) {
  .editable-cell {
    min-height: 20px;
  }
  .action-btn-save,
  .action-btn-cancel {
    width: 14px;
    height: 18px;
    min-width: 14px;
    min-height: 18px;
    max-width: 14px;
  }
  .cell-text {
    font-size: 7px;
  }
}

@media (max-width: v-bind('BREAKPOINTS.XL')) {
  .editable-cell {
    min-height: 18px;
  }
  .action-btn-save,
  .action-btn-cancel {
    width: 12px;
    height: 16px;
    min-width: 12px;
    min-height: 16px;
    max-width: 12px;
  }
  .action-btn-save :deep(.el-icon),
  .action-btn-cancel :deep(.el-icon) {
    font-size: 9px;
    width: 9px;
    height: 9px;
  }
  .cell-text {
    font-size: 7px;
  }
  .edit-button {
    font-size: 9px;
  }
}

@media (max-width: v-bind('BREAKPOINTS.XS')) {
  .editable-cell {
    min-height: 16px;
  }
  .action-btn-save,
  .action-btn-cancel {
    width: 10px;
    height: 14px;
    min-width: 10px;
    min-height: 14px;
    max-width: 10px;
  }
  .action-btn-save :deep(.el-icon),
  .action-btn-cancel :deep(.el-icon) {
    font-size: 8px;
    width: 8px;
    height: 8px;
  }
  .cell-text {
    font-size: 6px;
  }
  .edit-button {
    display: none;
  }
}

@media (hover: none) and (pointer: coarse) {
  .action-btn-save,
  .action-btn-cancel {
    width: 24px;
    height: 24px;
    min-width: 24px;
    min-height: 24px;
    max-width: 24px;
  }
  .action-btn-save :deep(.el-icon),
  .action-btn-cancel :deep(.el-icon) {
    font-size: 14px;
    width: 14px;
    height: 14px;
  }
  .edit-button {
    opacity: 1;
  }
}
</style>
