<template>
  <div class="device-filter">
    <el-radio-group
        :model-value="deviceStore.deviceFilter"
        @update:model-value="deviceStore.setDeviceFilterStore"
        size="small"
        class="filter-group"
    >
      <el-radio-button
          v-for="tab in deviceStore.availableTabs"
          :key="tab.id"
          :label="tab.id"
      >
        {{ tab.label }}
      </el-radio-button>
    </el-radio-group>
    <span class="filter-count" v-if="showCount">({{ deviceStore.filteredDevices.length }})</span>
  </div>
</template>

<script setup>
import { useDeviceStore } from '@/components/SmartLight/stores/smartlight/deviceStore.js'

defineProps({ showCount: { type: Boolean, default: true } })
const deviceStore = useDeviceStore()
</script>

<style scoped>
.device-filter {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 1px 0;
}
.filter-group :deep(.el-radio-button__inner) {
  padding: 4px 8px;
  font-size: 11px;
}
.filter-count {
  font-size: 10px;
  color: #909399;
  font-weight: 500;
}
</style>
