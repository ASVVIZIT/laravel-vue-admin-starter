<template>
  <LayoutCardWrapper title="История тренировок" :icon="List" bordered shadow class="log-table-wrapper">
    <el-table
        :data="logStore.logs"
        height="calc(100vh - 400px)"
        style="width: 100%"
        size="small"
        stripe
        highlight-current-row
        v-loading="logStore.loading"
        empty-text="Записей не найдено"
    >
      <el-table-column prop="date" label="Дата" width="110" sortable>
        <template #default="{ row }">{{ formatDate(row.date) }}</template>
      </el-table-column>
      <el-table-column prop="time" label="Время" width="70">
        <template #default="{ row }">{{ formatTime(row.time) }}</template>
      </el-table-column>
      <el-table-column prop="exercise.name" label="Упражнение" min-width="170">
        <template #default="{ row }">
          <span>{{ row.exercise?.name }}</span>
          <el-tag size="small" :type="getExerciseTagType(row.exercise?.type)" class="ml-2">{{ row.exercise?.type }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="Подходы" min-width="190">
        <template #default="{ row }">
          <div class="sets-preview-row">
            <span v-for="(set, i) in row.sets?.slice(0, 3)" :key="i" class="set-chip-text">
              {{ formatSetPreview(set, row.exercise?.type) }}
            </span>
            <SetsTooltip v-if="row.sets?.length > 3" :all-sets="row.sets" :visible-count="3" :exercise-type="row.exercise?.type">
              <span class="more-chip">+{{ row.sets.length - 3 }}</span>
            </SetsTooltip>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Повторы" width="110" sortable :sort-method="sortByReps">
        <template #default="{ row }">{{ calculateTotalReps(row.sets) }}</template>
      </el-table-column>

      <el-table-column label="Объём" width="100" v-if="showVolume">
        <template #default="{ row }">{{ formatVolume(row.total_volume) }}</template>
      </el-table-column>
      <el-table-column prop="rating" label="Оценка" width="80" align="center">
        <template #default="{ row }">
          <span v-if="row.rating" class="rating-stars">{{ formatRating(row.rating) }}</span>
          <span v-else class="text-muted">—</span>
        </template>
      </el-table-column>
      <el-table-column label="Действия" width="100" fixed="right" align="center">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click.stop="$emit('edit', row)"><el-icon><Edit /></el-icon></el-button>
          <el-button link type="danger" size="small" @click.stop="$emit('delete', row)"><el-icon><Delete /></el-icon></el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="table-pagination">
      <el-pagination
          :current-page="logStore.pagination.page"
          :page-size="logStore.pagination.per_page"
          :total="logStore.pagination.total"
          :page-sizes="[20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          size="small"
          background
          @current-change="logStore.setPage"
          @size-change="logStore.setPerPage"
      />
    </div>
  </LayoutCardWrapper>
</template>

<script setup>
import { computed } from 'vue'
import { List, Edit, Delete } from '@element-plus/icons-vue'
import { useTrainingLogStore } from '@/components/Training/stores/trainingLogStore.js'
import { formatDate, formatTime, formatVolume, formatRating, getExerciseTagType, calculateTotalReps, sortByReps, formatSetPreview } from '@/components/Training/utils/appFormattersUtils.js'
import LayoutCardWrapper from '@/components/Training/components/layout/wrappers/LayoutCardWrapper.vue'
import SetsTooltip from './SetsTooltip.vue'

defineProps({ showVolume: { type: Boolean, default: true } })
defineEmits(['edit', 'delete'])

const logStore = useTrainingLogStore()
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
:deep(.el-table .cell) { padding: 4px 8px; }
</style>
