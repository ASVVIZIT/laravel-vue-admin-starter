<template>
  <LayoutCardWrapper :title="title" :icon="icon" bordered shadow class="stats-card">
    <div class="stats-grid">
      <div v-for="(stat, key) in stats" :key="key" class="stat-item">
        <span class="stat-label">{{ stat.label }}</span>
        <span class="stat-value" :style="{ color: stat.color }">
          {{ formatValue(stat.value, stat.format) }}
        </span>
      </div>
    </div>

    <div v-if="footer" class="stats-footer">
      <slot name="footer">{{ footer }}</slot>
    </div>
  </LayoutCardWrapper>
</template>

<script setup>
import { formatDate, formatVolume, formatDuration, formatDistance, formatStreak } from '@/components/Training/utils/appFormattersUtils.js';
import LayoutCardWrapper from '@/components/SmartLight/components/layout/wrappers/LayoutCardWrapper.vue';

const props = defineProps({
  title: { type: String, default: 'Статистика' },
  icon: { type: Object, default: null },
  stats: { type: Object, default: () => ({}) },
  footer: { type: String, default: '' }
});

const formatValue = (value, format) => {
  if (value === null || value === undefined) return '—';

  switch (format) {
    case 'date': return formatDate(value);
    case 'volume': return formatVolume(value);
    case 'duration': return formatDuration(value);
    case 'distance': return formatDistance(value);
    case 'streak': return formatStreak(value);
    case 'number': return Number(value).toLocaleString('ru-RU');
    case 'percent': return `${value}%`;
    default: return String(value);
  }
};
</script>

<style scoped>
.stats-card {
  font-size: 12px;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 4px 0;
}
.stat-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.stat-label {
  font-size: 10px;
  color: #909399;
}
.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}
.stats-footer {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #ebeef5;
  font-size: 11px;
  color: #606266;
}
</style>
