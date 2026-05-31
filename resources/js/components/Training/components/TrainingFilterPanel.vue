<template>
  <div class="filter-panel">
    <el-row :gutter="8" align="middle">
      <el-col :span="8">
        <el-date-picker v-model="filters.date" type="date" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
                        placeholder="Дата" size="small" clearable :shortcuts="DATE_SHORTCUTS" @change="filters.sync" class="w-100" />
      </el-col>
      <el-col :span="10">
        <el-select v-model="filters.exerciseId" placeholder="Упражнение" size="small" clearable filterable
                   @change="filters.sync" class="w-100">
          <el-option label="Все" value="all" />
          <el-option v-for="ex in exerciseOptions" :key="ex.id" :label="ex.name" :value="ex.id" />
          <template #empty>
            <div class="empty-select"><el-icon><InfoFilled /></el-icon><span>Нет записей за период</span></div>
          </template>
        </el-select>
      </el-col>
      <el-col :span="6" class="text-right">
        <el-button size="small" plain @click="filters.clearAll" title="Сбросить">
          <el-icon><RefreshRight /></el-icon>
        </el-button>
      </el-col>
    </el-row>
    <div class="quick-actions">
      <el-button v-for="b in QUICK_DATES" :key="b.id"
                 :type="filters.activeQuickDate === b.id ? 'primary' : 'default'"
                 plain size="small" class="btn-quick" @click="filters.setQuickDate(b.id)">{{ b.label }}</el-button>
    </div>
    <div class="quick-actions mt-4">
      <el-button v-for="b in QUICK_RANGES" :key="b.id"
                 :type="filters.activeQuickRange === b.id ? 'primary' : 'default'"
                 plain size="small" class="btn-quick" @click="filters.setQuickRange(b.id)">{{ b.label }}</el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { InfoFilled, RefreshRight } from '@element-plus/icons-vue'
import { useTrainingLogStore } from '@/components/Training/stores/trainingLogStore.js'
import { useExerciseStore } from '@/components/Training/stores/exerciseStore.js'
import { useTrainingFilters } from '../composables/useTrainingFilters.js'
import { QUICK_DATES, QUICK_RANGES, DATE_SHORTCUTS } from '../config/filterConfig.js'

const logStore = useTrainingLogStore()
const exerciseStore = useExerciseStore()
const filters = useTrainingFilters(logStore)

const exerciseOptions = computed(() => {
  if (!exerciseStore.exercises.length) return []
  if (!logStore.dateFilter) return exerciseStore.exercises
  const used = new Set(logStore.logs.map(l => l.exercise_id))
  return exerciseStore.exercises.filter(ex => used.has(ex.id))
})
</script>

<style scoped>
.filter-panel { padding: 4px 0; }
.w-100 { width: 100%; } .text-right { text-align: right; } .mt-4 { margin-top: 4px; }
.quick-actions { display: flex; gap: 4px; padding-left: 2px; }
.btn-quick { flex: 1; min-width: 0; padding: 0 6px; font-size: 10px; height: 22px; justify-content: center; }
.empty-select { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 0; color: #909399; font-size: 10px; }
:deep(.el-date-editor), :deep(.el-select) { width: 100%; }
</style>
