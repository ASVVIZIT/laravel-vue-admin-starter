<template>
  <div class="battery-renderer">
    <!-- 3D режим через UniversalThreeScene -->
    <UniversalThreeScene
        v-if="effectiveMode === '3d' && config"
        mode="full"
        :device-id="deviceId"
        :config="config"
        :data="data"
        :model-component="threeComponent"
        :enable-debug="false"
        @model-ready="onModelReady"
        @model-update="onModelUpdate"
    />

    <!-- SVG fallback через Vue компонент -->
    <component
        :is="svgComponent"
        v-else
        :voltage="voltage"
        :critical-voltage="criticalVoltage"
        :height="svgHeight"
    />
  </div>
</template>

<script setup>
import { computed, ref, onMounted, defineAsyncComponent } from 'vue';
import UniversalThreeScene from '@/components/SmartLight/components/visualization/threeJs/UniversalThreeScene.vue';
import { useVisualizationConfigStore } from '@/components/SmartLight/stores/smartlight/visualizationConfigStore.js';
import { checkWebGLSupport } from '@/components/SmartLight/api/core/utils/coreApiWebglSupportUtils.js';

const props = defineProps({
  deviceId: { type: String, required: true },
  batteryTypeId: { type: String, default: 'li-ion-18650' },
  voltage: { type: Number, default: 3.7 },
  criticalVoltage: { type: Number, default: 3.2 },
  capacity: { type: Number, default: 3500 },
  mode: { type: String, default: 'svg', validator: (v) => ['svg', '3d'].includes(v) }
});

const emit = defineEmits(['model-ready', 'model-update']);

const configStore = useVisualizationConfigStore();
const is3DAvailable = ref(false);
const svgHeight = '50px';

const config = computed(() => configStore.getBatteryConfigStore(props.batteryTypeId));

const threeComponent = computed(() => {
  if (!config.value?.vueComponents?.three) return null;
  return defineAsyncComponent(config.value.vueComponents.three);
});

const svgComponent = computed(() => {
  if (!config.value?.vueComponents?.svg) return null;
  return defineAsyncComponent(config.value.vueComponents.svg);
});

const data = computed(() => ({
  voltage: props.voltage,
  criticalVoltage: props.criticalVoltage,
  capacity: props.capacity,
  status: 'ON'
}));

const effectiveMode = computed(() => {
  if (props.mode === '3d' && is3DAvailable.value && config.value) return '3d';
  return 'svg';
});

onMounted(() => {
  const webGL = checkWebGLSupport();
  is3DAvailable.value = webGL.isSupported;
  console.log('[BatteryRenderer] 3D available:', is3DAvailable.value);
});

const onModelReady = (data) => emit('model-ready', data);
const onModelUpdate = (data) => emit('model-update', data);
</script>

<style scoped>
.battery-renderer {
  width: 100%;
  aspect-ratio: 1 / 1;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}
</style>
