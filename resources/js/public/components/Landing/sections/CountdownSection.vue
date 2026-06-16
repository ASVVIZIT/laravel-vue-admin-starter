<template>
  <section class="countdown-section">
    <div class="countdown-container">
      <!-- Header -->
      <div class="countdown-header">
        <div class="countdown-badge">
          <span class="badge-icon"></span>
          <span class="badge-text">До запуска осталось</span>
        </div>
        <h2 class="countdown-title">
          Мы готовим что-то <span class="highlight">невероятное</span>
        </h2>
        <p class="countdown-subtitle">
          Следите за обновлениями — скоро всё будет готово!
        </p>
      </div>

      <!-- Timer Grid -->
      <div class="timer-grid">
        <div
            v-for="unit in timerUnits"
            :key="unit.label"
            class="timer-card"
            :class="{ 'urgent': unit.label === 'Дней' && unit.value < 7 }"
        >
          <div class="timer-value-wrapper">
            <div class="timer-value">{{ unit.value }}</div>
            <div class="timer-value-bg">{{ unit.value }}</div>
          </div>
          <div class="timer-label">{{ unit.label }}</div>
          <div class="timer-progress">
            <div
                class="timer-progress-fill"
                :style="{ width: unit.progress + '%' }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Target Date -->
      <div class="target-date-wrapper">
        <div class="target-date">
          <span class="target-icon">🎯</span>
          <span class="target-text">
            Целевая дата: <strong>{{ formattedTargetDate }}</strong>
          </span>
        </div>
      </div>

      <!-- Decorative Elements -->
      <div class="decorative-elements">
        <div class="decor-circle decor-circle-1"></div>
        <div class="decor-circle decor-circle-2"></div>
        <div class="decor-circle decor-circle-3"></div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useCountdown } from '../composables/useCountdown.js'

const props = defineProps({
  /**
   * Целевая дата в любом удобном формате:
   * - "15 июля 2026"
   * - "15.07.2026"
   * - "2026-07-15"
   * - "15/07/2026"
   * - Date объект
   * - Timestamp (число)
   */
  targetDate: {
    type: [String, Date, Number],
    required: true
  }
})

/**
 * Умный парсер даты — понимает человеческие форматы
 */
function parseHumanDate(input) {
  if (input instanceof Date) return input
  if (typeof input === 'number') return new Date(input)

  const str = String(input).trim().toLowerCase()

  // Русские месяцы
  const monthsRu = {
    'января': 0, 'февраля': 1, 'марта': 2, 'апреля': 3,
    'мая': 4, 'июня': 5, 'июля': 6, 'августа': 7,
    'сентября': 8, 'октября': 9, 'ноября': 10, 'декабря': 11,
    'январь': 0, 'февраль': 1, 'март': 2, 'апрель': 3,
    'май': 4, 'июнь': 5, 'июль': 6, 'август': 7,
    'сентябрь': 8, 'октябрь': 9, 'ноябрь': 10, 'декабрь': 11
  }

  // Английские месяцы
  const monthsEn = {
    'january': 0, 'february': 1, 'march': 2, 'april': 3,
    'may': 4, 'june': 5, 'july': 6, 'august': 7,
    'september': 8, 'october': 9, 'november': 10, 'december': 11,
    'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3,
    'jun': 5, 'jul': 6, 'aug': 7, 'sep': 8, 'sept': 8,
    'oct': 9, 'nov': 10, 'dec': 11
  }

  const allMonths = { ...monthsRu, ...monthsEn }

  // Формат: "15 июля 2026" или "15 july 2026"
  const matchWord = str.match(/(\d{1,2})\s+([а-яa-z]+)\s+(\d{4})/i)
  if (matchWord) {
    const day = parseInt(matchWord[1])
    const month = allMonths[matchWord[2].toLowerCase()]
    const year = parseInt(matchWord[3])
    if (month !== undefined) {
      return new Date(year, month, day, 23, 59, 59)
    }
  }

  // Формат: "15.07.2026" или "15/07/2026"
  const matchDot = str.match(/(\d{1,2})[./](\d{1,2})[./](\d{4})/)
  if (matchDot) {
    const day = parseInt(matchDot[1])
    const month = parseInt(matchDot[2]) - 1
    const year = parseInt(matchDot[3])
    return new Date(year, month, day, 23, 59, 59)
  }

  // Формат: "2026-07-15" (ISO)
  const matchIso = str.match(/(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (matchIso) {
    const year = parseInt(matchIso[1])
    const month = parseInt(matchIso[2]) - 1
    const day = parseInt(matchIso[3])
    return new Date(year, month, day, 23, 59, 59)
  }

  // Fallback: стандартный парсинг
  const date = new Date(str)
  return isNaN(date.getTime()) ? new Date('2026-07-15T23:59:59') : date
}

const targetDate = computed(() => parseHumanDate(props.targetDate))
const { timeLeft, formattedDate } = useCountdown(targetDate.value)

const formattedTargetDate = computed(() => {
  return targetDate.value.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})

const timerUnits = computed(() => {
  const { days, hours, minutes, seconds } = timeLeft.value

  return [
    {
      label: 'Дней',
      value: days,
      progress: Math.min(100, (days / 30) * 100)
    },
    {
      label: 'Часов',
      value: hours,
      progress: (hours / 24) * 100
    },
    {
      label: 'Минут',
      value: minutes,
      progress: (minutes / 60) * 100
    },
    {
      label: 'Секунд',
      value: seconds,
      progress: (seconds / 60) * 100
    }
  ]
})
</script>

<style scoped>
.countdown-section {
  margin-bottom: 80px;
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.countdown-container {
  position: relative;
  padding: 60px 40px;
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.05) 0%, rgba(247, 147, 30, 0.02) 100%);
  border: 1px solid rgba(255, 107, 53, 0.2);
  border-radius: 32px;
  backdrop-filter: blur(20px);
  overflow: hidden;
}

/* Header */
.countdown-header {
  text-align: center;
  margin-bottom: 48px;
}

.countdown-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  background: rgba(255, 107, 53, 0.15);
  border: 1px solid rgba(255, 107, 53, 0.3);
  border-radius: 100px;
  margin-bottom: 24px;
  animation: badgePulse 3s ease-in-out infinite;
}

