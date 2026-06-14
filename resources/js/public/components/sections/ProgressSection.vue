<template>
  <section class="progress-section">
    <ProgressBar
        :value="totalProgress"
        label="Общий прогресс"
        :height="12"
        gradient="linear-gradient(90deg, #ff6b35, #f7931e, #ff4757)"
    />

    <div class="stages">
      <div
          v-for="(stage, idx) in stages"
          :key="idx"
          class="stage-item"
          :class="{ active: stage.active, completed: stage.completed }"
      >
        <div class="stage-dot"></div>
        <div class="stage-label">{{ stage.name }}</div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import ProgressBar from '../ui/ProgressBar.vue'

const props = defineProps({
  stages: {
    type: Array,
    default: () => [
      { name: 'Архитектура', active: true, completed: false },
      { name: 'Функционал', active: false, completed: false },
      { name: 'Релиз', active: false, completed: false }
    ]
  }
})

const totalProgress = computed(() => {
  const completed = props.stages.filter(s => s.completed).length
  const active = props.stages.filter(s => s.active).length
  return Math.round(((completed + active * 0.5) / props.stages.length) * 100)
})
</script>

<style scoped>
.progress-section {
  margin-bottom: 80px;
  padding: 32px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  backdrop-filter: blur(20px);
  animation: fadeInUp 0.8s ease-out 0.3s both;
}

.stages {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-top: 24px;
}

.stage-item {
  flex: 1;
  text-align: center;
}

.stage-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  margin: 0 auto 8px;
  transition: all 0.3s ease;
}

.stage-item.completed .stage-dot {
  background: #00d084;
  box-shadow: 0 0 10px #00d084;
}

.stage-item.active .stage-dot {
  background: #ff6b35;
  box-shadow: 0 0 15px #ff6b35;
  animation: pulse 2s infinite;
}

.stage-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.stage-item.active .stage-label {
  color: #ff6b35;
  font-weight: 600;
}

.stage-item.completed .stage-label {
  color: #00d084;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.3); }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
