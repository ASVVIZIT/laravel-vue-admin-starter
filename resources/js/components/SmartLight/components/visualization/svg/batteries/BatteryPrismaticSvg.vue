<template>
  <div class="battery-prismatic-wrapper">
    <BatteryBaseSvg
        :voltage="voltage"
        :critical-voltage="criticalVoltage"
        :status="status"
        :min-voltage="minVoltage"
        :max-voltage="maxVoltage"
        :colors="colors"
        :height="height"
        :show-levels="showLevels"
        :cap-color="capColorHex"
        :is-box="true"
        :body-color="bodyColorHex"
    />
    <div class="battery-details" v-if="showDetails">
      <span class="label">{{ shortName }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import BatteryBaseSvg from './BatteryBaseSvg.vue'
import { useVisualizationConfigStore } from '@/components/SmartLight/stores/smartlight/visualizationConfigStore.js'

const props = defineProps({
  voltage: { type: Number, default: 12.0 },
  criticalVoltage: { type: Number, default: 10.5 },
  status: { type: String, default: 'ON' },
  batteryTypeId: { type: String, default: 'lead-acid-12v' },
  height: { type: String, default: '50px' },
  showLevels: { type: Boolean, default: true },
  showDetails: { type: Boolean, default: true }
})

const configStore = useVisualizationConfigStore()
const config = computed(() => configStore.getBatteryConfigStore(props.batteryTypeId))

const minVoltage = computed(() => config.value?.specs?.minVoltage ?? 10.5)
const maxVoltage = computed(() => config.value?.specs?.maxVoltage ?? 14.4)
const colors = computed(() => config.value?.visualConfig?.colors ?? {})
const shortName = computed(() => config.value?.shortName ?? 'Block')

const capColorHex = computed(() => {
  const c = config.value?.visualConfig?.materials?.terminal?.color
  return typeof c === 'number' ? '#' + c.toString(16).padStart(6, '0') : '#333'
})
const bodyColorHex = computed(() => {
  const c = config.value?.visualConfig?.materials?.body?.color
  return typeof c === 'number' ? '#' + c.toString(16).padStart(6, '0') : '#444'
})
</script>

<style scoped>
.battery-prismatic-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.battery-details {
  margin-top: 4px;
  font-size: 9px;
  color: #606266;
  text-align: center;
}
.label {
  font-weight: 600;
}
</style>
