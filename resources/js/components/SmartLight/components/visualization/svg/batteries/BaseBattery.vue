<template>
  <div class="battery-container" :style="{ height }">
    <div class="battery-wrapper">
      <div class="battery-plus">+</div>
      <div class="battery-body">
        <div class="battery">
          <div class="battery-normal" :style="{ width: batteryNormalProgress + '%', backgroundColor: batteryColor }"></div>
          <div class="battery-critical" :style="{ width: batteryCriticalProgress + '%', backgroundColor: criticalColor }">
            <div class="battery-critical-pattern"></div>
          </div>
          <div class="battery-mark critical-threshold" :style="{ left: criticalThresholdPosition + '%' }"></div>
          <div class="battery-mark current-level" :style="{ left: currentLevelPosition + '%' }"></div>
          <div class="battery-cap"></div>
        </div>
      </div>
      <div class="battery-levels">
        <span class="battery-level" style="left: 0%">2.5 В</span>
        <span class="battery-level" :style="{ left: criticalThresholdPosition + '%' }">{{ formattedCriticalThreshold }} В</span>
        <span class="battery-level" style="left: 100%">4.3 В</span>
      </div>
    </div>
    <div class="battery-minus">-</div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useSmartlightStore } from '@components/SmartLight/stores/index.js';

const props = defineProps({
  deviceId: { type: String, required: true },
  voltage: { type: Number, default: 3.7 },
  criticalVoltage: { type: Number, default: 3.2 },
  height: { type: String, default: '40px' }
});

const store = useSmartlightStore();

const criticalThresholdPosition = computed(() => store.deviceCriticalThresholdPosition(props.deviceId));
const batteryNormalProgress = computed(() => store.deviceNormalProgress(props.deviceId));
const batteryCriticalProgress = computed(() => store.deviceCriticalProgress(props.deviceId));
const currentLevelPosition = computed(() => store.deviceCurrentLevelPosition(props.deviceId));
const criticalColor = computed(() => store.deviceCriticalColor(props.deviceId));
const batteryColor = computed(() => store.deviceBatteryColor(props.deviceId));
const formattedCriticalThreshold = computed(() => store.calculateGroupCriticalVoltage(props.deviceId).toFixed(2));
</script>

<style scoped>
.battery-wrapper { width: 100%; }
.battery-container {
  position: relative;
  width: 90%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
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
}
.battery-critical-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(255, 255, 255, 0.3) 3px, rgba(255, 255, 255, 0.3) 6px);
}
.battery-mark {
  position: absolute;
  top: -3px;
  bottom: -3px;
  width: 1px;
  background-color: #e6a23c;
  z-index: 10;
}
.battery-mark.critical-threshold { border-left: 1px dashed #e6a23c; }
.battery-mark.current-level { border-left: 1px solid #409eff; }
.battery-cap {
  position: absolute;
  top: -1px;
  right: -1px;
  width: 1px;
  height: 4px;
  background: #409eff;
  border-radius: 1px;
}
.battery-plus, .battery-minus {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-weight: bold;
  color: #409eff;
  font-size: 0.8rem;
  z-index: 10;
}
.battery-plus { left: -10px; }
.battery-minus { right: -10px; }
.battery-levels {
  display: flex;
  justify-content: space-between;
  position: relative;
  margin-top: 1px;
  font-size: 0.7rem;
  color: #909399;
  width: 100%;
}
.battery-level {
  position: absolute;
  font-size: 0.7rem;
  color: #909399;
  width: 30px;
}
</style>
