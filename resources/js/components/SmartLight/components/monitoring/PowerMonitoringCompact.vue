<template>
  <div class="power-monitoring-compact">
    <div v-if="showSkeleton" class="monitoring-skeleton">
      <el-skeleton :loading="true" animated :rows="3">
        <template #template>
          <div class="skeleton-header">
            <el-skeleton-item variant="h3" style="width: 40%" />
            <el-skeleton-item variant="rect" style="width: 20%" />
          </div>
          <div class="skeleton-metrics">
            <el-skeleton-item variant="rect" style="width: 18%" />
            <el-skeleton-item variant="rect" style="width: 18%" />
            <el-skeleton-item variant="rect" style="width: 18%" />
            <el-skeleton-item variant="rect" style="width: 18%" />
            <el-skeleton-item variant="rect" style="width: 18%" />
          </div>
        </template>
      </el-skeleton>
    </div>

    <div v-else class="monitoring-content">
      <div class="device-header">
        <span class="device-prefix">Выбрано:</span>
        <span class="device-name">{{ selectedDevice.name || 'N/A' }}</span>
        <el-tag :type="statusTagType" size="small" class="device-status">{{ statusText }}</el-tag>
      </div>

      <div class="monitoring-metrics">
        <div class="metric-block" title="Напряжение">
          <el-icon class="metric-icon"><Connection /></el-icon>
          <div class="metric-info">
            <div class="metric-label">Напряжение</div>
            <div class="metric-value" :style="{ color: voltageColor }">{{ formatVoltageUtils(selectedDevice.voltage) }}</div>
          </div>
        </div>
        <div class="metric-block" title="Интенсивность">
          <el-icon class="metric-icon"><Lightning /></el-icon>
          <div class="metric-info">
            <div class="metric-label">Интенсивность</div>
            <div class="metric-value">{{ intensityDisplay }}%</div>
          </div>
        </div>
        <div class="metric-block" title="Батарея">
          <el-icon class="metric-icon"><Switch /></el-icon>
          <div class="metric-info">
            <div class="metric-label">Батарея</div>
            <div class="metric-value">{{ batteryType?.name || 'N/A' }}</div>
          </div>
        </div>
        <div class="metric-block" title="Время">
          <el-icon class="metric-icon"><Clock /></el-icon>
          <div class="metric-info">
            <div class="metric-label">Время</div>
            <div class="metric-value">{{ deviceRuntime }}</div>
          </div>
        </div>
        <div class="metric-block" title="Питание">
          <el-icon class="metric-icon"><Cpu /></el-icon>
          <div class="metric-info">
            <div class="metric-label">Питание</div>
            <div class="metric-value">{{ powerSupply?.name || 'Стандарт' }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue';
import { Connection, Lightning, Switch, Clock, Cpu } from '@element-plus/icons-vue';
import { useDeviceStore, useTypesStore, useInterfaceStore } from '@components/SmartLight/stores/index.js';
import { PowerManagementController } from '@components/SmartLight/controllers/PowerManagementController.js';
import { formatVoltageUtils, formatRuntimeWithSettingsUtils } from '@components/SmartLight/utils/appFormattersUtils.js';
import { calculateBatteryColor } from '@components/SmartLight/utils/appDeviceUtils.js';

const props = defineProps({ currentFilter: { type: String, default: 'all' } });

const deviceStore = useDeviceStore();
const typesStore = useTypesStore();
const interfaceStore = useInterfaceStore(); // ✅ Для логов
const powerController = new PowerManagementController();

const selectedDevice = computed(() => deviceStore.selectedDevice);

const isDeviceInCurrentFilter = computed(() => {
  if (!selectedDevice.value) return false;
  if (props.currentFilter === 'real') return !selectedDevice.value.is_fake;
  if (props.currentFilter === 'fake') return selectedDevice.value.is_fake === true;
  return true;
});

const showSkeleton = computed(() => !selectedDevice.value || !isDeviceInCurrentFilter.value);
const statusTagType = computed(() => {
  if (!selectedDevice.value) return 'info';
  const map = { 'ON': 'success', 'OFF': 'info', 'SLEEPING': 'warning', 'ERROR': 'danger' };
  return map[selectedDevice.value.status] || 'info';
});
const statusText = computed(() => {
  if (!selectedDevice.value) return 'N/A';
  const map = { 'ON': 'Вкл', 'OFF': 'Выкл', 'SLEEPING': 'Сон', 'ERROR': 'Ошб' };
  return map[selectedDevice.value.status] || 'N/A';
});
const batteryType = computed(() => selectedDevice.value ? typesStore.getBatteryTypeByIdStore(selectedDevice.value.battery_type_id) : null);
const powerSupply = computed(() => selectedDevice.value ? typesStore.getPowerSupplyByIdStore(selectedDevice.value.power_supply_id || 'standard') : null);
const voltageColor = computed(() => selectedDevice.value ? calculateBatteryColor(selectedDevice.value) : '#67c23a');
const intensityDisplay = computed(() => {
  const v = selectedDevice.value?.intensity;
  return (v != null && !isNaN(v)) ? Math.round(v) : 0;
});

const deviceRuntime = computed(() => {
  if (!selectedDevice.value) return 'N/A';
  const result = powerController.getDeviceRuntimeController(selectedDevice.value.device_id);
  if (typeof result === 'string') return result;
  const hours = result?.runtimeHours ?? result ?? 0;
  return formatRuntimeWithSettingsUtils(hours);
});

// ✅ ЛОГИРОВАНИЕ: при изменении устройства или фильтра
watch([() => selectedDevice.value, () => props.currentFilter], ([device, filter], [oldDevice]) => {
  if (device?.device_id !== oldDevice?.device_id && device) {
    interfaceStore.addLog?.({
      level: 'info', component: 'PowerMonitoring', message: `Мониторинг: ${device.name}`,
      data: { deviceId: device.device_id, deviceName: device.name, filter, intensity: device.intensity, voltage: device.voltage }
  });
  }
}, { deep: true });
</script>

<style scoped>
.power-monitoring-compact { background: #fff; border-radius: 4px; min-height: 40px; }
.monitoring-skeleton { padding: 2px 3px; }
.skeleton-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; }
.skeleton-metrics { display: grid; grid-template-columns: repeat(8, 1fr); gap: 2px; }
.monitoring-content { display: flex; flex-direction: column; gap: 2px; padding: 2px 3px; }
.device-header { display: flex; align-items: center; gap: 3px; padding: 1px 3px; background: linear-gradient(135deg, #f0f9eb 0%, #e8f5e9 100%); border: 1px solid #e1f3d8; border-radius: 3px; min-height: 5px; }
.device-prefix { font-size: 8px; color: #67c23a; font-weight: 500; white-space: nowrap; }
.device-name { font-size: 8px; font-weight: 600; color: #303133; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.device-status { margin-left: auto; font-size: 7px; padding: 1px 2px; border-radius: 2px; font-weight: 600; }
.monitoring-metrics { display: grid; grid-template-columns: repeat(8, 1fr); gap: 2px; }
.metric-block { display: flex; align-items: center; gap: 2px; padding: 2px 3px; background: #f5f7fa; border-radius: 3px; min-height: 9px; }
.metric-block .metric-icon { font-size: 12px; color: #409eff; flex-shrink: 0; line-height: 1; }
.metric-block .metric-info { min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.metric-block .metric-label { font-size: 7px; color: #909399; white-space: nowrap; line-height: 1.1; }
.metric-block .metric-value { font-size: 8px; font-weight: 600; color: #303133; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.1; }
@media (max-width: 1200px) { .monitoring-metrics { grid-template-columns: repeat(12, 1fr); } }
@media (max-width: 992px) { .monitoring-metrics { grid-template-columns: repeat(10, 1fr); } }
@media (max-width: 768px) { .monitoring-metrics { grid-template-columns: repeat(8, 1fr); } }
@media (max-width: 576px) {
  .monitoring-metrics { grid-template-columns: repeat(6, 1fr); }
  .metric-block { min-height: 10px; padding: 2px 3px; }
  .metric-icon { font-size: 12px; }
  .metric-label { font-size: 7px; }
  .metric-value { font-size: 8px; }
  .device-header { padding: 1px 3px; min-height: 6px; }
  .device-prefix, .device-name { font-size: 8px; }
  .device-status { font-size: 7px; padding: 1px 2px; }
  .metric-label { font-size: 6px; }
  .metric-value { font-size: 7px; }
}
</style>
