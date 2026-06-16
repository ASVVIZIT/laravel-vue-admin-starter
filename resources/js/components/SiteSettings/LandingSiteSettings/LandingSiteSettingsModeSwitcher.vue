<template>
  <div class="site-mode-switcher">
    <div class="switcher-header">
      <h2 class="switcher-title">
        <span class="title-icon">⚙️</span>
        Режим работы сайта
      </h2>
      <div class="current-status" :class="currentMode">
        <span class="status-dot"></span>
        {{ currentModeMeta?.label || 'Загрузка...' }}
      </div>
    </div>

    <!-- Кнопки режимов -->
    <div class="mode-buttons">
      <ModeButton
          v-for="mode in modes"
          :key="mode.value"
          :mode="mode"
          :is-active="currentMode === mode.value"
          :disabled="saving"
          @select="handleModeSelect"
      />
    </div>

    <!-- Панель настроек -->
    <div class="settings-panel">
      <transition name="slide-fade" mode="out-in">
        <div :key="currentMode" class="settings-content">

          <MaintenanceEditor
              v-if="currentMode === 'maintenance'"
              :html="maintenanceHtml"
              :saving="saving"
              @save="handleSaveHtml"
          />

          <LandingSelector
              v-else-if="currentMode === 'landing'"
              :landings="landings"
              :selected-id="activeLandingId"
              :loading="landingsLoading"
              :error="landingsError"
              @select="handleSelectLanding"
              @retry="loadLandings"
          />

          <ProductionInfo v-else-if="currentMode === 'production'" />
          <PreviewInfo v-else-if="currentMode === 'preview'" :mode="currentMode" />

        </div>
      </transition>
    </div>

    <!-- Глобальная ошибка -->
    <div v-if="error" class="global-error">
      <span>{{ error }}</span>
      <button class="btn-dismiss" @click="error = null">✕</button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useSiteSettings } from './composables/useSiteSettings'
import { useSiteSettingsLandingList } from './composables/useSiteSettingsLandingList'

import ModeButton from './ui/ModeButton.vue'
import MaintenanceEditor from './ui/MaintenanceEditor.vue'
import LandingSelector from './ui/LandingSelector.vue'
import ProductionInfo from './ui/ProductionInfo.vue'
import PreviewInfo from './ui/PreviewInfo.vue'

const {
  loading, saving, error, currentMode, maintenanceHtml,
  modes, currentModeMeta, fetchSettings, switchMode, saveMaintenanceHtml
} = useSiteSettings()

const { landings, loading: landingsLoading, error: landingsError, fetchLandings } = useSiteSettingsLandingList()

const activeLandingId = ref(null)

onMounted(async () => {
  await fetchSettings()
  if (currentMode.value === 'landing') {
    await loadLandings()
  }
})

async function loadLandings() {
  await fetchLandings()
}

async function handleModeSelect(mode) {
  if (mode === currentMode.value) return

  try {
    error.value = null
    await switchMode(mode)

    if (mode === 'landing') {
      await loadLandings()
    }
  } catch (e) {
    console.error('[ModeSwitch] Error:', e)
  }
}

async function handleSelectLanding(landingId) {
  try {
    activeLandingId.value = landingId
    await switchMode('landing')
  } catch (e) {
    console.error('[LandingSelect] Error:', e)
  }
}

async function handleSaveHtml() {
  try {
    error.value = null
    await saveMaintenanceHtml(maintenanceHtml.value)
  } catch (e) {
    console.error('[SaveHtml] Error:', e)
  }
}
</script>

<style scoped>
.site-mode-switcher {
  padding: 22px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.switcher-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;  /* 🔥 УМЕНЬШЕНО с 28px */
}

.switcher-title {
  font-size: 1.4rem;  /* 🔥 УМЕНЬШЕНО с 1.5rem */
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #fff;
}

.mode-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;  /* 🔥 УМЕНЬШЕНО с 16px */
  margin-bottom: 24px;  /* 🔥 УМЕНЬШЕНО с 28px */
}

.settings-panel {
  background: rgba(0, 0, 0, 0.25);
  border-radius: 14px;
  padding: 20px;  /* 🔥 УМЕНЬШЕНО с 24px */
  border: 1px solid rgba(255, 255, 255, 0.08);
  min-height: 400px;  /* 🔥 УВЕЛИЧЕНО с 320px для большего места */
}

/* SplitPane стили */
.editor-split {
  flex: 1;
  min-height: 550px;  /* 🔥 УВЕЛИЧЕНО с 500px */
  border-radius: 12px;
  overflow: hidden;
}

/* MaintenanceEditor - убираем height: 100% */
.maintenance-editor {
  display: flex;
  flex-direction: column;
  /* height: 100%;  🔥 УДАЛЕНО! */
  min-height: 550px;  /* 🔥 ДОБАВЛЕНО минимальная высота */
}

.code-panel, .preview-panel {
  /* height: 100%;  🔥 УДАЛЕНО! */
  min-height: 550px;  /* 🔥 ДОБАВЛЕНО */
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.3);
}

/* SplitPane */
.pane-left, .pane-right {
  min-height: 550px;  /* 🔥 ДОБАВЛЕНО */
  overflow: auto;
}

/* LandingSelector */
.landing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));  /* 🔥 УМЕНЬШЕНО с 240px */
  gap: 12px;  /* 🔥 УМЕНЬШЕНО с 14px */
}

.landing-card {
  padding: 14px;  /* 🔥 УМЕНЬШЕНО с 18px */
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

/* Production info grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;  /* 🔥 УМЕНЬШЕНО с 16px */
  margin-bottom: 20px;  /* 🔥 УМЕНЬШЕНО с 24px */
}

.info-card {
  padding: 16px;  /* 🔥 УМЕНЬШЕНО с 20px */
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 12px;
  text-align: center;
}

.card-icon {
  font-size: 2rem;  /* 🔥 УМЕНЬШЕНО с 2.5rem */
  margin-bottom: 10px;  /* 🔥 УМЕНЬШЕНО с 12px */
}

.info-card h4 {
  margin: 0 0 6px 0;  /* 🔥 УМЕНЬШЕНО с 8px */
  color: #10b981;
  font-size: 1rem;  /* 🔥 УМЕНЬШЕНО с 1.1rem */
}

.info-card p {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;  /* 🔥 УМЕНЬШЕНО с 0.9rem */
  line-height: 1.4;
}
</style>
