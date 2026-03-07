<template>
  <div class="loading-data-actions" :class="{ 'is-complete': isComplete, 'is-loading': props.isLoading }">
    <!-- ========================================================================
         КНОПКИ УПРАВЛЕНИЯ
         ======================================================================== -->
    <div class="control-buttons">
      <!-- ✅ КНОПКА "+N" (LOAD MORE) С ДИНАМИЧЕСКИМ TOOLTIP -->
      <el-tooltip
          :content="getLoadMoreTooltip(props.chunkSize)"
          placement="top"
          :show-after="TIMINGS.TOOLTIP_DELAY"
          :hide-after="TIMINGS.TOOLTIP_HIDE_DELAY"
      >
        <el-button
            v-if="props.showLoadMore && !props.isLoading"
            size="small"
            type="success"
            :disabled="props.disabled || isComplete"
            @click="$emit('load-more')"
            class="control-btn btn-more"
        >
          {{ getLoadMoreButtonText(props.chunkSize) }}
        </el-button>
      </el-tooltip>

      <!-- ✅ КНОПКА ПАУЗА/ВСЕ (MAIN) -->
      <el-tooltip
          :content="mainButtonTooltip"
          placement="top"
          :show-after="TIMINGS.TOOLTIP_DELAY"
          :hide-after="TIMINGS.TOOLTIP_HIDE_DELAY"
      >
        <el-button
            v-if="showMainButton"
            size="small"
            :type="mainButtonType"
            :disabled="props.disabled"
            @click="handleMainClick"
            class="control-btn btn-main"
        >
          <el-icon v-if="props.isLoading && !props.isPaused"><VideoPause /></el-icon>
          <el-icon v-else-if="props.isPaused"><VideoPlay /></el-icon>
          <span v-else>{{ mainButtonText }}</span>
        </el-button>
      </el-tooltip>

      <!-- ✅ КНОПКА ОБНОВИТЬ (REFRESH) -->
      <el-tooltip
          :content="LOADING_DATA_ACTIONS_MESSAGES.TOOLTIP_REFRESH"
          placement="top"
          :show-after="TIMINGS.TOOLTIP_DELAY"
          :hide-after="TIMINGS.TOOLTIP_HIDE_DELAY"
      >
        <el-button
            v-if="props.showRefresh && !props.isLoading"
            size="small"
            type="info"
            :disabled="props.disabled"
            @click="handleRefresh"
            class="control-btn btn-refresh"
        >
          <el-icon><Refresh /></el-icon>
        </el-button>
      </el-tooltip>
    </div>

    <!-- ========================================================================
         ПРОГРЕСС БАР
         ======================================================================== -->
    <div class="progress-wrapper">
      <div class="status-above">
        <div class="status-badge" :class="statusClass">
          <el-icon v-if="isComplete"><Check /></el-icon>
          <el-icon v-else-if="props.isLoading && !props.isPaused"><Loading /></el-icon>
          <el-icon v-else-if="props.isPaused"><VideoPause /></el-icon>
          <span>{{ statusText }}</span>
        </div>

        <el-tooltip
            :content="LOADING_DATA_ACTIONS_MESSAGES.TOOLTIP_SETTINGS"
            placement="top"
            :show-after="TIMINGS.TOOLTIP_DELAY"
            :hide-after="TIMINGS.TOOLTIP_HIDE_DELAY"
        >
          <el-button
              size="small"
              type="info"
              :disabled="props.disabled"
              @click="handleSettings"
              class="settings-btn"
          >
            <el-icon><Setting /></el-icon>
          </el-button>
        </el-tooltip>
      </div>

      <div class="progress-bar" :style="progressBarStyle">
        <div class="progress-background"></div>

        <!-- ✅ ОРАНЖЕВАЯ ПОЛОСА — z-index: 10 (СНИЗУ) -->
        <div
            v-if="props.isLoading && !isComplete && showChunkRod"
            class="progress-chunk-rod"
            :style="chunkRodStyle"
        >
          <div class="chunk-stripes stripes-reverse"></div>
          <div class="chunk-shine"></div>
        </div>

        <!-- ✅ СИНЯЯ ПОЛОСА — z-index: 20 (СВЕРХУ) -->
        <div
            class="progress-loaded"
            :style="loadedLayerStyle"
        >
          <div v-if="props.isLoading && !isComplete" class="progress-stripes stripes-forward"></div>
        </div>

        <div class="progress-text">
          <span class="count">{{ props.loaded }}/{{ props.total }}</span>
          <span class="percent">({{ props.percentage }}%)</span>

          <span v-if="props.isLoading && !isComplete" class="chunk-info">
            | Чанк {{ currentChunk }}/{{ totalChunks }}
            <span class="chunk-remaining">({{ chunkRemaining }}/{{ props.chunkSize }})</span>
          </span>

          <span v-if="props.isPaused" class="paused-badge">⏸</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Refresh, Loading, Check, VideoPause, VideoPlay, Setting } from '@element-plus/icons-vue';
