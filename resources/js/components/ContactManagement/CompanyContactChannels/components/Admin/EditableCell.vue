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
  modelValue: {
    type: String,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: 'text', // 'text' или 'textarea'
    validator: (value) => ['text', 'textarea'].includes(value),
  },
  placeholder: {
    type: String,
    default: '',
  },
  rows: {
    type: Number,
    default: 1, // Для textarea
  },
  maxLength: {
    type: Number,
    default: undefined,
  },
  // Функция валидации, возвращает true, если значение корректно
  validator: {
    type: Function,
    default: () => true,
  },
});

const emit = defineEmits(['update:modelValue', 'save', 'cancel']);

const isEditing = ref(false);
const tempValue = ref('');
const inputRef = ref(null);
const hasError = ref(false);

// Отображаемое значение (для режима просмотра)
const displayValue = computed(() => {
  return props.modelValue || '-'; // Показываем '-' если пусто
});

// Начать редактирование
const startEditing = () => {
  if (props.disabled) return;
  isEditing.value = true;
  tempValue.value = props.modelValue || '';
  hasError.value = false;
  // Фокус на поле ввода после рендера
  nextTick(() => {
    inputRef.value?.focus();
    // Выделяем весь текст
    if (inputRef.value?.$el?.querySelector('input, textarea')) {
      inputRef.value.$el.querySelector('input, textarea').select();
    }
  });
};

// Сохранить изменения
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

// Отменить редактирование
const cancelEdit = () => {
  tempValue.value = props.modelValue; // Сбрасываем значение
  finishEditing();
};

// Завершить редактирование
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
  min-height: 24px; /* Высота для пустых ячеек */
  cursor: pointer; /* Показываем, что область кликабельна */
}

.cell-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 4px;
}

.edit-button {
  flex-shrink: 0; /* Кнопка не сжимается */
  opacity: 0;
  transition: opacity 0.2s;
  font-size: 14px; /* Уменьшенный размер шрифта для иконки */
  width: auto; /* Сбрасываем ширину */
  height: auto; /* Сбрасываем высоту */
  padding: 2px; /* Уменьшаем внутренние отступы */
}

.cell-display:hover .edit-button {
  opacity: 1;
}

.cell-edit {
  display: flex;
  align-items: center;
  gap: 4px; /* Отступ между полем ввода и кнопками */
  width: 100%;
}

.cell-edit.is-error {
  outline: 1px solid #f56c6c; /* Красная рамка при ошибке */
  border-radius: 4px;
}

.edit-actions {
  flex-shrink: 0; /* Группа кнопок не сжимается */
  font-size: 14px; /* Уменьшенный размер шрифта для иконок в группе */
  line-height: 1; /* Компактная высота строки */
}

/* Убираем стандартные отступы у кнопок в группе */
.edit-actions .el-button {
  padding: 2px 4px; /* Уменьшены отступы */
  margin: 0; /* Убраны отступы */
  border-radius: 0; /* Убраны скругления */
}

/* Восстанавливаем скругления только для первой и последней кнопки */
.edit-actions .el-button:first-child {
  border-radius: 4px 0 0 4px; /* Скругление слева у первой */
}

.edit-actions .el-button:last-child {
  border-radius: 0 4px 4px 0; /* Скругление справа у последней */
}
</style>
