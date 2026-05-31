<template>
  <div class="debug-panel">

    <!-- ===== ГОРИЗОНТАЛЬНЫЕ ТАБЫ ===== -->
    <div class="debug-tabs">
      <button
          v-for="tab in tabs"
          :key="tab.id"
          class="debug-tab"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- ===== КОНТЕНТ ТАБОВ ===== -->
    <div class="debug-content">

      <!-- ТАБ: УСТРОЙСТВА -->
      <div v-if="activeTab === 'devices'" class="tab-pane">
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

      <!-- ТАБ: ИНТЕРФЕЙС -->
      <div v-if="activeTab === 'interface'" class="tab-pane">
        <div class="stat-row">
          <span class="stat-label">3D режим:</span>
          <el-switch
              :model-value="interfaceStore.global3DMode"
              size="small"
              @change="handle3DModeChange"
              active-color="#67c23a"
              inactive-color="#909399"
          />
        </div>
        <div class="stat-row">
          <span class="stat-label">Панель:</span>
          <span
              class="stat-value"
              :style="{ color: interfaceStore.debugPanelVisible ? '#67c23a' : '#f56c6c' }"
          >
            {{ interfaceStore.debugPanelVisible ? 'Открыта' : 'Закрыта' }}
          </span>
        </div>
      </div>

      <!-- ТАБ: ЛОГИ -->
      <div v-if="activeTab === 'logs'" class="tab-pane">
        <div class="logs-header">
          <span class="logs-count">Всего записей: {{ interfaceStore.debugLogs.length }}</span>
          <el-button
              type="text"
              size="small"
              @click="clearLogs"
              title="Очистить"
          >
            <el-icon><Delete /></el-icon> Очистить
          </el-button>
        </div>

        <div class="logs-container">
          <div v-for="log in displayedLogs" :key="log.id" class="log-card">
            <div class="log-header">
              <span class="log-time">{{ formatTime(log.timestamp) }}</span>
              <span class="log-component">[{{ log.component }}]</span>
              <span class="log-level-icon" :class="log.level" :title="log.level">
                {{ log.level === 'error' ? '❌' : log.level === 'warn' ? '⚠️' : log.level === 'debug' ? '🐞' : 'ℹ️' }}
              </span>
            </div>

            <div class="log-message">{{ log.message }}</div>

            <div v-if="log.data" class="log-footer">
              <span v-if="log.data.intensity != null && log.data.intensity !== undefined" class="log-meta intensity">
                ⚡{{ Math.round(log.data.intensity) }}%
              </span>
              <span v-if="log.data.deviceId" class="log-meta device-id">
                🔹{{ log.data.deviceId }}
              </span>
              <span v-if="log.data.status" class="log-meta status">
                🟢{{ log.data.status }}
              </span>
              <span v-if="log.data.voltage != null && log.data.voltage !== undefined" class="log-meta voltage">
                ⚡{{ Number(log.data.voltage).toFixed(1) }}В
              </span>
              <span v-if="log.data.action" class="log-meta action">
                🔧{{ log.data.action }}
              </span>
            </div>
          </div>

          <div v-if="!displayedLogs.length" class="no-logs">
            <el-icon><InfoFilled /></el-icon>
            <span>Нет логов</span>
          </div>
        </div>
      </div>

      <!-- ТАБ: ГЛОБАЛЬНЫЕ НАСТРОЙКИ -->
      <div v-if="activeTab === 'settings'" class="tab-pane">
        <div v-if="Object.keys(settingsStore.globalSettings).length" class="settings-grid">
          <div
              v-for="(value, key) in settingsStore.globalSettings"
              :key="key"
              class="setting-item"
          >
            <span class="setting-label">{{ formatSettingKey(key) }}:</span>
            <span class="setting-value">{{ formatSettingValue(value, key) }}</span>
          </div>
        </div>
        <div v-else class="empty-state">
          <el-icon><InfoFilled /></el-icon>
          <span>Настройки не загружены</span>
        </div>

        <el-button
            size="small"
            @click="openGlobalSettingsModal"
            class="full-width"
        >
          <el-icon><Setting /></el-icon> Открыть редактор настроек
        </el-button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { Delete, Setting, InfoFilled } from '@element-plus/icons-vue';
