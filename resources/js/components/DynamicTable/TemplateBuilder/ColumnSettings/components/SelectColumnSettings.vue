<!-- resources/js/components/DynamicTable/TemplateBuilder/ColumnSettings/components/SelectColumnSettings.vue -->
<template>
  <div class="select-column-settings">
    <el-form-item label="Варианты выбора">
      <div class="options-list">
        <draggable
            v-model="localColumn.options"
            item-key="index"
            tag="div"
            class="draggable-options-list"
            :animation="200"
            ghost-class="drag-ghost"
            chosen-class="drag-chosen"
            drag-class="drag-class"
            @end="handleUpdate"
            handle=".option-handle"
        >
          <template #item="{ element, index }">
            <div class="option-item">
              <div class="option-handle">
                <el-icon><Rank /></el-icon>
              </div>
              <el-input
                  v-model="localColumn.options[index]"
                  @input="handleUpdate"
                  size="small"
              />
              <el-button
                  type="danger"
                  size="small"
                  circle
                  @click="removeOption(index)"
                  :disabled="localColumn.options.length === 1"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </template>
        </draggable>
        <el-button
            type="primary"
            size="small"
            @click="addOption"
            class="add-option-btn"
        >
          <el-icon><Plus /></el-icon>
          Добавить вариант
        </el-button>
      </div>
    </el-form-item>
  </div>
</template>

<script setup>
/**
 * @component SelectColumnSettings
 *
 * Компонент настроек для колонки с выбором значения.
 * Позволяет управлять вариантами выбора (добавлять, удалять, изменять порядок).
 *
 * @props {Object} column - Объект колонки типа "select"
 *
 * @emits {Event} update:column - Событие обновления колонки
 * @param {Object} updatedColumn - Объект обновленной колонки
 * @emits {Event} option-add - Событие добавления опции
 * @emits {Event} option-remove - Событие удаления опции
 * @param {number} index - Индекс удаляемой опции
 */
import { ref, watch } from 'vue';
import { Rank, Plus, Delete } from '@element-plus/icons-vue';
import draggable from 'vuedraggable';

const props = defineProps({
  /**
   * Объект колонки типа "select"
   * @type {Object}
   */
  column: {
    type: Object,
    required: true
  }
});

const emit = defineEmits([
  /**
   * Событие обновления колонки
   * @param {Object} updatedColumn - Объект обновленной колонки
   */
  'update:column',
  /**
   * Событие добавления опции
   */
  'option-add',
  /**
   * Событие удаления опции
   * @param {number} index - Индекс удаляемой опции
   */
  'option-remove'
]);

const localColumn = ref({ ...props.column });

const handleUpdate = () => {
  emit('update:column', JSON.parse(JSON.stringify(localColumn.value)));
};

const addOption = () => {
  const newOption = `Вариант ${localColumn.value.options.length + 1}`;
  localColumn.value.options.push(newOption);
  handleUpdate();
  emit('option-add');
};

const removeOption = (index) => {
  localColumn.value.options.splice(index, 1);
  handleUpdate();
  emit('option-remove', index);
};

watch(() => props.column, (newVal) => {
  localColumn.value = { ...newVal };
}, { deep: true });
</script>

<style lang="scss" scoped>
.select-column-settings {
  .el-form-item {
    margin-bottom: 15px;

    :deep(.el-form-item__label) {
      font-weight: 500;
      color: #606266;
      padding-bottom: 4px;
    }

    .options-list {
      .draggable-options-list {
        margin-bottom: 8px;
      }

      .option-item {
        display: flex;
        align-items: center;
        margin-bottom: 6px;

        .option-handle {
          cursor: move;
          padding: 0 6px;
          color: #909399;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          flex-shrink: 0;

          .el-icon {
            > svg {
              width: 16px;
              height: 16px;
            }
          }
        }

        .el-input {
          flex: 1;
          margin: 0 6px;

          :deep(.el-input__inner) {
            height: 26px;
            line-height: 26px;
            padding: 0 8px;
          }
        }

        .el-button {
          padding: 0;
          width: 24px;
          height: 24px;
          min-width: 24px;
          flex-shrink: 0;
        }
      }

      .add-option-btn {
        margin-top: 8px;
        height: 26px;
        padding: 0 8px;
        font-size: 13px;

        .el-icon {
          margin-right: 3px;
        }
      }
    }
  }
}
</style>
