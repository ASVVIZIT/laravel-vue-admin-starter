<template>
  <div class="bulb-ledstrip-svg">
    <BulbBaseSvg
        :status="status"
        :intensity="intensity"
        :width="width"
        :height="height"
        :show-glow="showGlow"
    >
      <template #bulb>
        <div class="bulb-ledstrip">
          <!-- Лента с чипами -->
          <div class="strip-track" :style="{ backgroundColor: trackColor }">
            <div class="strip-chip" :style="{ backgroundColor: chipColor }" v-for="i in 5" :key="i"></div>
          </div>
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
const config = computed(() => configStore.getBulbConfigStore('led-strip'));

const trackColor = computed(() => props.status === 'OFF' ? '#eceff1' : '#f5f7fa');
const chipColor = computed(() => {
  if (props.status === 'OFF') return '#b0bec5';
  return '#ffeb3b';
});
</script>

<style scoped>
.bulb-ledstrip-svg { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.bulb-ledstrip { display: flex; align-items: center; justify-content: center; width: 100%; }
.strip-track {
  display: flex; gap: 4px; padding: 2px 4px; background: #f5f7fa;
  border-radius: 4px; border: 1px solid #d0d0d0;
}
.strip-chip { width: 8px; height: 4px; background: #ffeb3b; border-radius: 1px; transition: background-color 0.3s ease; }
</style>
