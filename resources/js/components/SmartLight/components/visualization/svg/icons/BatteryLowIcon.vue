<template>
  <div class="battery-low-icon">
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
        status="low"
    />
  </div>
</template>

<script setup>
/**
 * Иконка низкого заряда батареи.
 * Явно задаёт статус "low" и пробрасывает все параметры в базовый компонент.
 */
import BatteryFullIcon from './BatteryFullIcon.vue';

const props = defineProps({
  /** Текущее напряжение (по умолчанию 3.0В — зона low) */
  voltage: { type: Number, default: 3.0 },
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
  /** Вращение иконки (градусы) */
  rotation: { type: Number, default: 0 }
});
</script>

<style scoped>
.battery-low-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* Усиленная пульсация для low-статуса */
:deep(.battery-status-badge) {
  background-color: #e6a23c !important;
  border-color: #fff;
  box-shadow: 0 0 6px rgba(230, 162, 60, 0.6);
}

:deep(.battery-fill-overlay) {
  background: linear-gradient(90deg, #e6a23c 0%, #f56c6c 100%) !important;
}
</style>
