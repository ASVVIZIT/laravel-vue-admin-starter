<template>
  <BatteryBaseThree
      :three="three"
      :scene="scene"
      :camera="camera"
      :renderer="renderer"
      :visual-config="visualConfig"
      :specs="specs"
      :voltage="voltage"
      :critical-voltage="criticalVoltage"
      :status="status"
      :width="width"
      :height="height"
      @model-ready="onModelReady"
      @model-update="onModelUpdate"
  />
</template>

<script setup>
import { computed } from 'vue';
import BatteryBaseThree from './BatteryBaseThree.vue';
import { useVisualizationConfigStore } from '@/components/SmartLight/stores/smartlight/visualizationConfigStore.js';

const props = defineProps({
  three: { type: Object, required: true },
  scene: { type: Object, required: true },
  camera: { type: Object, default: null },
  renderer: { type: Object, default: null },
  voltage: { type: Number, default: 3.7 },
  criticalVoltage: { type: Number, default: 3.2 },
  status: { type: String, default: 'ON' },
  batteryTypeId: { type: String, default: 'ni-mh-aa' },
  width: { type: String, default: '80px' },
  height: { type: String, default: '80px' }
});

const emit = defineEmits(['model-ready', 'model-update']);

const configStore = useVisualizationConfigStore();
// ✅ Динамическая загрузка конфига по переданному ID типа
const config = computed(() => configStore.getBatteryConfigStore(props.batteryTypeId));

const visualConfig = computed(() => config.value?.visualConfig || {});
const specs = computed(() => config.value?.specs || { minVoltage: 1.0, maxVoltage: 1.4, nominalVoltage: 1.2, capacity: 2000 });

const onModelReady = (data) => emit('model-ready', data);
const onModelUpdate = (data) => emit('model-update', data);
</script>

<style scoped>
.battery-three-wrapper {
  width: 100%;
  height: 100%;
  display: block;
  position: relative;
}
</style>
