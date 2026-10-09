<template>
  <div class="gallery-container">
    <div class="gallery-wrapper">
      <HeaderGallery
          :videos="videos"
          :is-scanning="isScanning"
          :is-paused="isPaused"
          :scan-progress="scanProgress"
          :current-scan-file="currentScanningFile"
          @refresh-group="refreshVideoGroup"
          @play-all="playAll"
          @pause-all="pauseAll"
          @toggle-mute-all="toggleMuteAll"
          @toggle-loop-all="toggleLoopAll"
          @update-columns="updateColumns"
          @update-per-page="updatePerPage"
          @update-scan-speed="updateScanSpeed"
          @start-scan="startScanning"
          @pause-scan="pauseScanning"
          @resume-scan="resumeScanning"
          @stop-scan="stopScanning"
          @scan-mode-changed="changeScanMode"
          ref="header"
      />

      <div v-if="initialLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Инициализация видео галереи...</p>
      </div>

      <div v-else-if="processingStatus" class="processing-indicator">
        <div class="progress-header">
          {{ processingStatus }}
          <div class="progress-bar">
            <div class="progress-fill" :style="{width: processingProgress + '%'}"></div>
          </div>
          <div class="progress-text">
            {{ currentProcessingIndex }}/{{ totalFilesToProcess }}
            ({{ currentProcessingFile }})
          </div>
        </div>
        <div class="debug-info">
          <div>Показано: {{ visibleVideos.length }} / {{ videos.length }}</div>
          <div>Режим: {{ scanModeLabel }}</div>
          <div>Статус: {{ scanStatus }}</div>
          <div>Скорость: {{ scanBatchSize }} файл(ов) за раз</div>
        </div>
      </div>

      <div v-else-if="errorMessage" class="error-state">
        <p>{{ errorMessage }}</p>
        <button @click="retryLoading" class="retry-button">
          Попробовать снова
        </button>
      </div>

      <template v-else>
        <div ref="mosaicWrapper" class="mosaic-wrapper">
          <VideoMosaic
              :videos="visibleVideos"
              :refreshing-videos="refreshingVideos"
              :scanning-file="currentScanningFile"
              ref="mosaic"
              @metadata-updated="handleMetadataUpdated"
              @retry-video="retrySingleVideo"
          />
        </div>

        <!-- Кнопка загрузки следующей страницы -->
        <div v-if="!noMoreVideos && !isScanning" class="load-more-container">
          <button
              @click="loadNextPage"
              class="load-more-button"
              :disabled="loadingMore"
          >
            <span v-if="loadingMore">Загрузка...</span>
            <span v-else>Загрузить еще {{ galleryStore.videosPerPage }} видео</span>
          </button>
          <div class="page-info">Страница {{ currentPage }} из {{ totalPages }}</div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import VideoMosaic from '@/modules/Video/Components/VideoMosaic.vue';
import HeaderGallery from '@/modules/Video/Components/HeaderGallery.vue';
import axios from '@/modules/Video/utils/request.js';
import { useVideoGalleryStore } from '@/modules/Video/stores/videoGalleryStore';
import videoMessage from '@/modules/Video/utils/videoMessage/videoMessage.js';

const galleryStore = useVideoGalleryStore();
const scanStatus = ref('not-started');
const videos = ref([]);
const videoFilesList = ref([]);
const visibleVideos = ref([]);
const initialLoading = ref(true);
const loadingMore = ref(false);
const noMoreVideos = ref(false);
const mosaic = ref(null);
const mosaicWrapper = ref(null);
const currentPage = ref(1);
const totalPages = ref(1);
const errorMessage = ref('');
const processingStatus = ref('');
const refreshingVideos = ref(new Set());
const header = ref(null);
const totalFilesToProcess = ref(0);
const processingProgress = ref(0);
const currentProcessingIndex = ref(0);
const currentProcessingFile = ref('');
const scanBatchSize = ref(galleryStore.scanBatchSize || 1);
const renderCount = ref(0);

// Состояния для ручного управления
const isScanning = ref(false);
const isPaused = ref(false);
const currentScanningFile = ref('');
const scanQueue = ref([]);
const scanProgress = ref(0);

// Лейблы для отображения
const scanModeLabel = computed(() => {
  switch(galleryStore.scanMode) {
    case 'manual': return 'Ручное управление';
    case 'single': return 'Поштучное';
    case 'batch': return 'Пакетное';
    default: return galleryStore.scanMode;
  }
});

