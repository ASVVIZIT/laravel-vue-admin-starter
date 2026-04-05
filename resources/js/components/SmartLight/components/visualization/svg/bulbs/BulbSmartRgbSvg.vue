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
          <!-- RGB Купол -->
          <div class="bulb-rgb-dome" :style="{ backgroundColor: domeColor }"></div>
          <!-- RGB чипы -->
          <div class="rgb-chips">
            <div
                v-for="(color, index) in chipColors"
                :key="index"
                class="rgb-chip"
                :style="{ backgroundColor: color, opacity: chipOpacity }"
            ></div>
          </div>
          <!-- Радиатор -->
          <div class="bulb-heatsink"></div>
          <!-- Цоколь -->
          <div class="bulb-base"></div>
          <!-- Индикатор режима -->
          <div class="smart-indicator" :class="modeIndicatorClass"></div>
        </div>
      </template>
    </BulbBaseSvg>

    <!-- Специфичные детали типа Smart RGB -->
    <div class="bulb-smart-rgb-details">
      <span class="bulb-type-label">{{ shortName }}</span>
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
  rgbColor: { type: String, default: '#ffffff' },
  mode: { type: String, default: 'white', validator: v => ['white', 'rgb', 'scene', 'night'].includes(v) },
  width: { type: String, default: '60px' },
  height: { type: String, default: '80px' },
  showGlow: { type: Boolean, default: true }
});

const configStore = useVisualizationConfigStore();
const config = computed(() => configStore.getBulbConfigStore('smart-rgb'));

const shortName = computed(() => config.value?.shortName || 'RGB');
const chipColors = computed(() => config.value?.visualConfig?.material?.chips?.colors || [
  '#ff0000', '#00ff00', '#0000ff', '#ff00ff', '#ffff00'
]);

const domeColor = computed(() => {
  if (props.status === 'OFF') return '#f0f0f0';
  if (props.status === 'SLEEPING') return 'rgba(255, 180, 100, 0.4)';
  return 'rgba(255, 255, 255, 0.6)';
});

const chipOpacity = computed(() => {
  if (props.status === 'OFF') return 0.2;
  if (props.status === 'SLEEPING') return 0.4;
  return 0.8 + (props.intensity / 100) * 0.2;
});

const modeIndicatorClass = computed(() => ({
  'indicator-white': props.mode === 'white',
  'indicator-rgb': props.mode === 'rgb',
  'indicator-scene': props.mode === 'scene',
  'indicator-night': props.mode === 'night'
}));
</script>

<style scoped>
.bulb-smart-rgb-svg {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.bulb-smart-rgb {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bulb-rgb-dome {
  width: 40px;
  height: 35px;
  border-radius: 50% 50% 0 0;
  border: 1px solid #d0d0d0;
  transition: background-color 0.3s ease;
}

.rgb-chips {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 3px;
}

.rgb-chip {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  transition: opacity 0.3s ease;
}

.bulb-heatsink {
  width: 30px;
  height: 15px;
  background: #cccccc;
  margin-top: -2px;
}

.bulb-base {
  width: 20px;
  height: 20px;
  background: #ffffff;
  border: 1px solid #d0d0d0;
}

.smart-indicator {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1px solid #fff;
  z-index: 20;
}

.indicator-white { background: #ffffff; box-shadow: 0 0 6px #ffffff; }
.indicator-rgb { background: linear-gradient(135deg, #ff4444 0%, #44ff44 50%, #4444ff 100%); }
.indicator-scene { background: linear-gradient(135deg, #ff9800 0%, #e91e63 100%); }
.indicator-night { background: #3f51b5; box-shadow: 0 0 6px #3f51b5; }

.bulb-smart-rgb-details {
  font-size: 8px;
  color: #606266;
}

.bulb-type-label {
  font-weight: 600;
}
</style>
