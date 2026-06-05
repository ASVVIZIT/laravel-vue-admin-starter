<template>
  <div v-if="debugStore.isVisible" class="debug-panel">

    <!-- 1. ШАПКА: Только заголовок и основные действия -->
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

    <!-- 2. ВКЛАДКИ: Строгая структура без глюков Element Plus -->
    <el-tabs v-model="activeTab" class="debug-tabs">

      <!-- Вкладка: Логи -->
      <el-tab-pane label="Логи" name="logs" class="debug-tab-pane">
        <DebugLogs />
      </el-tab-pane>

      <!-- Вкладка: Состояние -->
      <el-tab-pane label="Состояние" name="state" class="debug-tab-pane">
        <DebugState />
      </el-tab-pane>

    </el-tabs>

    <!-- 3. ФУТЕР: Управление размерами (48px высотой) -->
    <div class="debug-footer">
      <!-- Управление шрифтом -->
      <div class="control-group">
        <span class="control-label">Шрифт</span>
        <div class="control-buttons">
          <el-button size="small" text @click="debugStore.decreaseFontSize()" :disabled="debugStore.fontSize <= debugStore.MIN_FONT_SIZE" title="Уменьшить">A-</el-button>
          <span class="control-value" @click="debugStore.resetFontSize()" title="Сбросить к 9px">{{ debugStore.fontSize }}</span>
          <el-button size="small" text @click="debugStore.increaseFontSize()" :disabled="debugStore.fontSize >= debugStore.MAX_FONT_SIZE" title="Увеличить">A+</el-button>
        </div>
      </div>

      <!-- Управление высотой -->
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
import { ref } from 'vue'
import { Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useTrainingDebugStore } from '@/components/Training/stores/trainingDebugStore.js'
import { useTrainingLogStore } from '@/components/Training/stores/trainingLogStore.js'
import { useTrainingSettingsStore } from '@/components/Training/stores/trainingSettingsStore.js'
import DebugLogs from './DebugLogs.vue'
import DebugState from './DebugState.vue'

const debugStore = useTrainingDebugStore()
const logStore = useTrainingLogStore()
const settingsStore = useTrainingSettingsStore()

const activeTab = ref('logs')

const copyState = () => {
  const state = {
    activeTab: logStore.activeTab,
    currentFilters: logStore.currentFilters,
    currentPagination: logStore.currentPagination,
    isGrouped: logStore.isGrouped,
    logsCount: logStore.currentLogs.length,
    settings: {
      groupingMode: settingsStore.getGroupingModeForTabStore(logStore.activeTab),
      columns: settingsStore.getColumnsForTabStore(logStore.activeTab)
    }
  }
  navigator.clipboard.writeText(JSON.stringify(state, null, 2)).then(() => {
    ElMessage.success('Скопировано в буфер')
  })
}
</script>

<style scoped>
/* ============================================================================
   ОСНОВНАЯ ПАНЕЛЬ: Современный темный стиль с полупрозрачностью
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
  font-size: 11px;
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
  font-size: 12px;
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
   ВКЛАДКИ: Исправление глюков Element Plus через жесткий Flexbox
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
  font-size: 11px !important;
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
   ФУТЕР: Управление размерами (48px)
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
  font-size: 0.85em;
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
  font-size: 0.9em;
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
  font-size: 0.95em;
  transition: all 0.2s;
}
.control-value:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #4ec9b0;
}
</style>
