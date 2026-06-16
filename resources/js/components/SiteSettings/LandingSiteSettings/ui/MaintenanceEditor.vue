<template>
  <div class="maintenance-editor">
    <h3>🚧 Настройки заглушки</h3>

    <SplitPane
        :initial-split="40"
        :min-left="20"
        :min-right="30"
        class="editor-split"
    >
      <template #left>
        <div class="code-panel">
          <div class="panel-header">
            <span class="panel-title">📝 HTML код</span>
            <button
                class="btn-save"
                @click="handleSave"
                :disabled="saving"
                :class="{ 'unchanged': localHtml === html }"
            >
              <span v-if="saving">💾 Сохранение...</span>
              <span v-else-if="localHtml === html">✓ Сохранено</span>
              <span v-else> Сохранить HTML</span>
            </button>
          </div>
          <textarea
              v-model="localHtml"
              class="code-editor"
              spellcheck="false"
              placeholder="Введите HTML код страницы..."
          />
        </div>
      </template>

      <template #right>
        <div class="preview-panel">
          <div class="panel-header">
            <span class="panel-title">👁️ Предпросмотр</span>
            <button class="btn-refresh" @click="refreshPreview">
              🔄 Обновить
            </button>
          </div>
          <div class="preview-container">
            <iframe
                ref="previewFrame"
                :srcdoc="localHtml"
                class="preview-frame"
                sandbox="allow-scripts"
                title="Preview"
            />
          </div>
        </div>
      </template>
    </SplitPane>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import SplitPane from './SplitPane.vue'

const props = defineProps({
  html: { type: String, required: true },
  saving: { type: Boolean, default: false }
})

const emit = defineEmits(['save'])

const localHtml = ref(props.html)

watch(() => props.html, (v) => { localHtml.value = v })

function handleSave() {
  console.log('[MaintenanceEditor] Save clicked, length:', localHtml.value.length)
  emit('save', localHtml.value)
}

function refreshPreview() {
  console.log('[MaintenanceEditor] Refresh preview')
}
</script>

<style scoped>
/* Главный контейнер занимает всю высоту панели */
.maintenance-editor {
  height: 100%;          /* 🔥 КРИТИЧНО: Занять всё доступное место */
  display: flex;
  flex-direction: column;
}

.maintenance-editor h3 {
  margin: 0 0 16px 0;
  font-size: 1.3rem;
  color: #fff;
  flex-shrink: 0; /* Заголовок не сжимается */
}

/* SplitPane растягивается на оставшееся место */
.editor-split {
  flex: 1;               /* 🔥 Занять всё оставшееся место */
  min-height: 0;         /* 🔥 Разрешить сжиматься меньше контента */
  border-radius: 12px;
  overflow: hidden;
}

/* Панели внутри SplitPane */
.code-panel, .preview-panel {
  height: 100%;          /* 🔥 Высота 100% от родителя */
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.3);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.panel-title {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
}

/* Кнопки */
.btn-save {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff;
}

.btn-save:hover:not(:disabled) { transform: translateY(-1px); }
.btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-refresh {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
}

/* Область кода */
.code-editor {
  flex: 1;               /* 🔥 Растянуться на всю высоту */
  padding: 16px;
  background: #1e1e1e;
  color: #d4d4d4;
  border: none;
  resize: none;
  font-family: 'Fira Code', 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.6;
  outline: none;
  overflow-y: auto;
}

/* Область превью */
.preview-container {
  flex: 1;               /* 🔥 Растянуться на всю высоту */
  background: #fff;
  overflow: hidden;
}

.preview-frame {
  width: 100%;
  height: 100%;          /* 🔥 Высота 100% */
  border: none;
  background: #fff;
}
</style>
