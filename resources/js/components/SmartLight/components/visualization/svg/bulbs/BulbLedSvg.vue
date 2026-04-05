<template>
  <div class="bulb-led-svg">
    <!-- Базовый компонент с конфигом из store -->
    <BulbBaseSvg
        :status="status"
        :intensity="intensity"
        :width="width"
        :height="height"
        :show-glow="showGlow"
    >
      <template #bulb>
        <div class="bulb-led">
          <!-- Купол -->
          <div class="bulb-dome" :style="{ backgroundColor: domeColor }"></div>
          <!-- LED чипы -->
          <div class="led-chips">
            <div
                v-for="i in chipCount"
                :key="i"
                class="led-chip"
                :style="{ backgroundColor: chipColor }"
            ></div>
          </div>
          <!-- Радиатор -->
          <div class="bulb-heatsink"></div>
          <!-- Цоколь -->
          <div class="bulb-base"></div>
        </div>
      </template>
    </BulbBaseSvg>

    <!-- Специфичные детали типа LED -->
    <div class="bulb-led-details">
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
  width: { type: String, default: '60px' },
  height: { type: String, default: '80px' },
  showGlow: { type: Boolean, default: true }
});

const configStore = useVisualizationConfigStore();
const config = computed(() => configStore.getBulbConfigStore('led'));

const shortName = computed(() => config.value?.shortName || 'LED');
const chipCount = computed(() => config.value?.visualConfig?.material?.chips?.count || 5);

const domeColor = computed(() => {
  if (props.status === 'OFF') return '#f0f0f0';
  return 'rgba(255, 255, 255, 0.6)';
});

const chipColor = computed(() => {
  if (props.status === 'OFF') return '#c0c0c0';
  if (props.status === 'SLEEPING') return '#ff9800';
  return '#ffffff';
});
</script>

<style scoped>
.bulb-led-svg {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.bulb-led {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bulb-dome {
  width: 40px;
  height: 35px;
  border-radius: 50% 50% 0 0;
  border: 1px solid #d0d0d0;
  transition: background-color 0.3s ease;
}

.led-chips {
  position: absolute;
  top: 10px;
  display: flex;
  gap: 4px;
}

.led-chip {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  transition: background-color 0.3s ease;
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

.bulb-led-details {
  font-size: 8px;
  color: #606266;
}

.bulb-type-label {
  font-weight: 600;
}
</style>