import {
  CHUNK_PROGRESS_CONFIG,
  LOADING_DATA_ACTIONS_PROPS_CONFIG,
  LOADING_DATA_ACTIONS_UI,
  LOADING_DATA_ACTIONS_COLORS,
  LOADING_DATA_ACTIONS_MESSAGES,
  getLoadMoreButtonText,
  getLoadMoreTooltip,
  BREAKPOINTS,
  ANIMATIONS,
  TIMINGS,
  COLORS,
} from '../../config/appConfigIndex.js';

const props = defineProps({...LOADING_DATA_ACTIONS_PROPS_CONFIG});

const emit = defineEmits([
  'load-more',
  'load-all',
  'pause',
  'resume',
  'refresh',
  'settings',
]);

// ============================================================================
// COMPUTED — СТАТУСЫ
// ============================================================================
const isComplete = computed(() => props.percentage >= 100);

const showMainButton = computed(() => {
  return props.showLoadAll || props.isLoading || props.isPaused;
});

const mainButtonText = computed(() => {
  if (props.isLoading && !props.isPaused) return LOADING_DATA_ACTIONS_MESSAGES.BTN_PAUSE;
  if (props.isPaused) return LOADING_DATA_ACTIONS_MESSAGES.BTN_RESUME;
  return LOADING_DATA_ACTIONS_MESSAGES.BTN_LOAD_ALL;
});

const mainButtonType = computed(() => {
  if (props.isLoading || props.isPaused) return 'warning';
  return 'warning';
});

const mainButtonTooltip = computed(() => {
  if (props.isLoading && !props.isPaused) return LOADING_DATA_ACTIONS_MESSAGES.TOOLTIP_PAUSE;
  if (props.isPaused) return LOADING_DATA_ACTIONS_MESSAGES.TOOLTIP_RESUME;
  return LOADING_DATA_ACTIONS_MESSAGES.TOOLTIP_LOAD_ALL;
});

const statusText = computed(() => {
  if (isComplete.value) return LOADING_DATA_ACTIONS_MESSAGES.STATUS_COMPLETE;
  if (props.isPaused) return LOADING_DATA_ACTIONS_MESSAGES.STATUS_PAUSED;
  if (props.isLoading) return LOADING_DATA_ACTIONS_MESSAGES.STATUS_LOADING;
  return LOADING_DATA_ACTIONS_MESSAGES.STATUS_WAITING;
});

const statusClass = computed(() => {
  if (isComplete.value) return 'status-success';
  if (props.isPaused) return 'status-paused';
  if (props.isLoading) return 'status-loading';
  return 'status-waiting';
});

// ============================================================================
// COMPUTED — ЧАНКИ
// ============================================================================
const showChunkRod = computed(() => {
  return props.isLoading && !isComplete.value && props.percentage > 0;
});

const currentChunk = computed(() => {
  if (props.chunkSize <= 0) return 1;
  return Math.floor((props.loaded / props.chunkSize) + 1);
});

