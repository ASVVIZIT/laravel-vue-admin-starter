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
        <el-tag :type="statusTagType" size="small" class="device-status">
          {{ statusText }}
        </el-tag>
      </div>

      <div class="monitoring-metrics">
        <div class="metric-block" title="Напряжение">
          <el-icon class="metric-icon"><Connection /></el-icon>
          <div class="metric-info">
            <div class="metric-label">Напряжение</div>
            <div class="metric-value" :style="{ color: voltageColor }">
              {{ formatVoltage(selectedDevice.voltage) }}
            </div>
          </div>
        </div>

        <div class="metric-block" title="Интенсивность">
          <el-icon class="metric-icon"><Lightning /></el-icon>
          <div class="metric-info">
            <div class="metric-label">Интенсивность</div>
            <div class="metric-value">{{ formatValue(selectedDevice.intensity, 0) }}%</div>
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
import { useDeviceStore, useTypesStore } from '@components/SmartLight/stores/index.js';
import { PowerManagementController } from '@components/SmartLight/controllers/PowerManagementController.js';
import { formatVoltage } from '@components/SmartLight/utils/appFormatters.js';
import { calculateBatteryColor } from '@components/SmartLight/utils/appDeviceUtils.js';

const props = defineProps({
  currentFilter: { type: String, default: 'all' }
});

const deviceStore = useDeviceStore();
const typesStore = useTypesStore();
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

const batteryType = computed(() => {
  if (!selectedDevice.value) return null;
  return typesStore.getBatteryTypeById(selectedDevice.value.battery_type_id);
});

const powerSupply = computed(() => {
  if (!selectedDevice.value) return null;
  return typesStore.getPowerSupplyById(selectedDevice.value.power_supply_id || 'standard');
});

const voltageColor = computed(() => {
  if (!selectedDevice.value) return '#67c23a';
  return calculateBatteryColor(selectedDevice.value);
});

const deviceRuntime = computed(() => {
  if (!selectedDevice.value) return 'N/A';
  return powerController.getDeviceRuntime(selectedDevice.value.device_id);
});

const formatValue = (value, defaultValue = 0) => {
  if (value === null || value === undefined || isNaN(value)) return defaultValue;
  return value;
};

watch([() => selectedDevice.value, () => props.currentFilter], ([device, filter]) => {
  console.log('[Monitoring] Device/Filter changed:', {
    deviceId: device?.device_id,
    deviceName: device?.name,
    filter,
    isInFilter: isDeviceInCurrentFilter.value,
    showSkeleton: showSkeleton.value
  });
}, { deep: true });
</script>

<style scoped>
.power-monitoring-compact {
  background: #fff;
  border-radius: 4px;
  min-height: 60px;
}

.monitoring-skeleton {
  padding: 2px 4px;
}

.skeleton-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
}

.skeleton-metrics {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 2px;
}

.monitoring-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 2px 4px;
}

.device-header {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 1px 3px;
  background: linear-gradient(135deg, #f0f9eb 0%, #e8f5e9 100%);
  border: 1px solid #e1f3d8;
  border-radius: 3px;
  min-height: 6px;
}

.device-prefix {
  font-size: 9px;
  color: #67c23a;
  font-weight: 500;
  white-space: nowrap;
}

.device-name {
  font-size: 9px;
  font-weight: 600;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.device-status {
  margin-left: auto;
  font-size: 8px;
  padding: 1px 2px;
  border-radius: 2px;
  font-weight: 600;
}

.monitoring-metrics {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 2px;
}

.metric-block {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px 3px;
  background: #f5f7fa;
  border-radius: 3px;
  min-height: 10px;
}

.metric-icon {
  font-size: 14px;
  color: #409EFF;
  flex-shrink: 0;
  line-height: 1;
}

.metric-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.metric-label {
  font-size: 8px;
  color: #909399;
  white-space: nowrap;
  line-height: 1.1;
}

.metric-value {
  font-size: 9px;
  font-weight: 600;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.1;
}

@media (max-width: 1200px) {
  .monitoring-metrics {
    grid-template-columns: repeat(12, 1fr);
    gap: 2px;
  }
}

@media (max-width: 992px) {
  .monitoring-metrics {
    grid-template-columns: repeat(10, 1fr);
    gap: 2px;
  }
}

@media (max-width: 768px) {
  .monitoring-metrics {
    grid-template-columns: repeat(8, 1fr);
    gap: 2px;
  }
}

@media (max-width: 576px) {
  .monitoring-metrics {
    grid-template-columns: repeat(6, 1fr);
    gap: 2px;
  }

  .metric-block {
    min-height: 10px;
    padding: 2px 3px;
  }

  .metric-icon {
    font-size: 12px;
  }

  .metric-label {
    font-size: 7px;
  }

  .metric-value {
    font-size: 8px;
  }

  .device-header {
    padding: 1px 3px;
    min-height: 6px;
  }

  .device-prefix,
  .device-name {
    font-size: 8px;
  }

  .device-status {
    font-size: 7px;
    padding: 1px 2px;
  }
}
</style>
