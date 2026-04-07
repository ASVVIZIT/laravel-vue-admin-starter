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
          <div class="bulb-chips">
            <div
                v-for="i in chipCount"
                :key="i"
                class="bulb-chip"
                :style="{
                backgroundColor: chipColor,
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
// ✅ Динамический поиск конфига по фиксированному ID типа
const config = computed(() => configStore.getBulbConfigStore('led'));

const shortName = computed(() => config.value?.shortName ?? 'LED');

// ✅ Цвет купола с учётом статуса
const domeColor = computed(() => {
  if (props.status === 'OFF') return '#e0e0e0';
  if (props.status === 'SLEEPING') return '#fff7e6';
  return 'rgba(255, 255, 255, 0.6)';
});

// ✅ Параметры LED чипов из конфига
const chipCount = computed(() => config.value?.visualConfig?.material?.chips?.count ?? 5);
const chipAngle = computed(() => 360 / chipCount.value);

const chipColor = computed(() => {
  if (props.status === 'OFF') return '#909399';
  if (props.status === 'SLEEPING') return '#e6a23c';
  return '#ffffff';
});

const chipOpacity = computed(() => {
  if (props.status !== 'ON') return 0.3;
  return 0.5 + (props.intensity / 100) * 0.5;
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
  height: 30px;
  border-radius: 50% 50% 0 0;
  border: 1px solid #d0d0d0;
  border-bottom: none;
  transition: background-color 0.3s ease;
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

.bulb-led-details {
  font-size: 8px;
  color: #606266;
}

.bulb-type-label {
  font-weight: 600;
}
</style>
