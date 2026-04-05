<template>
  <div class="battery-base-svg" :style="{ height: containerHeight }">
    <div class="battery-wrapper">
      <!-- Положительный контакт -->
      <div class="battery-plus">+</div>

      <!-- Корпус батареи -->
      <div class="battery-body">
        <div class="battery" :class="{ 'battery-critical': isCritical }">
          <!-- Нормальный уровень -->
          <div
              class="battery-normal"
              :style="{ width: normalProgress + '%', backgroundColor: normalColor }"
          ></div>

          <!-- Критический уровень -->
          <div
              class="battery-critical"
              :style="{ width: criticalProgress + '%', backgroundColor: criticalColor }"
          >
            <div class="battery-critical-pattern"></div>
          </div>

          <!-- Маркер критического порога -->
          <div
              v-if="showMarkers"
              class="battery-mark critical-threshold"
              :style="{ left: criticalThresholdPosition + '%' }"
          ></div>

          <!-- Маркер текущего уровня -->
          <div
              v-if="showMarkers"
              class="battery-mark current-level"
              :style="{ left: currentLevelPosition + '%' }"
          ></div>

          <!-- Крышка -->
          <div class="battery-cap" :style="{ backgroundColor: capColor }"></div>
        </div>
      </div>

      <!-- Отрицательный контакт -->
      <div class="battery-minus">-</div>
    </div>

    <!-- Уровни напряжения -->
    <div v-if="showLevels" class="battery-levels">
      <span class="battery-level" style="left: 0%">{{ minVoltage }} В</span>
      <span class="battery-level" :style="{ left: criticalThresholdPosition + '%' }">
                {{ formattedCriticalThreshold }} В
            </span>
      <span class="battery-level" style="left: 100%">{{ maxVoltage }} В</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  /** Текущее напряжение */
  voltage: { type: Number, default: 3.7 },
  /** Критическое напряжение */
  criticalVoltage: { type: Number, default: 3.2 },
  /** Минимальное напряжение (из specs) */
  minVoltage: { type: Number, default: 2.5 },
  /** Максимальное напряжение (из specs) */
  maxVoltage: { type: Number, default: 4.2 },
  /** Цвета для статусов (из visualConfig.colors) */
  colors: {
    type: Object,
    default: () => ({
      normal: '#67c23a',
      warning: '#e6a23c',
      critical: '#f56c6c',
      off: '#909399'
    })
  },
  /** Высота компонента */
  height: { type: String, default: '40px' },
  /** Показывать уровни напряжения */
  showLevels: { type: Boolean, default: true },
  /** Показывать маркеры */
  showMarkers: { type: Boolean, default: true },
  /** Масштаб (из visualConfig.scale) */
  scale: { type: Number, default: 1.0 },
  /** Цвет крышки (из visualConfig.material.cap.color) */
  capColor: { type: String, default: '#409eff' }
});

const containerHeight = computed(() => props.height);
const totalRange = computed(() => props.maxVoltage - props.minVoltage);

const normalProgress = computed(() => {
  const normalRange = props.maxVoltage - props.criticalVoltage;
  const normalValue = Math.max(0, props.voltage - props.criticalVoltage);
  return (normalValue / totalRange.value) * 100;
});

const criticalProgress = computed(() => {
  const criticalValue = Math.max(0, Math.min(props.criticalVoltage - props.minVoltage, props.voltage));
  return (criticalValue / totalRange.value) * 100;
});

const criticalThresholdPosition = computed(() => {
  return ((props.criticalVoltage - props.minVoltage) / totalRange.value) * 100;
});

const currentLevelPosition = computed(() => {
  return ((props.voltage - props.minVoltage) / totalRange.value) * 100;
});

const isCritical = computed(() => props.voltage < props.criticalVoltage);

const normalColor = computed(() => {
  if (props.voltage < props.criticalVoltage) return props.colors.critical;
  if (props.voltage < 3.4) return props.colors.warning;
  if (props.voltage < 3.8) return props.colors.normal;
  return props.colors.normal;
});

const criticalColor = computed(() => props.colors.critical);
const formattedCriticalThreshold = computed(() => props.criticalVoltage.toFixed(1));
</script>

<style scoped>
.battery-base-svg {
  position: relative;
  width: 90%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.battery-wrapper {
  width: 100%;
  position: relative;
}

.battery {
  position: relative;
  width: 100%;
  height: 30px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #f5f7fa;
  overflow: hidden;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
}

.battery.battery-critical {
  border-color: #f56c6c;
  animation: battery-pulse 2s infinite;
}

.battery-normal {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #67c23a 0%, #95d97b 100%);
  transition: width 0.3s ease, background-color 0.3s ease;
}

.battery-critical {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #f56c6c 0%, #ff9999 100%);
  overflow: hidden;
  transition: width 0.3s ease;
}

.battery-critical-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
      -45deg,
      transparent,
      transparent 3px,
      rgba(255, 255, 255, 0.3) 3px,
      rgba(255, 255, 255, 0.3) 6px
  );
}

.battery-mark {
  position: absolute;
  top: -3px;
  bottom: -3px;
  width: 1px;
  background-color: #e6a23c;
  z-index: 10;
  transition: left 0.3s ease;
}

.battery-mark.critical-threshold {
  border-left: 1px dashed #e6a23c;
  background-color: transparent;
}

.battery-mark.current-level {
  border-left: 1px solid #409eff;
  background-color: transparent;
}

.battery-cap {
  position: absolute;
  top: -1px;
  right: -1px;
  width: 1px;
  height: 4px;
  background: #409eff;
  border-radius: 1px;
}

.battery-plus,
.battery-minus {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-weight: 600;
  color: #409eff;
  font-size: 11px;
  z-index: 10;
}

.battery-plus {
  left: -12px;
}

.battery-minus {
  right: -12px;
}

.battery-levels {
  display: flex;
  justify-content: space-between;
  position: relative;
  margin-top: 4px;
  font-size: 9px;
  color: #909399;
  width: 100%;
}

.battery-level {
  position: absolute;
  font-size: 9px;
  color: #909399;
  transform: translateX(-50%);
  white-space: nowrap;
}

@keyframes battery-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(245, 108, 108, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(245, 108, 108, 0);
  }
}
</style>
