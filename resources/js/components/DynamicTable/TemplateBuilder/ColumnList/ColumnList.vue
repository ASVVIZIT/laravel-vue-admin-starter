<!-- resources/js/components/DynamicTable/TemplateBuilder/ColumnList/ColumnList.vue -->
<template>
  <div class="columns-section">
    <div class="section-header">
      <h3>Колонки шаблона</h3>
      <div class="column-creation">
        <el-select
            v-model="newColumnType"
            placeholder="Тип колонки"
            clearable
            style="width: 140px; margin-right: 8px;"
        >
          <el-option
              v-for="type in columnTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
          />
        </el-select>
        <el-button type="success" @click="addColumn" size="small">
          <el-icon><Plus /></el-icon>
          Добавить
        </el-button>
      </div>
    </div>

    <el-alert
        v-if="columns.length === 0"
        type="info"
        :closable="false"
        style="margin-bottom: 8px; padding: 6px 10px; font-size: 12px;"
    >
      Добавьте хотя бы одну колонку для создания шаблона
    </el-alert>

    <div class="columns-table-container" ref="columnsListRef">
      <draggable
          v-model="internalColumns"
          item-key="tempId"
          tag="div"
          class="columns-table"
          :animation="200"
          ghost-class="drag-ghost"
          chosen-class="drag-chosen"
          drag-class="drag-class"
          @start="onDragStart"
          @end="onDragEnd"
          handle=".sort-handle"
          :scroll-sensitivity="100"
          :scroll-speed="10"
          :force-fallback="false"
          :fallback-tolerance="0"
          :fallback-on-body="false"
          :scroll="true"
          :scroll-auto-threshold="50"
          ref="columnsDraggableRef"
      >
        <template #item="{ element, index }">
          <ColumnRow
              :column="element"
              :index="index"
              :is-active="selectedIndex === index"
              @click="selectColumn(index)"
              @remove="removeColumn(index)"
              @update-column="updateColumn(index, $event)"
              @mouseenter="onRowMouseEnter(index)"
              @mouseleave="onRowMouseLeave"
          />
        </template>
      </draggable>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import draggable from 'vuedraggable';
import ColumnRow from './ColumnRow.vue';

const props = defineProps({
  columns: { type: Array, required: true, default: () => [] },
  selectedColumnIndex: { type: Number, default: null },
  columnTypes: { type: Array, required: true, default: () => [] }
});

const emit = defineEmits(['update:columns', 'column-select', 'column-remove', 'column-add', 'column-update']);

const internalColumns = ref([...props.columns]);
const newColumnType = ref('text');
const columnsListRef = ref(null);
const columnsDraggableRef = ref(null);

const selectedIndex = computed(() => props.selectedColumnIndex);

watch(() => props.columns, (newVal) => {
  if (JSON.stringify(internalColumns.value) !== JSON.stringify(newVal)) {
    internalColumns.value = [...newVal];
  }
}, { deep: true });

watch(internalColumns, (newVal) => {
  emit('update:columns', newVal.map((col, index) => ({
    ...col,
    order: index
  })));
}, { deep: true });

const selectColumn = (index) => {
  emit('column-select', index);
};

const removeColumn = (index) => {
  emit('column-remove', index);
};

const updateColumn = (index, updatedColumn) => {
  emit('column-update', index, updatedColumn);
};

const addColumn = () => {
  if (!newColumnType.value) {
    return;
  }

  const newColumnData = {
    type: newColumnType.value,
    label: `Колонка ${internalColumns.value.length + 1}`,
    order: internalColumns.value.length
  };
  emit('column-add', newColumnData);
  newColumnType.value = 'text';
};

const onDragStart = (event) => {
  document.body.classList.add('column-list-dragging-in-progress');
  document.body.style.userSelect = 'none';
  document.body.style.webkitUserSelect = 'none';
  document.body.style.mozUserSelect = 'none';
  document.body.style.msUserSelect = 'none';
  document.body.style.cursor = 'grabbing';
};

const onDragEnd = (event) => {
  document.body.classList.remove('column-list-dragging-in-progress');
  document.body.style.userSelect = '';
  document.body.style.webkitUserSelect = '';
  document.body.style.mozUserSelect = '';
  document.body.style.msUserSelect = '';
  document.body.style.cursor = '';

  const updatedColumns = internalColumns.value.map((col, index) => ({
    ...col,
    order: index
  }));
  emit('update:columns', updatedColumns);
};

const onRowMouseEnter = (index) => {
};

const onRowMouseLeave = () => {
};
</script>

<style lang="scss" scoped>
.columns-section {
  flex: 1;
  background-color: #fff;
  padding: 10px;
  border-radius: 6px;
  box-shadow: 0 1px 6px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    flex-shrink: 0;

    h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: #303133;
    }

    .column-creation {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;

      .el-select {
        width: 140px;

        :deep(.el-input__wrapper) {
          padding: 0 6px;
          height: 26px;
          line-height: 26px;
        }
        :deep(.el-input__inner) {
          height: 26px;
          line-height: 26px;
          padding: 0 6px;
          font-size: 12px;
        }
        :deep(.el-input__prefix) {
          .el-icon {
            font-size: 13px;
          }
        }
      }

      .el-button {
        height: 26px;
        padding: 0 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;

        .el-icon {
          margin-right: 4px;
          width: 13px;
          height: 13px;

          > svg {
            width: 13px;
            height: 13px;
          }
        }
      }
    }
  }

  .columns-table-container {
    flex: 1;
    overflow-y: auto;
    border: 1px solid #ebeef5;
    border-radius: 3px;
    padding: 1px;
    position: relative;

    .columns-table {
      width: 100%;

      .draggable-columns-list {
        min-height: 40px;
      }
    }
  }
}

.drag-ghost {
  opacity: 0.8 !important;
  background-color: #ecf5ff !important;
  border: 1px dashed #409eff !important;
  transform: scale(1.02) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  z-index: 1000 !important;
  position: relative !important;
  transition: all 0.2s ease !important;
  cursor: grabbing !important;

  .column-row {
    border: 1px solid #409eff !important;
    background-color: #fff !important;
    box-shadow: none !important;

    .sort-handle {
      color: #409eff !important;
    }
  }
}

.drag-chosen {
  background-color: #ecf5ff;
  border-left: 2px solid #409eff;
  border-right: 2px solid #409eff;
}

.drag-class {
  display: none;
}

.column-list-dragging-in-progress {
  user-select: none !important;
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
  cursor: grabbing !important;
}
</style>