// ✅ Импорт модульных сторов (без агрегатора)
import { useDeviceStore, useInterfaceStore, useSettingsStore } from '@/components/SmartLight/stores/index.js';

const emit = defineEmits(['open-settings']);

const deviceStore = useDeviceStore();
const interfaceStore = useInterfaceStore();
const settingsStore = useSettingsStore();

const activeTab = ref('logs');
const tabs = [
  { id: 'logs', label: 'Логи' },
  { id: 'devices', label: 'Устройства' },
  { id: 'interface', label: 'Интерфейс' },
  { id: 'settings', label: 'Глобальные Настройки' }
];

const selectedDevice = computed(() => deviceStore.selectedDevice);
const displayedLogs = computed(() => (interfaceStore.debugLogs || []).slice(0, 50));

// Форматирование времени
const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
};

// Форматирование ключей настроек для отображения
const formatSettingKey = (key) => {
  const map = {
    critical_voltage: 'Крит. напряжение',
    sleep_interval: 'Интервал сна',
    emergency_sleep_interval: 'Аварийный сон',
    default_battery_type: 'Тип батареи (по умолч.)',
    default_bulb_type: 'Тип лампы (по умолч.)',
    default_power_supply: 'Источник питания (по умолч.)',
    power_management_mode: 'Режим управления питанием',
    controller_runtime: 'Время работы контроллера',
    min_controller_voltage: 'Мин. напряжение контроллера',
    global_server_url: 'URL сервера',
    timezone: 'Часовой пояс',
    log_level: 'Уровень логов',
    telemetry_retention_days: 'Хранение телеметрии (дн.)',
    voltage_warning_threshold: 'Порог предупреждения',
    voltage_critical_threshold: 'Порог крит. разряда',
    default_wifi_ssid: 'Wi-Fi SSID',
    default_wifi_password: 'Wi-Fi пароль'
  };
  return map[key] || key.replace(/_/g, ' ');
};

// Форматирование значений настроек
const formatSettingValue = (value, key) => {
  if (value === null || value === undefined) return '—';
  if (key.includes('voltage')) return `${value} В`;
  if (key.includes('interval') || key.includes('runtime')) return `${value} сек`;
  if (key === 'telemetry_retention_days') return `${value} дн.`;
  if (key === 'timezone') return value;
  return String(value);
};

// ✅ Переключение 3D с логированием (вызов метода с суффиксом Store)
const handle3DModeChange = (value) => {
  interfaceStore.addLogStore?.({
    level: 'info',
    component: 'DebugPanel',
    message: `3D режим: ${value ? 'ВКЛ' : 'ВЫКЛ'}`,
    data: { mode: value ? '3D' : '2D', action: 'toggle_3d' }
  });
  if (typeof interfaceStore.setGlobal3DModeStore === 'function') {
    interfaceStore.setGlobal3DModeStore(value);
  } else {
    // Fallback для прямой модификации состояния (если метод не найден)
    interfaceStore.global3DMode = value;
  }
};

// ✅ Очистка логов (вызов метода с суффиксом Store)
const clearLogs = () => {
  interfaceStore.addLogStore?.({
    level: 'info',
    component: 'DebugPanel',
    message: 'Логи очищены',
    data: { action: 'clear' }
  });
  interfaceStore.clearLogsStore?.();
};

// ✅ Открытие модалки глобальных настроек (вызов метода с суффиксом Store)
const openGlobalSettingsModal = () => {
  interfaceStore.addLogStore?.({
    level: 'info',
    component: 'DebugPanel',
    message: 'Открыты глобальные настройки',
    data: { action: 'open_global_settings' }
  });
  emit('open-settings');
};

// ✅ Авто-лог при выборе устройства (вызов метода с суффиксом Store)
watch(() => selectedDevice.value, (newDev, oldDev) => {
  if (newDev?.device_id !== oldDev?.device_id && newDev) {
    const intensity = newDev.intensity ?? newDev.power_config?.intensity ?? 0;
    const safeIntensity = Number.isFinite(intensity) ? Math.round(intensity) : 0;

    interfaceStore.addLogStore?.({
      level: 'info',
      component: 'DebugPanel',
      message: `Выбрано устройство: ${newDev.name || 'N/A'}`,
      data: {
        deviceId: newDev.device_id,
        deviceName: newDev.name,
        status: newDev.status,
        intensity: safeIntensity,
        voltage: newDev.voltage
      }
    });
  }
});
</script>

