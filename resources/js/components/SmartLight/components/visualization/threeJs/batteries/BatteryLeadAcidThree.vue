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
  voltage: { type: Number, default: 12.0 },
  criticalVoltage: { type: Number, default: 11.0 },
  status: { type: String, default: 'ON' },
  width: { type: String, default: '80px' },
  height: { type: String, default: '80px' }
});

const emit = defineEmits(['model-ready', 'model-update']);

const configStore = useVisualizationConfigStore();
const config = computed(() => configStore.getBatteryConfigStore('lead-acid-12v'));

const visualConfig = computed(() => config.value?.visualConfig || {});
const specs = computed(() => config.value?.specs || { minVoltage: 10.5, maxVoltage: 14.4, nominalVoltage: 12.0, capacity: 7000 });

const onModelReady = (data) => emit('model-ready', data);
const onModelUpdate = (data) => emit('model-update', data);
</script>

<style scoped>
/* Стили контейнера управляются BatteryBaseThree */
</style>
