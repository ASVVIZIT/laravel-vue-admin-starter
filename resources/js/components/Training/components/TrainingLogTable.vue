<template>
  <LayoutCardWrapper title="История тренировок" :icon="List" bordered shadow class="log-table-wrapper">
    <el-table
        :data="logs"
        :row-key="getRowKey"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        height="calc(100vh - 380px)"
        style="width: 100%"
        :size="compact ? 'small' : 'default'"
        stripe
        highlight-current-row
        v-loading="loading"
        empty-text="Записей не найдено"
        :class="{ 'compact-table': compact, 'grouped-table': isGrouped }"
    >
      <!-- 🔥 КОЛОНКА ГРУППЫ -->
      <el-table-column v-if="isGrouped" label="Пользователь / Группа" min-width="170" class-name="group-column">
        <template #default="{ row }">
          <span v-if="row.children" class="group-label">
            <el-icon :size="14"><User /></el-icon>
            <span class="group-name">{{ row.group_label }}</span>
            <el-tag size="small" type="info" effect="plain">{{ row.count }}</el-tag>
          </span>
          <span v-else class="text-muted">—</span>
        </template>
      </el-table-column>

      <!-- Дата -->
      <el-table-column v-if="isColumnVisible('date')" prop="date" label="Дата" width="120" sortable>
        <template #default="{ row }"><span>{{ formatDate(row.date) }}</span></template>
      </el-table-column>

      <!-- Время -->
      <el-table-column v-if="isColumnVisible('time')" prop="time" label="Время" width="75">
        <template #default="{ row }">{{ formatTime(row.time) }}</template>
      </el-table-column>

      <!-- Упражнение -->
      <el-table-column v-if="isColumnVisible('exercise')" prop="exercise.name" label="Упражнение" min-width="170">
        <template #default="{ row }">
          <template v-if="row.exercise">
            <span>{{ row.exercise?.name }}</span>
            <el-tag size="small" :type="getExerciseTagType(row.exercise?.type)" class="ml-2">{{ row.exercise?.type }}</el-tag>
          </template>
          <span v-else class="text-muted">—</span>
        </template>
      </el-table-column>

      <!-- 🔗 Индикатор шеринга -->
      <el-table-column v-if="isColumnVisible('sharing')" label="🔗" width="50" align="center">
        <template #default="{ row }">
          <template v-if="row.user_id">
            <el-tooltip v-if="row.user_id !== currentUserId" :content="`Запись от ${row.user?.name || 'Пользователя'}`" placement="top">
              <el-icon :size="14" color="#409eff"><User /></el-icon>
            </el-tooltip>
            <el-tooltip v-else-if="row.is_public || (row.shared_with?.length > 0)" :content="row.is_public ? '🌍 Публичная запись' : `🔐 Расшарено: ${row.shared_with?.length || 0}`" placement="top">
              <el-icon :size="14" :color="row.is_public ? '#67c23a' : '#e6a23c'">
                <Share v-if="row.is_public" /><Connection v-else />
              </el-icon>
            </el-tooltip>
            <span v-else class="text-muted">—</span>
          </template>
          <span v-else class="text-muted">—</span>
        </template>
      </el-table-column>

      <!-- Подходы -->
      <el-table-column v-if="isColumnVisible('sets')" label="Подходы" min-width="190">
        <template #default="{ row }">
          <div v-if="row.sets" class="sets-preview-row">
            <span v-for="(set, i) in row.sets?.slice(0, 3)" :key="i" class="set-chip-text">{{ formatSetPreview(set, row.exercise?.type) }}</span>
            <SetsTooltip v-if="row.sets?.length > 3" :all-sets="row.sets" :visible-count="3" :exercise-type="row.exercise?.type">
              <span class="more-chip">+{{ row.sets.length - 3 }}</span>
            </SetsTooltip>
          </div>
          <span v-else class="text-muted">—</span>
        </template>
      </el-table-column>

      <!-- Повторы -->
      <el-table-column v-if="isColumnVisible('reps')" label="Повторы" width="110" sortable :sort-method="sortByReps">
        <template #default="{ row }">
          <span v-if="row.sets">{{ calculateTotalReps(row.sets) }}</span>
          <span v-else class="text-muted">—</span>
        </template>
      </el-table-column>

      <!-- Объём -->
      <el-table-column v-if="isColumnVisible('volume')" label="Объём" width="100">
        <template #default="{ row }">
          <span v-if="row.total_volume !== undefined">{{ formatVolume(row.total_volume) }}</span>
          <span v-else class="text-muted">—</span>
        </template>
      </el-table-column>

      <!-- Оценка -->
      <el-table-column v-if="isColumnVisible('rating')" prop="rating" label="Оценка" width="80" align="center">
        <template #default="{ row }">
          <span v-if="row.rating" class="rating-stars">{{ formatRating(row.rating) }}</span>
          <span v-else class="text-muted">—</span>
        </template>
      </el-table-column>

      <!-- Действия -->
      <el-table-column v-if="isColumnVisible('actions')" label="Действия" width="100" fixed="right" align="center">
        <template #default="{ row }">
          <template v-if="row.user_id && row.user_id === currentUserId">
            <el-button link type="primary" size="small" @click.stop="$emit('edit', row)"><el-icon><Edit /></el-icon></el-button>
            <el-button link type="danger" size="small" @click.stop="$emit('delete', row)"><el-icon><Delete /></el-icon></el-button>
          </template>
          <span v-else-if="row.user_id" class="text-muted text-xs">Просмотр</span>
          <span v-else class="text-muted">—</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- Пагинация -->
    <div class="table-pagination">
      <el-pagination
          :current-page="pagination?.page || 1"
          :page-size="pagination?.per_page || 50"
          :total="pagination?.total || 0"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          size="small"
          background
          @current-change="(page) => $emit('page-change', page)"
          @size-change="(size) => $emit('per-page-change', size)"
      />
    </div>
  </LayoutCardWrapper>
