<template>
  <div class="header-container">
    <div class="header-content">
      <div class="header-top">
        <div class="header-title">Видео галерея</div>
        <div class="stats">
          <div
              v-for="(stat, index) in stats"
              :key="index"
              class="stat-item"
              @click="refreshGroup(stat.type)"
          >
            <span class="stat-label">{{ stat.label }}:</span>
            <span class="stat-value">{{ stat.value }}</span>
            <span
                class="refresh-icon"
                :class="{ refreshing: refreshingGroup === stat.type }"
            >🔄</span>
          </div>
        </div>
        <button
            @click="toggleSettings"
            class="settings-button"
            :class="{ active: galleryStore.settingsPanelOpen }"
        >
          ⚙️
        </button>
      </div>

      <div v-if="galleryStore.settingsPanelOpen" class="settings-panel">
        <!-- Группа основных действий -->
        <div class="settings-group action-buttons">
          <button @click="$emit('play-all')" class="action-button compact">
            ▶️ Все
          </button>
          <button @click="$emit('pause-all')" class="action-button compact">
            ⏸️ Все
          </button>
        </div>

        <!-- Группа настроек -->
        <div class="settings-columns-overlay">
          <div class="settings-columns">
            <div class="settings-column">
              <div class="settings-group">
                <label class="setting-label" :class="{ active: galleryStore.refreshCache }">
                  <input
                      type="checkbox"
                      :checked="galleryStore.refreshCache"
                      @change="galleryStore.toggleRefreshCache"
                  />
                  <span class="custom-checkbox"></span>
                  <span class="setting-text"><span class="setting-icon">🔄</span>Принудительно обновлять кеш</span>
                </label>
              </div>

              <div class="settings-group">
                <label class="setting-label" :class="{ active: galleryStore.muted }">
                  <input
                      type="checkbox"
                      :checked="galleryStore.muted"
                      @change="$emit('toggle-mute-all', !galleryStore.muted)"
                  />
                  <span class="custom-checkbox"></span>
                  <span class="setting-text"><span class="setting-icon">🔇</span>Без звука</span>
                </label>
              </div>

              <div class="settings-group">
                <label class="setting-label" :class="{ active: galleryStore.looping }">
                  <input
                      type="checkbox"
                      :checked="galleryStore.looping"
                      @change="$emit('toggle-loop-all', !galleryStore.looping)"
                  />
                  <span class="custom-checkbox"></span>
                  <span class="setting-text"><span class="setting-icon">🔁</span>Зациклить</span>
                </label>
              </div>

              <div class="settings-group">
                <label class="setting-label" :class="{ active: galleryStore.autoPlay }">
                  <input
                      type="checkbox"
                      :checked="galleryStore.autoPlay"
                      @change="galleryStore.toggleAutoPlay"
                  />
                  <span class="custom-checkbox"></span>
                  <span class="setting-text"><span class="setting-icon">▶</span>Автовоспроизведение</span>
                </label>
              </div>

              <div class="settings-group">
                <label class="setting-label" :class="{ active: galleryStore.showMeta }">
                  <input
                      type="checkbox"
                      :checked="galleryStore.showMeta"
                      @change="galleryStore.toggleMeta"
                  />
                  <span class="custom-checkbox"></span>
                  <span class="setting-text"><span class="setting-icon">ℹ</span>Показывать метаданные</span>
                </label>
              </div>
            </div>
            <div class="settings-column">
              <!-- Выбор режима сканирования -->
              <div class="settings-group">
                <label class="setting-label-block2">
                  <span class="setting-text">Режим сканирования:</span>
                  <select v-model="scanMode" @change="changeScanMode" class="setting-select">
                    <option value="manual">Ручное управление</option>
                    <option value="single">Поштучное</option>
                    <option value="batch">Пакетное</option>
                  </select>
                </label>
              </div>

              <!-- Настройка скорости сканирования -->
              <div class="settings-group">
                <label class="setting-label-block2">
                  <span class="setting-text">Скорость сканирования:</span>
                  <select v-model="scanSpeed" @change="updateScanSpeed" class="setting-select">
                    <option value="1">1 файл/сек</option>
                    <option value="3">3 файла/сек</option>
                    <option value="5">5 файлов/сек</option>
                    <option value="10">10 файлов/сек</option>
                  </select>
                </label>
              </div>

              <div class="settings-group">
                <label class="setting-label-block2">
                  <span class="setting-text">Видео на странице: {{ galleryStore.videosPerPage }}</span>
                  <input
                      type="range"
                      :step="2"
                      :min="2"
                      :max="600"
                      :value="galleryStore.videosPerPage"
                      @input="updatePerPage($event.target.value)"
                      class="width-slider"
                  />
                </label>
              </div>

              <div class="settings-group">
                <label class="setting-label-block2">
                  <span class="setting-text">Колонки: {{ galleryStore.columns }}</span>
                  <input
                      type="range"
                      min="2"
                      max="14"
                      step="2"
                      :value="galleryStore.columns"
                      @input="$emit('update-columns', parseInt($event.target.value))"
                      class="width-slider"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
        <!-- Ручное управление - только для ручного режима -->
        <div v-if="scanMode === 'manual'" class="manual-controls">
          <div class="scan-status" v-if="currentScanFile">
            Сканируется: {{ currentScanFile }}
          </div>
          <div class="progress-row">
            <div class="progress-bar">
              <div class="progress-fill" :style="{width: scanProgress + '%'}"></div>
            </div>
            <div class="progress-text">{{ scanProgress }}%</div>
          </div>

          <div class="controls-row">
            <button
                @click="$emit('start-scan')"
                class="action-button"
                :disabled="isScanning && !isPaused"
            >
              ▶️ Старт
            </button>
            <button
                @click="$emit('pause-scan')"
                class="action-button"
                :disabled="!isScanning || isPaused"
            >
              ⏸️ Пауза
            </button>
            <button
                @click="$emit('resume-scan')"
                class="action-button"
                :disabled="!isScanning || !isPaused"
            >
              ⏯️ Продолжить
            </button>
            <button
                @click="$emit('stop-scan')"
                class="action-button danger"
                :disabled="!isScanning"
            >
              ⏹️ Стоп
            </button>
          </div>
        </div>

        <!-- Кнопка сброса настроек -->
        <div class="settings-group reset-group">
          <button @click="resetSettings" class="action-button danger compact">
            Сбросить настройки
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useVideoGalleryStore } from '@/modules/Video/stores/videoGalleryStore';
import videoMessage from '@/modules/Video/utils/videoMessage/videoMessage.js';

