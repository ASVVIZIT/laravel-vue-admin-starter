<template>
  <div class="debug-layout-panel">
    <!-- Устройства -->
    <div class="debug-section">
      <h4 class="section-title">Устройства</h4>
      <div class="stat-row">
        <span class="stat-label">Всего:</span>
        <span class="stat-value">{{ deviceStore.devices.length }}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Реальные:</span>
        <span class="stat-value">{{ deviceStore.realDevices.length }}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Фейковые:</span>
        <span class="stat-value">{{ deviceStore.fakeDevices.length }}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Выбрано:</span>
        <span class="stat-value">{{ selectedDevice?.name || 'Нет' }}</span>
      </div>
    </div>

    <!-- Интерфейс -->
    <div class="debug-section">
      <h4 class="section-title">Интерфейс</h4>
      <div class="stat-row">
        <span class="stat-label">3D режим:</span>
        <el-switch
            :model-value="interfaceStore.global3DMode"
            size="small"
            @change="handle3DModeChange"
        />
      </div>
      <div class="stat-row">
        <span class="stat-label">Панель:</span>
        <span class="stat-value" :style="{ color: interfaceStore.debugPanelVisible ? '#67c23a' : '#f56c6c' }">
          {{ interfaceStore.debugPanelVisible ? 'Открыта' : 'Закрыта' }}
        </span>
      </div>
    </div>

    <!-- Логи -->
    <div class="debug-section">
      <h4 class="section-title">
        Логи
        <el-button type="text" size="small" @click="clearLogs">
          <el-icon><Delete /></el-icon>
        </el-button>
      </h4>
      <div class="logs-container">
        <div v-for="log in interfaceStore.debugLogs" :key="log.id" class="log-entry">
          <span class="log-time">{{ log.timestamp }}</span>
          <span class="log-component">[{{ log.component }}]</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
        <div v-if="!interfaceStore.debugLogs.length" class="no-logs">Нет логов</div>
      </div>
    </div>

    <!-- Глобальные настройки -->
    <div class="debug-section">
      <h4 class="section-title">Глобальные настройки</h4>
      <div class="stat-row">
        <span class="stat-label">Крит. напряжение:</span>
        <span class="stat-value">{{ settingsStore.globalSettings.critical_voltage || '3.2' }} В</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Интервал сна:</span>
        <span class="stat-value">{{ settingsStore.globalSettings.sleep_interval || '600' }} сек</span>
      </div>
      <el-button size="small" @click="openGlobalSettings" class="full-width">
        <el-icon><Setting /></el-icon> Настройки
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Delete, Setting } from '@element-plus/icons-vue';
import { useDeviceStore, useInterfaceStore, useSettingsStore } from '@components/SmartLight/stores/index.js';

const emit = defineEmits(['open-settings']);

const deviceStore = useDeviceStore();
const interfaceStore = useInterfaceStore();
const settingsStore = useSettingsStore();

const selectedDevice = computed(() => deviceStore.selectedDevice);

const handle3DModeChange = (value) => {
  interfaceStore.setGlobal3DMode(value);
};

const clearLogs = () => {
  interfaceStore.clearLogs();
};

const openGlobalSettings = () => {
  emit('open-settings');
};
</script>

<style scoped>
.debug-layout-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.debug-section {
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.debug-section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  font-size: 12px;
}

.stat-label {
  color: #606266;
}

.stat-value {
  color: #303133;
  font-weight: 500;
}

.logs-container {
  max-height: 150px;
  overflow-y: auto;
  background: #f5f7fa;
  border-radius: 4px;
  padding: 8px;
}

.log-entry {
  display: flex;
  gap: 4px;
  padding: 4px 0;
  font-size: 11px;
  border-bottom: 1px solid #ebeef5;
}

.log-entry:last-child {
  border-bottom: none;
}

.log-time {
  color: #909399;
  flex-shrink: 0;
}

.log-component {
  color: #409eff;
  flex-shrink: 0;
}

.log-message {
  color: #606266;
  word-break: break-word;
}

.no-logs {
  text-align: center;
  color: #909399;
  font-size: 11px;
  padding: 10px 0;
}

.full-width {
  width: 100%;
  margin-top: 8px;
}

:deep(.el-button) {
  font-size: 11px;
}

:deep(.el-switch) {
  transform: scale(0.8);
}
</style>
