<template>
  <BaseCard hoverable padding="24px">
    <div class="feature-icon">{{ icon }}</div>
    <h4 class="feature-title">{{ title }}</h4>
    <p class="feature-description">{{ description }}</p>
    <BaseBadge :variant="status === 'done' ? 'success' : 'warning'" size="sm">
      {{ statusText }}
    </BaseBadge>
  </BaseCard>
</template>

<script setup>
import BaseCard from '../ui/BaseCard.vue'
import BaseBadge from '../ui/BaseBadge.vue'

defineProps({
  icon: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: {
    type: String,
    default: 'progress',
    validator: v => ['done', 'progress', 'planned'].includes(v)
  },
  statusText: { type: String, default: 'В процессе' }
})
</script>

<style scoped>
.feature-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.feature-title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 700;
}

.feature-description {
  margin: 0 0 16px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  line-height: 1.5;
}
</style>
