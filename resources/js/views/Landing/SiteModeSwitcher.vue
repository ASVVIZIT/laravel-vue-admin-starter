<template>
  <div class="mode-switcher">
    <h2>Режим работы публичной части</h2>

    <div class="mode-cards">
      <div
          v-for="mode in modes"
          :key="mode.value"
          class="mode-card"
          :class="{ active: currentMode === mode.value }"
          @click="switchMode(mode.value)"
      >
        <div class="mode-icon">{{ mode.icon }}</div>
        <h3 class="mode-title">{{ mode.label }}</h3>
        <p class="mode-desc">{{ mode.desc }}</p>
        <div class="mode-status" :class="{ on: currentMode === mode.value }">
          {{ currentMode === mode.value ? 'Активен' : 'Неактивен' }}
        </div>
      </div>
    </div>

    <div v-if="currentMode === 'landing'" class="landing-selector">
      <label class="selector-label">Выберите лендинг:</label>
      <el-select
          v-model="selectedLandingId"
          size="small"
          @change="applyLanding"
          :loading="loading"
          style="width: 300px;"
      >
        <el-option
            v-for="page in pages"
            :key="page.id"
            :label="page.title"
            :value="page.id"
        />
      </el-select>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { siteModeApi } from '@/components/Landing/services/siteModeApi'
import { landingApi } from '@/components/Landing/api/landingApi'

const currentMode = ref('maintenance')
const selectedLandingId = ref(null)
const pages = ref([])
const loading = ref(false)

const modes = [
  {
    value: 'maintenance',
    icon: '🛠️',
    label: 'Заглушка',
    desc: 'Техработы / В разработке'
  },
  {
    value: 'landing',
    icon: '',
    label: 'Лендинг',
    desc: 'Полноценная страница'
  },
  {
    value: 'production',
    icon: '🚀',
    label: 'Основной сайт',
    desc: 'Полный функционал'
  }
]

onMounted(async () => {
  try {
    const mode = await siteModeApi.getCached()
    currentMode.value = mode.mode
    selectedLandingId.value = mode.active_landing_id

    const response = await landingApi.getList()
    pages.value = response.data || response
  } catch (error) {
    ElMessage.error('Ошибка загрузки настроек')
  }
})

async function switchMode(mode) {
  try {
    await siteModeApi.switch(mode)
    currentMode.value = mode
    ElMessage.success(`Режим переключён на: ${mode}`)
  } catch (error) {
    ElMessage.error('Ошибка переключения режима')
  }
}

async function applyLanding() {
  if (!selectedLandingId.value) return

  loading.value = true
  try {
    await siteModeApi.switch('landing')
    ElMessage.success('Лендинг применён')
  } catch (error) {
    ElMessage.error('Ошибка применения лендинга')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.mode-switcher {
  padding: 16px;
}

.mode-switcher h2 {
  margin: 0 0 16px;
  font-size: 20px;
}

.mode-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.mode-card {
  padding: 20px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.mode-card:hover {
  border-color: rgba(255, 107, 53, 0.5);
  transform: translateY(-2px);
}

.mode-card.active {
  border-color: #ff6b35;
  background: rgba(255, 107, 53, 0.1);
}

.mode-icon {
  font-size: 36px;
  margin-bottom: 12px;
}

.mode-title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 700;
}

.mode-desc {
  margin: 0 0 12px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

.mode-status {
  font-size: 12px;
  font-weight: 600;
}

.mode-status.on {
  color: #00d084;
}

.landing-selector {
  margin-top: 24px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.selector-label {
  font-size: 14px;
  font-weight: 600;
}
</style>
