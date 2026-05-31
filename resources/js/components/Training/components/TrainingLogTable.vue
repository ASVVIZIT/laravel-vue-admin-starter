<template>
  <LayoutCardWrapper title="История тренировок" :icon="List" bordered shadow class="log-table-wrapper">
    <div class="table-filters">
      <el-row :gutter="12">
        <!-- ОДИНОЧНАЯ ДАТА -->
        <el-col :span="6">
          <el-date-picker
              v-model="localDate"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              placeholder="Выберите дату"
              size="small"
              clearable
              :shortcuts="dateShortcuts"
              @change="handleDateSelect"
              @clear="handleClearAll"
              class="w-100"
          />
          <div class="quick-actions">
            <el-button :type="quickDate === 'today' ? 'primary' : 'default'" plain size="small" class="btn-quick" @click="handleQuickDate('today')">Сегодня</el-button>
            <el-button :type="quickDate === 'yesterday' ? 'primary' : 'default'" plain size="small" class="btn-quick" @click="handleQuickDate('yesterday')">Вчера</el-button>
            <el-button :type="quickDate === 'tomorrow' ? 'primary' : 'default'" plain size="small" class="btn-quick" @click="handleQuickDate('tomorrow')">Завтра</el-button>
          </div>
        </el-col>

        <!-- УПРАЖНЕНИЯ (РЕАКТИВНЫЙ СПИСОК) -->
        <el-col :span="8">
          <el-select
              v-model="localExerciseId"
              placeholder="Выберите упражнение"
              size="small"
              clearable
              filterable
              @change="handleExerciseSelect"
              class="w-100"
          >
            <el-option label="Все упражнения" value="all" />
            <el-option v-for="ex in exerciseOptions" :key="ex.id" :label="ex.name" :value="ex.id">
              <template #default>
                <span class="opt-name">{{ ex.name }}</span>
              </template>
            </el-option>
            <template #empty>
              <div class="empty-options">
                <el-icon><InfoFilled /></el-icon>
                <span>Нет записей за выбранный период</span>
              </div>
            </template>
          </el-select>
          <div class="quick-actions hint-row">
            <span class="hint-text" :class="{ 'hint-active': activeFilter }">
              {{ activeFilter ? '📊 Показаны только выполненные в выбранный период' : '🌐 Доступны все упражнения из базы' }}
            </span>
          </div>
        </el-col>

        <!-- ДИАПАЗОН ДАТ -->
        <el-col :span="10">
          <el-date-picker
              v-model="localRange"
              type="daterange"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              start-placeholder="Начало периода"
              end-placeholder="Конец периода"
              range-separator=" — "
              size="small"
              :shortcuts="rangeShortcuts"
              @change="handleRangeSelect"
              @clear="handleClearAll"
              class="w-100"
          />
          <div class="quick-actions">
            <el-button :type="quickRange === 'week' ? 'primary' : 'default'" plain size="small" class="btn-quick" @click="handleQuickRange('week')">Неделя</el-button>
            <el-button :type="quickRange === 'month' ? 'primary' : 'default'" plain size="small" class="btn-quick" @click="handleQuickRange('month')">Месяц</el-button>
            <el-button :type="quickRange === 'quarter' ? 'primary' : 'default'" plain size="small" class="btn-quick" @click="handleQuickRange('quarter')">Квартал</el-button>
            <el-button :type="quickRange === 'halfyear' ? 'primary' : 'default'" plain size="small" class="btn-quick" @click="handleQuickRange('halfyear')">Полгода</el-button>
            <el-button type="danger" plain size="small" class="btn-quick btn-reset" @click="handleClearAll">
              <el-icon><RefreshRight /></el-icon> Сбросить всё
            </el-button>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- ТАБЛИЦА -->
    <el-table
        :data="logStore.logs"
        height="calc(100vh - 360px)"
        style="width: 100%"
        size="small"
        stripe
        highlight-current-row
        v-loading="logStore.loading"
        empty-text="Записей не найдено"
    >
      <el-table-column prop="date" label="Дата" width="120" sortable>
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

      <!-- ✅ ПОДХОДЫ: Горизонтальный список + тултип для остатка -->
      <el-table-column label="Подходы" min-width="180">
        <template #default="{ row }">
          <div class="sets-preview-row">
            <span v-for="(set, i) in row.sets?.slice(0, 3)" :key="i" class="set-chip-text">
              {{ formatSetPreview(set, row.exercise?.type) }}
            </span>

            <!-- Тултип для оставшихся подходов -->
            <SetsTooltip
                v-if="row.sets?.length > 3"
                :all-sets="row.sets"
                :visible-count="3"
                :exercise-type="row.exercise?.type"
            >
              <span class="more-chip">+{{ row.sets.length - 3 }}</span>
            </SetsTooltip>
          </div>
        </template>
      </el-table-column>

      <!-- ✅ ПОВТОРЫ: Расширенная ширина + сортировка -->
      <el-table-column label="Повторы" width="110" sortable :sort-method="sortByReps">
        <template #default="{ row }">
          {{ calculateTotalReps(row.sets) }}
        </template>
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
          <el-button link type="primary" size="small" @click.stop="handleEdit(row)">
            <el-icon><Edit /></el-icon>
          </el-button>
          <el-button link type="danger" size="small" @click.stop="handleDelete(row)">
            <el-icon><Delete /></el-icon>
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- ПАГИНАЦИЯ -->
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

    <!-- МОДАЛКА УДАЛЕНИЯ -->
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
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { List, Edit, Delete, RefreshRight, InfoFilled } from '@element-plus/icons-vue'

