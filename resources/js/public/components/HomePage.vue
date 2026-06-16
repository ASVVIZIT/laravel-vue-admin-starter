<template>
  <div class="home-page">
    <!-- Animated Background -->
    <div class="animated-bg">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
    </div>

    <!-- Content -->
    <div class="content">
      <!-- Hero Section -->
      <section class="hero">
        <div class="logo-badge">
          <span class="logo-icon">🔥</span>
          <span class="logo-text">FENIX PORTAL</span>
        </div>

        <h1 class="main-title">
          <span class="title-gradient">Добро пожаловать</span>
        </h1>

        <p class="subtitle">
          Современная платформа для управления контентом, тренировками и умными устройствами
        </p>

        <div class="cta-buttons">
          <a href="/admin" class="btn btn-primary">
            <span class="btn-icon">🚀</span>
            Войти в админку
          </a>
          <a href="#landings" class="btn btn-secondary">
            <span class="btn-icon">📄</span>
            Смотреть лендинги
          </a>
        </div>
      </section>

      <!-- Features Section -->
      <section class="features">
        <h2 class="section-title">
          <span class="section-icon">✨</span>
          Что умеет FenixPortal
        </h2>

        <div class="features-grid">
          <div class="feature-card" v-for="feature in features" :key="feature.icon">
            <div class="feature-icon">{{ feature.icon }}</div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </section>

      <!-- Landings Section -->
      <section id="landings" class="landings-section">
        <h2 class="section-title">
          <span class="section-icon">🎨</span>
          Опубликованные лендинги
        </h2>

        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Загрузка лендингов...</p>
        </div>

        <div v-else-if="error" class="error-state">
          <p>{{ error }}</p>
        </div>

        <div v-else-if="landings.length === 0" class="empty-state">
          <div class="empty-icon">📭</div>
          <p>Пока нет опубликованных лендингов</p>
        </div>

        <div v-else class="landings-grid">
          <a
              v-for="landing in landings"
              :key="landing.id"
              :href="`/l/${landing.slug}`"
              class="landing-card"
          >
            <div class="landing-card-header">
              <span class="landing-type-badge" :class="`type-${landing.type}`">
                {{ typeLabels[landing.type] || landing.type }}
              </span>
              <span class="landing-arrow">→</span>
            </div>

            <h3 class="landing-title">{{ landing.title }}</h3>
            <p class="landing-description">{{ landing.description || 'Описание отсутствует' }}</p>

            <div class="landing-meta">
              <span class="meta-item">
                <span class="meta-icon">📦</span>
                {{ landing.blocks_count || 0 }} блоков
              </span>
              <span class="meta-item" v-if="landing.published_at">
                <span class="meta-icon">📅</span>
                {{ formatDate(landing.published_at) }}
              </span>
            </div>
          </a>
        </div>
      </section>

      <!-- Footer -->
      <footer class="footer">
        <p class="footer-text">
          Разработано с ❤️ на Laravel + Vue 3
        </p>
        <p class="footer-copyright">
          © 2026 FenixPortal · by ASV
        </p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { landingApi } from '@/components/Landing/api/landingApi'

const loading = ref(true)
const error = ref(null)
const landings = ref([])

const features = [
  {
    icon: '🎨',
    title: 'Landing Builder',
    description: 'Создавайте красивые лендинги с помощью визуального конструктора блоков'
  },
  {
    icon: '🏋️',
    title: 'Training Journal',
    description: 'Ведите журнал тренировок, отслеживайте прогресс и делитесь с друзьями'
  },
  {
    icon: '💡',
    title: 'SmartLight',
    description: 'Управляйте умным освещением, настраивайте сценарии и расписания'
  },
  {
    icon: '💬',
    title: 'TalkStream',
    description: 'Мессенджер с чатами, звонками и управлением друзьями'
  },
  {
    icon: '🏢',
    title: 'Companies',
    description: 'Управление компаниями и каналами связи с IndexedDB кэшированием'
  },
  {
    icon: '🔐',
    title: 'ACL System',
    description: 'Гибкая система ролей и прав доступа на базе Spatie Permissions'
  }
]

const typeLabels = {
  'personal_brand': '👤 Личный бренд',
  'shop': '🛒 Магазин',
  'portfolio': '🎨 Портфолио',
  'custom': '⚙️ Кастомный'
}

