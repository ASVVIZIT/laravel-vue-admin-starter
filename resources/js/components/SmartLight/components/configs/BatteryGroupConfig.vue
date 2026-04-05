<template>
  <div class="battery-group-config">
    <el-form :model="config" label-width="140px" size="small">
      <el-form-item label="Группировка">
        <el-switch
            v-model="config.enabled"
            active-text="Вкл"
            inactive-text="Выкл"
            @change="handleConfigChange"
        />
      </el-form-item>

      <el-form-item v-if="config.enabled" label="Тип">
        <el-select v-model="config.type" class="full-width" @change="handleConfigChange">
          <el-option label="Последовательная" value="series" />
          <el-option label="Параллельная" value="parallel" />
          <el-option label="Посл.-параллельная" value="series_parallel" />
        </el-select>
      </el-form-item>

      <el-form-item v-if="config.enabled" label="Количество">
        <el-input-number
            v-model="config.count"
            :min="1"
            :max="15"
            :step="1"
            class="full-width"
            @change="handleConfigChange"
        />
      </el-form-item>

      <el-alert
          v-if="config.enabled"
          :title="configDescription"
          type="info"
          :closable="false"
          show-icon
      />
    </el-form>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  device: { type: Object, required: true }
});

const emit = defineEmits(['config-updated']);

const config = ref({
  enabled: false,
  type: 'series',
  count: 1
});

const configDescription = computed(() => {
  const descriptions = {
    series: `Последовательная: ${config.value.count} × напряжение (ток не меняется)`,
    parallel: `Параллельная: ${config.value.count} × ёмкость (напряжение не меняется)`,
    series_parallel: `Комбинированная: увеличивает и напряжение и ёмкость`
  };
  return descriptions[config.value.type] || '';
});

watch(() => props.device?.battery_group_config, (newConfig) => {
  if (newConfig) {
    config.value = {
      enabled: newConfig.enabled || false,
      type: newConfig.type || 'series',
      count: newConfig.count || 1
    };
  }
}, { immediate: true });

const handleConfigChange = () => {
  emit('config-updated', { ...config.value });
};
</script>

<style scoped>
.battery-group-config {
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

:deep(.el-alert) {
  margin-top: 8px;
  font-size: 12px;
}
</style>
