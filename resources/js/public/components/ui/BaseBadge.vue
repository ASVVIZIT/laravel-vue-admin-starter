<template>
  <span class="base-badge" :class="[variant, size, { pulse }]">
    <span v-if="icon" class="badge-icon">{{ icon }}</span>
    <slot />
  </span>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: v => ['default', 'success', 'warning', 'danger', 'info', 'brand'].includes(v)
  },
  size: {
    type: String,
    default: 'md',
    validator: v => ['sm', 'md', 'lg'].includes(v)
  },
  icon: String,
  pulse: Boolean
})
</script>

<style scoped>
.base-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 100px;
  font-weight: 600;
  transition: all 0.3s ease;
}

/* Sizes */
.base-badge.sm { padding: 4px 10px; font-size: 11px; }
.base-badge.md { padding: 8px 16px; font-size: 13px; }
.base-badge.lg { padding: 12px 24px; font-size: 15px; }

/* Variants */
.base-badge.default {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
}

.base-badge.success {
  background: rgba(0, 208, 132, 0.1);
  border: 1px solid rgba(0, 208, 132, 0.3);
  color: #00d084;
}

.base-badge.warning {
  background: rgba(255, 153, 0, 0.1);
  border: 1px solid rgba(255, 153, 0, 0.3);
  color: #ff9900;
}

.base-badge.danger {
  background: rgba(255, 71, 87, 0.1);
  border: 1px solid rgba(255, 71, 87, 0.3);
  color: #ff4757;
}

.base-badge.info {
  background: rgba(64, 158, 255, 0.1);
  border: 1px solid rgba(64, 158, 255, 0.3);
  color: #409eff;
}

.base-badge.brand {
  background: rgba(255, 107, 53, 0.1);
  border: 1px solid rgba(255, 107, 53, 0.3);
  color: #ff6b35;
}

.pulse::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 2s infinite;
  box-shadow: 0 0 10px currentColor;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.3); }
}
</style>
