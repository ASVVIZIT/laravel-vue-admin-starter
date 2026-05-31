<template>
  <div class="training-log-view">
    <div class="view-header">
      <h2 class="page-title">
        <el-icon><EditPen /></el-icon>
        {{ isEditMode ? 'Редактировать запись' : 'Новая тренировка' }}
      </h2>
      <el-button size="small" @click="handleBack">
        <el-icon><ArrowLeft /></el-icon> Назад
      </el-button>
    </div>

    <TrainingLogForm
        :key="formKey"
        :log-id="logId"
        :initial-data="initialData"
        @saved="onSaved"
        @deleted="onDeleted"
        @cancelled="handleBack"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { EditPen, ArrowLeft } from '@element-plus/icons-vue'

import TrainingLogForm from '@/components/Training/components/TrainingLogForm.vue'
import { useTrainingStore } from '@/components/Training/stores/index.js'

const route = useRoute()
const router = useRouter()
const trainingStore = useTrainingStore()

const formKey = ref(0)
const logId = computed(() => route.params.logId || null)
const isEditMode = computed(() => !!logId.value)

const initialData = ref(null)

onMounted(async () => {
  if (isEditMode.value && logId.value) {
    try {
      await trainingStore.fetchLogsStore({ all: 1 })
      const log = trainingStore.logs.find(l => l.id == logId.value)
      if (log) {
        initialData.value = {
          exercise_id: log.exercise_id,
          date: log.date,
          time: log.time,
          sets: log.sets,
          is_public: log.is_public,
          shared_with: log.shared_with || [],
          notes: log.notes,
          rating: log.rating
        }
      } else {
        ElMessage.warning('Запись не найдена')
        handleBack()
      }
    } catch (e) {
      console.error('[LogView] Load error:', e)
      ElMessage.error('Ошибка загрузки записи')
      handleBack()
    }
  }
})

const handleBack = () => {
  router.push({ name: 'TrainingDashboard' })
}

const onSaved = () => {
  ElMessage.success(isEditMode.value ? 'Запись обновлена' : 'Запись создана')
  router.push({ name: 'TrainingDashboard' })
}

const onDeleted = () => {
  ElMessage.success('Запись удалена')
  router.push({ name: 'TrainingDashboard' })
}
</script>

<style scoped>
.training-log-view {
  padding: 12px;
  font-size: 12px;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0 16px;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 16px;
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
  color: #409eff;
  font-size: 18px;
}

@media (max-width: 768px) {
  .view-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
