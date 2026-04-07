<template>
  <div class="bulb-halogen-svg">
    <!-- Базовый компонент с конфигом из store -->
    <BulbBaseSvg
        :status="status"
        :intensity="intensity"
        :width="width"
        :height="height"
        :show-glow="showGlow"
    >
      <template #bulb>
        <div class="bulb-halogen">
          <!-- Капсула -->
          <div class="bulb-capsule" :style="{ backgroundColor: capsuleColor }"></div>
          <!-- Нить накала (галогенная) -->
          <div class="bulb-filament" :style="{ borderColor: filamentColor, opacity: filamentOpacity }"></div>
          <!-- Цоколь -->
          <div class="bulb-base"></div>
        </div>
      </template>
    </BulbBaseSvg>

    <!-- Специфичные детали типа Галогенная -->
    <div class="bulb-halogen-details">
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
const config = computed(() => configStore.getBulbConfigStore('halogen'));

const shortName = computed(() => config.value?.shortName ?? 'Halogen');

// ✅ Цвет капсулы с учётом статуса
const capsuleColor = computed(() => {
  if (props.status === 'OFF') return '#f5f5f5';
  if (props.status === 'SLEEPING') return '#fff3e0';
  return 'rgba(255, 235, 200, 0.5)';
});

// ✅ Цвет и прозрачность галогенной нити
const filamentColor = computed(() => {
  if (props.status === 'OFF') return '#b0bec5';
  if (props.status === 'SLEEPING') return '#ffb74d';
  return '#ff9800'; // Тёплый оранжевый для галогена
});

const filamentOpacity = computed(() => {
  if (props.status !== 'ON') return 0.3;
  return 0.7 + (props.intensity / 100) * 0.3;
});
</script>

<style scoped>
.bulb-halogen-svg {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.bulb-halogen {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bulb-capsule {
  width: 30px;
  height: 45px;
  border-radius: 15px;
  border: 1px solid #d0d0d0;
  transition: background-color 0.3s ease;
}

.bulb-filament {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 12px;
  border: 2px solid;
  border-radius: 4px;
  transition: border-color 0.3s ease, opacity 0.3s ease;
}

.bulb-base {
  width: 24px;
  height: 20px;
  background: #757575;
  margin-top: -2px;
  border-radius: 2px;
}

.bulb-halogen-details {
  font-size: 8px;
  color: #606266;
}

.bulb-type-label {
  font-weight: 600;
}
</style>
