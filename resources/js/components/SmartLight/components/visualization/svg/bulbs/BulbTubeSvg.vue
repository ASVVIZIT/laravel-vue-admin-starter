<template>
  <div class="bulb-tube-svg">
    <!-- Базовый компонент с конфигом из store -->
    <BulbBaseSvg
        :status="status"
        :intensity="intensity"
        :width="width"
        :height="height"
        :show-glow="showGlow"
    >
      <template #bulb>
        <div class="bulb-tube">
          <!-- Левый цоколь -->
          <div class="tube-cap cap-left"></div>
          <!-- Тело трубки -->
          <div class="tube-body" :style="{ backgroundColor: tubeColor }"></div>
          <!-- Правый цоколь -->
          <div class="tube-cap cap-right"></div>
        </div>
      </template>
    </BulbBaseSvg>

    <!-- Специфичные детали типа Tube -->
    <div class="bulb-tube-details">
      <span class="bulb-type-label">{{ shortName }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import BulbBaseSvg from './BulbBaseSvg.vue';
import { useVisualizationConfigStore } from '@/components/SmartLight/stores/smartlight/visualizationConfigStore.js';

const props = defineProps({
  /** Статус лампы (ON, OFF, SLEEPING, ERROR) */
  status: { type: String, default: 'OFF' },
  /** Интенсивность (0-100) */
  intensity: { type: Number, default: 0 },
  /** Ширина компонента */
  width: { type: String, default: '60px' },
  /** Высота компонента */
  height: { type: String, default: '80px' },
  /** Показывать свечение */
  showGlow: { type: Boolean, default: true }
});

const configStore = useVisualizationConfigStore();
// ✅ Динамический поиск конфига по фиксированному ID типа
const config = computed(() => configStore.getBulbConfigStore('tube'));

const shortName = computed(() => config.value?.shortName ?? 'Tube');

// ✅ Цвет трубки с учётом статуса и интенсивности
const tubeColor = computed(() => {
  if (props.status === 'OFF') return '#e0e0e0';
  if (props.status === 'SLEEPING') return '#fff3e0';
  // При ON: прозрачность зависит от интенсивности
  const alpha = 0.5 + (props.intensity / 100) * 0.4;
  return `rgba(225, 245, 254, ${alpha})`;
});
</script>

<style scoped>
.bulb-tube-svg {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.bulb-tube {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 0 8px;
}

/* Тело трубки */
.tube-body {
  flex: 1;
  height: 10px;
  background: #e0e0e0;
  border-radius: 5px;
  border: 1px solid #bdbdbd;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

/* Цоколи */
.tube-cap {
  width: 12px;
  height: 14px;
  background: #757575;
  border-radius: 2px;
  flex-shrink: 0;
  transition: background-color 0.3s ease;
}

/* Статусные стили (пробрасываются через :deep() от BulbBaseSvg) */
.bulb-tube-svg :deep(.bulb-status-on) .tube-body {
  background: #e1f5fe;
  box-shadow: 0 0 12px rgba(129, 212, 250, 0.6);
}

.bulb-tube-svg :deep(.bulb-status-sleeping) .tube-body {
  background: #fff3e0;
  box-shadow: 0 0 8px rgba(255, 183, 77, 0.4);
}

.bulb-tube-svg :deep(.bulb-status-off) .tube-body {
  background: #e0e0e0;
  box-shadow: none;
}

.bulb-tube-svg :deep(.bulb-status-error) .tube-body {
  background: #ffebee;
  border-color: #f44336;
  box-shadow: 0 0 8px rgba(244, 67, 54, 0.3);
}

/* Подпись типа */
.bulb-tube-details {
  display: flex;
  justify-content: center;
  font-size: 8px;
  color: #606266;
  margin-top: 2px;
}

.bulb-type-label {
  font-weight: 600;
  white-space: nowrap;
}
</style>
