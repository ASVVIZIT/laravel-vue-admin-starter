<template>
  <div class="state-container" :style="{ fontSize: debugStore.fontSize + 'px' }" ref="containerRef">
    <pre ref="preRef" class="json-pre">
      <div v-for="(line, index) in highlightedLines" :key="index" class="json-line-wrapper">
        <span
            :class="['json-line', getLineHighlightClass(index)]"
            :data-line="index"
            v-html="highlightLine(line)"
        ></span>
      </div>
    </pre>

    <!-- Индикатор последних изменений -->
    <div v-if="recentChanges.length > 0" class="changes-indicator">
      <div class="indicator-title">Последние изменения:</div>
      <div
          v-for="(change, idx) in recentChanges"
          :key="idx"
          class="change-item"
          :class="`change-level-${idx}`"
      >
        <span class="change-time">{{ change.time }}</span>
        <span class="change-path">{{ change.path }}</span>
        <span class="change-value">{{ change.newValue }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, nextTick, onMounted } from 'vue'
import { useTrainingDebugStore } from '@/components/Training/stores/trainingDebugStore.js'
import { useTrainingLogStore } from '@/components/Training/stores/trainingLogStore.js'
import { useTrainingSettingsStore } from '@/components/Training/stores/trainingSettingsStore.js'

const debugStore = useTrainingDebugStore()
const logStore = useTrainingLogStore()
const settingsStore = useTrainingSettingsStore()

const containerRef = ref(null)
const preRef = ref(null)
const highlightedLines = ref([])
const recentChanges = ref([])
const MAX_RECENT_CHANGES = 3
const MAX_DEPTH = 5

const changedLinesMap = ref(new Map())

// ============================================================================
// Отслеживание изменений настроек
// ============================================================================
const previousSettings = ref(null)

const settingsJson = computed(() =>
    JSON.stringify(settingsStore.settingsDebugSnapshot || {})
)

const trackSettingsChanges = () => {
  const currentSettings = JSON.parse(settingsJson.value)

  if (!previousSettings.value) {
    previousSettings.value = currentSettings
    return
  }

  const changes = findChanges(previousSettings.value, currentSettings, '')

  if (changes.length > 0) {
    recentChanges.value.unshift(...changes.map(change => ({
      ...change,
      time: new Date().toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    })))

    recentChanges.value = recentChanges.value.slice(0, MAX_RECENT_CHANGES)
    previousSettings.value = currentSettings

    nextTick(() => {
      updateLineHighlighting()
      scrollToFirstChange()
    })
  }
}

const findChanges = (oldObj, newObj, path = '') => {
  const changes = []

  if (typeof oldObj !== 'object' || oldObj === null ||
      typeof newObj !== 'object' || newObj === null) {
    if (oldObj !== newObj) {
      changes.push({
        path: path || 'root',
        oldValue: oldObj,
        newValue: newObj
      })
    }
    return changes
  }

  const depth = path.split('.').length
  if (depth > MAX_DEPTH) return changes

  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)])

  allKeys.forEach(key => {
    const newPath = path ? `${path}.${key}` : key
    const oldVal = oldObj[key]
    const newVal = newObj[key]

    if (oldVal === undefined && newVal !== undefined) {
      changes.push({ path: newPath, oldValue: 'не было', newValue: newVal })
    } else if (oldVal !== undefined && newVal === undefined) {
      changes.push({ path: newPath, oldValue: oldVal, newValue: 'удалено' })
    } else if (typeof oldVal === 'object' && typeof newVal === 'object' &&
        oldVal !== null && newVal !== null) {
      changes.push(...findChanges(oldVal, newVal, newPath))
    } else if (oldVal !== newVal) {
      changes.push({ path: newPath, oldValue: oldVal, newValue: newVal })
    }
  })

  return changes
}

watch(
    settingsJson,
    (newVal, oldVal) => {
      if (newVal !== oldVal) {
        trackSettingsChanges()
      }
    }
)

