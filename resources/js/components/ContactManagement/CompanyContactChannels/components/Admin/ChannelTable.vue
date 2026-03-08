<template>
  <div class="channel-table-container">
    <el-table
        ref="tableRef"
        :data="props.data"
        v-loading="props.loading"
        :stripe="CHANNEL_TABLE_UI.TABLE_PROPS.stripe"
        :border="CHANNEL_TABLE_UI.TABLE_PROPS.border"
        :size="CHANNEL_TABLE_UI.TABLE_PROPS.size"
        :header-cell-style="headerCellStyle"
        :cell-style="cellStyle"
        :element-loading-background="CHANNEL_TABLE_UI.LOADING_BACKGROUND"
        :max-height="tableMaxHeight"
        row-key="id"
        class="channel-table"
    >
      <!-- ✅ DRAG HANDLE (для сортировки) -->
      <el-table-column
          v-if="props.allowReorder"
          label=""
          :width="30"
          align="center"
          :resizable="false"
          fixed="left"
      >
        <template #default>
          <el-icon :size="14" :color="COLORS.INFO" class="drag-handle">
            <Rank />
          </el-icon>
        </template>
      </el-table-column>

      <!-- ✅ ROW NUMBER (ПОРЯДКОВЫЙ НОМЕР) -->
      <el-table-column
          label="#"
          :width="40"
          align="center"
          :resizable="false"
          fixed="left"
      >
        <template #default="{ $index }">
          <span class="row-number">{{ $index + 1 }}</span>
        </template>
      </el-table-column>

      <!-- ✅ ID (БАЗА ДАННЫХ) -->
      <el-table-column
          prop="id"
          label="ID"
          :width="50"
          align="center"
          :resizable="false"
          fixed="left"
      >
        <template #default="{ row }">
          <span class="channel-id">{{ row.id }}</span>
        </template>
      </el-table-column>

      <!-- ✅ КОМПАНИЯ -->
      <el-table-column
          prop="company.name"
          label="Компания"
          min-width="130"
          :resizable="true"
      >
        <template #default="{ row }">
          <span class="company-name" v-if="row.company">
            {{ row.company.name }}
          </span>
          <span class="company-name-empty" v-else>
            {{ CHANNEL_TABLE_UI.EMPTY_CELL_TEXT }}
          </span>
        </template>
      </el-table-column>

      <!-- ✅ TYPE -->
      <el-table-column
          prop="type"
          label="Тип"
          :width="80"
          align="center"
          :resizable="false"
      >
        <template #default="{ row }">
          <el-tag
              :type="getChannelTypeTagType(row.type)"
              :effect="CHANNEL_TABLE_UI.TAG_PROPS.effect"
              :size="CHANNEL_TABLE_UI.TAG_PROPS.size"
              class="channel-type-tag"
          >
            {{ getChannelTypeLabel(row.type) }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- ✅ TITLE -->
      <el-table-column
          prop="title"
          label="Название"
          min-width="150"
          :resizable="true"
      >
        <template #default="{ row }">
          <EditableCell
              v-model="row.title"
              type="text"
              placeholder="Введите название"
              :disabled="row._updating || props.disabled"
              :loading="row._updating"
              :empty-text="CHANNEL_TABLE_UI.EMPTY_CELL_TEXT"
              :show-edit-button="props.showEditButton"
              :show-action-buttons="true"
              :max-length="CHANNEL_TABLE_UI.TITLE_MAX_LENGTH"
              @save="handleUpdateField(row.id, 'title', $event)"
              @error="handleEditError(row, 'title', $event)"
          />
        </template>
      </el-table-column>

      <!-- ✅ IDENTIFIER -->
      <el-table-column
          prop="identifier"
          label="Контакт"
          min-width="130"
          :resizable="true"
      >
        <template #default="{ row }">
          <EditableCell
              v-model="row.identifier"
              type="text"
              placeholder="Email, телефон, username"
              :disabled="row._updating || props.disabled"
              :loading="row._updating"
              :empty-text="CHANNEL_TABLE_UI.EMPTY_CELL_TEXT"
              :show-edit-button="props.showEditButton"
              :show-action-buttons="true"
              :max-length="CHANNEL_TABLE_UI.IDENTIFIER_MAX_LENGTH"
              @save="handleUpdateField(row.id, 'identifier', $event)"
              @error="handleEditError(row, 'identifier', $event)"
          />
        </template>
      </el-table-column>

      <!-- ✅ URL -->
      <el-table-column
          prop="url"
          label="Ссылка"
          min-width="150"
          :resizable="true"
      >
        <template #default="{ row }">
          <EditableCell
              v-model="row.url"
              type="text"
              placeholder="https://..."
              :disabled="row._updating || props.disabled"
              :loading="row._updating"
              :empty-text="CHANNEL_TABLE_UI.EMPTY_CELL_TEXT"
              :show-edit-button="props.showEditButton"
              :show-action-buttons="true"
              :max-length="CHANNEL_TABLE_UI.URL_MAX_LENGTH"
              @save="handleUpdateField(row.id, 'url', $event)"
              @error="handleEditError(row, 'url', $event)"
          />
        </template>
      </el-table-column>

      <!-- ✅ ORDER -->
      <el-table-column
          prop="order_column"
          label="Порядок"
          :width="60"
          align="center"
          :resizable="false"
      >
        <template #default="{ row }">
          <span class="order-column">{{ row.order_column || 0 }}</span>
        </template>
      </el-table-column>

      <!-- ✅ ACTIVE (ПЕРЕМЕЩЕНО ВПРАВО!) -->
      <el-table-column
          prop="is_active"
          label="Активен"
          :width="70"
          align="center"
          :resizable="false"
          fixed="right"
      >
        <template #default="{ row }">
          <el-switch
              v-model="row.is_active"
              :disabled="row._updating || row._refreshing || props.disabled"
              :active-value="true"
              :inactive-value="false"
              @change="handleToggleActive(row)"
              class="active-switch"
          />
        </template>
      </el-table-column>

      <!-- ✅ ACTIONS (КНОПКИ ДЕЙСТВИЙ — КАК В COMPANIES!) -->
      <el-table-column
          label="Действия"
          :width="100"
          fixed="right"
          align="center"
          :resizable="false"
      >
        <template #default="{ row }">
          <div class="action-buttons">
            <!-- ✅ КНОПКА ОБНОВИТЬ (REFRESH) — WARNING COLOR LIKE COMPANIES! -->
            <el-tooltip
                :content="row._refreshing ? CHANNEL_TABLE_MESSAGES.TOOLTIP_REFRESH_LOADING : CHANNEL_TABLE_MESSAGES.TOOLTIP_REFRESH"
                placement="top"
                :show-after="TIMINGS.TOOLTIP_DELAY"
                :hide-after="TIMINGS.TOOLTIP_HIDE_DELAY"
            >
              <el-button
                  size="small"
                  type="info"
                  :icon="row._refreshing ? Loading : Refresh"
                  circle
                  :loading="row._refreshing"
                  :disabled="row._updating || row._refreshing || props.disabled"
                  @click.stop="handleRefresh(row)"
                  class="action-btn action-btn-refresh"
              />
            </el-tooltip>

            <!-- ✅ КНОПКА РЕДАКТИРОВАТЬ -->
            <el-tooltip
                :content="CHANNEL_TABLE_MESSAGES.TOOLTIP_EDIT"
                placement="top"
                :show-after="TIMINGS.TOOLTIP_DELAY"
                :hide-after="TIMINGS.TOOLTIP_HIDE_DELAY"
            >
              <el-button
                  v-if="props.showEditButton"
                  size="small"
                  type="primary"
                  :icon="Edit"
                  circle
                  :disabled="row._updating || row._refreshing || props.disabled"
                  @click.stop="handleEdit(row)"
                  class="action-btn action-btn-edit"
              />
            </el-tooltip>

            <!-- ✅ КНОПКА УДАЛИТЬ -->
            <el-tooltip
                :content="CHANNEL_TABLE_MESSAGES.TOOLTIP_DELETE"
                placement="top"
                :show-after="TIMINGS.TOOLTIP_DELAY"
                :hide-after="TIMINGS.TOOLTIP_HIDE_DELAY"
            >
              <el-button
                  v-if="props.showDeleteButton"
                  size="small"
                  type="danger"
                  :icon="Delete"
                  circle
                  :disabled="row._updating || row._refreshing || props.disabled"
                  @click.stop="handleDelete(row)"
                  class="action-btn action-btn-delete"
              />
            </el-tooltip>
          </div>
        </template>
      </el-table-column>

      <!-- ✅ EMPTY STATE -->
      <template #empty>
        <div class="table-empty">
          <el-icon :size="CHANNEL_TABLE_UI.EMPTY_ICON_SIZE" :color="CHANNEL_TABLE_UI.EMPTY_ICON_COLOR">
            <Document />
          </el-icon>
          <p class="empty-text">{{ CHANNEL_TABLE_MESSAGES.EMPTY_NO_DATA }}</p>
        </div>
      </template>
    </el-table>
  </div>
</template>

<script setup>
/**
 * ============================================================================
 * CHANNEL TABLE — ТАБЛИЦА КАНАЛОВ СВЯЗИ
 * ============================================================================
 * 📁 Путь: components/Admin/ChannelTable.vue
 * ✅ Используется: ChannelList.vue
 * ✅ Безопасно менять — влияет только на таблицу каналов
 * ============================================================================
 */

import { computed } from 'vue';
import { Edit, Delete, Document, Rank, Refresh, Loading } from '@element-plus/icons-vue';
import EditableCell from '../Common/EditableCell.vue';
import {
  CHANNEL_TABLE_PROPS_CONFIG,
  CHANNEL_TABLE_UI,
  CHANNEL_TABLE_MESSAGES,
  CHANNEL_TYPE_LABELS,
  CHANNEL_TABLE_COLUMNS,
  BREAKPOINTS,
  ANIMATIONS,
  TIMINGS,
  COLORS,
} from '@/components/ContactManagement/CompanyContactChannels/config/appConfigIndex.js';

// ============================================================================
// PROPS
// ============================================================================
const props = defineProps({
  ...CHANNEL_TABLE_PROPS_CONFIG,
});

// ============================================================================
// EMITS
// ============================================================================
const emit = defineEmits(['edit', 'delete', 'update-field', 'reorder', 'refresh']);

// ============================================================================
// COMPUTED — TABLE MAX HEIGHT
// ============================================================================
const tableMaxHeight = computed(() => {
  return CHANNEL_TABLE_UI.TABLE_HEIGHT;
});

// ============================================================================
// COMPUTED STYLES
// ============================================================================
const headerCellStyle = computed(() => ({
  background: CHANNEL_TABLE_UI.HEADER_BACKGROUND,
  color: CHANNEL_TABLE_UI.HEADER_COLOR,
  fontWeight: CHANNEL_TABLE_UI.HEADER_FONT_WEIGHT,
  fontSize: CHANNEL_TABLE_UI.HEADER_FONT_SIZE,
  height: CHANNEL_TABLE_UI.HEADER_HEIGHT,
  padding: CHANNEL_TABLE_UI.HEADER_PADDING,
}));

const cellStyle = computed(() => ({
  padding: CHANNEL_TABLE_UI.CELL_PADDING,
  fontSize: CHANNEL_TABLE_UI.CELL_FONT_SIZE,
  height: CHANNEL_TABLE_UI.CELL_HEIGHT,
}));

// ============================================================================
// HELPER — CHANNEL TYPE LABEL
// ============================================================================
function getChannelTypeLabel(type) {
  return CHANNEL_TYPE_LABELS[type] || type;
}

// ============================================================================
// HELPER — CHANNEL TYPE TAG TYPE
// ============================================================================
function getChannelTypeTagType(type) {
  const typeMap = {
    social_network: 'primary',
    messenger: 'success',
    messenger_group: 'success',
    gis_map: 'warning',
    yandex_map: 'warning',
    email: 'info',
    phone_number: 'info',
    website: '',
  };
  return typeMap[type] || '';
}

// ============================================================================
// HANDLE EDIT
// ============================================================================
function handleEdit(row) {
  console.log('🔵 [ChannelTable] handleEdit:', row.id);
  emit('edit', row);
}

// ============================================================================
// HANDLE DELETE
// ============================================================================
function handleDelete(row) {
  console.log('🔵 [ChannelTable] handleDelete:', row.id);
  emit('delete', row);
}

// ============================================================================
// HANDLE REFRESH — ОБНОВЛЕНИЕ ЗАПИСИ (КАК В COMPANIES!)
// ============================================================================
function handleRefresh(row) {
  console.log('🔵 [ChannelTable] handleRefresh: START', {
    id: row.id,
    _refreshing: row._refreshing
  });
  emit('refresh', row);
}

// ============================================================================
// HANDLE UPDATE FIELD
// ============================================================================
function handleUpdateField(channelId, fieldName, newValue) {
  console.log('🔵 [ChannelTable] handleUpdateField:', { channelId, fieldName, newValue });
  emit('update-field', channelId, fieldName, newValue);
}

// ============================================================================
// HANDLE EDIT ERROR
// ============================================================================
function handleEditError(row, fieldName, error) {
  console.warn('[ChannelTable] Edit error:', { channelId: row.id, fieldName, error });
}

// ============================================================================
// HANDLE TOGGLE ACTIVE
// ============================================================================
function handleToggleActive(row) {
  console.log('🔵 [ChannelTable] handleToggleActive:', { id: row.id, is_active: row.is_active });
  emit('update-field', row.id, 'is_active', row.is_active);
}
</script>

<style scoped>
/**
 * ============================================================================
 * STYLES
 * ============================================================================
 */
.channel-table-container {
  width: 100%;
  height: 100%;
  position: relative;
  background: #FFFFFF;
  border-radius: 2px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ============================================================================
   LOADING
   ============================================================================ */
.channel-table :deep(.el-loading-mask) {
  background-color: v-bind('CHANNEL_TABLE_UI.LOADING_BACKGROUND') !important;
}

.channel-table :deep(.el-loading-spinner .path) {
  stroke: v-bind('COLORS.PRIMARY') !important;
}

/* ============================================================================
   TABLE — ВЫСОТА И ПРОКРУТКА
   ============================================================================ */
.channel-table {
  width: 100%;
  height: v-bind('CHANNEL_TABLE_UI.TABLE_HEIGHT');
}

.channel-table :deep(.el-table) {
  font-size: v-bind('CHANNEL_TABLE_UI.CELL_FONT_SIZE');
  height: 100%;
}

.channel-table :deep(.el-table__body-wrapper) {
  overflow: auto !important;
}

.channel-table :deep(.el-table__row) {
  height: v-bind('CHANNEL_TABLE_UI.ROW_HEIGHT') !important;
}

.channel-table :deep(.el-table__row td) {
  padding: v-bind('CHANNEL_TABLE_UI.CELL_PADDING') !important;
  height: v-bind('CHANNEL_TABLE_UI.CELL_HEIGHT') !important;
}

.channel-table :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: v-bind('CHANNEL_TABLE_UI.STRIPED_ROW_BACKGROUND');
}

.channel-table :deep(.el-table--enable-row-hover .el-table__body tr:hover > td) {
  background-color: v-bind('CHANNEL_TABLE_UI.HOVER_COLOR');
  transition: background-color v-bind('ANIMATIONS.TRANSITION_NORMAL') v-bind('ANIMATIONS.EASING_EASE');
}

/* ============================================================================
   DRAG HANDLE
   ============================================================================ */
.drag-handle {
  cursor: move;
  opacity: 0.5;
  transition: opacity v-bind('ANIMATIONS.TRANSITION_FAST') v-bind('ANIMATIONS.EASING_EASE');
}

.drag-handle:hover {
  opacity: 1;
}

/* ============================================================================
   ROW NUMBER
   ============================================================================ */
.row-number {
  font-size: v-bind('CHANNEL_TABLE_UI.CELL_FONT_SIZE');
  color: #909399;
  font-weight: 500;
}

/* ============================================================================
   CHANNEL ID
   ============================================================================ */
.channel-id {
  font-size: v-bind('CHANNEL_TABLE_UI.CELL_FONT_SIZE');
  color: v-bind('COLORS.PRIMARY');
  font-weight: 600;
}

/* ============================================================================
   CHANNEL TYPE TAG
   ============================================================================ */
.channel-type-tag {
  height: 18px;
  padding: 0 6px;
  font-size: 10px;
  font-weight: 500;
  border-radius: 3px;
}

/* ============================================================================
   COMPANY NAME
   ============================================================================ */
.company-name {
  font-size: v-bind('CHANNEL_TABLE_UI.CELL_FONT_SIZE');
  color: #606266;
  font-weight: 500;
}

.company-name-empty {
  font-size: v-bind('CHANNEL_TABLE_UI.CELL_FONT_SIZE');
  color: #C0C4CC;
}

/* ============================================================================
   ORDER COLUMN
   ============================================================================ */
.order-column {
  font-size: v-bind('CHANNEL_TABLE_UI.CELL_FONT_SIZE');
  color: #606266;
  font-weight: 500;
}

/* ============================================================================
   ACTIVE SWITCH
   ============================================================================ */
.active-switch {
  transform: scale(0.8);
}

/* ============================================================================
   ACTION BUTTONS — КАК В COMPANIES!
   ============================================================================ */
.action-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.action-buttons .el-button + .el-button {
  margin-left: 0px !important;
}

.action-btn {
  padding: 0 !important;
  width: 24px;
  height: 24px;
  min-width: 24px;
  min-height: 24px;
  border: none !important;
  background: transparent !important;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all v-bind('ANIMATIONS.TRANSITION_NORMAL') v-bind('ANIMATIONS.EASING_EASE');
}

.action-btn :deep(.el-icon) {
  font-size: 14px;
  width: 14px;
  height: 14px;
  transition: all v-bind('ANIMATIONS.TRANSITION_NORMAL') v-bind('ANIMATIONS.EASING_EASE');
}

/* ✅ REFRESH BUTTON — WARNING COLOR LIKE COMPANIES! */
.action-btn-refresh {
  color: v-bind('COLORS.WARNING') !important;
}

.action-btn-refresh:hover:not(:disabled) {
  color: v-bind('COLORS.WARNING') !important;
  filter: brightness(1.1);
  transform: scale(v-bind('CHANNEL_TABLE_UI.ACTION_BTN_HOVER_SCALE'));
}

.action-btn-refresh :deep(.el-icon.is-loading) {
  color: v-bind('COLORS.DANGER') !important;
  animation: rotating 1s linear infinite;
}

/* ✅ EDIT BUTTON */
.action-btn-edit {
  color: v-bind('COLORS.PRIMARY') !important;
}

.action-btn-edit:hover:not(:disabled) {
  color: v-bind('COLORS.PRIMARY') !important;
  filter: brightness(1.1);
  transform: scale(v-bind('CHANNEL_TABLE_UI.ACTION_BTN_HOVER_SCALE'));
}

/* ✅ DELETE BUTTON */
.action-btn-delete {
  color: v-bind('COLORS.DANGER') !important;
}

.action-btn-delete:hover:not(:disabled) {
  color: v-bind('COLORS.DANGER') !important;
  filter: brightness(1.1);
  transform: scale(v-bind('CHANNEL_TABLE_UI.ACTION_BTN_HOVER_SCALE'));
}

/* ✅ DISABLED STATE */
.action-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  transform: none !important;
  color: v-bind('COLORS.INFO') !important;
  background: transparent !important;
}

