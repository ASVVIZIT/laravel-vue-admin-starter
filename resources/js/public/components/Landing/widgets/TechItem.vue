<template>
  <div class="tech-item">
    <span class="tech-icon">{{ icon }}</span>
    <div class="tech-info">
      <div class="tech-name">{{ name }}</div>
      <BaseBadge v-if="version" variant="info" size="sm">{{ version }}</BaseBadge>
    </div>
  </div>
</template>

<script setup>
import BaseBadge from '../ui/BaseBadge.vue'

defineProps({
  icon: { type: String, required: true },
  name: { type: String, required: true },
  version: String
})
</script>

<style scoped>
.tech-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 10px;
  transition: all 0.2s ease;
}

.tech-item:hover {
  background: rgba(255, 107, 53, 0.1);
  transform: translateX(4px);
}

.tech-icon {
  font-size: 22px;
  width: 32px;
  text-align: center;
}

.tech-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tech-name {
  font-weight: 600;
  font-size: 14px;
}
</style>
