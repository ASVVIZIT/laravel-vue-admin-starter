<template>
  <div class="bulb-smart-rgb-svg">
    <!-- Базовый компонент с конфигом из store -->
    <BulbBaseSvg
        :status="status"
        :intensity="intensity"
        :width="width"
        :height="height"
        :show-glow="showGlow"
    >
      <template #bulb>
        <div class="bulb-smart-rgb">
          <!-- Купол с RGB-подсветкой -->
          <div
              class="bulb-dome"
              :style="{
              backgroundColor: domeColor,
              boxShadow: rgbGlow
            }"
          ></div>
          <!-- RGB чипы -->
          <div class="bulb-chips">
            <div
                v-for="(color, i) in chipColors"
                :key="i"
                class="bulb-chip"
                :style="{
                backgroundColor: color,
                opacity: chipOpacity,
                transform: `rotate(${(i - 1) * chipAngle}deg) translateY(-8px)`
              }"
            ></div>
          </div>
          <!-- Радиатор -->
          <div class="bulb-heatsink"></div>
          <!-- Цоколь -->
          <div class="bulb-base"></div>
        </div>
      </template>
    </BulbBaseSvg>

    <!-- Специфичные детали типа Smart RGB -->
    <div class="bulb-smart-rgb-details">
      <span class="bulb-type-label">{{ shortName }}</span>
      <span class="bulb-rgb-indicator" :style="{ backgroundColor: activeRgbColor }"></span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import BulbBaseSvg from './BulbBaseSvg.vue';
import { useVisualizationConfigStore } from '@/components/SmartLight/stores/smartlight/visualizationConfigStore.js';

const props = defineProps({
  status: { type: String, default: 'OFF' },
  intensity: { type: Number, default: 0 },
  width: { type: String, default: '60px' },
  height: { type: String, default: '80px' },
  showGlow: { type: Boolean, default: true }
});

const configStore = useVisualizationConfigStore();
// ✅ Динамический поиск конфига по фиксированному ID типа
const config = computed(() => configStore.getBulbConfigStore('smart-rgb'));

const shortName = computed(() => config.value?.shortName ?? 'RGB');

// ✅ Цвет купола с учётом статуса
const domeColor = computed(() => {
  if (props.status === 'OFF') return '#e0e0e0';
  if (props.status === 'SLEEPING') return '#fff7e6';
  return 'rgba(255, 255, 255, 0.6)';
});

// ✅ RGB свечение (анимированное при ON)
const rgbGlow = computed(() => {
  if (props.status !== 'ON') return 'none';
  return `0 0 20px rgba(255, 100, 100, 0.5), 0 0 40px rgba(100, 255, 100, 0.3), 0 0 60px rgba(100, 100, 255, 0.2)`;
});

// ✅ Параметры RGB чипов из конфига
const chipColors = computed(() => {
  const colors = config.value?.visualConfig?.material?.chips?.colors ?? [0xff0000, 0x00ff00, 0x0000ff];
  return colors.map(c => {
    if (typeof c === 'number') return '#' + c.toString(16).padStart(6, '0');
    return c;
  });
});
const chipCount = computed(() => chipColors.value.length);
const chipAngle = computed(() => 360 / chipCount.value);

const chipOpacity = computed(() => {
  if (props.status !== 'ON') return 0.3;
  return 0.5 + (props.intensity / 100) * 0.5;
});

// ✅ Активный RGB цвет для индикатора (циклически меняется при ON)
const activeRgbColor = computed(() => {
  if (props.status !== 'ON') return '#909399';
  const index = Math.floor(Date.now() / 500) % chipColors.value.length;
  return chipColors.value[index];
});
</script>

<style scoped>
.bulb-smart-rgb-svg {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.bulb-smart-rgb {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bulb-dome {
  width: 40px;
  height: 30px;
  border-radius: 50% 50% 0 0;
  border: 1px solid #d0d0d0;
  border-bottom: none;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.bulb-chips {
  position: absolute;
  top: 15px;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.bulb-chip {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 2px;
  transition: background-color 0.3s ease, opacity 0.3s ease, transform 0.3s ease;
}

.bulb-heatsink {
  width: 30px;
  height: 15px;
  background: linear-gradient(to bottom, #cccccc, #999999);
  border-radius: 0 0 2px 2px;
  margin-top: -1px;
}

.bulb-base {
  width: 20px;
  height: 20px;
  background: #666666;
  border-radius: 0 0 2px 2px;
  margin-top: -1px;
}

.bulb-smart-rgb-details {
  display: flex;
  gap: 6px;
  font-size: 8px;
  color: #606266;
  align-items: center;
}

.bulb-type-label {
  font-weight: 600;
}

.bulb-rgb-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1px solid #dcdfe6;
  transition: background-color 0.3s ease;
}
</style>
