<template>
  <div
      class="video-container"
      ref="videoContainer"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
  >
    <div
        class="ffmpeg-status-indicator"
        :class="ffmpegStatusClass"
        @click.stop="refreshMetadata"
        :title="ffmpegStatusText"
    >
      <span class="status-icon">{{ ffmpegStatusIcon }}</span>
      <div v-if="isHovered" class="status-tooltip">{{ ffmpegStatusText }}</div>
    </div>

    <div
        v-if="galleryStore.showMeta && loaded"
        class="meta-header"
        :class="{ 'meta-visible': isHovered }"
        @click.stop="toggleMeta"
    >
      <div class="meta-title">{{ fileName }}</div>
      <button class="meta-toggle-button" title="Показать/скрыть метаданные">
        <span v-if="isMetaVisible">▲</span>
        <span v-else>▼</span>
      </button>
    </div>

    <div v-if="video.isPlaceholder" class="loading-overlay">
      <div class="spinner"></div>
    </div>

    <video
        v-else
        ref="videoEl"
        :src="videoSrc"
        class="video-element"
        @click="togglePlay"
        @loadeddata="handleLoaded"
        @timeupdate="updateProgress"
        @error="handleError"
        :loop="isLooping"
        :muted="isMuted"
        :volume="volume"
        playsinline
        :key="videoKey"
    />

    <div v-if="!loaded && !video.isPlaceholder" class="loading-overlay">
      <div class="spinner"></div>
    </div>

    <div
        v-if="galleryStore.showMeta && loaded && isMetaVisible"
        class="meta-panel"
        :class="{ 'meta-visible': isMetaVisible }"
    >
      <div class="meta-content">
        <div class="meta-grid">
          <div class="meta-item">
            <span class="meta-label">Размер файла:</span>
            <span class="meta-value">{{ fileSize }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Длительность:</span>
            <span class="meta-value">{{ videoDuration }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Качество:</span>
            <span class="meta-value">{{ videoQuality }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Разрешение:</span>
            <span class="meta-value">{{ videoResolution }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Видеокодек:</span>
            <span class="meta-value">{{ videoCodec }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Битрейт:</span>
            <span class="meta-value">{{ videoBitrate }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Статус обработки:</span>
            <span class="meta-value">{{ ffmpegStatusText }}</span>
          </div>
          <div v-if="video.processTime" class="meta-item">
            <span class="meta-label">Время обработки:</span>
            <span class="meta-value">{{ video.processTime }} ms</span>
          </div>
        </div>
      </div>
    </div>

    <div
        v-if="loaded && !video.isPlaceholder"
        class="controls-overlay"
        @click.stop
    >
      <div class="controls-row">
        <button
            class="control-button play-pause-button"
            @click="togglePlay"
        >
          {{ isPlaying ? '⏸' : '▶' }}
        </button>
        <button
            class="control-button loop-button"
            @click="toggleLoop"
            :class="{ active: isLooping }"
        >
          {{ isLooping ? '↺' : '🔄' }}
        </button>
        <div class="flex-grow"></div>
        <div class="volume-container" @mouseover="showVolumeControl = true" @mouseleave="showVolumeControl = false">
          <button
              class="control-button mute-button"
              @click="toggleMute"
              :class="{ active: isMuted }"
          >
            {{ isMuted ? '🔇' : '🔊' }}
          </button>
          <div v-if="showVolumeControl" class="volume-control">
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                :value="volume"
                @input="setVolume"
                class="volume-slider"
            />
          </div>
        </div>
        <button
            class="control-button full-screen-button"
            @click="toggleFullScreen"
        >
          🗖
        </button>
      </div>
      <div class="time-info">
        <span class="time-text">{{ formattedTime }}</span>
        <input
            type="range"
            min="0"
            max="100"
            step="0.01"
            :value="progress"
            @input="seekTo"
            class="progress-slider"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import axios from '@/modules/Video/utils/request.js';
import videoMessage from '@/modules/Video/utils/videoMessage/videoMessage.js';
import { useVideoGalleryStore } from '@/modules/Video/stores/videoGalleryStore';

const galleryStore = useVideoGalleryStore();
const props = defineProps({
  video: {
    type: Object,
    required: true
  },
  muted: {
    type: Boolean,
    default: true
  },
  looping: {
    type: Boolean,
    default: false
  },
  autoPlay: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['metadata-updated', 'load-error']);

const videoEl = ref(null);
const videoContainer = ref(null);
const isPlaying = ref(false);
const loaded = ref(false);
const isLooping = ref(props.looping);
const isMuted = ref(props.muted);
const volume = ref(0.2);
const progress = ref(0);
const showVolumeControl = ref(false);
const observer = ref(null);
const autoPlayEnabled = ref(true);
const isMetaVisible = ref(false);
const isHovered = ref(false);
const currentTime = ref(0);

const fileName = ref(props.video.filename || 'Без названия');
const fileSize = ref(props.video.size
    ? `${(props.video.size / (1024 * 1024)).toFixed(2)} MB`
    : 'Неизвестно');
const videoDuration = ref(props.video.duration
    ? formatTime(props.video.duration)
    : '00:00.000');
const videoQuality = ref(props.video.quality === 'high' ? 'Высокое' : 'Стандартное');
const videoResolution = ref(props.video.width && props.video.height
    ? `${props.video.width}x${props.video.height}`
    : 'Неизвестно');
const videoCodec = ref(props.video.codec || 'Неизвестно');
const videoBitrate = ref(props.video.bitrate
    ? `${(props.video.bitrate / 1000).toFixed(0)} kbps`
    : 'Неизвестно');

const ffmpegStatus = computed(() => {
  return props.video.ffmpeg_status || 'unknown';
});

const ffmpegStatusClass = computed(() => {
  return `status-${ffmpegStatus.value}`;
});

const ffmpegStatusIcon = computed(() => {
  const icons = {
    'success': '✓',
    'processed': '✓',
    'skipped': '⟳',
    'skipped_old': '⟳',
    'timeout': '⌛',
    'no_video_stream': '❌',
    'error': '⚠',
    'unknown': '?'
  };
  return icons[ffmpegStatus.value] || '?';
});

const ffmpegStatusText = computed(() => {
  const texts = {
    'success': 'Видео проверено: все параметры корректны',
    'processed': 'Видео успешно обработано',
    'skipped': 'Проверка пропущена (новое видео)',
    'skipped_old': 'Проверка пропущена (старое видео)',
    'timeout': 'Не хватило времени на полную проверку',
    'no_video_stream': 'Видео поток не обнаружен',
    'error': 'Ошибка при обработке видео',
    'unknown': 'Статус проверки неизвестен'
  };
  return texts[ffmpegStatus.value] || 'Неизвестный статус';
});

watch(() => props.video, (newVideo) => {
  if (newVideo) {
    fileName.value = newVideo.filename || 'Без названия';
    fileSize.value = newVideo.size
        ? `${(newVideo.size / (1024 * 1024)).toFixed(2)} MB`
        : 'Неизвестно';
    videoDuration.value = newVideo.duration
        ? formatTime(newVideo.duration)
        : '00:00.000';
    videoQuality.value = newVideo.quality === 'high' ? 'Высокое' : 'Стандартное';
    videoResolution.value = newVideo.width && newVideo.height
        ? `${newVideo.width}x${newVideo.height}`
        : 'Неизвестно';
    videoCodec.value = newVideo.codec || 'Неизвестно';
    videoBitrate.value = newVideo.bitrate
        ? `${(newVideo.bitrate / 1000).toFixed(0)} kbps`
        : 'Неизвестно';
  }
}, { deep: true, immediate: true });

function handleError(error) {
  console.error('Video error:', error);
  emit('load-error');
  loaded.value = false;
}

const videoSrc = computed(() => {
  return props.video.publicUrl || '';
});

const videoKey = computed(() => {
  return `video-${props.video.filename}-${props.video.metaUpdated || 0}`;
});

onMounted(() => {
  if (!props.autoPlay || props.video.isPlaceholder) return;

  observer.value = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (autoPlayEnabled.value && props.autoPlay) {
          play();
        }
      } else {
        if (isPlaying.value) {
          pause();
        }
      }
    });
  }, {
    threshold: 0.5,
    rootMargin: '100px'
  });

  if (videoContainer.value) {
    observer.value.observe(videoContainer.value);
  }

  if (videoEl.value) {
    videoEl.value.volume = volume.value;
    videoEl.value.muted = isMuted.value;
  }
});

const refreshMetadata = async () => {
  try {
    videoMessage.info('Обновление метаданных...');

    const response = await axios.get('/videos/scan-single', {
      params: {
        filename: props.video.filename,
        ignore_config: true,
        timestamp: Date.now()
      }
    });

    const newPublicUrl = response.data.publicUrl || props.video.publicUrl;

    emit('metadata-updated', {
      filename: props.video.filename,
      newData: {
        ...props.video,
        ...response.data,
        publicUrl: newPublicUrl,
        metaUpdated: Date.now()
      }
    });

    videoMessage.success('Метаданные обновлены');
  } catch (error) {
    videoMessage.error('Ошибка обновления: ' + error.message);
  }
};

onUnmounted(() => {
  if (observer.value) {
    observer.value.disconnect();
  }
});

watch(() => props.muted, (newVal) => isMuted.value = newVal);
watch(() => props.looping, (newVal) => isLooping.value = newVal);

function formatTime(seconds) {
  if (isNaN(seconds)) return '00:00.000';

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds - Math.floor(seconds)) * 1000);

  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
}