// ============================================================================
// Форматирование JSON построчно
// ============================================================================
const contextDebugInfo = computed(() => {
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
      'Принудительный режим': logStore.currentForcedMode ? (logStore.currentForcedMode === 'server' ? '🖥 Серверный' : '📱 Фронтенд') : 'Нет (Авто)',
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

const settingsConfigInfo = computed(() => {
  const snapshot = settingsStore.settingsDebugSnapshot || {}

  return {
    '📦 Мета-настройки формы': snapshot.meta || {},
    '🎨 Интерфейс': {
      'Frontend настройки': snapshot.interface?.frontend || {},
      'Колонки таблицы': snapshot.interface?.columns || {}
    },
    ' Поиск': {
      'Лимиты поиска': snapshot.search?.limits || {}
    },
    '📊 Отображение': {
      'Server настройки': snapshot.display?.server || {},
      'Лимиты': snapshot.display?.limits || {}
    },
    '🗂 Группировки': snapshot.grouping || {}
  }
})

const fullDebugInfo = computed(() => ({
  ...contextDebugInfo.value,
  '════════════════════': {},
  '⚙️ КОНФИГУРАЦИЯ НАСТРОЕК': settingsConfigInfo.value
}))

const formattedDebugInfo = computed(() => JSON.stringify(fullDebugInfo.value, null, 2))

watch(formattedDebugInfo, (newJson) => {
  highlightedLines.value = newJson.split('\n')
}, { immediate: true })

// ============================================================================
// Подсветка измененных строк
// ============================================================================
const updateLineHighlighting = () => {
  if (recentChanges.value.length === 0) {
    changedLinesMap.value = new Map()
    return
  }

  const jsonText = formattedDebugInfo.value
  const lines = jsonText.split('\n')
  const changedMap = new Map()

  recentChanges.value.forEach((change, changeIdx) => {
    const pathParts = change.path.split('.')
    const searchKey = pathParts[pathParts.length - 1]

    lines.forEach((line, lineIdx) => {
      if (line.includes(`"${searchKey}"`) && !changedMap.has(lineIdx)) {
        changedMap.set(lineIdx, changeIdx)
      }
    })
  })

  changedLinesMap.value = changedMap
}

const getLineHighlightClass = (lineIndex) => {
  const changeIndex = changedLinesMap.value.get(lineIndex)
  if (changeIndex === undefined) return ''

  if (changeIndex === 0) return 'highlight-latest'
  if (changeIndex === 1) return 'highlight-second'
  if (changeIndex === 2) return 'highlight-third'

  return 'highlight-old'
}

// ============================================================================
// Автоскролл к первому изменению
// ============================================================================
const scrollToFirstChange = () => {
  if (!containerRef.value || changedLinesMap.value.size === 0) return

  let firstChangedLine = null
  let minChangeIndex = Infinity

  changedLinesMap.value.forEach((changeIdx, lineIdx) => {
    if (changeIdx < minChangeIndex) {
      minChangeIndex = changeIdx
      firstChangedLine = lineIdx
    }
  })

  if (firstChangedLine === null) return

  const preElement = preRef.value
  if (!preElement) return

  const lines = preElement.querySelectorAll('.json-line-wrapper')
  if (!lines || lines.length === 0) return

  const targetLine = lines[firstChangedLine]
  if (!targetLine) return

  targetLine.scrollIntoView({ behavior: 'smooth', block: 'center' })
  targetLine.classList.add('scroll-target')
  setTimeout(() => {
    targetLine.classList.remove('scroll-target')
  }, 2000)
}

// ============================================================================
// Подсветка синтаксиса
// ============================================================================
const escapeHtml = (unsafe) => {
  if (typeof unsafe !== 'string') return String(unsafe)
  return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
}

const highlightLine = (line) => {
  let html = escapeHtml(line)

  // Ключи
  html = html.replace(/"([^"]+)":/g, '<span class="hl-key">"$1"</span>:')
  // Строки
  html = html.replace(/"([^"]*)"/g, '<span class="hl-string">"$1"</span>')
  // Числа
  html = html.replace(/\b(\d+\.?\d*)\b/g, '<span class="hl-number">$1</span>')
  // Boolean/null
  html = html.replace(/\b(true|false|null)\b/g, '<span class="hl-boolean">$1</span>')

  return html
}

