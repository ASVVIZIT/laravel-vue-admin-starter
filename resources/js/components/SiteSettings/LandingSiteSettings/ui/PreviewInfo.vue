<template>
  <div class="settings-section">
    <h3>👁️ Режим предпросмотра</h3>
    <div class="info-box warning">
      <span class="info-icon">⚠️</span>
      <p>Этот режим виден только авторизованным пользователям. Обычные посетители видят выбранный выше режим.</p>
    </div>
    <div class="preview-url">
      <label>URL для предпросмотра:</label>
      <div class="url-input-group">
        <input type="text" :value="previewUrl" readonly class="url-input" />
        <button class="btn-copy" @click="copyUrl">{{ copied ? '✓ Скопировано' : '📋 Копировать' }}</button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
const props = defineProps({ mode: { type: String, required: true } })
const copied = ref(false)
const previewUrl = computed(() => `${window.location.origin}/?preview=true&mode=${props.mode}`)
async function copyUrl() {
  try {
    await navigator.clipboard.writeText(previewUrl.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch (e) { console.error('Ошибка копирования:', e) }
}
</script>
<style scoped>
.settings-section h3 { font-size: 1.25rem; margin: 0 0 20px 0; color: #fff; }
.info-box { display: flex; gap: 12px; padding: 16px; border-radius: 12px; margin-bottom: 20px; }
.info-box.warning { background: rgba(243, 156, 18, 0.1); border-color: rgba(243, 156, 18, 0.3); }
.info-icon { font-size: 1.5rem; }
.info-box p { margin: 0; color: rgba(255, 255, 255, 0.8); line-height: 1.5; }
.preview-url label { display: block; margin-bottom: 8px; font-weight: 600; color: rgba(255, 255, 255, 0.8); }
.url-input-group { display: flex; gap: 8px; }
.url-input { flex: 1; padding: 12px 16px; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; color: #fff; font-family: monospace; font-size: 0.875rem; }
.btn-copy { padding: 12px 20px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 10px; color: #fff; cursor: pointer; font-weight: 600; transition: all 0.3s ease; white-space: nowrap; }
.btn-copy:hover { background: rgba(255, 255, 255, 0.15); }
</style>
