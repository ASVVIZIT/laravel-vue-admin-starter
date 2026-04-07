<template>
  <PowerBaseThree
      :three="three"
      :scene="scene"
      :camera="camera"
      :renderer="renderer"
      :visual-config="visualConfig"
      :specs="specs"
      :voltage="voltage"
      :status="status"
      :width="width"
      :height="height"
      @model-ready="onModelReady"
      @model-update="onModelUpdate"
  />
</template>

<script setup>
import { computed } from 'vue';
import PowerBaseThree from './PowerBaseThree.vue';
import { useVisualizationConfigStore } from '@/components/SmartLight/stores/smartlight/visualizationConfigStore.js';

const props = defineProps({
  three: { type: Object, required: true },
  scene: { type: Object, required: true },
  camera: { type: Object, default: null },
  renderer: { type: Object, default: null },
  voltage: { type: Number, default: 5 },
  status: { type: String, default: 'OFF' },
  width: { type: String, default: '80px' },
  height: { type: String, default: '80px' }
});

const emit = defineEmits(['model-ready', 'model-update']);

const configStore = useVisualizationConfigStore();
const config = computed(() => configStore.getPowerSupplyConfigStore('usb-5v'));

const visualConfig = computed(() => config.value?.visualConfig || {});
const specs = computed(() => config.value?.specs || {
  voltageRange: { min: 4.5, max: 5.5 },
  currentRange: { min: 0, max: 2000 }
});

const onModelReady = (data) => emit('model-ready', data);
const onModelUpdate = (data) => emit('model-update', data);
</script>

<style scoped>
/* Стили контейнера полностью управляются PowerBaseThree */
</style>
