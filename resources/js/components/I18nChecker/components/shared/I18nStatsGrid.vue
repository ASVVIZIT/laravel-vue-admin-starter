<template>
  <div class="i18n-stats-grid">
    <div v-for="stat in stats" :key="stat.label" class="i18n-stat-card" :class="stat.class">
      <div class="i18n-stat-icon">{{ stat.icon }}</div>
      <div class="i18n-stat-info">
        <div class="i18n-stat-value">{{ stat.value }}</div>
        <div class="i18n-stat-label">{{ stat.label }}</div>
        <div v-if="stat.detail" class="i18n-stat-detail">{{ stat.detail }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  stats: { type: Array, required: true }
});
</script>

<style lang="scss" scoped>
.i18n-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 4px;
  margin-bottom: 4px;

  .i18n-stat-card {
    background: #f5f7fa;
    border-radius: 4px;
    padding: 4px;
    display: flex;
    align-items: center;
    gap: 4px;
    border-left: 3px solid #52c41a;

    &.i18n-stat-danger { border-left-color: #ff4d4f; }
    &.i18n-stat-warning { border-left-color: #faad14; }
    &.i18n-stat-info { border-left-color: #1890ff; }

    .i18n-stat-icon { font-size: 20px; }

    .i18n-stat-info {
      flex: 1;
      .i18n-stat-value { font-size: 18px; font-weight: 700; color: #303133; }
      .i18n-stat-label { font-size: 10px; color: #909399; margin-top: 2px; }
      .i18n-stat-detail { font-size: 10px; color: #c0c4cc; margin-top: 2px; }
    }
  }
}
</style>
