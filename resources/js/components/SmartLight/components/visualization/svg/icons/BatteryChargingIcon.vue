<template>
  <div class="battery-charging-icon">
    <BatteryFullIcon
        :voltage="displayVoltage"
        :critical-voltage="criticalVoltage"
        :min-voltage="minVoltage"
        :max-voltage="maxVoltage"
        :size="size"
        :icon-size="iconSize"
        :show-label="showLabel"
        :show-status-badge="showStatusBadge"
        :rotation="rotation"
        status="charging"
    />
  </div>
</template>

<script setup>
/**
 * Иконка зарядки батареи.
 * Вычисляет отображаемое напряжение на основе прогресса зарядки.
 */
import { computed } from 'vue';
import BatteryFullIcon from './BatteryFullIcon.vue';

const props = defineProps({
  /** Базовое напряжение (используется для расчёта, если не задан прогресс) */
  voltage: { type: Number, default: 4.0 },
  /** Критическое напряжение */
  criticalVoltage: { type: Number, default: 3.2 },
  /** Мин. напряжение типа батареи */
  minVoltage: { type: Number, default: 2.5 },
  /** Макс. напряжение типа батареи */
  maxVoltage: { type: Number, default: 4.2 },
  /** Размер контейнера иконки */
  size: { type: String, default: '32px' },
  /** Размер SVG внутри */
  iconSize: { type: Number, default: 24 },
  /** Показывать лейбл с напряжением */
  showLabel: { type: Boolean, default: true },
  /** Показывать статусный бейдж */
  showStatusBadge: { type: Boolean, default: true },
  /** Прогресс зарядки (0-100%) */
  chargingProgress: { type: Number, default: 50 },
  /** Вращение иконки (градусы) */
  rotation: { type: Number, default: 0 }
});

/**
 * Вычисляет напряжение на основе прогресса зарядки.
 * Линейная интерполяция от minVoltage до maxVoltage.
 */
const displayVoltage = computed(() => {
  const progress = Math.max(0, Math.min(100, props.chargingProgress));
  return props.minVoltage + (progress / 100) * (props.maxVoltage - props.minVoltage);
});
</script>

<style scoped>
.battery-charging-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* Иконка молнии поверх батареи */
:deep(.battery-charging-badge) {
  background: rgba(103, 194, 58, 0.15);
  border-radius: 50%;
  padding: 4px;
  backdrop-filter: blur(2px);
  box-shadow: 0 0 8px rgba(103, 194, 58, 0.4);
}

:deep(.battery-fill-overlay) {
  background: linear-gradient(90deg, #67c23a 0%, #4caf50 100%) !important;
  opacity: 0.7 !important;
}

:deep(.battery-label) {
  color: #4caf50 !important;
  font-weight: 700;
}
</style>
