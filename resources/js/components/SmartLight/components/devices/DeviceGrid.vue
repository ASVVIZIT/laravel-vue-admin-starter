<template>
  <div class="device-grid">
    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>Загрузка...</span>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error-state">
      <el-icon><WarningFilled /></el-icon>
      <span>{{ error }}</span>
      <el-button size="small" type="primary" @click="retryLoad">
        Повтор
      </el-button>
    </div>

    <!-- Empty -->
    <div v-else-if="!devices || devices.length === 0" class="empty-state">
      <el-icon><InfoFilled /></el-icon>
      <span>Нет устройств</span>
    </div>

    <!-- Grid -->
    <div v-else class="grid-container">
      <div
          v-for="device in devices"
          :key="device.device_id"
          class="grid-item"
      >
        <DeviceCard
            :device="device"
            @device-selected="handleDeviceSelect"
            @open-settings="$emit('open-settings', $event)"
            @sleep-click="handleSleepClick"
            @wake-click="handleWakeClick"
            @power-click="handlePowerClick"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { Loading, WarningFilled, InfoFilled } from '@element-plus/icons-vue';
import { useDeviceStore } from '@/components/SmartLight/stores/index.js';
import DeviceCard from './DeviceCard.vue';

const emit = defineEmits([
  'device-selected',
  'open-settings',
  'sleep-click',
  'wake-click',
  'power-click'
]);

const props = defineProps({
  devices: {
    type: Array,
    default: null
  }
});

const store = useDeviceStore();
const loading = ref(false);
const error = ref(null);
const pollingInterval = ref(null);

const handleDeviceSelect = (device) => {
  store.selectDeviceStore(device.device_id);
  emit('device-selected', device);
};

const retryLoad = async () => {
  error.value = null;
  await loadDevices();
};

const loadDevices = async () => {
  if (props.devices !== null) return;

  loading.value = true;
  error.value = null;

  try {
    const result = await store.fetchDevicesStore();
    if (!result.success) {
      throw new Error(result.error || 'Не удалось загрузить устройства');
    }
  } catch (err) {
    console.error('DeviceGrid: Load error', err);
    error.value = err.message || 'Ошибка загрузки';
  } finally {
    loading.value = false;
  }
};

const startPolling = () => {
  if (pollingInterval.value) return;
  pollingInterval.value = setInterval(async () => {
    try {
      await store.fetchDevicesStore();
    } catch (err) {
      console.warn('DeviceGrid: Polling error', err);
    }
  }, 10000);
};

const stopPolling = () => {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value);
    pollingInterval.value = null;
  }
};

// === ✅ ИСПРАВЛЕНО: Модальные подтверждения перед действием ===

const handlePowerClick = async (device) => {
  const isOn = device.status === 'ON';
  const action = isOn ? 'выключить' : 'включить';

  try {
    await ElMessageBox.confirm(
        `Вы действительно хотите ${action} устройство "${device.name}"?`,
        'Подтверждение питания',
        {
          confirmButtonText: 'Да',
          cancelButtonText: 'Отмена',
          type: isOn ? 'warning' : 'info'
        }
    );

    const newStatus = isOn ? 'OFF' : 'ON';
    await store.updateDeviceStatusStore(device.device_id, newStatus);
    ElMessage.success(`Питание: ${isOn ? 'выключено' : 'включено'}`);
    // ✅ НЕ emit-им обратно, чтобы не создавать цикл
  } catch (err) {
    if (err !== 'cancel') {
      console.error('Power click error:', err);
      ElMessage.error('Не удалось изменить статус');
    }
  }
};

const handleSleepClick = async (device) => {
  const isSleeping = device.status === 'SLEEPING';
  const action = isSleeping ? 'пробудить' : 'перевести в спящий режим';
  const message = isSleeping
      ? `Пробудить устройство "${device.name}"?`
      : `Перевести "${device.name}" в спящий режим?\nПлата отключит Wi-Fi для экономии энергии.`;

  try {
    await ElMessageBox.confirm(
        message,
        isSleeping ? 'Пробуждение' : 'Спящий режим',
        {
          confirmButtonText: 'Продолжить',
          cancelButtonText: 'Отмена',
          type: isSleeping ? 'success' : 'warning'
        }
    );

    if (isSleeping) {
      await store.wakeDeviceStore(device.device_id);
      ElMessage.success('Устройство пробуждено');
      // ✅ УДАЛЕНО: emit('wake-click', device) — создавал цикл и двойное модальное окно
    } else {
      await store.forceSleepStore(device.device_id);
      ElMessage.warning('Устройство переведено в сон');
      // ✅ УДАЛЕНО: emit('sleep-click', device) — создавал цикл и двойное модальное окно
    }
  } catch (err) {
    if (err !== 'cancel') {
      console.error('Sleep click error:', err);
      ElMessage.error('Не удалось выполнить действие');
    }
  }
};

const handleWakeClick = handleSleepClick; // Дублируем для совместимости

onMounted(async () => {
  await loadDevices();
  startPolling();
});

onUnmounted(() => {
  stopPolling();
});
</script>

<style scoped>
.device-grid {
  width: 100%;
  min-height: 190px;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
  color: #909399;
  gap: 8px;
  font-size: 11px;
}

.loading-state .is-loading,
.error-state .el-icon,
.empty-state .el-icon {
  font-size: 20px;
}

.error-state {
  color: #f56c6c;
}

.error-state .el-button {
  margin-top: 4px;
  font-size: 10px;
  padding: 4px 12px;
  height: 24px;
}

.grid-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 4px;
  width: 100%;
  justify-content: flex-start;
}

.grid-item {
  /* Пустой класс для возможного расширения */
}

/* === Адаптив === */
@media (max-width: 768px) {
  .grid-container {
    gap: 3px;
    padding: 3px;
  }
}
</style>