onMounted(() => {
  highlightedLines.value = formattedDebugInfo.value.split('\n')
})
</script>

<style scoped>
.state-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px;
  background: rgba(20, 20, 20, 0.5);
  min-height: 0;
  line-height: 1.4;
  width: 100%;
  box-sizing: border-box;
  position: relative;
}

.state-container::-webkit-scrollbar { width: 8px; }
.state-container::-webkit-scrollbar-track { background: transparent; }
.state-container::-webkit-scrollbar-thumb {
  background: #424242;
  border-radius: 4px;
  border: 2px solid #1e1e1e;
}
.state-container::-webkit-scrollbar-thumb:hover { background: #4ec9b0; }

/* 🔥 ИСПРАВЛЕНО: Убираем лишние отступы */
.json-pre {
  margin: 0;
  padding: 0;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.9em;
  line-height: 0.4;
  white-space: pre;
  overflow: visible;
}

/* 🔥 ИСПРАВЛЕНО: Убираем display: block, используем flex для выравнивания */
.json-line-wrapper {
  display: flex;
  align-items: center;
  min-height: 1.4em; /* Высота строки */
  padding: 0 4px;
  border-radius: 2px;
  transition: background-color 0.3s ease;
}

/* 🔥 ИСПРАВЛЕНО: Убираем display: block */
.json-line {
  flex: 1;
  white-space: pre;
  font-family: inherit;
}

/* Подсветка изменений */
.json-line-wrapper.highlight-latest {
  background: rgba(78, 201, 176, 0.3) !important;
  border-left: 3px solid #4ec9b0;
  animation: highlightPulse 2s ease-in-out;
}

.json-line-wrapper.highlight-second {
  background: rgba(255, 165, 0, 0.2) !important;
  border-left: 3px solid #ffa500;
}

.json-line-wrapper.highlight-third {
  background: rgba(255, 255, 0, 0.15) !important;
  border-left: 3px solid #ffff00;
}

.json-line-wrapper.highlight-old {
  background: rgba(255, 255, 255, 0.05) !important;
  border-left: 3px solid #888;
}

@keyframes highlightPulse {
  0% { background: rgba(78, 201, 176, 0.5); }
  50% { background: rgba(78, 201, 176, 0.2); }
  100% { background: rgba(78, 201, 176, 0.3); }
}

.scroll-target {
  box-shadow: 0 0 10px rgba(78, 201, 176, 0.8);
  transform: scale(1.02);
  transition: all 0.3s ease;
}

/* 🔥 ИСПРАВЛЕНО: Используем :deep() для v-html контента */
:deep(.hl-key) { color: #9cdcfe; font-weight: bold; }
:deep(.hl-string) { color: #ce9178; }
:deep(.hl-number) { color: #b5cea8; }
:deep(.hl-boolean) { color: #569cd6; }

/* Индикатор изменений */
.changes-indicator {
  position: sticky;
  bottom: 0;
  background: rgba(30, 30, 30, 0.95);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px;
  margin-top: 8px;
  border-radius: 4px;
  backdrop-filter: blur(8px);
}

.indicator-title {
  font-size: 0.85em;
  color: #858585;
  margin-bottom: 6px;
  font-weight: 600;
}

.change-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px 6px;
  margin-bottom: 4px;
  border-radius: 3px;
  font-size: 0.85em;
  border-left: 3px solid;
}

.change-level-0 {
  background: rgba(78, 201, 176, 0.15);
  border-left-color: #4ec9b0;
}

.change-level-1 {
  background: rgba(255, 165, 0, 0.1);
  border-left-color: #ffa500;
}

.change-level-2 {
  background: rgba(255, 255, 0, 0.08);
  border-left-color: #ffff00;
}

.change-time {
  color: #858585;
  font-size: 0.9em;
}

.change-path {
  color: #9cdcfe;
  font-family: monospace;
  font-size: 0.95em;
}

.change-value {
  color: #d4d4d4;
  font-size: 0.9em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
