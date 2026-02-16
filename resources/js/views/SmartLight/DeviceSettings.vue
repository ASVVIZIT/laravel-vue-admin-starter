<template>
  <div class="device-settings">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="Основные" name="basic">
        <!-- Основные настройки устройства -->
        <el-form :model="deviceForm" label-width="180px">
          <el-form-item label="Тип батареи">
            <el-select v-model="deviceForm.battery_type_id" @change="handleBatteryTypeChange">
              <el-option
                  v-for="type in typesBatteryTypesForDropdown"
                  :key="type.value"
                  :label="type.label"
                  :value="type.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="Тип лампы">
            <el-select v-model="deviceForm.bulb_type_id" @change="handleBulbTypeChange">
              <el-option
                  v-for="type in typesBulbTypesForDropdown"
                  :key="type.value"
                  :label="type.label"
                  :value="type.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="Тип источника питания">
            <el-select v-model="deviceForm.power_supply_id" @change="handlePowerSupplyChange">
              <el-option
                  v-for="supply in typesPowerSuppliesForDropdown"
                  :key="supply.value"
                  :label="supply.label"
                  :value="supply.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="Критическое напряжение">
            <el-input-number
                v-model="deviceForm.critical_voltage"
                :min="minCriticalVoltage"
                :max="maxCriticalVoltage"
                :step="0.01"
                :precision="2"
            />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="saveSettings">Сохранить</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="Группировка батарей" name="battery-group">
        <!-- Настройки группировки батарей -->
        <battery-group-config
            v-if="selectedDevice"
            :device="selectedDevice"
            @update="handleBatteryGroupUpdate"
        />
      </el-tab-pane>

      <el-tab-pane label="Дополнительно" name="advanced">
        <!-- Дополнительные настройки -->
        <el-form :model="deviceForm" label-width="180px">
          <el-form-item label="Интервал сна (сек)">
            <el-input-number
                v-model="deviceForm.sleep_interval"
                :min="60"
                :max="3600"
                :step="60"
            />
          </el-form-item>

          <el-form-item label="Аварийный интервал сна (сек)">
            <el-input-number
                v-model="deviceForm.emergency_sleep_interval"
                :min="300"
                :max="7200"
                :step="60"
            />
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useSmartlightStore } from '@/components/SmartLight/stores';
import { getDevice } from '@/components/SmartLight/utils/deviceUtils';
import BatteryGroupConfig from '@/components/SmartLight/components/BatteryGroupConfig.vue';

const store = useSmartlightStore();
const activeTab = ref('basic');
const deviceForm = ref({
  critical_voltage: 3.0,
  sleep_interval: 600,
  emergency_sleep_interval: 3600,
  battery_type_id: 'li-ion-18650',
  bulb_type_id: 'classic',
  power_supply_id: 'standard'
});

// Вычисляемое свойство для выбранных типов
const typesBatteryTypesForDropdown = computed(() => store.typesBatteryTypesForDropdown);
const typesBulbTypesForDropdown = computed(() => store.typesBulbTypesForDropdown);
const typesPowerSuppliesForDropdown = computed(() => store.typesPowerSuppliesForDropdown);

// Вычисляемое свойство для выбранного устройства
const selectedDevice = computed(() => store.deviceSelectedDevice);

// Вычисляемые свойства для диапазонов напряжения
const minCriticalVoltage = computed(() => {
  if (!selectedDevice.value) return 2.5;
  const batteryType = store.typesGetBatteryTypeById(selectedDevice.value.battery_type_id);
  return batteryType ? batteryType.minVoltage : 2.5;
});

const maxCriticalVoltage = computed(() => {
  if (!selectedDevice.value) return 4.3;
  const batteryType = store.typesGetBatteryTypeById(selectedDevice.value.battery_type_id);
  return batteryType ? batteryType.maxVoltage : 4.3;
});

// Обработчик изменения типа батареи
const handleBatteryTypeChange = async (batteryTypeId) => {
  const batteryType = store.typesGetBatteryTypeById(batteryTypeId);
  deviceForm.value.critical_voltage = batteryType.criticalVoltage;

  // Обновляем настройки устройства
  await store.deviceUpdateDeviceSettings(selectedDevice.value.device_id, {
    battery_type_id: batteryTypeId,
    critical_voltage: batteryType.criticalVoltage
  });
};

// Обработчик изменения типа лампы
const handleBulbTypeChange = async (bulbTypeId) => {
  await store.deviceUpdateDeviceSettings(selectedDevice.value.device_id, {
    bulb_type_id: bulbTypeId
  });
};

// Обработчик изменения источника питания
const handlePowerSupplyChange = async (supplyId) => {
  // Проверяем совместимость
  const { isCompatible } = await store.powerCheckCompatibility(
      selectedDevice.value.device_id,
      supplyId
  );

  if (isCompatible) {
    await store.deviceUpdateDeviceSettings(selectedDevice.value.device_id, {
      power_supply_id: supplyId
    });
  }
};

// Обработчик обновления группировки батарей
const handleBatteryGroupUpdate = async (groupConfig) => {
  await store.deviceUpdateDeviceSettings(selectedDevice.value.device_id, {
    battery_group_config: groupConfig
  });
};

// Обработчик сохранения настроек
const saveSettings = async () => {
  await store.deviceUpdateDeviceSettings(selectedDevice.value.device_id, {
    critical_voltage: deviceForm.value.critical_voltage,
    sleep_interval: deviceForm.value.sleep_interval,
    emergency_sleep_interval: deviceForm.value.emergency_sleep_interval
  });
};

// Инициализация при монтировании компонента
onMounted(() => {
  if (selectedDevice.value) {
    // Заполняем форму данными выбранного устройства
    deviceForm.value = {
      critical_voltage: selectedDevice.value.critical_voltage || 3.0,
      sleep_interval: selectedDevice.value.sleep_interval || 600,
      emergency_sleep_interval: selectedDevice.value.emergency_sleep_interval || 3600,
      battery_type_id: selectedDevice.value.battery_type_id || 'li-ion-18650',
      bulb_type_id: selectedDevice.value.bulb_type_id || 'classic',
      power_supply_id: selectedDevice.value.power_supply_id || 'standard'
    };
  }
});
</script>

<style scoped>
.device-settings {
  padding: 20px;
}
</style>
