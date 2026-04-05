<template>
  <div class="power-supply-renderer" :style="{ width, height }">
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
        :status="status"
        :voltage="voltage"
        :width="svgWidth"
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
  supplyTypeId: { type: String, default: 'standard' },
  voltage: { type: Number, default: 220 },
  status: { type: String, default: 'OFF' },
  width: { type: String, default: '100%' },
  height: { type: String, default: '100%' },
  mode: { type: String, default: 'svg', validator: (v) => ['svg', '3d'].includes(v) }
});

const emit = defineEmits(['model-ready', 'model-update']);

const configStore = useVisualizationConfigStore();
const is3DAvailable = ref(false);
const svgWidth = '60px';
const svgHeight = '80px';

const config = computed(() => configStore.getPowerConfigStore(props.supplyTypeId));

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
  status: props.status
}));

const effectiveMode = computed(() => {
  if (props.mode === '3d' && is3DAvailable.value && config.value) return '3d';
  return 'svg';
});

onMounted(() => {
  const webGL = checkWebGLSupport();
  is3DAvailable.value = webGL.isSupported;
  console.log('[PowerSupplyRenderer] 3D available:', is3DAvailable.value);
});

const onModelReady = (data) => emit('model-ready', data);
const onModelUpdate = (data) => emit('model-update', data);
</script>

<style scoped>
.power-supply-renderer {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}
</style>
