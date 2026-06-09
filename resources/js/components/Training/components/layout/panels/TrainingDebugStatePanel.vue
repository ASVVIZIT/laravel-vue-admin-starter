<template>
  <div class="state-container" :style="{ fontSize: debugStore.fontSize + 'px' }" ref="containerRef">
    <pre ref="preRef" class="json-pre">
      <div v-for="(line, index) in highlightedLines" :key="index" class="json-line-wrapper">
        <span
            :class="['json-line', getLineHighlightClass(index)]"
            :data-line="index"
            v-html="highlightLine(line)"
        ></span>
        <!-- 🔥 Номер изменения (если есть) -->
        <span v-if="getChangeNumber(index)" class="change-number">
          {{ getChangeNumber(index) }}
        </span>
      </div>
    </pre>

    <!-- Индикатор последних изменений -->
    <div v-if="recentChanges.length > 0" class="changes-indicator">
      <div class="indicator-header">
        <span class="indicator-title"> История изменений ({{ recentChanges.length }})</span>
        <el-button
            size="small"
            type="danger"
            text
            @click="clearAllHighlights"
            class="clear-btn"
            title="Убрать всю подсветку"
        >
          🗑 Очистить
        </el-button>
      </div>
      <div class="changes-list">
        <div
            v-for="(change, idx) in recentChanges"
            :key="idx"
            class="change-item"
            :class="`change-level-${getChangeLevel(idx)}`"
            @click="scrollToChange(idx)"
        >
          <span class="change-number-badge">{{ idx + 1 }}</span>
          <div class="change-content">
            <span class="change-time">{{ change.time }}</span>
            <span class="change-path">{{ change.path }}</span>
            <span class="change-value">{{ change.newValue }}</span>
          </div>
        </div>
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
const MAX_DEPTH = 5

// 🔥 Map: lineIndex → changeIndex (0, 1, 2, 3...)
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
    // 🔥 Добавляем ВСЕ изменения (без лимита)
    recentChanges.value.unshift(...changes.map(change => ({
      ...change,
      time: new Date().toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    })))

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
    ' Текущий контекст': {
      'Вкладка': tab,
      'Загружено записей': logStore.currentLogs.length,
      'Таблица сгруппирована': logStore.isGrouped ? '✅ Да' : '❌ Нет',
      'Текущая страница': logStore.currentPagination.page
    },
    '⚙️ Режим группировки': {
      'Текущий режим': groupingInfo.mode === 'server' ? ' Серверный' : '📱 Фронтенд',
      'Принудительный режим': logStore.currentForcedMode ? (logStore.currentForcedMode === 'server' ? ' Серверный' : '📱 Фронтенд') : 'Нет (Авто)',
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
    '🔍 Поиск': {
      'Лимиты поиска': snapshot.search?.limits || {}
    },
    '📊 Отображение': {
      'Server настройки': snapshot.display?.server || {},
      'Лимиты': snapshot.display?.limits || {}
    },
    ' Группировки': snapshot.grouping || {}
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
// Подсветка измененных строк (ПОСТОЯННАЯ)
// ============================================================================
const updateLineHighlighting = () => {
  if (recentChanges.value.length === 0) {
    changedLinesMap.value = new Map()
    return
  }

  const jsonText = formattedDebugInfo.value
  const lines = jsonText.split('\n')
  const changedMap = new Map()

  // 🔥 Проходим по ВСЕМ изменениям (в обратном порядке, чтобы последние были сверху)
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

// 🔥 Получаем класс подсветки (без автоматического удаления)
const getLineHighlightClass = (lineIndex) => {
  const changeIndex = changedLinesMap.value.get(lineIndex)
  if (changeIndex === undefined) return ''

  // 🔥 Цвет зависит от "возраста" изменения
  const age = changeIndex // 0 = самое новое, 1 = предыдущее, и т.д.

  if (age === 0) return 'highlight-latest'      // Зеленый
  if (age === 1) return 'highlight-second'      // Оранжевый
  if (age === 2) return 'highlight-third'       // Желтый
  if (age < 5) return 'highlight-recent'        // Светло-зеленый
  if (age < 10) return 'highlight-old'          // Серый

  return 'highlight-ancient'                    // Очень бледный
}

// 🔥 Получаем номер изменения для отображения
const getChangeNumber = (lineIndex) => {
  const changeIndex = changedLinesMap.value.get(lineIndex)
  if (changeIndex === undefined) return null
  return changeIndex + 1 // Нумерация с 1
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

  // 🔥 Временная анимация (только для скролла, не убирает подсветку)
  targetLine.classList.add('scroll-target')
  setTimeout(() => {
    targetLine.classList.remove('scroll-target')
  }, 2000)
}

// 🔥 Скролл к конкретному изменению по клику
const scrollToChange = (changeIndex) => {
  const preElement = preRef.value
  if (!preElement) return

  const lines = preElement.querySelectorAll('.json-line-wrapper')
  if (!lines || lines.length === 0) return

  // Находим строку с этим changeIndex
  let targetLine = null
  changedLinesMap.value.forEach((idx, lineIdx) => {
    if (idx === changeIndex && lines[lineIdx]) {
      targetLine = lines[lineIdx]
    }
  })

  if (targetLine) {
    targetLine.scrollIntoView({ behavior: 'smooth', block: 'center' })
    targetLine.classList.add('scroll-target')
    setTimeout(() => {
      targetLine.classList.remove('scroll-target')
    }, 2000)
  }
}

// ============================================================================
// Очистка всей подсветки
// ============================================================================
const clearAllHighlights = () => {
  changedLinesMap.value = new Map()
  recentChanges.value = []
}

// ============================================================================
// Утилиты
// ============================================================================
const getChangeLevel = (idx) => {
  if (idx === 0) return 0
  if (idx === 1) return 1
  if (idx === 2) return 2
  return 3
}

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
  html = html.replace(/"([^"]+)":/g, '<span class="hl-key">"$1"</span>:')
  html = html.replace(/"([^"]*)"/g, '<span class="hl-string">"$1"</span>')
  html = html.replace(/\b(\d+\.?\d*)\b/g, '<span class="hl-number">$1</span>')
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
  line-height: 1.1;
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

