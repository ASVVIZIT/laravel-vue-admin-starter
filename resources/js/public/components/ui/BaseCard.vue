<template>
  <div class="base-card" :class="[variant, { hoverable }]" :style="cardStyle">
    <slot />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: v => ['default', 'glass', 'gradient', 'outline'].includes(v)
  },
  hoverable: Boolean,
  padding: { type: String, default: '24px' },
  radius: { type: String, default: '20px' }
})

const cardStyle = computed(() => ({
  padding: props.padding,
  borderRadius: props.radius
}))
</script>

<style scoped>
.base-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  transition: all 0.3s ease;
}

.base-card.glass {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.15);
}

.base-card.gradient {
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(247, 147, 30, 0.05));
  border-color: rgba(255, 107, 53, 0.3);
}

.base-card.outline {
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.base-card.hoverable:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 107, 53, 0.3);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}
</style>
