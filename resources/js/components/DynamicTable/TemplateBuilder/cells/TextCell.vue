<!-- resources/js/components/DynamicTable/TemplateBuilder/cells/TextCell.vue -->
<template>
  <div @click="handleClick" class="text-cell">
    <span v-if="!isEditing" class="text-display">
      {{ displayValue }}
    </span>
    <div v-else class="text-editing">
      <el-input
          ref="editInput"
          v-model="editValue"
          @blur="handleUpdateValue"
          @keyup.enter="handleUpdateValue"
          size="small"
          class="cell-edit-input cell-edit-input--text"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue';

const props = defineProps({
  value: { type: [String, Number], default: null },
  column: { type: Object, required: true },
  isEditing: { type: Boolean, default: false }
});

const emit = defineEmits(['update-value', 'start-edit']);

const editValue = ref('');
const editInput = ref(null);

const displayValue = computed(() => {
  if (props.value === null || props.value === undefined) return '';
  return String(props.value);
});

const handleClick = () => {
  if (!props.isEditing) {
    emit('start-edit');
  }
};

const handleUpdateValue = () => {
  let newValue = editValue.value;
  if (props.column.type === 'number') {
    const numValue = parseFloat(newValue);
    newValue = isNaN(numValue) ? '' : numValue;
  }
  emit('update-value', newValue);
};

const focusInput = () => {
  nextTick(() => {
    if (editInput.value && editInput.value.$el) {
      const input = editInput.value.$el.querySelector('input');
      if (input) {
        input.focus();
        // Не вызываем select для текстовых полей при редактировании, чтобы избежать "прыжков"
        // input.select();
      }
    }
  });
};

watch(() => props.isEditing, (newVal) => {
  if (newVal) {
    editValue.value = displayValue.value;
    focusInput();
  }
}, { immediate: true });
</script>

<style lang="scss" scoped>
.text-cell {
  width: 100%;
  height: 100%;
  position: relative;
  cursor: pointer;
  box-sizing: border-box;
  padding: 0; // Отступы на родителе
  border: none; // Граница на родителе
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  .text-display {
    display: block;
    width: 100%;
    height: 100%;
    padding: 4px 8px; // Отступы внутри отображаемого значения
    box-sizing: border-box;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
    vertical-align: middle;
  }

  .text-editing {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
    padding: 0; // Нет отступов, input должен заполнить всё
    box-sizing: border-box;
    border: 1px solid #409eff; // Явная рамка редактирования
    border-radius: 0; // Без скруглений
    background-color: #fff;
    overflow: hidden;

    .cell-edit-input {
      width: 100% !important;
      height: 100% !important;
      margin: 0 !important;
      padding: 0 !important; // Отступы внутри input
      box-sizing: border-box !important;
      border: none !important; // Граница на .text-editing
      outline: none !important;
      font-family: inherit !important;
      font-size: inherit !important;
      background-color: transparent !important;
      color: inherit !important;
      border-radius: 0 !important;

      :deep(.el-input__wrapper) {
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

      :deep(.el-input__inner) {
        width: 100% !important;
        height: 100% !important;
        margin: 0 !important;
        padding: 4px 8px !important; // Отступы текста внутри input
        box-sizing: border-box !important;
        border: none !important;
        outline: none !important;
        font-family: inherit !important;
        font-size: inherit !important;
        background-color: transparent !important;
        color: inherit !important;
        border-radius: 0 !important;
        line-height: 24px; // Примерная высота строки
      }
    }
  }
}
</style>