const totalChunks = computed(() => {
  if (props.chunkSize <= 0 || props.total <= 0) return 1;
  return Math.ceil(props.total / props.chunkSize);
});

const chunkRemaining = computed(() => {
  if (props.chunkProgress <= 0) return props.chunkSize;
  return Math.round((props.chunkProgress / 100) * props.chunkSize);
});

// ============================================================================
// COMPUTED — СТИЛИ ПРОГРЕСС БАРА
// ============================================================================
const progressBarStyle = computed(() => ({
  height: CHUNK_PROGRESS_CONFIG.HEIGHT,
  borderRadius: CHUNK_PROGRESS_CONFIG.BORDER_RADIUS,
  boxShadow: CHUNK_PROGRESS_CONFIG.BOX_SHADOW,
}));

// ✅ ОРАНЖЕВАЯ ПОЛОСА — z-index: 10 (СНИЗУ)
const chunkRodStyle = computed(() => {
  const isChunkLoading = props.isLoading && props.chunkProgress > 0;

  let orangeWidth = props.percentage;

  if (isChunkLoading && props.total > 0 && props.chunkSize > 0) {
    const chunkPercentOfTotal = (props.chunkSize / props.total) * 100;
    const chunkProgressPercent = (props.chunkProgress / 100) * chunkPercentOfTotal;
    orangeWidth = props.percentage + chunkProgressPercent;
  }

  return {
    width: `${Math.min(orangeWidth, 100)}%`,
    minWidth: props.isLoading ? `${CHUNK_PROGRESS_CONFIG.CHUNK_MIN_WIDTH}` : '0',
    background: `linear-gradient(90deg, #FF9800 0%, #FFB74D 100%)`,
    transition: `width ${TIMINGS.DELAY_FAST} ${ANIMATIONS.EASING_EASE_OUT}`,
    borderRadius: CHUNK_PROGRESS_CONFIG.BORDER_RADIUS,
  };
});

// ✅ СИНЯЯ ПОЛОСА — z-index: 20 (СВЕРХУ)
const loadedLayerStyle = computed(() => ({
  width: `${props.percentage}%`,
  background: `linear-gradient(90deg, #409EFF 0%, #66B1FF 100%)`,
  transition: `width ${TIMINGS.RECALCULATING_DURATION} ${ANIMATIONS.EASING_EASE_OUT}`,
  borderRadius: CHUNK_PROGRESS_CONFIG.BORDER_RADIUS,
}));

// ============================================================================
// ОБРАБОТЧИКИ СОБЫТИЙ
// ============================================================================
const handleMainClick = () => {
  if (props.isLoading && !props.isPaused) {
    emit('pause');
  } else if (props.isPaused) {
    emit('resume');
  } else {
    emit('load-all');
  }
};

const handleRefresh = () => {
  emit('refresh');
};

const handleSettings = () => {
  emit('settings');
};
</script>

<style scoped>
/* ============================================================================
   CONTAINER
   ============================================================================ */
.loading-data-actions {
  display: flex;
  align-items: center;
  gap: v-bind('LOADING_DATA_ACTIONS_UI.GAP');
  padding: v-bind('LOADING_DATA_ACTIONS_UI.PADDING');
  background: v-bind('LOADING_DATA_ACTIONS_UI.BACKGROUND');
  border-radius: v-bind('LOADING_DATA_ACTIONS_UI.BORDER_RADIUS');
  border: v-bind('LOADING_DATA_ACTIONS_UI.BORDER');
  width: 100%;
  height: v-bind('LOADING_DATA_ACTIONS_UI.HEIGHT');
  transition: all v-bind('TIMINGS.RECALCULATING_DURATION') v-bind('ANIMATIONS.EASING_EASE');
  position: relative;
}

