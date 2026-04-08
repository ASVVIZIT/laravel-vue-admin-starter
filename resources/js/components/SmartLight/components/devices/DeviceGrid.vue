<template>
  <div class="device-grid">
    <!-- Loading (только при ПЕРВОЙ загрузке) -->
    <div v-if="deviceStore.loading && deviceStore.devices.length === 0" class="loading-state">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>Загрузка устройств...</span>
    </div>

    <!-- Error -->
    <div v-else-if="deviceStore.error" class="error-state">
      <el-icon><WarningFilled /></el-icon>
      <span>{{ deviceStore.error }}</span>
      <el-button size="small" type="primary" @click="retryLoad">Повтор</el-button>
    </div>

    <!-- Empty -->
    <div v-else-if="!deviceStore.filteredDevices?.length" class="empty-state">
      <el-icon><InfoFilled /></el-icon>
      <span>{{ getEmptyMessage }}</span>
    </div>

    <!-- Grid: ✅ Ключ по device_id + stable keys -->
    <div v-else class="grid-container">
      <DeviceCard
          v-for="device in deviceStore.filteredDevices"
          :key="`card-${device.device_id}`"
          :device="device"
          @device-selected="handleDeviceSelect"
          @open-settings="$emit('open-settings', $event)"
          @sleep-click="$emit('sleep-click', $event)"
          @wake-click="$emit('wake-click', $event)"
          @power-click="$emit('power-click', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Loading, WarningFilled, InfoFilled } from '@element-plus/icons-vue'
import { useDeviceStore } from '@/components/SmartLight/stores/smartlight/deviceStore.js'
import DeviceCard from './DeviceCard.vue'

const emit = defineEmits(['device-selected', 'open-settings', 'sleep-click', 'wake-click', 'power-click'])
const deviceStore = useDeviceStore()

const getEmptyMessage = computed(() => {
  const map = {
    real: 'Нет реальных устройств',
    fake: 'Нет фейковых устройств',
    personal: 'Нет ваших устройств'
  }
  return map[deviceStore.deviceFilter] || 'Устройства не найдены'
})

const handleDeviceSelect = (device) => {
  deviceStore.selectDeviceStore(device.device_id)
  emit('device-selected', device)
}

const retryLoad = async () => {
  deviceStore.error = null
  await deviceStore.fetchDevicesStore()
}

const handlePowerClick = async (device) => {
  emit('power-click', device)
}

const handleSleepClick = (device) => {
  emit('sleep-click', device)
}

const handleWakeClick = (device) => {
  emit('wake-click', device)
}
</script>

<style scoped>
.device-grid { min-height: 190px; margin-right: 10px}
.loading-state,.error-state,.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 6px; text-align: center; color: #909399; gap: 2px; font-size: 11px; }
.error-state { color: #f56c6c; }
.error-state .el-button { margin-top: 4px; font-size: 10px; }
.grid-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 2px; padding: 2px; width: 100%; }
.grid-container > * { animation: slide-in 0.2s ease-out; }
@keyframes slide-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@media (max-width: 768px) { .grid-container { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 6px; } }
</style>
