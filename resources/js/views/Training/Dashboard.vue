<template>
  <div class="training-dashboard">
    <!-- 🟢 ВЕРХНЯЯ ПАНЕЛЬ -->
    <div class="dashboard-header">
      <span class="title">🏆 Мои тренировки</span>

      <div class="stats-bar">
        <span class="pill">
          Сегодня: <b>{{ summary.today?.sessions || 0 }} с. / {{ summary.today?.reps || 0 }} п.</b>
        </span>
        <span class="pill">
          Неделя: <b>{{ summary.week?.sessions || 0 }} / {{ summary.week?.active_days || 0 }} дн.</b>
        </span>
        <span class="pill">
          🔥 <b>{{ summary.streak || 0 }} дн.</b>
        </span>
        <span class="pill">
          Объём: <b>{{ formatVol(stats.data?.total_volume) }}</b>
        </span>
      </div>

      <div class="header-controls">
        <el-button type="primary" size="small" @click="showForm = !showForm">
          <el-icon><EditPen /></el-icon>
          <span class="btn-text">{{ showForm ? 'Скрыть' : 'Добавить' }}</span>
        </el-button>
        <el-button size="small" @click="refreshData" :loading="logStore.loading" title="Обновить">
          <el-icon><Refresh /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 🔍 ФИЛЬТР -->
    <div class="filter-wrapper">
      <TrainingFilterBar />
    </div>

    <!-- 📦 ОСНОВНАЯ ОБЛАСТЬ -->
    <div class="dashboard-main">
      <transition name="slide">
        <div v-if="showForm" class="form-container">
          <TrainingLogForm
              :key="formKey"
              :log-id="editingLog?.id"
              :initial-data="editingLog"
              @saved="onSaved"
              @deleted="onDeleted"
          />
        </div>
      </transition>

      <div v-if="logStore.loading && !logStore.logs.length" class="state-block">
        <el-icon class="is-loading"><Loading /></el-icon> Загрузка...
      </div>

      <div v-else-if="logStore.error" class="state-block error">
        <span>{{ logStore.error }}</span>
        <el-button type="primary" size="small" @click="refreshData">Повторить</el-button>
      </div>

      <div v-else class="table-container">
        <TrainingLogTable @edit="handleEdit" @delete="handleDelete" />
      </div>
    </div>

    <!-- 🗑️ МОДАЛКА УДАЛЕНИЯ -->
    <el-dialog v-model="deleteVisible" title="Удаление" width="320px" :close-on-click-modal="false">
      <p>Удалить запись от <strong>{{ targetLog?.date }}</strong>?</p>
      <template #footer>
        <el-button @click="deleteVisible = false" size="small">Отмена</el-button>
        <el-button type="danger" @click="confirmDelete" :loading="loading" size="small">Удалить</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { EditPen, Refresh, Loading } from '@element-plus/icons-vue'
import { useTrainingLogStore } from '@/components/Training/stores/trainingLogStore.js'
import TrainingFilterBar from '@/components/Training/components/TrainingFilterBar.vue'
import TrainingLogForm from '@/components/Training/components/TrainingLogForm.vue'
import TrainingLogTable from '@/components/Training/components/TrainingLogTable.vue'

const logStore = useTrainingLogStore()

const showForm = ref(false)
const formKey = ref(0)
const editingLog = ref(null)
const deleteVisible = ref(false)
const targetLog = ref(null)
const loading = ref(false)

const stats = computed(() => logStore.stats)
const summary = computed(() => logStore.summary)

// 🔹 РЕЗЕРВНЫЙ РАСЧЁТ ОБЪЁМА (если бэкенд не отдал)
const calculatedVolume = computed(() => {
  if (!logStore.logs?.length) return 0
  return logStore.logs.reduce((total, log) => {
    if (log.exercise?.type !== 'weighted' || !Array.isArray(log.sets)) return total
    return total + log.sets.reduce((sum, set) => {
      return sum + ((Number(set.reps) || 0) * (Number(set.weight) || 0))
    }, 0)
  }, 0)
})

// 🔹 ФОРМАТИРОВАНИЕ С ПРИОРИТЕТОМ: бэкенд > локальный расчёт
const formatVol = (backendValue) => {
  const apiValue = parseFloat(backendValue)
  if (apiValue && apiValue > 0) {
    return apiValue >= 1000 ? `${(apiValue / 1000).toFixed(1)} т` : `${Math.round(apiValue)} кг`
  }
  const local = calculatedVolume.value
  return local >= 1000 ? `${(local / 1000).toFixed(1)} т` : `${Math.round(local)} кг`
}

const refreshData = async () => {
  await Promise.allSettled([
    logStore.fetch(),
    logStore.fetchStats(),
    logStore.fetchSummary()
  ])
}

const onSaved = () => {
  showForm.value = false
  editingLog.value = null
  formKey.value++
  refreshData()
}

const onDeleted = () => {
  editingLog.value = null
  formKey.value++
  refreshData()
}

const handleEdit = (log) => {
  editingLog.value = log
  showForm.value = true
}

const handleDelete = (log) => {
  targetLog.value = log
  deleteVisible.value = true
}

const confirmDelete = async () => {
  if (!targetLog.value) return
  loading.value = true
  try {
    await logStore.deleteLog(targetLog.value.id)
    deleteVisible.value = false
    refreshData()
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await Promise.allSettled([
    logStore.fetch(),
    logStore.fetchStats(),
    logStore.fetchSummary()
  ])
})
</script>

<style scoped>
.training-dashboard {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f7fa;
  font-size: 11px;
  overflow: hidden;
}

.dashboard-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  flex-wrap: wrap;
  min-height: 44px;
}

.title {
  font-weight: 600;
  font-size: 14px;
  color: #303133;
  flex-shrink: 0;
  margin-right: 8px;
}

.stats-bar {
  display: flex;
  gap: 6px;
  flex: 1;
  justify-content: center;
  flex-wrap: wrap;
  min-width: 0;
}

.pill {
  background: #f4f6f8;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 10px;
  white-space: nowrap;
  color: #606266;
}

.pill b {
  color: #409eff;
  margin-left: 4px;
  font-weight: 600;
}

.header-controls {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.header-controls .el-button {
  height: 28px;
  padding: 0 10px;
  font-size: 11px;
}

.btn-text { margin-left: 5px; }
@media (max-width: 600px) { .btn-text { display: none; } }

.filter-wrapper {
  flex-shrink: 1;
  min-width: 0;
  overflow: hidden;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
}

.dashboard-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 6px;
}

.form-container {
  margin-bottom: 6px;
  background: #fff;
  border-radius: 6px;
  padding: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.state-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #ebeef5;
  gap: 10px;
  color: #909399;
}

.state-block.error {
  color: #f56c6c;
  border-color: #fbc4c4;
}

.table-container {
  flex: 1;
  overflow: hidden;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.slide-enter-active, .slide-leave-active { transition: all 0.3s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-10px); }
</style>
