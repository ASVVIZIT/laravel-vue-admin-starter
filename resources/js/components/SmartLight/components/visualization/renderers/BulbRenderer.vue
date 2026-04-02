<template>
  <div class="bulb-renderer">
    <div v-show="shouldRender3D" class="bulb-3d-container">
      <ThreeScene
          ref="threeScene"
          :device-id="deviceId"
          visualization-type="bulb"
          :bulb-type-id="bulbTypeId"
          :status="status"
          :intensity="intensity"
          :show-3d="shouldRender3D"
      />
    </div>
    <div v-show="!shouldRender3D" class="css-bulb-container">
      <div class="bulb-glass">
        <div class="bulb-glass-inner">
          <div class="bulb-filament-container">
            <div class="bulb-filament-support">
              <div class="bulb-filament-support-inner"></div>
            </div>
            <div class="bulb-filament">
              <div class="bulb-filament-inner"></div>
            </div>
          </div>
          <div class="bulb-glow" :style="{ opacity: glowIntensity, background: glowGradient }"></div>
        </div>
      </div>
      <div class="bulb-base">
        <div class="bulb-base-inner">
          <div class="bulb-contact"></div>
        </div>
      </div>
      <div class="bulb-threading"></div>
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
  status: { type: String, required: true },
  intensity: { type: Number, default: 100 },
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

const bulbTypeId = computed(() => {
  const device = store.deviceGetDevice(props.deviceId);
  return device?.bulb_type_id || 'classic';
});

const shouldRender3D = computed(() => {
  if (!isMounted.value) return false;
  const mode = store.getDevice3DMode(props.deviceId);
  return mode && webGLSupported.value;
});

const glowIntensity = computed(() => {
  if (props.status === 'OFF') return 0;
  if (props.status === 'SLEEPING') return 0.3 * (props.intensity / 100);
  return 0.8 * (props.intensity / 100);
});

const glowGradient = computed(() => {
  if (props.status === 'OFF') return 'none';
  if (props.status === 'SLEEPING') {
    return 'radial-gradient(circle, rgba(255, 165, 0, 0.8) 0%, rgba(255, 140, 0, 0) 70%)';
  }
  return 'radial-gradient(circle, rgba(255, 220, 150, 0.9) 0%, rgba(255, 200, 100, 0) 70%)';
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
.bulb-renderer {
  width: 100%;
  aspect-ratio: 1 / 1;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.bulb-3d-container, .css-bulb-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.css-bulb-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.bulb-glass {
  width: 50px;
  height: 50px;
  position: relative;
  display: flex;
  justify-content: center;
}

.bulb-glass-inner {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e6f7ff 0%, #ffffff 100%);
  box-shadow: 0 0 3px 1px rgba(255, 255, 255, 0.7) inset;
  position: relative;
  overflow: hidden;
}

.bulb-filament-container {
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 30%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.bulb-filament-support {
  width: 100%;
  height: 20%;
  border-radius: 2px;
  background: linear-gradient(to bottom, #888, #333);
}

.bulb-filament-support-inner {
  width: 100%;
  height: 40%;
  background: linear-gradient(to bottom, #aaa, #666);
  border-radius: 1px;
}

.bulb-filament {
  width: 100%;
  height: 20%;
  border-radius: 2px;
  display: flex;
  justify-content: center;
  position: relative;
}

.bulb-filament-inner {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(to top, #ffcc00 0%, #ffffff 100%);
  border-radius: 2px;
  box-shadow: 0 0 8px #ffcc00;
  animation: filament-glow 2s infinite alternate;
}

.bulb-glow {
  position: absolute;
  width: 90%;
  height: 90%;
  border-radius: 50%;
  top: 5%;
  left: 5%;
  z-index: 1;
  transition: opacity 0.5s ease;
}

.bulb-base {
  width: 30px;
  height: 20px;
  border-radius: 0 0 3px 3px;
  background: linear-gradient(to bottom, #444, #222);
  position: relative;
}

.bulb-base-inner {
  width: 100%;
  height: 70%;
  background: linear-gradient(to bottom, #555, #333);
  border-radius: 0 0 2px 2px;
  position: relative;
  top: 5%;
}

.bulb-contact {
  width: 30%;
  height: 40%;
  background: #e6a23c;
  border-radius: 50%;
  position: absolute;
  bottom: 10%;
  left: 35%;
}

.bulb-threading {
  width: 35px;
  height: 6px;
  background: linear-gradient(to right, #333 20%, #555 20%, #555 40%, #333 40%, #333 60%, #555 60%, #555 80%, #333 80%);
  border-radius: 0 0 2px 2px;
  position: absolute;
  bottom: 0;
}

@keyframes filament-glow {
  0% { opacity: 0.7; }
  100% { opacity: 1; }
}
</style>
