<template>
  <div class="power-generator-svg">
    <PowerBaseSvg
        :status="status"
        :voltage="voltage"
        :label="label"
        :width="width"
        :height="height"
        :show-glow="showGlow"
    >
      <template #power>
        <div class="power-generator">
          <!-- Иконка генератора -->
          <div class="power-generator-icon" :style="{ backgroundColor: iconColor }">
            <svg viewBox="0 0 24 24" width="22" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 16v4H5v-4" />
              <path d="M20 12H4l2-4h12l2 4z" />
              <path d="M6 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
              <path d="M9 12v4M15 12v4" />
            </svg>
          </div>
          <!-- Подпись -->
          <div class="power-generator-label">{{ label }}</div>
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
const config = computed(() => configStore.getPowerSupplyConfigStore('generator'));

const label = computed(() => config.value?.shortName ?? 'Generator');

const iconColor = computed(() => {
  if (props.status === 'ERROR') return '#fef0f0';
  if (props.status === 'ON' || props.status === 'ACTIVE') return '#e3f2fd';
  return '#f5f7fa';
});
</script>

<style scoped>
.power-generator-svg {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.power-generator {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.power-generator-icon {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  border: 1px solid #d0d0d0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #455a64;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.power-generator-icon:hover {
  color: #1976d2;
  border-color: #409eff;
}

.power-generator-label {
  margin-top: 4px;
  font-size: 8px;
  color: #606266;
  font-weight: 500;
  text-align: center;
}
</style>
