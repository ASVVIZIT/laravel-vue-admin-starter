<template>
  <div class="debug-panel" :class="{ 'panel-visible': interfaceStore.debugPanelVisible }">
    <div class="panel-header">
      <span class="panel-title">Отладка</span>
      <el-button type="text" size="small" @click="closePanel">
        <el-icon><Close /></el-icon>
      </el-button>
    </div>

    <div class="panel-content">
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
          <span class="stat-label">Панель отладки:</span>
          <el-switch
              :model-value="interfaceStore.debugPanelVisible"
              size="small"
              @click="handlePanelClick"
          />
        </div>
      </div>

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
          <div v-if="!interfaceStore.debugLogs || interfaceStore.debugLogs.length === 0" class="no-logs">
            Нет логов
          </div>
        </div>
      </div>

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
        <el-button size="small" @click="openGlobalSettings" style="width: 100%; margin-top: 8px;">
          <el-icon><Setting /></el-icon> Настройки
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue';
import { Close, Delete, Setting } from '@element-plus/icons-vue';
import {
  useDeviceStore,
  useInterfaceStore,
  useSettingsStore
} from '@components/SmartLight/stores/index.js';

const deviceStore = useDeviceStore();
const interfaceStore = useInterfaceStore();
const settingsStore = useSettingsStore();

// ✅ УБРАЛИ emit — не нужен!
// const emit = defineEmits(['toggle', 'open-settings']);

const selectedDevice = computed(() => deviceStore.selectedDevice);

// ✅ DEBUG WATCH
watch(() => interfaceStore.debugPanelVisible, (newVal, oldVal) => {
  console.log('[DebugPanel] WATCH: panel changed', oldVal, '→', newVal);
});

// ✅ ИСПРАВЛЕНО — БЕЗ emit('toggle')
const closePanel = () => {
  console.log('[DebugPanel] closePanel called');
  interfaceStore.closeDebugPanel();
  // emit('toggle') ← УБРАНО!
};

const handle3DModeChange = (value) => {
  console.log('[DebugPanel] 3D mode:', value);
  interfaceStore.setGlobal3DMode(value);
};

// ✅ ИСПРАВЛЕНО — БЕЗ emit('toggle')
const handlePanelClick = () => {
  console.log('[DebugPanel] handlePanelClick');
  interfaceStore.toggleDebugPanel();
  // emit('toggle') ← УБРАНО!
};

const clearLogs = () => {
  interfaceStore.clearLogs();
};

const openGlobalSettings = () => {
  // emit('open-settings') ← УБРАНО ИЛИ ОСТАВИТЬ ЕСЛИ НУЖНО
};
</script>

<style scoped>
.debug-panel {
  position: fixed;
  top: 80px;
  right: -320px;
  width: 320px;
  height: calc(100vh - 90px);
  background: #fff;
  box-shadow: -2px 0 12px rgba(0, 0, 0, 0.15);
  transition: right 0.3s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #e4e7ed;
}

.debug-panel.panel-visible {
  right: 0;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 6px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 6px 8px;
}

.debug-section {
  margin-bottom: 6px;
  padding-bottom: 6px;
  border-bottom: 1px solid #ebeef5;
}

.debug-section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 4px 0;
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
  max-height: 200px;
  overflow-y: auto;
  background: #f5f7fa;
  border-radius: 4px;
  padding: 4px;
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
  color: #409EFF;
  flex-shrink: 0;
}

.log-message {
  color: #606266;
  word-break: break-word;
}

.no-logs {
  text-align: center;
  color: #909399;
  font-size: 12px;
  padding: 20px 0;
}

:deep(.el-button) {
  font-size: 12px;
}

:deep(.el-switch) {
  transform: scale(0.8);
}
</style>
