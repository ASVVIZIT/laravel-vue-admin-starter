<template>
  <div class="bulb-renderer">
    <!-- ✅ 3D Mode: defineAsyncComponent + правильные условия -->
    <UniversalThreeScene
        v-if="effectiveMode === '3d' && config && threeComponent"
        :key="`3d-${deviceId}-${bulbTypeId}-${effectiveMode}`"
        mode="full"
        :device-id="deviceId"
        :config="config"
        :data="data"
        :model-component="threeComponent"
        :enable-debug="true"
        @model-ready="onModelReady"
        @model-update="onModelUpdate"
    />

    <!-- ✅ SVG Fallback -->
    <component
        :is="svgComponent"
        v-else-if="effectiveMode !== '3d' && config && svgComponent"
        :key="`svg-${deviceId}-${bulbTypeId}-${effectiveMode}`"
        :status="status"
        :intensity="intensity"
        :width="svgWidth"
        :height="svgHeight"
    />

    <!-- ✅ FALLBACK: если нет конфига -->
    <div v-else-if="!config" class="renderer-fallback">
      <span>⚙️ Loading config...</span>
    </div>

    <!-- ✅ FINAL FALLBACK: если компонент не загрузился -->
    <div v-else class="renderer-fallback">
      <span>⚠️ Component not found: {{ bulbTypeId }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch, defineAsyncComponent } from 'vue'
import UniversalThreeScene from '@/components/SmartLight/components/visualization/threeJs/UniversalThreeScene.vue'
import { useVisualizationConfigStore } from '@/components/SmartLight/stores/smartlight/visualizationConfigStore.js'
import { checkWebGLSupport } from '@/components/SmartLight/api/core/utils/coreApiWebglSupportUtils.js'
import { useInterfaceStore } from '@/components/SmartLight/stores/smartlight/interfaceStore.js'

const props = defineProps({
  deviceId: { type: String, required: true },
  bulbTypeId: { type: String, default: 'classic' },
  status: { type: String, default: 'OFF' },
  intensity: { type: Number, default: 0 },
  rgbColor: { type: String, default: '#ffffff' },
  mode: { type: String, default: 'svg', validator: (v) => ['svg', '3d'].includes(v) }
})

const emit = defineEmits(['model-ready', 'model-update'])
const configStore = useVisualizationConfigStore()
const interfaceStore = useInterfaceStore()
const is3DAvailable = ref(false)
const svgWidth = '60px'
const svgHeight = '80px'

const config = computed(() => configStore.getBulbConfigStore(props.bulbTypeId))

// ✅ ВОССТАНОВЛЕНО: defineAsyncComponent с обработкой ошибок
const threeComponent = computed(() => {
  if (!config.value?.vueComponents?.three) return null
  return defineAsyncComponent({
    loader: config.value.vueComponents.three,
    loadingComponent: { template: '<span>🧊</span>' },
    errorComponent: { template: '<span>❌</span>' },
    delay: 0,
    timeout: 5000
  })
})

const svgComponent = computed(() => {
  if (!config.value?.vueComponents?.svg) return null
  return defineAsyncComponent({
    loader: config.value.vueComponents.svg,
    loadingComponent: { template: '<span>🖼️</span>' },
    errorComponent: { template: '<span>❌</span>' },
    delay: 0,
    timeout: 5000
  })
})

const data = computed(() => ({
  status: props.status,
  intensity: props.intensity,
  rgbColor: props.rgbColor
}))

const effectiveMode = computed(() => {
  if (!config.value) return 'svg'
  if (props.mode === '3d' && is3DAvailable.value) return '3d'
  return 'svg'
})

const log = (msg, data = null) => {
  const logData = data && Object.keys(data).length > 0 ? data : null
  interfaceStore.addLogStore({
    component: 'BulbRenderer',
    message: msg,
    logData,
    level: 'info'
  })
}

onMounted(() => {
  const webGL = checkWebGLSupport()
  is3DAvailable.value = webGL.isSupported
  log('Mounted', {
    bulb: props.bulbTypeId,
    webGL: webGL.isSupported,
    mode: props.mode,
    hasConfig: !!config.value,
    hasThree: !!config.value?.vueComponents?.three
  })
})

watch(() => config.value, (cfg) => {
  log('Config', {
    id: cfg?.id,
    hasVueComponents: !!cfg?.vueComponents,
    hasThree: !!cfg?.vueComponents?.three,
    hasSvg: !!cfg?.vueComponents?.svg
  })
}, { immediate: true })

const onModelReady = (data) => {
  log('Model ready', data)
  emit('model-ready', data)
}

const onModelUpdate = (data) => emit('model-update', data)
</script>

<style scoped>
.bulb-renderer {
  width: 100%;
  aspect-ratio: 1 / 1;
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
