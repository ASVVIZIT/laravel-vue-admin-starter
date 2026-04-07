<template>
  <div class="power-dc12v-svg">
    <PowerBaseSvg
        :status="status"
        :voltage="voltage"
        :label="label"
        :width="width"
        :height="height"
        :show-glow="showGlow"
    >
      <template #power>
        <div class="power-dc12v">
          <!-- Иконка клеммного блока -->
          <div class="power-dc12v-icon" :style="{ backgroundColor: iconColor }">
            <svg viewBox="0 0 24 24" width="20" height="16" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="2" y="6" width="20" height="10" rx="2" />
              <line x1="8" y1="4" x2="8" y2="8" stroke-linecap="round"/>
              <line x1="16" y1="4" x2="16" y2="8" stroke-linecap="round"/>
              <circle cx="8" cy="11" r="1.5" fill="currentColor" stroke="none"/>
              <circle cx="16" cy="11" r="1.5" fill="currentColor" stroke="none"/>
            </svg>
          </div>
          <!-- Провода -->
          <div class="power-dc12v-wires">
            <div class="wire positive"></div>
            <div class="wire negative"></div>
          </div>
          <!-- Подпись -->
          <div class="power-dc12v-label">{{ label }}</div>
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
  voltage: { type: Number, default: 12 },
  width: { type: String, default: '60px' },
  height: { type: String, default: '80px' },
  showGlow: { type: Boolean, default: true }
});

const configStore = useVisualizationConfigStore();
const config = computed(() => configStore.getPowerSupplyConfigStore('dc-12v'));

const label = computed(() => config.value?.shortName ?? 'DC 12V');

const iconColor = computed(() => {
  if (props.status === 'ERROR') return '#fef0f0';
  if (props.status === 'ON' || props.status === 'ACTIVE') return '#e8f5e9';
  return '#f5f7fa';
});
</script>

<style scoped>
.power-dc12v-svg {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.power-dc12v {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.power-dc12v-icon {
  width: 40px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid #d0d0d0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #263238;
  color: #eceff1;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.power-dc12v-icon:hover {
  background: #37474f;
}

.power-dc12v-wires {
  display: flex;
  gap: 10px;
  margin: 4px 0 2px;
}

.wire {
  width: 2px;
  height: 14px;
  border-radius: 1px;
  transition: box-shadow 0.3s ease;
}

.wire.positive { background: #f56c6c; }
.wire.negative { background: #333333; }

.power-active .wire.positive { box-shadow: 0 0 6px #f56c6c; }
.power-active .wire.negative { box-shadow: 0 0 6px #333333; }

.power-dc12v-label {
  font-size: 8px;
  color: #606266;
  text-align: center;
}
</style>
