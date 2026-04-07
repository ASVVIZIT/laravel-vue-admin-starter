<template>
  <div class="bulb-classic-svg">
    <!-- Базовый компонент с конфигом из store -->
    <BulbBaseSvg
        :status="status"
        :intensity="intensity"
        :width="width"
        :height="height"
        :show-glow="showGlow"
    >
      <template #bulb>
        <div class="bulb-classic">
          <!-- Колба -->
          <div class="bulb-glass" :style="{ backgroundColor: glassColor }"></div>
          <!-- Нить накала -->
          <div class="bulb-filament" :style="{ borderColor: filamentColor, opacity: filamentOpacity }"></div>
          <!-- Цоколь -->
          <div class="bulb-base"></div>
        </div>
      </template>
    </BulbBaseSvg>

    <!-- Специфичные детали типа Classic -->
    <div class="bulb-classic-details">
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
const config = computed(() => configStore.getBulbConfigStore('classic'));

const shortName = computed(() => config.value?.shortName ?? 'Classic');

// ✅ Цвет стекла с учётом статуса
const glassColor = computed(() => {
  if (props.status === 'OFF') return '#e0e0e0';
  if (props.status === 'SLEEPING') return '#fff7e6';
  return 'rgba(255, 255, 255, 0.4)';
});

// ✅ Цвет и прозрачность нити накала
const filamentColor = computed(() => {
  if (props.status === 'OFF') return '#909399';
  if (props.status === 'SLEEPING') return '#e6a23c';
  return '#ffff00';
});

const filamentOpacity = computed(() => {
  if (props.status !== 'ON') return 0.3;
  return 0.6 + (props.intensity / 100) * 0.4;
});
</script>

<style scoped>
.bulb-classic-svg {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.bulb-classic {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bulb-glass {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid #d0d0d0;
  transition: background-color 0.3s ease;
}

.bulb-filament {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 15px;
  border: 2px solid;
  border-radius: 50%;
  transition: border-color 0.3s ease, opacity 0.3s ease;
}

.bulb-base {
  width: 20px;
  height: 25px;
  background: #888888;
  margin-top: -2px;
  border-radius: 2px;
}

.bulb-classic-details {
  font-size: 8px;
  color: #606266;
}

.bulb-type-label {
  font-weight: 600;
}
</style>
