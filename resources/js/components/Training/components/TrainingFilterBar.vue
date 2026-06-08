<template>
  <div class="filter-bar">
    <div class="filter-row-main">
      <el-button
          v-if="isSmallScreen"
          class="master-toggle"
          text
          size="small"
          @click="showExtras = !showExtras"
          :title="showExtras ? 'Скрыть дополнительные кнопки' : 'Показать дополнительные кнопки'"
      >
        <el-icon><ArrowDown v-if="!showExtras" /><ArrowUp v-else /></el-icon>
      </el-button>

      <div class="filter-col col-date">
        <el-date-picker
            v-model="localDate"
            type="date"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            placeholder="Дата"
            size="small"
            clearable
            :shortcuts="config.date.shortcuts"
            @update:model-value="onDateChange"
            @clear="onDateClear"
            :class="{ 'is-filter-active': localDate }"
            class="w-100"
        />
      </div>

      <div class="filter-col col-select">
        <el-select
            v-model="localExerciseId"
            placeholder="Упражнение"
            size="small"
            clearable
            filterable
            popper-class="training-filter-select-popper"
            @update:model-value="onExerciseChange"
            @clear="onExerciseClear"
            :class="{ 'is-filter-active': localExerciseId && localExerciseId !== 'all' }"
            class="w-100"
        >
          <el-option label="Все упражнения" value="all" />
          <el-option
              v-for="ex in exerciseOptions"
              :key="ex.id"
              :label="ex.name"
              :value="ex.id"
          />
        </el-select>
      </div>

      <div class="filter-col col-range">
        <el-date-picker
            v-model="localRange"
            type="daterange"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            start-placeholder="Начало"
            end-placeholder="Конец"
            range-separator="—"
            size="small"
            :shortcuts="config.range.shortcuts"
            @update:model-value="onRangeChange"
            @clear="onRangeClear"
            :class="{ 'is-filter-active': localRange && localRange.length === 2 }"
            class="w-100"
        />
      </div>

      <div class="filter-col col-reset">
        <el-button type="danger" plain size="small" @click="clearAll" class="reset-btn">
          <el-icon><RefreshRight /></el-icon>
          <span>Сброс</span>
        </el-button>
      </div>
    </div>

    <div class="filter-row-extras" v-show="showExtras || !isSmallScreen">
      <div class="filter-col spacer-col" v-if="isSmallScreen"></div>

      <div class="filter-col col-date">
        <div class="quick-btns-row">
          <el-button
              v-for="btn in config.date.quickButtons"
              :key="btn.id"
              :type="activeQuickDate === btn.id ? 'primary' : 'default'"
              plain
              size="small"
              class="btn-quick"
              @click="handleQuickDate(btn.id)"
          >
            {{ btn.label }}
          </el-button>
        </div>
      </div>

      <div class="filter-col col-select">
        <div class="hint-container">
          <component :is="exerciseHint.icon" class="hint-icon" />
          <span>{{ exerciseHint.text }}</span>
        </div>
      </div>

      <div class="filter-col col-range">
        <div class="quick-btns-row">
          <el-button
              v-for="btn in config.range.quickButtons"
              :key="btn.id"
              :type="activeQuickRange === btn.id ? 'primary' : 'default'"
              plain
              size="small"
              class="btn-quick"
              @click="handleQuickRange(btn.id)"
          >
            {{ btn.label }}
          </el-button>
        </div>
      </div>

      <div class="filter-col spacer-col" v-if="isSmallScreen"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { RefreshRight, ArrowDown, ArrowUp, InfoFilled } from '@element-plus/icons-vue'
import { useTrainingLogStore } from '@/components/Training/stores/trainingLogStore.js'
import { useExerciseStore } from '@/components/Training/stores/exerciseStore.js'
import { FILTER_BLOCKS } from '../config/filterConfig.js'

const logStore = useTrainingLogStore()
const exerciseStore = useExerciseStore()
const config = FILTER_BLOCKS

// Локальное состояние
const localDate = ref(null)
const localExerciseId = ref('all')
const localRange = ref([])

const isSmallScreen = ref(window.innerWidth <= 900)
const showExtras = ref(!isSmallScreen.value)

const exercisesSnapshot = ref([])

let isUpdatingFromStore = false

// КЛЮЧЕВОЕ: activeQuickDate и activeQuickRange — computed из фильтров текущей вкладки
const activeQuickDate = computed(() => {
  const f = logStore.currentFilters
  return findMatchingQuickDate(f.date)
})

const activeQuickRange = computed(() => {
  const f = logStore.currentFilters
  return findMatchingQuickRange(f.from, f.to)
})

