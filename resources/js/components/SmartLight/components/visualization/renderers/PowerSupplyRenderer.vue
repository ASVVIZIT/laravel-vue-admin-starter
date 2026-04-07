<template>
  <div class="power-supply-renderer" :style="{ width, height }">
    <!-- 3D Mode -->
    <UniversalThreeScene
        v-if="effectiveMode === '3d' && config"
        :key="`3d-${deviceId}-${supplyTypeId}-${effectiveMode}`"
        mode="full"
        :device-id="deviceId"
        :config="config"
        :data="data"
        :model-component="threeComponent"
        :enable-debug="true"
        @model-ready="onModelReady"
        @model-update="onModelUpdate"
    />
    <!-- SVG Fallback -->
    <component
        :is="svgComponent"
        v-else
        :key="`svg-${deviceId}-${supplyTypeId}-${effectiveMode}`"
        :status="status"
        :voltage="voltage"
        :width="svgWidth"
        :height="svgHeight"
    />
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch, defineAsyncComponent } from 'vue';
import UniversalThreeScene from '@/components/SmartLight/components/visualization/threeJs/UniversalThreeScene.vue';
import { useVisualizationConfigStore } from '@/components/SmartLight/stores/smartlight/visualizationConfigStore.js';
import { checkWebGLSupport } from '@/components/SmartLight/api/core/utils/coreApiWebglSupportUtils.js';
import { useInterfaceStore } from '@/components/SmartLight/stores/smartlight/interfaceStore.js';

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
const interfaceStore = useInterfaceStore();
const is3DAvailable = ref(false);
const svgWidth = '60px';
const svgHeight = '80px';

const config = computed(() => configStore.getPowerSupplyConfigStore(props.supplyTypeId));
const threeComponent = computed(() => config.value?.vueComponents?.three ? defineAsyncComponent(config.value.vueComponents.three) : null);
const svgComponent = computed(() => config.value?.vueComponents?.svg ? defineAsyncComponent(config.value.vueComponents.svg) : null);
const data = computed(() => ({ voltage: props.voltage, status: props.status }));
const effectiveMode = computed(() => props.mode === '3d' && is3DAvailable.value && config.value ? '3d' : 'svg');

// ✅ ЛОГИРОВАНИЕ В ОБЩУЮ ПАНЕЛЬ
const log = (msg, data = null) => {
  const logData = data && Object.keys(data).length > 0 ? data : null;
  interfaceStore.addLogStore({ component: 'PowerSupplyRenderer', message: msg, data: logData, level: 'info' });
};

onMounted(() => {
  const webGL = checkWebGLSupport();
  is3DAvailable.value = webGL.isSupported;
  log('Mounted', { power: props.supplyTypeId, webGL: webGL.isSupported, mode: props.mode });
});

watch(() => effectiveMode.value, (mode) => {
  log('Mode changed', { from: props.mode, to: mode, available: is3DAvailable.value, hasConfig: !!config.value });
}, { immediate: true });

const onModelReady = (data) => { log('Model ready', data); emit('model-ready', data); };
const onModelUpdate = (data) => emit('model-update', data);
</script>

<style scoped>
.power-supply-renderer { width: 100%; height: 100%; position: relative; display: flex; justify-content: center; align-items: center; }
</style>
