<template>
  <div class="battery-renderer">
    <!-- 3D Mode -->
    <UniversalThreeScene
        v-if="effectiveMode === '3d' && config"
        :key="`3d-${deviceId}-${batteryTypeId}-${effectiveMode}`"
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
        :key="`svg-${deviceId}-${batteryTypeId}-${effectiveMode}`"
        :voltage="voltage"
        :critical-voltage="criticalVoltage"
        :status="status"
        :height="svgHeight"
    />
  </div>
</template>

<script setup>
import {computed, ref, onMounted, watch, defineAsyncComponent} from 'vue';
import UniversalThreeScene from '@/components/SmartLight/components/visualization/threeJs/UniversalThreeScene.vue';
import {useVisualizationConfigStore} from '@/components/SmartLight/stores/smartlight/visualizationConfigStore.js';
import {checkWebGLSupport} from '@/components/SmartLight/api/core/utils/coreApiWebglSupportUtils.js';
import {useInterfaceStore} from '@/components/SmartLight/stores/smartlight/interfaceStore.js';

const props = defineProps({
  deviceId: {type: String, required: true},
  batteryTypeId: {type: String, default: 'li-ion-18650'},
  voltage: {type: Number, default: 3.7},
  criticalVoltage: {type: Number, default: 3.2},
  status: {type: String, default: 'ON'},
  capacity: {type: Number, default: 3500},
  mode: {type: String, default: 'svg', validator: (v) => ['svg', '3d'].includes(v)}
});

const emit = defineEmits(['model-ready', 'model-update']);
const configStore = useVisualizationConfigStore();
const interfaceStore = useInterfaceStore();
const is3DAvailable = ref(false);
const svgHeight = '50px';

const config = computed(() => configStore.getBatteryConfigStore(props.batteryTypeId));
const threeComponent = computed(() => config.value?.vueComponents?.three ? defineAsyncComponent(config.value.vueComponents.three) : null);
const svgComponent = computed(() => config.value?.vueComponents?.svg ? defineAsyncComponent(config.value.vueComponents.svg) : null);
const data = computed(() => ({
  voltage: props.voltage,
  criticalVoltage: props.criticalVoltage,
  capacity: props.capacity,
  status: props.status
}));
const effectiveMode = computed(() => props.mode === '3d' && is3DAvailable.value && config.value ? '3d' : 'svg');

// ✅ ЛОГИРОВАНИЕ В ОБЩУЮ ПАНЕЛЬ
const log = (msg, data = null) => {
  const logData = data && Object.keys(data).length > 0 ? data : null;
  interfaceStore.addLogStore({ component: 'BatteryRenderer', message: msg, data: logData, level: 'info' });
};

onMounted(() => {
  const webGL = checkWebGLSupport();
  is3DAvailable.value = webGL.isSupported;
  log('Mounted', {battery: props.batteryTypeId, webGL: webGL.isSupported, mode: props.mode});
});

watch(() => effectiveMode.value, (mode) => {
  log('Mode changed', {from: props.mode, to: mode, available: is3DAvailable.value, hasConfig: !!config.value});
}, {immediate: true});

const onModelReady = (data) => {
  log('Model ready', data);
  emit('model-ready', data);
};
const onModelUpdate = (data) => emit('model-update', data);
</script>

<style scoped>
.battery-renderer {
  width: 100%;
  aspect-ratio: 1/1;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