/* ============================================================================
   EMPTY STATE
   ============================================================================ */
.table-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: v-bind('CHANNEL_TABLE_UI.EMPTY_GAP');
  padding: v-bind('CHANNEL_TABLE_UI.EMPTY_PADDING');
  color: v-bind('CHANNEL_TABLE_UI.EMPTY_TEXT_COLOR');
}

.empty-text {
  margin: 0;
  font-size: v-bind('CHANNEL_TABLE_UI.EMPTY_TEXT_SIZE');
  color: v-bind('CHANNEL_TABLE_UI.EMPTY_TEXT_COLOR');
}

/* ============================================================================
   SCROLLBAR
   ============================================================================ */
.channel-table :deep(.el-table__body-wrapper)::-webkit-scrollbar {
  width: v-bind('CHANNEL_TABLE_UI.SCROLLBAR_WIDTH');
  height: v-bind('CHANNEL_TABLE_UI.SCROLLBAR_WIDTH');
}

.channel-table :deep(.el-table__body-wrapper)::-webkit-scrollbar-track {
  background: v-bind('CHANNEL_TABLE_UI.SCROLLBAR_TRACK_COLOR');
  border-radius: v-bind('CHANNEL_TABLE_UI.SCROLLBAR_BORDER_RADIUS');
}

