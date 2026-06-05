<template>
  <div class="state-container" :style="{ fontSize: debugStore.fontSize + 'px' }">
    <pre v-html="highlightJson(formattedStoreState)"></pre>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTrainingDebugStore } from '@/components/Training/stores/trainingDebugStore.js'
import { useTrainingLogStore } from '@/components/Training/stores/trainingLogStore.js'
import { useTrainingSettingsStore } from '@/components/Training/stores/trainingSettingsStore.js'

const debugStore = useTrainingDebugStore()
const logStore = useTrainingLogStore()
const settingsStore = useTrainingSettingsStore()

// Собираем самое важное из сторов для быстрой проверки
const storeState = computed(() => ({
  activeTab: logStore.activeTab,
  currentFilters: logStore.currentFilters,
  currentPagination: logStore.currentPagination,
  isGrouped: logStore.isGrouped,
  logsCount: logStore.currentLogs.length,
  settings: {
    groupingMode: settingsStore.getGroupingModeForTabStore(logStore.activeTab),
    columns: settingsStore.getColumnsForTabStore(logStore.activeTab)
  }
}))

const formattedStoreState = computed(() => JSON.stringify(storeState.value, null, 2))

// ============================================================================
// ПОДСВЕТКА JSON СИНТАКСИСА
// ============================================================================
const escapeHtml = (unsafe) => {
  return String(unsafe)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
}

const highlightJson = (jsonString) => {
  if (!jsonString) return ''
  let html = escapeHtml(jsonString)

  // Магический regex для разбора JSON структур
  html = html.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      function (match) {
        let cls = 'hl-number'
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'hl-key'
          } else {
            cls = 'hl-string'
          }
        } else if (/true|false/.test(match)) {
          cls = 'hl-boolean'
        } else if (/null/.test(match)) {
          cls = 'hl-null'
        }
        return '<span class="' + cls + '">' + match + '</span>'
      }
  )
  return html
}
</script>

<style scoped>
.state-container {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  background: rgba(20, 20, 20, 0.5);
  min-height: 0;
  line-height: 1.5;
}

.state-container::-webkit-scrollbar { width: 8px; }
.state-container::-webkit-scrollbar-track { background: transparent; }
.state-container::-webkit-scrollbar-thumb {
  background: #424242;
  border-radius: 4px;
  border: 2px solid #1e1e1e;
}
.state-container::-webkit-scrollbar-thumb:hover { background: #4ec9b0; }

.state-container pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: inherit;
  font-size: 0.95em;
  line-height: 1.5;
}

/* 🔥 ЦВЕТА ПОДСВЕТКИ СИНТАКСИСА (VS Code Dark+ Theme) */
:deep(.hl-key) { color: #9cdcfe; }
:deep(.hl-string) { color: #ce9178; }
:deep(.hl-number) { color: #b5cea8; }
:deep(.hl-boolean), :deep(.hl-null) { color: #569cd6; }
</style>
