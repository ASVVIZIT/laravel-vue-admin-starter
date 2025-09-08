<!-- resources/js/components/DynamicTable/TemplateBuilder/PreviewCell.vue -->
<template>
  <div class="preview-cell">
    <div v-if="!isEditing" class="cell-content">
      <ReferenceCell
          v-if="column.type === 'reference' && referenceData && referenceData.length > 0"
          :value="value"
          :column="column"
          :reference-data="referenceData"
          class="cell-component"
      />
      <BooleanCell
          v-else-if="column.type === 'boolean'"
          :value="value"
          :column="column"
          class="cell-component"
      />
      <SelectCell
          v-else-if="column.type === 'select'"
          :value="value"
          :column="column"
          class="cell-component"
      />
      <DateCell
          v-else-if="column.type === 'date'"
          :value="value"
          :column="column"
          class="cell-component"
      />
      <DateTimeCell
          v-else-if="column.type === 'datetime'"
          :value="value"
          :column="column"
          class="cell-component"
      />
      <NumberCell
          v-else-if="column.type === 'number'"
          :value="value"
          :column="column"
          class="cell-component"
      />
      <TextCell
          v-else-if="column.type === 'text'"
          :value="value"
          :column="column"
          class="cell-component"
      />
      <span v-else class="cell-component">{{ value || '' }}</span>
    </div>

    <div v-else class="cell-editing">
      <ReferenceCell
          v-if="column.type === 'reference' && referenceData && referenceData.length > 0"
          :value="value"
          :column="column"
          :reference-data="referenceData"
          :is-editing="true"
          @update-value="$emit('update-value', $event)"
          class="cell-component"
      />
      <BooleanCell
          v-else-if="column.type === 'boolean'"
          :value="value"
          :column="column"
          :is-editing="true"
          @update-value="$emit('update-value', $event)"
          class="cell-component"
      />
      <SelectCell
          v-else-if="column.type === 'select'"
          :value="value"
          :column="column"
          :is-editing="true"
          @update-value="$emit('update-value', $event)"
          class="cell-component"
      />
      <DateCell
          v-else-if="column.type === 'date'"
          :value="value"
          :column="column"
          :is-editing="true"
          @update-value="$emit('update-value', $event)"
          class="cell-component"
      />
      <DateTimeCell
          v-else-if="column.type === 'datetime'"
          :value="value"
          :column="column"
          :is-editing="true"
          @update-value="$emit('update-value', $event)"
          class="cell-component"
      />
      <NumberCell
          v-else-if="column.type === 'number'"
          :value="value"
          :column="column"
          :is-editing="true"
          @update-value="$emit('update-value', $event)"
          class="cell-component"
      />
      <TextCell
          v-else-if="column.type === 'text'"
          :value="value"
          :column="column"
          :is-editing="true"
          @update-value="$emit('update-value', $event)"
          class="cell-component"
      />
      <span v-else class="cell-component">{{ value || '' }}</span>
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
    });
  }
});
</script>

<style lang="scss" scoped>
.preview-cell {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  position: relative;
  cursor: pointer;
  box-sizing: border-box;
  overflow: hidden;

  .cell-content {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    padding: 0 4px;
    box-sizing: border-box;

    .cell-component {
      flex: 1;
      height: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      text-align: left;
      display: block;
    }
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
    border: 1px solid #409eff;
    border-radius: 0;
    background-color: #fff;
    overflow: hidden;

    .cell-component {
      width: 100%;
      height: 100%;
    }

    :deep(.el-input),
    :deep(.el-select),
    :deep(.el-date-picker),
    :deep(.el-input-number),
    :deep(.el-switch),
    :deep(.el-checkbox) {
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

      .el-input__wrapper,
      .el-select__wrapper,
      .el-date-editor__wrapper {
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

      .el-input__inner,
      .el-select__inner,
      .el-date-editor__inner {
        width: 100% !important;
        height: 100% !important;
        margin: 0 !important;
        padding: 2px 4px !important;
        box-sizing: border-box !important;
        border: none !important;
        outline: none !important;
        font-family: inherit !important;
        font-size: 12px !important;
        background-color: transparent !important;
        color: inherit !important;
        border-radius: 0 !important;
        line-height: 16px;
      }
    }
  }
}
</style>
