<template>
  <div class="battery-slider-container">
    <div class="battery-display" v-if="showBattery">
      <div class="battery">
        <div
            class="battery-normal"
            :style="{ width: normalProgress + '%' }"
        ></div>
        <div
            class="battery-critical"
            :style="{ width: criticalProgress + '%', backgroundColor: criticalColor }"
        >
          <div class="battery-critical-pattern"></div>
        </div>
        <div class="battery-mark critical-threshold" :style="{ left: criticalThresholdPosition + '%' }"></div>
        <div class="battery-cap"></div>
      </div>
      <div class="battery-levels">
        <span class="battery-level" :style="{ left: '0%' }">2.5 В</span>
        <span class="battery-level" :style="{ left: criticalThresholdPosition + '%' }">{{ criticalThreshold }} В</span>
        <span class="battery-level" :style="{ left: '100%' }">4.3 В</span>
      </div>
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
  }
});

const emit = defineEmits(['update:modelValue']);

const localValue = ref(Number(props.modelValue));

// Вычисляем позицию критического порога в процентах
const criticalThresholdPosition = computed(() => {
  return ((props.criticalThreshold - props.min) / (props.max - props.min)) * 100;
});

// Нормальный прогресс (от критического порога до max)
const normalProgress = computed(() => {
  if (localValue.value <= props.criticalThreshold) {
    return 0;
  }

  const normalVoltage = localValue.value - props.criticalThreshold;
  const maxNormalVoltage = props.max - props.criticalThreshold;

  return Math.min(100, Math.max(0, (normalVoltage / maxNormalVoltage) * 100));
});

// Критический прогресс (от min до критического порога)
const criticalProgress = computed(() => {
  if (localValue.value >= props.criticalThreshold) {
    return 0;
  }

  const criticalVoltage = props.criticalThreshold - localValue.value;
  const criticalVoltageRange = props.criticalThreshold - props.min;

  return Math.min(100, Math.max(0, (criticalVoltage / criticalVoltageRange) * 100));
});

// Цвет критического уровня
const criticalColor = computed(() => {
  const voltage = localValue.value;
  if (voltage < 2.7) return '#f56c6c';
  if (voltage < 3.0) return '#faa7a7';
  return '#ffcccb';
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
  gap: 0.5rem;
}

.battery-display {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.battery {
  position: relative;
  width: 100%;
  height: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background: #f5f7fa;
  overflow: hidden;
}

.battery-normal {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #67c23a 0%, #95d97b 100%);
}

.battery-critical {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #f56c6c 0%, #ff9999 100%);
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
  top: -5px;
  bottom: -5px;
  width: 1px;
  background-color: #e6a23c;
  z-index: 10;
}

.battery-levels {
  display: flex;
  justify-content: space-between;
  position: relative;
  margin-top: 2px;
}

.battery-level {
  position: absolute;
  font-size: 0.75rem;
  color: #909399;
}

.battery-cap {
  position: absolute;
  top: 4px;
  right: -4px;
  width: 4px;
  height: 12px;
  background: #409eff;
  border-radius: 2px;
}

.slider-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.custom-slider {
  width: 100%;
}

.input-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.input-container.with-unit {
  gap: 0.25rem;
}

.custom-input {
  width: 100%;
}

.unit-label {
  color: #909399;
  font-size: 0.9rem;
  min-width: 24px;
  text-align: center;
}

:deep(.el-input-number__decrease),
:deep(.el-input-number__increase) {
  width: 24px;
}

:deep(.el-slider__runway) {
  height: 4px;
  margin: 0;
}

:deep(.el-slider__button) {
  width: 14px;
  height: 14px;
}
</style>
