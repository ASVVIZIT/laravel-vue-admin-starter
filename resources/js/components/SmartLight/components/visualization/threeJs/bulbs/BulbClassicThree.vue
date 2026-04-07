<template>
  <!-- ✅ Пустой шаблон: вся логика в BulbBaseThree -->
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
import BulbBaseThree from './BulbBaseThree.vue'; // ✅ Только импорт базового компонента
import { useVisualizationConfigStore } from '@/components/SmartLight/stores/smartlight/visualizationConfigStore.js';

// ❌ НЕТ import * as THREE from 'three' — как вы и просили!

const props = defineProps({
  three: { type: Object, required: true },
  scene: { type: Object, required: true },
  camera: { type: Object, default: null },
  renderer: { type: Object, default: null },
  voltage: { type: Number, default: 3.7 },
  status: { type: String, default: 'OFF' },
  intensity: { type: Number, default: 0 },
  width: { type: String, default: '80px' },
  height: { type: String, default: '80px' }
});

const emit = defineEmits(['model-ready', 'model-update']);

const configStore = useVisualizationConfigStore();
const config = computed(() => configStore.getBulbConfigStore('classic'));

const visualConfig = computed(() => config.value?.visualConfig || {});
const specs = computed(() => config.value?.specs || { efficiency: 10, colorTemp: 2700, lifespan: 1000 });

const onModelReady = (data) => emit('model-ready', data);
const onModelUpdate = (data) => emit('model-update', data);
</script>

<style scoped>
/* Стили управляются базовым компонентом */
</style>
