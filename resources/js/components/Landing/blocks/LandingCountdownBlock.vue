<template>
  <section class="countdown-section">
    <div class="countdown-container">
      <div class="countdown-header">
        <div class="countdown-badge">
          <span class="badge-icon">🚀</span>
          <span class="badge-text">{{ settings.title || 'До запуска осталось' }}</span>
        </div>
        <h2 class="countdown-title">
          Мы готовим что-то <span class="highlight">невероятное</span>
        </h2>
        <p v-if="settings.subtitle" class="countdown-subtitle">{{ settings.subtitle }}</p>
      </div>

      <div class="timer-grid">
        <div
            v-for="unit in timerUnits"
            :key="unit.label"
            class="timer-card"
            :class="{ 'urgent': unit.label === 'Дней' && unit.value < 7 }"
        >
          <div class="timer-value">{{ unit.value }}</div>
          <div class="timer-label">{{ unit.label }}</div>
          <div v-if="settings.showProgressBar" class="timer-progress">
            <div class="timer-progress-fill" :style="{ width: unit.progress + '%' }"></div>
          </div>
        </div>
      </div>

      <div class="target-date-wrapper">
        <div class="target-date">
          <span class="target-icon">🎯</span>
          <span class="target-text">
            Целевая дата: <strong>{{ formattedTargetDate }}</strong>
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useCountdown } from '../composables/useCountdown'

const props = defineProps({
  settings: { type: Object, default: () => ({ targetDate: '2026-11-25T23:59:59', title: 'До запуска осталось', subtitle: 'Мы готовим что-то невероятное', showProgressBar: true }) },
  blockId: String
})

const { timeLeft, formattedDate } = useCountdown(props.settings.targetDate)
const formattedTargetDate = computed(() => formattedDate.value)

const timerUnits = computed(() => {
  const { days, hours, minutes, seconds } = timeLeft.value
  return [
    { label: 'Дней', value: days, progress: Math.min(100, (days / 30) * 100) },
    { label: 'Часов', value: hours, progress: (hours / 24) * 100 },
    { label: 'Минут', value: minutes, progress: (minutes / 60) * 100 },
    { label: 'Секунд', value: seconds, progress: (seconds / 60) * 100 }
  ]
})
</script>

<style scoped>
.countdown-section {
  margin-bottom: 20px;
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.countdown-container {
  position: relative;
  padding: 24px;
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.05) 0%, rgba(247, 147, 30, 0.02) 100%);
  border: 1px solid rgba(255, 107, 53, 0.2);
  border-radius: 16px;
  backdrop-filter: blur(20px);
  overflow: hidden;
}

.countdown-header {
  text-align: center;
  margin-bottom: 20px;
}

.countdown-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 107, 53, 0.15);
  border: 1px solid rgba(255, 107, 53, 0.3);
  border-radius: 100px;
  margin-bottom: 16px;
}

.badge-icon {
  font-size: 16px;
}

.badge-text {
  font-size: 12px;
  font-weight: 600;
  color: #ff6b35;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.countdown-title {
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 800;
  color: #fff;
  margin: 0 0 8px;
  line-height: 1.2;
}

.highlight {
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.countdown-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  font-weight: 300;
}

.timer-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .timer-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}

.timer-card {
  position: relative;
  padding: 24px 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  text-align: center;
  transition: all 0.4s ease;
  overflow: hidden;
}

.timer-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #ff6b35, #f7931e, #ff4757);
  background-size: 200% 100%;
  animation: gradientFlow 3s ease infinite;
}

.timer-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 107, 53, 0.4);
  box-shadow: 0 8px 24px rgba(255, 107, 53, 0.15);
}

.timer-card.urgent {
  animation: urgentPulse 2s ease-in-out infinite;
}

.timer-value {
  font-size: clamp(36px, 5vw, 56px);
  font-weight: 900;
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ff4757 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  margin-bottom: 8px;
}

.timer-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
  margin-bottom: 12px;
}

.timer-progress {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.timer-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff6b35, #f7931e);
  border-radius: 2px;
  transition: width 1s ease;
}

.target-date-wrapper {
  display: flex;
  justify-content: center;
}

.target-date {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 100px;
}

.target-icon {
  font-size: 16px;
}

.target-text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.target-text strong {
  color: #ff6b35;
  font-weight: 700;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes gradientFlow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes urgentPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 71, 87, 0.4); }
  50% { box-shadow: 0 0 0 15px rgba(255, 71, 87, 0); }
}
</style>