import { useTrainingLogStore } from '@/components/Training/stores/trainingLogStore.js'
import { useExerciseStore } from '@/components/Training/stores/exerciseStore.js'
import { formatDate, formatTime, formatVolume, formatRating, getExerciseTagType, calculateTotalReps, sortByReps, formatSetPreview } from '@/components/Training/utils/appFormattersUtils.js'
import LayoutCardWrapper from '@/components/Training/components/layout/wrappers/LayoutCardWrapper.vue'
import SetsTooltip from './SetsTooltip.vue'

const props = defineProps({ showVolume: { type: Boolean, default: true } })
const emit = defineEmits(['edit', 'deleted'])

const logStore = useTrainingLogStore()
const exerciseStore = useExerciseStore()

// 🔥 СОСТОЯНИЕ
const localDate = ref(null)
const localRange = ref([])
const localExerciseId = ref(null)
const activeFilter = ref(null)
const quickDate = ref(null)
const quickRange = ref(null)
const deleteDialogVisible = ref(false)
const selectedLog = ref(null)
const deleting = ref(false)

const allExercises = ref([])

const dateShortcuts = [
  { text: 'Сегодня', value: () => new Date() },
  { text: 'Вчера', value: () => { const d = new Date(); d.setDate(d.getDate() - 1); return d } },
  { text: 'Завтра', value: () => { const d = new Date(); d.setDate(d.getDate() + 1); return d } }
]

const rangeShortcuts = [
  { text: 'Эта неделя', value: () => { const d = new Date(); const s = new Date(d); s.setDate(d.getDate() - d.getDay() + 1); return [s, d] } },
  { text: 'Этот месяц', value: () => { const d = new Date(); return [new Date(d.getFullYear(), d.getMonth(), 1), d] } },
  { text: 'Квартал', value: () => { const d = new Date(); const q = Math.floor(d.getMonth() / 3); const s = new Date(d.getFullYear(), q * 3, 1); const e = new Date(d.getFullYear(), q * 3 + 2, new Date(d.getFullYear(), q * 3 + 3, 0).getDate()); return [s, e] } },
  { text: 'Полгода', value: () => { const d = new Date(); const h = d.getMonth() >= 6 ? 6 : 0; return [new Date(d.getFullYear(), h, 1), d] } }
]

// 🔥 РЕАКТИВНЫЙ СПИСОК УПРАЖНЕНИЙ
const exerciseOptions = computed(() => {
  if (!allExercises.value.length) return []
  if (!activeFilter.value) return [...allExercises.value]

  const usedIds = new Set()
  logStore.logs.forEach(log => {
    if (log.exercise_id) usedIds.add(String(log.exercise_id))
  })
  return allExercises.value.filter(ex => usedIds.has(String(ex.id)))
})

// Автосброс, если выбранное упражнение исчезло из списка
watch([exerciseOptions, localExerciseId], ([options, currentId]) => {
  if (currentId && !options.some(opt => String(opt.id) === String(currentId))) {
    localExerciseId.value = null
  }
})

onMounted(async () => {
  if (logStore.dateFilter) { localDate.value = logStore.dateFilter; activeFilter.value = 'date' }
  if (logStore.dateRange.from && logStore.dateRange.to) { localRange.value = [logStore.dateRange.from, logStore.dateRange.to]; activeFilter.value = 'range' }
  localExerciseId.value = logStore.exerciseFilter

  await exerciseStore.fetchExercisesStore()
  allExercises.value = exerciseStore.exercises || []
})

// 🔥 ОБРАБОТЧИКИ
const handleDateSelect = async (val) => {
  if (!val) return handleClearAll()
  activeFilter.value = 'date'
  localRange.value = []
  quickRange.value = null
  await syncQuickDateState(val)
  await logStore.applyFilters({ date: val, from: null, to: null })
}

const handleRangeSelect = async (val) => {
  if (!val?.length) return handleClearAll()
  activeFilter.value = 'range'
  localDate.value = null
  quickDate.value = null
  await logStore.applyFilters({ date: null, from: val[0], to: val[1] })
}

const handleExerciseSelect = (val) => {
  logStore.applyFilters({ exercise_id: val === 'all' ? null : val })
}