.channel-table :deep(.el-table__body-wrapper)::-webkit-scrollbar-thumb {
  background: v-bind('CHANNEL_TABLE_UI.SCROLLBAR_THUMB_COLOR');
  border-radius: v-bind('CHANNEL_TABLE_UI.SCROLLBAR_BORDER_RADIUS');
}

.channel-table :deep(.el-table__body-wrapper)::-webkit-scrollbar-thumb:hover {
  background: #909399;
}

/* ============================================================================
   АДАПТИВ
   ============================================================================ */
@media (max-width: v-bind('BREAKPOINTS.XXXL')) {
  .channel-table :deep(.el-table) {
    font-size: v-bind('CHANNEL_TABLE_UI.CELL_FONT_SIZE_MOBILE');
  }

  .action-btn {
    width: 22px;
    height: 22px;
  }
}

@media (max-width: v-bind('BREAKPOINTS.XL')) {
  .channel-table {
    height: v-bind('CHANNEL_TABLE_UI.TABLE_HEIGHT_MOBILE');
  }

  .channel-table :deep(.el-table) {
    font-size: v-bind('CHANNEL_TABLE_UI.CELL_FONT_SIZE_MOBILE');
  }

  .action-btn {
    width: 20px;
    height: 20px;
  }

  .action-btn :deep(.el-icon) {
    font-size: 12px;
  }
}

@media (max-width: v-bind('BREAKPOINTS.XS')) {
  .channel-table {
    height: v-bind('CHANNEL_TABLE_UI.TABLE_HEIGHT_SMALL');
  }

  .channel-table :deep(.el-table) {
    font-size: 11px;
  }

  .action-btn {
    width: 18px;
    height: 18px;
  }

  .action-btn :deep(.el-icon) {
    font-size: 11px;
  }

  .channel-type-tag {
    height: 14px;
    padding: 0 4px;
    font-size: 9px;
  }
}

@media (hover: none) and (pointer: coarse) {
  .action-btn {
    width: 32px;
    height: 32px;
  }

  .action-btn :deep(.el-icon) {
    font-size: 16px;
  }

  .channel-table {
    height: v-bind('CHANNEL_TABLE_UI.TABLE_HEIGHT_TOUCH');
  }

  .channel-table :deep(.el-table) {
    font-size: 13px;
  }

  .channel-type-tag {
    height: 20px;
    padding: 0 6px;
    font-size: 11px;
  }
}

/* ============================================================================
   ANIMATIONS
   ============================================================================ */
@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
