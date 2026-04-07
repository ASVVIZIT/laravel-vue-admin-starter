<template>
  <BulbBaseThree
      :three="three"
      :scene="scene"
      :camera="camera"
      :renderer="renderer"
      :visual-config="visualConfig"
      :specs="specs"
      :voltage="voltage"
      :status="status"
      :intensity="intensity"
      :width="width"
      :height="height"
      @model-ready="onModelReady"
      @model-update="onModelUpdate"
  />
</template>

<script setup>
import { computed } from 'vue';
import BulbBaseThree from './BulbBaseThree.vue';
import { useVisualizationConfigStore } from '@/components/SmartLight/stores/smartlight/visualizationConfigStore.js';

const props = defineProps({
  three: { type: Object, required: true },
  scene: { type: Object, required: true },
  camera: { type: Object, default: null },
  renderer: { type: Object, default: null },
  voltage: { type: Number, default: 12 },
  status: { type: String, default: 'OFF' },
  intensity: { type: Number, default: 0 },
  width: { type: String, default: '80px' },
  height: { type: String, default: '80px' }
});

const emit = defineEmits(['model-ready', 'model-update']);

const configStore = useVisualizationConfigStore();
const config = computed(() => configStore.getBulbConfigStore('led-strip'));

const visualConfig = computed(() => config.value?.visualConfig || {});
const specs = computed(() => config.value?.specs || {
  efficiency: 75,
  colorTemp: 4000,
  lifespan: 20000,
  type: 'smd5050'
});

const onModelReady = (data) => emit('model-ready', data);
const onModelUpdate = (data) => emit('model-update', data);
</script>

<style scoped>
/* Контейнер и стили полностью управляются BulbBaseThree */
</style>