const handleQuickDate = async (type) => {
  activeFilter.value = 'date'
  quickDate.value = type
  quickRange.value = null
  localRange.value = []

  const d = new Date()
  if (type === 'yesterday') d.setDate(d.getDate() - 1)
  if (type === 'tomorrow') d.setDate(d.getDate() + 1)
  localDate.value = d.toISOString().split('T')[0]
  await logStore.applyFilters({ date: localDate.value, from: null, to: null })
}

const handleQuickRange = async (type) => {
  activeFilter.value = 'range'
  quickRange.value = type
  quickDate.value = null
  localDate.value = null

  const now = new Date()
  let start = new Date(), end = new Date(now)

  switch (type) {
    case 'week': {
      const day = now.getDay() || 7; // Пн=1 ... Вс=7
      start.setDate(now.getDate() - day + 1); // Корректный понедельник текущей недели
      break;
    }
    case 'month': start = new Date(now.getFullYear(), now.getMonth(), 1); break
    case 'quarter': {
      const q = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), q * 3, 1);
      break;
    }
    case 'halfyear': {
      const h = now.getMonth() >= 6 ? 6 : 0;
      start = new Date(now.getFullYear(), h, 1);
      break;
    }
  }

  const fmt = d => d.toISOString().split('T')[0]
  localRange.value = [fmt(start), fmt(end)]
  await logStore.applyFilters({ date: null, from: fmt(start), to: fmt(end) })
}

const handleClearAll = async () => {
  activeFilter.value = null
  quickDate.value = null
  quickRange.value = null
  localDate.value = null
  localRange.value = []
  localExerciseId.value = null
  await logStore.clearFilters()
  ElMessage.success({ message: 'Фильтры сброшены', offset: 80, duration: 1500 })
}

const syncQuickDateState = (val) => {
  const fmt = d => new Date(d).toISOString().split('T')[0]
  const today = fmt(new Date())
  const yesterday = fmt(new Date().setDate(new Date().getDate() - 1))
  const tomorrow = fmt(new Date().setDate(new Date().getDate() + 1))
  if (val === today) quickDate.value = 'today'
  else if (val === yesterday) quickDate.value = 'yesterday'
  else if (val === tomorrow) quickDate.value = 'tomorrow'
  else quickDate.value = null
}

// Действия
const handleEdit = (log) => emit('edit', log)
const handleDelete = (log) => { selectedLog.value = log; deleteDialogVisible.value = true }
const confirmDelete = async () => {
  if (!selectedLog.value) return
  deleting.value = true
  try {
    await logStore.deleteLog(selectedLog.value.id)
    ElMessage.success('Запись удалена')
    emit('deleted', selectedLog.value.id)
    deleteDialogVisible.value = false
  } catch (e) { ElMessage.error('Ошибка удаления') } finally { deleting.value = false }
}
</script>

<style scoped>
.log-table-wrapper { font-size: 12px; display: flex; flex-direction: column; }
.w-100 { width: 100%; }
.table-filters { padding: 8px 0 12px; border-bottom: 1px solid #ebeef5; margin-bottom: 8px; }

.quick-actions { display: flex; gap: 4px; width: 100%; margin-top: 4px; }
.btn-quick { flex: 1; min-width: 0; padding: 0 4px; font-size: 10px; justify-content: center; }
.btn-reset { flex: 1.2; background-color: #fef0f0; border-color: #fbc4c4; }
.btn-reset:hover { background-color: #fde2e2; border-color: #f5a3a3; }
.hint-row { margin-top: 2px; }
.hint-text { font-size: 10px; color: #a8abb2; transition: color 0.2s; }
.hint-text.hint-active { color: #409eff; font-weight: 500; }
.empty-options { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 12px 0; color: #909399; }

.opt-name { font-size: 12px; }

/* ✅ ГОРИЗОНТАЛЬНЫЙ СПИСОК ПОДХОДОВ С ПЕРЕНОСОМ */
.sets-preview-row {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  align-items: center;
  line-height: 1.3;
  min-height: 24px;
}
.set-chip-text {
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  color: #606266;
  white-space: nowrap;
  font-weight: 500;
}
.more-chip {
  font-size: 10px;
  color: #909399;
  cursor: help;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 20px;
  background: #ecf5ff;
  border: 1px solid #b3d8ff;
  border-radius: 3px;
  color: #409eff;
  font-weight: 600;
}
.more-chip:hover { background: #d9ecff; }

.rating-stars { color: #e6a23c; font-size: 12px; letter-spacing: 1px; }
.text-muted { color: #909399; }

.table-pagination { padding: 8px 0 0; display: flex; justify-content: flex-end; }
:deep(.el-pagination__sizes) { min-width: 115px !important; }
:deep(.el-select-dropdown) { z-index: 2100 !important; }

:deep(.el-table__row) { cursor: pointer; }
:deep(.el-table) { font-size: 12px; }
:deep(.el-table .cell) { padding: 4px 8px; }

@media (max-width: 900px) {
  .quick-actions { flex-wrap: wrap; }
  .btn-quick { flex: 1 1 30%; }
}
</style>
