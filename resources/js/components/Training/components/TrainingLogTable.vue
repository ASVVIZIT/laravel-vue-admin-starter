<template>
  <LayoutCardWrapper title="История тренировок" :icon="List" bordered shadow class="log-table-wrapper">
    <el-table
        :data="logs"
        :row-key="getRowKey"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        height="calc(100vh - 340px)"
        style="width: 100%"
        :size="compact ? 'small' : 'default'"
        stripe
        highlight-current-row
        v-loading="loading"
        empty-text="Записей не найдено"
        :class="{ 'compact-table': compact, 'grouped-table': isGrouped }"
    >
      <!-- КОЛОНКА ГРУППЫ -->
      <el-table-column v-if="isGrouped" label="Группа" min-width="170" class-name="group-column" fixed="left" sortable>
        <template #default="{ row }">
          <span v-if="row.children" class="group-label">
            <el-icon :size="14"><User /></el-icon>
            <span class="group-name">{{ row.group_label }}</span>
            <el-tag size="small" type="info" effect="plain">{{ row.count }}</el-tag>
            <TrainingGroupSummaryTooltip :summary="row.summary" :group-name="row.group_label" />
          </span>
          <span v-else class="text-muted">—</span>
        </template>
      </el-table-column>

      <!-- Дата -->
      <el-table-column v-if="isColumnVisible('date')" prop="date" label="Дата" width="120" sortable>
        <template #default="{ row }">
          <span v-if="row.children" class="group-summary-text">{{ row.count }} записей</span>
          <span v-else>{{ formatDate(row.date) }}</span>
        </template>
      </el-table-column>

      <!-- Время -->
      <el-table-column v-if="isColumnVisible('time')" prop="time" label="Время" width="75">
        <template #default="{ row }">
          <span v-if="row.children" class="group-summary-text">{{ formatDuration(row.summary?.total_duration) }}</span>
          <span v-else>{{ formatTime(row.time) }}</span>
        </template>
      </el-table-column>

      <!-- Упражнение / Активность -->
      <el-table-column v-if="isColumnVisible('exercise')" prop="exercise.name" label="Активность" min-width="170">
        <template #default="{ row }">
          <TrainingSetsGroupTooltip
              v-if="row.children && row.summary?.top_entities?.length"
              :entities="row.summary.top_entities"
              :entity-label="row.summary.entity_label || 'Упражнения'"
          >
            <span v-for="(entity, i) in row.summary.top_entities.slice(0, 2)" :key="i" class="ex-tag">
              {{ entity }}
            </span>
            <el-tag v-if="row.summary.top_entities.length > 2" size="small" type="info" effect="plain" class="ex-more-tag">
              +{{ row.summary.top_entities.length - 2 }}
            </el-tag>
          </TrainingSetsGroupTooltip>

          <span v-else-if="row.children" class="text-muted">—</span>

          <template v-else-if="row.exercise">
            <span>{{ row.exercise?.name }}</span>
            <el-tag size="small" :type="getExerciseTagType(row.exercise?.type)" class="ml-2">{{ row.exercise?.type }}</el-tag>
          </template>
          <span v-else class="text-muted">—</span>
        </template>
      </el-table-column>

      <!-- Индикатор шеринга -->
      <el-table-column v-if="isColumnVisible('sharing')" label="🔗" width="50" align="center">
        <template #default="{ row }">
          <span v-if="row.children" class="text-muted">—</span>
          <template v-else-if="row.user_id">
            <el-tooltip v-if="row.user_id !== currentUserId" :content="`Запись от ${row.user?.name || 'Пользователя'}`" placement="top">
              <el-icon :size="14" color="#409eff"><User /></el-icon>
            </el-tooltip>
            <el-tooltip v-else-if="row.is_public || (row.shared_with?.length > 0)" :content="row.is_public ? '🌍 Публичная' : `🔐 ${row.shared_with?.length || 0}`" placement="top">
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
      <el-table-column v-if="isColumnVisible('sets')" label="Подходы" min-width="210">
        <template #default="{ row }">
          <span v-if="row.children" class="group-summary-bold">{{ row.summary?.total_sets || 0 }}</span>
          <div v-else-if="row.sets" class="sets-preview-row">
            <span v-for="(set, i) in row.sets?.slice(0, 3)" :key="i" class="set-chip-text">{{ formatSetPreview(set, row.exercise?.type) }}</span>
            <SetsTooltip v-if="row.sets?.length > 3" :all-sets="row.sets" :visible-count="3" :exercise-type="row.exercise?.type">
              <span class="more-chip">+{{ row.sets.length - 3 }}</span>
            </SetsTooltip>
          </div>
          <span v-else class="text-muted">—</span>
        </template>
      </el-table-column>

      <!-- Повторы -->
      <el-table-column v-if="isColumnVisible('reps')" label="Повторы" width="90" sortable :sort-method="sortByReps">
        <template #default="{ row }">
          <span v-if="row.sets">{{ calculateTotalReps(row.sets) }}</span>
          <span v-else class="text-muted">—</span>
        </template>
      </el-table-column>

      <!-- Объём / Результат -->
      <el-table-column v-if="isColumnVisible('volume')" label="Объём / Результат" min-width="110">
        <template #default="{ row }">
          <span v-if="row.children && row.summary?.total_volume > 0" class="group-summary-bold text-primary">
            {{ formatVolume(row.summary.total_volume) }}
          </span>
          <span v-else-if="row.children" class="text-muted">—</span>
          <span v-else-if="row.total_volume > 0" class="group-summary-bold text-primary">
            {{ formatVolume(row.total_volume) }}
          </span>
          <span v-else-if="row.total_distance > 0" class="group-summary-bold">
            {{ formatDistance(row.total_distance) }}
          </span>
          <span v-else-if="row.total_duration > 0" class="group-summary-bold">
            {{ formatDuration(row.total_duration) }}
          </span>
          <span v-else-if="row.sets" class="text-muted">{{ calculateTotalReps(row.sets) }} повт.</span>
          <span v-else class="text-muted">—</span>
        </template>
      </el-table-column>

      <!-- Оценка -->
      <el-table-column v-if="isColumnVisible('rating')" prop="rating" label="Оценка" width="80" align="center" sortable>
        <template #default="{ row }">
          <span v-if="row.rating" class="rating-stars">{{ formatRating(row.rating) }}</span>
          <span v-else class="text-muted">—</span>
        </template>
      </el-table-column>

      <!-- Действия -->
      <el-table-column v-if="isColumnVisible('actions')" label="Действия" width="100" fixed="right" align="center">
        <template #default="{ row }">
          <template v-if="!row.children && row.user_id && row.user_id === currentUserId">
            <el-button link type="primary" size="small" @click.stop="$emit('edit', row)"><el-icon><Edit /></el-icon></el-button>
            <el-button link type="danger" size="small" @click.stop="$emit('delete', row)"><el-icon><Delete /></el-icon></el-button>
          </template>
          <span v-else-if="!row.children && row.user_id" class="text-muted text-xs">Просмотр</span>
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
import { List, Edit, Delete, User, Share, Connection, DataLine } from '@element-plus/icons-vue'
import {
  formatDate, formatTime, formatVolume, formatDuration, formatDistance,
  formatRating, getExerciseTagType, calculateTotalReps, sortByReps, formatSetPreview
} from '@/components/Training/utils/appFormattersUtils.js'
import LayoutCardWrapper from '@/components/Training/components/layout/wrappers/LayoutCardWrapper.vue'
import SetsTooltip from './SetsTooltip.vue'
import TrainingGroupSummaryTooltip from './TrainingGroupSummaryTooltip.vue'
import TrainingSetsGroupTooltip from './TrainingSetsGroupTooltip.vue'

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