</template>

<script setup>
import { List, Edit, Delete, User, Share, Connection } from '@element-plus/icons-vue'
import { formatDate, formatTime, formatVolume, formatRating, getExerciseTagType, calculateTotalReps, sortByReps, formatSetPreview } from '@/components/Training/utils/appFormattersUtils.js'
import LayoutCardWrapper from '@/components/Training/components/layout/wrappers/LayoutCardWrapper.vue'
import SetsTooltip from './SetsTooltip.vue'

const props = defineProps({
  logs: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  compact: { type: Boolean, default: false },
  isGrouped: { type: Boolean, default: false },
  pagination: { type: Object, default: () => ({}) },
  activeTab: { type: String, default: 'mine' },
  currentUserId: { type: Number, required: true },
  columnsConfig: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['edit', 'delete', 'page-change', 'per-page-change'])

const getRowKey = (row) => row.group_key || `log_${row.id}`

const isColumnVisible = (columnName) => {
  if (!props.columnsConfig || Object.keys(props.columnsConfig).length === 0) {
    if (columnName === 'actions') return props.activeTab !== 'shared-with-me'
    return true
  }
  return props.columnsConfig[columnName] !== false
}
</script>

<style scoped>
.log-table-wrapper { font-size: 12px; display: flex; flex-direction: column; }
.sets-preview-row { display: flex; flex-wrap: wrap; gap: 5px; align-items: center; line-height: 1.3; min-height: 24px; }
.set-chip-text { background: #f5f7fa; border: 1px solid #e4e7ed; padding: 2px 6px; border-radius: 4px; font-size: 11px; color: #606266; white-space: nowrap; font-weight: 500; }
.more-chip { font-size: 10px; color: #409eff; cursor: help; background: #ecf5ff; border: 1px solid #b3d8ff; border-radius: 3px; padding: 1px 6px; }
.rating-stars { color: #e6a23c; font-size: 12px; letter-spacing: 1px; }
.text-muted { color: #909399; }
.table-pagination { padding: 8px 0 0; display: flex; justify-content: flex-end; }
:deep(.el-pagination__sizes) { min-width: 115px !important; }
:deep(.el-select-dropdown) { z-index: 2100 !important; }
:deep(.el-table__row) { cursor: pointer; }
:deep(.el-table) { font-size: 12px; }
:deep(.el-table .cell) { padding: 4px 8px; display: inline-flex; align-items: center; vertical-align: middle; }
.text-xs { font-size: 10px; }

.compact-table :deep(.el-table .cell) { padding: 2px 6px; }
.compact-table :deep(.el-table__row) { height: 32px; }
.compact-table .set-chip-text { padding: 1px 4px; font-size: 10px; }
.compact-table .more-chip { padding: 0px 4px; font-size: 9px; }

.grouped-table :deep(.el-table__row--level-0) { background-color: #f0f9ff !important; font-weight: 600; }
.grouped-table :deep(.el-table__row--level-0:hover > td) { background-color: #e1f0ff !important; }
.grouped-table :deep(.el-table__row--level-1) { background-color: #fff !important; }

:deep(.el-table__expand-icon) { display: inline-flex; align-items: center; margin-right: 6px; vertical-align: middle; height: 14px; width: 14px; }
:deep(.el-table__expand-icon .el-icon) { display: inline-flex; align-items: center; justify-content: center; }

:deep(.group-column .cell) { display: flex; align-items: center; width: 100%; }

.group-label { display: inline-flex; align-items: center; gap: 6px; font-weight: 600; color: #303133; flex: 1; min-width: 0; }
.group-name { font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.ml-2 { margin-left: 8px; }
</style>
