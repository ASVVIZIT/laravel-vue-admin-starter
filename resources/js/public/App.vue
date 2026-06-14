<template>
  <div class="public-app">
    <!-- Animated Background -->
    <div class="animated-bg">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
    </div>

    <!-- Main Content -->
    <div class="content-wrapper">
      <!-- Header -->
      <header class="hero">
        <div class="logo-badge">
          <span class="logo-icon">🔥</span>
          <span class="logo-text">FENIX</span>
        </div>
        <h1 class="main-title">
          <span class="title-gradient">FenixPortal</span>
        </h1>
        <p class="subtitle">Публичная часть сайта находится в активной разработке</p>

        <!-- Stage Badge -->
        <div class="stage-badge">
          <span class="pulse-dot"></span>
          <span>Стадия 1 из 3 — Архитектура</span>
        </div>
      </header>

      <!-- Countdown Timer -->
      <section class="countdown-section">
        <h2 class="section-title">
          <span class="icon">⏳</span>
          До завершения разработки
        </h2>

        <div class="countdown-grid">
          <div class="countdown-card" v-for="unit in countdownUnits" :key="unit.label">
            <div class="countdown-value">{{ unit.value }}</div>
            <div class="countdown-label">{{ unit.label }}</div>
            <div class="countdown-bar">
              <div class="countdown-bar-fill" :style="{ width: unit.percent + '%' }"></div>
            </div>
          </div>
        </div>

        <div class="target-date">
          🎯 Целевая дата: <strong>{{ formattedTargetDate }}</strong>
        </div>
      </section>

      <!-- Progress -->
      <section class="progress-section">
        <div class="progress-header">
          <span>Общий прогресс</span>
          <span class="progress-percent">{{ totalProgress }}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: totalProgress + '%' }"></div>
        </div>
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

      <!-- Tech Stack -->
      <section class="stack-section">
        <h2 class="section-title">
          <span class="icon">🛠️</span>
          Технологический стек
        </h2>

        <div class="stack-grid">
          <div
              v-for="category in techStack"
              :key="category.title"
              class="stack-category"
          >
            <div class="category-header">
              <span class="category-icon">{{ category.icon }}</span>
              <h3>{{ category.title }}</h3>
            </div>
            <div class="tech-items">
              <div
                  v-for="tech in category.items"
                  :key="tech.name"
                  class="tech-item"
              >
                <span class="tech-icon">{{ tech.icon }}</span>
                <div class="tech-info">
                  <div class="tech-name">{{ tech.name }}</div>
                  <div class="tech-version">{{ tech.version }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Coming Soon -->
      <section class="features-section">
        <h2 class="section-title">
          <span class="icon">✨</span>
          Что уже работает
        </h2>
        <div class="features-grid">
          <div v-for="feature in features" :key="feature.title" class="feature-card">
            <div class="feature-icon">{{ feature.icon }}</div>
            <h4>{{ feature.title }}</h4>
            <p>{{ feature.description }}</p>
            <div class="feature-status" :class="feature.status">
              {{ feature.statusText }}
            </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="footer">
        <div class="footer-content">
          <p>Разработано с ❤️ на <strong>Laravel + Vue 3</strong></p>
          <p class="copyright">© 2026 FenixPortal · by ASV</p>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// ============================================================================
// 🎯 ЦЕЛЕВАЯ ДАТА ЗАВЕРШЕНИЯ РАЗРАБОТКИ
// ============================================================================
const TARGET_DATE = new Date('2026-07-15T23:59:59') // 15 июля 2026

// ============================================================================
// ⏳ ТАЙМЕР ОБРАТНОГО ОТСЧЁТА
// ============================================================================
const now = ref(new Date())
let timer = null

const timeLeft = computed(() => {
  const diff = TARGET_DATE - now.value
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    total: diff
  }
})

const formattedTargetDate = computed(() => {
  return TARGET_DATE.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})

const countdownUnits = computed(() => {
  const { days, hours, minutes, seconds } = timeLeft.value
  const totalDays = 134 // предполагаемое общее время

  return [
    {
      label: 'Дней',
      value: String(days).padStart(2, '0'),
      percent: Math.min(100, (days / totalDays) * 100)
    },
    {
      label: 'Часов',
      value: String(hours).padStart(2, '0'),
      percent: (hours / 24) * 100
    },
    {
      label: 'Минут',
      value: String(minutes).padStart(2, '0'),
      percent: (minutes / 60) * 100
    },
    {
      label: 'Секунд',
      value: String(seconds).padStart(2, '0'),
      percent: (seconds / 60) * 100
    }
  ]
})