const galleryStore = useVideoGalleryStore();
const scanSpeed = ref(galleryStore.scanBatchSize.toString());
const scanMode = ref(galleryStore.scanMode);

watch(() => galleryStore.scanMode, (newVal) => {
  scanMode.value = newVal;
});

const props = defineProps({
  videos: {
    type: Array,
    default: () => []
  },
  isScanning: Boolean,
  isPaused: Boolean,
  scanProgress: Number,
  currentScanFile: {
    type: String,
    default: '...'
  },
});

const emit = defineEmits([
  'play-all', 'pause-all', 'toggle-mute-all', 'toggle-loop-all',
  'update-columns', 'update-per-page', 'update-scan-speed',
  'refresh-group', 'start-scan', 'pause-scan', 'resume-scan', 'stop-scan',
  'scan-mode-changed'
]);

const refreshingGroup = ref(null);

const totalVideos = computed(() => props.videos.length);
const processedCount = computed(() => props.videos.filter(v => v.ffmpeg_status === 'success').length);
const skippedCount = computed(() => props.videos.filter(v => v.ffmpeg_status === 'skipped' || v.ffmpeg_status === 'skipped_old').length);
const timeoutCount = computed(() => props.videos.filter(v => v.ffmpeg_status === 'timeout').length);
const errorCount = computed(() => props.videos.filter(v => v.ffmpeg_status === 'error' || v.ffmpeg_status === 'no_video_stream').length);

const stats = computed(() => [
  { label: 'Всего', value: totalVideos.value, type: 'all' },
  { label: 'Обработано', value: processedCount.value, type: 'success' },
  { label: 'Пропущено', value: skippedCount.value, type: 'skipped' },
  { label: 'Таймаут', value: timeoutCount.value, type: 'timeout' },
  { label: 'Ошибки', value: errorCount.value, type: 'error' }
]);

const refreshGroup = (groupType) => {
  refreshingGroup.value = groupType;
  emit('refresh-group', groupType);
};

const updateScanSpeed = () => {
  const speed = parseInt(scanSpeed.value);
  emit('update-scan-speed', speed);
  videoMessage.info(`Скорость сканирования: ${speed} файл(ов) за раз`);
};

const changeScanMode = () => {
  emit('scan-mode-changed', scanMode.value);
};

const updatePerPage = (value) => {
  const perPage = parseInt(value);
  if (perPage > 0) {
    galleryStore.setVideosPerPage(perPage);
    emit('update-per-page', perPage);
    videoMessage.success(`Количество видео на странице: ${perPage}`);
  } else {
    videoMessage.warning('Недопустимое количество видео');
  }
};

const resetRefreshing = () => {
  refreshingGroup.value = null;
};

const toggleSettings = () => {
  galleryStore.toggleSettingsPanel();
};

const resetSettings = () => {
  galleryStore.resetToDefaults();
  videoMessage.success('Настройки сброшены к значениям по умолчанию');
};

defineExpose({ resetRefreshing });
</script>

<style scoped>
.header-container {
  margin-bottom: 3px;
  flex-shrink: 0;
}

.header-content {
  padding: 4px 4px;
  background: #304156;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.header-title {
  margin: 0 0 !important;
  font-size: 1.1rem;
  font-weight: bold;
  white-space: nowrap;
  color: #bec6d5;
  display: flex;
}

.stats {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 0.80rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 4px 8px;
  border-radius: 4px;
  background: rgba(102, 112, 152, 0.1);
  transition: background 0.2s;
  cursor: pointer;
}

