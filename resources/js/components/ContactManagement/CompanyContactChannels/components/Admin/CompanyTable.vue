<template>
  <div class="company-table-container">
    <el-table
        ref="tableRef"
        :data="data"
        v-loading="loading"
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
              :disabled="row._updating || loading"
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
          width="70"
          align="center"
          :resizable="false"
      >
        <template #default="{ row, column, $index }">
          <div class="icon-cell">
            <div
                v-if="!row._editingIcon"
                class="icon-display"
                @dblclick.stop="startIconEdit(row, $event)"
            >
              <el-icon
                  v-if="row.settings?.icon && iconMap[row.settings.icon]"
                  :size="14"
                  color="#409EFF"
              >
                <component :is="iconMap[row.settings.icon]" />
              </el-icon>
              <span v-else class="icon-placeholder">—</span>
              <el-button
                  v-if="!row._updating && !loading"
                  link
                  size="small"
                  class="icon-edit-btn"
                  @click.stop="startIconEdit(row, $event)"
              >
                <el-icon><Edit /></el-icon>
              </el-button>
            </div>
          </div>
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
              :disabled="row._updating || loading"
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
              :disabled="row._updating || loading"
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
            <el-tooltip content="Редактировать" placement="top">
              <el-button
                  size="small"
                  type="primary"
                  link
                  @click.stop="handleEdit(row)"
                  :disabled="loading || row._updating"
                  class="action-btn"
              >
                <el-icon><Edit /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="Удалить" placement="top">
              <el-button
                  size="small"
                  type="danger"
                  link
                  @click.stop="handleDelete(row)"
                  :disabled="loading || row._updating"
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

    <!-- ★★★ TELEPORT: РЕЖИМ РЕДАКТИРОВАНИЯ ВНЕ ТАБЛИЦЫ ★★★ -->
    <Teleport to="body">
      <div
          v-if="editingIconRow"
          class="icon-edit-overlay"
          :style="editOverlayStyle"
      >
        <el-select
            v-model="tempIconValue"
            size="small"
            :disabled="editingIconRow._updating || loading"
            :loading="editingIconRow._updating"
            placeholder="Выберите"
            clearable
            filterable
            :teleported="true"
            popper-class="icon-select-popper"
            @keyup.escape="cancelIconEdit"
            class="icon-select-edit"
            style="width: 200px;"
            ref="editSelectRef"
        >
          <el-option
              v-for="icon in iconOptions"
              :key="icon.value"
              :label="icon.label"
              :value="icon.value"
          >
                        <span class="icon-option">
                            <el-icon :size="14">
                                <component :is="iconMap[icon.value]" />
                            </el-icon>
                            <span>{{ icon.label }}</span>
                        </span>
          </el-option>
        </el-select>
        <el-button-group class="edit-actions">
          <el-button
              size="small"
              type="success"
              @click="saveIconEdit"
              :disabled="editingIconRow._updating || loading"
          >
            <el-icon><Check /></el-icon>
          </el-button>
          <el-button
              size="small"
              type="info"
              @click="cancelIconEdit"
              :disabled="editingIconRow._updating || loading"
          >
            <el-icon><Close /></el-icon>
          </el-button>
        </el-button-group>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';
import { Edit, Delete, Document, Check, Close } from '@element-plus/icons-vue';
import EditableCell from '../Common/EditableCell.vue';
import {
  COMPANY_TABLE_PROPS_CONFIG,
  COMPANY_TABLE_UI,
} from '../../utils/paginationOptions.js';

const props = defineProps({
  data: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  iconMap: { type: Object, required: true },
  iconOptions: { type: Array, required: true },
  currentPage: { type: Number, default: 1 },
  pageSize: { type: Number, default: 15 },
  tableHeight: { type: String, default: '400' },
});

const emit = defineEmits(['edit', 'delete', 'update-field', 'row-dblclick']);

const tableRef = ref(null);
const tempIconValue = ref('');
const editingIconRow = ref(null);
const editOverlayStyle = ref({});
const editSelectRef = ref(null);

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

const startIconEdit = (row, event) => {
  if (row._updating || props.loading) return;

  editingIconRow.value = row;
  tempIconValue.value = row.settings?.icon || '';

  nextTick(() => {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();

    editOverlayStyle.value = {
      position: 'fixed',
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width + 200}px`,
      height: `${rect.height}px`,
      zIndex: '9999',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      background: '#FFFFFF',
      padding: '2px',
      borderRadius: '4px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    };

    if (editSelectRef.value) {
      editSelectRef.value.focus();
    }
  });
};

const saveIconEdit = () => {
  if (!editingIconRow.value || editingIconRow.value._updating || props.loading) return;
  handleUpdateField(editingIconRow.value.id, 'settings.icon', tempIconValue.value);
  editingIconRow.value._editingIcon = false;
  editingIconRow.value = null;
  tempIconValue.value = '';
};

const cancelIconEdit = () => {
  if (!editingIconRow.value || editingIconRow.value._updating || props.loading) return;
  editingIconRow.value._editingIcon = false;
  editingIconRow.value = null;
  tempIconValue.value = '';
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
  overflow: hidden;
  text-overflow: ellipsis;
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

.cell-row-number {
  font-size: 7px;
  color: #909399;
}

.cell-id {
  font-weight: 600;
  color: #409EFF;
  font-size: 8px;
}

.icon-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-height: 20px;
  width: 100%;
}

.icon-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  cursor: pointer;
  padding: 1px 2px;
  border-radius: 2px;
  transition: background-color 0.2s;
  width: 100%;
}

.icon-display:hover {
  background-color: v-bind('COMPANY_TABLE_UI.HOVER_COLOR');
}

.icon-display .el-icon {
  flex-shrink: 0;
}

.icon-placeholder {
  font-size: 12px;
  color: #c0c4cc;
}

.icon-edit-btn {
  padding: 0;
  font-size: 10px;
  opacity: 0;
  transition: opacity 0.2s;
  color: #409EFF;
  min-width: auto;
  width: auto;
  height: auto;
}

.icon-display:hover .icon-edit-btn {
  opacity: 1;
}

.icon-select-edit :deep(.el-select__wrapper) {
  height: 18px;
  font-size: 8px;
  padding: 0 2px;
  box-shadow: none;
}

.icon-option {
  display: flex;
  align-items: center;
  gap: 4px;
}

.edit-actions {
  flex-shrink: 0;
  font-size: 8px;
  line-height: 1;
}

.edit-actions .el-button {
  padding: 1px 2px;
  margin: 0;
  border-radius: 0;
}

.edit-actions .el-button:first-child {
  border-radius: 2px 0 0 2px;
}

.edit-actions .el-button:last-child {
  border-radius: 0 2px 2px 0;
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

:deep(.icon-select-popper) {
  width: 200px !important;
  min-width: 200px !important;
  max-width: 300px !important;
  z-index: 10000 !important;
}

:deep(.icon-select-popper .el-select-dropdown__item) {
  height: 30px;
  line-height: 28px;
}

:deep(.icon-select-popper .icon-option) {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* ★★★ TELEPORT OVERLAY: ВНЕ ТАБЛИЦЫ, ПОВЕРХ ВСЕГО ★★★ */
:deep(.icon-edit-overlay) {
  background: #FFFFFF;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
}
</style>
