<template>
  <div class="power-standard-svg">
    <PowerBaseSvg
        :status="status"
        :voltage="voltage"
        :label="label"
        :width="width"
        :height="height"
        :show-glow="showGlow"
    >
      <template #power>
        <div class="power-standard">
          <!-- Иконка стандартного блока питания -->
          <div class="power-standard-icon" :style="{ backgroundColor: iconColor }">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <!-- Подпись -->
          <div class="power-standard-label">{{ label }}</div>
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
const config = computed(() => configStore.getPowerSupplyConfigStore('standard'));

const label = computed(() => config.value?.shortName ?? 'Standard');

const iconColor = computed(() => {
  if (props.status === 'ERROR') return '#fef0f0';
  if (props.status === 'ON' || props.status === 'ACTIVE') return '#e8f5e9';
  return '#f5f7fa';
});
</script>

<style scoped>
.power-standard-svg {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.power-standard {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.power-standard-icon {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  border: 1px solid #d0d0d0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #606266;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.power-standard-icon:hover {
  color: #67c23a;
  border-color: #67c23a;
}

.power-standard-label {
  margin-top: 4px;
  font-size: 8px;
  color: #606266;
  font-weight: 500;
  text-align: center;
}
</style>