const formattedTime = computed(() => {
  if (!videoEl.value || !loaded.value) return '00:00.000 / 00:00.000';

  const current = formatTime(currentTime.value);
  const duration = formatTime(videoEl.value.duration);

  return `${current} / ${duration}`;
});

function updateProgress() {
  if (!videoEl.value || isNaN(videoEl.value.duration)) return;

  currentTime.value = videoEl.value.currentTime;
  progress.value = (videoEl.value.currentTime / videoEl.value.duration) * 100;
}

function togglePlay() {
  autoPlayEnabled.value = false;
  if (!videoEl.value) return;
  videoEl.value.paused ? videoEl.value.play() : videoEl.value.pause();
  isPlaying.value = !videoEl.value.paused;
}

function handleLoaded() {
  loaded.value = true;
}

function toggleLoop() {
  isLooping.value = !isLooping.value;
}

function toggleMute() {
  isMuted.value = !isMuted.value;
}

function setVolume(event) {
  volume.value = parseFloat(event.target.value);
  if (videoEl.value) videoEl.value.volume = volume.value;
}

function seekTo(event) {
  if (!videoEl.value) return;
  const time = (event.target.value / 100) * videoEl.value.duration;
  videoEl.value.currentTime = time;
}

function toggleFullScreen() {
  if (!videoEl.value) return;
  const element = videoEl.value.parentElement;

  if (document.fullscreenElement) {
    document.exitFullscreen?.();
  } else {
    element.requestFullscreen?.();
  }
}