.loading-data-actions.is-complete {
  background: linear-gradient(135deg, #f0f9eb 0%, #e6f7e6 100%);
  border-color: v-bind('COLORS.SUCCESS');
}

.loading-data-actions.is-loading {
  background: linear-gradient(135deg, #e8f4ff 0%, #d9edff 100%);
  border-color: v-bind('COLORS.PRIMARY');
}

/* ============================================================================
   CONTROL BUTTONS
   ============================================================================ */
.control-buttons {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.control-btn {
  padding: 4px 8px;
  font-size: 11px;
  height: 22px;
  min-width: auto;
  border-radius: 3px;
  border: none;
  transition: all v-bind('TIMINGS.RECALCULATING_DURATION') v-bind('ANIMATIONS.EASING_EASE');
  cursor: pointer;
}

.control-btn:disabled {
  cursor: not-allowed;
  opacity: v-bind('LOADING_DATA_ACTIONS_COLORS.DISABLED_OPACITY');
  transform: none !important;
}

.control-btn :deep(.el-icon) {
  font-size: 12px;
  margin-right: 3px;
  vertical-align: middle;
}

/* ============================================================================
   BUTTON GRADIENTS
   ============================================================================ */
.btn-main {
  background: linear-gradient(135deg,
  v-bind('LOADING_DATA_ACTIONS_COLORS.BTN_MAIN_GRADIENT_FROM'),
  v-bind('LOADING_DATA_ACTIONS_COLORS.BTN_MAIN_GRADIENT_TO')
  );
  color: v-bind('LOADING_DATA_ACTIONS_COLORS.TEXT_COLOR');
  min-width: auto;
  padding: 4px 6px;
}

.btn-main:hover:not(:disabled) {
  transform: scale(1.05);
}

.btn-more {
  background: linear-gradient(135deg,
  v-bind('LOADING_DATA_ACTIONS_COLORS.BTN_MORE_GRADIENT_FROM'),
  v-bind('LOADING_DATA_ACTIONS_COLORS.BTN_MORE_GRADIENT_TO')
  );
  color: v-bind('LOADING_DATA_ACTIONS_COLORS.TEXT_COLOR');
}

.btn-more:hover:not(:disabled) {
  transform: scale(1.05);
}

.btn-refresh {
  background: linear-gradient(135deg,
  v-bind('LOADING_DATA_ACTIONS_COLORS.BTN_REFRESH_GRADIENT_FROM'),
  v-bind('LOADING_DATA_ACTIONS_COLORS.BTN_REFRESH_GRADIENT_TO')
  );
  color: v-bind('LOADING_DATA_ACTIONS_COLORS.TEXT_COLOR');
  padding: 4px 6px;
}

.btn-refresh:hover:not(:disabled) {
  transform: scale(1.05);
}

/* ============================================================================
   PROGRESS WRAPPER
   ============================================================================ */
.progress-wrapper {
  flex: 1;
  min-width: 120px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-above {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  height: 20px;
  position: absolute;
  right: 10px;
  z-index: 50;
  white-space: nowrap;
}

/* ============================================================================
   STATUS BADGE
   ============================================================================ */
.status-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  transition: all v-bind('TIMINGS.RECALCULATING_DURATION') v-bind('ANIMATIONS.EASING_EASE');
  color: #FFFFFF;
}

.status-badge :deep(.el-icon) {
  font-size: 12px;
}

.status-loading {
  color: #FFFFFF;
  background: linear-gradient(135deg, #409EFF 0%, #337ECC 100%);
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.4);
}

.status-loading :deep(.el-icon) {
  animation: rotating 1s linear infinite;
}

.status-paused {
  color: #FFFFFF;
  background: linear-gradient(135deg, #E6A23C 0%, #C98B2F 100%);
  box-shadow: 0 2px 6px rgba(230, 162, 60, 0.4);
}

.status-success {
  color: #FFFFFF;
  background: linear-gradient(135deg, #67C23A 0%, #52A32E 100%);
  box-shadow: 0 2px 6px rgba(103, 194, 58, 0.4);
}

.status-waiting {
  color: #FFFFFF;
  background: linear-gradient(135deg, #909399 0%, #787B80 100%);
  box-shadow: 0 2px 6px rgba(144, 147, 153, 0.4);
}

/* ============================================================================
   SETTINGS BUTTON
   ============================================================================ */
.settings-btn {
  padding: 0;
  height: 18px;
  width: 18px;
  min-width: 18px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #909399 0%, #787B80 100%);
  color: #FFFFFF;
  transition: all v-bind('TIMINGS.RECALCULATING_DURATION') v-bind('ANIMATIONS.EASING_EASE');
  display: flex;
  align-items: center;
  justify-content: center;
}

.settings-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #409EFF 0%, #337ECC 100%);
  color: #FFFFFF;
  transform: rotate(90deg);
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.4);
}

.settings-btn :deep(.el-icon) {
  font-size: 14px;
  margin: 0;
  color: #FFFFFF;
}

/* ============================================================================
   PROGRESS BAR
   ============================================================================ */
.progress-bar {
  position: relative;
  width: 100%;
  height: v-bind('CHUNK_PROGRESS_CONFIG.HEIGHT');
  overflow: hidden;
  box-shadow: v-bind('CHUNK_PROGRESS_CONFIG.BOX_SHADOW');
  border-radius: v-bind('CHUNK_PROGRESS_CONFIG.BORDER_RADIUS');
}

.progress-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: v-bind('CHUNK_PROGRESS_CONFIG.BACKGROUND_COLOR');
  border-radius: v-bind('CHUNK_PROGRESS_CONFIG.BORDER_RADIUS');
  z-index: 0;
}

/* ✅ ОРАНЖЕВАЯ ПОЛОСА — z-index: 10 (СНИЗУ) */
.progress-chunk-rod {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  z-index: 10;
  overflow: visible;
  border-radius: v-bind('CHUNK_PROGRESS_CONFIG.BORDER_RADIUS');
}

/* ✅ СИНЯЯ ПОЛОСА — z-index: 20 (СВЕРХУ) */
.progress-loaded {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: v-bind('CHUNK_PROGRESS_CONFIG.BORDER_RADIUS');
  z-index: 20;
  overflow: hidden;
}

/* ============================================================================
   STRIPES ANIMATION
   ============================================================================ */
.progress-stripes,
.chunk-stripes {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: v-bind('CHUNK_PROGRESS_CONFIG.BORDER_RADIUS');
  overflow: hidden;
  z-index: 1;
}

.progress-stripes::before,
.chunk-stripes::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 200%;
  height: 100%;
  background: repeating-linear-gradient(
      v-bind('CHUNK_PROGRESS_CONFIG.STRIPE_ANGLE'),
      transparent,
      transparent v-bind('CHUNK_PROGRESS_CONFIG.STRIPE_WIDTH'),
      rgba(255, 255, 255, v-bind('CHUNK_PROGRESS_CONFIG.STRIPE_OPACITY')) v-bind('CHUNK_PROGRESS_CONFIG.STRIPE_WIDTH'),
      rgba(255, 255, 255, v-bind('CHUNK_PROGRESS_CONFIG.STRIPE_OPACITY')) calc(v-bind('CHUNK_PROGRESS_CONFIG.STRIPE_WIDTH') * 2)
  );
  z-index: 1;
}

.stripes-forward::before {
  animation: stripes-slide-left v-bind('CHUNK_PROGRESS_CONFIG.STRIPE_ANIMATION_DURATION') linear infinite;
}

.stripes-reverse::before {
  animation: stripes-slide-left v-bind('CHUNK_PROGRESS_CONFIG.STRIPE_ANIMATION_DURATION') linear infinite;
}

@keyframes stripes-slide-left {
  0% { transform: translateX(0); }
  100% { transform: translateX(-40px); }
}

/* ============================================================================
   CHUNK SHINE
   ============================================================================ */
.chunk-shine {
  position: absolute;
  top: 0;
  left: -50%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shine-slow 2s ease-in-out infinite;
  z-index: 2;
  pointer-events: none;
}

@keyframes shine-slow {
  0% { left: -50%; opacity: 0; }
  50% { opacity: 1; }
  100% { left: 100%; opacity: 0; }
}

/* ============================================================================
   PROGRESS TEXT — z-index: 100 (СВЕРХУ ВСЕГО)
   ============================================================================ */
.progress-text {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: v-bind('CHUNK_PROGRESS_CONFIG.FONT_SIZE');
  color: v-bind('CHUNK_PROGRESS_CONFIG.TEXT_COLOR');
  font-weight: v-bind('CHUNK_PROGRESS_CONFIG.FONT_WEIGHT');
  text-shadow: v-bind('CHUNK_PROGRESS_CONFIG.TEXT_SHADOW');
  white-space: nowrap;
  z-index: 100;
  pointer-events: none;
  flex-wrap: wrap;
  justify-content: center;
}

.progress-text .count {
  font-weight: 600;
}

.progress-text .percent {
  font-size: v-bind('CHUNK_PROGRESS_CONFIG.FONT_SIZE_PERCENTAGE');
  opacity: 0.9;
}

.chunk-info {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  margin-left: 4px;
}

.chunk-remaining {
  color: #FFB74D;
  font-weight: 600;
}

.progress-text .paused-badge {
  background: rgba(0, 0, 0, 0.4);
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 8px;
  font-weight: 700;
}

/* ============================================================================
   ANIMATIONS
   ============================================================================ */
@keyframes rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ============================================================================
   АДАПТИВ
   ============================================================================ */
@media (max-width: v-bind('BREAKPOINTS.XXL')) {
  .loading-data-actions {
    flex-wrap: wrap;
    height: auto;
    gap: 6px;
  }

  .control-buttons {
    width: 100%;
    justify-content: center;
    order: 1;
  }

  .progress-wrapper {
    width: 100%;
    order: 2;
  }

  .status-above {
    position: relative;
    right: auto;
    justify-content: center;
    width: 100%;
    order: 0;
    margin-bottom: 4px;
  }
}

@media (max-width: v-bind('BREAKPOINTS.XL')) {
  .loading-data-actions {
    padding: 6px;
    gap: 4px;
  }

  .control-btn {
    height: 20px;
    font-size: 9px;
    padding: 2px 6px;
  }

  .control-btn :deep(.el-icon) {
    font-size: 10px;
  }

  .progress-text {
    font-size: 10px;
  }

  .status-badge {
    font-size: 9px;
    padding: 2px 6px;
  }

  .settings-btn {
    width: 18px;
    height: 18px;
    min-width: 18px;
  }

  .settings-btn :deep(.el-icon) {
    font-size: 13px;
  }

  .chunk-info {
    font-size: 8px;
  }
}

@media (max-width: v-bind('BREAKPOINTS.XS')) {
  .loading-data-actions {
    padding: 4px;
    gap: 3px;
  }

  .control-buttons {
    gap: 2px;
  }

  .control-btn {
    height: 18px;
    font-size: 8px;
    padding: 1px 4px;
  }

  .progress-bar {
    height: 16px !important;
  }

  .progress-text {
    font-size: 9px;
  }

  .status-badge {
    font-size: 8px;
    padding: 2px 5px;
  }

  .settings-btn {
    width: 18px;
    height: 18px;
    min-width: 18px;
  }

  .settings-btn :deep(.el-icon) {
    font-size: 12px;
  }

  .chunk-info {
    font-size: 7px;
  }
}

@media (hover: none) and (pointer: coarse) {
  .control-btn {
    min-height: 36px;
    min-width: 36px;
    padding: 8px 12px;
    font-size: 12px;
  }

  .control-btn :deep(.el-icon) {
    font-size: 16px;
  }

  .progress-bar {
    height: 20px !important;
  }

  .progress-text {
    font-size: 11px;
  }

  .status-badge {
    font-size: 11px;
    padding: 4px 8px;
  }

  .settings-btn {
    min-width: 36px;
    min-height: 36px;
    width: 36px;
    height: 36px;
  }

  .settings-btn :deep(.el-icon) {
    font-size: 18px;
  }

  .chunk-info {
    font-size: 10px;
  }
}
</style>