// ============================================================================
// 📊 ПРОГРЕСС РАЗРАБОТКИ
// ============================================================================
const stages = [
  { name: 'Архитектура', active: true, completed: false },
  { name: 'Функционал', active: false, completed: false },
  { name: 'Релиз', active: false, completed: false }
]

const totalProgress = computed(() => {
  const completed = stages.filter(s => s.completed).length
  const active = stages.filter(s => s.active).length
  return Math.round(((completed + active * 0.5) / stages.length) * 100)
})

// ============================================================================
// 🛠️ ТЕХНОЛОГИЧЕСКИЙ СТЕК
// ============================================================================
const techStack = [
  {
    title: 'Backend',
    icon: '⚙️',
    items: [
      { name: 'Laravel', version: 'v10.48', icon: '🎯' },
      { name: 'PHP', version: '8.2+', icon: '🐘' },
      { name: 'MySQL', version: '8.0', icon: '🗄️' },
      { name: 'Redis', version: 'Latest', icon: '🔴' },
      { name: 'Sanctum', version: 'v3.3', icon: '🔐' },
      { name: 'Reverb', version: 'v1.5', icon: '📡' }
    ]
  },
  {
    title: 'Frontend',
    icon: '🎨',
    items: [
      { name: 'Vue', version: '3.x', icon: '💚' },
      { name: 'Vite', version: '5.4', icon: '⚡' },
      { name: 'Pinia', version: 'Latest', icon: '🍍' },
      { name: 'Vue Router', version: 'Hash Mode', icon: '🧭' },
      { name: 'Axios', version: 'Latest', icon: '🌐' },
      { name: 'Sass/SCSS', version: 'Modern', icon: '💅' }
    ]
  },
  {
    title: 'UI / UX',
    icon: '✨',
    items: [
      { name: 'Element Plus', version: 'Latest', icon: '🎭' },
      { name: 'ECharts', version: '5.x', icon: '📊' },
      { name: 'Three.js', version: 'Latest', icon: '🎮' },
      { name: 'Bootstrap Icons', version: 'Latest', icon: '🎨' }
    ]
  },
  {
    title: 'Инфраструктура',
    icon: '🚀',
    items: [
      { name: 'Docker', version: 'Compose', icon: '🐳' },
      { name: 'Nginx', version: 'Latest', icon: '🌐' },
      { name: 'Git', version: 'GitHub', icon: '🐙' },
      { name: 'Spatie Permission', version: 'v5.11', icon: '🛡️' }
    ]
  }
]

// ============================================================================
// ✨ УЖЕ РАБОТАЕТ
// ============================================================================
const features = [
  {
    icon: '🔐',
    title: 'Авторизация',
    description: '3 типа входа: User, Admin, Tester. Sanctum токены, CSRF защита.',
    status: 'done',
    statusText: '✅ Работает'
  },
  {
    icon: '🏋️',
    title: 'Модуль Training',
    description: 'Журнал тренировок, упражнения, статистика, экспорт CSV.',
    status: 'done',
    statusText: '✅ Работает'
  },
  {
    icon: '💡',
    title: 'SmartLight',
    description: 'Управление устройствами, телеметрия, команды V0/V1.',
    status: 'done',
    statusText: '✅ Работает'
  },
  {
    icon: '💬',
    title: 'TalkStream',
    description: 'Чат, звонки, друзья. WebSocket через Reverb.',
    status: 'progress',
    statusText: '🔧 В процессе'
  },
  {
    icon: '🏢',
    title: 'Companies',
    description: 'Управление компаниями и каналами связи.',
    status: 'done',
    statusText: '✅ Работает'
  },
  {
    icon: '🌐',
    title: 'Публичная часть',
    description: 'Новый entry point, разделение с админкой.',
    status: 'progress',
    statusText: '🔧 В процессе'
  }
]

// ============================================================================
// 🔄 LIFECYCLE
// ============================================================================
onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
/* ============================================================================
   ANIMATED BACKGROUND
   ============================================================================ */
.public-app {
  min-height: 100vh;
  background: #0a0e27;
  color: #fff;
  position: relative;
  overflow-x: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.animated-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.4;
  animation: float 20s infinite ease-in-out;
}

.orb-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #ff6b35 0%, transparent 70%);
  top: -100px;
  left: -100px;
  animation-delay: 0s;
}

.orb-2 {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, #f7931e 0%, transparent 70%);
  bottom: -200px;
  right: -200px;
  animation-delay: 7s;
}

.orb-3 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #ff4757 0%, transparent 70%);
  top: 50%;
  left: 50%;
  animation-delay: 14s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(100px, -50px) scale(1.1); }
  66% { transform: translate(-50px, 100px) scale(0.9); }
}

/* ============================================================================
   CONTENT WRAPPER
   ============================================================================ */
.content-wrapper {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 24px;
}

