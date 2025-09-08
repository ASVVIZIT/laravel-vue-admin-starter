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
          class="cell-edit-input"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue';

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
  padding: 0;
  border: none;
  overflow: hidden;

  .text-display {
    display: block;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
    display: flex;
    align-items: center;
    padding: 0 4px;
    font-size: 12px;
  }

  .text-editing {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
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
      font-size: 12px !important;
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
        padding: 0 4px !important;
        box-sizing: border-box !important;
        border: none !important;
        outline: none !important;
        font-family: inherit !important;
        font-size: 12px !important;
        background-color: transparent !important;
        color: inherit !important;
        border-radius: 0 !important;
      }
    }
  }
}
</style>
