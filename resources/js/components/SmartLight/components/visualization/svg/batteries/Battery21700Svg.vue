<template>
  <div class="battery-21700-svg">
    <!-- Базовый компонент с динамическими параметрами -->
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

    <!-- Специфичные детали типа 21700 (больше чем 18650) -->
    <div class="battery-21700-details">
      <span class="battery-type-label">{{ shortName }}</span>
      <span class="battery-capacity-label">{{ capacity }}мАч</span>
      <span class="battery-size-badge">Larger</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import BatteryBaseSvg from './BatteryBaseSvg.vue';
import { useVisualizationConfigStore } from '@/components/SmartLight/stores/smartlight/visualizationConfigStore.js';

const props = defineProps({
  voltage: { type: Number, default: 3.7 },
  criticalVoltage: { type: Number, default: 3.2 },
  status: { type: String, default: 'ON' },
  height: { type: String, default: '50px' },
  showLevels: { type: Boolean, default: true },
  showMarkers: { type: Boolean, default: true }
});

const configStore = useVisualizationConfigStore();
// ✅ Динамический поиск конфига по фиксированному ID типа
const config = computed(() => configStore.getBatteryConfigStore('li-ion-21700'));

// ✅ Получение параметров из specs, а не хардкод
const minVoltage = computed(() => config.value?.specs?.minVoltage ?? 2.5);
const maxVoltage = computed(() => config.value?.specs?.maxVoltage ?? 4.2);
const colors = computed(() => config.value?.visualConfig?.colors ?? {
  normal: '#409eff',
  warning: '#e6a23c',
  critical: '#f56c6c',
  off: '#909399'
});
const scale = computed(() => config.value?.visualConfig?.scale ?? 1.2);
const shortName = computed(() => config.value?.shortName ?? '21700');
const capacity = computed(() => config.value?.specs?.capacity ?? 5000);

// ✅ Конвертация цвета крышки из числа в строку
const capColorHex = computed(() => {
  const colorValue = config.value?.visualConfig?.material?.cap?.color;
  if (typeof colorValue === 'number') {
    return '#' + colorValue.toString(16).padStart(6, '0');
  }
  return '#ffa640';
});
</script>

<style scoped>
.battery-21700-svg {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.battery-21700-details {
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

.battery-size-badge {
  background: #e6a23c;
  color: #fff;
  padding: 1px 4px;
  border-radius: 2px;
  font-size: 7px;
}
</style>
