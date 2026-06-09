<template>
  <el-tooltip placement="right" effect="light" popper-class="training-group-summary-popper">
    <template #content>
      <div class="tooltip-content">
        <div class="tooltip-header">
          <el-icon><DataAnalysis /></el-icon>
          <span>Детализация: {{ groupName }}</span>
        </div>
        <div class="tooltip-divider"></div>

        <div v-if="summary?.top_entities?.length" class="tooltip-body">
          <div class="tooltip-subheader">{{ summary.entity_label || 'Детали' }}:</div>
          <div v-for="(entity, i) in summary.top_entities" :key="i" class="tooltip-row">
            <span class="entity-bullet">•</span>
            <span class="entity-name">{{ entity }}</span>
          </div>
        </div>
        <div v-else class="tooltip-body">
          <span class="text-muted">Нет дополнительных данных</span>
        </div>

        <div class="tooltip-divider"></div>

        <div class="tooltip-footer">
          <div class="metric-row">
            <span class="metric-label">Подходов:</span>
            <span class="metric-value">{{ summary?.total_sets || 0 }}</span>
          </div>
          <div v-if="summary?.total_volume > 0" class="metric-row">
            <span class="metric-label">Объём:</span>
            <span class="metric-value volume-badge">{{ formatVolume(summary.total_volume) }}</span>
          </div>
          <div v-if="summary?.total_distance > 0" class="metric-row">
            <span class="metric-label">Дистанция:</span>
            <span class="metric-value distance-badge">{{ formatDistance(summary.total_distance) }}</span>
          </div>
          <div v-if="summary?.total_duration > 0" class="metric-row">
            <span class="metric-label">Время:</span>
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
import { formatVolume, formatDistance, formatDuration } from '@/components/Training/utils/appFormattersUtils.js'

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
  min-width: 160px;
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
.tooltip-subheader {
  font-size: 9px;
  color: #909399;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}
.tooltip-body { display: flex; flex-direction: column; gap: 2px; }
.tooltip-row {
  display: flex;
  align-items: flex-start;
  gap: 4px;
}
.entity-bullet {
  color: #409eff;
  font-weight: 600;
  flex-shrink: 0;
}
.entity-name {
  word-break: break-word;
  color: #303133;
  max-width: 180px;
}
.tooltip-footer {
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 10px;
}
.metric-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
.metric-label {
  color: #909399;
  font-weight: 500;
}
.metric-value {
  font-weight: 600;
  color: #303133;
}
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