const formatDate = (dateStr) => {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  } catch {
    return dateStr
  }
}

const fetchLandings = async () => {
  try {
    loading.value = true
    error.value = null

    // Используем публичный API для списка лендингов
    const response = await landingApi.getPublicList()
    landings.value = response.data || []
  } catch (err) {
    console.error('Error fetching landings:', err)
    error.value = 'Не удалось загрузить лендинги'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchLandings()
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #0a0e27;
  color: #fff;
  position: relative;
  overflow-x: hidden;
}

/* Animated Background */
.animated-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.gradient-orb {
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.3;
  animation: float 25s infinite ease-in-out;
}

.orb-1 {
  background: radial-gradient(circle, #ff6b35 0%, transparent 70%);
  top: -200px;
  left: -200px;
  animation-delay: 0s;
}

.orb-2 {
  background: radial-gradient(circle, #f7931e 0%, transparent 70%);
  bottom: -300px;
  right: -300px;
  animation-delay: 8s;
}

.orb-3 {
  background: radial-gradient(circle, #ff4757 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: 16s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(100px, -80px) scale(1.1); }
  66% { transform: translate(-80px, 100px) scale(0.9); }
}

/* Content */
.content {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Hero Section */
.hero {
  min-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 80px 0;
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
  animation: fadeInDown 0.8s ease-out;
}

.logo-icon {
  font-size: 24px;
}

.logo-text {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
  color: #ff6b35;
}

.main-title {
  font-size: clamp(2.5rem, 6vw, 5rem);
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 24px;
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.title-gradient {
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ff4757 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: clamp(1rem, 2vw, 1.25rem);
  color: rgba(255, 255, 255, 0.7);
  max-width: 600px;
  margin-bottom: 48px;
  line-height: 1.6;
  animation: fadeInUp 0.8s ease-out 0.4s both;
}

.cta-buttons {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
  animation: fadeInUp 0.8s ease-out 0.6s both;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
}

.btn-primary {
  background: linear-gradient(135deg, #ff6b35, #f7931e);
  color: #fff;
  box-shadow: 0 4px 20px rgba(255, 107, 53, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(255, 107, 53, 0.5);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.btn-icon {
  font-size: 18px;
}

/* Features Section */
.features {
  padding: 80px 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: clamp(1.5rem, 3vw, 2.5rem);
  font-weight: 700;
  margin-bottom: 48px;
  text-align: center;
  justify-content: center;
}

.section-icon {
  font-size: 1.2em;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 32px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.feature-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 107, 53, 0.3);
  transform: translateY(-4px);
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.feature-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #fff;
}

.feature-description {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.6;
}

/* Landings Section */
.landings-section {
  padding: 80px 0;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  text-align: center;
  gap: 16px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-left-color: #ff6b35;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 64px;
  opacity: 0.5;
}

.landings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.landing-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  text-decoration: none;
  color: #fff;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 16px;
  backdrop-filter: blur(10px);
}

.landing-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 107, 53, 0.5);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(255, 107, 53, 0.2);
}

.landing-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.landing-type-badge {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(255, 107, 53, 0.1);
  color: #ff6b35;
}

.type-personal_brand { background: rgba(102, 126, 234, 0.1); color: #667eea; }
.type-shop { background: rgba(17, 153, 142, 0.1); color: #11998e; }
.type-portfolio { background: rgba(79, 172, 254, 0.1); color: #4facfe; }
.type-custom { background: rgba(255, 107, 53, 0.1); color: #ff6b35; }

.landing-arrow {
  font-size: 24px;
  color: rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.landing-card:hover .landing-arrow {
  color: #ff6b35;
  transform: translateX(4px);
}

.landing-title {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.3;
}

.landing-description {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.5;
  flex: 1;
}

.landing-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.meta-icon {
  font-size: 14px;
}

/* Footer */
.footer {
  padding: 48px 0;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 80px;
}

.footer-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
}

.footer-copyright {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

/* Animations */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .hero {
    min-height: 80vh;
    padding: 60px 0;
  }

  .cta-buttons {
    flex-direction: column;
    width: 100%;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .landings-grid {
    grid-template-columns: 1fr;
  }
}
</style>
