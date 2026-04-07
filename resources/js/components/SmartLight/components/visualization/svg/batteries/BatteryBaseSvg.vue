<template>
  <div class="battery-base-svg" :style="{ height: containerHeight }">
    <div class="battery-wrapper">
      <!-- Положительный контакт -->
      <div class="battery-plus">+</div>

      <!-- Корпус батареи -->
      <div class="battery-body">
        <!-- ✅ Класс battery-critical только если НЕ спит И напряжение критическое -->
        <div
            class="battery"
            :class="{
            'battery-critical': isCritical && status !== 'SLEEPING',
            'battery--sleeping': status === 'SLEEPING'
          }"
        >
          <!-- Нормальный уровень (выше critical_voltage) -->
          <div
              class="battery-normal"
              :style="{
              width: normalProgress + '%',
              backgroundColor: normalColor
            }"
          ></div>

          <!-- Критический уровень (ниже critical_voltage) -->
          <div
              class="battery-critical-fill"
              :style="{
              width: criticalProgress + '%',
              backgroundColor: criticalColor
            }"
          >
            <div class="battery-critical-pattern"></div>
          </div>

          <!-- Маркер критического порога -->
          <div
              v-if="showMarkers"
              class="battery-mark critical-threshold"
              :style="{ left: criticalThresholdPosition + '%' }"
              :title="`Крит. порог: ${formattedCriticalThreshold}В`"
          ></div>

          <!-- Маркер текущего уровня -->
          <div
              v-if="showMarkers"
              class="battery-mark current-level"
              :style="{ left: currentLevelPosition + '%' }"
              :title="`Текущее: ${voltage.toFixed(2)}В`"
          ></div>

          <!-- Крышка -->
          <div class="battery-cap" :style="{ backgroundColor: capColor }"></div>
        </div>
      </div>

      <!-- Отрицательный контакт -->
      <div class="battery-minus">-</div>
    </div>

    <!-- Уровни напряжения -->
    <div v-if="showLevels" class="battery-levels">
      <span class="battery-level" style="left: 0%">{{ minVoltage.toFixed(1) }} В</span>
      <span
          class="battery-level"
          :style="{ left: criticalThresholdPosition + '%' }"
      >
        {{ formattedCriticalThreshold }} В
      </span>
      <span class="battery-level" style="left: 100%">{{ maxVoltage.toFixed(1) }} В</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  /** Текущее напряжение */
  voltage: { type: Number, default: 3.7 },
  /** Критическое напряжение (из настроек устройства) */
  criticalVoltage: { type: Number, default: 3.2 },
  /** Статус устройства (ON, OFF, SLEEPING, ERROR) */
  status: { type: String, default: 'ON' },
  /** Минимальное напряжение типа батареи (из specs) */
  minVoltage: { type: Number, default: 2.5 },
  /** Максимальное напряжение типа батареи (из specs) */
  maxVoltage: { type: Number, default: 4.2 },
  /** Цвета для статусов */
  colors: {
    type: Object,
    default: () => ({
      normal: '#67c23a',
      warning: '#e6a23c',
      critical: '#f56c6c',
      off: '#909399'
    })
  },
  /** Высота компонента */
  height: { type: String, default: '40px' },
  /** Показывать уровни напряжения */
  showLevels: { type: Boolean, default: true },
  /** Показывать маркеры */
  showMarkers: { type: Boolean, default: true },
  /** Масштаб */
  scale: { type: Number, default: 1.0 },
  /** Цвет крышки */
  capColor: { type: String, default: '#409eff' }
});

const containerHeight = computed(() => props.height);
const totalRange = computed(() => props.maxVoltage - props.minVoltage);

// ✅ Прогресс "нормального" уровня (от criticalVoltage до maxVoltage)
const normalProgress = computed(() => {
  if (totalRange.value <= 0) return 0;
  const normalRange = props.maxVoltage - props.criticalVoltage;
  const normalValue = Math.max(0, props.voltage - props.criticalVoltage);
  return Math.min(100, (normalValue / totalRange.value) * 100);
});

