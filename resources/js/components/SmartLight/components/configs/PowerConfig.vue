<template>
  <div class="power-config">
    <el-form :model="config" label-width="180px" size="small">
      <el-form-item label="Тип источника питания">
        <el-select v-model="config.power_supply_type" class="full-width">
          <el-option label="Сеть 220V" value="ac_220v" />
          <el-option label="Блок питания 12V" value="dc_12v" />
          <el-option label="Блок питания 24V" value="dc_24v" />
          <el-option label="USB 5V" value="usb_5v" />
          <el-option label="Солнечная панель" value="solar" />
          <el-option label="Аккумулятор" value="battery" />
        </el-select>
      </el-form-item>

      <el-form-item label="Режим управления питанием">
        <el-select v-model="config.power_management_mode" class="full-width">
          <el-option label="Экономный" value="conservative" />
          <el-option label="Сбалансированный" value="balanced" />
          <el-option label="Производительный" value="aggressive" />
        </el-select>
      </el-form-item>

      <el-form-item label="Потребление (мА)">
        <el-input-number
            v-model="config.consumption_mA"
            :min="1"
            :max="1000"
            :step="5"
            class="full-width"
        />
      </el-form-item>

      <el-alert
          title="Укажите фактическое потребление для точного расчёта времени работы"
          type="info"
          :closable="false"
          show-icon
      />
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
  power_supply_type: 'ac_220v',
  power_management_mode: 'balanced',
  consumption_mA: 100
});

watch(() => props.device, (newDevice) => {
  if (newDevice) {
    config.value = {
      power_supply_type: newDevice.power_supply_type || 'ac_220v',
      power_management_mode: newDevice.power_management_mode || 'balanced',
      consumption_mA: newDevice.power_config?.custom_consumption_mA || 100
    };
  }
}, { immediate: true });

watch(() => config.value, (newConfig) => {
  emit('config-updated', { ...newConfig });
}, { deep: true });
</script>

<style scoped>
.power-config {
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