// Watch: обновляем снимок упражнений при изменении фильтров
watch(
    () => [logStore.currentFilters.date, logStore.currentFilters.from, logStore.currentFilters.to, logStore.currentLogs, logStore.activeTab],
    () => {
      const f = logStore.currentFilters
      const hasDateFilter = f.date || f.from
      const hasExerciseFilter = f.exercise_id

      if (!hasDateFilter) {
        exercisesSnapshot.value = []
        return
      }

      if (hasExerciseFilter) return

      const usedIds = new Set((logStore.currentLogs || []).map(l => l.exercise_id))
      exercisesSnapshot.value = exerciseStore.exercises.filter(ex => usedIds.has(ex.id))
    },
    { immediate: true }
)

const exerciseOptions = computed(() => {
  if (!exerciseStore.exercises?.length) return []

  const f = logStore.currentFilters
  if (!f.date && !f.from) {
    return exerciseStore.exercises
  }

  const baseList = exercisesSnapshot.value.length > 0 ? exercisesSnapshot.value : exerciseStore.exercises

  if (localExerciseId.value && localExerciseId.value !== 'all') {
    const selected = exerciseStore.exercises.find(ex => ex.id === localExerciseId.value)
    if (selected && !baseList.find(ex => ex.id === selected.id)) {
      return [...baseList, selected]
    }
  }
  return baseList
})

const exerciseHint = computed(() => {
  const f = logStore.currentFilters
  if (!localExerciseId.value || localExerciseId.value === 'all') return config.exercise.hint.none
  if (!f.date && !f.from) return config.exercise.hint.all
  return config.exercise.hint.filtered
})

// Синхронизация Store → Local
watch(() => logStore.currentFilters.date, (newVal) => {
  if (isUpdatingFromStore) return
  if (newVal !== localDate.value) {
    localDate.value = newVal
  }
})

watch(() => [logStore.currentFilters.from, logStore.currentFilters.to], ([newFrom, newTo]) => {
  if (isUpdatingFromStore) return
  const current = localRange.value || []
  if (newFrom !== current[0] || newTo !== current[1]) {
    localRange.value = (newFrom && newTo) ? [newFrom, newTo] : []
  }
})

watch(() => logStore.currentFilters.exercise_id, (newVal) => {
  if (isUpdatingFromStore) return
  localExerciseId.value = newVal || 'all'
})

// Единая функция применения фильтров
const applyFilters = (params) => {
  isUpdatingFromStore = true

  const cleanParams = {}
  if ('page' in params && params.page !== undefined) cleanParams.page = params.page
  if ('per_page' in params && params.per_page !== undefined) cleanParams.per_page = params.per_page
  if ('date' in params) cleanParams.date = params.date || null
  if ('exercise_id' in params) cleanParams.exercise_id = params.exercise_id || null
  if ('from' in params) cleanParams.from = params.from || null
  if ('to' in params) cleanParams.to = params.to || null

  logStore.applyFilters(cleanParams)

  nextTick(() => {
    isUpdatingFromStore = false
  })
}

// Обработчики событий
const onDateChange = (val) => {
  if (isUpdatingFromStore) return
  localRange.value = []
  showExtras.value = true
  applyFilters({ date: val, from: null, to: null, page: 1 })
}

const onDateClear = () => {
  if (isUpdatingFromStore) return
  localDate.value = null
  showExtras.value = false
  applyFilters({ date: null, from: null, to: null, page: 1 })
}

const onRangeChange = (val) => {
  if (isUpdatingFromStore) return
  localDate.value = null
  showExtras.value = true
  applyFilters({ date: null, from: val?.[0] || null, to: val?.[1] || null, page: 1 })
}

const onRangeClear = () => {
  if (isUpdatingFromStore) return
  localRange.value = []
  showExtras.value = false
  applyFilters({ date: null, from: null, to: null, page: 1 })
}

const onExerciseChange = (val) => {
  if (isUpdatingFromStore) return
  applyFilters({ exercise_id: val === 'all' ? null : val, page: 1 })
}

const onExerciseClear = () => {
  if (isUpdatingFromStore) return
  localExerciseId.value = 'all'
  applyFilters({ exercise_id: null, page: 1 })
}

const handleQuickDate = (type) => {
  if (isUpdatingFromStore) return
  localRange.value = []
  const d = new Date(); d.setHours(0,0,0,0)
  if (type === 'yesterday') d.setDate(d.getDate() - 1)
  if (type === 'tomorrow') d.setDate(d.getDate() + 1)
  const dateStr = d.toISOString().split('T')[0]
  localDate.value = dateStr
  showExtras.value = true
  applyFilters({ date: dateStr, from: null, to: null, page: 1 })
}

