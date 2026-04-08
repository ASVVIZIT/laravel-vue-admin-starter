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
  voltage: { type: Number, default: 3.7 },
  criticalVoltage: { type: Number, default: 2.5 },
  status: { type: String, default: 'ON' },
  batteryTypeId: { type: String, default: 'li-ion-18350' },
  height: { type: String, default: '35px' },
  showLevels: { type: Boolean, default: true },
  showMarkers: { type: Boolean, default: true }
})

const configStore = useVisualizationConfigStore()
const config = computed(() => configStore.getBatteryConfigStore(props.batteryTypeId))

const minVoltage = computed(() => config.value?.specs?.minVoltage ?? 2.5)
const maxVoltage = computed(() => config.value?.specs?.maxVoltage ?? 4.2)
const colors = computed(() => config.value?.visualConfig?.colors ?? { normal: '#67c23a', warning: '#e6a23c', critical: '#f56c6c', off: '#909399' })
const scale = computed(() => config.value?.visualConfig?.scale ?? 0.85)
const shortName = computed(() => config.value?.shortName ?? '18350')
const capacity = computed(() => config.value?.specs?.capacity ?? 1200)
const chemistry = computed(() => config.value?.specs?.chemistry?.toUpperCase() ?? 'LI-ION')

const capColorHex = computed(() => {
  const colorValue = config.value?.visualConfig?.materials?.cap?.color
  if (typeof colorValue === 'number') return '#' + colorValue.toString(16).padStart(6, '0')
  return '#ff9800'
})
</script>

<style scoped>
.battery-cylindrical-svg{display:flex;flex-direction:column;align-items:center;gap:4px}
.battery-cylindrical-details{display:flex;gap:6px;font-size:8px;color:#606266;align-items:center}
.battery-type-label{font-weight:600}
.battery-capacity-label{color:#909399}
.battery-chemistry-badge{background:#e3f2fd;color:#1976d2;padding:1px 4px;border-radius:2px;font-size:7px;font-weight:500}
</style>
