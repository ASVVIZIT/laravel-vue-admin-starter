<template>
  <div class="stats-container" :class="containerClass">
    <!-- 🟦 ОБЩИЕ МЕТРИКИ -->
    <div class="stats-group general-group">
      <div
          v-for="item in visibleGeneral"
          :key="item.key"
          class="stat-pill"
          :class="getPillSize()"
      >
        <span v-if="showLabels" class="pill-label">{{ item.label }}</span>
        <span class="pill-value">{{ formatGeneral(item, data) }}</span>
      </div>
    </div>

    <!-- 🔹 МЕТРИКИ ПО ТИПАМ (показываем только если есть данные) -->
    <div v-if="showTypes && visibleTypes.length > 0" class="stats-group type-group">
      <div
          v-for="type in visibleTypes"
          :key="type.key"
          class="stat-pill type-pill"
          :class="getPillSize()"
          :style="{ background: type.bg, color: type.color }"
          :title="getTooltip(type)"
      >
        <span class="pill-icon">{{ type.icon }}</span>
        <span v-if="showLabels" class="pill-label">{{ type.label }}</span>
        <span class="pill-value">{{ formatType(type, typeData[type.key]) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { TRAINING_STATS_CONFIG } from '../config/trainingStatsConfig.js'

const props = defineProps({
  summary: { type: Object, default: () => ({}) },
  stats: { type: Object, default: () => ({}) }
})

const config = TRAINING_STATS_CONFIG
const windowWidth = ref(window.innerWidth)
const isTouch = ref('ontouchstart' in window || navigator.maxTouchPoints > 0)

// 🔍 Определение типа устройства
const deviceType = computed(() => {
  const w = windowWidth.value
  if (w < 576) return 'mobile-xs'        // < 576px
  if (w < 768) return 'mobile'           // 576-767px
  if (w < 992) return 'tablet'           // 768-991px
  if (w < 1200) return 'desktop'         // 992-1199px
  return 'desktop-lg'                    // >= 1200px
})

const isMobile = computed(() => ['mobile-xs', 'mobile'].includes(deviceType.value))
const isTablet = computed(() => deviceType.value === 'tablet')

const data = computed(() => ({
  today: props.summary?.today || {},
  week: props.summary?.week || {},
  streak: props.summary?.streak || 0,
  total_volume: props.stats?.data?.total_volume || 0,
  by_type: props.summary?.today?.by_type || {}
}))

const typeData = computed(() => data.value.by_type)

// 🔹 Какие общие метрики показывать
const visibleGeneral = computed(() => {
  if (isMobile.value) {
    // На мобильном показываем только самое важное
    return config.general.filter(item =>
        ['today.sessions', 'week.sessions', 'streak'].includes(item.key)
    )
  }
  return config.general
})

// 🔹 Показывать ли типы упражнений
const showTypes = computed(() => {
  if (isMobile.value) return false
  if (isTablet.value && Object.keys(typeData.value).length > 2) return false
  return true
})

// 🔹 Сколько типов показывать
const visibleTypes = computed(() => {
  const types = config.types.filter(t => typeData.value[t.key]?.[t.metric])

  if (isTablet.value) {
    return types.slice(0, 2) // На планшете макс 2 типа
  }

  return types
})

// 🔹 Показывать ли лейблы
const showLabels = computed(() => {
  if (isMobile.value) return false
  if (isTablet.value) return false
  return true
})

// 🔹 Размер пилюль
const getPillSize = () => {
  if (isMobile.value) return 'pill-small'
  if (isTablet.value) return 'pill-medium'
  return 'pill-normal'
}

// 🔹 Tooltip для типов
const getTooltip = (type) => {
  const data = typeData.value[type.key]
  if (!data) return ''

  const parts = []
  if (type.metric === 'reps' && data.reps) parts.push(`${data.reps} повт.`)
  if (type.metric === 'volume' && data.volume) parts.push(`${formatVolume(data.volume)}`)
  if (type.metric === 'distance' && data.distance) parts.push(`${formatDistance(data.distance)}`)

  return `${type.label}: ${parts.join(', ')}`
}

// 🔹 Форматтеры
const formatGeneral = (item, d) => {
  if (item.key === 'today.sessions') return `${d.today.sessions || 0}${item.suffix || ''}`
  if (item.key === 'week.sessions') return `${d.week.sessions || 0}/${d.week.active_days || 0}`
  if (item.key === 'streak') return `${d.streak}`
  if (item.key === 'total_volume') return formatVolume(d.total_volume)
  return '—'
}

const formatType = (typeConfig, typeData) => {
  if (!typeData) return '—'
  const val = typeData[typeConfig.metric] || 0

  switch (typeConfig.format) {
    case 'reps': return `${Math.round(val)}`
    case 'volume': return formatCompactVolume(val)
    case 'distance': return formatCompactDistance(val)
    default: return val
  }
}

const formatVolume = (kg) => {
  const n = parseFloat(kg) || 0
  return n >= 1000 ? `${(n / 1000).toFixed(1)}т` : `${Math.round(n)}кг`
}

const formatCompactVolume = (kg) => {
  const n = parseFloat(kg) || 0
  if (n >= 1000) return `${(n / 1000).toFixed(1)}т`
  if (n >= 100) return `${Math.round(n / 100) * 100}`
  return `${Math.round(n)}`
}

const formatDistance = (km) => {
  const n = parseFloat(km) || 0
  return n >= 1 ? `${n.toFixed(1)}км` : `${Math.round(n * 1000)}м`
}

const formatCompactDistance = (km) => {
  const n = parseFloat(km) || 0
  return n >= 1 ? `${n.toFixed(1)}` : `${Math.round(n * 1000)}`
}

// 📐 Resize handler с debounce
let resizeTimeout
const handleResize = () => {
  clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => {
    windowWidth.value = window.innerWidth
  }, 150)
}

const containerClass = computed(() => ({
  'is-mobile': isMobile.value,
  'is-tablet': isTablet.value,
  'is-touch': isTouch.value
}))

onMounted(() => {
  window.addEventListener('resize', handleResize)
  window.addEventListener('orientationchange', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('orientationchange', handleResize)
  clearTimeout(resizeTimeout)
})
</script>

<style scoped>
/* ============================================================================
   БАЗОВЫЕ СТИЛИ
   ============================================================================ */
.stats-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  flex-wrap: nowrap;
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: #dcdfe6 transparent;
  padding: 4px 0;
  transition: all 0.3s ease;
}

.stats-container::-webkit-scrollbar {
  height: 4px;
}
.stats-container::-webkit-scrollbar-track {
  background: transparent;
}
.stats-container::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 2px;
}
.stats-container::-webkit-scrollbar-thumb:hover {
  background: #c0c4cc;
}

