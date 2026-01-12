<template>
  <div class="battery-indicator">
    <div class="battery-container">
      <div class="battery">
        <div
            class="battery-normal"
            :style="{ width: normalProgress + '%' }"
        ></div>
        <div
            class="battery-critical"
            :style="{ width: criticalProgress + '%', backgroundColor: criticalColor }"
        >
          <div class="battery-critical-pattern"></div>
        </div>
        <div class="battery-mark critical-threshold" :style="{ left: criticalThresholdPosition + '%' }"></div>
        <div class="battery-mark current-level" :style="{ left: currentLevelPosition + '%' }"></div>
        <div class="battery-cap"></div>
        <div class="battery-plus">+</div>
        <div class="battery-minus">-</div>
      </div>
      <div class="battery-levels">
        <span class="battery-level" :style="{ left: '0%' }">2.5 В</span>
        <span class="battery-level" :style="{ left: criticalThresholdPosition + '%' }">{{ criticalThreshold }} В</span>
        <span class="battery-level" :style="{ left: '100%' }">4.3 В</span>
      </div>
      <div class="voltage-value">{{ voltage.toFixed(2) }} В</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  voltage: {
    type: Number,
    required: true,
    default: 3.7
  },
  min: {
    type: Number,
    default: 2.5
  },
  max: {
    type: Number,
    default: 4.3
  },
  criticalThreshold: {
    type: Number,
    required: true
  }
});

// Вычисляем позицию критического порога в процентах
const criticalThresholdPosition = computed(() => {
  return ((props.criticalThreshold - props.min) / (props.max - props.min)) * 100;
});

// Нормальный прогресс (от критического порога до max)
const normalProgress = computed(() => {
  if (props.voltage <= props.criticalThreshold) {
    return 0;
  }

  const normalVoltage = props.voltage - props.criticalThreshold;
  const maxNormalVoltage = props.max - props.criticalThreshold;

  return Math.min(100, Math.max(0, (normalVoltage / maxNormalVoltage) * 100));
});

// Критический прогресс (от min до критического порога)
const criticalProgress = computed(() => {
  if (props.voltage >= props.criticalThreshold) {
    return 0;
  }

  const criticalVoltage = props.criticalThreshold - props.voltage;
  const criticalVoltageRange = props.criticalThreshold - props.min;

  return Math.min(100, Math.max(0, (criticalVoltage / criticalVoltageRange) * 100));
});

// Позиция текущего уровня
const currentLevelPosition = computed(() => {
  return ((props.voltage - props.min) / (props.max - props.min)) * 100;
});

// Цвет критического уровня
const criticalColor = computed(() => {
  const voltage = props.voltage;
  if (voltage < 2.7) return '#f56c6c';
  if (voltage < 3.0) return '#faa7a7';
  return '#ffcccb';
});
</script>

<style scoped>
.battery-indicator {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.battery-container {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  position: relative;
}

.battery {
  position: relative;
  width: 100%;
  height: 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #f5f7fa;
  overflow: hidden;
}

.battery-normal {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #67c23a 0%, #95d97b 100%);
}

.battery-critical {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #f56c6c 0%, #ff9999 100%);
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
}

.battery-mark.critical-threshold {
  border-left: 1px dashed #e6a23c;
}

.battery-mark.current-level {
  border-left: 1px solid #409eff;
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

.battery-plus {
  position: absolute;
  top: 50%;
  left: -10px;
  transform: translateY(-50%);
  font-weight: bold;
  color: #409eff;
  font-size: 0.8rem;
  z-index: 10;
}

.battery-minus {
  position: absolute;
  top: 50%;
  right: -10px;
  transform: translateY(-50%);
  font-weight: bold;
  color: #409eff;
  font-size: 0.8rem;
  z-index: 10;
}

.battery-levels {
  display: flex;
  justify-content: space-between;
  position: relative;
  margin-top: 1px;
}

.battery-level {
  position: absolute;
  font-size: 0.7rem;
  color: #909399;
}

.voltage-value {
  text-align: center;
  font-weight: bold;
  color: #409eff;
  font-size: 0.85rem;
  margin-top: 0.2rem;
}
</style>
