<template>
  <div class="power-ups-svg">
    <PowerBaseSvg
        :status="status"
        :voltage="voltage"
        :label="label"
        :width="width"
        :height="height"
        :show-glow="showGlow"
    >
      <template #power>
        <div class="power-ups">
          <!-- Иконка ИБП (башенка с экраном) -->
          <div class="power-ups-icon" :style="{ backgroundColor: iconColor }">
            <svg viewBox="0 0 24 24" width="20" height="22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="6" y="2" width="12" height="20" rx="2" />
              <rect x="9" y="6" width="6" height="4" rx="1" fill="currentColor" opacity="0.2" />
              <circle cx="9" cy="16" r="1" fill="currentColor" />
              <circle cx="12" cy="16" r="1" fill="currentColor" />
              <circle cx="15" cy="16" r="1" fill="currentColor" />
            </svg>
          </div>
          <!-- Подпись -->
          <div class="power-ups-label">{{ label }}</div>
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
  voltage: { type: Number, default: 220 },
  width: { type: String, default: '60px' },
  height: { type: String, default: '80px' },
  showGlow: { type: Boolean, default: true }
});

const configStore = useVisualizationConfigStore();
const config = computed(() => configStore.getPowerSupplyConfigStore('ups'));

const label = computed(() => config.value?.shortName ?? 'UPS');

const iconColor = computed(() => {
  if (props.status === 'ERROR') return '#fef0f0';
  if (props.status === 'ON' || props.status === 'ACTIVE') return '#e8f5e9';
  return '#f5f7fa';
});
</script>

<style scoped>
.power-ups-svg {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.power-ups {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.power-ups-icon {
  width: 40px;
  height: 42px;
  border-radius: 6px;
  border: 1px solid #d0d0d0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #37474f;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.power-ups-icon:hover { color: #409eff; }

.power-ups-label {
  margin-top: 4px;
  font-size: 8px;
  color: #606266;
  font-weight: 500;
  text-align: center;
}
</style>
