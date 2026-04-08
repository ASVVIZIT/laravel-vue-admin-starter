<template>
  <div class="battery-box-svg">
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
    <div class="battery-box-details">
      <span class="battery-type-label">{{ shortName }}</span>
      <span class="battery-capacity-label">{{ capacity }}мАч</span>
      <span v-if="chemistry" class="battery-chemistry-badge">{{ chemistry }}</span>
    </div>
  </div>
</template>

<script setup>
import {computed} from 'vue'
import BatteryBaseSvg from './BatteryBaseSvg.vue'
import {useVisualizationConfigStore} from '@/components/SmartLight/stores/smartlight/visualizationConfigStore.js'

const props = defineProps({
  voltage: {type: Number, default: 12.0},
  criticalVoltage: {type: Number, default: 10.5},
  status: {type: String, default: 'ON'},
  batteryTypeId: {type: String, default: 'lead-acid-12v'},
  height: {type: String, default: '45px'},
  showLevels: {type: Boolean, default: true},
  showMarkers: {type: Boolean, default: true}
})

const configStore = useVisualizationConfigStore()
const config = computed(() => configStore.getBatteryConfigStore(props.batteryTypeId))

const minVoltage = computed(() => config.value?.specs?.minVoltage ?? 10.5)
const maxVoltage = computed(() => config.value?.specs?.maxVoltage ?? 14.4)
const colors = computed(() => config.value?.visualConfig?.colors ?? {
  normal: '#67c23a',
  warning: '#e6a23c',
  critical: '#f56c6c',
  off: '#909399'
})
const scale = computed(() => config.value?.visualConfig?.scale ?? 1.0)
const shortName = computed(() => config.value?.shortName ?? 'Pb-12V')
const capacity = computed(() => config.value?.specs?.capacity ?? 7000)
const chemistry = computed(() => config.value?.specs?.chemistry?.toUpperCase() ?? 'Pb')

const capColorHex = computed(() => {
  const colorValue = config.value?.visualConfig?.materials?.terminal?.color
  if (typeof colorValue === 'number') return '#' + colorValue.toString(16).padStart(6, '0')
  return '#f56c6c'
})
</script>

<style scoped>
.battery-box-svg {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.battery-box-details {
  display: flex;
  gap: 6px;
  font-size: 8px;
  color: #606266;
  align-items: center;
}

.battery-type-label {
  font-weight: 600;
}

.battery-capacity-label {
  color: #909399;
}

.battery-chemistry-badge {
  background: #ffebee;
  color: #c62828;
  padding: 1px 4px;
  border-radius: 2px;
  font-size: 7px;
  font-weight: 500;
}
</style>
