<template>
  <div class="battery-renderer" :style="{ width: width, height: height }">
    <!-- CSS-визуализация как fallback -->
    <div class="battery-css-container" v-if="!webGLSupported || !show3D">
      <div class="battery-container">
        <div class="battery-wrapper">
          <div class="battery-plus">+</div>
          <div class="battery-body">
            <div class="battery">
            <div
                class="battery-normal"
                :style="{
                width: batteryNormalProgress + '%',
                backgroundColor: batteryColor
              }"
            ></div>
            <div
                class="battery-critical"
                :style="{
                width: batteryCriticalProgress + '%',
                backgroundColor: criticalColor
              }"
            >
              <div class="battery-critical-pattern"></div>
            </div>
            <div class="battery-mark critical-threshold" :style="{ left: criticalThresholdPosition + '%' }"></div>
            <div class="battery-mark current-level" :style="{ left: currentLevelPosition + '%' }"></div>
            <div class="battery-cap"></div>
            <div class="battery-plus">+</div>
            <div class="battery-minus">-</div>
          </div>
          </div>
          <div class="battery-levels">
            <span class="battery-level" :style="{ left: '0%' }">{{ formattedMinVoltage }} В</span>
            <span class="battery-level" :style="{ left: criticalThresholdPosition + '%' }">{{ formattedCriticalThreshold }} В</span>
            <span class="battery-level" :style="{ left: '100%' }">{{ formattedMaxVoltage }} В</span>
          </div>
          <div class="battery-minus">-</div>
        </div>
      </div>
      <div class="battery-info-container">
        <div class="battery-type-info">
          <span class="battery-type-label">Тип:</span>
          <span class="battery-type-value">{{ batteryTypeName }}</span>
        </div>
        <div class="voltage-value">{{ formattedVoltage }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useSmartLightStore } from '@/components/SmartLight/stores/smartLightStore.js';
import { checkWebGLSupport } from '@/components/SmartLight/api/utils/webglSupport.js';

const props = defineProps({
  deviceId: {
    type: String,
    required: true
  },
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '100%'
  },
  show3D: {
    type: Boolean,
    default: false
  }
});

const store = useSmartLightStore();
const webGLCheck = checkWebGLSupport();
const webGLSupported = webGLCheck.isSupported;

// Получаем данные устройства
const device = computed(() => store.getDevice(props.deviceId));
const voltage = computed(() => device.value?.voltage || 3.7);
const criticalVoltage = computed(() => store.calculateGroupCriticalVoltage(props.deviceId));

// Вычисляем позицию критического порога в процентах
const criticalThresholdPosition = computed(() => {
  return store.deviceCriticalThresholdPosition(props.deviceId);
});

// Нормальный прогресс (от критического порога до max)
const batteryNormalProgress = computed(() => {
  return store.deviceNormalProgress(props.deviceId);
});

// Критический прогресс (от min до критического порога)
const batteryCriticalProgress = computed(() => {
  return store.deviceCriticalProgress(props.deviceId);
});

// Позиция текущего уровня
const currentLevelPosition = computed(() => {
  return store.deviceCurrentLevelPosition(props.deviceId);
});

// Цвет критического уровня
const criticalColor = computed(() => {
  return store.deviceCriticalColor(props.deviceId);
});

// Цвет нормального уровня
const batteryColor = computed(() => {
  return store.deviceBatteryColor(props.deviceId);
});

// Отформатированное значение критического напряжения
const formattedCriticalThreshold = computed(() => {
  return store.calculateGroupCriticalVoltage(props.deviceId).toFixed(2);
});

// Минимальное напряжение
const formattedMinVoltage = computed(() => {
  return store.calculateGroupMinVoltage(props.deviceId).toFixed(1);
});

// Максимальное напряжение
const formattedMaxVoltage = computed(() => {
  return store.calculateGroupMaxVoltage(props.deviceId).toFixed(1);
});

// Отформатированное значение напряжения
const formattedVoltage = computed(() => {
  return voltage.value.toFixed(2) + ' В';
});

// Название типа аккумулятора
const batteryTypeName = computed(() => {
  const device = store.getDevice(props.deviceId);
  const batteryType = store.getBatteryType(device?.battery_type_id);
  return batteryType.name || 'Неизвестный тип';
});
</script>

<style scoped>
.battery-renderer {
  width: 100%;
  height: 100%;
  min-width: 100px;
  min-height: 50px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.battery-css-container {
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.battery-wrapper {
  width: 100%;
}

.battery-container {
  position: relative;
  height: 70px;
  width: 90%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.battery {
  position: relative;
  width: 100%;
  height: 45px;
  border: 2px solid #9eb0be;
  border-radius: 8px;
  background: #dadbe7;
  overflow: hidden;
  box-sizing: border-box;
}

.battery-normal {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #67c23a 0%, #95d97b 100%);
  transition: width 0.3s ease, background-color 0.3s ease;
}

.battery-critical {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #f56c6c 0%, #ff9999 100%);
  overflow: hidden;
}

.battery-critical-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
      -45deg,
      transparent,
      transparent 3px,
      rgba(255, 255, 255, 0.3) 3px,
      rgba(255, 255, 255, 0.3) 6px
  );
}

.battery-mark {
  position: absolute;
  top: -3px;
  bottom: -3px;
  width: 1px;
  background-color: #e6a23c;
  z-index: 10;
}

.battery-mark.critical-threshold {
  border-left: 1px dashed #e6a23c;
}

.battery-mark.current-level {
  border-left: 1px solid #409eff;
}

.battery-cap {
  position: absolute;
  top: -1px;
  right: -1px;
  width: 1px;
  height: 4px;
  background: #409eff;
  border-radius: 1px;
}

.battery-plus {
  position: absolute;
  top: 50%;
  left: -10px;
  transform: translateY(-50%);
  font-weight: bold;
  color: #409eff;
  font-size: 0.8rem;
  z-index: 10;
}

.battery-minus {
  position: absolute;
  top: 50%;
  right: -10px;
  transform: translateY(-50%);
  font-weight: bold;
  color: #409eff;
  font-size: 0.8rem;
  z-index: 10;
}

.battery-levels {
  display: flex;
  justify-content: space-between;
  position: relative;
  margin-top: 1px;
  font-size: 0.7rem;
  color: #909399;
  width: 100%;
}

.battery-level {
  position: absolute;
  font-size: 0.7rem;
  color: #909399;
  width: 30px;
}

.battery-info-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  width: 100%;
}

.battery-type-info {
  position: absolute;
  display: block;
  font-size: 0.75rem;
  color: #606266;
  width: 100%;
  text-align: center;
  top: 15px;
}

.battery-type-label {
  font-weight: bold;
}

.voltage-value {
  text-align: center;
  font-weight: bold;
  color: #409eff;
  font-size: 1.2rem;
  margin-top: 0.2rem;
  line-height: 1.2;
  position: absolute;
  top: 28px;
}
</style>
