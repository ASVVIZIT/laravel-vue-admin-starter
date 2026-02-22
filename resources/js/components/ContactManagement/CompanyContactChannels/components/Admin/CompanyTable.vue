<template>
  <div class="company-table-container">
    <el-table
        ref="tableRef"
        :data="props.data"
        v-loading="props.loading"
        :max-height="maxHeight"
        stripe
        border
        size="small"
        :header-cell-style="headerCellStyle"
        :cell-style="cellStyle"
        :element-loading-text="loadingText"
        element-loading-background="rgba(255, 255, 255, 0.9)"
        @row-dblclick="handleRowDblClick"
        class="company-table"
    >
      <el-table-column
          label="#"
          width="28"
          align="center"
          fixed="left"
          :resizable="false"
      >
        <template #default="{ $index }">
          <span class="cell-row-number">{{ rowIndex($index) }}</span>
        </template>
      </el-table-column>

      <el-table-column
          prop="id"
          label="ID"
          width="35"
          align="center"
          fixed="left"
          :resizable="false"
      >
        <template #default="{ row }">
          <span class="cell-id">{{ row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column
          prop="name"
          label="Название"
          min-width="120"
          :resizable="true"
      >
        <template #default="{ row }">
          <EditableCell
              v-model="row.name"
              type="text"
              placeholder="Название"
              :disabled="row._updating || props.loading"
              :loading="row._updating"
              empty-text="—"
              :show-edit-button="true"
              :show-action-buttons="true"
              @save="handleUpdateField(row.id, 'name', $event)"
              @error="handleEditError(row, 'name', $event)"
          />
        </template>
      </el-table-column>

      <el-table-column
          prop="settings.icon"
          label="Иконка"
          width="80"
          align="center"
          :resizable="true"
      >
        <template #default="{ row }">
          <EditableCell
              v-model="row.settings.icon"
              type="select"
              placeholder="Выберите"
              :disabled="row._updating || props.loading"
              :loading="row._updating"
              empty-text="—"
              :show-edit-button="true"
              :show-action-buttons="true"
              @save="handleUpdateField(row.id, 'settings.icon', $event)"
              @error="handleEditError(row, 'settings.icon', $event)"
          >
            <template #display="{ value }">
              <div class="icon-display-wrapper">
                <el-icon
                    v-if="value && props.iconMap[value]"
                    :size="16"
                    color="#409EFF"
                >
                  <component :is="props.iconMap[value]" />
                </el-icon>
                <span v-else class="icon-placeholder">—</span>
              </div>
            </template>
            <template #options>
              <el-option
                  v-for="icon in props.iconOptions"
                  :key="icon.value"
                  :label="icon.label"
                  :value="icon.value"
              >
                  <span class="icon-option">
                      <el-icon :size="14">
                          <component :is="props.iconMap[icon.value]" />
                      </el-icon>
                      <span>{{ icon.label }}</span>
                  </span>
              </el-option>
            </template>
          </EditableCell>
        </template>
      </el-table-column>

      <el-table-column
          prop="description"
          label="Описание"
          min-width="130"
          :resizable="true"
      >
        <template #default="{ row }">
          <EditableCell
              v-model="row.description"
              type="textarea"
              :rows="1"
              placeholder="Описание"
              :disabled="row._updating || props.loading"
              :loading="row._updating"
              empty-text="—"
              :show-edit-button="true"
              :show-action-buttons="true"
              :max-length="1000"
              @save="handleUpdateField(row.id, 'description', $event)"
              @error="handleEditError(row, 'description', $event)"
          />
        </template>
      </el-table-column>

      <el-table-column
          prop="address"
          label="Адрес"
          min-width="120"
          :resizable="true"
      >
        <template #default="{ row }">
          <EditableCell
              v-model="row.address"
              type="text"
              placeholder="Адрес"
              :disabled="row._updating || props.loading"
              :loading="row._updating"
              empty-text="—"
              :show-edit-button="true"
              :show-action-buttons="true"
              :max-length="500"
              @save="handleUpdateField(row.id, 'address', $event)"
              @error="handleEditError(row, 'address', $event)"
          />
        </template>
      </el-table-column>

      <el-table-column
          prop="contact_channels_count"
          label="Каналы"
          width="55"
          align="center"
          :resizable="false"
      >
        <template #default="{ row }">
          <el-tag
              :type="getChannelCountType(row.contact_channels_count)"
              size="small"
              effect="plain"
              class="channel-tag"
          >
            {{ row.contact_channels_count || 0 }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
          label="Действия"
          width="60"
          fixed="right"
          align="center"
          :resizable="false"
      >
        <template #default="{ row }">
          <div class="action-buttons">
            <el-tooltip content="Редактировать" placement="left-start">
              <el-button
                  size="small"
                  type="primary"
                  link
                  @click.stop="handleEdit(row)"
                  :disabled="props.loading || row._updating"
                  class="action-btn"
              >
                <el-icon><Edit /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="Удалить" placement="right-start">
              <el-button
                  size="small"
                  type="danger"
                  link
                  @click.stop="handleDelete(row)"
                  :disabled="props.loading || row._updating"
                  class="action-btn"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </el-tooltip>
          </div>
        </template>
      </el-table-column>

      <template #empty>
        <div class="table-empty">
          <el-icon :size="24" color="#909399"><Document /></el-icon>
          <p>Нет данных</p>
        </div>
      </template>
    </el-table>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Edit, Delete, Document } from '@element-plus/icons-vue';
import EditableCell from '../Common/EditableCell.vue';
import {
  COMPANY_TABLE_PROPS_CONFIG,
  COMPANY_TABLE_UI,
} from '../../utils/paginationOptions.js';

const props = defineProps(COMPANY_TABLE_PROPS_CONFIG);

const emit = defineEmits(['edit', 'delete', 'update-field', 'row-dblclick']);

const tableRef = ref(null);

const maxHeight = computed(() => {
  return props.tableHeight || COMPANY_TABLE_UI.TABLE_HEIGHT;
});

const loadingText = computed(() => {
  return props.loading ? 'Загрузка...' : '';
});

const headerCellStyle = computed(() => ({
  background: COMPANY_TABLE_UI.HEADER_BACKGROUND,
  color: COMPANY_TABLE_UI.HEADER_COLOR,
  fontWeight: COMPANY_TABLE_UI.HEADER_FONT_WEIGHT,
  fontSize: '8px',
  height: '20px',
  padding: '0 2px',
}));

const cellStyle = computed(() => ({
  padding: '1px 2px',
  fontSize: '8px',
  height: '22px',
}));

const rowIndex = ($index) => {
  return (props.currentPage - 1) * props.pageSize + $index + 1;
};

const handleUpdateField = (companyId, fieldName, newValue) => {
  emit('update-field', companyId, fieldName, newValue);
};

const handleEditError = (row, fieldName, error) => {
  console.warn('[CompanyTable] Edit error:', { companyId: row.id, fieldName, error });
};

const handleEdit = (row) => {
  emit('edit', row);
};

const handleDelete = (row) => {
  emit('delete', row);
};

const handleRowDblClick = (row) => {
  emit('row-dblclick', row);
  emit('edit', row);
};

const getChannelCountType = (count) => {
  if (!count || count === 0) return 'info';
  if (count <= 3) return 'success';
  if (count <= 10) return 'warning';
  return 'danger';
};
</script>

<style scoped>
.company-table-container {
  width: 100%;
  height: 100%;
  position: relative;
  background: #FFFFFF;
  border-radius: 2px;
  overflow: hidden !important;
}

.company-table :deep(.el-table__header-wrapper) {
  background: v-bind('COMPANY_TABLE_UI.HEADER_BACKGROUND') !important;
}

.company-table :deep(.el-table__header th) {
  background-color: v-bind('COMPANY_TABLE_UI.HEADER_BACKGROUND') !important;
  color: v-bind('COMPANY_TABLE_UI.HEADER_COLOR') !important;
  font-weight: v-bind('COMPANY_TABLE_UI.HEADER_FONT_WEIGHT') !important;
  font-size: 8px;
  height: 20px !important;
  padding: 0 2px !important;
}

.company-table :deep(.el-table__header th.is-fixed-left),
.company-table :deep(.el-table__header th.is-fixed-right) {
  z-index: 10 !important;
}

.company-table :deep(.el-table) {
  font-size: 8px;
}

.company-table :deep(.el-table .cell) {
  padding: 1px 2px;
  line-height: 1.2;
  white-space: nowrap;
  overflow: visible !important;
  text-overflow: clip;
}

.company-table :deep(.el-table__row) {
  height: 22px !important;
}

.company-table :deep(.el-table__row td) {
  padding: 1px 2px !important;
  height: 22px !important;
}

.company-table :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: #fafafa;
}

.company-table :deep(.el-table--enable-row-hover .el-table__body tr:hover > td) {
  background-color: v-bind('COMPANY_TABLE_UI.HOVER_COLOR');
}

.company-table :deep(.el-table__body-wrapper) {
  overflow: visible !important;
}

.cell-row-number {
  font-size: 7px;
  color: #909399;
}

.cell-id {
  font-weight: 600;
  color: #409EFF;
  font-size: 8px;
}

.icon-display-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 20px;
}