const handleQuickRange = (type) => {
  if (isUpdatingFromStore) return
  localDate.value = null
  const now = new Date(); now.setHours(0,0,0,0); let start = new Date(now)
  switch (type) {
    case 'week': start.setDate(now.getDate() - ((now.getDay() || 7) - 1)); break;
    case 'month': start = new Date(now.getFullYear(), now.getMonth(), 1); break;
    case 'quarter': { const q = Math.floor(now.getMonth() / 3); start = new Date(now.getFullYear(), q * 3, 1); break; }
    case 'halfyear': { const h = now.getMonth() >= 6 ? 6 : 0; start = new Date(now.getFullYear(), h, 1); break; }
  }
  start.setHours(0,0,0,0)
  const fmt = d => d.toISOString().split('T')[0]
  localRange.value = [fmt(start), fmt(now)]
  showExtras.value = true
  applyFilters({ date: null, from: fmt(start), to: fmt(now), page: 1 })
}

const clearAll = () => {
  if (isUpdatingFromStore) return
  localDate.value = null
  localExerciseId.value = 'all'
  localRange.value = []
  showExtras.value = false
  logStore.clearFilters()
}

const findMatchingQuickDate = (date) => {
  if (!date) return null
  for (const btn of config.date.quickButtons) {
    if (isDateMatchingQuickButton(date, btn.id)) return btn.id
  }
  return null
}

const findMatchingQuickRange = (from, to) => {
  if (!from || !to) return null
  for (const btn of config.range.quickButtons) {
    if (isRangeMatchingQuickButton(from, to, btn.id)) return btn.id
  }
  return null
}

const isDateMatchingQuickButton = (date, buttonId) => {
  if (!date || !buttonId) return false
  const d = new Date(date)
  const today = new Date(); today.setHours(0,0,0,0)
  if (buttonId === 'today') return d.getTime() === today.getTime()
  if (buttonId === 'yesterday') { const y = new Date(today); y.setDate(y.getDate() - 1); return d.getTime() === y.getTime() }
  if (buttonId === 'tomorrow') { const t = new Date(today); t.setDate(t.getDate() + 1); return d.getTime() === t.getTime() }
  return false
}

const isRangeMatchingQuickButton = (from, to, buttonId) => {
  if (!from || !to || !buttonId) return false
  const f = new Date(from); f.setHours(0,0,0,0)
  const t = new Date(to); t.setHours(0,0,0,0)
  const now = new Date(); now.setHours(0,0,0,0)
  if (buttonId === 'week') {
    const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - ((now.getDay() || 7) - 1)); startOfWeek.setHours(0,0,0,0)
    return f.getTime() === startOfWeek.getTime() && t.getTime() === now.getTime()
  }
  if (buttonId === 'month') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    return f.getTime() === startOfMonth.getTime() && t.getTime() === now.getTime()
  }
  return false
}

const handleResize = () => {
  const small = window.innerWidth <= 900
  isSmallScreen.value = small
  if (!small) showExtras.value = true
}

