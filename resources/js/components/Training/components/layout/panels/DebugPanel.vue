<template>
  <div v-if="debugStore.isVisible" class="debug-panel">

    <!-- 1. ШАПКА: Фиксированный размер шрифта (11px) -->
    <div class="debug-header">
      <span class="debug-title">🐞 Training Debug</span>
      <div class="debug-actions">
        <el-button size="small" circle @click="copyState" title="Скопировать состояние">📋</el-button>
        <el-button size="small" circle @click="debugStore.clearLogs" title="Очистить логи">🗑</el-button>
        <el-button size="small" circle @click="debugStore.toggleVisibility" title="Закрыть (Ctrl+Shift+D)">
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 2. ВКЛАДКИ -->
    <el-tabs v-model="activeTab" class="debug-tabs">

      <!-- Вкладка: Логи -->
      <el-tab-pane label="Логи" name="logs" class="debug-tab-pane">
        <!-- 🔥 Динамический размер шрифта ТОЛЬКО для контента -->
        <div class="logs-container" ref="logsContainerRef" @scroll="handleScroll" :style="{ fontSize: debugStore.fontSize + 'px' }">
          <div v-for="log in debugStore.logs" :key="log.id" :class="['log-item', `log-${log.type}`]">
            <span class="log-time">{{ log.timestamp }}</span>
            <span class="log-type">[{{ log.type.toUpperCase() }}]</span>
            <!-- Подсветка синтаксиса для сообщений логов -->
            <span class="log-message" v-html="highlightCode(log.message)"></span>
            <el-button
                v-if="log.data"
                size="small"
                text
                class="log-copy-btn"
                @click="copyToClipboard(log.data)"
                title="Копировать данные"
            >📋</el-button>
          </div>
          <div v-if="debugStore.logs.length === 0" class="empty-logs">
            Нет событий. Начните взаимодействовать с интерфейсом.
          </div>
        </div>

        <div v-if="showNewLogsIndicator" class="new-logs-indicator" @click="scrollToBottom">
          ↓ Новые: {{ newLogsCount }}
        </div>
      </el-tab-pane>

      <!-- Вкладка: Состояние -->
      <el-tab-pane label="Состояние" name="state" class="debug-tab-pane">
        <!-- 🔥 Динамический размер шрифта ТОЛЬКО для контента -->
        <div class="state-container" :style="{ fontSize: debugStore.fontSize + 'px' }">
          <!-- Подсветка синтаксиса для JSON -->
          <pre v-html="highlightJson(formattedStoreState)"></pre>
        </div>
      </el-tab-pane>

    </el-tabs>

    <!-- 3. ФУТЕР: Фиксированный размер шрифта (11px) -->
    <div class="debug-footer">
      <div class="control-group">
        <span class="control-label">Шрифт</span>
        <div class="control-buttons">
          <el-button size="small" text @click="debugStore.decreaseFontSize()" :disabled="debugStore.fontSize <= debugStore.MIN_FONT_SIZE" title="Уменьшить">A-</el-button>
          <span class="control-value" @click="debugStore.resetFontSize()" title="Сбросить к 9px">{{ debugStore.fontSize }}</span>
          <el-button size="small" text @click="debugStore.increaseFontSize()" :disabled="debugStore.fontSize >= debugStore.MAX_FONT_SIZE" title="Увеличить">A+</el-button>
        </div>
      </div>

      <div class="control-group">
        <span class="control-label">Высота</span>
        <div class="control-buttons">
          <el-button size="small" text @click="debugStore.decreaseHeight()" :disabled="debugStore.panelHeight <= debugStore.MIN_HEIGHT" title="Уменьшить">H-</el-button>
          <span class="control-value" @click="debugStore.resetHeight()" title="Сбросить к 40vh">{{ debugStore.panelHeight }}</span>
          <el-button size="small" text @click="debugStore.increaseHeight()" :disabled="debugStore.panelHeight >= debugStore.MAX_HEIGHT" title="Увеличить">H+</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useTrainingDebugStore } from '@/components/Training/stores/trainingDebugStore.js'
import { useTrainingLogStore } from '@/components/Training/stores/trainingLogStore.js'
import { useTrainingSettingsStore } from '@/components/Training/stores/trainingSettingsStore.js'

const debugStore = useTrainingDebugStore()
const logStore = useTrainingLogStore()
const settingsStore = useTrainingSettingsStore()

const activeTab = ref('logs')
const logsContainerRef = ref(null)

const isUserScrolledUp = ref(false)
const showNewLogsIndicator = ref(false)
const newLogsCount = ref(0)
const SCROLL_THRESHOLD = 30

