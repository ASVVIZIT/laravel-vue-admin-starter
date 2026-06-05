<template>
  <div class="logs-wrapper">
    <div
        class="logs-container"
        ref="logsContainerRef"
        @scroll="handleScroll"
        :style="{ fontSize: debugStore.fontSize + 'px' }"
    >
      <div v-for="log in debugStore.logs" :key="log.id" :class="['log-item', `log-${log.type}`]">
        <span class="log-time">{{ log.timestamp }}</span>
        <span class="log-type">[{{ log.type.toUpperCase() }}]</span>
        <span class="log-component">{{ log.component }}</span>
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

    <!-- Индикатор новых логов -->
    <div v-if="showNewLogsIndicator" class="new-logs-indicator" @click="scrollToBottom">
      ↓ Новые: {{ newLogsCount }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { useTrainingDebugStore } from '@/components/Training/stores/trainingDebugStore.js'

const debugStore = useTrainingDebugStore()
const logsContainerRef = ref(null)

// Умный автоскролл
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

// 🔥 Умный watcher: следит за новыми логами
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

// ============================================================================
// ПОДСВЕТКА СИНТАКСИСА
// ============================================================================
const escapeHtml = (unsafe) => {
  return String(unsafe)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
}

const highlightCode = (text) => {
  if (!text) return ''
  let html = escapeHtml(text)
  // Строки в кавычках
  html = html.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, '<span class="hl-string">$1</span>')
  // Числа
  html = html.replace(/\b(\d+\.?\d*)\b/g, '<span class="hl-number">$1</span>')
  // Boolean/null
  html = html.replace(/\b(true|false|null)\b/g, '<span class="hl-boolean">$1</span>')
  return html
}

const copyToClipboard = (data) => {
  const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('Скопировано в буфер')
  })
}
</script>

<style scoped>
.logs-wrapper {
  flex: 1;
  display: flex;
  max-height: calc(100vh - 440px);
  flex-direction: column;
  min-height: 0;
  position: relative;
}

.logs-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px;
  min-height: 0;
  line-height: 1.5;
}

/* Кастомный скроллбар */
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
  line-height: 1.4;
  transition: background 0.15s;
}
.log-item:hover { background: rgba(255, 255, 255, 0.05); }

.log-time { color: #858585; font-size: 0.85em; white-space: nowrap; min-width: 60px; opacity: 0.8; }
.log-type { font-weight: 700; white-space: nowrap; font-size: 0.85em; min-width: 45px; }
.log-type.api { color: #4ec9b0; }
.log-type.store { color: #dcdcaa; }
.log-type.action { color: #c586c0; }
.log-type.error { color: #f48771; }

.log-component { color: #9cdcfe; min-width: 90px; font-size: 0.9em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.log-message { color: #d4d4d4; flex: 1; word-break: break-word; font-size: 0.95em; }

/* Подсветка синтаксиса внутри логов */
.log-message :deep(.hl-string) { color: #ce9178; }
.log-message :deep(.hl-number) { color: #b5cea8; }
.log-message :deep(.hl-boolean) { color: #569cd6; }

.log-copy-btn { color: #569cd6; padding: 0 2px !important; min-width: 18px; opacity: 0.7; }
.log-item:hover .log-copy-btn { opacity: 1; }

.empty-logs { text-align: center; color: #858585; padding: 24px 16px; font-size: 0.9em; }

/* Индикатор новых логов */
.new-logs-indicator {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  background: #4ec9b0;
  color: #1e1e1e;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.9em;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  z-index: 10;
  transition: all 0.2s ease;
  user-select: none;
}
.new-logs-indicator:hover {
  background: #6ee7c0;
  transform: translateX(-50%) translateY(-2px);
}
</style>
