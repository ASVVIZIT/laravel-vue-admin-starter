<template>
  <div class="filter-bar">
    <!-- 🟦 СТРОКА 1: Основные виджеты + Сброс + Тоггл -->
    <div class="filter-row-main">
      <!-- Мастер-тоггл (показываем всегда, но скрываем иконку на больших экранах) -->
      <el-button
          class="master-toggle"
          text
          size="small"
          @click="showExtras = !showExtras"
          :title="showExtras ? 'Скрыть доп. кнопки' : 'Показать доп. кнопки'"
      >
        <el-icon><ArrowDown v-if="!showExtras" /><ArrowUp v-else /></el-icon>
      </el-button>

      <!-- Колонка: Дата -->
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

      <!-- Колонка: Упражнение -->
      <div class="filter-col col-select">
        <el-select
            v-model="localExerciseId"
            placeholder="Упражнение"
            size="small"
            clearable
            filterable
            @change="onExerciseChange"
            class="w-100"
        >
          <el-option label="Все упражнения" value="all" />
          <el-option v-for="ex in exerciseOptions" :key="ex.id" :label="ex.name" :value="ex.id" />
        </el-select>
      </div>

      <!-- Колонка: Диапазон (растягивается) -->
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

      <!-- Колонка: Сброс (фиксированная) -->
      <div class="filter-col col-reset">
        <el-button type="danger" plain size="small" @click="clearAll" class="reset-btn-inline">
          <el-icon><RefreshRight /></el-icon>
          <span>Сбросить</span>
        </el-button>
      </div>
    </div>

    <!-- 🟨 СТРОКА 2: Быстрые кнопки + Хинт -->
    <div class="filter-row-extras" v-show="showExtras || !isSmallScreen">
      <!-- Пустое место под тоггл -->
      <div class="filter-col spacer-col"></div>

      <div class="filter-col col-date">
        <div class="quick-btns-row">
          <el-button
              v-for="b in config.date.quickButtons"
              :key="b.id"
              :type="activeQuickDate === b.id ? 'primary' : 'default'"
              plain
              size="small"
              class="btn-quick"
              @click="handleQuickDate(b.id)"
          >
            {{ b.label }}
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
              v-for="b in config.range.quickButtons"
              :key="b.id"
              :type="activeQuickRange === b.id ? 'primary' : 'default'"
              plain
              size="small"
              class="btn-quick"
              @click="handleQuickRange(b.id)"
          >
            {{ b.label }}
          </el-button>
        </div>
      </div>

      <div class="filter-col col-reset spacer-col"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RefreshRight, ArrowDown, ArrowUp } from '@element-plus/icons-vue'
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
const allExercises = ref([])

// Адаптивность
const isSmallScreen = ref(window.innerWidth <= 900)
const showExtras = ref(true) // 🔥 Изначально открыто

// Динамические вычисления
const exerciseOptions = computed(() => {
  if (!allExercises.value.length) return []
  if (!logStore.dateFilter && !logStore.dateRange.from) return allExercises.value
  const usedIds = new Set(logStore.logs.map(l => l.exercise_id))
  return allExercises.value.filter(ex => usedIds.has(ex.id))
})

const exerciseHint = computed(() => {
  if (!localExerciseId.value) return config.exercise.hint.none
  if (!logStore.dateFilter && !logStore.dateRange.from) return config.exercise.hint.all
  const base = config.exercise.hint.filtered
  return { ...base, text: `${base.text} (${exerciseOptions.value.length})` }
})