const play = () => {
  if (videoEl.value && videoEl.value.paused) {
    videoEl.value.play();
    isPlaying.value = true;
  }
};

const pause = () => {
  if (videoEl.value && !videoEl.value.paused) {
    videoEl.value.pause();
    isPlaying.value = false;
  }
};

const toggleMeta = () => {
  isMetaVisible.value = !isMetaVisible.value;
};

defineExpose({ play, pause });
</script>


<style scoped>
.video-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #000;
}

.ffmpeg-status-indicator {
  position: absolute;
  opacity: .7;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  z-index: 20;
  cursor: pointer;
  transform: scale(.7);
  transition: ease .1s ease-in;
  box-shadow: 0 0 5px rgba(0,0,0,0.5);
}

.ffmpeg-status-indicator:hover {
  opacity: 0.7;
  transform: scale(1);
  transition: ease 0.3s ease-in-out;
}

.status-success, .status-processed {
  background-color: #52c41a;
  color: white;
}

.status-skipped, .status-skipped_old {
  background-color: #faad14;
  color: white;
}

.status-timeout {
  background-color: #fa8c16;
  color: white;
}

.status-no_video_stream, .status-error {
  background-color: #f5222d;
  color: white;
}

.status-unknown {
  background-color: #bfbfbf;
  color: white;
}

.status-tooltip {
  position: absolute;
  top: 30px;
  left: 2px;
  width: 100px;
  padding: 4px;
  background: rgba(0,0,0,0.8);
  color: white;
  border-radius: 3px;
  font-size: 10px;
  font-weight: normal;
  z-index: 100;
  display: none;
}

.ffmpeg-status-indicator:hover .status-tooltip {
  display: block;
}

.meta-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%);
  padding: 8px;
  z-index: 15;
  opacity: 0;
  transition: opacity 0.3s;
}

.meta-visible {
  opacity: 1;
}

.meta-title {
  color: white;
  font-size: 10px;
  margin-left: 22px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta-toggle-button {
  position: absolute;
  top: 5px;
  right: 5px;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
}

.video-element {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.meta-panel {
  position: absolute;
  top: 22px;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 6px;
  font-size: 8px;
  z-index: 15;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.25s;
}

.meta-panel.meta-visible {
  max-height: fit-content;
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2px;
}

.meta-item {
  display: flex;
}

.meta-label {
  font-weight: 700;
  margin-right: 4px;
  min-width: 70px;
  white-space: pre-wrap;
  word-break: break-all;
  max-width: 50px;
  color: #aaa;
}

.meta-value {
  white-space: normal;
  word-break: break-word;
  flex-grow: 1;
  color: #fff;
}

.controls-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0,0,0,0.7);
  padding: 5px;
  z-index: 15;
  opacity: 0;
  transition: opacity 0.3s;
}

.video-container:hover .controls-overlay {
  opacity: 1;
}

.controls-row {
  display: flex;
  align-items: center;
  gap: 5px;
}

.control-button {
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
}

.control-button:hover {
  background: rgba(255,255,255,0.3);
}

.control-button.active {
  background: #4a6cf7;
}

.flex-grow {
  flex-grow: 1;
}

.volume-container {
  position: relative;
}

.volume-control {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.8);
  padding: 8px;
  border-radius: 4px;
}

.volume-slider {
  width: 80px;
  height: 5px;
  -webkit-appearance: none;
  background: #555;
  outline: none;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #fff;
}

.time-info {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 3px;
}

.time-text {
  color: white;
  font-size: 10px;
  min-width: 120px;
}

.progress-slider {
  flex-grow: 1;
  height: 3px;
  -webkit-appearance: none;
  background: #555;
  outline: none;
}

.progress-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #fff;
}
</style>
