<template>
  <div class="battery-icon" :class="statusClass" :style="{ width: size, height: size }">
    <LayoutIconWrapper
        :icon="BatterySvgComponent"
        :size="iconSize"
        :color="iconColor"
        :rotation="rotation"
        :spin="isCharging"
        :spin-duration="spinDuration"
        :vertical="false"
    >
      <!-- Overlay для заполнения -->
      <template #overlay>
        <div
            class="battery-fill-overlay"
            :style="{
            width: fillPercentage + '%',
            backgroundColor: fillColor,
            opacity: fillOpacity
          }"
        ></div>
      </template>

      <!-- Badge для статуса -->
      <template #badge>
        <div v-if="showStatusBadge && isLowOrCritical" class="battery-status-badge" :class="statusBadgeClass"></div>
        <div v-if="isCharging" class="battery-charging-badge">
          <el-icon :size="chargingIconSize" :color="chargingIconColor">
            <Lightning />
          </el-icon>
        </div>
      </template>

      <!-- Label -->
      <span v-if="showLabel" class="battery-label">{{ formattedVoltage }}В</span>
    </LayoutIconWrapper>
  </div>
</template>

<script setup>
import { computed, h } from 'vue';
import { Lightning } from '@element-plus/icons-vue';
import LayoutIconWrapper from '@/components/SmartLight/components/layout/wrappers/LayoutIconWrapper.vue';

/**
 * ✅ SVG-иконка батареи (чистый Vue 3 h(), без JSX)
 */
const BatterySvgComponent = {
  name: 'BatterySvg',
  inheritAttrs: false,
  render() {
    return h('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      width: '100%',
      height: '100%',
      xmlns: 'http://www.w3.org/2000/svg'
    }, [
      h('rect', { x: '2', y: '6', width: '18', height: '12', rx: '2', stroke: 'currentColor', 'stroke-width': '2' }),
      h('rect', { x: '20', y: '10', width: '2', height: '4', rx: '1', fill: 'currentColor' }),
      h('rect', { x: '4', y: '8', width: '14', height: '8', rx: '1', fill: 'currentColor', class: 'battery-fill-path' })
    ]);
  }
};

const props = defineProps({
  voltage: { type: Number, default: 3.7 },
  criticalVoltage: { type: Number, default: 3.2 },
  minVoltage: { type: Number, default: 2.5 },
  maxVoltage: { type: Number, default: 4.2 },
  size: { type: String, default: '32px' },
  iconSize: { type: Number, default: 24 },
  showLabel: { type: Boolean, default: true },
  showStatusBadge: { type: Boolean, default: true },
  status: {
    type: String,
    default: 'normal',
    validator: v => ['normal', 'low', 'critical', 'charging'].includes(v)
  },
  rotation: { type: Number, default: 0 }
});

const fillPercentage = computed(() => {
  const range = props.maxVoltage - props.minVoltage;
  if (range <= 0) return 0;
  const clamped = Math.max(props.minVoltage, Math.min(props.maxVoltage, props.voltage));
  return ((clamped - props.minVoltage) / range) * 100;
});

const fillColor = computed(() => {
  if (props.status === 'critical') return '#f56c6c';
  if (props.status === 'low') return '#e6a23c';
  if (props.status === 'charging') return '#67c23a';
  if (props.voltage < props.criticalVoltage) return '#f56c6c';
  if (props.voltage < props.criticalVoltage + 0.3) return '#e6a23c';
  return '#67c23a';
});

const fillOpacity = computed(() => {
  if (props.status === 'charging') return 0.6;
  if (props.status === 'critical') return 0.5;
  return 0.4 + (fillPercentage.value / 100) * 0.4;
});

const iconColor = computed(() => {
  if (props.status === 'critical') return '#f56c6c';
  if (props.status === 'low') return '#e6a23c';
  if (props.status === 'charging') return '#67c23a';
  return '#909399';
});

const chargingIconColor = computed(() => props.status === 'charging' ? '#67c23a' : '#909399');
const formattedVoltage = computed(() => props.voltage.toFixed(1));
const isCharging = computed(() => props.status === 'charging');
const isLowOrCritical = computed(() => props.status === 'low' || props.status === 'critical');

const statusClass = computed(() => ({
  'battery-icon--normal': props.status === 'normal',
  'battery-icon--low': props.status === 'low',
  'battery-icon--critical': props.status === 'critical',
  'battery-icon--charging': props.status === 'charging'
}));

const statusBadgeClass = computed(() => ({
  'badge--low': props.status === 'low',
  'badge--critical': props.status === 'critical'
}));

const spinDuration = computed(() => isCharging.value ? '1.5s' : '2s');
const chargingIconSize = computed(() => props.iconSize * 0.6);
</script>

<style scoped>
.battery-icon { position: relative; display: inline-flex; align-items: center; justify-content: center; }
.battery-label { font-size: 10px; font-weight: 600; color: #606266; margin-left: 4px; white-space: nowrap; }
.battery-fill-overlay { position: absolute; left: 4px; bottom: 4px; height: 8px; border-radius: 2px; transition: width 0.3s ease, background-color 0.3s ease, opacity 0.3s ease; pointer-events: none; z-index: 1; }
.battery-status-badge { position: absolute; top: -4px; right: -4px; width: 10px; height: 10px; border-radius: 50%; border: 2px solid #fff; z-index: 10; animation: badge-pulse 1s infinite; }
.badge--low { background-color: #e6a23c; }
.badge--critical { background-color: #f56c6c; animation: badge-pulse 0.5s infinite; }
.battery-charging-badge { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10; }
@keyframes badge-pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.1); } }
.battery-icon--normal :deep(.el-icon) { color: #909399; }
.battery-icon--low :deep(.el-icon) { color: #e6a23c; }
.battery-icon--critical :deep(.el-icon) { color: #f56c6c; }
.battery-icon--charging :deep(.el-icon) { color: #67c23a; }
</style>