onMounted(async () => {
  if (!exerciseStore.exercisesLoaded) await exerciseStore.fetchExercisesStore()

  isUpdatingFromStore = true
  const f = logStore.currentFilters
  localDate.value = f.date
  localExerciseId.value = f.exercise_id || 'all'
  if (f.from && f.to) localRange.value = [f.from, f.to]

  nextTick(() => {
    isUpdatingFromStore = false
  })

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => window.removeEventListener('resize', handleResize))
</script>

<style scoped>
.filter-bar { padding: 8px 12px; background: #fff; border-bottom: 1px solid #ebeef5; box-sizing: border-box; }
.w-100 { width: 100%; }
.filter-row-main, .filter-row-extras { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 6px; width: 100%; flex-wrap: nowrap; }
.filter-row-extras { transition: all 0.2s ease; }
.filter-col { flex: 1; min-width: 0; }
.col-date { flex: 0 0 22%; min-width: 140px; }
.col-select { flex: 0 0 26%; min-width: 160px; }
.col-range { flex: 1; min-width: 200px; }
.col-reset { flex: 0 0 90px !important; min-width: 90px !important; margin-left: 4px; flex-shrink: 0; }

.master-toggle { display: none; flex: 0 0 32px; width: 32px; height: 28px !important; padding: 0 !important; align-items: center; justify-content: center; color: #909399; border-radius: 4px; border: 1px solid #dcdfe6; cursor: pointer; transition: all 0.2s; }
@media (max-width: 900px) { .master-toggle { display: flex; } .master-toggle:hover { color: #409eff; background-color: #ecf5ff; border-color: #c6e2ff; } }

.spacer-col { flex: 0 0 32px; min-width: 32px; display: none; }
@media (max-width: 900px) { .spacer-col { display: block; } }

:deep(.el-date-editor), :deep(.el-range-editor), :deep(.el-select) { width: 100% !important; min-width: 80px !important; }
:deep(.el-input__wrapper), :deep(.el-range-editor.el-input__wrapper), :deep(.el-select .el-input__wrapper), .reset-btn { height: 28px !important; min-height: 28px !important; padding: 0 8px !important; box-shadow: 0 0 0 1px #dcdfe6 inset !important; border-radius: 4px; }
.reset-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 4px; font-size: 11px; border-color: #fbc4c4; color: #f56c6c; background-color: #fef0f0; }
.reset-btn:hover { background-color: #fde2e2; border-color: #f5a3a3; color: #f56c6c; }

.quick-btns-row { display: flex; gap: 4px; flex-wrap: wrap; width: 100%; }
.quick-btns-row .el-button { flex: 1; min-width: 45px; padding: 0 4px; font-size: 10px; height: 24px; justify-content: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.hint-container { display: flex; align-items: center; gap: 4px; height: 24px; font-size: 10px; color: #909399; width: 100%; }
.hint-icon { width: 1rem; height: 1rem; font-size: 12px; color: #409eff; }

:deep(.el-range-input) { height: 26px !important; font-size: 12px; }
:deep(.el-range__icon) { line-height: 26px !important; }
:deep(.training-filter-select-popper) { z-index: 2000 !important; max-height: 300px; overflow-y: auto; }

@media (max-width: 1200px) { .quick-btns-row .el-button { height: 20px; font-size: 9px; } .hint-container { font-size: 9px; } .reset-btn { font-size: 10px; } .col-date { flex: 0 0 25%; } .col-select { flex: 0 0 28%; } }
@media (max-width: 900px) { .filter-bar { padding: 6px 8px; } .filter-row-main, .filter-row-extras { gap: 8px; } .col-date { flex: 0 0 20%; min-width: 110px; } .col-select { flex: 0 0 24%; min-width: 130px; } .col-range { flex: 1; min-width: 150px; } .col-reset { flex: 0 0 34px !important; min-width: 34px !important; margin-left: 2px; } .reset-btn span { display: none; } .quick-btns-row { gap: 3px; } .quick-btns-row .el-button { height: 22px; font-size: 9px; padding: 0 2px; } .hint-container { font-size: 9px; height: 22px; } .hint-icon { width: 0.9rem; height: 0.9rem; font-size: 11px; } }
@media (max-width: 550px) { .filter-bar { padding: 4px 4px; } .filter-row-main, .filter-row-extras { gap: 4px; } .col-date { min-width: 95px; } .col-select { min-width: 105px; } .col-range { min-width: 120px; } .quick-btns-row { gap: 2px; } .quick-btns-row .el-button { min-width: 35px; height: 20px; font-size: 8px; padding: 0 1px; } .hint-container { font-size: 8px; height: 20px; gap: 2px; } .hint-icon { width: 0.75rem; height: 0.75rem; font-size: 10px; } }

/* ========================================================================
   ИНДИКАТОРЫ АКТИВНЫХ ФИЛЬТРОВ
   ======================================================================== */

/* Quick-кнопки в активном состоянии */
.btn-quick.el-button--primary {
  background-color: #409eff !important;
  border-color: #409eff !important;
  color: #fff !important;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(64, 158, 255, 0.3);
  transition: all 0.2s ease;
}

.btn-quick.el-button--primary:hover {
  background-color: #66b1ff !important;
  border-color: #66b1ff !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(64, 158, 255, 0.4);
}

/* Селект упражнения с активным фильтром */
.col-select :deep(.el-select.is-filter-active .el-input__wrapper) {
  border-color: #409eff !important;
  box-shadow: 0 0 0 1px #409eff inset !important;
  background-color: #ecf5ff !important;
  transition: all 0.2s ease;
}

.col-select :deep(.el-select.is-filter-active .el-input__inner) {
  color: #409eff;
  font-weight: 600;
}

/* Date-picker с активным фильтром */
.col-date :deep(.el-date-editor.is-filter-active .el-input__wrapper) {
  border-color: #409eff !important;
  box-shadow: 0 0 0 1px #409eff inset !important;
  background-color: #ecf5ff !important;
  transition: all 0.2s ease;
}

/* Range-picker с активным фильтром */
.col-range :deep(.el-date-editor.is-filter-active .el-input__wrapper) {
  border-color: #409eff !important;
  box-shadow: 0 0 0 1px #409eff inset !important;
  background-color: #ecf5ff !important;
  transition: all 0.2s ease;
}

/* Анимация появления активного состояния */
@keyframes filterActivate {
  from {
    box-shadow: 0 0 0 0 rgba(64, 158, 255, 0.5);
  }
  to {
    box-shadow: 0 0 0 1px #409eff inset;
  }
}

.is-filter-active {
  animation: filterActivate 0.3s ease-out;
}
</style>
