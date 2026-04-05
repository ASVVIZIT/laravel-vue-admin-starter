<template>
  <div class="battery-18650-svg">
    <!-- Базовый компонент с конфигом из store -->
    <BatteryBaseSvg
        :voltage="voltage"
        :critical-voltage="criticalVoltage"
        :min-voltage="minVoltage"
        :max-voltage="maxVoltage"
        :colors="colors"
        :height="height"
        :show-levels="showLevels"
        :show-markers="showMarkers"
        :scale="scale"
        :cap-color="capColorHex"
    />

    <!-- Специфичные детали типа 18650 -->
    <div class="battery-18650-details">
      <span class="battery-type-label">{{ shortName }}</span>
      <span class="battery-capacity-label">{{ capacity }}мАч</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import BatteryBaseSvg from './BatteryBaseSvg.vue';
import { useVisualizationConfigStore } from '@/components/SmartLight/stores/smartlight/visualizationConfigStore.js';

const props = defineProps({
  /** Текущее напряжение */
  voltage: { type: Number, default: 3.7 },
  /** Критическое напряжение */
  criticalVoltage: { type: Number, default: 3.2 },
  /** Высота компонента */
  height: { type: String, default: '50px' },
  /** Показывать уровни напряжения */
  showLevels: { type: Boolean, default: true },
  /** Показывать маркеры */
  showMarkers: { type: Boolean, default: true }
});

const configStore = useVisualizationConfigStore();
const config = computed(() => configStore.getBatteryConfigStore('li-ion-18650'));

const minVoltage = computed(() => config.value?.specs?.minVoltage || 2.5);
const maxVoltage = computed(() => config.value?.specs?.maxVoltage || 4.2);
const colors = computed(() => config.value?.visualConfig?.colors || {
  normal: '#67c23a',
  warning: '#e6a23c',
  critical: '#f56c6c',
  off: '#909399'
});
const scale = computed(() => config.value?.visualConfig?.scale || 1.15);
const shortName = computed(() => config.value?.shortName || '18650');
const capacity = computed(() => config.value?.specs?.capacity || 3500);

const capColorHex = computed(() => {
  const colorValue = config.value?.visualConfig?.material?.cap?.color;
  if (typeof colorValue === 'number') {
    return '#' + colorValue.toString(16).padStart(6, '0');
  }
  return '#ffa640';
});
</script>

<style scoped>
.battery-18650-svg {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.battery-18650-details {
  display: flex;
  gap: 8px;
  font-size: 8px;
  color: #606266;
}

.battery-type-label {
  font-weight: 600;
}

.battery-capacity-label {
  color: #909399;
}
</style>
