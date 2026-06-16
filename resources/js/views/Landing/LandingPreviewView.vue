<template>
  <div class="landing-preview">
    <div class="preview-bar">
      <span class="preview-title">
        Превью: {{ store.currentLanding?.title || 'Загрузка...' }}
      </span>
      <div class="preview-actions">
        <el-button size="small" @click="$router.back()">
          ← Назад
        </el-button>
        <el-button
            v-if="store.currentLanding?.slug"
            size="small"
            type="primary"
            @click="openInNewTab"
        >
          ↗ Открыть в новой вкладке
        </el-button>
      </div>
    </div>

    <div class="preview-frame">
      <div v-if="!store.currentLanding" class="preview-loading">
        Загрузка превью...
      </div>

      <!-- ✅ IFRAME — загружает публичную версию -->
      <iframe
          v-else
          :src="`/l/${store.currentLanding.slug}`"
          class="preview-iframe"
          frameborder="0"
          allow="fullscreen"
          title="Превью лендинга"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useLandingStore } from '@/components/Landing/store/landingStore'

const route = useRoute()
const store = useLandingStore()

onMounted(async () => {
  await store.fetchLanding(route.params.id)
})

const openInNewTab = () => {
  if (store.currentLanding?.slug) {
    window.open(`/l/${store.currentLanding.slug}`, '_blank')
  }
}
</script>

<style scoped>
.landing-preview {
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: #1a1a2e;
}

.preview-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  margin-bottom: 16px;
  color: #fff;
}

.preview-title {
  font-size: 14px;
  font-weight: 600;
}

.preview-actions {
  display: flex;
  gap: 8px;
}

.preview-frame {
  flex: 1;
  background: #0a0e27;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.preview-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(255, 255, 255, 0.6);
}
</style>
