<!-- resources/js/components/DynamicTable/TemplateBuilder/ColumnSettings/components/NumberColumnSettings.vue -->
<template>
  <div class="number-column-settings">
    <el-form-item label="Единица измерения">
      <el-input
          v-model="localColumn.unit"
          @input="handleUpdate"
          placeholder="Введите единицу измерения (кг, см, шт и т.д.)"
      />
    </el-form-item>
  </div>
</template>

<script setup>
/**
 * @component NumberColumnSettings
 *
 * Компонент настроек для числовой колонки.
 * Позволяет указать единицу измерения для числовой колонки.
 *
 * @props {Object} column - Объект колонки типа "number"
 *
 * @emits {Event} update:column - Событие обновления колонки
 * @param {Object} updatedColumn - Объект обновленной колонки
 */
import { ref, watch } from 'vue';

const props = defineProps({
  /**
   * Объект колонки типа "number"
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
  'update:column'
]);

const localColumn = ref({ ...props.column });

const handleUpdate = () => {
  emit('update:column', JSON.parse(JSON.stringify(localColumn.value)));
};

watch(() => props.column, (newVal) => {
  localColumn.value = { ...newVal };
}, { deep: true });
</script>

<style lang="scss" scoped>
.number-column-settings {
  .el-form-item {
    margin-bottom: 15px;

    :deep(.el-form-item__label) {
      font-weight: 500;
      color: #606266;
      padding-bottom: 4px;
    }

    .el-input {
      width: 100%;
    }
  }
}
</style>
