<!-- GlobalControls.vue -->
<template>
  <div class="global-controls">
    <div class="controls-row">
      <button
          @click="handlePlayAll"
          class="control-button"
          :class="{ active: isPlaying }"
          title="Play All"
      >
        <span class="icon">▶️</span>
        <span class="label">Play All</span>
      </button>

      <button
          @click="handlePauseAll"
          class="control-button"
          title="Pause All"
      >
        <span class="icon">⏸️</span>
        <span class="label">Pause All</span>
      </button>

      <button
          @click="toggleMuteAll"
          class="control-button"
          :class="{ active: galleryStore.muted }"
          title="Toggle Mute"
      >
        <span class="icon">🔇</span>
        <span class="label">Mute</span>
      </button>

      <button
          @click="toggleLoopAll"
          class="control-button"
          :class="{ active: galleryStore.looping }"
          title="Toggle Loop"
      >
        <span class="icon">🔁</span>
        <span class="label">Loop</span>
      </button>

      <button
          @click="toggleSettings"
          class="control-button"
          :class="{ active: showSettings }"
          title="Toggle Settings"
      >
        <span class="icon">⚙️</span>
        <span class="label">Settings</span>
      </button>
    </div>

    <div v-if="showSettings" class="settings-panel">
      <div class="settings-group">
        <label class="setting-label">
          <input
              type="checkbox"
              :checked="galleryStore.autoPlay"
              @change="galleryStore.toggleAutoPlay"
          />
          <span class="custom-checkbox"></span>
          <span class="icon">▶️</span> Auto Play
        </label>
      </div>

      <div class="settings-group">
        <label class="setting-label">
          <input
              type="checkbox"
              :checked="galleryStore.showMeta"
              @change="galleryStore.toggleMeta"
          />
          <span class="custom-checkbox"></span>
          <span class="icon">ℹ️</span> Show Metadata
        </label>
      </div>

      <div class="settings-group">
        <label class="setting-label">
          Columns: {{ galleryStore.columns }}
          <input
              type="range"
              min="4"
              max="12"
              step="2"
              :value="galleryStore.columns"
              @input="updateColumns($event.target.value)"
              class="width-slider"
          />
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useVideoGalleryStore } from '@/modules/Video/stores/videoGalleryStore';

const galleryStore = useVideoGalleryStore();
const showSettings = ref(false);
const isPlaying = ref(false);

onMounted(() => {
  const savedSettingsState = localStorage.getItem('settingsPanelState');
  if (savedSettingsState) {
    showSettings.value = JSON.parse(savedSettingsState);
  }
});

const handlePlayAll = () => {
  isPlaying.value = true;
  $emit('play-all');
};

const handlePauseAll = () => {
  isPlaying.value = false;
  $emit('pause-all');
};

const toggleMuteAll = () => {
  galleryStore.muted = !galleryStore.muted;
  galleryStore.saveSettings(); // Сохраняем настройки
};

const toggleLoopAll = () => {
  galleryStore.looping = !galleryStore.looping;
  galleryStore.saveSettings(); // Сохраняем настройки
};

const updateColumns = (value) => {
  const columns = parseInt(value);
  $emit('update-columns', columns);
};

const toggleSettings = () => {
  showSettings.value = !showSettings.value;
  localStorage.setItem('settingsPanelState', JSON.stringify(showSettings.value));
};
</script>

<style scoped>
.global-controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  border: 1px solid #e2e8f0;
  position: relative;
}

.controls-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.control-button {
  background: #4a6cf7;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  box-shadow: 0 2px 4px rgba(74, 108, 247, 0.3);
  position: relative;
}

.control-button.active {
  background: #3a56e0;
  box-shadow: 0 2px 6px rgba(58, 86, 224, 0.4);
}

.control-button.active::after {
  content: '✓';
  position: absolute;
  top: -5px;
  right: -5px;
  background: #4CAF50;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-button:hover {
  background: #3a56e0;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(74, 108, 247, 0.4);
}

.control-button:active {
  transform: translateY(0);
}

.icon {
  font-size: 1.2rem;
  display: inline-block;
  min-width: 24px;
  text-align: center;
}

.label {
  white-space: nowrap;
}

.settings-panel {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  margin-top: 2px;
  margin-bottom: 2px;
}

.settings-group {
  margin-top: 4px;
  margin-bottom: 4px;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
  font-size: 0.95rem;
  color: #4a5568;
  transition: color 0.3s;
  padding: 6px 10px;
  border-radius: 6px;
}

.setting-label:hover {
  background: #edf2f7;
  color: #2d3748;
}

.width-slider {
  width: 100%;
  margin-top: 8px;
}

/* Стили для кастомного чекбокса */
.setting-label input[type="checkbox"] {
  display: none;
}

.custom-checkbox {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 1px solid #ccc;
  border-radius: 3px;
  position: relative;
}

input[type="checkbox"]:checked + .custom-checkbox::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 5px;
  width: 5px;
  height: 10px;
  border: solid #4a6cf7;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

@media (max-width: 768px) {
  .controls-row {
    flex-direction: column;
    gap: 8px;
  }

  .control-button {
    width: 100%;
    justify-content: center;
  }

  .settings-panel {
    position: static;
    width: 100%;
  }
}
</style>
