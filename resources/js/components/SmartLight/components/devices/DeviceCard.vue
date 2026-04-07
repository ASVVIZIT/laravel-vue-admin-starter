<template>
  <div class="device-card" :class="{ 'device-card--selected': isSelected }" @click="handleCardClick">
    <!-- HEADER -->
    <div class="card-header">
      <h3 class="card-title" :title="device.name">{{ device.name }}</h3>
      <span class="card-status" :class="statusClass">{{ statusText }}</span>
    </div>

    <!-- VISUALIZATION -->
    <div class="card-visuals">
      <div class="visual-item">
        <BulbRenderer
            :key="`bulb-${device.device_id}-${device.bulb_type_id}`"
            :device-id="device.device_id"
            :bulb-type-id="device.bulb_type_id"
            :status="device.status"
            :intensity="device.intensity ?? 0"
            :mode="is3DMode ? '3d' : 'svg'"
            :debug-mode="true"
        />
        <div class="visual-label">{{ bulbLabel }}</div>
      </div>
      <div class="visual-item">
        <BatteryRenderer
            :key="`bat-${device.device_id}-${device.battery_type_id}`"
            :device-id="device.device_id"
            :battery-type-id="device.battery_type_id"
            :status="device.status"
            :voltage="device.voltage ?? 0"
            :critical-voltage="device.critical_voltage ?? 3.2"
            :mode="is3DMode ? '3d' : 'svg'"
            :debug-mode="true"
        />
        <div class="visual-label">{{ batteryLabel }}</div>
      </div>
    </div>

    <!-- METRICS -->
    <div class="card-metrics">
      <div class="metric"><div class="metric-label">Свет</div><div class="metric-value" :style="{ color: intensityColor }">{{ intensityValue }}%</div></div>
      <div class="metric"><div class="metric-label">Напр.</div><div class="metric-value" :style="{ color: voltageColor }">{{ voltageValue }}В</div></div>
      <div class="metric"><div class="metric-label">Ост.</div><div class="metric-value" :style="{ color: runtimeColor }">{{ runtimeValue }}</div></div>
      <div class="metric"><div class="metric-label">Ток</div><div class="metric-value">{{ currentDisplay }}мА</div></div>
    </div>

    <!-- CONTROLS -->
    <div class="card-controls">
      <el-tooltip content="Питание" placement="top"><el-button size="small" :type="powerButtonType" @click.stop="handlePowerClick">⚡</el-button></el-tooltip>
      <el-tooltip :content="sleepTooltip" placement="top"><el-button size="small" :type="sleepButtonType" @click.stop="handleSleepClick"><el-icon><component :is="sleepButtonIcon" /></el-icon></el-button></el-tooltip>
      <el-tooltip :content="mode3DTooltip" placement="top"><el-button size="small" :type="is3DMode ? 'success' : 'info'" @click.stop="handle3DToggle">🌐</el-button></el-tooltip>
      <el-tooltip content="Настройки" placement="top"><el-button size="small" @click.stop="handleSettingsClick">⚙️</el-button></el-tooltip>
    </div>

    <div v-if="isFake" class="fake-badge">🎭</div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Moon, Sunny } from '@element-plus/icons-vue';
import { useDeviceStore, useInterfaceStore, useTypesStore } from '@/components/SmartLight/stores/index.js';
import { PowerManagementController } from '@/components/SmartLight/controllers/PowerManagementController.js';
import { calculateBatteryColor, calculateBatteryCriticalProgress } from '@/components/SmartLight/utils/appDeviceUtils.js';
import BulbRenderer from '../visualization/renderers/BulbRenderer.vue';
import BatteryRenderer from '../visualization/renderers/BatteryRenderer.vue';

const props = defineProps({ device: { type: Object, required: true } });
const emit = defineEmits(['device-selected', 'open-settings', 'sleep-click', 'wake-click', 'power-click']);

const deviceStore = useDeviceStore();
const interfaceStore = useInterfaceStore();
const typesStore = useTypesStore();
const powerController = new PowerManagementController();

const isFake = computed(() => props.device.is_fake === true);
const isSelected = computed(() => deviceStore.selectedDevice?.device_id === props.device.device_id);
const is3DMode = computed(() => interfaceStore.getDevice3DModeStore?.(props.device.device_id) || false);

