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
            @change="onDateChange"
            @clear="onDateClear"
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
            @change="onExerciseChange"
            @clear="onExerciseClear"
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
            @change="onRangeChange"
            @clear="onRangeClear"
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { RefreshRight, ArrowDown, ArrowUp, InfoFilled } from '@element-plus/icons-vue'
import { useTrainingLogStore } from '@/components/Training/stores/trainingLogStore.js'
import { useExerciseStore } from '@/components/Training/stores/exerciseStore.js'
import { FILTER_BLOCKS } from '../config/filterConfig.js'

const logStore = useTrainingLogStore()
const exerciseStore = useExerciseStore()
const config = FILTER_BLOCKS

const localDate = ref(null)
const localExerciseId = ref(null)
const localRange = ref([])
const activeQuickDate = ref(null)
const activeQuickRange = ref(null)

const isSmallScreen = ref(window.innerWidth <= 900)
const showExtras = ref(!isSmallScreen.value)

const exercisesSnapshot = ref([])

// 🔥 Следим за фильтрами ТЕКУЩЕЙ вкладки и логами
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

  if (localExerciseId.value) {
    const selected = exerciseStore.exercises.find(ex => ex.id === localExerciseId.value)
    if (selected && !baseList.find(ex => ex.id === selected.id)) {
      return [...baseList, selected]
    }
  }
  return baseList
})

const exerciseHint = computed(() => {
  const f = logStore.currentFilters
  if (!localExerciseId.value) return config.exercise.hint.none
  if (!f.date && !f.from) return config.exercise.hint.all
  return config.exercise.hint.filtered
})

// 🔥 Синхронизация: Стор -> Локальные значения
watch(() => logStore.currentFilters.date, (newVal) => {
  if (newVal !== localDate.value) {
    localDate.value = newVal
    if (!activeQuickDate.value || !isDateMatchingQuickButton(newVal, activeQuickDate.value)) {
      activeQuickDate.value = null
    }
  }
})

watch(() => [logStore.currentFilters.from, logStore.currentFilters.to], ([newFrom, newTo]) => {
  const current = localRange.value || []
  if (newFrom !== current[0] || newTo !== current[1]) {
    localRange.value = (newFrom && newTo) ? [newFrom, newTo] : []
    if (!activeQuickRange.value || !isRangeMatchingQuickButton(newFrom, newTo, activeQuickRange.value)) {
      activeQuickRange.value = null
    }
  }
})

watch(() => logStore.currentFilters.exercise_id, (newVal) => {
  if (newVal !== localExerciseId.value) {
    localExerciseId.value = newVal
  }
})

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

const applyFilters = (params) => {
  const cleanParams = {}
  if ('page' in params && params.page !== undefined) cleanParams.page = params.page
  if ('per_page' in params && params.per_page !== undefined) cleanParams.per_page = params.per_page
  if ('date' in params && params.date) cleanParams.date = params.date
  if ('exercise_id' in params && params.exercise_id) cleanParams.exercise_id = params.exercise_id
  if ('from' in params && params.from) cleanParams.from = params.from
  if ('to' in params && params.to) cleanParams.to = params.to
  logStore.applyFilters(cleanParams)
}

const onDateChange = (val) => {
  activeQuickDate.value = null; localRange.value = []; activeQuickRange.value = null; showExtras.value = true
  applyFilters({ date: val, from: null, to: null, page: 1 })
}
const onDateClear = () => {
  activeQuickDate.value = null; localDate.value = null; showExtras.value = false
  applyFilters({ date: null, from: null, to: null, page: 1 })
}
const onRangeChange = (val) => {
  activeQuickRange.value = null; localDate.value = null; activeQuickDate.value = null; showExtras.value = true
  applyFilters({ date: null, from: val?.[0] || null, to: val?.[1] || null, page: 1 })
}
const onRangeClear = () => {
  activeQuickRange.value = null; localRange.value = []; showExtras.value = false
  applyFilters({ date: null, from: null, to: null, page: 1 })
}
const onExerciseChange = (val) => { applyFilters({ exercise_id: val === 'all' ? null : val, page: 1 }) }
const onExerciseClear = () => { localExerciseId.value = null; applyFilters({ exercise_id: null, page: 1 }) }

const handleQuickDate = (type) => {
  localRange.value = []; activeQuickRange.value = null; activeQuickDate.value = type
  const d = new Date(); d.setHours(0,0,0,0)
  if (type === 'yesterday') d.setDate(d.getDate() - 1)
  if (type === 'tomorrow') d.setDate(d.getDate() + 1)
  const dateStr = d.toISOString().split('T')[0]
  localDate.value = dateStr; showExtras.value = true
  applyFilters({ date: dateStr, from: null, to: null, page: 1 })
}

const handleQuickRange = (type) => {
  localDate.value = null; activeQuickDate.value = null; activeQuickRange.value = type
  const now = new Date(); now.setHours(0,0,0,0); let start = new Date(now)
  switch (type) {
    case 'week': start.setDate(now.getDate() - ((now.getDay() || 7) - 1)); break;
    case 'month': start = new Date(now.getFullYear(), now.getMonth(), 1); break;
    case 'quarter': { const q = Math.floor(now.getMonth() / 3); start = new Date(now.getFullYear(), q * 3, 1); break; }
    case 'halfyear': { const h = now.getMonth() >= 6 ? 6 : 0; start = new Date(now.getFullYear(), h, 1); break; }
  }
  start.setHours(0,0,0,0)
  const fmt = d => d.toISOString().split('T')[0]
  localRange.value = [fmt(start), fmt(now)]; showExtras.value = true
  applyFilters({ date: null, from: fmt(start), to: fmt(now), page: 1 })
}

const clearAll = () => {
  localDate.value = null; localExerciseId.value = null; localRange.value = []
  activeQuickDate.value = null; activeQuickRange.value = null; showExtras.value = false
  logStore.clearFilters()
}

const handleResize = () => {
  const small = window.innerWidth <= 900
  isSmallScreen.value = small
  if (!small) showExtras.value = true
}

onMounted(async () => {
  if (!exerciseStore.exercisesLoaded) await exerciseStore.fetchExercisesStore()

  // 🔥 Синхронизация при старте из currentFilters
  const f = logStore.currentFilters
  localDate.value = f.date
  localExerciseId.value = f.exercise_id
  if (f.from && f.to) localRange.value = [f.from, f.to]

  if (f.date && isDateMatchingQuickButton(f.date, 'today')) activeQuickDate.value = 'today'
  else if (f.date && isDateMatchingQuickButton(f.date, 'yesterday')) activeQuickDate.value = 'yesterday'

  if (f.from && f.to) {
    if (isRangeMatchingQuickButton(f.from, f.to, 'week')) activeQuickRange.value = 'week'
    else if (isRangeMatchingQuickButton(f.from, f.to, 'month')) activeQuickRange.value = 'month'
  }

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
</style>
