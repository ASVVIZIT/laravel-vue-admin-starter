<template>
  <div class="training-shared-view">
    <div class="view-header">
      <h2 class="page-title">
        <el-icon><Share /></el-icon>
        Тренировки пользователя #{{ userId }}
      </h2>
      <el-button size="small" @click="handleBack">
        <el-icon><ArrowLeft /></el-icon> Назад
      </el-button>
    </div>

    <div v-if="loading" class="loading-state">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>Загрузка...</span>
    </div>

    <div v-else-if="error" class="error-state">
      <el-icon><WarningFilled /></el-icon>
      <span>{{ error }}</span>
      <el-button size="small" type="primary" @click="fetchShared">Повтор</el-button>
    </div>

    <div v-else-if="!logs.length" class="empty-state">
      <el-icon><InfoFilled /></el-icon>
      <p>Нет публичных записей</p>
      <span class="hint">Пользователь ещё не делился тренировками</span>
    </div>

    <TrainingLogTable
        v-else
        :logs="logs"
        :current-user-id="currentUserId"
        :readonly="true"
        hide-actions
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Share, ArrowLeft, Loading, WarningFilled, InfoFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { TrainingLogResource } from '@/components/Training/api/core/resource/TrainingLogResource.js'
import TrainingLogTable from '@/components/Training/components/TrainingLogTable.vue'

const route = useRoute()
const router = useRouter()

const userId = ref(route.params.user || null)
const loading = ref(false)
const error = ref(null)
const logs = ref([])

const currentUserId = computed(() => {
  if (typeof window !== 'undefined' && window.__CURRENT_USER_ID) {
    return window.__CURRENT_USER_ID
  }
  return 1
})

onMounted(() => {
  if (userId.value) {
    fetchShared()
  } else {
    error.value = 'Пользователь не указан'
  }
})

const fetchShared = async () => {
  if (!userId.value) return
  loading.value = true
  error.value = null
  try {
    const response = await new TrainingLogResource().getBase(`/users/${userId.value}/shared`)
    logs.value = response?.data || response || []
  } catch (e) {
    console.error('[SharedView] Error:', e)
    error.value = e.message || 'Не удалось загрузить данные'
    ElMessage.error(error.value)
  } finally {
    loading.value = false
  }
}

const handleBack = () => {
  router.push({ name: 'TrainingDashboard' })
}
</script>

<style scoped>
.training-shared-view { padding: 12px; font-size: 12px; }
.view-header { display: flex; justify-content: space-between; align-items: center; padding: 8px 0 16px; border-bottom: 1px solid #ebeef5; margin-bottom: 16px; }
.page-title { display: flex; align-items: center; gap: 8px; margin: 0; font-size: 16px; font-weight: 600; color: #303133; }
.page-title .el-icon { color: #409eff; font-size: 18px; }
.loading-state, .error-state, .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 0; color: #909399; gap: 12px; text-align: center; }
.error-state { color: #f56c6c; }
.error-state .el-button { margin-top: 8px; }
.empty-state .hint { font-size: 11px; color: #606266; }
@media (max-width: 768px) { .view-header { flex-direction: column; align-items: flex-start; gap: 8px; } }
</style>
