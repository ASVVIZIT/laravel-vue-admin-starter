<template>
  <div class="training-dashboard">
    <TrainingDashboardHeader
        :summary="summary"
        :stats="stats"
        :loading="logStore.loading"
        :show-form="showForm"
        @toggle-form="showForm = !showForm"
        @refresh="refreshData"
    />

    <div class="tabs-wrapper">
      <el-tabs v-model="activeTab" type="card" @tab-click="onTabChange">
        <el-tab-pane label="Мои тренировки" name="mine" />
        <el-tab-pane label="Доступные мне" name="shared-with-me" />
        <el-tab-pane label="Я поделился" name="shared-by-me" />
      </el-tabs>
    </div>

    <div class="filter-wrapper">
      <TrainingFilterBar />
    </div>

    <main class="dashboard-main">
      <div v-if="logStore.loading" class="state-container">
        <el-skeleton :rows="8" animated />
      </div>

      <el-empty v-else-if="!logs.length" :description="emptyDescription" class="state-container">
        <el-button v-if="activeTab === 'mine'" type="primary" @click="showForm = true">
          <el-icon><Plus /></el-icon> Добавить запись
        </el-button>
        <el-button v-else type="info" @click="logStore.setActiveTab('mine')">
          Перейти к моим записям
        </el-button>
      </el-empty>

      <template v-else>
        <div class="table-wrapper">
          <TrainingLogTable
              :logs="logs"
              :loading="logStore.loading"
              :active-tab="activeTab"
              :current-user-id="currentUserId"
              @edit="handleEdit"
              @delete="handleDelete"
              @page-change="handlePageChange"
              @per-page-change="handlePerPageChange"
          />
        </div>
        <div class="pagination-wrapper" v-if="pagination.total > pagination.per_page">
          <el-pagination
              v-model:current-page="pagination.page"
              :page-size="pagination.per_page"
              :total="pagination.total"
              :page-sizes="[20, 50, 100]"
              layout="total, sizes, prev, pager, next"
              size="small"
              background
              @current-change="handlePageChange"
              class="pagination"
          />
        </div>
      </template>
    </main>

    <el-dialog
        v-model="showForm"
        :title="isEdit ? 'Редактирование' : 'Новая запись'"
        width="900px"
        destroy-on-close
    >
      <TrainingLogForm
          :log-id="currentLogId"
          :initial-data="currentLogData"
          @saved="handleSaved"
          @deleted="handleDeleted"
          @cancelled="showForm = false"
      />
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

const currentUserId = computed(() => {
  if (typeof window !== 'undefined' && window.__CURRENT_USER_ID) {
    return window.__CURRENT_USER_ID
  }
  return 1
})

const activeTab = computed({
  get: () => logStore.activeTab,
  set: (val) => logStore.setActiveTab(val)
})

const isEdit = computed(() => !!currentLogId.value)
const logs = computed(() => logStore.logs || [])
const pagination = computed(() => logStore.pagination)
const stats = computed(() => logStore.stats || {})
const summary = computed(() => logStore.summary || {})

const emptyDescription = computed(() => {
  switch (activeTab.value) {
    case 'shared-with-me':
      return 'Вам ещё не расшарили ни одной тренировки'
    case 'shared-by-me':
      return 'Вы ещё не поделились ни одной записью'
    default:
      return 'Записей не найдено'
  }
})

const refreshData = () => logStore.refreshCurrentTab({})
const handlePageChange = (page) => logStore.setPage(page)
const handlePerPageChange = (size) => logStore.setPerPage(size)

const onTabChange = () => {
  refreshData()
}

const handleEdit = (log) => {
  currentLogId.value = log.id
  currentLogData.value = { ...log }
  showForm.value = true
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('Удалить?', 'Подтверждение', { type: 'warning' })
    await logStore.deleteLog(id)
    ElMessage.success('Удалено')
  } catch {}
}

const handleSaved = () => {
  showForm.value = false
  ElMessage.success('Сохранено')
  refreshData()
}

const handleDeleted = () => {
  showForm.value = false
  ElMessage.success('Удалено')
  refreshData()
}

onMounted(async () => {
  try {
    await logStore.refreshCurrentTab({})
  } catch (err) {
    console.error('Initial logs fetch failed:', err)
    logStore.loading = false
  }
  exerciseStore.fetchExercisesStore().catch(err => console.warn('Exercises fetch skipped:', err))
})
</script>

<style scoped>
.training-dashboard {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f7fa;
}
.tabs-wrapper {
  background: #fff;
  border-bottom: 1px solid #ebeef5;
  flex-shrink: 0;
  padding: 0 16px;
}
:deep(.el-tabs__nav) {
  border: none !important;
}
:deep(.el-tabs__item) {
  font-size: 12px;
  padding: 0 16px !important;
}
.filter-wrapper {
  background: #fff;
  border-bottom: 1px solid #ebeef5;
  flex-shrink: 0;
}
.dashboard-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 16px;
  gap: 16px;
}
.state-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: #fff;
  border-radius: 8px;
}
.table-wrapper {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  overflow: auto;
}
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding: 12px 0;
}
:deep(.el-pagination__sizes) {
  min-width: 115px !important;
}
:deep(.el-select-dropdown) {
  z-index: 2100 !important;
}
:deep(.el-table) {
  font-size: 12px;
}
:deep(.el-table .cell) {
  padding: 4px 8px;
}
</style>