.badge-icon {
  font-size: 18px;
  animation: rocketFly 2s ease-in-out infinite;
}

.badge-text {
  font-size: 14px;
  font-weight: 600;
  color: #ff6b35;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.countdown-title {
  font-size: clamp(32px, 5vw, 48px);
  font-weight: 800;
  color: #fff;
  margin: 0 0 16px;
  line-height: 1.2;
}

.highlight {
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.countdown-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  font-weight: 300;
}

/* Timer Grid */
.timer-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 40px;
}

@media (max-width: 768px) {
  .timer-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

.timer-card {
  position: relative;
  padding: 32px 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  text-align: center;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
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
  transform: translateY(-8px) scale(1.02);
  border-color: rgba(255, 107, 53, 0.4);
  box-shadow: 0 20px 60px rgba(255, 107, 53, 0.2);
}

.timer-card.urgent {
  animation: urgentPulse 2s ease-in-out infinite;
}

.timer-value-wrapper {
  position: relative;
  margin-bottom: 12px;
}

.timer-value {
  font-size: clamp(48px, 7vw, 80px);
  font-weight: 900;
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ff4757 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  position: relative;
  z-index: 1;
}

.timer-value-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  font-size: clamp(48px, 7vw, 80px);
  font-weight: 900;
  color: rgba(255, 107, 53, 0.1);
  line-height: 1;
  font-variant-numeric: tabular-nums;
  filter: blur(8px);
  z-index: 0;
}

.timer-label {
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 16px;
  font-weight: 600;
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
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 10px rgba(255, 107, 53, 0.5);
}

/* Target Date */
.target-date-wrapper {
  display: flex;
  justify-content: center;
}

.target-date {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 16px 32px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 100px;
  backdrop-filter: blur(10px);
}

.target-icon {
  font-size: 20px;
  animation: targetBounce 2s ease-in-out infinite;
}

.target-text {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
}

.target-text strong {
  color: #ff6b35;
  font-weight: 700;
}

/* Decorative Elements */
.decorative-elements {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.decor-circle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 107, 53, 0.1) 0%, transparent 70%);
}

.decor-circle-1 {
  width: 300px;
  height: 300px;
  top: -150px;
  right: -100px;
  animation: float1 8s ease-in-out infinite;
}

.decor-circle-2 {
  width: 200px;
  height: 200px;
  bottom: -100px;
  left: -50px;
  animation: float2 10s ease-in-out infinite;
}

.decor-circle-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  left: 50%;
  animation: float3 12s ease-in-out infinite;
}

/* Animations */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes badgePulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 107, 53, 0.4); }
  50% { box-shadow: 0 0 0 10px rgba(255, 107, 53, 0); }
}

@keyframes rocketFly {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-4px) rotate(-5deg); }
}

@keyframes gradientFlow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes urgentPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 71, 87, 0.4); }
  50% { box-shadow: 0 0 0 15px rgba(255, 71, 87, 0); }
}

@keyframes targetBounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

@keyframes float1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-30px, 30px) scale(1.1); }
}

@keyframes float2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(30px, -30px) scale(0.9); }
}

@keyframes float3 {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(1.2); }
}
</style>
