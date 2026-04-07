<template>
  <div class="battery-prismatic-svg">
    <!-- Базовый компонент с параметрами для призматических батарей -->
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

    <!-- Специфичные детали призматической батареи (плоская форма) -->
    <div class="battery-prismatic-details">
      <span class="battery-type-label">{{ shortName }}</span>
      <span class="battery-capacity-label">{{ capacity }}мАч</span>
      <span class="battery-chemistry-badge">{{ chemistry }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import BatteryBaseSvg from './BatteryBaseSvg.vue';
import { useVisualizationConfigStore } from '@/components/SmartLight/stores/smartlight/visualizationConfigStore.js';

const props = defineProps({
  voltage: { type: Number, default: 3.2 },
  criticalVoltage: { type: Number, default: 2.5 },
  status: { type: String, default: 'ON' },
  height: { type: String, default: '50px' },
  showLevels: { type: Boolean, default: true },
  showMarkers: { type: Boolean, default: true }
});

const configStore = useVisualizationConfigStore();
// ✅ Поиск конфига для призматической батареи (LiFePO4 и др.)
const config = computed(() => configStore.getBatteryConfigStore('li-fe-po4'));

// ✅ Параметры из specs
const minVoltage = computed(() => config.value?.specs?.minVoltage ?? 2.0);
const maxVoltage = computed(() => config.value?.specs?.maxVoltage ?? 3.65);
const colors = computed(() => config.value?.visualConfig?.colors ?? {
  normal: '#4caf50',
  warning: '#ff9800',
  critical: '#f44336',
  off: '#9e9e9e'
});
const scale = computed(() => config.value?.visualConfig?.scale ?? 1.25);
const shortName = computed(() => config.value?.shortName ?? 'LiFePO4');
const capacity = computed(() => config.value?.specs?.capacity ?? 6000);
const chemistry = computed(() => config.value?.specs?.chemistry?.toUpperCase() ?? 'LI-FE-PO4');

// ✅ Конвертация цвета крышки
const capColorHex = computed(() => {
  const colorValue = config.value?.visualConfig?.material?.cap?.color;
  if (typeof colorValue === 'number') {
    return '#' + colorValue.toString(16).padStart(6, '0');
  }
  return '#ffa640';
});
</script>

<style scoped>
.battery-prismatic-svg {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.battery-prismatic-details {
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
  background: #e8f5e9;
  color: #2e7d32;
  padding: 1px 4px;
  border-radius: 2px;
  font-size: 7px;
  font-weight: 500;
}
</style>
