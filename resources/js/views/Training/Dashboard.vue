<template>
  <div class="training-dashboard">
    <!-- 🟢 TOP BAR -->
    <div class="dashboard-top-bar">
      <span class="title">🏆 Мои тренировки</span>
      <div class="stats-bar">
        <span class="pill">Сегодня: <b>{{ summary.today?.sessions || 0 }} с. / {{ summary.today?.reps || 0 }} п.</b></span>
        <span class="pill">Неделя: <b>{{ summary.week?.sessions || 0 }} / {{ summary.week?.active_days || 0 }} дн.</b></span>
        <span class="pill">🔥 <b>{{ summary.streak || 0 }} дн.</b></span>
        <span class="pill">Объём: <b>{{ formatVol(stats.data?.total_volume) }}</b></span>
      </div>
      <div class="controls">
        <el-button type="primary" size="small" @click="showForm = !showForm">
          <el-icon><EditPen /></el-icon> {{ showForm ? 'Скрыть' : 'Добавить' }}
        </el-button>
        <el-button size="small" @click="refreshData" :loading="logStore.loading"><el-icon><Refresh /></el-icon></el-button>
        <el-button size="small" @click="settingsOpen = true"><el-icon><Setting /></el-icon></el-button>
        <el-button size="small" type="warning" @click="toggleDebug"><el-icon><Tools /></el-icon></el-button>
      </div>
    </div>

    <!-- 🔍 ЕДИНЫЙ ФИЛЬТР-БАР -->
    <TrainingFilterBar />

    <div class="dashboard-main">
      <div class="content-wrapper">
        <transition name="slide">
          <div v-if="showForm" class="form-container">
            <TrainingLogForm :key="formKey" :log-id="editingLog?.id" :initial-data="editingLog" @saved="onSaved" @deleted="onDeleted" />
          </div>
        </transition>

        <div v-if="logStore.loading" class="state-block"><el-icon class="is-loading"><Loading /></el-icon> Загрузка...</div>
        <div v-else-if="logStore.error" class="state-block error">
          <span>{{ logStore.error }}</span>
          <el-button type="primary" size="small" @click="refreshData">Повторить</el-button>
        </div>
        <div v-else class="table-container">
          <TrainingLogTable @edit="handleEdit" @delete="handleDelete" />
        </div>
      </div>

      <!-- ⚙️ DRAWER НАСТРОЕК -->
      <TrainingSettingsDrawer :is-open="settingsOpen" @close="settingsOpen = false" @update:volume="showVolume = $event" />
    </div>

    <!-- 🔧 DEBUG & MODALS -->
    <LayoutDebugWrapper :is-open="ui.debugPanelVisible" @close="ui.setDebugPanelVisibleStore(false)">
      <template #content><DebugPanel /></template>
    </LayoutDebugWrapper>

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
import { EditPen, Refresh, Setting, Tools, Loading } from '@element-plus/icons-vue'

import { useTrainingLogStore } from '@/components/Training/stores/trainingLogStore.js'
import { useInterfaceStore } from '@/components/Training/stores/training/interfaceStore.js'

import TrainingFilterBar from '@/components/Training/components/TrainingFilterBar.vue'
import TrainingLogForm from '@/components/Training/components/TrainingLogForm.vue'
import TrainingLogTable from '@/components/Training/components/TrainingLogTable.vue'
import TrainingSettingsDrawer from '@/components/Training/components/TrainingSettingsDrawer.vue'
import LayoutDebugWrapper from '@/components/Training/components/layout/wrappers/LayoutDebugWrapper.vue'
import DebugPanel from '@/components/Training/components/layout/panels/DebugPanel.vue'

const logStore = useTrainingLogStore()
const ui = useInterfaceStore()

const showForm = ref(false), formKey = ref(0), editingLog = ref(null)
const settingsOpen = ref(false), deleteVisible = ref(false), targetLog = ref(null), loading = ref(false)
const showVolume = ref(true)

const stats = computed(() => logStore.stats)
const summary = computed(() => logStore.summary)

const formatVol = (v) => { const n = parseFloat(v); return !n ? '0 кг' : n >= 1000 ? `${(n/1000).toFixed(1)} т` : `${Math.round(n)} кг` }

const toggleDebug = () => ui.toggleDebugPanelStore?.()
const refreshData = async () => { await Promise.allSettled([logStore.fetch(), logStore.fetchStats(), logStore.fetchSummary()]) }

const onSaved = () => { showForm.value = false; editingLog.value = null; formKey.value++; refreshData() }
const onDeleted = () => { editingLog.value = null; formKey.value++; refreshData() }
const handleEdit = (log) => { editingLog.value = log; showForm.value = true }
const handleDelete = (log) => { targetLog.value = log; deleteVisible.value = true }
const confirmDelete = async () => { if(!targetLog.value) return; loading.value = true; try { await logStore.deleteLog(targetLog.value.id); deleteVisible.value = false } finally { loading.value = false; refreshData() } }

onMounted(async () => {
  ui.initInterfaceStore?.()
  await Promise.allSettled([logStore.fetch(), logStore.fetchStats(), logStore.fetchSummary()])
})
</script>

<style scoped>
.training-dashboard { display:flex; flex-direction:column; height:100vh; background:#f5f7fa; font-size:11px; overflow:hidden; }
.dashboard-top-bar { display:flex; align-items:center; gap:8px; padding:4px 12px; background:#fff; border-bottom:1px solid #e4e7ed; flex-wrap:wrap; height:42px; }
.title { font-weight:600; font-size:13px; color:#303133; flex-shrink:0; }
.stats-bar { display:flex; gap:8px; flex:1; justify-content:center; flex-wrap:wrap; }
.pill { background:#f4f6f8; padding:2px 8px; border-radius:4px; font-size:10px; white-space:nowrap; }
.pill b { color:#409eff; margin-left:4px; }
.controls { display:flex; gap:4px; flex-shrink:0; }
.controls .el-button { height:26px; padding:0 8px; font-size:10px; }

.dashboard-main { flex:1; display:flex; position:relative; overflow:hidden; }
.content-wrapper { flex:1; display:flex; flex-direction:column; overflow:hidden; padding:4px; }
.form-container { margin-bottom:4px; }
.state-block { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:20px; background:#fff; border-radius:4px; border:1px solid #ebeef5; gap:8px; }
.state-block.error { color:#f56c6c; }
.table-container { flex:1; overflow:hidden; }

.slide-enter-active, .slide-leave-active { transition:all .25s; }
.slide-enter-from, .slide-leave-to { opacity:0; transform:translateY(-10px); }
</style>
