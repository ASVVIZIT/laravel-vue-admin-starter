<template>
  <div class="battery-slider-container">
    <div class="battery-display" v-if="showBattery">
      <div class="battery">
        <div
            class="battery-fill"
            :style="{
            width: progress + '%',
            backgroundColor: color
          }"
        ></div>
        <div class="battery-cap"></div>
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
    default: 0
  },
  max: {
    type: Number,
    default: 100
  },
  step: {
    type: Number,
    default: 1
  },
  unit: {
    type: String,
    default: ''
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
    default: 0
  }
});

const emit = defineEmits(['update:modelValue']);

const localValue = ref(Number(props.modelValue));

// Прогресс батареи в процентах
const progress = computed(() => {
  if (!props.showBattery) return 0;
  return Math.min(100, Math.max(0, ((localValue.value - props.min) / (props.max - props.min)) * 100));
});

// Цвет батареи
const color = computed(() => {
  if (!props.showBattery) return '#409eff';
  if (localValue.value < props.min + (props.max - props.min) * 0.3) return '#f56c6c';
  if (localValue.value < props.min + (props.max - props.min) * 0.7) return '#e6a23c';
  return '#67c23a';
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
  gap: 1rem;
}

.battery-display {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 0;
}

.battery {
  position: relative;
  width: 400px;
  height: 40px;
  border: 2px solid #409eff;
  border-radius: 8px;
  background: linear-gradient(90deg, #f0f0f0 0%, #f9f9f9 100%);
  overflow: hidden;
}

.battery-fill {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
}

.battery-cap {
  position: absolute;
  top: 20px;
  right: -8px;
  width: 8px;
  height: 20px;
  background: #409eff;
  border-radius: 0 4px 4px 0;
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
  margin: 8px 0;
  height: 4px;
}

:deep(.el-slider__button) {
  width: 16px;
  height: 16px;
}
</style>
