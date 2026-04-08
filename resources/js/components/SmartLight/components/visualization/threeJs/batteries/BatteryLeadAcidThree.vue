<template>
  <div class="battery-three-wrapper">
    <BatteryBaseThree
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
  </div>
</template>

<script setup>
import { computed } from 'vue'
import BatteryBaseThree from './BatteryBaseThree.vue'
import { useVisualizationConfigStore } from '@/components/SmartLight/stores/smartlight/visualizationConfigStore.js'

const props = defineProps({
  three: Object, scene: Object, camera: Object, renderer: Object,
  visualConfig: Object, specs: Object, voltage: Number,
  status: String, width: String, height: String
})

const emit = defineEmits(['model-ready', 'model-update'])
const configStore = useVisualizationConfigStore()
const config = computed(() => configStore.getBatteryConfigStore('lead-acid-12v'))

const visualConfig = computed(() => config.value?.visualConfig || {})
const specs = computed(() => config.value?.specs || {})

const onModelReady = (d) => emit('model-ready', d)
const onModelUpdate = (d) => emit('model-update', d)
</script>

<style scoped>
.battery-three-wrapper {
  width: 100%;
  height: 100%;
  display: block;
  position: relative;
}
</style>