const getQualityByExtension = (filename) => {
  if (!filename) return 'normal';
  const ext = filename.split('.').pop().toLowerCase();
  const hdExtensions = ['mkv', 'mov', 'avi', 'mp4', 'flv', 'webm'];
  const sdExtensions = ['3gp', 'wmv', 'mpeg', 'mpg'];
  if (hdExtensions.includes(ext)) return 'high';
  if (sdExtensions.includes(ext)) return 'normal';
  return 'normal';
};

const handleMetadataUpdated = async ({ filename, newData }) => {
  refreshingVideos.value.add(filename);
  const videoIndex = videos.value.findIndex(v => v.filename === filename);
  if (videoIndex !== -1) {
    videos.value[videoIndex] = {
      ...videos.value[videoIndex],
      ...newData,
      metaUpdated: Date.now()
    };
  }
  await new Promise(resolve => setTimeout(resolve, 200));
  refreshingVideos.value.delete(filename);
};

const retrySingleVideo = (filename) => {
  refreshingVideos.value.add(filename);
  setTimeout(async () => {
    try {
      const response = await axios.get('/videos/scan-single', {
        params: { filename, ignore_config: true, timestamp: Date.now() }
      });
      const videoIndex = videos.value.findIndex(v => v.filename === filename);
      if (videoIndex !== -1) {
        videos.value[videoIndex] = {
          ...videos.value[videoIndex],
          ...response.data,
          metaUpdated: Date.now()
        };
      }
    } catch (error) {
      videoMessage.error(`Ошибка повторной обработки: ${filename}`);
    } finally {
      refreshingVideos.value.delete(filename);
    }
  }, 300);
};

const showAllPlaceholders = () => {
  videos.value.forEach(video => video.show = true);
  visibleVideos.value = [...videos.value];
};

const loadVideosStepByStep = async () => {
  try {
    scanStatus.value = 'fetching-files';
    processingStatus.value = 'Получение списка файлов...';
    const response = await axios.get('/videos/file-list', {
      params: { t: Date.now() }
    });

    let videoFiles = [];
    if (Array.isArray(response?.data)) {
      videoFiles = response.data;
    } else if (Array.isArray(response?.data?.data)) {
      videoFiles = response.data.data;
    }

    videoFilesList.value = videoFiles;
    totalFilesToProcess.value = videoFiles.length;

    // Создаем плейсхолдеры для всех файлов
    const placeholders = videoFilesList.value.map(file => ({
      filename: file.filename,
      status: 'pending',
      progress: 0,
      publicUrl: `${galleryStore.publicUrlBase}${encodeURIComponent(file.filename)}?t=${Date.now()}`,
      size: file.size,
      modified: file.modified,
      created: file.created,
      isPlaceholder: true,
      quality: getQualityByExtension(file.filename),
      key: `placeholder-${file.filename}-${Date.now()}`,
      show: false
    }));

    videos.value = placeholders;
    visibleVideos.value = [];
    initialLoading.value = false;
    scanStatus.value = 'creating-placeholders';

    // Гарантируем рендер пустого состояния
    await nextTick();

    // Показываем все плейсхолдеры сразу
    showAllPlaceholders();

    // Для ручного режима - заполняем очередь, но не запускаем
    if (galleryStore.scanMode === 'manual') {
      scanQueue.value = [...videoFilesList.value];
      scanProgress.value = 0;
      processingStatus.value = 'Ожидание команды для старта сканирования';
      return;
    }

    // Для автоматических режимов - пауза и запуск сканирования
    processingStatus.value = 'Плейсхолдеры отображены. Начинаем сканирование через 10 секунд...';
    await new Promise(resolve => setTimeout(resolve, 10000));
    processingStatus.value = 'Начинаем сканирование видео...';
    startBackgroundScanning(videoFilesList.value);

  } catch (error) {
    console.error('Ошибка загрузки списка файлов:', error);
    videoMessage.error('Ошибка загрузки списка файлов');
    errorMessage.value = error.message || 'Ошибка при получении списка файлов';
    initialLoading.value = false;
  }
};

