<template>
  <div class="battery-critical-icon">
    <BatteryFullIcon
        :voltage="voltage"
        :critical-voltage="criticalVoltage"
        :min-voltage="minVoltage"
        :max-voltage="maxVoltage"
        :size="size"
        :icon-size="iconSize"
        :show-label="showLabel"
        :show-status-badge="showStatusBadge"
        :rotation="rotation"
        status="critical"
    />
  </div>
</template>

<script setup>
/**
 * Иконка критического заряда батареи.
 * Явно задаёт статус "critical" и пробрасывает все параметры в базовый компонент.
 */
import BatteryFullIcon from './BatteryFullIcon.vue';

const props = defineProps({
  /** Текущее напряжение (по умолчанию 2.6В — зона critical) */
  voltage: {type: Number, default: 2.6},
  /** Критическое напряжение */
  criticalVoltage: {type: Number, default: 3.2},
  /** Мин. напряжение типа батареи */
  minVoltage: {type: Number, default: 2.5},
  /** Макс. напряжение типа батареи */
  maxVoltage: {type: Number, default: 4.2},
  /** Размер контейнера иконки */
  size: {type: String, default: '32px'},
  /** Размер SVG внутри */
  iconSize: {type: Number, default: 24},
  /** Показывать лейбл с напряжением */
  showLabel: {type: Boolean, default: true},
  /** Показывать статусный бейдж */
  showStatusBadge: {type: Boolean, default: true},
  /** Вращение иконки (градусы) */
  rotation: {type: Number, default: 0}
});
</script>

<style scoped>
.battery-critical-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* Агрессивная пульсация для critical */
:deep(.battery-status-badge) {
  background-color: #f56c6c !important;
  border-color: #fff;
  box-shadow: 0 0 8px rgba(245, 108, 108, 0.8);
  animation: critical-pulse 0.8s infinite ease-in-out;
}

:deep(.battery-fill-overlay) {
  background: linear-gradient(90deg, #f56c6c 0%, #ff4d4d 100%) !important;
}

@keyframes critical-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
}
</style>
