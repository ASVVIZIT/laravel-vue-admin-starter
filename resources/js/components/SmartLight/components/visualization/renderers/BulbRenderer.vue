<template>
  <div class="bulb-renderer">
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
        :intensity="intensity"
        :width="svgWidth"
        :height="svgHeight"
    />
  </div>
</template>

<script setup>
import {computed, ref, onMounted, defineAsyncComponent} from 'vue';
import UniversalThreeScene from '@/components/SmartLight/components/visualization/threeJs/UniversalThreeScene.vue';
import {useVisualizationConfigStore} from '@/components/SmartLight/stores/smartlight/visualizationConfigStore.js';
import {checkWebGLSupport} from '@/components/SmartLight/api/core/utils/coreApiWebglSupportUtils.js';

const props = defineProps({
  deviceId: {type: String, required: true},
  bulbTypeId: {type: String, default: 'classic'},
  status: {type: String, default: 'OFF'},
  intensity: {type: Number, default: 0},
  rgbColor: {type: String, default: '#ffffff'},
  mode: {type: String, default: 'svg', validator: (v) => ['svg', '3d'].includes(v)}
});

const emit = defineEmits(['model-ready', 'model-update']);

const configStore = useVisualizationConfigStore();
const is3DAvailable = ref(false);
const svgWidth = '60px';
const svgHeight = '80px';

const config = computed(() => configStore.getBulbConfigStore(props.bulbTypeId));

const threeComponent = computed(() => {
  if (!config.value?.vueComponents?.three) return null;
  return defineAsyncComponent(config.value.vueComponents.three);
});

const svgComponent = computed(() => {
  if (!config.value?.vueComponents?.svg) return null;
  return defineAsyncComponent(config.value.vueComponents.svg);
});

const data = computed(() => ({
  status: props.status,
  intensity: props.intensity,
  rgbColor: props.rgbColor
}));

const effectiveMode = computed(() => {
  if (props.mode === '3d' && is3DAvailable.value && config.value) return '3d';
  return 'svg';
});

onMounted(() => {
  const webGL = checkWebGLSupport();
  is3DAvailable.value = webGL.isSupported;
  console.log('[BulbRenderer] 3D available:', is3DAvailable.value);
});

const onModelReady = (data) => emit('model-ready', data);
const onModelUpdate = (data) => emit('model-update', data);
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
</style>
