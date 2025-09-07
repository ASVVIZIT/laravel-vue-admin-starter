<!-- resources/js/components/DynamicTable/TemplateBuilder/ColumnSettings/components/TextColumnSettings.vue -->
<template>
  <div class="text-column-settings">
    <el-form-item label="Тип данных">
      <el-select
          v-model="localColumn.dataType"
          @change="handleUpdate"
          placeholder="Выберите тип данных"
      >
        <el-option
            v-for="dataType in textDataTypes"
            :key="dataType.value"
            :label="dataType.label"
            :value="dataType.value"
        />
      </el-select>
    </el-form-item>
  </div>
</template>

<script setup>
/**
 * @component TextColumnSettings
 *
 * Компонент настроек для текстовой колонки.
 * Позволяет выбрать тип данных текстовой колонки (строка, email, URL).
 *
 * @props {Object} column - Объект колонки типа "text"
 *
 * @emits {Event} update:column - Событие обновления колонки
 * @param {Object} updatedColumn - Объект обновленной колонки
 */
import { ref, watch } from 'vue';
import { textDataTypes } from '@/components/DynamicTable/utils/constants';

const props = defineProps({
  /**
   * Объект колонки типа "text"
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
.text-column-settings {
  .el-form-item {
    margin-bottom: 15px;

    :deep(.el-form-item__label) {
      font-weight: 500;
      color: #606266;
      padding-bottom: 4px;
    }

    .el-select {
      width: 100%;
    }
  }
}
</style>
