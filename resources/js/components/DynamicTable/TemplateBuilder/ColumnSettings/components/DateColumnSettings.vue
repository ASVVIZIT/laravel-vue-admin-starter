<!-- resources/js/components/DynamicTable/TemplateBuilder/ColumnSettings/components/DateColumnSettings.vue -->
<template>
  <div class="date-column-settings">
    <el-form-item label="Формат даты">
      <el-select
          v-model="localColumn.dateFormat"
          @change="handleUpdate"
          placeholder="Выберите формат даты"
      >
        <el-option
            v-for="format in dateFormats"
            :key="format.value"
            :label="`${format.label} (${format.example})`"
            :value="format.value"
        />
      </el-select>
    </el-form-item>
  </div>
</template>

<script setup>
/**
 * @component DateColumnSettings
 *
 * Компонент настроек для даты и временных колонок.
 * Позволяет выбрать формат отображения даты/времени.
 *
 * @props {Object} column - Объект колонки типа "date" или "datetime"
 *
 * @emits {Event} update:column - Событие обновления колонки
 * @param {Object} updatedColumn - Объект обновленной колонки
 */
import { ref, watch } from 'vue';
import { dateFormats } from '@/components/DynamicTable/utils/constants';

const props = defineProps({
  /**
   * Объект колонки типа "date" или "datetime"
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
.date-column-settings {
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
