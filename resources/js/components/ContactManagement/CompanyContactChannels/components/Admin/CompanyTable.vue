<template>
  <div class="company-table-container">
    <el-table
        ref="tableRef"
        :data="props.data"
        v-loading="props.loading"
        :max-height="maxHeight"
        :stripe="COMPANY_TABLE_UI.TABLE_PROPS.stripe"
        :border="COMPANY_TABLE_UI.TABLE_PROPS.border"
        :size="COMPANY_TABLE_UI.TABLE_PROPS.size"
        :header-cell-style="headerCellStyle"
        :cell-style="cellStyle"
        :element-loading-text="loadingText"
        :element-loading-background="COMPANY_TABLE_UI.LOADING_BACKGROUND"
        @row-dblclick="handleRowDblClick"
        class="company-table"
    >
      <el-table-column
          label="#"
          :width="COMPANY_TABLE_UI.ROW_NUMBER_WIDTH"
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
          :label="getFieldLabel('id', 'company')"
          :width="COMPANY_TABLE_UI.ID_WIDTH"
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
          :label="getFieldLabel('name', 'company')"
          :min-width="COMPANY_TABLE_UI.NAME_MIN_WIDTH"
          :resizable="true"
      >
        <template #default="{ row }">
          <EditableCell
              v-model="row.name"
              type="text"
              :placeholder="COMPANY_TABLE_UI.NAME_PLACEHOLDER"
              :disabled="row._updating || row._refreshing || props.loading"
              :loading="row._updating"
              :empty-text="COMPANY_TABLE_UI.EMPTY_CELL_TEXT"
              :show-edit-button="true"
              :show-action-buttons="true"
              @save="handleUpdateField(row.id, 'name', $event)"
              @error="handleEditError(row, 'name', $event)"
          />
        </template>
      </el-table-column>

      <el-table-column
          prop="settings.icon"
          :label="getFieldLabel('settings.icon', 'company')"
          :width="COMPANY_TABLE_UI.ICON_WIDTH"
          align="center"
          :resizable="true"
      >
        <template #default="{ row }">
          <EditableCell
              v-model="row.settings.icon"
              type="select"
              :placeholder="COMPANY_TABLE_UI.ICON_PLACEHOLDER"
              :disabled="row._updating || row._refreshing || props.loading"
              :loading="row._updating"
              :empty-text="COMPANY_TABLE_UI.EMPTY_CELL_TEXT"
              :show-edit-button="true"
              :show-action-buttons="true"
              @save="handleUpdateField(row.id, 'settings.icon', $event)"
              @error="handleEditError(row, 'settings.icon', $event)"
          >
            <template #display="{ value }">
              <div class="icon-display-wrapper">
                <el-icon
                    v-if="value && props.iconMap[value]"
                    :size="COMPANY_TABLE_UI.ICON_DISPLAY_SIZE"
                    :color="COMPANY_TABLE_UI.ICON_DISPLAY_COLOR"
                >
                  <component :is="props.iconMap[value]" />
                </el-icon>
                <span v-else class="icon-placeholder">{{ COMPANY_TABLE_UI.EMPTY_CELL_TEXT }}</span>
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
                                    <el-icon :size="COMPANY_TABLE_UI.ICON_SELECT_SIZE">
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
          :label="getFieldLabel('description', 'company')"
          :min-width="COMPANY_TABLE_UI.DESCRIPTION_MIN_WIDTH"
          :resizable="true"
      >
        <template #default="{ row }">
          <EditableCell
              v-model="row.description"
              type="textarea"
              :rows="1"
              :placeholder="COMPANY_TABLE_UI.DESCRIPTION_PLACEHOLDER"
              :disabled="row._updating || row._refreshing || props.loading"
              :loading="row._updating"
              :empty-text="COMPANY_TABLE_UI.EMPTY_CELL_TEXT"
              :show-edit-button="true"
              :show-action-buttons="true"
              :max-length="COMPANY_TABLE_UI.DESCRIPTION_MAX_LENGTH"
              @save="handleUpdateField(row.id, 'description', $event)"
              @error="handleEditError(row, 'description', $event)"
          />
        </template>
      </el-table-column>

      <el-table-column
          prop="address"
          :label="getFieldLabel('address', 'company')"
          :min-width="COMPANY_TABLE_UI.ADDRESS_MIN_WIDTH"
          :resizable="true"
      >
        <template #default="{ row }">
          <EditableCell
              v-model="row.address"
              type="text"
              :placeholder="COMPANY_TABLE_UI.ADDRESS_PLACEHOLDER"
              :disabled="row._updating || row._refreshing || props.loading"
              :loading="row._updating"
              :empty-text="COMPANY_TABLE_UI.EMPTY_CELL_TEXT"
              :show-edit-button="true"
              :show-action-buttons="true"
              :max-length="COMPANY_TABLE_UI.ADDRESS_MAX_LENGTH"
              @save="handleUpdateField(row.id, 'address', $event)"
              @error="handleEditError(row, 'address', $event)"
          />
        </template>
      </el-table-column>

      <el-table-column
          prop="contact_channels_count"
          label="Каналы"
          :width="COMPANY_TABLE_UI.CHANNEL_WIDTH"
          align="center"
          :resizable="false"
      >
        <template #default="{ row }">
          <el-tag
              :type="getChannelCountType(row.contact_channels_count)"
              :effect="COMPANY_TABLE_UI.TAG_PROPS.effect"
              :size="COMPANY_TABLE_UI.TAG_PROPS.size"
              class="channel-tag"
          >
            {{ row.contact_channels_count || 0 }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
          label="Действия"
          :width="COMPANY_TABLE_UI.ACTION_WIDTH"
          fixed="right"
          align="center"
          :resizable="false"
      >
        <template #default="{ row }">
          <div class="action-buttons">
            <el-tooltip
                :content="row._refreshing ? LOADING_DATA_ACTIONS_MESSAGES.TOOLTIP_REFRESH_RECORD_LOADING : LOADING_DATA_ACTIONS_MESSAGES.TOOLTIP_REFRESH_RECORD"
                placement="top"
            >
              <el-button
                  size="small"
                  :type="row._refreshing ? 'warning' : 'info'"
                  :icon="row._refreshing ? Loading : Refresh"
                  circle
                  :loading="row._refreshing"
                  :disabled="props.loading || row._updating || row._refreshing"
                  @click.stop="handleRefreshRecord(row.id)"
                  class="action-btn action-btn-refresh"
              />
            </el-tooltip>

            <el-tooltip content="Редактировать" placement="top">
              <el-button
                  size="small"
                  type="primary"
                  :icon="Edit"
                  circle
                  :disabled="props.loading || row._updating || row._refreshing"
                  @click.stop="handleEdit(row)"
                  class="action-btn action-btn-edit"
              />
            </el-tooltip>

            <el-tooltip content="Удалить" placement="top">
              <el-button
                  size="small"
                  type="danger"
                  :icon="Delete"
                  circle
                  :disabled="props.loading || row._updating || row._refreshing"
                  @click.stop="handleDelete(row)"
                  class="action-btn action-btn-delete"
              />
            </el-tooltip>
          </div>
        </template>
      </el-table-column>

      <template #empty>
        <div class="table-empty">
          <el-icon :size="COMPANY_TABLE_UI.EMPTY_ICON_SIZE" :color="COMPANY_TABLE_UI.EMPTY_ICON_COLOR">
            <Document />
          </el-icon>
          <p>{{ COMPANY_LIST_MESSAGES.EMPTY_NO_DATA }}</p>
        </div>
      </template>
    </el-table>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Edit, Delete, Document, Refresh, Loading } from '@element-plus/icons-vue';
