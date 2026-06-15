<template>
  <BaseCard hoverable padding="32px 16px" class="countdown-unit">
    <div class="countdown-value">{{ displayValue }}</div>
    <div class="countdown-label">{{ label }}</div>
    <ProgressBar :value="percent" :show-label="false" :height="4" />
  </BaseCard>
</template>

<script setup>
import { computed } from 'vue'
import BaseCard from '../ui/BaseCard.vue'
import ProgressBar from '../ui/ProgressBar.vue'

const props = defineProps({
  value: { type: Number, default: 0 },
  label: { type: String, required: true },
  max: { type: Number, default: 100 },
  padStart: { type: Number, default: 2 }
})

const displayValue = computed(() => String(props.value).padStart(props.padStart, '0'))
const percent = computed(() => Math.min(100, (props.value / props.max) * 100))
</script>

<style scoped>
.countdown-unit {
  text-align: center;
  position: relative;
  overflow: hidden;
}

.countdown-unit::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #ff6b35, #f7931e);
}

.countdown-value {
  font-size: clamp(48px, 6vw, 72px);
  font-weight: 900;
  background: linear-gradient(135deg, #ff6b35, #f7931e);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
  margin-bottom: 8px;
  font-variant-numeric: tabular-nums;
}

.countdown-label {
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 16px;
}
</style>
