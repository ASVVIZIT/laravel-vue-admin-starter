<template>
  <el-tooltip placement="right" effect="light" popper-class="training-group-summary-popper">
    <template #content>
      <div class="tooltip-content">
        <div class="tooltip-header">
          <el-icon><DataAnalysis /></el-icon>
          <span>Детализация: {{ groupName }}</span>
        </div>
        <div class="tooltip-divider"></div>

        <!-- 🔥 1. ДЕТАЛИЗАЦИЯ ПО КАЖДОМУ УПРАЖНЕНИЮ -->
        <div v-if="summary?.exercise_breakdown?.length" class="tooltip-body">
          <div v-for="(ex, i) in summary.exercise_breakdown" :key="i" class="breakdown-row">
            <span class="ex-name">{{ ex.name }}</span>
            <span class="ex-dots"></span>
            <span class="ex-metrics">
              <span v-if="ex.volume > 0" class="metric-badge volume">{{ formatVolume(ex.volume) }}</span>
              <span v-else-if="ex.distance > 0 || ex.duration > 0" class="metric-badge cardio">
                <span v-if="ex.distance > 0">{{ formatDistance(ex.distance) }}</span>
                <span v-if="ex.distance > 0 && ex.duration > 0"> • </span>
                <span v-if="ex.duration > 0">{{ formatDuration(ex.duration) }}</span>
              </span>
              <span v-else class="metric-badge sets-only">{{ ex.sets }} подх.</span>
            </span>
          </div>
        </div>
        <div v-else class="tooltip-body">
          <span class="text-muted">Нет данных для отображения</span>
        </div>

        <div class="tooltip-divider"></div>

        <!-- 🔥 2. ОБЩИЕ ТОТАЛЫ ПО ВСЕЙ ГРУППЕ (ВСЕ ВМЕСТЕ) -->
        <div class="tooltip-footer">
          <div class="metric-row">
            <span class="metric-label">Всего подходов:</span>
            <span class="metric-value">{{ summary?.total_sets || 0 }}</span>
          </div>
          <div v-if="summary?.total_volume > 0" class="metric-row">
            <span class="metric-label">Общий объём:</span>
            <span class="metric-value volume-badge">{{ formatVolume(summary.total_volume) }}</span>
          </div>
          <div v-if="summary?.total_distance > 0" class="metric-row">
            <span class="metric-label">Общая дистанция:</span>
            <span class="metric-value distance-badge">{{ formatDistance(summary.total_distance) }}</span>
          </div>
          <div v-if="summary?.total_duration > 0" class="metric-row">
            <span class="metric-label">Общее время:</span>
            <span class="metric-value duration-badge">{{ formatDuration(summary.total_duration) }}</span>
          </div>
        </div>
      </div>
    </template>
    <el-icon class="info-trigger"><InfoFilled /></el-icon>
  </el-tooltip>
</template>

<script setup>
import { DataAnalysis, InfoFilled } from '@element-plus/icons-vue'
import { formatVolume, formatDistance, formatDuration } from '@components/Training/utils/trainingFormattersUtils.js'

defineProps({
  summary: { type: Object, default: () => ({}) },
  groupName: { type: String, default: 'Группа' }
})
</script>

<style scoped>
.tooltip-content {
  padding: 6px 8px;
  font-size: 10px;
  line-height: 1.4;
  color: #606266;
  min-width: 200px;
  max-width: 280px;
}
.tooltip-header {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  color: #303133;
  font-size: 11px;
}
.tooltip-header .el-icon { color: #409eff; font-size: 12px; }
.tooltip-divider {
  height: 1px;
  background: #ebeef5;
  margin: 4px 0;
}

/* 🔥 Стили для строки детализации */
.tooltip-body { display: flex; flex-direction: column; gap: 3px; }
.breakdown-row {
  display: flex;
  align-items: baseline;
  gap: 4px;
  padding: 2px 0;
}
.ex-name {
  flex-shrink: 0;
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #303133;
  font-weight: 500;
}
/* Магия точек-разделителей */
.ex-dots {
  flex: 1;
  border-bottom: 1px dotted #c0c4cc;
  margin: 0 4px;
  position: relative;
  top: -2px;
}
.ex-metrics {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Бейджи метрик в детализации */
.metric-badge {
  font-size: 9px;
  font-weight: 600;
  padding: 1px 4px;
  border-radius: 3px;
  white-space: nowrap;
}
.metric-badge.volume {
  background: #f0f9ff;
  color: #409eff;
}
.metric-badge.cardio {
  background: #f0f9eb;
  color: #67c23a;
}
.metric-badge.sets-only {
  color: #909399;
  font-weight: 500;
}

/* 🔥 Стили для общих тоталов */
.tooltip-footer {
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 10px;
  margin-top: 2px;
}
.metric-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.metric-label {
  color: #909399;
  font-weight: 500;
}
.metric-value {
  font-weight: 600;
  color: #303133;
}
/* Цветные бейджи для общих тоталов */
.volume-badge {
  background: #f0f9ff;
  color: #409eff;
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 9px;
}
.distance-badge {
  background: #f0f9eb;
  color: #67c23a;
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 9px;
}
.duration-badge {
  background: #fdf6ec;
  color: #e6a23c;
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 9px;
}

.info-trigger {
  font-size: 12px;
  color: #909399;
  cursor: help;
  margin-left: 4px;
  transition: color 0.2s;
}
.info-trigger:hover { color: #409eff; }
.text-muted { color: #c0c4cc; font-style: italic; }
</style>

<style>
.training-group-summary-popper {
  padding: 4px !important;
  border-radius: 4px !important;
  border: 1px solid #e4e7ed !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08) !important;
}
</style>