import EditableCell from '../Common/EditableCell.vue';
import { getFieldLabel } from '../../utils/fieldLabels.js';
import {
  COMPANY_TABLE_PROPS_CONFIG,
  COMPANY_TABLE_UI,
  COMPANY_LIST_MESSAGES,
  LOADING_DATA_ACTIONS_MESSAGES,
} from '../../utils/appConfig.js';

const props = defineProps(COMPANY_TABLE_PROPS_CONFIG);

const emit = defineEmits(['edit', 'delete', 'update-field', 'row-dblclick', 'refresh']);

const tableRef = ref(null);

const maxHeight = computed(() => {
  return props.tableHeight || COMPANY_TABLE_UI.TABLE_HEIGHT;
});

const loadingText = computed(() => {
  return props.loading ? COMPANY_LIST_MESSAGES.LOADING_INITIAL : '';
});

const headerCellStyle = computed(() => ({
  background: COMPANY_TABLE_UI.HEADER_BACKGROUND,
  color: COMPANY_TABLE_UI.HEADER_COLOR,
  fontWeight: COMPANY_TABLE_UI.HEADER_FONT_WEIGHT,
  fontSize: COMPANY_TABLE_UI.HEADER_FONT_SIZE,
  height: COMPANY_TABLE_UI.HEADER_HEIGHT,
  padding: COMPANY_TABLE_UI.HEADER_PADDING,
}));