.sets-preview-row {
  display: flex; flex-wrap: wrap; gap: 1px; align-items: center;
  background: #d9e9f5; border: 1px solid #e4e7ed; padding: 2px 3px;
  border-radius: 4px; font-size: 9px; color: #606266; white-space: nowrap;
  font-weight: 500; height: 22px; overflow: hidden; min-width: 0;
}
.set-chip-text {
  background: rgba(255, 255, 255, 0.6); border: 1px solid #d4d7de;
  padding: 1px 4px; border-radius: 3px; font-size: 9px; color: #606266;
  white-space: nowrap; font-weight: 500; line-height: 1.2;
}
.more-chip {
  font-size: 9px; color: #409eff; cursor: help; background: rgba(64, 158, 255, 0.1);
  border: 1px solid #b3d8ff; border-radius: 3px; padding: 1px 4px; font-weight: 500;
}

.group-label { display: inline-flex; align-items: center; gap: 6px; font-weight: 600; color: #303133; flex: 1; min-width: 0; }
.group-name { font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.group-summary-text { font-size: 10px; color: #909399; font-weight: 500; }
.group-summary-bold { font-size: 11px; font-weight: 600; color: #303133; }
.text-primary { color: #409eff !important; }

.group-exercise-summary { display: flex; flex-wrap: wrap; gap: 4px; align-items: center; }
.ex-tag {
  font-size: 10px; color: #606266; background: #f0f9ff;
  padding: 1px 6px; border-radius: 3px; border: 1px solid #d9ecff;
  white-space: nowrap; max-width: 120px; overflow: hidden; text-overflow: ellipsis;
}
.ex-more-tag { font-size: 9px !important; padding: 0 4px !important; }

.rating-stars { color: #e6a23c; font-size: 12px; letter-spacing: 1px; }
.text-muted { color: #909399; }
.text-xs { font-size: 10px; }
.ml-2 { margin-left: 8px; }
.table-pagination { padding: 8px 0 0; display: flex; justify-content: flex-end; }

:deep(.el-pagination__sizes) { min-width: 115px !important; }
:deep(.el-select-dropdown) { z-index: 2100 !important; }
:deep(.el-table__row) { cursor: pointer; }
:deep(.el-table) { font-size: 12px; }

:deep(.el-table .el-table__cell), :deep(.el-table__header th) { padding: 1px 4px !important; box-sizing: border-box; }
:deep(.el-table .cell), :deep(.el-table__header .cell), :deep(.el-table.compact-table .cell) { padding: 1px 4px !important; line-height: 1.2; white-space: nowrap; }
:deep(.el-table__row) { height: 28px !important; min-height: 28px !important; }
:deep(.el-table__header th) { height: 28px !important; font-size: 11px !important; font-weight: 600; }
:deep(.el-table.compact-table .el-table__row) { height: 24px !important; min-height: 24px !important; }
:deep(.el-table.compact-table .cell) { font-size: 11px; }
.compact-table .set-chip-text, .compact-table .more-chip { padding: 0px 3px; font-size: 8px; }

.grouped-table :deep(.el-table__row--level-0) { background-color: #f0f9ff !important; font-weight: 600; }
.grouped-table :deep(.el-table__row--level-0:hover > td) { background-color: #e1f0ff !important; }
.grouped-table :deep(.el-table__row--level-1) { background-color: #fff !important; }
:deep(.el-table__expand-icon) { display: inline-flex; align-items: center; margin-right: 6px; vertical-align: middle; height: 14px; width: 14px; }
:deep(.el-table__expand-icon .el-icon) { display: inline-flex; align-items: center; justify-content: center; }
:deep(.group-column .cell) { display: flex; align-items: center; width: 100%; }
</style>
