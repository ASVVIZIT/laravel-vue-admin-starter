<template>
  <div class="training-dashboard">
    <div class="dashboard-header">
      <h2 class="page-title">
        <el-icon><Trophy /></el-icon>
        Мои тренировки
      </h2>
      <div class="header-actions">
        <el-button type="primary" size="small" @click="showForm = !showForm">
          <el-icon><EditPen /></el-icon> {{ showForm ? 'Скрыть форму' : 'Добавить запись' }}
        </el-button>
        <el-button size="small" @click="refreshData" :loading="loading">
          <el-icon><Refresh /></el-icon> Обновить
        </el-button>
      </div>
    </div>

    <!-- Статистика -->
    <el-row :gutter="12" class="stats-row">
      <!-- Карточка: Сегодня -->
      <el-col :span="6">
        <StatsCard
            v-if="summary"
            title="Сегодня"
            :stats="{
            sessions: { label: 'Тренировки', value: summary.today?.sessions || 0, color: '#409eff' },
            reps: { label: 'Повторы', value: summary.today?.reps || 0, color: '#67c23a' }
          }"
        />
      </el-col>
      <!-- Карточка: Неделя -->
      <el-col :span="6">
        <StatsCard
            v-if="summary"
            title="За неделю"
            :stats="{
            sessions: { label: 'Сессии', value: summary.week?.sessions || 0, color: '#909399' },
            activeDays: { label: 'Дней', value: summary.week?.active_days || 0, color: '#e6a23c' }
          }"
        />
      </el-col>
      <!-- Карточка: Серия -->
      <el-col :span="6">
        <StatsCard
            v-if="summary"
            title="Серия"
            :stats="{
            streak: { label: 'Дней подряд', value: summary.streak || 0, color: '#f56c6c' }
          }"
            footer="Не прерывайте цепочку 🔥"
        />
      </el-col>
      <!-- Карточка: Объём -->
      <el-col :span="6">
        <StatsCard
            v-if="stats"
            title="Общий объём"
            :stats="{
            volume: { label: 'Тоннаж', value: stats.total_volume || 0, color: '#67c23a' },
            totalReps: { label: 'Повторы', value: stats.total_reps || 0, color: '#409eff' }
          }"
        />
      </el-col>
    </el-row>

    <!-- Форма -->
    <transition name="slide-down">
      <div v-if="showForm" class="form-section">
        <TrainingLogForm :key="formKey" :log-id="editingLog?.id" :initial-data="editingLog" @saved="onFormSaved" @deleted="onFormDeleted" />
      </div>
    </transition>

    <!-- Таблица -->
    <div v-if="loading" class="loading-wrapper">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>Загрузка...</span>
    </div>
    <div v-else class="table-section">
      <TrainingLogTable @edit="handleEditLog" @deleted="onLogDeleted" />
    </div>

    <LayoutDebugWrapper v-if="debugMode" :is-open="debugPanelOpen" title="Отладка" position="right" width="280px" @close="debugPanelOpen = false">
      <template #content>
        <div class="debug-content">
          <div class="debug-row"><span>Logs:</span><strong>{{ logs.length }}</strong></div>
          <div class="debug-row"><span>Summary:</span><span>{{ summary ? 'OK' : 'Null' }}</span></div>
          <div class="debug-row"><span>Stats:</span><span>{{ stats ? 'OK' : 'Null' }}</span></div>
        </div>
      </template>
    </LayoutDebugWrapper>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Trophy, EditPen, Refresh, Loading, WarningFilled } from '@element-plus/icons-vue'

import { useTrainingLogStore } from '@/components/Training/stores/trainingLogStore.js'
import { useExerciseStore } from '@/components/Training/stores/exerciseStore.js'
import { useInterfaceStore } from '@/components/SmartLight/stores/smartlight/interfaceStore.js'

import StatsCard from '@/components/Training/components/StatsCard.vue'
import TrainingLogForm from '@/components/Training/components/TrainingLogForm.vue'
import TrainingLogTable from '@/components/Training/components/TrainingLogTable.vue'
import LayoutDebugWrapper from '@/components/SmartLight/components/layout/wrappers/LayoutDebugWrapper.vue'

const logStore = useTrainingLogStore()
const exerciseStore = useExerciseStore()
const interfaceStore = useInterfaceStore()

// Пробрасываем реактивные данные напрямую
const logs = computed(() => logStore.logs)
const loading = computed(() => logStore.loading)
const stats = computed(() => logStore.stats)
const summary = computed(() => logStore.summary)

const showForm = ref(false)
const formKey = ref(0)
const editingLog = ref(null)
const debugMode = ref(import.meta.env.DEV)
const debugPanelOpen = ref(false)

onMounted(async () => {
  console.log('Dashboard mounted')
  // Загружаем всё параллельно, чтобы не блокировать UI
  await Promise.allSettled([
    exerciseStore.initExercisesStore(),
    logStore.fetchLogsStore(),
    logStore.fetchStatsStore(),
    logStore.fetchSummaryStore()
  ])
})

const refreshData = async () => {
  await Promise.allSettled([
    logStore.fetchLogsStore(),
    logStore.fetchStatsStore(),
    logStore.fetchSummaryStore()
  ])
  ElMessage.success('Данные обновлены')
}

const onFormSaved = () => { showForm.value = false; editingLog.value = null; formKey.value++; refreshData(); }
const onFormDeleted = () => { editingLog.value = null; formKey.value++; refreshData(); }
const handleEditLog = (log) => { editingLog.value = log; showForm.value = true; }
const onLogDeleted = () => { refreshData(); }
</script>

<style scoped>
.training-dashboard {
  padding: 12px;
  font-size: 12px;
  min-height: 100%;
  background: #f5f7fa;
  box-sizing: border-box;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 12px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.page-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.page-title .el-icon {
  color: #f59e0b;
  font-size: 18px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.stats-row {
  margin-bottom: 16px;
}

.form-section {
  margin-bottom: 16px;
  animation: slideDown 0.25s ease;
}

.table-section {
  margin-top: 8px;
}

.loading-wrapper,
.error-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #909399;
  gap: 8px;
  background: #fff;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}

.error-wrapper {
  color: #f56c6c;
}

.debug-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 11px;
  padding: 8px;
}

.debug-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  border-bottom: 1px dashed #ebeef5;
}

.debug-row:last-child {
  border-bottom: none;
}

.debug-row strong {
  color: #409eff;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.25s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 768px) {
  .training-dashboard { padding: 8px; }
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 8px 12px;
  }
  .header-actions { width: 100%; justify-content: flex-end; }
  .stats-row > .el-col { margin-bottom: 8px; }
  .page-title { font-size: 14px; }
  .page-title .el-icon { font-size: 16px; }
}

@media (max-width: 480px) {
  .stats-row { display: flex; flex-direction: column; }
  .stats-row > .el-col { width: 100% !important; margin-bottom: 8px; }
}
</style>
