<template>
  <div class="battery-renderer">
    <div v-show="shouldRender3D" class="battery-3d-container">
      <ThreeScene
          ref="threeScene"
          :device-id="deviceId"
          visualization-type="battery"
          :battery-type-id="batteryTypeId"
          :voltage="voltage"
          :critical-voltage="criticalVoltage"
          :show-3d="shouldRender3D"
      />
    </div>
    <div v-show="!shouldRender3D" class="css-battery-container">
      <div class="battery">
        <div class="battery-fill" :style="{ height: batteryProgress + '%', backgroundColor: batteryColor }"></div>
        <div class="battery-mark" :style="{ bottom: criticalThresholdPosition + '%' }"></div>
        <div class="battery-cap"></div>
        <div class="battery-plus">+</div>
        <div class="battery-minus">-</div>
      </div>
      <div class="battery-value">{{ voltage.toFixed(2) }} В</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import ThreeScene from '../ThreeJs/ThreeScene.vue';
import { useSmartlightStore } from '@components/SmartLight/stores/index.js';
import { checkWebGLSupport } from '@components/SmartLight/api/core/utils/coreApiWebglSupportUtils.js';

const props = defineProps({
  deviceId: { type: String, required: true },
  voltage: { type: Number, default: 3.7 },
  criticalVoltage: { type: Number, default: 3.2 },
  debugMode: { type: Boolean, default: false }
});

const threeScene = ref(null);
const store = useSmartlightStore();
const webGLSupported = ref(false);
const isMounted = ref(false);

onMounted(() => {
  const webGLCheck = checkWebGLSupport();
  webGLSupported.value = webGLCheck.isSupported;
  isMounted.value = true;
});

const batteryTypeId = computed(() => {
  const device = store.deviceGetDevice(props.deviceId);
  return device?.battery_type_id || 'li-ion-18650';
});

const shouldRender3D = computed(() => {
  if (!isMounted.value) return false;
  const mode = store.getDevice3DMode(props.deviceId);
  return mode && webGLSupported.value;
});

const batteryProgress = computed(() => {
  const min = 2.5, max = 4.3;
  return Math.min(100, Math.max(0, ((props.voltage - min) / (max - min)) * 100));
});

const batteryColor = computed(() => {
  if (props.voltage < 2.7) return '#f56c6c';
  if (props.voltage < 3.0) return '#e6a23c';
  return '#67c23a';
});

const criticalThresholdPosition = computed(() => {
  const min = 2.5;
  return ((props.criticalVoltage - min) / (4.3 - min)) * 100;
});

watch([() => store.global3DMode, () => store.device3DSettings[props.deviceId]], ([globalMode, deviceMode]) => {
  nextTick(() => {
    if (shouldRender3D.value && webGLSupported.value) {
      threeScene.value?.init3D?.();
    } else {
      threeScene.value?.cleanup3D?.();
    }
  });
}, { immediate: true, deep: true });
</script>

<style scoped>
.battery-renderer {
  width: 100%;
  aspect-ratio: 1 / 1;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.battery-3d-container, .css-battery-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.css-battery-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.battery {
  width: 35px;
  height: 55px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #f5f7fa;
  position: relative;
  overflow: hidden;
}

.battery-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  transition: height 0.3s ease, background-color 0.3s ease;
}

.battery-mark {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: #e6a23c;
  border-top: 1px dashed #e6a23c;
}

.battery-cap {
  position: absolute;
  top: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 14px;
  height: 3px;
  background: #409eff;
  border-radius: 1px 1px 0 0;
}

.battery-plus {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  font-weight: bold;
  color: #409eff;
  font-size: 8px;
}

.battery-minus {
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  font-weight: bold;
  color: #409eff;
  font-size: 8px;
}

.battery-value {
  margin-top: 3px;
  font-weight: 600;
  color: #409eff;
  font-size: 9px;
  text-align: center;
}
</style>
