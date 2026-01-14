<template>
  <div class="battery-renderer" :style="{ width: width, height: height }">
    <!-- CSS-визуализация как fallback -->
    <div class="battery-css-container" v-if="!webGLSupported || !show3D">
      <div class="battery">
        <div class="battery-fill" :style="{
          height: `${batteryProgress}%`,
          backgroundColor: batteryColor
        }"></div>
        <div class="battery-critical" :style="{
          height: `${criticalProgress}%`,
          backgroundColor: criticalColor,
          background: fluidPattern
        }"></div>
        <div class="battery-mark critical-threshold" :style="{ left: `${criticalThresholdPosition}%` }"></div>
        <div class="battery-mark current-level" :style="{ left: `${currentLevelPosition}%` }"></div>
        <div class="battery-cap"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useSmartLightStore } from '@/components/SmartLight/stores/smartLightStore.js';

const props = defineProps({
  deviceId: {
    type: String,
    required: true
  },
  voltage: {
    type: Number,
    default: 3.7
  },
  criticalVoltage: {
    type: Number,
    default: 3.2
  },
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '100%'
  },
  show3D: {
    type: Boolean,
    default: false
  }
});

const store = useSmartLightStore();
const webGLSupported = ref(false); // Для простоты, пока используем только CSS

// Вычисляем прогресс батареи
const batteryProgress = computed(() => {
  const minVoltage = store.calculateGroupMinVoltage(props.deviceId);
  const maxVoltage = store.calculateGroupMaxVoltage(props.deviceId);

  return Math.min(100, Math.max(0,
      ((props.voltage - minVoltage) / (maxVoltage - minVoltage)) * 100
  ));
});

const criticalProgress = computed(() => {
  const minVoltage = store.calculateGroupMinVoltage(props.deviceId);
  const criticalVoltage = store.calculateGroupCriticalVoltage(props.deviceId);

  if (props.voltage >= criticalVoltage) {
    return 0;
  }

  const criticalVoltageValue = criticalVoltage - props.voltage;
  const criticalVoltageRange = criticalVoltage - minVoltage;

  return Math.min(100, Math.max(0, (criticalVoltageValue / criticalVoltageRange) * 100));
});

const criticalThresholdPosition = computed(() => {
  const minVoltage = store.calculateGroupMinVoltage(props.deviceId);
  const maxVoltage = store.calculateGroupMaxVoltage(props.deviceId);
  const criticalVoltage = store.calculateGroupCriticalVoltage(props.deviceId);

  return ((criticalVoltage - minVoltage) / (maxVoltage - minVoltage)) * 100;
});

const currentLevelPosition = computed(() => {
  const minVoltage = store.calculateGroupMinVoltage(props.deviceId);
  const maxVoltage = store.calculateGroupMaxVoltage(props.deviceId);

  return ((props.voltage - minVoltage) / (maxVoltage - minVoltage)) * 100;
});

// Цвета и эффекты
const batteryColor = computed(() => {
  if (props.voltage < 2.7) return '#f56c6c';
  if (props.voltage < 3.0) return '#e6a23c';
  return '#67c23a';
});

const criticalColor = computed(() => {
  return batteryColor.value;
});

const fluidPattern = computed(() => {
  return 'repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(255, 255, 255, 0.3) 3px, rgba(255, 255, 255, 0.3) 6px';
});
</script>

<style scoped>
.battery-renderer {
  position: relative;
  width: 100%;
  height: 100%;
  min-width: 100px;
  min-height: 50px;
}

.battery-css-container {
  height: 100%;
  border-radius: 3px;
  background: #f5f7fa;
  overflow: hidden;
  position: relative;
}

.battery {
  position: relative;
  height: 100%;
  border: 2px solid rgba(66, 154, 220, 0.71);
  border-radius: 3px;
  background: #f5f7fa;
  overflow: hidden;
}

.battery-fill {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  background: linear-gradient(90deg, #67c23a 0%, #95d97b 100%);
  transition: height 0.3s ease, background-color 0.3s ease;
}

.battery-critical {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  background: linear-gradient(90deg, #f56c6c 0%, #ff9999 100%);
  background-size: 100% 100%;
  background-image: v-bind('fluidPattern');
  background-repeat: no-repeat;
  background-size: cover;
}

.battery-mark {
  position: absolute;
  top: -3px;
  bottom: -3px;
  width: 1px;
  background-color: #e6a23c;
  z-index: 10;
}

.critical-threshold {
  border-left: dashed;
}

.current-level {
  border-left: solid;
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
</style>
