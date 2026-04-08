<template>
  <!--
    ✅ Компонент для батареек размера AAA
    Номинал: 1.5В (Алкалиновые/Солевые)
  -->
  <BatteryBaseSvg
      :voltage="voltage"
      :critical-voltage="criticalVoltage"
      :status="status"
      :min-voltage="minVoltage"
      :max-voltage="maxVoltage"
      :colors="colors"
      :height="height"
      :show-levels="showLevels"
      :show-markers="showMarkers"
      :scale="scale"
      :cap-color="capColor"
  />
</template>

<script setup>
import BatteryBaseSvg from './BatteryBaseSvg.vue'

/**
 * Пропсы настроены под характеристики стандартной батарейки AAA
 * Номинальное напряжение: 1.5В
 */
const props = defineProps({
  /** Текущее напряжение (по умолчанию 1.5В) */
  voltage: { type: Number, default: 1.5 },
  /** Критическое напряжение (отсечка) */
  criticalVoltage: { type: Number, default: 1.0 },
  /** Статус устройства */
  status: { type: String, default: 'ON' },
  /** Минимальное напряжение */
  minVoltage: { type: Number, default: 0.9 },
  /** Максимальное напряжение (новая батарейка) */
  maxVoltage: { type: Number, default: 1.6 },
  /** Цвета статусов */
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
  /** Цвет крышки (стандартный серебристый) */
  capColor: { type: String, default: '#c0c4cc' }
})
</script>

<style scoped>
/* Стили управляются базовым компонентом */
</style>