// ✅ Прогресс "критического" уровня (от minVoltage до criticalVoltage)
const criticalProgress = computed(() => {
  if (totalRange.value <= 0) return 0;
  const criticalValue = Math.max(0, Math.min(
      props.criticalVoltage - props.minVoltage,
      props.voltage - props.minVoltage
  ));
  return Math.min(100, (criticalValue / totalRange.value) * 100);
});

// ✅ Позиция маркера критического порога (в % от общего диапазона)
const criticalThresholdPosition = computed(() => {
  if (totalRange.value <= 0) return 0;
  return ((props.criticalVoltage - props.minVoltage) / totalRange.value) * 100;
});

// ✅ Позиция маркера текущего уровня
const currentLevelPosition = computed(() => {
  if (totalRange.value <= 0) return 0;
  const clampedVoltage = Math.max(
      props.minVoltage,
      Math.min(props.maxVoltage, props.voltage)
  );
  return ((clampedVoltage - props.minVoltage) / totalRange.value) * 100;
});

// ✅ Критическое состояние только если НЕ спит
const isCritical = computed(() =>
    props.voltage < props.criticalVoltage && props.status !== 'SLEEPING'
);

// ✅ Цвет с учётом статуса
const normalColor = computed(() => {
  if (props.status === 'SLEEPING') return '#dcdfe6'; // Приглушенный при сне
  if (props.voltage < props.criticalVoltage) return props.colors.critical;
  if (props.voltage < props.criticalVoltage + 0.3) return props.colors.warning;
  return props.colors.normal;
});

const criticalColor = computed(() => props.colors.critical);
const formattedCriticalThreshold = computed(() => props.criticalVoltage.toFixed(1));
</script>

<style scoped>
.battery-base-svg {
  position: relative;
  width: 90%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.battery-wrapper {
  width: 100%;
  position: relative;
}

.battery {
  position: relative;
  width: 100%;
  height: 30px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #f5f7fa;
  overflow: hidden;
  box-sizing: border-box;
  transition: border-color 0.3s ease, background-color 0.3s ease;
}

/* === Спокойный режим при сне (без пульсации) === */
.battery--sleeping {
  border-color: #e6a23c;
  background: #fdf6ec;
  animation: none !important;
}
.battery--sleeping .battery-normal,
.battery--sleeping .battery-critical-fill {
  opacity: 0.6;
  filter: grayscale(40%);
}

/* === Нормальный уровень === */
.battery-normal {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #67c23a 0%, #95d97b 100%);
  transition: width 0.3s ease, background-color 0.3s ease;
}

/* === Критический уровень === */
.battery-critical-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #f56c6c 0%, #ff9999 100%);
  overflow: hidden;
  transition: width 0.3s ease;
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

/* === Маркеры === */
.battery-mark {
  position: absolute;
  top: -3px;
  bottom: -3px;
  width: 1px;
  background-color: #e6a23c;
  z-index: 10;
  transition: left 0.3s ease;
}

.battery-mark.critical-threshold {
  border-left: 1px dashed #e6a23c;
  background-color: transparent;
}

.battery-mark.current-level {
  border-left: 1px solid #409eff;
  background-color: transparent;
}

/* === Крышка === */
.battery-cap {
  position: absolute;
  top: -1px;
  right: -1px;
  width: 1px;
  height: 4px;
  background: #409eff;
  border-radius: 1px;
}

/* === Контакты === */
.battery-plus,
.battery-minus {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-weight: 600;
  color: #409eff;
  font-size: 11px;
  z-index: 10;
}
.battery-plus { left: -12px; }
.battery-minus { right: -12px; }

/* === Уровни напряжения === */
.battery-levels {
  display: flex;
  justify-content: space-between;
  position: relative;
  margin-top: 4px;
  font-size: 9px;
  color: #909399;
  width: 100%;
}

.battery-level {
  position: absolute;
  font-size: 9px;
  color: #909399;
  transform: translateX(-50%);
  white-space: nowrap;
}

/* === Тревожная пульсация (только если НЕ спит и критический разряд) === */
.battery.battery-critical {
  border-color: #f56c6c;
  animation: battery-pulse 2s infinite;
}

@keyframes battery-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(245, 108, 108, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(245, 108, 108, 0); }
}
</style>
