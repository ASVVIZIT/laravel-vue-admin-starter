<template>
  <div class="bulb-cfl-svg">
    <BulbBaseSvg
        :status="status"
        :intensity="intensity"
        :width="width"
        :height="height"
        :show-glow="showGlow"
    >
      <template #bulb>
        <div class="bulb-cfl">
          <!-- Спиральная колба -->
          <div class="bulb-spiral" :style="{ borderColor: tubeColor }"></div>
          <!-- Цоколь -->
          <div class="bulb-base"></div>
        </div>
      </template>
    </BulbBaseSvg>
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
const config = computed(() => configStore.getBulbConfigStore('cfl'));

const tubeColor = computed(() => {
  if (props.status === 'OFF') return '#b0bec5';
  if (props.status === 'SLEEPING') return '#ffcc80';
  return '#e1f5fe';
});
</script>

<style scoped>
.bulb-cfl-svg { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.bulb-cfl { position: relative; display: flex; flex-direction: column; align-items: center; }
.bulb-spiral {
  width: 30px; height: 30px; border: 3px solid #e1f5fe; border-radius: 50%;
  border-top-color: transparent; border-bottom-color: transparent;
  transform: rotate(-45deg); transition: border-color 0.3s ease;
}
.bulb-base { width: 16px; height: 20px; background: #90a4ae; margin-top: 2px; border-radius: 2px; }
</style>
