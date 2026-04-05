<template>
  <div class="battery-slider-container">
    <div class="battery-display" v-if="showBattery">
      <div class="battery-18650" :class="`battery-type-${batteryType}`">
        <div class="battery-cylinder">
          <div
              class="battery-fill"
              :style="{
              width: batteryProgress + '%',
              backgroundColor: batteryColor
            }"
          ></div>
          <div class="battery-cap" :style="{ backgroundColor: capColor }"></div>
        </div>
        <div class="battery-levels">
          <span class="battery-level" :style="{ left: '0%' }">2.5 В</span>
          <span class="battery-level" :style="{ left: criticalThresholdPosition + '%' }">{{ criticalThreshold }} В</span>
          <span class="battery-level" :style="{ left: '100%' }">4.3 В</span>
        </div>
      </div>
      <span class="battery-value">{{ formattedValue }}</span>
    </div>

    <div class="slider-container">
      <el-slider
          v-model="localValue"
          :min="min"
          :max="max"
          :step="step"
          :format-tooltip="formatTooltip"
          class="custom-slider"
          @change="handleChange"
      />

      <div class="input-container" :class="{ 'with-unit': unit }">
        <el-input-number
            v-model="localValue"
            :min="min"
            :max="max"
            :step="step"
            :precision="precision"
            :controls="showControls"
            class="custom-input"
            @change="handleChange"
        />
        <span v-if="unit" class="unit-label">{{ unit }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: [Number, String],
    required: true
  },
  min: {
    type: Number,
    default: 2.5
  },
  max: {
    type: Number,
    default: 4.3
  },
  step: {
    type: Number,
    default: 0.01
  },
  unit: {
    type: String,
    default: 'В'
  },
  showControls: {
    type: Boolean,
    default: true
  },
  showBattery: {
    type: Boolean,
    default: true
  },
  precision: {
    type: Number,
    default: 2
  },
  criticalThreshold: {
    type: Number,
    required: true
  },
  batteryType: {
    type: String,
    default: 'li-ion', // li-ion, li-poly, ni-mh
    validator: value => ['li-ion', 'li-poly', 'ni-mh'].includes(value)
  }
});

const emit = defineEmits(['update:modelValue']);

const localValue = ref(Number(props.modelValue));

// Вычисляем позицию критического порога в процентах
const criticalThresholdPosition = computed(() => {
  return ((props.criticalThreshold - props.min) / (props.max - props.min)) * 100;
});

// Прогресс батареи
const batteryProgress = computed(() => {
  const voltage = localValue.value;
  return Math.min(100, Math.max(0, ((voltage - props.min) / (props.max - props.min)) * 100));
});

// Цвет батареи в зависимости от напряжения
const batteryColor = computed(() => {
  const voltage = localValue.value;
  if (voltage < 2.8) return '#f56c6c'; // Критический уровень - красный
  if (voltage < 3.0) return '#faa7a7'; // Низкий уровень - светло-красный
  if (voltage < 3.4) return '#e6a23c'; // Средний уровень - оранжевый
  if (voltage < 3.8) return '#67c23a'; // Хороший уровень - зеленый
  return '#50d776'; // Полный уровень - ярко-зеленый
});

// Цвет контактного вывода
const capColor = computed(() => {
  const voltage = localValue.value;
  if (voltage < 2.8) return '#d32f2f'; // Критический уровень
  if (voltage < 3.0) return '#f56c6c'; // Низкий уровень
  return '#409eff'; // Нормальный/хороший уровень
});

// Форматированное значение
const formattedValue = computed(() => {
  return localValue.value.toFixed(props.precision) + (props.unit ? ` ${props.unit}` : '');
});

// Форматирование подсказки для слайдера
const formatTooltip = (value) => {
  return value.toFixed(props.precision) + (props.unit ? ` ${props.unit}` : '');
};

// Обработчик изменения
const handleChange = () => {
  emit('update:modelValue', localValue.value);
};

// Следим за внешними изменениями
watch(() => props.modelValue, (newVal) => {
  const numValue = Number(newVal);
  if (!isNaN(numValue) && numValue !== localValue.value) {
    localValue.value = numValue;
  }
});
</script>

<style scoped>
.battery-slider-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.battery-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
}

.battery-18650 {
  position: relative;
  width: 120px;
  height: 30px;
  display: flex;
  align-items: center;
}

.battery-type-li-ion {
  --battery-base-color: #f0f0f0;
  --battery-border-color: #e0e0e0;
  --battery-cap-color: #409eff;
}

.battery-type-li-poly {
  --battery-base-color: #f0f5ff;
  --battery-border-color: #d6e4ff;
  --battery-cap-color: #409eff;
}

.battery-type-ni-mh {
  --battery-base-color: #fff8e1;
  --battery-border-color: #ffecb3;
  --battery-cap-color: #ff9800;
}

.battery-cylinder {
  position: relative;
  width: 100%;
  height: 16px;
  border-radius: 8px;
  background: var(--battery-base-color, #f0f0f0);
  border: 1px solid var(--battery-border-color, #e0e0e0);
  overflow: hidden;
}

.battery-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: 8px 0 0 8px;
  transition: width 0.3s ease;
}

.battery-cap {
  position: absolute;
  top: 0;
  right: 0;
  width: 12px;
  height: 100%;
  border-radius: 0 8px 8px 0;
  background: var(--battery-cap-color, #409eff);
  transition: background-color 0.3s ease;
}

.battery-levels {
  position: absolute;
  width: 100%;
  display: flex;
  justify-content: space-between;
  position: relative;
  margin-top: 8px;
  font-size: 0.7rem;
  color: #909399;
}

.battery-level {
  position: absolute;
  font-size: 0.7rem;
  color: #909399;
}

.battery-value {
  font-weight: bold;
  color: #409eff;
  font-size: 1.1rem;
  min-width: 80px;
  text-align: center;
}

.slider-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.custom-slider {
  width: 100%;
}

.input-container {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.input-container.with-unit {
  gap: 0.1rem;
}

.custom-input {
  width: 100%;
}

.unit-label {
  color: #909399;
  font-size: 0.85rem;
  min-width: 20px;
  text-align: center;
}

/* Стили для цилиндрической батареи 18650 */
:deep(.battery-cylinder) {
  position: relative;
  width: 100%;
  height: 16px;
  border-radius: 8px;
  background: #f0f0f0;
  border: 1px solid #e0e0e0;
  overflow: hidden;
}

:deep(.battery-fill) {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: 8px 0 0 8px;
  transition: width 0.3s ease;
}

:deep(.battery-cap) {
  position: absolute;
  top: 0;
  right: 0;
  width: 12px;
  height: 100%;
  border-radius: 0 8px 8px 0;
  background: #409eff;
  transition: background-color 0.3s ease;
}
</style>