const isAtBottom = () => {
  const el = logsContainerRef.value
  if (!el) return true
  return el.scrollHeight - el.scrollTop - el.clientHeight < SCROLL_THRESHOLD
}

const handleScroll = () => {
  const atBottom = isAtBottom()
  isUserScrolledUp.value = !atBottom
  if (atBottom) {
    showNewLogsIndicator.value = false
    newLogsCount.value = 0
  }
}

const scrollToBottom = (behavior = 'smooth') => {
  const el = logsContainerRef.value
  if (!el) return
  el.scrollTo({ top: el.scrollHeight, behavior })
  isUserScrolledUp.value = false
  showNewLogsIndicator.value = false
  newLogsCount.value = 0
}

watch(
    () => debugStore.logs.length,
    (newLength, oldLength) => {
      if (newLength === oldLength) return
      nextTick(() => {
        if (isUserScrolledUp.value) {
          newLogsCount.value += (newLength - oldLength)
          showNewLogsIndicator.value = true
        } else {
          scrollToBottom('auto')
        }
      })
    }
)

watch(activeTab, () => {
  if (activeTab.value === 'logs') nextTick(() => scrollToBottom('auto'))
})

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
// 🔥 КАСТОМНАЯ ПОДСВЕТКА СИНТАКСИСА (Без внешних библиотек)
// ============================================================================

// 1. Экранирование HTML для защиты от XSS
const escapeHtml = (unsafe) => {
  return String(unsafe)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
}

// 2. Подсветка JSON (для вкладки "Состояние")
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

// 3. Упрощенная подсветка для текстовых логов (выделяет числа, булевы значения и строки в кавычках)
const highlightCode = (text) => {
  if (!text) return ''
  let html = escapeHtml(text)

  // Выделяем строки в кавычках
  html = html.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, '<span class="hl-string">$1</span>')
  // Выделяем числа
  html = html.replace(/\b(\d+\.?\d*)\b/g, '<span class="hl-number">$1</span>')
  // Выделяем true/false/null
  html = html.replace(/\b(true|false|null)\b/g, '<span class="hl-boolean">$1</span>')

  return html
}

const copyToClipboard = (data) => {
  const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('Скопировано в буфер')
  })
}

const copyState = () => copyToClipboard(storeState.value)
</script>

<style scoped>
/* ============================================================================
   ОСНОВНАЯ ПАНЕЛЬ: Фиксированный базовый шрифт для UI
   ============================================================================ */
.debug-panel {
  position: fixed;
  bottom: 0;
  right: 0;
  width: 350px;
  min-height: 150px;
  background: rgba(30, 30, 30, 0.95);
  backdrop-filter: blur(12px);
  color: #d4d4d4;
  border-top-left-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom: none;
  border-right: none;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.6);
  z-index: 1500;
  display: flex;
  flex-direction: column;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 11px; /* 🔥 ФИКСИРОВАННЫЙ РАЗМЕР ДЛЯ ВСЕГО UI */
  overflow: hidden;
}

/* ============================================================================
   ШАПКА
   ============================================================================ */
.debug-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: rgba(45, 45, 45, 0.6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}

.debug-title {
  font-weight: 700;
  color: #4ec9b0;
  font-size: 12px; /* Чуть крупнее для заголовка */
  letter-spacing: 0.5px;
}

.debug-actions {
  display: flex;
  gap: 4px;
}

