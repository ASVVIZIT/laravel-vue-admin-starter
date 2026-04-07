<template>
  <div class="power-dc-switch-svg" :style="{ width, height }">
    <PowerBaseSvg
        :status="status"
        :voltage="voltage"
        :label="label"
        :width="width"
        :height="height"
        :show-glow="showGlow"
    >
      <template #power>
        <div class="power-dc-switch">
          <!-- Заголовок -->
          <div class="switch-header">
            <span class="switch-title">DC SWITCH</span>
            <span class="switch-status" :class="statusClass">{{ statusText }}</span>
          </div>

          <!-- Переключатель напряжения -->
          <div class="voltage-selector">
            <div class="selector-knob" :style="{ left: knobPosition + '%' }">
              <div class="knob-indicator"></div>
            </div>
            <div class="selector-track"></div>
            <div class="selector-labels">
              <span
                  v-for="val in voltageOptions"
                  :key="val"
                  class="selector-label"
                  :class="{ active: val === selectedVoltage }"
                  :style="{ left: getLabelPosition(val) + '%' }"
              >
                {{ val }}V
              </span>
            </div>
          </div>

          <!-- Шкала заполнения -->
          <div class="voltage-scale">
            <div
                class="scale-fill"
                :style="{
                width: fillPercentage + '%',
                backgroundColor: fillColor
              }"
            ></div>
            <div class="scale-markers">
              <div
                  v-for="val in voltageOptions"
                  :key="'mark-' + val"
                  class="scale-marker"
                  :style="{ left: getLabelPosition(val) + '%' }"
              ></div>
            </div>
          </div>

          <!-- Текущее значение -->
          <div class="current-value">
            <span class="value-number">{{ selectedVoltage }}</span>
            <span class="value-unit">V</span>
            <span class="value-output" v-if="isActive">• OUT</span>
          </div>
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
  selectedVoltage: { type: Number, default: 12 },
  width: { type: String, default: '80px' },
  height: { type: String, default: '100px' },
  showGlow: { type: Boolean, default: true }
});

const configStore = useVisualizationConfigStore();
const config = computed(() => configStore.getPowerSupplyConfigStore('dc-switch'));

const label = computed(() => config.value?.shortName ?? 'DC Switch');
const isActive = computed(() => props.status === 'ON' || props.status === 'ACTIVE');

// ✅ Доступные напряжения (можно расширять)
const voltageOptions = computed(() => [5, 9, 12, 15, 17, 19, 21]);

// ✅ Позиция переключателя в %
const knobPosition = computed(() => {
  const idx = voltageOptions.value.indexOf(props.selectedVoltage);
  if (idx === -1) return 0;
  return (idx / (voltageOptions.value.length - 1)) * 100;
});

// ✅ Позиция подписи в %
const getLabelPosition = (val) => {
  const idx = voltageOptions.value.indexOf(val);
  if (idx === -1) return 0;
  return (idx / (voltageOptions.value.length - 1)) * 100;
};

// ✅ Заполнение шкалы в %
const fillPercentage = computed(() => {
  const min = Math.min(...voltageOptions.value);
  const max = Math.max(...voltageOptions.value);
  return ((props.selectedVoltage - min) / (max - min)) * 100;
});

// ✅ Цвет заполнения по статусу
const fillColor = computed(() => {
  if (props.status === 'ERROR') return '#f56c6c';
  if (isActive.value) return '#67c23a';
  return '#909399';
});

// ✅ Текст статуса
const statusText = computed(() => {
  const map = { ON: 'ON', OFF: 'OFF', ACTIVE: 'OUT', ERROR: 'ERR' };
  return map[props.status] || '—';
});

// ✅ Класс статуса для стилизации
const statusClass = computed(() => `status--${props.status.toLowerCase()}`);
</script>

<style scoped>
.power-dc-switch-svg {
  display: flex;
  justify-content: center;
  align-items: center;
}

.power-dc-switch {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 100%;
  padding: 2px;
}

/* === Header === */
.switch-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 2px;
}

.switch-title {
  font-size: 7px;
  font-weight: 600;
  color: #303133;
}

.switch-status {
  font-size: 7px;
  font-weight: 600;
  padding: 1px 3px;
  border-radius: 2px;
}

.status--on,
.status--active {
  background: #f0f9eb;
  color: #67c23a;
}

.status--off {
  background: #f5f7fa;
  color: #909399;
}

.status--error {
  background: #fef0f0;
  color: #f56c6c;
}

/* === Voltage Selector === */
.voltage-selector {
  position: relative;
  width: 100%;
  height: 20px;
  margin: 2px 0;
}

.selector-track {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: #dcdfe6;
  transform: translateY(-50%);
  border-radius: 1px;
}

.selector-knob {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  background: #409eff;
  border: 2px solid #fff;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: left 0.2s ease;
  z-index: 10;
}

.knob-indicator {
  position: absolute;
  top: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 6px;
  background: #fff;
  border-radius: 1px;
}

.selector-labels {
  position: absolute;
  top: 14px;
  left: 0;
  right: 0;
  height: 10px;
}

.selector-label {
  position: absolute;
  font-size: 6px;
  color: #909399;
  transform: translateX(-50%);
  white-space: nowrap;
  transition: color 0.2s ease, font-weight 0.2s ease;
}

.selector-label.active {
  color: #409eff;
  font-weight: 600;
}

/* === Scale Fill === */
.voltage-scale {
  position: relative;
  width: 100%;
  height: 4px;
  background: #f5f7fa;
  border-radius: 2px;
  overflow: hidden;
  margin: 2px 0;
}

.scale-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease, background-color 0.3s ease;
}

.scale-markers {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  pointer-events: none;
}

.scale-marker {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: rgba(0, 0, 0, 0.1);
  transform: translateX(-50%);
}

/* === Current Value === */
.current-value {
  display: flex;
  align-items: baseline;
  gap: 1px;
  font-size: 10px;
  font-weight: 600;
  color: #303133;
}

.value-number {
  font-size: 12px;
}

.value-unit {
  font-size: 9px;
  color: #606266;
}

.value-output {
  font-size: 7px;
  color: #67c23a;
  margin-left: 4px;
  animation: output-pulse 1s infinite;
}

@keyframes output-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

/* === Hover/Active States === */
.selector-knob:hover {
  transform: translate(-50%, -50%) scale(1.1);
  cursor: pointer;
}

/* === Responsive === */
@media (max-width: 480px) {
  .switch-title { font-size: 6px; }
  .selector-label { font-size: 5px; }
  .value-number { font-size: 10px; }
}
</style>