// Инициализация
onMounted(async () => {
  if (allExercises.value.length === 0) {
    await exerciseStore.fetchExercisesStore()
    allExercises.value = exerciseStore.exercises || []
  }
  localDate.value = logStore.dateFilter
  localExerciseId.value = logStore.exerciseFilter
  localRange.value = [logStore.dateRange.from, logStore.dateRange.to].filter(Boolean)

  if (logStore.dateFilter) showExtras.value = true
  if (logStore.dateRange.from) showExtras.value = true

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => window.removeEventListener('resize', handleResize))

const handleResize = () => {
  const small = window.innerWidth <= 900
  isSmallScreen.value = small
  if (!small) showExtras.value = true
}

// Логика действий
const apply = async (params) => await logStore.applyFilters(params)

const onDateChange = async (val) => {
  activeQuickRange.value = null; localRange.value = []; showExtras.value = true
  await apply({ date: val, from: null, to: null })
}
const onDateClear = async () => {
  activeQuickRange.value = null; localDate.value = null; showExtras.value = false
  await apply({ date: null, from: null, to: null })
}
const onRangeChange = async (val) => {
  activeQuickDate.value = null; localDate.value = null; showExtras.value = true
  await apply({ date: null, from: val?.[0] || null, to: val?.[1] || null })
}
const onRangeClear = async () => {
  localRange.value = []; showExtras.value = false
  await apply({ date: null, from: null, to: null })
}
const onExerciseChange = (val) => { apply({ exercise_id: val === 'all' ? null : val }) }

const handleQuickDate = async (type) => {
  activeQuickRange.value = null; activeQuickDate.value = type; localRange.value = []; showExtras.value = true
  const d = new Date(); if (type === 'yesterday') d.setDate(d.getDate() - 1); if (type === 'tomorrow') d.setDate(d.getDate() + 1)
  localDate.value = d.toISOString().split('T')[0]; await apply({ date: localDate.value, from: null, to: null })
}

const handleQuickRange = async (type) => {
  activeQuickDate.value = null; activeQuickRange.value = type; localDate.value = null; showExtras.value = true
  const now = new Date(); let start = new Date()
  switch (type) {
    case 'week': start.setDate(now.getDate() - (now.getDay() || 7) + 1); break
    case 'month': start = new Date(now.getFullYear(), now.getMonth(), 1); break
    case 'quarter': { const q = Math.floor(now.getMonth() / 3); start = new Date(now.getFullYear(), q * 3, 1); break }
    case 'halfyear': { const h = now.getMonth() >= 6 ? 6 : 0; start = new Date(now.getFullYear(), h, 1); break }
  }
  const fmt = d => d.toISOString().split('T')[0]
  localRange.value = [fmt(start), fmt(now)]; await apply({ date: null, from: fmt(start), to: fmt(now) })
}

const clearAll = async () => {
  localDate.value = null; localRange.value = []; localExerciseId.value = null
  activeQuickDate.value = null; activeQuickRange.value = null
  showExtras.value = false
  await logStore.clearFilters()
}
</script>

<style scoped>
/* ============================================================================
   ОСНОВНОЙ КОНТЕЙНЕР
   ============================================================================ */
.filter-bar {
  padding: 8px 12px;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
  box-sizing: border-box;
  width: 100%;
}
.w-100 { width: 100%; }

/* 🔥 ЧИСТАЯ FLEX-СЕТКА */
.filter-row-main, .filter-row-extras {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 6px;
  width: 100%;
  flex-wrap: nowrap;
}
.filter-row-extras { transition: all 0.2s ease; }

/* ============================================================================
   КОЛОНКИ
   ============================================================================ */
.filter-col { flex: 1; min-width: 0; }
.col-date { flex: 0 0 22%; min-width: 140px; }
.col-select { flex: 0 0 26%; min-width: 160px; }
.col-range { flex: 1; min-width: 200px; }
.col-reset {
  flex: 0 0 90px !important;
  min-width: 90px !important;
  margin-left: 4px;
  flex-shrink: 0;
}

/* 🔥 КНОПКА ТОГГЛА: всегда видима */
.master-toggle {
  display: flex !important; /* 🔥 Принудительно показываем */
  flex: 0 0 32px;
  width: 32px;
  height: 28px !important;
  padding: 0 !important;
  align-items: center;
  justify-content: center;
  color: #909399;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  cursor: pointer;
  transition: all 0.2s;
}
.master-toggle:hover {
  color: #409eff;
  background-color: #ecf5ff;
  border-color: #c6e2ff;
}

/* Спейсер (для второй строки) */
.spacer-col {
  flex: 0 0 32px;
  min-width: 32px;
}

/* ============================================================================
   ИНПУТЫ
   ============================================================================ */
:deep(.el-date-editor),
:deep(.el-range-editor),
:deep(.el-select) {
  width: 100% !important;
  min-width: 80px !important;
}
:deep(.el-date-editor .el-input__wrapper),
:deep(.el-range-editor .el-input__wrapper),
:deep(.el-select .el-input__wrapper) {
  width: 100% !important;
}

:deep(.el-input__wrapper),
:deep(.el-range-editor.el-input__wrapper),
:deep(.el-select__wrapper),
.reset-btn-inline {
  height: 28px !important;
  min-height: 28px !important;
  padding: 0 8px !important;
  box-shadow: 0 0 0 1px #dcdfe6 inset !important;
  border-radius: 4px;
}

.reset-btn-inline {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 11px;
  border-color: #fbc4c4;
  color: #f56c6c;
  background-color: #fef0f0;
}
.reset-btn-inline:hover { background-color: #fde2e2; border-color: #f5a3a3; color: #f56c6c; }

/* ============================================================================
   ВТОРАЯ СТРОКА
   ============================================================================ */
.quick-btns-row { display: flex; gap: 4px; flex-wrap: wrap; width: 100%; }
.quick-btns-row .el-button {
  flex: 1; min-width: 45px; padding: 0 4px; font-size: 10px; height: 24px;
  justify-content: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.hint-container { display: flex; align-items: center; gap: 4px; height: 24px; font-size: 10px; color: #909399; width: 100%; }
.hint-icon { width: 1rem; height: 1rem; font-size: 12px; color: #409eff; }

:deep(.el-range-input) { height: 26px !important; font-size: 12px; }
:deep(.el-range__icon) { line-height: 26px !important; }

/* ============================================================================
   АДАПТИВНОСТЬ
   ============================================================================ */
@media (max-width: 900px) {
  .filter-bar { padding: 6px 8px; }
  .filter-row-main, .filter-row-extras { gap: 8px; }

  .col-date { flex: 0 0 20%; min-width: 110px; }
  .col-select { flex: 0 0 24%; min-width: 130px; }
  .col-range { flex: 1; min-width: 150px; }
  .col-reset {
    flex: 0 0 34px !important;
    min-width: 34px !important;
    margin-left: 2px;
  }
  .reset-btn-inline span { display: none; }

  .quick-btns-row { gap: 3px; }
  .quick-btns-row .el-button { height: 22px; font-size: 9px; padding: 0 2px; }
  .hint-container { font-size: 9px; height: 22px; }
  .hint-icon { width: 0.9rem; height: 0.9rem; font-size: 11px; }
}

@media (max-width: 550px) {
  .filter-bar { padding: 4px 4px; }
  .filter-row-main, .filter-row-extras { gap: 4px; }

  .col-date { min-width: 95px; }
  .col-select { min-width: 105px; }
  .col-range { min-width: 120px; }

  .quick-btns-row { gap: 2px; }
  .quick-btns-row .el-button { min-width: 35px; height: 20px; font-size: 8px; padding: 0 1px; }
  .hint-container { font-size: 8px; height: 20px; gap: 2px; }
  .hint-icon { width: 0.75rem; height: 0.75rem; font-size: 10px; }
}
</style>
