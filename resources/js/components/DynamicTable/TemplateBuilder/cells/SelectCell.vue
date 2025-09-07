<!-- resources/js/components/DynamicTable/TemplateBuilder/cells/SelectCell.vue -->
<template>
  <div @click="handleClick" class="select-cell">
    <span v-if="!isEditing" class="select-display">
      {{ displayValue }}
    </span>
    <div v-else class="select-editing">
      <el-select
          ref="editInput"
          v-model="editValue"
          @change="handleUpdateValue"
          @blur="handleUpdateValue"
          size="small"
          placeholder="Выберите значение"
          filterable
          class="cell-edit-input cell-edit-input--select"
      >
        <el-option
            v-for="(option, index) in options"
            :key="index"
            :label="option"
            :value="option"
        />
      </el-select>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue';

const props = defineProps({
  value: {
    type: [String, Number],
    default: null
  },
  column: {
    type: Object,
    required: true
  },
  isEditing: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([
  'update-value'
]);

const editValue = ref('');
const editInput = ref(null);

const options = computed(() => {
  return props.column.options || [];
});

const displayValue = computed(() => {
  if (props.value === null || props.value === undefined) {
    return '';
  }

  const option = options.value.find(opt => opt === props.value);
  return option || props.value;
});

const handleClick = () => {
  if (!props.isEditing) {
    emit('start-edit');
  }
};

const handleUpdateValue = () => {
  emit('update-value', editValue.value);
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

watch(() => props.isEditing, (newVal) => {
  if (newVal) {
    editValue.value = props.value;
    focusInput();
  }
}, { immediate: true });
</script>

<style lang="scss" scoped>
.select-cell {
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

  .select-display {
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
    line-height: 24px; // Примерная высота строки
  }

  .select-editing {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
    padding: 0; // Нет отступов, input должен заполнить всё
    margin: 0; // Нет внешних отступов
    box-sizing: border-box;
    border: 1px solid #409eff; // Явная рамка редактирования
    border-radius: 0; // Без скруглений
    background-color: #fff;
    overflow: hidden;

    // === ИСПРАВЛЕНИЕ: Принудительное заполнение контейнера ===
    display: flex; // Flexbox для точного контроля
    align-items: stretch; // Растягиваем дочерний элемент
    justify-content: stretch; // Растягиваем дочерний элемент
    // === КОНЕЦ ИСПРАВЛЕНИЯ ===

    .cell-edit-input {
      width: 100% !important;
      height: 100% !important;
      min-width: unset !important; // Убираем минимальные размеры
      min-height: unset !important;
      max-width: 100% !important; // Ограничиваем максимальные размеры
      max-height: 100% !important;
      margin: 0 !important; // Убираем внешние отступы
      padding: 0 !important; // Убираем внутренние отступы
      box-sizing: border-box !important; // Включаем padding/border в размеры
      border: none !important; // Граница на .select-editing
      outline: none !important;
      font-family: inherit !important;
      font-size: inherit !important;
      background-color: transparent !important;
      color: inherit !important;
      border-radius: 0 !important; // Убираем скругления
      line-height: normal !important; // Сбрасываем line-height

      :deep(.el-select) {
        width: 100% !important;
        height: 100% !important;
        min-width: unset !important;
        min-height: unset !important;
        max-width: 100% !important;
        max-height: 100% !important;
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
          min-width: unset !important;
          min-height: unset !important;
          max-width: 100% !important;
          max-height: 100% !important;
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
            min-width: unset !important;
            min-height: unset !important;
            max-width: 100% !important;
            max-height: 100% !important;
            margin: 0 !important;
            padding: 0 !important; // Убираем padding обертки
            box-sizing: border-box !important;
            border: none !important;
            outline: none !important;
            background-color: transparent !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            display: flex !important;
            align-items: stretch !important;
            justify-content: stretch !important;
          }

          .el-input__inner {
            width: 100% !important;
            height: 100% !important;
            min-width: unset !important;
            min-height: unset !important;
            max-width: 100% !important;
            max-height: 100% !important;
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
            line-height: 24px !important; // Устанавливаем line-height, соответствующий высоте контейнера
            flex: 1 !important; // Занимает всё доступное пространство
          }
        }
      }
    }
  }
}
</style>