.icon-placeholder {
  font-size: 14px;
  color: #c0c4cc;
}

.icon-option {
  display: flex;
  align-items: center;
  gap: 4px;
}

.channel-tag {
  height: 14px;
  padding: 0 3px;
  font-size: 7px;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1px;
}

.action-btn {
  padding: 1px;
  font-size: 10px;
  min-width: auto;
  width: auto;
  height: auto;
}

.action-btn:hover {
  transform: scale(1.1);
}

.table-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px 10px;
  color: #909399;
}

.table-empty p {
  margin: 0;
  font-size: 11px;
  color: #909399;
}

.company-table :deep(.el-table__body-wrapper)::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.company-table :deep(.el-table__body-wrapper)::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.company-table :deep(.el-table__body-wrapper)::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

:deep(.el-select-dropdown__item) {
  font-size: var(--el-font-size-base);
  padding: 0 8px 0 8px;
  position: relative;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--el-text-color-regular);
  height: 22px;
  line-height: 20px;
  box-sizing: border-box;
  cursor: pointer;
}

:deep(.el-select-dropdown__item:hover) {
  background-color: #f5f7fa;
}

:deep(.el-select-dropdown__item.selected) {
  color: #409EFF;
  font-weight: 600;
  background-color: #f0f9eb;
}

:deep(.el-select-dropdown__item.disabled) {
  color: #c0c4cc;
  cursor: not-allowed;
}

:deep(.el-select-dropdown) {
  padding: 4px 0;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

:deep(.el-select-dropdown__empty) {
  font-size: var(--el-font-size-base);
  padding: 8px 10px;
  color: #909399;
  text-align: center;
}
</style>