<style scoped>
.debug-panel {
  display: flex;
  flex-direction: column;
  gap: 0;
  font-size: 11px;
  height: 100%;
  overflow: hidden;
}

.debug-tabs {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  border-bottom: 1px solid #ebeef5;
  padding: 0 4px;
  background: #f5f7fa;
}

.debug-tabs::-webkit-scrollbar {
  height: 3px;
}

.debug-tabs::-webkit-scrollbar-track {
  background: transparent;
}

.debug-tabs::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 2px;
}

.debug-tab {
  flex-shrink: 0;
  padding: 6px 10px;
  font-size: 10px;
  font-weight: 500;
  color: #606266;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.debug-tab:hover {
  color: #409eff;
}

.debug-tab.active {
  color: #409eff;
  border-bottom-color: #409eff;
  background: #fff;
}

.debug-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.tab-pane {
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  font-size: 11px;
}

.stat-label {
  color: #606266;
}

.stat-value {
  color: #303133;
  font-weight: 500;
}

.logs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  padding-bottom: 4px;
  border-bottom: 1px dashed #ebeef5;
}

.logs-count {
  font-size: 9px;
  color: #909399;
}

.logs-container {
  max-height: 350px;
  overflow-y: auto;
  padding: 2px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.log-card {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 4px 6px;
  background: #fff;
  transition: background 0.15s ease;
}

.log-card:hover {
  background: #f5f7fa;
  border-color: #c0c4cc;
}

.log-header {
  display: flex;
  gap: 4px;
  font-size: 9px;
  color: #909399;
  margin-bottom: 2px;
  padding-bottom: 2px;
  border-bottom: 1px dashed #ebeef5;
}

.log-component {
  color: #409eff;
  font-weight: 600;
}

.log-level-icon.error {
  color: #f56c6c;
}

.log-level-icon.warn {
  color: #e6a23c;
}

.log-level-icon.debug {
  color: #909399;
}

.log-level-icon.info {
  color: #409eff;
}

.log-message {
  font-size: 10px;
  color: #303133;
  line-height: 1.3;
  word-break: break-word;
  white-space: pre-wrap;
  padding: 2px 0 2px 6px;
  border-left: 2px solid #e4e7ed;
  margin-left: 1px;
}

.log-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  font-size: 9px;
  color: #909399;
  padding: 2px 0 0 6px;
  margin-top: 2px;
}

.log-meta {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.log-meta.intensity {
  color: #67c23a;
  font-weight: 700;
}

.log-meta.device-id {
  color: #606266;
  opacity: 0.8;
}

.log-meta.status {
  color: #e6a23c;
  font-weight: 600;
}

.log-meta.voltage {
  color: #409eff;
}

.log-meta.action {
  color: #909399;
  font-style: italic;
}

.no-logs {
  text-align: center;
  color: #909399;
  font-size: 10px;
  padding: 12px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.no-logs .el-icon {
  font-size: 20px;
  color: #c0c4cc;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 4px;
  margin-bottom: 10px;
}

.setting-item {
  display: flex;
  flex-direction: column;
  padding: 4px 6px;
  background: #f5f7fa;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}

.setting-label {
  font-size: 9px;
  color: #909399;
  font-weight: 500;
}

.setting-value {
  font-size: 10px;
  color: #303133;
  font-weight: 600;
  word-break: break-all;
}

.empty-state {
  text-align: center;
  color: #909399;
  font-size: 10px;
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.empty-state .el-icon {
  font-size: 20px;
  color: #c0c4cc;
}

.full-width {
  width: 100%;
  margin-top: 6px;
}

:deep(.el-button) {
  font-size: 10px;
  padding: 3px 6px;
}

:deep(.el-switch) {
  transform: scale(0.85);
  margin-left: 4px;
}

:deep(.el-switch__core) {
  width: 34px;
  height: 15px;
}

.logs-container::-webkit-scrollbar {
  width: 4px;
}

.logs-container::-webkit-scrollbar-track {
  background: transparent;
}

.logs-container::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 2px;
}

.logs-container::-webkit-scrollbar-thumb:hover {
  background: #c0c4cc;
}
</style>
