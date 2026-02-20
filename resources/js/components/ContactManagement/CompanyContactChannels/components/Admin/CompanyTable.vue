<template>
  <el-table
      v-loading="loading"
      :data="data"
      style="width: 100%"
      row-key="id"
      border
      :default-sort="{ prop: 'id', order: 'ascending' }"
      size="small"
  >
    <el-table-column prop="id" label="ID" sortable width="58" fixed="left" />

    <el-table-column label="Иконка" width="58" fixed="left">
      <template #default="{ row }">
        <component :is="getIconComponent(row.settings?.icon)" class="table-icon" />
      </template>
    </el-table-column>

    <el-table-column prop="name" label="Название" sortable min-width="150">
      <template #default="{ row }">
        <CompanyEditableCell
            v-model="row.name"
            :validator="(val) => val.trim().length > 0 && val.length <= 255"
            @save="(val) => emitUpdate(row.id, 'name', val)"
            :disabled="row._updating"
        />
      </template>
    </el-table-column>
    <el-table-column prop="description" label="Описание" min-width="180">
      <template #default="{ row }">
        <CompanyEditableCell
            v-model="row.description"
            type="textarea"
            :rows="2"
            :validator="(val) => val === null || val === '' || (typeof val === 'string' && val.length <= 1000)"
            @save="(val) => emitUpdate(row.id, 'description', val)"
            :disabled="row._updating"
        />
      </template>
    </el-table-column>
    <el-table-column prop="address" label="Адрес" min-width="180">
      <template #default="{ row }">
        <CompanyEditableCell
            v-model="row.address"
            :validator="(val) => val === null || val === '' || (typeof val === 'string' && val.length <= 500)"
            @save="(val) => emitUpdate(row.id, 'address', val)"
            :disabled="row._updating"
        />
      </template>
    </el-table-column>

    <el-table-column label="Действия" width="90" fixed="right">
      <template #default="{ row }">
        <el-button size="small" type="primary" @click="emit('edit', row)" :disabled="row._updating">
          <el-icon><Edit /></el-icon>
        </el-button>
        <el-button size="small" type="danger" @click="emit('delete', row)" :disabled="row._updating">
          <el-icon><Delete /></el-icon>
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import { Edit, Delete } from '@element-plus/icons-vue';
import CompanyEditableCell from './CompanyEditableCell.vue';

const props = defineProps({
  data: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  iconMap: { type: Object, required: true }
});

const emit = defineEmits(['edit', 'delete', 'update-field']);

const getIconComponent = (iconString) => {
  const mappedComponent = props.iconMap[iconString];
  if (mappedComponent) return mappedComponent;
  return props.iconMap['default'];
};

const emitUpdate = (companyId, fieldName, newValue) => {
  emit('update-field', companyId, fieldName, newValue);
};
</script>

<style scoped>
.table-icon {
  width: 22px;
  height: 22px;
  color: #409EFF;
  text-align: center;
  vertical-align: middle;
}

/* Компактные кнопки */
:deep(.el-button--small) {
  --el-button-size: 20px;
  height: var(--el-button-size);
  padding: 4px 6px;
  font-size: 11px;
  border-radius: 3px;
}

/* Компактные ячейки таблицы */
:deep(.el-table .cell) {
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  overflow-wrap: break-word;
  line-height: 14px;
  padding: 0 12px;
}

:deep(.el-table--small .cell) {
  padding: 0 4px;
}

/* Компактные иконки в кнопках */
:deep(.el-button--small .el-icon) {
  width: 14px;
  height: 14px;
  font-size: 14px;
}

/* Компактная таблица */
:deep(.el-table--small) {
  font-size: 12px;
}

:deep(.el-table--small th) {
  padding: 8px 0;
  font-size: 12px;
  font-weight: 600;
}

:deep(.el-table--small td) {
  padding: 8px 0;
}
</style>
