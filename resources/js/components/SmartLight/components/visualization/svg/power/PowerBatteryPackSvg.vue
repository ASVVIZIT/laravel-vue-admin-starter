<template>
  <div class="power-batterypack-svg">
    <PowerBaseSvg
        :status="status"
        :voltage="voltage"
        :label="label"
        :width="width"
        :height="height"
        :show-glow="showGlow"
    >
      <template #power>
        <div class="power-batterypack">
          <!-- Иконка отсека для батареек -->
          <div class="power-batterypack-icon" :style="{ backgroundColor: iconColor }">
            <svg viewBox="0 0 24 24" width="22" height="20" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <line x1="9" y1="4" x2="9" y2="20" />
              <line x1="15" y1="4" x2="15" y2="20" />
              <circle cx="6" cy="12" r="1" fill="currentColor" stroke="none"/>
              <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>
              <circle cx="18" cy="12" r="1" fill="currentColor" stroke="none"/>
            </svg>
          </div>
          <!-- Подпись -->
          <div class="power-batterypack-label">{{ label }}</div>
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
  voltage: { type: Number, default: 6 },
  width: { type: String, default: '60px' },
  height: { type: String, default: '80px' },
  showGlow: { type: Boolean, default: true }
});

const configStore = useVisualizationConfigStore();
const config = computed(() => configStore.getPowerSupplyConfigStore('battery-pack'));

const label = computed(() => config.value?.shortName ?? 'Battery Pack');

const iconColor = computed(() => {
  if (props.status === 'ERROR') return '#fef0f0';
  if (props.status === 'ON' || props.status === 'ACTIVE') return '#fff3e0';
  return '#f5f7fa';
});
</script>

<style scoped>
.power-batterypack-svg {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.power-batterypack {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.power-batterypack-icon {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  border: 1px solid #d0d0d0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ef6c00;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.power-batterypack-icon:hover { color: #ff9800; }

.power-batterypack-label {
  font-size: 8px;
  color: #606266;
  margin-top: 4px;
  text-align: center;
}
</style>
