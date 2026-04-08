<template>
  <div class="battery-renderer">
    <UniversalThreeScene
        v-if="effectiveMode === '3d' && config && threeComponent"
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

    <component
        :is="svgComponent"
        v-else-if="effectiveMode !== '3d' && config && svgComponent"
        :key="`svg-${deviceId}-${batteryTypeId}-${effectiveMode}`"
        :voltage="voltage"
        :critical-voltage="criticalVoltage"
        :status="status"
        :height="svgHeight"
    />

    <div v-else-if="!config" class="renderer-fallback">
      <span>⚙️ Loading config...</span>
    </div>
    <div v-else class="renderer-fallback">
      <span>⚠️ Component not found: {{ batteryTypeId }}</span>
    </div>
  </div>
</template>

<script setup>
import {computed, ref, onMounted, watch, defineAsyncComponent} from 'vue'
import UniversalThreeScene from '@/components/SmartLight/components/visualization/threeJs/UniversalThreeScene.vue'
import {useVisualizationConfigStore} from '@/components/SmartLight/stores/smartlight/visualizationConfigStore.js'
import {checkWebGLSupport} from '@/components/SmartLight/api/core/utils/coreApiWebglSupportUtils.js'
import {useInterfaceStore} from '@/components/SmartLight/stores/smartlight/interfaceStore.js'

const props = defineProps({
  deviceId: {type: String, required: true},
  batteryTypeId: {type: String, default: 'li-ion-18650'},
  voltage: {type: Number, default: 3.7},
  criticalVoltage: {type: Number, default: 3.2},
  status: {type: String, default: 'ON'},
  capacity: {type: Number, default: 3500},
  mode: {type: String, default: 'svg', validator: (v) => ['svg', '3d'].includes(v)}
})

const emit = defineEmits(['model-ready', 'model-update'])
const configStore = useVisualizationConfigStore()
const interfaceStore = useInterfaceStore()
const is3DAvailable = ref(false)
const svgHeight = '50px'

const config = computed(() => configStore.getBatteryConfigStore(props.batteryTypeId))

// ✅ ВОССТАНОВЛЕНО: defineAsyncComponent
const threeComponent = computed(() => {
  if (!config.value?.vueComponents?.three) return null
  return defineAsyncComponent({
    loader: config.value.vueComponents.three,
    loadingComponent: {template: '<span>🧊</span>'},
    errorComponent: {template: '<span>❌</span>'},
    delay: 0,
    timeout: 5000
  })
})

const svgComponent = computed(() => {
  if (!config.value?.vueComponents?.svg) return null
  return defineAsyncComponent({
    loader: config.value.vueComponents.svg,
    loadingComponent: {template: '<span>🖼️</span>'},
    errorComponent: {template: '<span>❌</span>'},
    delay: 0,
    timeout: 5000
  })
})

const data = computed(() => ({
  voltage: props.voltage,
  criticalVoltage: props.criticalVoltage,
  capacity: props.capacity,
  status: props.status
}))

const effectiveMode = computed(() => {
  if (!config.value) return 'svg'
  if (props.mode === '3d' && is3DAvailable.value) return '3d'
  return 'svg'
})

const log = (msg, data = null) => {
  const logData = data && Object.keys(data).length > 0 ? data : null
  interfaceStore.addLogStore({component: 'BatteryRenderer', message: msg, logData, level: 'info'})
}

onMounted(() => {
  const webGL = checkWebGLSupport()
  is3DAvailable.value = webGL.isSupported
  log('Mounted', {battery: props.batteryTypeId, webGL: webGL.isSupported, mode: props.mode, hasConfig: !!config.value})
})

watch(() => config.value, (cfg) => {
  log('Config', {id: cfg?.id, hasThree: !!cfg?.vueComponents?.three, hasSvg: !!cfg?.vueComponents?.svg})
}, {immediate: true})

const onModelReady = (data) => {
  log('Model ready', data);
  emit('model-ready', data)
}
const onModelUpdate = (data) => emit('model-update', data)
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

.renderer-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(245, 247, 250, 0.9);
  color: #606266;
  font-size: 10px;
  border-radius: 4px;
}
</style>