.json-pre {
  margin: 0;
  padding: 0;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.9em;
  line-height: 1.0;
  white-space: pre;
  overflow: visible;
}

.json-line-wrapper {
  display: flex;
  align-items: center;
  min-height: 1.0em;
  padding: 0 4px;
  border-radius: 2px;
  transition: background-color 0.3s ease;
  gap: 4px; /* 🔥 Отступ между текстом и номером */
}

.json-line {
  flex: 1;
  white-space: pre;
  font-family: inherit;
  line-height: 1.0;
  min-width: 0; /* 🔥 Позволяет тексту сжиматься, не ломая flex */
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 🔥 Номер как часть строки, а не поверх */
.change-number {
  flex-shrink: 0; /* 🔥 Не сжимается */
  height: 1.0em; /* 🔥 Высота = высоте строки */
  line-height: 1.0em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(78, 201, 176, 0.25);
  color: #4ec9b0;
  font-size: 0.75em;
  font-weight: bold;
  padding: 0 5px;
  border-radius: 2px;
  min-width: 18px;
  font-family: 'Consolas', 'Monaco', monospace;
}

/* ============================================================================
   ПОДСВЕТКА ИЗМЕНЕНИЙ (ПОСТОЯННАЯ)
   ============================================================================ */

/* Самое новое изменение — ярко-зеленый */
.json-line-wrapper.highlight-latest {
  background: rgba(78, 201, 176, 0.3) !important;
  border-left: 3px solid #4ec9b0;
}

/* Второе — оранжевый */
.json-line-wrapper.highlight-second {
  background: rgba(255, 165, 0, 0.25) !important;
  border-left: 3px solid #ffa500;
}

/* Третье — желтый */
.json-line-wrapper.highlight-third {
  background: rgba(255, 255, 0, 0.2) !important;
  border-left: 3px solid #ffff00;
}

/* 4-5 — светло-зеленый */
.json-line-wrapper.highlight-recent {
  background: rgba(78, 201, 176, 0.15) !important;
  border-left: 3px solid rgba(78, 201, 176, 0.5);
}

/* 6-10 — серый */
.json-line-wrapper.highlight-old {
  background: rgba(255, 255, 255, 0.08) !important;
  border-left: 3px solid #888;
}

/* 11+ — очень бледный */
.json-line-wrapper.highlight-ancient {
  background: rgba(255, 255, 255, 0.03) !important;
  border-left: 3px solid #555;
}

/* Анимация скролла (временная) */
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

/* Подсветка синтаксиса */
:deep(.hl-key) { color: #9cdcfe; font-weight: bold; }
:deep(.hl-string) { color: #ce9178; }
:deep(.hl-number) { color: #b5cea8; }
:deep(.hl-boolean) { color: #569cd6; }

/* ============================================================================
   ИНДИКАТОР ИЗМЕНЕНИЙ
   ============================================================================ */
.changes-indicator {
  position: sticky;
  bottom: 0;
  background: rgba(30, 30, 30, 0.98);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px;
  margin-top: 8px;
  border-radius: 4px;
  backdrop-filter: blur(8px);
  max-height: 200px;
  overflow-y: auto;
}

.indicator-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.indicator-title {
  font-size: 0.85em;
  color: #858585;
  font-weight: 600;
}

.clear-btn {
  color: #f48771 !important;
  font-size: 0.85em;
}

.clear-btn:hover {
  color: #ff6b6b !important;
  background: rgba(244, 135, 113, 0.1);
}

.changes-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.change-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  border-radius: 3px;
  font-size: 0.85em;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 3px solid;
}

.change-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(2px);
}

.change-number-badge {
  background: rgba(78, 201, 176, 0.3);
  color: #4ec9b0;
  font-weight: bold;
  font-size: 0.9em;
  padding: 2px 6px;
  border-radius: 3px;
  min-width: 20px;
  text-align: center;
}

.change-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
}

.change-level-0 { border-left-color: #4ec9b0; background: rgba(78, 201, 176, 0.1); }
.change-level-1 { border-left-color: #ffa500; background: rgba(255, 165, 0, 0.08); }
.change-level-2 { border-left-color: #ffff00; background: rgba(255, 255, 0, 0.05); }
.change-level-3 { border-left-color: #888; background: rgba(255, 255, 255, 0.03); }

.change-time {
  color: #858585;
  font-size: 0.85em;
}

.change-path {
  color: #9cdcfe;
  font-family: monospace;
  font-size: 0.9em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.change-value {
  color: #d4d4d4;
  font-size: 0.85em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
