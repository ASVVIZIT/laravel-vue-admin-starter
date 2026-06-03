<template>
  <div class="training-stats-view">
    <div class="view-header">
      <h2 class="page-title">
        <el-icon><TrendCharts /></el-icon>
        Статистика тренировок
      </h2>
      <div class="header-controls">
        <el-select v-model="period" size="small" @change="fetchStats">
          <el-option label="Неделя" value="week" />
          <el-option label="Месяц" value="month" />
          <el-option label="Год" value="year" />
          <el-option label="Все время" value="all" />
        </el-select>
        <el-select v-model="exerciseFilter" size="small" clearable @change="fetchStats">
          <el-option label="Все упражнения" :value="null" />
          <el-option
              v-for="ex in exercises"
              :key="ex.id"
              :label="ex.name"
              :value="ex.id"
          />
        </el-select>
      </div>
    </div>

    <!-- Карточки статистики -->
    <el-row :gutter="12" class="stats-cards">
      <el-col :span="6" :xs="12">
        <StatsCard
            title="Тренировки"
            :stats="{
            count: { label: 'Всего', value: statsData.total_sessions, color: '#409eff' },
            active: { label: 'Активных дней', value: statsData.active_days, color: '#67c23a' }
          }"
        />
      </el-col>
      <el-col :span="6" :xs="12">
        <StatsCard
            title="Объём"
            :stats="{
            sets: { label: 'Подходы', value: statsData.total_sets, format: 'number', color: '#909399' },
            reps: { label: 'Повторы', value: statsData.total_reps, format: 'number', color: '#e6a23c' }
          }"
        />
      </el-col>
      <el-col :span="6" :xs="12">
        <StatsCard
            title="Тоннаж"
            :stats="{
            volume: { label: 'Суммарный', value: statsData.total_volume, format: 'volume', color: '#f56c6c' }
          }"
        />
      </el-col>
      <el-col :span="6" :xs="12">
        <StatsCard
            title="Период"
            :stats="{
            from: { label: 'С', value: statsPeriod.from, format: 'date', color: '#606266' },
            to: { label: 'По', value: statsPeriod.to, format: 'date', color: '#606266' }
          }"
        />
      </el-col>
    </el-row>

    <!-- График (заглушка) -->
    <LayoutCardWrapper title="Динамика" :icon="DataLine" bordered shadow class="chart-card">
      <div class="chart-placeholder">
        <el-icon><Odometer /></el-icon>
        <p>График будет добавлен в следующей версии</p>
        <span class="hint">Данные: {{ statsData.total_reps }} повторов за период</span>
      </div>
    </LayoutCardWrapper>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { TrendCharts, DataLine, Odometer } from '@element-plus/icons-vue'
import { useTrainingLogStore } from '@/components/Training/stores/trainingLogStore.js'
import { useExerciseStore } from '@/components/Training/stores/exerciseStore.js'
import StatsCard from '@/components/Training/components/StatsCard.vue'
import LayoutCardWrapper from '@/components/Training/components/layout/wrappers/LayoutCardWrapper.vue'
import { formatDate, formatVolume } from '@/components/Training/utils/appFormattersUtils.js'

const logStore = useTrainingLogStore()
const exerciseStore = useExerciseStore()

const period = ref('week')
const exerciseFilter = ref(null)

const statsData = computed(() => logStore.stats?.data || {})
const statsPeriod = computed(() => ({
  from: formatDate(logStore.stats?.from),
  to: formatDate(logStore.stats?.to)
}))

const exercises = computed(() => exerciseStore.exercises)

onMounted(async () => {
  await Promise.all([
    exerciseStore.fetchExercisesStore(),
    logStore.fetchSummary()
  ])
  await fetchStats()
})

const fetchStats = async () => {
  await logStore.fetchStats()
}
</script>

<style scoped>
.training-stats-view { padding: 12px; font-size: 12px; }
.view-header { display: flex; justify-content: space-between; align-items: center; padding: 8px 0 16px; border-bottom: 1px solid #ebeef5; margin-bottom: 16px; }
.page-title { display: flex; align-items: center; gap: 8px; margin: 0; font-size: 16px; font-weight: 600; color: #303133; }
.page-title .el-icon { color: #409eff; font-size: 18px; }
.header-controls { display: flex; gap: 8px; }
.header-controls .el-select { width: 140px; }
.stats-cards { margin-bottom: 16px; }
.chart-card { margin-top: 8px; }
.chart-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 0; color: #909399; gap: 12px; text-align: center; }
.chart-placeholder .el-icon { font-size: 48px; color: #c0c4cc; }
.chart-placeholder p { margin: 0; font-size: 13px; }
.chart-placeholder .hint { font-size: 11px; color: #606266; }
@media (max-width: 768px) { .view-header { flex-direction: column; align-items: flex-start; gap: 8px; } .header-controls { width: 100%; flex-wrap: wrap; } .header-controls .el-select { width: calc(50% - 4px); } }
</style>
