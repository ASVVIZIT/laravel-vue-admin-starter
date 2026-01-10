<template>
  <div class="device-grid">
    <el-skeleton v-if="loading" :rows="4" :count="6" animated />

    <div v-if="!loading && devices.length === 0" class="no-devices">
      <el-empty description="Нет устройств" />
    </div>

    <el-tabs v-else class="device-tabs" type="border-card">
      <!-- Реальные устройства -->
      <el-tab-pane
          :label="`Реальные (${realDevices.length})`"
          :disabled="realDevices.length === 0"
      >
        <div class="grid-container">
          <div
              v-for="device in realDevices"
              :key="device.device_id"
              class="device-col"
          >
            <DeviceCard
                :device="device"
                @command-sent="$emit('device-updated', device.device_id)"
                @emergency-sleep="$emit('emergency-sleep', device.device_id)"
                @open-settings="$emit('open-settings', device)"
            />
          </div>
        </div>
      </el-tab-pane>

      <!-- Фейковые устройства -->
      <el-tab-pane
          :label="`Демонстрация (${fakeDevices.length})`"
          :disabled="fakeDevices.length === 0"
      >
        <div class="fake-devices-banner">
          <el-icon name="warning" class="mr-1" />
          <span>Это тестовые устройства. Команды эмулируются в интерфейсе.</span>
        </div>

        <div v-if="fakeDevices.length === 0" class="no-devices">
          <el-empty description="Нет тестовых устройств" />
        </div>
        <div v-else class="grid-container">
          <div
              v-for="device in fakeDevices"
              :key="device.device_id"
              class="device-col fake-device"
          >
            <DeviceCard
                :device="device"
                @command-sent="$emit('device-updated', device.device_id)"
                @emergency-sleep="$emit('emergency-sleep', device.device_id)"
                @open-settings="$emit('open-settings', device)"
            />
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import DeviceCard from './DeviceCard.vue';

const props = defineProps({
  devices: {
    type: Array,
    required: true,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

defineEmits(['device-updated', 'emergency-sleep', 'open-settings']);

// Реальные устройства (is_fake = false)
const realDevices = computed(() => {
  return props.devices.filter(device => !device.is_fake);
});

// Фейковые устройства (is_fake = true)
const fakeDevices = computed(() => {
  return props.devices.filter(device => device.is_fake);
});
</script>

<style scoped>
.device-grid {
  width: 100%;
  margin-top: 1rem;
}

.device-tabs {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
}

.device-col {
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.device-col:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.fake-device {
  position: relative;
}

.fake-device::after {
  content: "Fake";
  position: absolute;
  top: -7px;
  right: 5px;
  background: #cd5454;
  color: #ffedf0;
  border: 1px solid #701f23;
  border-radius: 15px;
  padding: 2px 6px;
  font-size: 12px;
  font-weight: bold;
  z-index: 2;
}

.fake-devices-banner {
  background: #f9f1e8;
  border: 1px solid #fae1c4;
  border-radius: 4px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  color: #b87333;
}

.no-devices {
  padding: 1.5rem;
  text-align: center;
}
</style>