const statusClass = computed(() => ({ 'status--on': props.device.status === 'ON', 'status--off': props.device.status === 'OFF', 'status--sleeping': props.device.status === 'SLEEPING', 'status--error': props.device.status === 'ERROR' }));
const statusText = computed(() => ({ ON: 'Вкл', OFF: 'Выкл', SLEEPING: 'Сон', ERROR: 'Ошб' }[props.device.status] || '—'));
const bulbLabel = computed(() => props.device.bulb_type?.short_name || props.device.bulb_type?.name || typesStore.getBulbTypeByIdStore?.(props.device.bulb_type_id)?.short_name || props.device.bulb_type_id || '—');
const batteryLabel = computed(() => props.device.battery_type?.short_name || props.device.battery_type?.name || typesStore.getBatteryTypeByIdStore?.(props.device.battery_type_id)?.short_name || props.device.battery_type_id || '—');
const intensityValue = computed(() => (props.device.intensity != null && !isNaN(props.device.intensity)) ? Math.round(props.device.intensity) : 0);
const intensityColor = computed(() => intensityValue.value > 50 ? '#409eff' : '#909399');
const voltageValue = computed(() => (props.device.voltage != null && !isNaN(props.device.voltage)) ? props.device.voltage.toFixed(1) : '0.0');
const voltageColor = computed(() => calculateBatteryColor(props.device));
const runtimeValue = computed(() => { const r = powerController.getDeviceRuntimeController?.(props.device.device_id); return typeof r === 'string' ? r : r?.runtimeText || '—'; });
const runtimeColor = computed(() => { const p = calculateBatteryCriticalProgress(props.device); return p > 70 ? '#f56c6c' : p > 40 ? '#e6a23c' : '#67c23a'; });
const currentDisplay = computed(() => { const c = props.device.power_config?.custom_consumption_mA; return c != null && !isNaN(c) ? Math.round(c) : Math.round(typesStore.getBulbTypeByIdStore?.(props.device.bulb_type_id)?.specs?.powerConsumption_mA || 40); });
const powerButtonType = computed(() => props.device.status === 'ON' ? 'success' : 'info');
const sleepButtonType = computed(() => props.device.status === 'SLEEPING' ? 'warning' : 'info');
const sleepButtonIcon = computed(() => props.device.status === 'SLEEPING' ? Sunny : Moon);
const sleepTooltip = computed(() => props.device.status === 'SLEEPING' ? 'Пробудить' : 'Сон');
const mode3DTooltip = computed(() => is3DMode.value ? '2D' : '3D');

const handleCardClick = () => emit('device-selected', props.device);
const handlePowerClick = () => emit('power-click', props.device);
const handleSleepClick = () => emit(props.device.status === 'SLEEPING' ? 'wake-click' : 'sleep-click', props.device);
const handleSettingsClick = () => emit('open-settings', props.device);

// ✅ ЛОГИРОВАНИЕ ПЕРЕКЛЮЧЕНИЯ 3D В ОБЩУЮ ПАНЕЛЬ
const handle3DToggle = () => {
  const id = props.device.device_id;
  const from = interfaceStore.getDevice3DModeStore(id);
  const to = !from;
  interfaceStore.addLogStore({ component: 'DeviceCard', message: '3D toggle', data: { deviceId: id, from, to }, level: 'info' });
  interfaceStore.toggleDevice3DModeStore(id);
};
</script>

<style scoped>
.device-card { position: relative; width: 190px; height: 190px; border-radius: 6px; background: #fff; border: 1px solid #ebeef5; box-shadow: 0 1px 4px rgba(0,0,0,0.06); display: flex; flex-direction: column; overflow: hidden; transition: all 0.15s ease; cursor: pointer; font-size: 9px; }
.device-card:hover { transform: translateY(-1px); box-shadow: 0 3px 10px rgba(0,0,0,0.1); border-color: #dcdfe6; }
.device-card--selected { border-color: #409eff; box-shadow: 0 0 0 2px rgba(64,158,255,0.15); }
.card-header { display: flex; justify-content: space-between; align-items: center; padding: 4px 6px; background: #f5f7fa; border-bottom: 1px solid #ebeef5; flex-shrink: 0; }
.card-title { margin: 0; font-size: 10px; font-weight: 600; color: #303133; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 110px; }
.card-status { padding: 1px 4px; border-radius: 3px; font-size: 8px; font-weight: 600; flex-shrink: 0; }
.status--on { background: #f0f9eb; color: #67c23a; }
.status--off { background: #f5f7fa; color: #909399; }
.status--sleeping { background: #fdf6ec; color: #e6a23c; }
.status--error { background: #fef0f0; color: #f56c6c; }
.card-visuals { display: flex; gap: 3px; justify-content: center; align-items: flex-start; padding: 3px 4px; border-bottom: 1px dashed #ebeef5; flex-shrink: 0; }
.visual-item { flex: 0 0 46%; max-width: 46%; display: flex; flex-direction: column; align-items: center; gap: 2px; }
.visual-label { font-size: 7px; color: #606266; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; font-weight: 500; }
.card-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; padding: 3px 4px; flex-shrink: 0; }
.metric { text-align: center; }
.metric-label { font-size: 6px; color: #909399; white-space: nowrap; }
.metric-value { font-size: 8px; font-weight: 600; color: #303133; white-space: nowrap; margin-top: 1px; }
.card-controls { display: flex; justify-content: space-between; gap: 2px; padding: 3px 4px; border-top: 1px dashed #ebeef5; flex-shrink: 0; margin-top: auto; }
.card-controls .el-button { flex: 1; font-size: 9px; padding: 3px 1px; min-width: auto; height: 22px; }
:deep(.card-controls .el-button .el-icon) { font-size: 11px; }
.fake-badge { position: absolute; top: 3px; left: 3px; padding: 1px 3px; background: #fdf6ec; border: 1px solid #e6a23c; border-radius: 3px; font-size: 7px; color: #e6a23c; font-weight: 600; z-index: 1; pointer-events: none; }
</style>
