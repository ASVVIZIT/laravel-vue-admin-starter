<template>
  <div class="public-landing">
    <!-- Загрузка -->
    <div v-if="loading" class="loading-state">
      <el-icon class="is-loading" :size="32"><Loading /></el-icon>
      <p>Загрузка страницы...</p>
    </div>

    <!-- Ошибка -->
    <div v-else-if="error" class="error-state">
      <el-icon :size="48" color="#ff4757"><CircleClose /></el-icon>
      <h2>{{ error }}</h2>
    </div>

    <!-- Лендинг -->
    <template v-else-if="landing">
      <DynamicBlockRenderer
          v-for="block in sortedBlocks"
          :key="block.id"
          :block="block"
          class="landing-block"
      />

      <!-- ✅ Отступ снизу -->
      <div class="landing-footer-spacer"></div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Loading, CircleClose } from '@element-plus/icons-vue'
import DynamicBlockRenderer from '@/components/Landing/common/DynamicBlockRenderer.vue'
import { landingApi } from '@/components/Landing/api/landingApi'

const route = useRoute()
const loading = ref(true)
const error = ref(null)
const landing = ref(null)

const sortedBlocks = computed(() => {
  if (!landing.value?.blocks) return []
  return [...landing.value.blocks]
      .filter(block => block.enabled !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
})

onMounted(async () => {
  try {
    loading.value = true
    error.value = null

    const slug = route.params.slug

    if (!slug) {
      error.value = 'Не указан slug лендинга'
      return
    }

    const response = await landingApi.getPublic(slug)
    landing.value = response.data || response

  } catch (err) {
    console.error('Error fetching landing:', err)
    error.value = err.message || 'Ошибка загрузки лендинга'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.public-landing {
  min-height: 100vh;
  background: #0a0e27;
  color: #fff;

  /* ✅ Плавная прокрутка */
  scroll-behavior: smooth;

  /* ✅ Увеличиваем тело страницы */
  padding-bottom: 100px;
}

/* ✅ Отступ снизу для лучшего вида */
.landing-footer-spacer {
  height: 150px;
  background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.3));
}

/* ✅ Анимация появления блоков */
.landing-block {
  opacity: 0;
  animation: fadeInUp 0.6s ease-out forwards;
}

.landing-block:nth-child(1) { animation-delay: 0.1s; }
.landing-block:nth-child(2) { animation-delay: 0.2s; }
.landing-block:nth-child(3) { animation-delay: 0.3s; }
.landing-block:nth-child(4) { animation-delay: 0.4s; }
.landing-block:nth-child(5) { animation-delay: 0.5s; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  text-align: center;
  gap: 1rem;
}

.error-state h2 {
  color: #ff4757;
  font-size: 1.5rem;
}

/* ✅ Кастомный скроллбар */
.public-landing::-webkit-scrollbar {
  width: 10px;
}

.public-landing::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.public-landing::-webkit-scrollbar-thumb {
  background: rgba(255, 107, 53, 0.5);
  border-radius: 5px;
}

.public-landing::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 107, 53, 0.8);
}
</style>
