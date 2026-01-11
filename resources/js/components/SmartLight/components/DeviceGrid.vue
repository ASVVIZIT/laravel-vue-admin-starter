<template>
  <div class="device-grid">
    <el-skeleton v-if="loading" :rows="3" :count="8" animated />

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
              @click="selectDevice(device)"
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
          <span>Тестовые устройства</span>
        </div>

        <div v-if="fakeDevices.length === 0" class="no-devices">
          <el-empty description="Нет тестовых устройств" />
        </div>
        <div v-else class="grid-container">
          <div
              v-for="device in fakeDevices"
              :key="device.device_id"
              class="device-col fake-device"
              @click="selectDevice(device)"
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

const emit = defineEmits(['device-updated', 'emergency-sleep', 'open-settings', 'device-selected']);

// Реальные устройства (is_fake = false)
const realDevices = computed(() => {
  return props.devices.filter(device => !device.is_fake);
});

// Фейковые устройства (is_fake = true)
const fakeDevices = computed(() => {
  return props.devices.filter(device => device.is_fake);
});

// Селектор устройства
const selectDevice = (device) => {
  emit('device-selected', device);
};
</script>

<style scoped>
.device-grid {
  width: 100%;
  margin-top: 0.5rem;
}

.device-tabs {
  border: 1px solid #ebeef5;
  border-radius: 3px;
  overflow: hidden;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
  padding: 0.75rem;
  grid-auto-rows: minmax(280px, auto);
}

.device-col {
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  height: 100%;
}

.device-col:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.fake-device::after {
  content: "Тест";
  position: absolute;
  top: -5px;
  right: 5px;
  background: #cd5454;
  color: #ffedf0;
  border: 1px solid #701f23;
  border-radius: 10px;
  padding: 1px 4px;
  font-size: 10px;
  font-weight: bold;
  z-index: 2;
  white-space: nowrap;
}

.fake-devices-banner {
  background: #fff7e6;
  border: 1px solid #fffae6;
  border-radius: 3px;
  padding: 0.5rem;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  color: #e6a23c;
  font-size: 0.85rem;
}

.no-devices {
  padding: 1rem;
  text-align: center;
  font-size: 0.9rem;
}
</style>
