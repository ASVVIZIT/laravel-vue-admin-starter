<template>
  <div class="training-dashboard">
    <TrainingDashboardHeader
        :summary="summary" :stats="stats" :loading="logStore.loading" :show-form="showForm"
        @toggle-form="showForm = !showForm" @refresh="refreshData"
    />

    <div class="filter-wrapper"><TrainingFilterBar /></div>

    <main class="dashboard-main">
      <!--  ИСПРАВЛЕНО: Явная проверка loading + данных -->
      <div v-if="logStore.loading" class="state-container">
        <el-skeleton :rows="8" animated />
      </div>

      <el-empty v-else-if="!logs.length" description="Записей не найдено" class="state-container">
        <el-button type="primary" @click="showForm = true">
          <el-icon><Plus /></el-icon> Добавить запись
        </el-button>
      </el-empty>

      <template v-else>
        <div class="table-wrapper">
          <TrainingLogTable :logs="logs" :loading="logStore.loading" @edit="handleEdit" @delete="handleDelete" />
        </div>
        <div class="pagination-wrapper" v-if="pagination.total > pagination.per_page">
          <el-pagination
              v-model:current-page="pagination.page"
              :page-size="pagination.per_page"
              :total="pagination.total"
              layout="total, prev, pager, next"
              @current-change="handlePageChange"
              class="pagination"
          />
        </div>
      </template>
    </main>

    <el-dialog v-model="showForm" :title="isEdit ? 'Редактирование' : 'Новая запись'" width="900px" destroy-on-close>
      <TrainingLogForm :log-id="currentLogId" :initial-data="currentLogData"
                       @saved="handleSaved" @deleted="handleDeleted" @cancelled="showForm = false" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

import { useTrainingLogStore } from '@/components/Training/stores/trainingLogStore.js'
import { useExerciseStore } from '@/components/Training/stores/exerciseStore.js'
import TrainingDashboardHeader from '@/components/Training/components/TrainingDashboardHeader.vue'
import TrainingFilterBar from '@/components/Training/components/TrainingFilterBar.vue'
import TrainingLogTable from '@/components/Training/components/TrainingLogTable.vue'
import TrainingLogForm from '@/components/Training/components/TrainingLogForm.vue'

const logStore = useTrainingLogStore()
const exerciseStore = useExerciseStore()

const showForm = ref(false)
const currentLogId = ref(null)
const currentLogData = ref(null)

const isEdit = computed(() => !!currentLogId.value)
const logs = computed(() => logStore.logs || [])
const pagination = computed(() => logStore.pagination)
const stats = computed(() => logStore.stats || {})
const summary = computed(() => logStore.summary || {})

const refreshData = () => logStore.applyFilters({})
const handlePageChange = (page) => logStore.setPage(page)

const handleEdit = (log) => { currentLogId.value = log.id; currentLogData.value = { ...log }; showForm.value = true }
const handleDelete = async (id) => {
  try { await ElMessageBox.confirm('Удалить?', 'Подтверждение', { type: 'warning' }); await logStore.deleteLog(id); ElMessage.success('Удалено') } catch {}
}
const handleSaved = () => { showForm.value = false; ElMessage.success('Сохранено'); refreshData() }
const handleDeleted = () => { showForm.value = false; ElMessage.success('Удалено'); refreshData() }

// 🔥 ИСПРАВЛЕНО: Изолированная, безопасная инициализация
onMounted(async () => {
  console.log('🚀 Dashboard mounted')

  // 1️⃣ КРИТИЧНО: Грузим логи первым делом. Ошибка не должна блокировать UI.
  try {
    await logStore.applyFilters({})
  } catch (err) {
    console.error('❌ Initial logs fetch failed:', err)
    logStore.loading = false
  }

  // 2️⃣ Упражнения грузим фоном. Если упадут — фильтры всё равно покажут "Все"
  exerciseStore.fetchExercises().catch(err => console.warn('⚠️ Exercises fetch skipped:', err))
})
</script>

<style scoped>
.training-dashboard { display: flex; flex-direction: column; height: 100%; background: #f5f7fa; }
.filter-wrapper { background: #fff; border-bottom: 1px solid #ebeef5; flex-shrink: 0; }
.dashboard-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; padding: 16px; gap: 16px; }
.state-container { display: flex; align-items: center; justify-content: center; min-height: 400px; background: #fff; border-radius: 8px; }
.table-wrapper { flex: 1; background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); overflow: auto; }
.pagination-wrapper { display: flex; justify-content: flex-end; padding: 12px 0; }
</style>