const cellStyle = computed(() => ({
  padding: COMPANY_TABLE_UI.CELL_PADDING,
  fontSize: COMPANY_TABLE_UI.CELL_FONT_SIZE,
  height: COMPANY_TABLE_UI.CELL_HEIGHT,
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

const handleRefreshRecord = (id) => {
  emit('refresh', id);
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
  if (!count || count === 0) return COMPANY_TABLE_UI.CHANNEL_TAG_TYPES.EMPTY;
  if (count <= COMPANY_TABLE_UI.CHANNEL_THRESHOLDS.LOW) return COMPANY_TABLE_UI.CHANNEL_TAG_TYPES.LOW;
  if (count <= COMPANY_TABLE_UI.CHANNEL_THRESHOLDS.MEDIUM) return COMPANY_TABLE_UI.CHANNEL_TAG_TYPES.MEDIUM;
  return COMPANY_TABLE_UI.CHANNEL_TAG_TYPES.HIGH;
};
</script>

<style>
/* ============================================================================
   GLOBAL STYLES — для dropdown (рендерится в body, вне scope компонента)
   ============================================================================ */

.el-select-dropdown__item {
  font-size: var(--el-font-size-base) !important;
  padding: 0 12px 0 12px !important;
  position: relative;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--el-text-color-regular);
  height: 22px !important;
  line-height: 22px !important;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.el-select-dropdown__item .icon-option {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
  height: 22px;
  line-height: 22px;
}

.el-select-dropdown__item .icon-option .el-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 22px;
  line-height: 22px;
}

.el-select-dropdown__item .icon-option span {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  height: 22px;
  line-height: 22px;
}

.el-select-dropdown__item:hover {
  background-color: #f5f7fa !important;
}

.el-select-dropdown__item.selected {
  color: #409EFF !important;
  font-weight: 600;
  background-color: #f0f9eb !important;
}

.el-select-dropdown__item.disabled {
  color: #c0c4cc !important;
  cursor: not-allowed;
}

.el-select-dropdown {
  padding: 4px 0 !important;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.el-select-dropdown__empty {
  font-size: var(--el-font-size-base);
  padding: 8px 10px;
  color: #909399;
  text-align: center;
}
</style>

<style scoped>
.company-table-container {
  width: 100%;
  height: 100%;
  position: relative;
  background: #FFFFFF;
  border-radius: 2px;
  overflow: v-bind('COMPANY_TABLE_UI.CONTAINER_OVERFLOW');
}

.company-table :deep(.el-table__header-wrapper) {
  background: v-bind('COMPANY_TABLE_UI.HEADER_BACKGROUND') !important;
}

.company-table :deep(.el-table__header th) {
  background-color: v-bind('COMPANY_TABLE_UI.HEADER_BACKGROUND') !important;
  color: v-bind('COMPANY_TABLE_UI.HEADER_COLOR') !important;
  font-weight: v-bind('COMPANY_TABLE_UI.HEADER_FONT_WEIGHT') !important;
  font-size: v-bind('COMPANY_TABLE_UI.HEADER_FONT_SIZE');
  height: v-bind('COMPANY_TABLE_UI.HEADER_HEIGHT') !important;
  padding: v-bind('COMPANY_TABLE_UI.HEADER_PADDING') !important;
}

.company-table :deep(.el-table__header th.is-fixed-left),
.company-table :deep(.el-table__header th.is-fixed-right) {
  z-index: v-bind('COMPANY_TABLE_UI.FIXED_COLUMN_Z_INDEX') !important;
}

.company-table :deep(.el-table) {
  font-size: v-bind('COMPANY_TABLE_UI.CELL_FONT_SIZE');
}

.company-table :deep(.el-table .cell) {
  padding: v-bind('COMPANY_TABLE_UI.CELL_PADDING');
  line-height: v-bind('COMPANY_TABLE_UI.CELL_LINE_HEIGHT');
  white-space: nowrap;
  overflow: v-bind('COMPANY_TABLE_UI.CELL_OVERFLOW');
  text-overflow: clip;
}

.company-table :deep(.el-table__row) {
  height: v-bind('COMPANY_TABLE_UI.ROW_HEIGHT') !important;
}

.company-table :deep(.el-table__row td) {
  padding: v-bind('COMPANY_TABLE_UI.CELL_PADDING') !important;
  height: v-bind('COMPANY_TABLE_UI.CELL_HEIGHT') !important;
}

.company-table :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: v-bind('COMPANY_TABLE_UI.STRIPED_ROW_BACKGROUND');
}

.company-table :deep(.el-table--enable-row-hover .el-table__body tr:hover > td) {
  background-color: v-bind('COMPANY_TABLE_UI.HOVER_COLOR');
}

.company-table :deep(.el-table__body-wrapper) {
  overflow: v-bind('COMPANY_TABLE_UI.CELL_OVERFLOW');
}

.cell-row-number {
  font-size: v-bind('COMPANY_TABLE_UI.ROW_NUMBER_FONT_SIZE');
  color: v-bind('COMPANY_TABLE_UI.ROW_NUMBER_COLOR');
}

.cell-id {
  font-weight: v-bind('COMPANY_TABLE_UI.ID_FONT_WEIGHT');
  color: v-bind('COMPANY_TABLE_UI.ID_COLOR');
  font-size: v-bind('COMPANY_TABLE_UI.ID_FONT_SIZE');
}

.icon-display-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: v-bind('COMPANY_TABLE_UI.ICON_DISPLAY_MIN_HEIGHT');
}

.icon-placeholder {
  font-size: v-bind('COMPANY_TABLE_UI.ICON_PLACEHOLDER_FONT_SIZE');
  color: v-bind('COMPANY_TABLE_UI.ICON_PLACEHOLDER_COLOR');
}

.icon-option {
  display: flex;
  align-items: center;
  gap: v-bind('COMPANY_TABLE_UI.ICON_OPTION_GAP');
}

.channel-tag {
  height: v-bind('COMPANY_TABLE_UI.CHANNEL_TAG_HEIGHT');
  padding: v-bind('COMPANY_TABLE_UI.CHANNEL_TAG_PADDING');
  font-size: v-bind('COMPANY_TABLE_UI.CHANNEL_TAG_FONT_SIZE');
  font-weight: v-bind('COMPANY_TABLE_UI.CHANNEL_TAG_FONT_WEIGHT');
}

.action-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.action-buttons .el-button + .el-button {
  margin-left: 0px !important;
}

.action-btn {
  padding: 0;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent !important;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-btn-refresh {
  color: #FF9500 !important;
}

.action-btn-refresh:hover:not(:disabled) {
  color: #FFB140 !important;
  transform: scale(1.15);
}

.action-btn-refresh :deep(.el-icon.is-loading) {
  color: #FF4444 !important;
  animation: rotating 1s linear infinite;
}

@keyframes rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.action-btn-edit {
  color: #409EFF !important;
}

.action-btn-edit:hover:not(:disabled) {
  color: #66b1ff !important;
  transform: scale(1.15);
}

.action-btn-delete {
  color: #F56C6C !important;
}

.action-btn-delete:hover:not(:disabled) {
  color: #f78989 !important;
  transform: scale(1.15);
}

.action-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  transform: none !important;
  color: #c0c4cc !important;
}

.table-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: v-bind('COMPANY_TABLE_UI.EMPTY_GAP');
  padding: v-bind('COMPANY_TABLE_UI.EMPTY_PADDING');
  color: v-bind('COMPANY_TABLE_UI.EMPTY_TEXT_COLOR');
}

.table-empty p {
  margin: 0;
  font-size: v-bind('COMPANY_TABLE_UI.EMPTY_TEXT_SIZE');
  color: v-bind('COMPANY_TABLE_UI.EMPTY_TEXT_COLOR');
}

.company-table :deep(.el-table__body-wrapper)::-webkit-scrollbar {
  width: v-bind('COMPANY_TABLE_UI.SCROLLBAR_WIDTH');
  height: v-bind('COMPANY_TABLE_UI.SCROLLBAR_WIDTH');
}

.company-table :deep(.el-table__body-wrapper)::-webkit-scrollbar-track {
  background: v-bind('COMPANY_TABLE_UI.SCROLLBAR_TRACK_COLOR');
  border-radius: v-bind('COMPANY_TABLE_UI.SCROLLBAR_BORDER_RADIUS');
}

.company-table :deep(.el-table__body-wrapper)::-webkit-scrollbar-thumb {
  background: v-bind('COMPANY_TABLE_UI.SCROLLBAR_THUMB_COLOR');
  border-radius: v-bind('COMPANY_TABLE_UI.SCROLLBAR_BORDER_RADIUS');
}
</style>