/* ============================================================================
   HERO HEADER
   ============================================================================ */
.hero {
  text-align: center;
  margin-bottom: 80px;
  animation: fadeInDown 0.8s ease-out;
}

.logo-badge {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  background: rgba(255, 107, 53, 0.1);
  border: 1px solid rgba(255, 107, 53, 0.3);
  border-radius: 100px;
  margin-bottom: 32px;
  backdrop-filter: blur(10px);
}

.logo-icon {
  font-size: 28px;
  filter: drop-shadow(0 0 10px rgba(255, 107, 53, 0.5));
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 4px;
  color: #ff6b35;
}

.main-title {
  font-size: clamp(48px, 8vw, 96px);
  font-weight: 900;
  margin: 0 0 24px;
  line-height: 1;
  letter-spacing: -2px;
}

.title-gradient {
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ff4757 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% 200%;
  animation: gradientShift 5s ease infinite;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.subtitle {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 32px;
  font-weight: 300;
}

.stage-badge {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 100px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: #00d084;
  border-radius: 50%;
  animation: pulse 2s infinite;
  box-shadow: 0 0 10px #00d084;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.3); }
}

/* ============================================================================
   SECTION TITLES
   ============================================================================ */
.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 32px;
  text-align: center;
  justify-content: center;
}

.section-title .icon {
  font-size: 36px;
}

/* ============================================================================
   COUNTDOWN TIMER
   ============================================================================ */
.countdown-section {
  margin-bottom: 80px;
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.countdown-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

@media (max-width: 640px) {
  .countdown-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.countdown-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 32px 16px;
  text-align: center;
  backdrop-filter: blur(20px);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.countdown-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #ff6b35, #f7931e);
}

.countdown-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 107, 53, 0.3);
  box-shadow: 0 20px 40px rgba(255, 107, 53, 0.1);
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

.countdown-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.countdown-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff6b35, #f7931e);
  border-radius: 2px;
  transition: width 1s ease;
}

.target-date {
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.target-date strong {
  color: #ff6b35;
}

/* ============================================================================
   PROGRESS SECTION
   ============================================================================ */
.progress-section {
  margin-bottom: 80px;
  padding: 32px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  backdrop-filter: blur(20px);
  animation: fadeInUp 0.8s ease-out 0.3s both;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  font-size: 16px;
}

.progress-percent {
  font-weight: 700;
  color: #ff6b35;
  font-size: 20px;
}

.progress-track {
  height: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 24px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff6b35, #f7931e, #ff4757);
  background-size: 200% 100%;
  border-radius: 6px;
  transition: width 1s ease;
  animation: progressShine 3s ease infinite;
}

@keyframes progressShine {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.stages {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.stage-item {
  flex: 1;
  text-align: center;
  position: relative;
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

/* ============================================================================
   TECH STACK
   ============================================================================ */
.stack-section {
  margin-bottom: 80px;
  animation: fadeInUp 0.8s ease-out 0.4s both;
}

.stack-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.stack-category {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 24px;
  backdrop-filter: blur(20px);
  transition: all 0.3s ease;
}

.stack-category:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 107, 53, 0.3);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.category-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.category-icon {
  font-size: 28px;
}

.category-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}

.tech-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tech-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 10px;
  transition: all 0.2s ease;
}

.tech-item:hover {
  background: rgba(255, 107, 53, 0.1);
  transform: translateX(4px);
}

.tech-icon {
  font-size: 22px;
  width: 32px;
  text-align: center;
}

.tech-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tech-name {
  font-weight: 600;
  font-size: 14px;
}

.tech-version {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

/* ============================================================================
   FEATURES
   ============================================================================ */
.features-section {
  margin-bottom: 80px;
  animation: fadeInUp 0.8s ease-out 0.5s both;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(20px);
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 107, 53, 0.3);
}

.feature-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.feature-card h4 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 700;
}

.feature-card p {
  margin: 0 0 16px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  line-height: 1.5;
}

.feature-status {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 600;
}

.feature-status.done {
  background: rgba(0, 208, 132, 0.1);
  color: #00d084;
  border: 1px solid rgba(0, 208, 132, 0.3);
}

.feature-status.progress {
  background: rgba(255, 153, 0, 0.1);
  color: #ff9900;
  border: 1px solid rgba(255, 153, 0, 0.3);
}

/* ============================================================================
   FOOTER
   ============================================================================ */
.footer {
  text-align: center;
  padding: 40px 0 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  animation: fadeInUp 0.8s ease-out 0.6s both;
}

.footer p {
  margin: 4px 0;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
}

.copyright {
  font-size: 12px !important;
  opacity: 0.7;
}

/* ============================================================================
   ANIMATIONS
   ============================================================================ */
@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