.stat-item:hover {
  background: rgba(87, 98, 145, 0.2);
}

.stat-label {
  color: #bec6d5;
}

.stat-value {
  font-weight: bold;
  color: #8d9cd7;
}

.refresh-icon {
  margin-left: 4px;
  font-size: 0.9rem;
  transition: transform 0.3s;
}

.refresh-icon.refreshing {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.settings-button {
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 1px 1px;
  border-radius: 4px;
  transition: all 0.2s;
  min-height: 28px;
  min-width: 28px;
}

.settings-button:hover {
  background: #f0f0f0;
}

.settings-button.active {
  background: #e0e0e0;
}

.settings-panel {
  position: absolute;
  z-index: 3000;
  right: 8px;
  margin-top: 10px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 10px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  font-size: 0.65rem;
  width: 90vw;
  max-width: 400px;
}

.settings-columns {
  display: flex;
  gap: 4px;
  margin: 4px 2px;
  padding: 4px 2px;
  overflow-y: auto;
  max-height: 280px;
}

.settings-column {
  flex: 1;
  min-width: 0;
}

.settings-group {
  margin-bottom: 6px;
}

.action-buttons {
  display: flex;
  gap: 5px;
  margin-bottom: 12px;
}

.action-button {
  background: #4a6cf7;
  color: white;
  border: none;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
  transition: background 0.2s;
  margin: 2px;
}

.action-button.compact {
  padding: 6px 8px;
  font-size: 0.8rem;
}

.action-button:hover {
  background: #3a56e0;
}

.action-button.danger {
  background: #f56c6c;
}

.action-button.danger:hover {
  background: #e55c5c;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  user-select: none;
  padding: 12px 6px;
  border-radius: 4px;
  transition: all 0.2s;
  border: 1px solid #c9c9c9;
}

.setting-label:hover {
  background: #f5f7fa;
  color: #2d3748;
}

.setting-label.active {
  background: rgba(74, 108, 247, 0.1);
  border: 1px solid #4a6cf7;
}

.setting-label-block2 {
  display: grid;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  user-select: none;
  padding: 4px 6px;
  border-radius: 4px;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.setting-label-block2:hover {
  background: #f5f7fa;
  color: #2d3748;
}

.setting-label-block2.active {
  background: rgba(74, 108, 247, 0.1);
  border: 1px solid #4a6cf7;
}

.setting-text {
  white-space: pre-wrap;
  margin-left: 2px;
  display: contents;
}

.setting-text .setting-icon {
  display: flex;
}

.width-slider {
  width: 100%;
  margin-top: 5px;
}

.setting-select {
  width: 100%;
  padding: 5px;
  border-radius: 4px;
  border: 1px solid #ddd;
  margin-top: 3px;
}

.setting-label input[type="checkbox"] {
  display: none;
}

.setting-label input[type="checkbox"],
.setting-label input[type="checkbox" i] {
  background-color: initial;
  cursor: default;
  appearance: auto;
  box-sizing: border-box;
  margin: 0px 0px 0px 0px;
  padding: initial;
  border: initial;
}

.custom-checkbox {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 1px solid #ccc;
  border-radius: 3px;
  position: relative;
  flex-shrink: 0;
}

input[type="checkbox"]:checked + .custom-checkbox::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 5px;
  width: 4px;
  height: 8px;
  border: solid #4a6cf7;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

/* Стили для ручного управления */
.manual-controls {
  margin: 2px 2px;
  padding: 4px;
  border: 1px solid #4a6cf7;
  border-radius: 4px;
  background: rgba(74, 108, 247, 0.05);
}

.progress-row {
  display: flex;
  align-items: center;
  margin-top: 2px;
  margin-bottom: 2px;
}

.progress-bar {
  flex-grow: 1;
  height: 14px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4a6cf7, #3a56e0);
  transition: width 0.3s;
}

.progress-text {
  min-width: 50px;
  text-align: right;
  margin-left: 10px;
  font-size: 0.8rem;
  color: #4a6cf7;
  font-weight: bold;
}

.controls-row {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.controls-row button {
  flex: 1;
  min-width: 110px;
  padding: 6px 10px;
  font-size: 0.8rem;
}

.reset-group {
  margin-top: 6px;
  border-top: 1px solid #eee;
  padding-top: 6px;
  text-align: center;
}

@media (max-width: 768px) {
  .header-top {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .stats {
    width: 100%;
    justify-content: flex-start;
  }

  .settings-panel {
    position: absolute;
    z-index: 3000;
    top: 4px;
    right: 14px;
    max-width: calc(100vw - 310px);
  }

  .settings-columns {
    flex-direction: column;
    gap: 10px;
  }

  .controls-row button {
    min-width: 100px;
    padding: 4px 6px;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .stat-item {
    flex: 1 0 calc(50% - 10px);
    justify-content: center;
  }

  .header-title {
    max-width: none;
    width: 100%;
    text-align: center;
  }

  .controls-row {
    flex-direction: column;
  }

  .controls-row button {
    width: 100%;
  }
}
</style>
