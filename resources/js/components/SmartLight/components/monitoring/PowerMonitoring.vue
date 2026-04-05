<template>
  <div class="power-monitoring-compact">
    <!-- Skeleton Loading -->
    <div v-if="showSkeleton" class="monitoring-skeleton">
      <el-skeleton :loading="true" animated :rows="2">
        <template #template>
          <div class="skeleton-header">
            <el-skeleton-item variant="h3" style="width: 40%" />
            <el-skeleton-item variant="rect" style="width: 50%" />
          </div>
          <div class="skeleton-metrics">
            <el-skeleton-item variant="rect" style="width: 30%" v-for="i in 5" :key="i" />
          </div>
        </template>
      </el-skeleton>
    </div>

    <!-- Content -->
    <div v-else class="monitoring-content">
      <!-- Device Header -->
      <div class="monitoring-device-header">
        <span class="monitoring-prefix">Выбрано:</span>
        <span class="monitoring-device-name">{{ selectedDevice.name || 'N/A' }}</span>
        <el-tag :type="statusTagType" size="small" class="monitoring-status">
          {{ statusText }}
        </el-tag>
      </div>

      <!-- Metrics Grid -->
      <div class="monitoring-metrics">
        <!-- Voltage -->
        <div class="monitoring-metric" title="Напряжение">
          <el-icon class="monitoring-metric-icon"><Connection /></el-icon>
          <div class="monitoring-metric-info">
            <div class="monitoring-metric-label">Напряжение</div>
            <div class="monitoring-metric-value" :style="{ color: voltageColor }">
              {{ formatVoltageUtils(selectedDevice.voltage) }}
            </div>
          </div>
        </div>

        <!-- Intensity -->
        <div class="monitoring-metric" title="Интенсивность">
          <el-icon class="monitoring-metric-icon"><Lightning /></el-icon>
          <div class="monitoring-metric-info">
            <div class="monitoring-metric-label">Интенсивность</div>
            <div class="monitoring-metric-value">{{ formatRuntimeWithSettings(selectedDevice.intensity, 0) }}%</div>
          </div>
        </div>

        <!-- Battery -->
        <div class="monitoring-metric" title="Батарея">
          <el-icon class="monitoring-metric-icon"><Switch /></el-icon>
          <div class="monitoring-metric-info">
            <div class="monitoring-metric-label">Батарея</div>
            <div class="monitoring-metric-value">{{ batteryType?.name || 'N/A' }}</div>
          </div>
        </div>

        <!-- Runtime -->
        <div class="monitoring-metric" title="Время">
          <el-icon class="monitoring-metric-icon"><Clock /></el-icon>
          <div class="monitoring-metric-info">
            <div class="monitoring-metric-label">Время</div>
            <div class="monitoring-metric-value">{{ deviceRuntime }}</div>
          </div>
        </div>

        <!-- Power Supply -->
        <div class="monitoring-metric" title="Питание">
          <el-icon class="monitoring-metric-icon"><Cpu /></el-icon>
          <div class="monitoring-metric-info">
            <div class="monitoring-metric-label">Питание</div>
            <div class="monitoring-metric-value">{{ powerSupply?.name || 'Стандарт' }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue';
import { Connection, Lightning, Switch, Clock, Cpu } from '@element-plus/icons-vue';
import { useDeviceStore, useTypesStore } from '@/components/SmartLight/stores/index.js';
import { PowerManagementController } from '@/components/SmartLight/controllers/PowerManagementController.js';
import { formatVoltageUtils } from '@/components/SmartLight/utils/appFormattersUtils.js';
import { calculateBatteryColor } from '@/components/SmartLight/utils/appDeviceUtils.js';

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
  const map = {
    'ON': 'success',
    'OFF': 'info',
    'SLEEPING': 'warning',
    'ERROR': 'danger'
  };
  return map[selectedDevice.value.status] || 'info';
});

