<template>
  <LayoutCardWrapper title="История тренировок" :icon="List" bordered shadow class="log-table-wrapper">
    <div class="table-filters">
      <el-row :gutter="12" align="middle">
        <el-col :span="6">
          <el-date-picker
              v-model="localDate"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              placeholder="Дата"
              size="small"
              clearable
              @change="onDateChange"
          />
        </el-col>
        <el-col :span="8">
          <el-select
              v-model="localExerciseId"
              placeholder="Упражнение"
              size="small"
              clearable
              filterable
              @change="onExerciseChange"
          >
            <el-option v-for="ex in exercises" :key="ex.id" :label="ex.name" :value="ex.id" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-date-picker
              v-model="localRange"
              type="daterange"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              range-separator="—"
              start-placeholder="С"
              end-placeholder="По"
              size="small"
              @change="onRangeChange"
          />
        </el-col>
        <el-col :span="4" class="text-right">
          <el-button size="small" @click="onClearFilters">Сбросить</el-button>
        </el-col>
      </el-row>
    </div>

    <el-table
        :key="tableKey"
        :data="logStore.logs"
        height="calc(100vh - 530px)"
        style="width: 100%"
        size="small"
        stripe
        highlight-current-row
        v-loading="logStore.loading"
        empty-text="Записей не найдено"
    >
      <el-table-column prop="date" label="Дата" width="100" sortable>
        <template #default="{ row }">{{ formatDate(row.date) }}</template>
      </el-table-column>
      <el-table-column prop="time" label="Время" width="80">
        <template #default="{ row }">{{ formatTime(row.time) }}</template>
      </el-table-column>
      <el-table-column prop="exercise.name" label="Упражнение" min-width="140">
        <template #default="{ row }">
          <span>{{ row.exercise?.name }}</span>
          <el-tag size="small" :type="getExerciseTagType(row.exercise?.type)" class="ml-2">{{ row.exercise?.type }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Подходы" min-width="160">
        <template #default="{ row }">
          <div class="sets-preview">
            <span v-for="(set, i) in row.sets?.slice(0, 3)" :key="i" class="set-chip">{{ formatSet(set, row.exercise?.type) }}</span>
            <span v-if="row.sets?.length > 3" class="more-chip">+{{ row.sets.length - 3 }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="total_reps" label="Повторы" width="80" sortable>
        <template #default="{ row }">{{ row.total_reps || '—' }}</template>
      </el-table-column>
      <el-table-column label="Объём" width="90" v-if="showVolume">
        <template #default="{ row }">{{ formatVolume(row.total_volume) }}</template>
      </el-table-column>
      <el-table-column prop="rating" label="Оценка" width="70" align="center">
        <template #default="{ row }">
          <span v-if="row.rating" class="rating-stars">{{ formatRating(row.rating) }}</span>
          <span v-else class="text-muted">—</span>
        </template>
      </el-table-column>
      <el-table-column label="Действия" width="100" fixed="right" align="center">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click.stop="handleEdit(row)">
            <el-icon><Edit /></el-icon>
          </el-button>
          <el-button link type="danger" size="small" @click.stop="handleDelete(row)">
            <el-icon><Delete /></el-icon>
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="table-pagination">
      <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="currentPageSize"
          :total="logStore.pagination.total"
          :page-sizes="[20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          size="small"
          background
          @current-change="logStore.setPage"
          @size-change="logStore.setPerPage"
      />
    </div>

    <el-dialog v-model="deleteDialogVisible" title="Удаление записи" width="320px" :close-on-click-modal="false">
      <p>Удалить запись от {{ selectedLog?.date }}?</p>
      <template #footer>
        <el-button @click="deleteDialogVisible = false">Отмена</el-button>
        <el-button type="danger" @click="confirmDelete" :loading="deleting">Удалить</el-button>
      </template>
    </el-dialog>
  </LayoutCardWrapper>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { List, Edit, Delete } from '@element-plus/icons-vue'

import { useTrainingLogStore } from '@/components/Training/stores/trainingLogStore.js'
import { useExerciseStore } from '@/components/Training/stores/exerciseStore.js'
import { formatDate, formatTime, formatSet, formatVolume, formatRating, getExerciseTagType } from '@/components/Training/utils/appFormattersUtils.js'
import LayoutCardWrapper from '@/components/SmartLight/components/layout/wrappers/LayoutCardWrapper.vue'

const props = defineProps({ showVolume: { type: Boolean, default: true } })
const emit = defineEmits(['edit', 'deleted'])

const logStore = useTrainingLogStore()
const exerciseStore = useExerciseStore()

// Локальные refs для v-model (чтобы не триггерить стор при каждом клике)
const localDate = ref(null)
const localExerciseId = ref(null)
const localRange = ref([])
const currentPage = computed(() => logStore.pagination.page)
const currentPageSize = computed(() => logStore.pagination.per_page)
const tableKey = ref(0)

const deleteDialogVisible = ref(false)
const selectedLog = ref(null)
const deleting = ref(false)
const exercises = computed(() => exerciseStore.exercises)

onMounted(async () => {
  if (!exerciseStore.exercisesLoaded) await exerciseStore.fetchExercisesStore()

  // Синхронизируем UI с сохраненными фильтрами ОДИН РАЗ
  localDate.value = logStore.dateFilter
  localExerciseId.value = logStore.exerciseFilter
  if (logStore.dateRange.from && logStore.dateRange.to) {
    localRange.value = [logStore.dateRange.from, logStore.dateRange.to]
  } else {
    localRange.value = []
  }

  if (logStore.logs.length === 0) {
    await logStore.fetchLogsStore()
  }
})

// Обработчики вызывают стор ТОЛЬКО по явному действию пользователя
const onDateChange = async (val) => {
  tableKey.value++
  await logStore.applyFilters({ date: val })
}

const onExerciseChange = async (val) => {
  tableKey.value++
  await logStore.applyFilters({ exercise_id: val })
}

const onRangeChange = async (val) => {
  tableKey.value++
  await logStore.applyFilters({ from: val?.[0] || null, to: val?.[1] || null })
}

const onClearFilters = async () => {
  tableKey.value++
  localDate.value = null
  localExerciseId.value = null
  localRange.value = []
  await logStore.clearFilters()
}

const handleEdit = (log) => emit('edit', log)

const handleDelete = (log) => {
  selectedLog.value = log
  deleteDialogVisible.value = true
}

const confirmDelete = async () => {
  if (!selectedLog.value) return
  deleting.value = true
  try {
    await logStore.deleteLog(selectedLog.value.id)
    ElMessage.success('Запись удалена')
    emit('deleted', selectedLog.value.id)
    deleteDialogVisible.value = false
  } catch (e) {
    ElMessage.error('Ошибка удаления')
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
.log-table-wrapper { font-size: 12px; display: flex; flex-direction: column; }
.table-filters { padding: 8px 0 12px; border-bottom: 1px solid #ebeef5; margin-bottom: 8px; }
.text-right { text-align: right; }
.ml-2 { margin-left: 8px; }
.sets-preview { display: flex; flex-wrap: wrap; gap: 4px; align-items: center; }
.set-chip { font-size: 10px; padding: 2px 6px; background: #f5f7fa; border-radius: 3px; color: #606266; white-space: nowrap; }
.more-chip { font-size: 10px; color: #909399; }
.rating-stars { color: #e6a23c; font-size: 12px; letter-spacing: 1px; }
.text-muted { color: #909399; }
.table-pagination { padding: 8px 0 0; display: flex; justify-content: flex-end; }
:deep(.el-table__row) { cursor: pointer; }
:deep(.el-table) { font-size: 12px; }
:deep(.el-table .cell) { padding: 4px 8px; }
</style>