// Функция для фонового сканирования (автоматические режимы)
const startBackgroundScanning = (videoFiles) => {
  const processFile = async (file) => {
    const videoIndex = videos.value.findIndex(v => v.filename === file.filename);
    if (videoIndex === -1) return;

    try {
      videos.value[videoIndex] = {
        ...videos.value[videoIndex],
        status: 'processing',
        key: `processing-${file.filename}-${Date.now()}`
      };
      visibleVideos.value = [...videos.value];
      await new Promise(resolve => setTimeout(resolve, 10));

      const metaResponse = await axios.get('/videos/scan-single', {
        params: { filename: file.filename, ignore_config: true, timestamp: Date.now() }
      });

      videos.value[videoIndex] = {
        ...metaResponse.data,
        status: 'completed',
        progress: 100,
        isPlaceholder: false,
        key: `video-${file.filename}-${Date.now()}`,
        metaUpdated: Date.now(),
        show: true
      };

      visibleVideos.value = [...videos.value];
      await new Promise(resolve => setTimeout(resolve, 10));

    } catch (error) {
      videos.value[videoIndex] = {
        ...videos.value[videoIndex],
        status: 'error',
        key: `error-${file.filename}-${Date.now()}`
      };
      visibleVideos.value = [...videos.value];
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  };

  let currentIndex = 0;
  const batchSize = scanBatchSize.value;

  const processNextBatch = async () => {
    if (currentIndex >= videoFiles.length) {
      processingStatus.value = 'Обработка завершена!';
      scanStatus.value = 'completed';
      setTimeout(() => processingStatus.value = '', 2000);
      return;
    }

    const batch = videoFiles.slice(currentIndex, currentIndex + batchSize);
    currentIndex += batchSize;

    currentProcessingIndex.value = currentIndex;
    totalFilesToProcess.value = videoFiles.length;
    currentProcessingFile.value = batch[0].filename;
    processingStatus.value = `Сканирование файлов: ${currentIndex}/${videoFiles.length}`;
    processingProgress.value = Math.round((currentIndex / videoFiles.length) * 100);
    scanStatus.value = `processing-batch-${currentIndex}`;

    for (const file of batch) {
      await processFile(file);
      if (batchSize > 1) await new Promise(resolve => setTimeout(resolve, 200));
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    setTimeout(processNextBatch, 0);
  };

  processNextBatch();
};

// Функции для ручного управления
const startScanning = () => {
  if (scanQueue.value.length === 0) {
    scanQueue.value = [...videoFilesList.value];
    scanProgress.value = 0;
  }

  isScanning.value = true;
  isPaused.value = false;
  processingStatus.value = 'Ручное сканирование запущено';
  processScanQueue();
};

const pauseScanning = () => {
  isPaused.value = true;
  processingStatus.value = 'Сканирование приостановлено';
  videoMessage.info('Сканирование приостановлено');
};

const resumeScanning = () => {
  isPaused.value = false;
  processingStatus.value = 'Сканирование возобновлено';
  videoMessage.info('Сканирование возобновлено');
  processScanQueue();
};

const stopScanning = () => {
  isScanning.value = false;
  isPaused.value = false;
  currentScanningFile.value = '...';
  processingStatus.value = 'Сканирование остановлено';
  videoMessage.info('Сканирование остановлено');
};

const processScanQueue = async () => {
  if (!isScanning.value || isPaused.value || scanQueue.value.length === 0) return;

  const file = scanQueue.value.shift();
  currentScanningFile.value = file.filename;

  try {
    const videoIndex = videos.value.findIndex(v => v.filename === file.filename);
    if (videoIndex !== -1) {
      videos.value[videoIndex].status = 'processing';
      visibleVideos.value = [...videos.value];
    }

    const response = await axios.get('/videos/scan-single', {
      params: {
        filename: file.filename,
        ignore_config: true,
        priority: 'high'
      }
    });

    if (videoIndex !== -1) {
      videos.value[videoIndex] = {
        ...videos.value[videoIndex],
        ...response.data,
        status: 'completed',
        isPlaceholder: false,
        key: `video-${file.filename}-${Date.now()}`,
        metaUpdated: Date.now(),
        show: true
      };
      visibleVideos.value = [...videos.value];
    }

    videoMessage.success(`Обработано: ${file.filename}`);
  } catch (error) {
    if (videoIndex !== -1) {
      videos.value[videoIndex].status = 'error';
      visibleVideos.value = [...videos.value];
    }
    videoMessage.error(`Ошибка обработки: ${file.filename}`);
  }

  currentScanningFile.value = '...';
  scanProgress.value = Math.round(((videoFilesList.value.length - scanQueue.value.length) / videoFilesList.value.length) * 100);

  if (isScanning.value && !isPaused.value && scanQueue.value.length > 0) {
    setTimeout(processScanQueue, 1000 / scanBatchSize.value);
  } else if (scanQueue.value.length === 0) {
    isScanning.value = false;
    processingStatus.value = 'Ручное сканирование завершено';
    videoMessage.success('Все видео обработаны!');
  }
};

const changeScanMode = (mode) => {
  galleryStore.scanMode = mode;
  galleryStore.saveSettings();
  retryLoading();
};

const loadVideosBatch = async () => {
  if (loadingMore.value || noMoreVideos.value) return;
  loadingMore.value = true;
  errorMessage.value = '';
  processingStatus.value = 'Запрос данных с сервера...';

  try {
    const response = await axios.get('/videos', {
      params: {
        page: currentPage.value,
        per_page: galleryStore.videosPerPage,
        refresh_cache: galleryStore.refreshCache && currentPage.value === 1,
        timestamp: Date.now()
      }
    });

    let videoData = [];
    let totalItems = 0;
    if (response.data && Array.isArray(response.data.data)) {
      videoData = response.data.data;
      totalItems = response.data.total || 0;
      totalPages.value = Math.ceil(totalItems / galleryStore.videosPerPage);
    } else if (Array.isArray(response.data)) {
      videoData = response.data;
      totalItems = response.data.length;
      totalPages.value = 1;
    } else {
      throw new Error('Некорректный формат ответа от сервера');
    }

    videoFilesList.value = videoData;
    const placeholders = videoData.map(video => ({
      ...video,
      status: 'pending',
      progress: 0,
      isPlaceholder: true,
      quality: getQualityByExtension(video.filename),
      key: `placeholder-${video.filename}-${Date.now()}`,
      show: true
    }));

    if (currentPage.value === 1) {
      videos.value = [...placeholders];
    } else {
      videos.value = [...videos.value, ...placeholders];
    }

    visibleVideos.value = [...videos.value];
    initialLoading.value = false;
    noMoreVideos.value = currentPage.value * galleryStore.videosPerPage >= totalItems;

    if (galleryStore.scanMode === 'manual') {
      scanQueue.value = [...videoFilesList.value];
      scanProgress.value = 0;
      processingStatus.value = 'Ожидание команды для старта сканирования';
      return;
    }

    processingStatus.value = 'Плейсхолдеры отображены. Начинаем сканирование через 3 секунды...';
    await new Promise(resolve => setTimeout(resolve, 3000));
    processingStatus.value = 'Начинаем сканирование видео...';
    startBackgroundScanning(videoFilesList.value);

  } catch (error) {
    errorMessage.value = error.fullMessage || error.message || 'Ошибка при загрузке видео';
    videoMessage.error(errorMessage.value);
  } finally {
    loadingMore.value = false;
    initialLoading.value = false;
  }
};

const loadNextPage = () => {
  currentPage.value++;
  loadVideosBatch();
};

const checkIfNeedMore = () => {
  if (!mosaicWrapper.value || loadingMore.value || noMoreVideos.value) return;
  const container = mosaicWrapper.value;
  const { scrollTop, scrollHeight, clientHeight } = container;
  if (scrollTop + clientHeight >= scrollHeight - 300) loadVideosBatch();
};

const retryLoading = () => {
  currentPage.value = 1;
  noMoreVideos.value = false;
  videos.value = [];
  visibleVideos.value = [];
  scanQueue.value = [];
  initialLoading.value = true;
  isScanning.value = false;
  isPaused.value = false;
  currentScanningFile.value = '';

  if (galleryStore.scanMode === 'batch') {
    loadVideosBatch();
  } else {
    loadVideosStepByStep();
  }
};

onMounted(async () => {
  galleryStore.init();

  videoMessage.clear();
  videoMessage.resetConfiguration();
  // Дополнительная информация
  /*setTimeout(() => {
    videoMessage.configure({
      position: 'top-center',
      offset: { y: '40px' }
    });

    videoMessage.debug(
        `Время ответа: ${response.time} мс`,
        10000
    );
  }, 1000);
  videoMessage.resetConfiguration();
  // Позиция для статусов
  videoMessage.configure({
    position: 'bottom-right',
    offset: { x: '40px', y: '40px' }
  });*/

/*// Обычное сообщение
  videoMessage.success("Файл успешно обработан");

// Техническое сообщение с длительным показом
  videoMessage.debug("Response time: 245ms", 5000);

// Постоянное сообщение (без таймера)
  videoMessage.error("Критическая ошибка!", 0, true);

  videoMessage.resetConfiguration();
// Компактное информационное сообщение
  videoMessage.info("Найдено 42 новых файла");

  // Успех (3 секунды)
  videoMessage.success("Данные успешно сохранены");

// Предупреждение (4 секунды)
  videoMessage.warning("Проверьте введенные данные");

// Ошибка (5 секунд)
  videoMessage.error("Ошибка соединения с сервером");

// Информация (3 секунды)
  videoMessage.info("Новые обновления доступны");

// Отладка (10 секунд)
  videoMessage.debug("API response: 200 OK");

// Постоянное сообщение (требует ручного закрытия)
  videoMessage.error("Критическая ошибка системы!", 0, true);

// Длительное информационное сообщение
  videoMessage.info("Идет обработка данных...", 10000);

// Отладочное сообщение с кастомной длительностью
  videoMessage.debug("User session: active", 15000);

  // Постоянное сообщение
  videoMessage.error("Критическая ошибка", 0, true);

// Длительное сообщение
  videoMessage.debug("Отладочная информация", 30000);

// Компактное сообщение
  videoMessage.info("Обновлено", 500);

// Сообщение с HTML-содержимым
  videoMessage.warning(`<b>Внимание</b>: <i>Текст</i>`, 5000);
  videoMessage.resetConfiguration();*/
  if (!galleryStore.publicUrlBase) galleryStore.publicUrlBase = '/storage/Videos/videos/';

  const response = await axios.get('/videos/file-list', {
    params: { t: Date.now() }
  });

  let videoFiles = [];
  if (Array.isArray(response?.data)) {
    videoFiles = response.data;
  } else if (Array.isArray(response?.data?.data)) {
    videoFiles = response.data.data;
  }

  videoFilesList.value = videoFiles;
  totalFilesToProcess.value = videoFiles.length;

  videoMessage.success('Галерея готова к работе!!');
/*  const loader = videoMessage.info(
      "Загрузка данных...",
      0,
      true
  );

  // Обновить сообщение
  // loader.content = "Данные получены!";
  videoMessage.success(
      `Загружено ${totalFilesToProcess.value} элементов`,
      8000
  );*/

  // Создаем плейсхолдеры для всех файлов
  const placeholders = videoFilesList.value.map(file => ({
    filename: file.filename,
    status: 'pending',
    progress: 0,
    publicUrl: `${galleryStore.publicUrlBase}${encodeURIComponent(file.filename)}?t=${Date.now()}`,
    size: file.size,
    modified: file.modified,
    created: file.created,
    isPlaceholder: true,
    quality: getQualityByExtension(file.filename),
    key: `placeholder-${file.filename}-${Date.now()}`,
    show: false
  }));

  videos.value = placeholders;
  visibleVideos.value = placeholders;
  initialLoading.value = false;
  scanStatus.value = 'creating-placeholders';

  // Гарантируем рендер пустого состояния
  await nextTick();

  await showAllPlaceholders()

  if (galleryStore.scanMode === 'batch') {
    await loadVideosBatch();
  } else {
    await loadVideosStepByStep();
  }
});

const playAll = () => mosaic.value?.playAll();
const pauseAll = () => mosaic.value?.pauseAll();

const toggleMuteAll = (muted) => {
  galleryStore.muted = muted;
  galleryStore.saveSettings();
};

const toggleLoopAll = (looping) => {
  galleryStore.looping = looping;
  galleryStore.saveSettings();
};

const updateColumns = (columns) => {
  galleryStore.columns = columns;
  galleryStore.saveSettings();
  nextTick(checkIfNeedMore);
};

const updatePerPage = (perPage) => {
  galleryStore.videosPerPage = perPage;
  retryLoading();
};

const updateScanSpeed = (speed) => {
  scanBatchSize.value = speed;
  galleryStore.scanBatchSize = speed;
  galleryStore.saveSettings();
};

const refreshVideoGroup = async (groupType) => {
  let filenames = [];
  switch (groupType) {
    case 'all': filenames = videos.value.map(v => v.filename); break;
    case 'skipped': filenames = videos.value.filter(v => ['skipped','skipped_old'].includes(v.ffmpeg_status)).map(v => v.filename); break;
    case 'timeout': filenames = videos.value.filter(v => v.ffmpeg_status === 'timeout').map(v => v.filename); break;
    case 'error': filenames = videos.value.filter(v => ['error','no_video_stream'].includes(v.ffmpeg_status)).map(v => v.filename); break;
    default: return;
  }

  if (filenames.length === 0) {
    videoMessage.info('Нет видео для обновления в этой группе');
    return;
  }

  processingStatus.value = `Обновление ${filenames.length} видео...`;
  filenames.forEach(filename => refreshingVideos.value.add(filename));

  try {
    const response = await axios.post('/videos/scan-multiple', {
      filenames: filenames,
      ignore_config: true
    });

    filenames.forEach(filename => {
      const updatedVideo = response.data[filename];
      if (updatedVideo && !updatedVideo.error) {
        const index = videos.value.findIndex(v => v.filename === filename);
        if (index !== -1) {
          videos.value[index] = {
            ...videos.value[index],
            ...updatedVideo,
            publicUrl: updatedVideo.publicUrl || videos.value[index].publicUrl,
            size: updatedVideo.size || videos.value[index].size,
            modified: updatedVideo.modified || videos.value[index].modified,
            created: updatedVideo.created || videos.value[index].created,
            filetype: updatedVideo.filetype || videos.value[index].filetype,
            metaUpdated: Date.now(),
            key: `refreshed-${filename}-${Date.now()}`
          };
        }
      }
    });

    videoMessage.success(`Обновлено ${filenames.length} видео`);
  } catch (error) {
    videoMessage.error('Ошибка обновления: ' + error.message);
  } finally {
    if (header.value) header.value.resetRefreshing();
    processingStatus.value = '';
    setTimeout(() => filenames.forEach(filename => refreshingVideos.value.delete(filename)), 800);
  }
};

const handleScroll = () => checkIfNeedMore();

onMounted(() => {
  if (mosaicWrapper.value) mosaicWrapper.value.addEventListener('scroll', handleScroll);
  window.addEventListener('resize', checkIfNeedMore);
});

onUnmounted(() => {
  if (mosaicWrapper.value) mosaicWrapper.value.removeEventListener('scroll', handleScroll);
  window.removeEventListener('resize', checkIfNeedMore);
  videoMessage.clear();
});

watch(() => galleryStore.columns, checkIfNeedMore, { deep: true });
watch(videos, checkIfNeedMore, { deep: true });
</script>

<style scoped>
.gallery-container {
  padding: 4px 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f0f2f5;
}

.gallery-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 100%;
  padding: 0 2px;
}

.mosaic-wrapper {
  height: calc(100vh - 180px);
  overflow-y: auto;
  padding: 8px 0;
  margin-left: 4px;
  position: relative;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 120px);
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top: 4px solid #4a6cf7;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 120px);
  text-align: center;
}