const statusText = computed(() => {
  if (!selectedDevice.value) return 'N/A';
  const map = {
    'ON': 'Вкл',
    'OFF': 'Выкл',
    'SLEEPING': 'Сон',
    'ERROR': 'Ошб'
  };
  return map[selectedDevice.value.status] || 'N/A';
});

const batteryType = computed(() => {
  if (!selectedDevice.value) return null;
  return typesStore.getBatteryTypeByIdStore(selectedDevice.value.battery_type_id);
});

const powerSupply = computed(() => {
  if (!selectedDevice.value) return null;
  return typesStore.getBatteryTypeByIdStore(selectedDevice.value.power_supply_id || 'standard');
});

const voltageColor = computed(() => {
  if (!selectedDevice.value) return '#67c23a';
  return calculateBatteryColor(selectedDevice.value);
});

const deviceRuntime = computed(() => {
  if (!selectedDevice.value) return 'N/A';
  return powerController.getDeviceRuntimeController(selectedDevice.value.device_id);
});

const formatRuntimeWithSettings = (value, defaultValue = 0) => {
  if (value === null || value === undefined || isNaN(value)) return defaultValue;
  return value;
};

watch(
    [() => selectedDevice.value, () => props.currentFilter],
    ([device, filter]) => {
      console.log('[Monitoring] Device/Filter changed:', {
        deviceId: device?.device_id,
        filter,
        isInFilter: isDeviceInCurrentFilter.value,
        showSkeleton: showSkeleton.value
      });
    },
    { deep: true }
);
</script>

<style scoped>
.power-monitoring-compact {
  background: #fff;
  border-radius: 4px;
  min-height: 50px;
  border: 1px solid #e4e7ed;
}

.monitoring-skeleton {
  padding: 2px 3px;
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
  padding: 2px 3px;
}

.monitoring-device-header {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 1px 3px;
  background: linear-gradient(135deg, #f0f9eb 0%, #e8f5e9 100%);
  border: 1px solid #e1f3d8;
  border-radius: 3px;
  min-height: 5px;
}

.monitoring-prefix {
  font-size: 8px;
  color: #67c23a;
  font-weight: 500;
  white-space: nowrap;
}

.monitoring-device-name {
  font-size: 8px;
  font-weight: 600;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.monitoring-status {
  margin-left: auto;
  font-size: 7px;
  padding: 1px 2px;
  border-radius: 2px;
  font-weight: 600;
  --el-tag-font-size: 7px;
  --el-tag-padding: 1px 2px;
}

.monitoring-metrics {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 2px;
}

.monitoring-metric {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px 3px;
  background: #f5f7fa;
  border-radius: 3px;
  min-height: 9px;
}

.monitoring-metric-icon {
  font-size: 12px;
  color: #409eff;
  flex-shrink: 0;
  line-height: 1;
}

.monitoring-metric-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.monitoring-metric-label {
  font-size: 7px;
  color: #909399;
  white-space: nowrap;
  line-height: 1.1;
}

.monitoring-metric-value {
  font-size: 8px;
  font-weight: 600;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.1;
}

/* Responsive breakpoints */
@media (max-width: 1200px) {
  .monitoring-metrics {
    grid-template-columns: repeat(12, 1fr);
  }
}

@media (max-width: 992px) {
  .monitoring-metrics {
    grid-template-columns: repeat(10, 1fr);
  }
}

@media (max-width: 768px) {
  .monitoring-metrics {
    grid-template-columns: repeat(8, 1fr);
  }
}

@media (max-width: 576px) {
  .monitoring-metrics {
    grid-template-columns: repeat(6, 1fr);
  }
  .monitoring-metric-label {
    font-size: 6px;
  }
  .monitoring-metric-value {
    font-size: 7px;
  }
}

/* Element Plus tag overrides for compact size */
:deep(.el-tag--small) {
  --el-tag-padding: 1px 2px !important;
  --el-tag-font-size: 7px !important;
  height: auto !important;
  line-height: 1 !important;
}
</style>
