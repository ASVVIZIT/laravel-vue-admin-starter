<template>
  <div class="mosaic-grid" :style="gridStyle">
    <div
        v-for="video in videos"
        :key="video.key"
        class="mosaic-item"
        :class="{
          'high-quality': video.quality === 'high',
          'normal-quality': video.quality === 'normal',
          'processing': shouldShowOverlay(video),
          'refreshing': refreshingVideos.has(video.filename),
          'error-state': video.loadError,
          'visible': video.show,
          'scanning': scanningFile === video.filename
        }"
    >
      <div v-if="shouldShowOverlay(video)" class="processing-overlay">
        <div v-if="!video.loadError && video.status !== 'error'" class="spinner"></div>
        <div class="filename">{{ video.filename }}</div>

        <div v-if="!video.loadError" class="processing-text">
          {{ processingStatusText(video.status) }}
        </div>

        <div v-if="video.loadError" class="error-text">
          Ошибка загрузки видео
        </div>

        <button v-if="video.loadError || video.status === 'error'"
                class="retry-button"
                @click.stop="retryVideo(video)">
          Повторить
        </button>
      </div>

      <VideoPlayer v-else
                   :video="video"
                   :muted="galleryStore.muted"
                   :looping="galleryStore.looping"
                   :auto-play="galleryStore.autoPlay"
                   @metadata-updated="$emit('metadata-updated', $event)"
                   @load-error="handleVideoError(video)"
      />
    </div>
  </div>
</template>

<script setup>
import VideoPlayer from '@/modules/Video/Components/VideoPlayer.vue';
import { useVideoGalleryStore } from '@/modules/Video/stores/videoGalleryStore';

const props = defineProps({
  videos: Array,
  refreshingVideos: Set,
  scanningFile: String
});

const galleryStore = useVideoGalleryStore();
defineEmits(['metadata-updated', 'retry-video']);

const gridStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${galleryStore.columns}, 1fr)`,
  gap: '3px',
  gridAutoFlow: 'dense'
}));

const processingStatusText = (status) => {
  const statusMap = {
    pending: 'Ожидание обработки',
    processing: 'Сканирование FFmpeg',
    completed: 'Обработка завершена',
    error: 'Ошибка обработки'
  };
  return statusMap[status] || status;
};

const shouldShowOverlay = (video) => {
  return props.refreshingVideos.has(video.filename) ||
      video.isPlaceholder ||
      (video.status && video.status !== 'completed') ||
      video.loadError;
};

const retryVideo = (video) => {
  video.loadError = false;
  video.status = 'pending';
  video.progress = 0;
  props.refreshingVideos.add(video.filename);
  setTimeout(() => props.refreshingVideos.delete(video.filename), 1000);
  this.$emit('retry-video', video.filename);
};

const handleVideoError = (video) => video.loadError = true;

const playAll = () => {
  document.querySelectorAll('.video-element').forEach(video => {
    video.play().catch(e => console.error("Play error:", e));
  });
};

const pauseAll = () => {
  document.querySelectorAll('.video-element').forEach(video => video.pause());
};

defineExpose({ playAll, pauseAll });
</script>

<style scoped>
.mosaic-grid {
  display: grid;
  width: 100%;
  position: relative;
  margin-bottom: 30px;
}

.mosaic-item {
  position: relative;
  border-radius: 3px;
  overflow: hidden;
  box-shadow: 0 2px 7px #000000c2;
  background: #000;
  aspect-ratio: 16 / 9;
  opacity: 0;
  transform: translateY(6px) scale(.88);
  transition:
      opacity 0.5s ease-out,
      transform 0.5s ease-out,
      box-shadow 0.3s ease;
}

.mosaic-item.visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.mosaic-item:nth-child(10n+1) { transition-delay: 0.05s; }
.mosaic-item:nth-child(10n+2) { transition-delay: 0.15s; }
.mosaic-item:nth-child(10n+3) { transition-delay: 0.2s; }
.mosaic-item:nth-child(10n+4) { transition-delay: 0.25s; }
.mosaic-item:nth-child(10n+5) { transition-delay: 0.3s; }
.mosaic-item:nth-child(10n+6) { transition-delay: 0.35s; }
.mosaic-item:nth-child(10n+7) { transition-delay: 0.4s; }
.mosaic-item:nth-child(10n+8) { transition-delay: 0.45s; }
.mosaic-item:nth-child(10n+9) { transition-delay: 0.5s; }
.mosaic-item:nth-child(10n) { transition-delay: 0.55s; }

/* Яркая анимация для плейсхолдеров */
.mosaic-item.processing {
  background: linear-gradient(45deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff);
  background-size: 600% 600%;
  animation: rainbow-pulse 3s ease infinite;
}

@keyframes rainbow-pulse {
  0% {
    background-position: 0% 50%;
    opacity: 0.8;
  }
  50% {
    background-position: 100% 50%;
    opacity: 1;
  }
  100% {
    background-position: 0% 50%;
    opacity: 0.8;
  }
}

.high-quality {
  grid-column: span 2;
  grid-row: span 2;
}

.normal-quality {
  grid-column: span 1;
  grid-row: span 1;
}

.processing {
  box-shadow: 0 0 0 2px #4a6cf7;
}

.refreshing {
  background: rgba(255, 255, 255, 0.1);
  border: 2px dashed #4a6cf7;
  animation: pulse 1.2s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(74, 108, 247, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(74, 108, 247, 0); }
  100% { box-shadow: 0 0 0 0 rgba(74, 108, 247, 0); }
}

.error-state {
  box-shadow: 0 0 0 2px #ff4d4f;
}

.processing-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 10px;
  text-align: center;
  padding: 10px;
  z-index: 20;
}

.processing-overlay .spinner {
  width: 22px;
  height: 22px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #4a6cf7;
  animation: spin 0.7s linear infinite;
  margin-top: 5px;
  margin-bottom: 5px;
}

.processing-overlay .filename {
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  margin-top: 5px;
  margin-bottom: 5px;
  font-weight: bold;
}

.processing-overlay .processing-text {
  margin-top: 5px;
  margin-bottom: 5px;
  font-size: 10px;
  font-weight: bold;
}

.error-text {
  color: #ff4d4f;
  font-weight: bold;
  margin-top: 5px;
  margin-bottom: 5px;
  font-size: 10px;
}

.retry-button {
  margin-top: 5px;
  margin-bottom: 5px;
  padding: 4px 8px;
  background: #4a6cf7;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 8px;
  transition: background 0.3s;
}

.retry-button:hover {
  background: #3a56e0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .mosaic-grid {
    gap: 2px;
  }

  .mosaic-item {
    border-radius: 2px;
  }

  .high-quality {
    grid-column: span 1;
    grid-row: span 1;
  }

  .processing-overlay .filename {
    font-size: 12px;
  }

  .processing-overlay .processing-text {
    font-size: 12px;
  }
}

.mosaic-item.scanning {
  position: relative;
  overflow: hidden;
}

.mosaic-item.scanning::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.8),
      transparent
  );
  animation: scanning 2s infinite;
  z-index: 10;
}

@keyframes scanning {
  0% { left: -100%; }
  100% { left: 150%; }
}

/* Анимация для плейсхолдеров */
.mosaic-item.processing {
  background: linear-gradient(45deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff);
  background-size: 300% 300%;
  animation: rainbow-pulse 2s ease infinite;
}

@keyframes rainbow-pulse {
  0% { background-position: 0% 50%; opacity: 0.8; }
  50% { background-position: 100% 50%; opacity: 1; }
  100% { background-position: 0% 50%; opacity: 0.8; }
}

</style>
