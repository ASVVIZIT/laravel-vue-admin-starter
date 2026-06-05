<template>
  <header class="training-dashboard-header">
    <!-- 🔹 ЕДИНАЯ СТРОКА: Заголовок + Статистика + Кнопки -->
    <div class="header-row">
      <div class="header-left">
        <div class="header-title">
          <span class="title-icon">🏆</span>
          <span class="title-text">Мои тренировки</span>
        </div>
        <div class="header-stats">
          <TrainingStatsBar :summary="summary" :stats="stats" />
        </div>
      </div>

      <div class="header-actions">
        <el-button
            type="primary"
            size="small"
            @click="$emit('toggle-form')"
            class="btn-add"
        >
          <el-icon><EditPen /></el-icon>
          <span class="btn-label">{{ showForm ? 'Скрыть' : 'Добавить' }}</span>
        </el-button>

        <el-button
            size="small"
            @click="$emit('refresh')"
            :loading="loading"
            circle
            class="btn-refresh"
            title="Обновить данные"
        >
          <el-icon><Refresh /></el-icon>
        </el-button>

        <el-button
            v-if="showSettings"
            size="small"
            @click="$emit('toggle-settings')"
            circle
            class="btn-settings"
            title="Настройки модуля"
        >
          <el-icon><Setting /></el-icon>
        </el-button>

        <!-- 🔥 Кнопка отладки -->
        <el-button
            v-if="showDebug"
            size="small"
            @click="$emit('toggle-debug')"
            circle
            :class="['btn-debug', { 'is-active': debugVisible }]"
            title="Панель отладки (Ctrl+Shift+D)"
        >
          🐞
        </el-button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { EditPen, Refresh, Setting } from '@element-plus/icons-vue'
import TrainingStatsBar from './TrainingStatsBar.vue'

const props = defineProps({
  summary: { type: Object, required: true },
  stats: { type: Object, required: true },
  loading: { type: Boolean, default: false },
  showForm: { type: Boolean, default: false },
  showSettings: { type: Boolean, default: true },
  showDebug: { type: Boolean, default: true },
  debugVisible: { type: Boolean, default: false }
})

const emit = defineEmits(['toggle-form', 'refresh', 'toggle-settings', 'toggle-debug'])
</script>

<style scoped>
.training-dashboard-header {
  background: #ffffff;
  border-bottom: 1px solid #ebeef5;
  padding: 4px 12px;
  width: 100%;
  box-sizing: border-box;
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  white-space: nowrap;
  flex-shrink: 0;
}

.title-icon { font-size: 16px; }
.title-text { line-height: 1; }

.header-stats {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.btn-add {
  height: 26px;
  padding: 0 10px;
  font-size: 11px;
  border-radius: 4px;
}

.btn-refresh,
.btn-settings {
  width: 26px;
  height: 26px;
  padding: 0;
}

.btn-label { margin-left: 4px; }

.btn-debug {
  width: 28px;
  height: 28px;
  padding: 0;
  font-size: 14px;
  background: #2d2d2d;
  border-color: #3e3e3e;
  color: #9cdcfe;
}

.btn-debug:hover {
  background: #3e3e3e;
  border-color: #4ec9b0;
  color: #4ec9b0;
}

.btn-debug.is-active {
  background: #4ec9b0;
  border-color: #4ec9b0;
  color: #1e1e1e;
}

@media (max-width: 768px) {
  .training-dashboard-header { padding: 3px 8px; }
  .header-title { font-size: 12px; }
  .btn-label { display: none; }
  .btn-add { padding: 0 6px; }
}
</style>
