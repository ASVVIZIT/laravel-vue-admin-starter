<template>
  <div class="power-solar-svg">
    <PowerBaseSvg
        :status="status"
        :voltage="voltage"
        :label="label"
        :width="width"
        :height="height"
        :show-glow="showGlow"
    >
      <template #power>
        <div class="power-solar">
          <!-- Солнечная панель -->
          <div class="solar-panel" :style="{ backgroundColor: panelColor }">
            <!-- Ячейки панели -->
            <div
                v-for="i in cellCount"
                :key="i"
                class="solar-cell"
                :style="{ backgroundColor: cellColor }"
            ></div>
          </div>
          <!-- Солнце (анимированное) -->
          <div
              v-if="isActive"
              class="solar-sun"
              :style="{
              backgroundColor: sunColor,
              animation: isActive ? 'sun-pulse 2s infinite' : 'none'
            }"
          ></div>
          <div class="power-solar-label">{{ label }}</div>
        </div>
      </template>
    </PowerBaseSvg>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import PowerBaseSvg from './PowerBaseSvg.vue';
import { useVisualizationConfigStore } from '@/components/SmartLight/stores/smartlight/visualizationConfigStore.js';

const props = defineProps({
  status: { type: String, default: 'OFF' },
  voltage: { type: Number, default: 0 },
  width: { type: String, default: '60px' },
  height: { type: String, default: '80px' },
  showGlow: { type: Boolean, default: true }
});

const configStore = useVisualizationConfigStore();
// ✅ Динамический поиск конфига по фиксированному ID типа
const config = computed(() => configStore.getPowerSupplyConfigStore('solar'));

const label = computed(() => config.value?.shortName ?? 'Solar');
const isActive = computed(() => props.status === 'ON' || props.status === 'ACTIVE');

// ✅ Параметры панели из конфига (с fallback)
const panelColor = computed(() => {
  const colorValue = config.value?.visualConfig?.material?.panel?.color;
  return typeof colorValue === 'number' ? '#' + colorValue.toString(16).padStart(6, '0') : '#1a237e';
});

const cellColor = computed(() => {
  const colorValue = config.value?.visualConfig?.material?.cells?.color;
  return typeof colorValue === 'number' ? '#' + colorValue.toString(16).padStart(6, '0') : '#283593';
});

const cellCount = computed(() => config.value?.visualConfig?.material?.cells?.count ?? 6);

const sunColor = computed(() => {
  const colorValue = config.value?.visualConfig?.material?.sun?.color;
  return typeof colorValue === 'number' ? '#' + colorValue.toString(16).padStart(6, '0') : '#ff9800';
});
</script>

<style scoped>
.power-solar-svg {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.power-solar {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.solar-panel {
  width: 50px;
  height: 25px;
  border-radius: 4px;
  border: 1px solid #d0d0d0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 2px;
  padding: 2px;
  background: #1a237e;
  transition: background-color 0.3s ease;
}

.solar-cell {
  border-radius: 2px;
  background: #283593;
  transition: background-color 0.3s ease;
}

.solar-sun {
  position: absolute;
  top: -15px;
  right: -10px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ff9800;
  box-shadow: 0 0 10px rgba(255, 152, 0, 0.6);
}

.power-solar-label {
  margin-top: 4px;
  font-size: 8px;
  color: #606266;
}

@keyframes sun-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.8; }
}
</style>
