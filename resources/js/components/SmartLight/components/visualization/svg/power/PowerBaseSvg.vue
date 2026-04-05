<template>
  <div class="power-base-svg" :class="statusClass" :style="{ width: containerWidth, height: containerHeight }">
    <!-- Слот для кастомизации источника питания -->
    <slot name="power">
      <!-- Базовая реализация -->
      <div class="power-default">
        <div class="power-icon" :style="{ backgroundColor: iconColor }"></div>
        <div class="power-label">{{ label }}</div>
      </div>
    </slot>

    <!-- Индикатор статуса -->
    <div class="power-status-indicator" :class="statusIndicatorClass"></div>

    <!-- Свечение (если активно) -->
    <div v-if="isActive && showGlow" class="power-glow" :style="{ opacity: glowOpacity }"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  /** Статус питания (ON, OFF, ACTIVE, ERROR) */
  status: {
    type: String,
    default: 'OFF',
    validator: (value) => ['ON', 'OFF', 'ACTIVE', 'ERROR'].includes(value)
  },
  /** Метка (название типа питания) */
  label: { type: String, default: 'Power' },
  /** Напряжение */
  voltage: { type: Number, default: 0 },
  /** Ширина компонента */
  width: { type: String, default: '60px' },
  /** Высота компонента */
  height: { type: String, default: '80px' },
  /** Показывать свечение */
  showGlow: { type: Boolean, default: true }
});

const containerWidth = computed(() => props.width);
const containerHeight = computed(() => props.height);

const isActive = computed(() => props.status === 'ON' || props.status === 'ACTIVE');
const isError = computed(() => props.status === 'ERROR');

const statusClass = computed(() => ({
  'power-status-on': props.status === 'ON',
  'power-status-off': props.status === 'OFF',
  'power-status-active': props.status === 'ACTIVE',
  'power-status-error': props.status === 'ERROR'
}));

const statusIndicatorClass = computed(() => ({
  'indicator-on': isActive.value,
  'indicator-off': props.status === 'OFF',
  'indicator-error': isError.value
}));

const iconColor = computed(() => {
  if (isError.value) return '#fef0f0';
  if (isActive.value) return '#f0f9eb';
  return '#f5f7fa';
});

const glowOpacity = computed(() => {
  if (!props.showGlow || !isActive.value) return 0;
  return 0.4;
});
</script>

<style scoped>
.power-base-svg {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.power-default {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.power-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid #d0d0d0;
  transition: background-color 0.3s ease;
}

.power-label {
  margin-top: 6px;
  font-size: 10px;
  color: #606266;
  font-weight: 500;
}

.power-status-indicator {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  z-index: 20;
}

.indicator-on {
  background-color: #67c23a;
  animation: indicator-pulse 1s infinite;
}

.indicator-off {
  background-color: #909399;
}

.indicator-error {
  background-color: #f56c6c;
  animation: indicator-pulse 0.5s infinite;
}

.power-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 70%;
  height: 70%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(103, 194, 58, 0.4) 0%, transparent 70%);
  animation: power-glow 1s infinite;
  z-index: 1;
  transition: opacity 0.3s ease;
}

/* Статусы */
.power-status-on .power-icon,
.power-status-active .power-icon {
  box-shadow: 0 0 15px rgba(103, 194, 58, 0.4);
}

.power-status-error .power-icon {
  box-shadow: 0 0 15px rgba(245, 108, 108, 0.4);
}

@keyframes power-glow {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.8;
  }
}

@keyframes indicator-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