.stats-group {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
}

/* ============================================================================
   РАЗМЕРЫ ПИЛЮЛЬ
   ============================================================================ */
.stat-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 8px;
  white-space: nowrap;
  background: #f4f6f8;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  transition: all 0.2s ease;
}

.stat-pill:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0,0,0,0.12);
}

/* Размеры */
.pill-normal {
  padding: 6px 12px;
  font-size: 12px;
  gap: 8px;
}

.pill-medium {
  padding: 4px 8px;
  font-size: 11px;
  gap: 6px;
}

.pill-small {
  padding: 3px 6px;
  font-size: 10px;
  gap: 4px;
}

.pill-icon {
  font-size: 14px;
  flex-shrink: 0;
}
.pill-small .pill-icon { font-size: 12px; }

.pill-label {
  font-weight: 500;
  opacity: 0.85;
  flex-shrink: 0;
}

.pill-value {
  font-weight: 700;
  flex-shrink: 0;
}

/* ============================================================================
   МОБИЛЬНЫЕ УСТРОЙСТВА (< 768px)
   ============================================================================ */
@media (max-width: 767px) {
  .stats-container {
    gap: 6px;
    padding: 8px 0;
    -webkit-overflow-scrolling: touch; /* Плавный скролл на iOS */
    scroll-snap-type: x mandatory;
  }

  .stats-group {
    gap: 6px;
    scroll-snap-align: start;
  }

  .type-group {
    display: none !important;
  }

  .stat-pill {
    border-radius: 6px;
  }
}

/* ============================================================================
   ПЛАНШЕТЫ (768px - 991px)
   ============================================================================ */
@media (min-width: 768px) and (max-width: 991px) {
  .stats-container {
    gap: 10px;
  }

  .type-group {
    margin-left: auto;
  }
}

/* ============================================================================
   ДЕСКТОП (>= 992px)
   ============================================================================ */
@media (min-width: 992px) {
  .stats-container {
    overflow-x: visible;
  }
}

/* ============================================================================
   БОЛЬШИЕ ЭКРАНЫ (>= 1400px)
   ============================================================================ */
@media (min-width: 1400px) {
  .stats-container {
    gap: 16px;
  }

  .stat-pill {
    padding: 8px 14px;
    font-size: 13px;
  }
}

/* ============================================================================
   TOUCH-УСТРОЙСТВА
   ============================================================================ */
.is-touch .stat-pill {
  min-height: 36px; /* Удобно для пальца */
  padding-left: 10px;
  padding-right: 10px;
}

/* ============================================================================
   АНИМАЦИИ
   ============================================================================ */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.stat-pill {
  animation: slideIn 0.3s ease-out;
}

/* ============================================================================
   ЦВЕТОВЫЕ АКЦЕНТЫ (уже есть в inline style, но дублируем для hover)
   ============================================================================ */
.type-pill {
  position: relative;
  overflow: hidden;
}

.type-pill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255,255,255,0.1);
  opacity: 0;
  transition: opacity 0.2s;
}

.type-pill:hover::after {
  opacity: 1;
}
</style>
