<template>
  <div class="state-container" :style="{ fontSize: debugStore.fontSize + 'px' }">
    <pre v-html="highlightJson(formattedDebugInfo)"></pre>
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

// 🔥 УМНАЯ ВЫЖИМКА: Только то, что нужно для понимания текущего поведения
const debugInfo = computed(() => {
  const tab = logStore.activeTab
  const groupingInfo = settingsStore.getGroupingModeForTabStore(tab)

  return {
    '📌 Текущий контекст': {
      'Вкладка': tab,
      'Загружено записей': logStore.currentLogs.length,
      'Таблица сгруппирована': logStore.isGrouped ? '✅ Да' : '❌ Нет',
      'Текущая страница': logStore.currentPagination.page
    },
    '⚙️ Режим группировки': {
      'Текущий режим': groupingInfo.mode === 'server' ? '🖥 Серверный' : '📱 Фронтенд',
      'Принудительный режим': logStore.currentForcedMode ? (logStore.currentForcedMode === 'server' ? '🖥 Серверный' : '📱 Фrontend') : 'Нет (Авто)',
      'Причина решения': groupingInfo.reason || 'Неизвестно'
    },
    '🎯 Активные фильтры (для этой вкладки)': logStore.currentFilters,
    '🛠 Серверные настройки группировки': {
      'Порог записей для авто': settingsStore.serverSettings.grouping_auto_threshold,
      'Проверка мин. групп включена': settingsStore.serverSettings.enable_min_groups_check ? '✅ Да' : '❌ Нет',
      'Минимум групп для срабатывания': settingsStore.serverSettings.grouping_min_groups,
      'Группировать по полю': settingsStore.serverSettings.grouping_by === 'user' ? 'Пользователь' : (settingsStore.serverSettings.grouping_by === 'exercise' ? 'Упражнение' : 'Дата (месяц)')
    }
  }
})

const formattedDebugInfo = computed(() => JSON.stringify(debugInfo.value, null, 2))

// ============================================================================
// ПОДСВЕТКА JSON СИНТАКСИСА (та же, что и была, для красоты)
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
:deep(.hl-key) { color: #9cdcfe; font-weight: bold; } /* Ключи теперь жирнее для читаемости */
:deep(.hl-string) { color: #ce9178; }
:deep(.hl-number) { color: #b5cea8; }
:deep(.hl-boolean), :deep(.hl-null) { color: #569cd6; }
</style>