.error-state p {
  color: #f56c6c;
  font-size: 1.1rem;
  margin-bottom: 20px;
}

.retry-button {
  background: #4a6cf7;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s;
}

.retry-button:hover {
  background: #3a56e0;
}

.processing-indicator {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  max-width: 600px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.progress-header {
  margin-bottom: 10px;
  font-weight: bold;
}

.progress-bar {
  height: 10px;
  background: #e0e0e0;
  border-radius: 5px;
  margin-bottom: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4a6cf7, #3a56e0);
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 10px;
}

.debug-info {
  margin-top: 15px;
  padding: 10px;
  background: #f8f8f8;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
  line-height: 1.5;
}

.debug-info div {
  margin-bottom: 5px;
}

.load-more-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  margin-top: 10px;
  background: rgba(245, 247, 250, 0.8);
  border-top: 1px solid #e2e8f0;
}

.load-more-button {
  background: #4a6cf7;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s;
  min-width: 250px;
}

.load-more-button:hover {
  background: #3a56e0;
}

.load-more-button:disabled {
  background: #a0a0a0;
  cursor: not-allowed;
}

.page-info {
  margin-top: 8px;
  font-size: 0.9rem;
  color: #666;
}

@media (max-width: 768px) {
  .processing-indicator {
    width: 90%;
    padding: 10px;
    font-size: 14px;
  }

  .progress-text {
    font-size: 12px;
  }

  .debug-info {
    font-size: 11px;
    padding: 8px;
  }

  .load-more-button {
    width: 100%;
    padding: 10px;
  }
}
</style>
