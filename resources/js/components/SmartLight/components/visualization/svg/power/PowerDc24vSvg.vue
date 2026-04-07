<template>
  <div class="power-dc24v-svg">
    <PowerBaseSvg
        :status="status"
        :voltage="voltage"
        :label="label"
        :width="width"
        :height="height"
        :show-glow="showGlow"
    >
      <template #power>
        <div class="power-dc24v">
          <!-- Иконка промышленной клеммной колодки -->
          <div class="power-dc24v-icon" :style="{ backgroundColor: iconColor }">
            <svg viewBox="0 0 24 24" width="20" height="16" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="2" y="6" width="20" height="10" rx="2" />
              <line x1="7" y1="4" x2="7" y2="8" stroke-linecap="round"/>
              <line x1="11" y1="4" x2="11" y2="8" stroke-linecap="round"/>
              <line x1="17" y1="4" x2="17" y2="8" stroke-linecap="round"/>
              <circle cx="7" cy="11" r="1.5" fill="currentColor" stroke="none"/>
              <circle cx="11" cy="11" r="1.5" fill="currentColor" stroke="none"/>
              <circle cx="17" cy="11" r="1.5" fill="currentColor" stroke="none"/>
            </svg>
          </div>
          <!-- Провода (4 шт для 24В) -->
          <div class="power-dc24v-wires">
            <div class="wire pos"></div>
            <div class="wire pos"></div>
            <div class="wire neg"></div>
            <div class="wire neg"></div>
          </div>
          <div class="power-dc24v-label">{{ label }}</div>
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
  voltage: { type: Number, default: 24 },
  width: { type: String, default: '60px' },
  height: { type: String, default: '80px' },
  showGlow: { type: Boolean, default: true }
});

const configStore = useVisualizationConfigStore();
const config = computed(() => configStore.getPowerSupplyConfigStore('dc-24v'));

const label = computed(() => config.value?.shortName ?? 'DC 24V');

const iconColor = computed(() => {
  if (props.status === 'ERROR') return '#fef0f0';
  if (props.status === 'ON' || props.status === 'ACTIVE') return '#e8f5e9';
  return '#f5f7fa';
});
</script>

<style scoped>
.power-dc24v-svg {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.power-dc24v {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.power-dc24v-icon {
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

.power-dc24v-icon:hover { background: #37474f; }

.power-dc24v-wires {
  display: flex;
  gap: 6px;
  margin: 4px 0 2px;
}

.wire {
  width: 2px;
  height: 14px;
  border-radius: 1px;
  transition: box-shadow 0.3s ease;
}

.wire.pos { background: #f56c6c; }
.wire.neg { background: #333333; }

.power-status-on .wire.pos,
.power-status-active .wire.pos { box-shadow: 0 0 6px rgba(245, 108, 108, 0.6); }
.power-status-on .wire.neg,
.power-status-active .wire.neg { box-shadow: 0 0 6px rgba(51, 51, 51, 0.4); }

.power-dc24v-label {
  font-size: 8px;
  color: #606266;
  text-align: center;
  margin-top: 2px;
}
</style>
