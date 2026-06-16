<template>
  <section class="progressSection">
    <div class="progressContainer">
      <div class="progressHeader">
        <span class="progressIcon"></span>
        <h2 class="progressTitle">{{ settings.title || 'Прогресс разработки' }}</h2>
      </div>

      <div v-if="settings.showPercentage" class="progressBarWrapper">
        <div class="progressInfo">
          <span class="progressLabel">Общий прогресс</span>
          <span class="progressPercent" :style="{ color: 'var(--primary-color, #ff6b35)' }">{{ totalProgress }}%</span>
        </div>
        <div class="progressTrack">
          <div class="progressFill" :style="{ width: totalProgress + '%' }"></div>
        </div>
      </div>

      <div class="stages">
        <div
            v-for="(stage, idx) in settings.stages"
            :key="idx"
            class="[stageItem, stage.active ? active : '', stage.completed ? completed : '']"
        >
          <div class="stageDot"></div>
          <div class="stageLabel">{{ stage.name }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  settings: { type: Object, default: () => ({ title: 'Прогресс разработки', showPercentage: true, stages: [{ name: 'Архитектура', active: true, completed: false }, { name: 'Функционал', active: false, completed: false }, { name: 'Релиз', active: false, completed: false }] }) },
  blockId: String
})

const totalProgress = computed(() => {
  const stages = props.settings.stages || []
  const completed = stages.filter(s => s.completed).length
  const active = stages.filter(s => s.active).length
  return Math.round(((completed + active * 0.5) / stages.length) * 100)
})
</script>

<style scoped>
.progressSection {
  margin-bottom: 4px;
  animation: fadeInUp 0.8s ease-out 0.3s both;
}
.progressContainer {
  padding: 4px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  backdrop-filter: blur(20px);
}
.progressHeader {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
}
.progressIcon { font-size: 24px; }
.progressTitle {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #fff;
}
.progressBarWrapper {
  margin-bottom: 4px;
}
.progressInfo {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 12px;
}
.progressLabel { color: rgba(255, 255, 255, 0.7); }
.progressPercent { font-weight: 700; font-size: 16px; }
.progressTrack {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}
.progressFill {
  height: 100%;
  background: linear-gradient(90deg, #ff6b35, #f7931e, #ff4757);
  background-size: 200% 100%;
  border-radius: 4px;
  transition: width 1s ease;
  animation: progressShine 3s ease infinite;
}
.stages {
  display: flex;
  justify-content: space-between;
  gap: 4px;
}
.stageItem {
  flex: 1;
  text-align: center;
}
.stageDot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  margin: 0 auto 4px;
  transition: all 0.3s ease;
}
.active .stageDot {
  background: #ff6b35;
  box-shadow: 0 0 15px #ff6b35;
  animation: pulse 2s infinite;
}
.completed .stageDot {
  background: #00d084;
  box-shadow: 0 0 10px #00d084;
}
.stageLabel {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
}
.active .stageLabel {
  color: #ff6b35;
  font-weight: 600;
}
.completed .stageLabel {
  color: #00d084;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.3); }
}
@keyframes progressShine {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
