<template>
  <div class="progress-bar-wrapper">
    <div v-if="showLabel" class="progress-header">
      <span class="progress-label">{{ label }}</span>
      <span class="progress-value" :style="{ color: color }">{{ value }}%</span>
    </div>
    <div class="progress-track" :style="{ height: height + 'px', borderRadius: height / 2 + 'px' }">
      <div
          class="progress-fill"
          :style="{
          width: value + '%',
          background: gradient || color,
          borderRadius: height / 2 + 'px'
        }"
      >
        <div v-if="animated" class="progress-shine"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  value: { type: Number, default: 0 },
  label: String,
  showLabel: { type: Boolean, default: true },
  height: { type: Number, default: 8 },
  color: { type: String, default: '#ff6b35' },
  gradient: String,
  animated: { type: Boolean, default: true }
})
</script>

<style scoped>
.progress-bar-wrapper {
  width: 100%;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.progress-label { color: rgba(255, 255, 255, 0.7); }
.progress-value { font-weight: 700; }

.progress-track {
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 1s ease;
  position: relative;
  overflow: hidden;
}

.progress-shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shine 2s infinite;
}

@keyframes shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
</style>
