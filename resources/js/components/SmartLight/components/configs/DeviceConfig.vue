<template>
  <div class="device-config">
    <el-form :model="config" label-width="160px" size="small">
      <el-form-item label="Тип устройства">
        <el-select v-model="config.device_type" class="full-width">
          <el-option label="NodeMCU V3" value="node_mcu_v3" />
          <el-option label="ESP32" value="esp32" />
          <el-option label="Arduino" value="arduino" />
        </el-select>
      </el-form-item>

      <el-form-item label="Режим работы">
        <el-select v-model="config.operation_mode" class="full-width">
          <el-option label="Автоматический" value="auto" />
          <el-option label="Ручной" value="manual" />
          <el-option label="По расписанию" value="schedule" />
        </el-select>
      </el-form-item>

      <el-form-item label="Интервал обновления (сек)">
        <el-input-number
            v-model="config.update_interval"
            :min="5"
            :max="3600"
            :step="5"
            class="full-width"
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  device: { type: Object, required: true }
});

const emit = defineEmits(['config-updated']);

const config = ref({
  device_type: 'node_mcu_v3',
  operation_mode: 'auto',
  update_interval: 60
});

watch(() => props.device, (newDevice) => {
  if (newDevice) {
    config.value = {
      device_type: newDevice.device_type || 'node_mcu_v3',
      operation_mode: newDevice.operation_mode || 'auto',
      update_interval: newDevice.update_interval || 60
    };
  }
}, { immediate: true });

watch(() => config.value, (newConfig) => {
  emit('config-updated', { ...newConfig });
}, { deep: true });
</script>

<style scoped>
.device-config {
  padding: 10px 5px;
}

.full-width {
  width: 100%;
}

:deep(.el-form-item) {
  margin-bottom: 14px;
}

:deep(.el-input-number) {
  width: 100%;
}
</style>