.debug-actions :deep(.el-button) {
  width: 26px;
  height: 26px;
  padding: 0;
  background: transparent;
  border-color: transparent;
  color: #858585;
}
.debug-actions :deep(.el-button:hover) {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

/* ============================================================================
   ВКЛАДКИ
   ============================================================================ */
.debug-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

:deep(.el-tabs__header) {
  margin: 0 !important;
  border: none !important;
  background: #252526;
  flex-shrink: 0;
}

:deep(.el-tabs__nav-wrap::after) {
  height: 1px !important;
  background: rgba(255, 255, 255, 0.06) !important;
}

:deep(.el-tabs__item) {
  color: #858585 !important;
  height: 36px !important;
  line-height: 36px !important;
  padding: 0 16px !important;
  font-size: 11px !important; /* Фиксированный размер */
  font-weight: 500;
  border: none !important;
  transition: all 0.2s;
}

:deep(.el-tabs__item:hover) { color: #d4d4d4 !important; }
:deep(.el-tabs__item.is-active) {
  color: #4ec9b0 !important;
  background: rgba(30, 30, 30, 0.8) !important;
}
:deep(.el-tabs__active-bar) {
  background-color: #4ec9b0 !important;
  height: 2px !important;
}

:deep(.el-tabs__content) {
  flex: 1;
  padding: 0 !important;
  overflow: hidden;
  min-height: 0;
}

.debug-tab-pane {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* ============================================================================
   ЗОНА ЛОГОВ (Динамический шрифт применяется через inline style)
   ============================================================================ */
.logs-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px;
  min-height: 0;
  line-height: 1.5; /* Компенсация для маленького шрифта */
}

.logs-container::-webkit-scrollbar { width: 8px; }
.logs-container::-webkit-scrollbar-track { background: transparent; }
.logs-container::-webkit-scrollbar-thumb {
  background: #424242;
  border-radius: 4px;
  border: 2px solid #1e1e1e;
}
.logs-container::-webkit-scrollbar-thumb:hover { background: #4ec9b0; }

.log-item {
  display: flex;
  gap: 6px;
  padding: 4px 6px;
  border-radius: 4px;
  align-items: baseline;
  transition: background 0.15s;
}
.log-item:hover { background: rgba(255, 255, 255, 0.05); }

.log-time { color: #858585; white-space: nowrap; min-width: 60px; opacity: 0.8; }
.log-type { font-weight: 700; white-space: nowrap; min-width: 45px; }
.log-type.api { color: #4ec9b0; }
.log-type.store { color: #dcdcaa; }
.log-type.action { color: #c586c0; }
.log-type.error { color: #f48771; }

.log-message {
  color: #d4d4d4;
  flex: 1;
  word-break: break-word;
}
/* Переопределяем цвета подсветки внутри логов для читаемости */
.log-message :deep(.hl-string) { color: #ce9178; }
.log-message :deep(.hl-number) { color: #b5cea8; }
.log-message :deep(.hl-boolean) { color: #569cd6; }

.log-copy-btn { color: #569cd6; padding: 0 2px !important; min-width: 18px; opacity: 0.7; }
.log-item:hover .log-copy-btn { opacity: 1; }

.empty-logs { text-align: center; color: #858585; padding: 24px 16px; }

.new-logs-indicator {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  background: #4ec9b0;
  color: #1e1e1e;
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  z-index: 10;
  transition: all 0.2s ease;
  user-select: none;
  font-size: 11px; /* Фиксированный размер индикатора */
}
.new-logs-indicator:hover {
  background: #6ee7c0;
  transform: translateX(-50%) translateY(-2px);
}

/* ============================================================================
   ЗОНА СОСТОЯНИЯ (Динамический шрифт применяется через inline style)
   ============================================================================ */
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
.state-container::-webkit-scrollbar-thumb { background: #424242; border-radius: 4px; border: 2px solid #1e1e1e; }

.state-container pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: inherit;
}

/* 🔥 ЦВЕТА ПОДСВЕТКИ СИНТАКСИСА (VS Code Dark+ Theme) */
:deep(.hl-key) { color: #9cdcfe; }       /* Голубой для ключей JSON */
:deep(.hl-string) { color: #ce9178; }    /* Оранжевый для строк */
:deep(.hl-number) { color: #b5cea8; }    /* Светло-зеленый для чисел */
:deep(.hl-boolean) { color: #569cd6; }   /* Синий для true/false */
:deep(.hl-null) { color: #569cd6; }      /* Синий для null */

/* ============================================================================
   ФУТЕР (Фиксированный шрифт)
   ============================================================================ */
.debug-footer {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 12px;
  background: rgba(45, 45, 45, 0.8);
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
  gap: 8px;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  padding: 4px 8px;
  flex: 1;
  justify-content: center;
}

.control-label {
  color: #858585;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.control-buttons {
  display: flex;
  align-items: center;
  gap: 2px;
  background: #121212;
  border-radius: 4px;
  padding: 2px;
  border: 1px solid #333;
}

.control-buttons :deep(.el-button) {
  height: 22px !important;
  padding: 0 6px !important;
  font-weight: 700;
  color: #9cdcfe !important;
  background: transparent;
  border: none;
}
.control-buttons :deep(.el-button:hover:not(:disabled)) {
  background: rgba(78, 201, 176, 0.15);
  color: #4ec9b0 !important;
}
.control-buttons :deep(.el-button:disabled) {
  color: #555 !important;
  cursor: not-allowed;
}

.control-value {
  min-width: 28px;
  text-align: center;
  color: #dcdcaa;
  font-weight: 700;
  cursor: pointer;
  padding: 0 4px;
  border-radius: 3px;
  transition: all 0.2s;
}
.control-value:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #4ec9b0;
}
</style>
