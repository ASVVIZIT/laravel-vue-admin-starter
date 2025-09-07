<!-- resources/js/components/DynamicTable/TemplateBuilder/PreviewCell.vue -->
<template>
  <div class="preview-cell">
    <div v-if="!isEditing" class="cell-content">
      <ReferenceCell
          v-if="column.type === 'reference' && referenceData && referenceData.length > 0"
          :value="value"
          :column="column"
          :reference-data="referenceData"
      />
      <BooleanCell
          v-else-if="column.type === 'boolean'"
          :value="value"
          :column="column"
      />
      <SelectCell
          v-else-if="column.type === 'select'"
          :value="value"
          :column="column"
      />
      <DateCell
          v-else-if="column.type === 'date'"
          :value="value"
          :column="column"
      />
      <DateTimeCell
          v-else-if="column.type === 'datetime'"
          :value="value"
          :column="column"
      />
      <NumberCell
          v-else-if="column.type === 'number'"
          :value="value"
          :column="column"
      />
      <TextCell
          v-else-if="column.type === 'text'"
          :value="value"
          :column="column"
      />
      <span v-else>{{ value || '' }}</span>
    </div>

    <div v-else class="cell-editing">
      <ReferenceCell
          v-if="column.type === 'reference' && referenceData && referenceData.length > 0"
          :value="value"
          :column="column"
          :reference-data="referenceData"
          :is-editing="true"
          @update-value="$emit('update-value', $event)"
      />
      <BooleanCell
          v-else-if="column.type === 'boolean'"
          :value="value"
          :column="column"
          :is-editing="true"
          @update-value="$emit('update-value', $event)"
      />
      <SelectCell
          v-else-if="column.type === 'select'"
          :value="value"
          :column="column"
          :is-editing="true"
          @update-value="$emit('update-value', $event)"
      />
      <DateCell
          v-else-if="column.type === 'date'"
          :value="value"
          :column="column"
          :is-editing="true"
          @update-value="$emit('update-value', $event)"
      />
      <DateTimeCell
          v-else-if="column.type === 'datetime'"
          :value="value"
          :column="column"
          :is-editing="true"
          @update-value="$emit('update-value', $event)"
      />
      <NumberCell
          v-else-if="column.type === 'number'"
          :value="value"
          :column="column"
          :is-editing="true"
          @update-value="$emit('update-value', $event)"
      />
      <TextCell
          v-else-if="column.type === 'text'"
          :value="value"
          :column="column"
          :is-editing="true"
          @update-value="$emit('update-value', $event)"
      />
      <span v-else>{{ value || '' }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import ReferenceCell from './cells/ReferenceCell.vue';
import BooleanCell from './cells/BooleanCell.vue';
import SelectCell from './cells/SelectCell.vue';
import TextCell from './cells/TextCell.vue';
import NumberCell from './cells/NumberCell.vue';
import DateCell from './cells/DateCell.vue';
import DateTimeCell from './cells/DateTimeCell.vue';

const props = defineProps({
  value: { type: [String, Number, Boolean, Object], default: null },
  column: { type: Object, required: true },
  rowIndex: { type: Number, required: true },
  colIndex: { type: Number, required: true },
  isEditing: { type: Boolean, default: false },
  referenceData: { type: Array, default: () => [] }
});

const emit = defineEmits(['start-edit', 'update-value']);

onMounted(() => {
  if (props.isEditing) {
    nextTick(() => {
      // Фокусировка обрабатывается внутри дочерних компонентов
    });
  }
});
</script>

<style lang="scss" scoped>
.preview-cell {
  height: 100%;
  width: 100%;
  position: relative;
  cursor: pointer;
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  .cell-content {
    height: 100%;
    display: flex;
    align-items: center;
    padding: 0 6px;
    box-sizing: border-box;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cell-editing {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
    padding: 0;
    box-sizing: border-box;

    :deep(.el-input),
    :deep(.el-select),
    :deep(.el-date-picker),
    :deep(.el-input-number),
    :deep(.el-switch),
    :deep(.el-checkbox) {
      width: 100%;
      height: 100%;

      .el-input__wrapper,
      .el-select__wrapper {
        width: 100%;
        height: 100%;
      }

      .el-input__inner,
      .el-select__inner,
      .el-date-editor__inner {
        width: 100%;
        height: 100%;
        line-height: 24px;
        padding: 0 5px;
        box-sizing: border-box;
      }
    }
  }
}
</style>
