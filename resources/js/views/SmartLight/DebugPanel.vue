<template>
  <div class="debug-panel" :class="{ 'debug-panel--visible': debugPanelVisible }">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="Устройства" name="devices">
        <div class="debug-section">
          <h3>Список устройств</h3>

          <el-table :data="devices" border>
            <el-table-column prop="device_id" label="ID" width="180" />
            <el-table-column prop="name" label="Имя" width="150" />
            <el-table-column prop="voltage" label="Напряжение" width="120" />
            <el-table-column prop="intensity" label="Интенсивность" width="150" />
            <el-table-column prop="status" label="Статус" width="120" />
            <el-table-column prop="battery_type_id" label="Тип батареи" width="150" />
            <el-table-column prop="bulb_type_id" label="Тип лампы" width="150" />
            <el-table-column label="Действия" width="150">
              <template #default="{ row }">
                <el-button size="small" @click="selectDevice(row.device_id)">
                  Выбрать
                </el-button>
                <el-button size="small" @click="wakeDevice(row.device_id)" v-if="row.status === 'SLEEPING'">
                  Пробудить
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <el-tab-pane label="Настройки" name="settings">
        <div class="debug-section">
          <h3>Глобальные настройки</h3>

          <el-form :model="globalSettings" label-width="200px">
            <el-form-item label="Критическое напряжение">
              <el-input-number
                  v-model="globalSettings.critical_voltage"
                  :min="2.5"
                  :max="4.3"
                  :step="0.1"
                  @change="updateGlobalSettings"
              />
            </el-form-item>

            <el-form-item label="Интервал сна (сек)">
              <el-input-number
                  v-model="globalSettings.sleep_interval"
                  :min="60"
                  :max="3600"
                  :step="60"
                  @change="updateGlobalSettings"
              />
            </el-form-item>

            <el-form-item label="Аварийный интервал сна (сек)">
              <el-input-number
                  v-model="globalSettings.emergency_sleep_interval"
                  :min="300"
                  :max="7200"
                  :step="60"
                  @change="updateGlobalSettings"
              />
            </el-form-item>

            <el-form-item label="Тип батареи по умолчанию">
              <el-select v-model="globalSettings.default_battery_type" @change="updateGlobalSettings">
                <el-option
                    v-for="type in typesBatteryTypesForDropdown"
                    :key="type.value"
                    :label="type.label"
                    :value="type.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="Тип лампы по умолчанию">
              <el-select v-model="globalSettings.default_bulb_type" @change="updateGlobalSettings">
                <el-option
                    v-for="type in typesBulbTypesForDropdown"
                    :key="type.value"
                    :label="type.label"
                    :value="type.value"
                />
              </el-select>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <el-tab-pane label="Типы" name="types">
        <div class="debug-section">
          <h3>Типы аккумуляторов</h3>
          <el-table :data="batteryTypes" border>
            <el-table-column prop="name" label="Имя" />
            <el-table-column prop="id" label="ID" width="120" />
            <el-table-column prop="chemistry" label="Химия" width="150" />
            <el-table-column prop="nominalVoltage" label="Номинальное напряжение" width="180" />
            <el-table-column prop="minVoltage" label="Мин. напряжение" width="150" />
            <el-table-column prop="maxVoltage" label="Макс. напряжение" width="150" />
            <el-table-column prop="criticalVoltage" label="Крит. напряжение" width="150" />
          </el-table>

          <h3 style="margin-top: 20px">Типы ламп</h3>
          <el-table :data="bulbTypes" border>
            <el-table-column prop="name" label="Имя" />
            <el-table-column prop="id" label="ID" width="120" />
            <el-table-column prop="category" label="Категория" width="150" />
            <el-table-column prop="lightEfficiency" label="Эффективность" width="120" />
            <el-table-column prop="colorTemperature" label="Цвет. температура" width="150" />
            <el-table-column prop="lifespan" label="Срок службы" width="120" />
          </el-table>

          <h3 style="margin-top: 20px">Источники питания</h3>
          <el-table :data="powerSupplies" border>
            <el-table-column prop="name" label="Имя" />
            <el-table-column prop="id" label="ID" width="120" />
            <el-table-column prop="category" label="Категория" width="150" />
            <el-table-column prop="voltageRange.min" label="Мин. напряжение" width="150" />
            <el-table-column prop="voltageRange.max" label="Макс. напряжение" width="150" />
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>

    <div class="debug-panel__close" @click="toggleDebugPanel">
      <i class="el-icon-close"></i>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useSmartlightStore } from '@/components/SmartLight/stores';
import { calculateCriticalThresholdPosition, calculateBatteryNormalProgress, calculateBatteryColor } from '@/components/SmartLight/utils/deviceUtils';

const store = useSmartlightStore();
const activeTab = ref('devices');

// Вычисляемые свойства
const debugPanelVisible = computed(() => store.interfaceDebugPanelVisible);
const devices = computed(() => store.deviceRealDevices);
const globalSettings = computed(() => store.settingsGlobalSettings);
const batteryTypes = computed(() => store.typesBatteryTypesForDropdown.map(type => type.data));
const bulbTypes = computed(() => store.typesBulbTypesForDropdown.map(type => type.data));
const powerSupplies = computed(() => store.typesPowerSuppliesForDropdown.map(supply => supply.data));

// Методы
const toggleDebugPanel = () => {
  store.interfaceToggleDebugPanel();
};

const selectDevice = (deviceId) => {
  store.deviceSelectDevice(deviceId);
};

const wakeDevice = (deviceId) => {
  store.deviceWakeDevice(deviceId);
};

// Инициализация при монтировании
onMounted(() => {
  // Инициализируем сторы
  store.interfaceInit();
});

// Наблюдение за изменениями
watch(debugPanelVisible, (newValue) => {
  if (newValue) {
    activeTab.value = 'devices';
  }
});
</script>

<style scoped>
.debug-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50vh;
  background-color: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  padding: 20px;
  transition: height 0.3s ease;
  overflow-y: auto;
}

.debug-panel--visible {
  height: 50vh;
}

.debug-panel__close {
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  font-size: 18px;
}

.debug-section {
  margin-bottom: 20px;
}
</style>
