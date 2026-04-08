<template>
  <div class="battery-cylindrical-svg">
    <BatteryBaseSvg
        :voltage="voltage"
        :critical-voltage="criticalVoltage"
        :status="status"
        :min-voltage="minVoltage"
        :max-voltage="maxVoltage"
        :colors="colors"
        :height="height"
        :show-levels="showLevels"
        :show-markers="showMarkers"
        :scale="scale"
        :cap-color="capColorHex"
    />
    <div class="battery-cylindrical-details">
      <span class="battery-type-label">{{ shortName }}</span>
      <span class="battery-capacity-label">{{ capacity }}мАч</span>
      <span v-if="chemistry" class="battery-chemistry-badge">{{ chemistry }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import BatteryBaseSvg from './BatteryBaseSvg.vue'
import { useVisualizationConfigStore } from '@/components/SmartLight/stores/smartlight/visualizationConfigStore.js'

const props = defineProps({
  voltage: { type: Number, default: 1.5 },
  criticalVoltage: { type: Number, default: 1.0 },
  status: { type: String, default: 'ON' },
  batteryTypeId: { type: String, default: 'alkaline-aa' },
  height: { type: String, default: '40px' },
  showLevels: { type: Boolean, default: true },
  showMarkers: { type: Boolean, default: true }
})

const configStore = useVisualizationConfigStore()
const config = computed(() => configStore.getBatteryConfigStore(props.batteryTypeId))

const minVoltage = computed(() => config.value?.specs?.minVoltage ?? 0.9)
const maxVoltage = computed(() => config.value?.specs?.maxVoltage ?? 1.6)
const colors = computed(() => config.value?.visualConfig?.colors ?? { normal: '#909399', warning: '#e6a23c', critical: '#f56c6c', off: '#c0c4cc' })
const scale = computed(() => config.value?.visualConfig?.scale ?? 1.0)
const shortName = computed(() => config.value?.shortName ?? 'Alk AA')
const capacity = computed(() => config.value?.specs?.capacity ?? 2800)
const chemistry = computed(() => config.value?.specs?.chemistry?.toUpperCase() ?? 'ALK')

const capColorHex = computed(() => {
  const colorValue = config.value?.visualConfig?.materials?.cap?.color
  if (typeof colorValue === 'number') return '#' + colorValue.toString(16).padStart(6, '0')
  return '#c0c4cc'
})
</script>

<style scoped>
.battery-cylindrical-svg { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.battery-cylindrical-details { display: flex; gap: 6px; font-size: 8px; color: #606266; align-items: center; }
.battery-type-label { font-weight: 600; }
.battery-capacity-label { color: #909399; }
.battery-chemistry-badge { background: #fff3e0; color: #ef6c00; padding: 1px 4px; border-radius: 2px; font-size: 7px; font-weight: 500; }
</style>
