<template>
  <div
      class="bulb-base-svg"
      :class="statusClass"
      :style="{ width: containerWidth, height: containerHeight }"
  >
    <!-- Слот для кастомизации лампы -->
    <slot name="bulb">
      <!-- Базовая реализация лампы -->
      <div class="bulb-default">
        <div class="bulb-glass" :style="{ backgroundColor: glassColor }"></div>
        <div class="bulb-base"></div>
      </div>
    </slot>

    <!-- Свечение (только если активно) -->
    <div v-if="isOn && showGlow" class="bulb-glow" :style="{ opacity: glowOpacity }"></div>

    <!-- Индикатор статуса -->
    <div class="bulb-status-indicator" :class="statusIndicatorClass"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  /** Статус лампы (ON, OFF, SLEEPING, ERROR) */
  status: {
    type: String,
    default: 'OFF',
    validator: (value) => ['ON', 'OFF', 'SLEEPING', 'ERROR'].includes(value)
  },
  /** Интенсивность (0-100) */
  intensity: { type: Number, default: 0 },
  /** Ширина компонента */
  width: { type: String, default: '60px' },
  /** Высота компонента */
  height: { type: String, default: '80px' },
  /** Показывать свечение */
  showGlow: { type: Boolean, default: true }
});

const containerWidth = computed(() => props.width);
const containerHeight = computed(() => props.height);

const isOn = computed(() => props.status === 'ON');
const isSleeping = computed(() => props.status === 'SLEEPING');
const isError = computed(() => props.status === 'ERROR');

const statusClass = computed(() => ({
  'bulb-status-on': props.status === 'ON',
  'bulb-status-off': props.status === 'OFF',
  'bulb-status-sleeping': props.status === 'SLEEPING',
  'bulb-status-error': props.status === 'ERROR'
}));

const statusIndicatorClass = computed(() => ({
  'indicator-on': props.status === 'ON',
  'indicator-off': props.status === 'OFF',
  'indicator-sleeping': props.status === 'SLEEPING',
  'indicator-error': props.status === 'ERROR'
}));

// ✅ Цвет стекла с учётом статуса и интенсивности
const glassColor = computed(() => {
  if (props.status === 'OFF') return '#e0e0e0';
  if (props.status === 'SLEEPING') return '#fff7e6';
  if (props.status === 'ERROR') return '#fef0f0';
  // При ON: прозрачность зависит от интенсивности
  const alpha = 0.4 + (props.intensity / 100) * 0.4;
  return `rgba(255, 255, 255, ${alpha})`;
});

// ✅ Прозрачность свечения зависит от интенсивности
const glowOpacity = computed(() => {
  if (!props.showGlow || !isOn.value) return 0;
  return 0.3 + (props.intensity / 100) * 0.5;
});
</script>

<style scoped>
.bulb-base-svg {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.bulb-default {
  position: relative;
  z-index: 10;
}

.bulb-glass {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid #d0d0d0;
  transition: background-color 0.3s ease, opacity 0.3s ease;
}

.bulb-base {
  width: 20px;
  height: 25px;
  background: #888888;
  margin: -2px auto 0;
  border-radius: 2px;
}

.bulb-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  height: 80%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 200, 0.6) 0%, transparent 70%);
  animation: bulb-glow 1s infinite;
  z-index: 1;
  transition: opacity 0.3s ease;
}

.bulb-status-indicator {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
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

.indicator-sleeping {
  background-color: #e6a23c;
  animation: indicator-pulse 2s infinite;
}

.indicator-error {
  background-color: #f56c6c;
  animation: indicator-pulse 0.5s infinite;
}

/* Статусы лампы */
.bulb-status-on .bulb-glass {
  box-shadow: 0 0 20px rgba(255, 255, 200, 0.5);
}

.bulb-status-sleeping .bulb-glass {
  box-shadow: 0 0 10px rgba(230, 162, 60, 0.3);
}

.bulb-status-error .bulb-glass {
  box-shadow: 0 0 10px rgba(245, 108, 108, 0.3);
}

@keyframes bulb-glow {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}

@keyframes indicator-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
