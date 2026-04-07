<template>
  <div class="battery-lead-acid-svg">
    <!-- Базовый компонент с параметрами для свинцово-кислотных АКБ -->
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
        :cap-color="terminalColorHex"
    />

    <!-- Специфичные детали свинцово-кислотной батареи -->
    <div class="battery-lead-acid-details">
      <span class="battery-type-label">{{ shortName }}</span>
      <span class="battery-capacity-label">{{ capacity }}мАч</span>
      <span class="battery-voltage-label">{{ nominalVoltage }}В</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import BatteryBaseSvg from './BatteryBaseSvg.vue';
import { useVisualizationConfigStore } from '@/components/SmartLight/stores/smartlight/visualizationConfigStore.js';

const props = defineProps({
  voltage: { type: Number, default: 12.0 },
  criticalVoltage: { type: Number, default: 11.0 },
  status: { type: String, default: 'ON' },
  height: { type: String, default: '60px' },
  showLevels: { type: Boolean, default: true },
  showMarkers: { type: Boolean, default: true }
});

const configStore = useVisualizationConfigStore();
// ✅ Поиск конфига для свинцово-кислотной батареи
const config = computed(() => configStore.getBatteryConfigStore('lead-acid-12v'));

// ✅ Параметры из specs
const minVoltage = computed(() => config.value?.specs?.minVoltage ?? 10.5);
const maxVoltage = computed(() => config.value?.specs?.maxVoltage ?? 14.4);
const nominalVoltage = computed(() => config.value?.specs?.nominalVoltage ?? 12.0);
const colors = computed(() => config.value?.visualConfig?.colors ?? {
  normal: '#67c23a',
  warning: '#e6a23c',
  critical: '#f56c6c',
  off: '#909399'
});
const scale = computed(() => config.value?.visualConfig?.scale ?? 0.9);
const shortName = computed(() => config.value?.shortName ?? 'Pb-12V');
const capacity = computed(() => config.value?.specs?.capacity ?? 7000);

// ✅ Цвет клемм (терминалов) для свинцовых АКБ
const terminalColorHex = computed(() => {
  const colorValue = config.value?.visualConfig?.material?.terminals?.positive;
  if (typeof colorValue === 'number') {
    return '#' + colorValue.toString(16).padStart(6, '0');
  }
  return '#f56c6c';
});
</script>

<style scoped>
.battery-lead-acid-svg {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.battery-lead-acid-details {
  display: flex;
  gap: 6px;
  font-size: 8px;
  color: #606266;
  align-items: center;
}

.battery-type-label {
  font-weight: 600;
}

.battery-capacity-label,
.battery-voltage-label {
  color: #909399;
}

.battery-voltage-label::before {
  content: '|';
  margin: 0 4px;
  color: #dcdfe6;
}
</style>
