<template>
  <div class="battery-cylindrical-wrapper">
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
        :is-box="false"
        :body-color="bodyColorHex"
    />
    <!-- Детали под иконкой -->
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
  voltage: { type: Number, default: 3.7 },
  criticalVoltage: { type: Number, default: 2.5 },
  status: { type: String, default: 'ON' },
  batteryTypeId: { type: String, default: 'li-ion-18650' },
  height: { type: String, default: '50px' },
  showLevels: { type: Boolean, default: true },
  showDetails: { type: Boolean, default: true }
})

const configStore = useVisualizationConfigStore()
const config = computed(() => configStore.getBatteryConfigStore(props.batteryTypeId))

// Динамические параметры
const minVoltage = computed(() => config.value?.specs?.minVoltage ?? 2.5)
const maxVoltage = computed(() => config.value?.specs?.maxVoltage ?? 4.2)
const colors = computed(() => config.value?.visualConfig?.colors ?? {})
const shortName = computed(() => config.value?.shortName ?? 'Cell')

const capColorHex = computed(() => {
  const c = config.value?.visualConfig?.materials?.cap?.color
  return typeof c === 'number' ? '#' + c.toString(16).padStart(6, '0') : '#c0c4cc'
})
const bodyColorHex = computed(() => {
  const c = config.value?.visualConfig?.materials?.body?.color
  return typeof c === 'number' ? '#' + c.toString(16).padStart(6, '0') : '#e0e0e0'
})
</script>

<style scoped>
.battery-cylindrical-wrapper {
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
