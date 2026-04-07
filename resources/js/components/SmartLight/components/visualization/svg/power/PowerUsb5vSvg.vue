<template>
  <div class="power-usb5v-svg">
    <PowerBaseSvg
        :status="status"
        :voltage="voltage"
        :label="label"
        :width="width"
        :height="height"
        :show-glow="showGlow"
    >
      <template #power>
        <div class="power-usb5v">
          <!-- Иконка USB Type-A -->
          <div class="power-usb5v-icon" :style="{ backgroundColor: iconColor }">
            <svg viewBox="0 0 24 16" width="18" height="12" fill="currentColor">
              <path d="M2 4h20v8H2z M5 6h3v4H5z M10 6h3v4h-3z M15 6h3v4h-3z"/>
            </svg>
          </div>
          <!-- Индикатор активности -->
          <div v-if="isActive" class="power-usb5v-led"></div>
          <div class="power-usb5v-label">{{ label }}</div>
        </div>
      </template>
    </PowerBaseSvg>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import PowerBaseSvg from './PowerBaseSvg.vue';
import { useVisualizationConfigStore } from '@/components/SmartLight/stores/smartlight/visualizationConfigStore.js';

const props = defineProps({
  status: { type: String, default: 'OFF' },
  voltage: { type: Number, default: 5 },
  width: { type: String, default: '60px' },
  height: { type: String, default: '80px' },
  showGlow: { type: Boolean, default: true }
});

const configStore = useVisualizationConfigStore();
const config = computed(() => configStore.getPowerSupplyConfigStore('usb-5v'));

const label = computed(() => config.value?.shortName ?? 'USB 5V');
const isActive = computed(() => props.status === 'ON' || props.status === 'ACTIVE');

const iconColor = computed(() => {
  if (props.status === 'ERROR') return '#fef0f0';
  if (isActive.value) return '#e3f2fd';
  return '#f5f7fa';
});
</script>

<style scoped>
.power-usb5v-svg {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.power-usb5v {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.power-usb5v-icon {
  width: 36px;
  height: 28px;
  border-radius: 4px;
  border: 1px solid #d0d0d0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1976d2;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.power-usb5v-icon:hover { color: #409eff; }

.power-usb5v-led {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4caf50;
  margin-top: 2px;
  box-shadow: 0 0 6px #4caf50;
  animation: usb-blink 2s infinite;
}

.power-usb5v-label {
  font-size: 8px;
  color: #606266;
  margin-top: 2px;
}

@keyframes usb-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
