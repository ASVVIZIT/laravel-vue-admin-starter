<template>
  <div class="loading-data-actions" :class="{ 'is-complete': isComplete, 'is-loading': props.isLoading }">
    <div class="control-buttons">
      <el-tooltip :content="LOADING_DATA_ACTIONS_MESSAGES.TOOLTIP_LOAD_MORE" placement="top">
        <el-button
            v-if="props.showLoadMore && !props.isLoading"
            size="small"
            type="success"
            :disabled="props.disabled || isComplete"
            @click="handleLoadMore"
            class="control-btn btn-more"
        >
          +{{ props.chunkSize }}
        </el-button>
      </el-tooltip>

      <el-tooltip :content="mainButtonTooltip" placement="top">
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

      <el-tooltip :content="LOADING_DATA_ACTIONS_MESSAGES.TOOLTIP_REFRESH" placement="top">
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

    <div class="progress-wrapper">
      <div class="progress-bar" :style="progressBarStyle">
        <div class="progress-background"></div>

        <div
            v-if="props.isLoading && !isComplete && showChunkRod"
            class="progress-chunk-rod"
            :style="chunkRodStyle"
        >
          <div class="chunk-stripes stripes-reverse"></div>
          <div class="chunk-shine"></div>
        </div>

        <div
            class="progress-loaded"
            :style="loadedLayerStyle"
        >
          <div v-if="props.isLoading && !isComplete" class="progress-stripes stripes-forward"></div>
        </div>

        <div class="progress-text">
          <span class="count">{{ props.loaded }}/{{ props.total }}</span>
          <span class="percent">({{ props.percentage }}%)</span>
          <span v-if="props.isPaused" class="paused-badge">⏸</span>
        </div>
      </div>
    </div>

    <div class="status-badge" :class="statusClass">
      <el-icon v-if="isComplete"><Check /></el-icon>
      <el-icon v-else-if="props.isLoading && !props.isPaused"><Loading /></el-icon>
      <el-icon v-else-if="props.isPaused"><VideoPause /></el-icon>
      <span>{{ statusText }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Refresh, Loading, Check, VideoPause, VideoPlay } from '@element-plus/icons-vue';
import {
  CHUNK_PROGRESS_CONFIG,
  LOADING_DATA_ACTIONS_PROPS_CONFIG,
  LOADING_DATA_ACTIONS_UI,
  LOADING_DATA_ACTIONS_COLORS,
  LOADING_DATA_ACTIONS_MESSAGES,
} from '../../utils/paginationOptions.js';

const props = defineProps({
  loaded: { type: Number, required: true },
  total: { type: Number, required: true },
  percentage: { type: Number, required: true },
  chunkSize: { type: Number, default: 500 },
  disabled: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  isPaused: { type: Boolean, default: false },
  showLoadMore: { type: Boolean, default: true },
  showLoadAll: { type: Boolean, default: true },
  showRefresh: { type: Boolean, default: false },
  chunkProgress: { type: Number, default: 0 },
});

const emit = defineEmits(['load-more', 'load-all', 'pause', 'resume', 'refresh']);

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

const showChunkRod = computed(() => {
  return props.isLoading && !isComplete.value && props.percentage > 0;
});

const progressBarStyle = computed(() => ({
  height: CHUNK_PROGRESS_CONFIG.HEIGHT,
  borderRadius: CHUNK_PROGRESS_CONFIG.BORDER_RADIUS,
  boxShadow: CHUNK_PROGRESS_CONFIG.BOX_SHADOW,
}));

const chunkRodStyle = computed(() => {
  const overshootValue = parseFloat(CHUNK_PROGRESS_CONFIG.CHUNK_OVERSHOOT_PERCENT);
  const isChunkLoading = props.chunkProgress > 0;
  const orangeWidth = isChunkLoading
      ? props.percentage + (props.chunkProgress / 100) * overshootValue
      : props.percentage;

  return {
    width: `${Math.min(orangeWidth, 100)}%`,
    minWidth: props.isLoading ? `${CHUNK_PROGRESS_CONFIG.CHUNK_MIN_WIDTH}` : '0',
    background: `linear-gradient(${CHUNK_PROGRESS_CONFIG.CHUNK_GRADIENT_ANGLE}, ${CHUNK_PROGRESS_CONFIG.CHUNK_COLOR} 0%, ${CHUNK_PROGRESS_CONFIG.CHUNK_COLOR_LIGHT} 100%)`,
    transition: `width ${CHUNK_PROGRESS_CONFIG.CHUNK_GROWTH_DURATION} ${CHUNK_PROGRESS_CONFIG.TRANSITION_TIMING}`,
    zIndex: CHUNK_PROGRESS_CONFIG.CHUNK_Z_INDEX,
    borderRadius: CHUNK_PROGRESS_CONFIG.BORDER_RADIUS,
  };
});

const loadedLayerStyle = computed(() => ({
  width: `${props.percentage}%`,
  background: `linear-gradient(${CHUNK_PROGRESS_CONFIG.CHUNK_GRADIENT_ANGLE}, ${CHUNK_PROGRESS_CONFIG.LOADING_COLOR} 0%, ${CHUNK_PROGRESS_CONFIG.LOADING_COLOR_LIGHT} 100%)`,
  transition: `width ${CHUNK_PROGRESS_CONFIG.CHUNK_CATCHUP_DURATION} ${CHUNK_PROGRESS_CONFIG.TRANSITION_TIMING} ${CHUNK_PROGRESS_CONFIG.CHUNK_CATCHUP_DELAY}`,
  zIndex: CHUNK_PROGRESS_CONFIG.LOADED_Z_INDEX,
  borderRadius: CHUNK_PROGRESS_CONFIG.BORDER_RADIUS,
}));

const handleLoadMore = () => {
  emit('load-more');
};

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
</script>

<style scoped>
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
  transition: all 0.3s ease;
}

.loading-data-actions.is-complete {
  background: #f0f9eb;
  border-color: #c2e7b0;
}

.loading-data-actions.is-loading {
  background: #e8f4ff;
  border-color: #b3d8ff;
}

.control-buttons {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.control-btn {
  padding: v-bind('LOADING_DATA_ACTIONS_UI.BUTTON_PADDING');
  font-size: v-bind('LOADING_DATA_ACTIONS_UI.BUTTON_FONT_SIZE');
  height: v-bind('LOADING_DATA_ACTIONS_UI.BUTTON_HEIGHT');
  min-width: auto;
  border-radius: v-bind('LOADING_DATA_ACTIONS_UI.BUTTON_BORDER_RADIUS');
  border: none;
  transition: all 0.2s;
  cursor: pointer;
}

.control-btn:disabled {
  cursor: not-allowed;
  opacity: v-bind('LOADING_DATA_ACTIONS_COLORS.DISABLED_OPACITY');
}

.control-btn :deep(.el-icon) {
  font-size: v-bind('LOADING_DATA_ACTIONS_UI.ICON_SIZE');
  margin-right: v-bind('LOADING_DATA_ACTIONS_UI.ICON_MARGIN');
  vertical-align: middle;
}

.btn-more {
  background: linear-gradient(135deg,
  v-bind('LOADING_DATA_ACTIONS_COLORS.BTN_MORE_GRADIENT_FROM'),
  v-bind('LOADING_DATA_ACTIONS_COLORS.BTN_MORE_GRADIENT_TO')
  );
  color: v-bind('LOADING_DATA_ACTIONS_COLORS.TEXT_COLOR');
}

.btn-more:hover:not(:disabled) {
  background: linear-gradient(135deg,
  v-bind('LOADING_DATA_ACTIONS_COLORS.BTN_MORE_GRADIENT_FROM_HOVER'),
  v-bind('LOADING_DATA_ACTIONS_COLORS.BTN_MORE_GRADIENT_TO_HOVER')
  );
}

.btn-main {
  background: linear-gradient(135deg,
  v-bind('LOADING_DATA_ACTIONS_COLORS.BTN_MAIN_GRADIENT_FROM'),
  v-bind('LOADING_DATA_ACTIONS_COLORS.BTN_MAIN_GRADIENT_TO')
  );
  color: v-bind('LOADING_DATA_ACTIONS_COLORS.TEXT_COLOR');
  min-width: v-bind('LOADING_DATA_ACTIONS_UI.MAIN_BUTTON_MIN_WIDTH');
}

.btn-main:hover:not(:disabled) {
  background: linear-gradient(135deg,
  v-bind('LOADING_DATA_ACTIONS_COLORS.BTN_MAIN_GRADIENT_FROM_HOVER'),
  v-bind('LOADING_DATA_ACTIONS_COLORS.BTN_MAIN_GRADIENT_TO_HOVER')
  );
}

.btn-refresh {
  background: linear-gradient(135deg,
  v-bind('LOADING_DATA_ACTIONS_COLORS.BTN_REFRESH_GRADIENT_FROM'),
  v-bind('LOADING_DATA_ACTIONS_COLORS.BTN_REFRESH_GRADIENT_TO')
  );
  color: v-bind('LOADING_DATA_ACTIONS_COLORS.TEXT_COLOR');
  padding: v-bind('LOADING_DATA_ACTIONS_UI.REFRESH_BUTTON_PADDING');
}

.btn-refresh:hover:not(:disabled) {
  background: linear-gradient(135deg,
  v-bind('LOADING_DATA_ACTIONS_COLORS.BTN_REFRESH_GRADIENT_FROM_HOVER'),
  v-bind('LOADING_DATA_ACTIONS_COLORS.BTN_REFRESH_GRADIENT_TO_HOVER')
  );
}

.progress-wrapper {
  flex: 1;
  min-width: 120px;
  position: relative;
}

.progress-bar {
  position: relative;
  width: 100%;
  overflow: hidden;
  box-shadow: v-bind('CHUNK_PROGRESS_CONFIG.BOX_SHADOW');
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

.progress-chunk-rod {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  z-index: v-bind('CHUNK_PROGRESS_CONFIG.CHUNK_Z_INDEX');
  overflow: visible;
  border-radius: v-bind('CHUNK_PROGRESS_CONFIG.BORDER_RADIUS');
}

.progress-loaded {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: v-bind('CHUNK_PROGRESS_CONFIG.BORDER_RADIUS');
  z-index: v-bind('CHUNK_PROGRESS_CONFIG.LOADED_Z_INDEX');
  overflow: hidden;
}

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
  left: v-bind('CHUNK_PROGRESS_CONFIG.STRIPES_LEFT_OFFSET');
  width: v-bind('CHUNK_PROGRESS_CONFIG.STRIPES_WIDTH');
  height: 100%;
  background: repeating-linear-gradient(
      v-bind('CHUNK_PROGRESS_CONFIG.STRIPE_ANGLE'),
      transparent,
      transparent v-bind('CHUNK_PROGRESS_CONFIG.STRIPE_WIDTH'),
      rgba(255, 255, 255, v-bind('CHUNK_PROGRESS_CONFIG.STRIPE_OPACITY')) v-bind('CHUNK_PROGRESS_CONFIG.STRIPE_WIDTH'),
      rgba(255, 255, 255, v-bind('CHUNK_PROGRESS_CONFIG.STRIPE_OPACITY')) calc(v-bind('CHUNK_PROGRESS_CONFIG.STRIPE_WIDTH') * 2)
  );
  z-index: 1;
  backface-visibility: hidden;
  transform: translateZ(0);
  animation-delay: v-bind('CHUNK_PROGRESS_CONFIG.STRIPE_ANIMATION_DELAY') !important;
}

.stripes-forward::before {
  animation: stripes-slide-left v-bind('CHUNK_PROGRESS_CONFIG.STRIPE_ANIMATION_DURATION') linear infinite;
}

.stripes-reverse::before {
  animation: stripes-slide-left v-bind('CHUNK_PROGRESS_CONFIG.STRIPE_ANIMATION_DURATION') linear infinite;
}

@keyframes stripes-slide-right {
  0% { transform: translateX(0); }
  100% { transform: translateX(v-bind('CHUNK_PROGRESS_CONFIG.STRIPES_ANIMATION_DISTANCE')); }
}

@keyframes stripes-slide-left {
  0% { transform: translateX(0); }
  100% { transform: translateX(calc(v-bind('CHUNK_PROGRESS_CONFIG.STRIPES_ANIMATION_DISTANCE') * -1)); }
}

.chunk-shine {
  position: absolute;
  top: 0;
  left: v-bind('CHUNK_PROGRESS_CONFIG.SHINE_LEFT_START');
  width: v-bind('CHUNK_PROGRESS_CONFIG.SHINE_WIDTH');
  height: 100%;
  background: linear-gradient(90deg, transparent, v-bind('CHUNK_PROGRESS_CONFIG.SHINE_COLOR'), transparent);
  animation: shine-slow v-bind('CHUNK_PROGRESS_CONFIG.SHINE_DURATION') ease-in-out infinite;
  animation-delay: v-bind('CHUNK_PROGRESS_CONFIG.SHINE_ANIMATION_DELAY') !important;
  z-index: 2;
  pointer-events: none;
  backface-visibility: hidden;
  transform: translateZ(0);
}

@keyframes shine-slow {
  0% { left: v-bind('CHUNK_PROGRESS_CONFIG.SHINE_LEFT_START'); opacity: 0; }
  15% { opacity: 1; }
  85% { opacity: 1; }
  100% { left: v-bind('CHUNK_PROGRESS_CONFIG.SHINE_LEFT_END'); opacity: 0; }
}

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
}

.progress-text .count {
  font-weight: v-bind('CHUNK_PROGRESS_CONFIG.FONT_WEIGHT');
}

.progress-text .percent {
  font-size: v-bind('CHUNK_PROGRESS_CONFIG.FONT_SIZE_PERCENTAGE');
  opacity: 0.9;
}

.progress-text .paused-badge {
  background: rgba(0, 0, 0, 0.4);
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 8px;
  font-weight: 700;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: v-bind('CHUNK_PROGRESS_CONFIG.FONT_SIZE');
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.status-badge :deep(.el-icon) {
  font-size: 11px;
}

.status-loading {
  color: v-bind('CHUNK_PROGRESS_CONFIG.LOADING_COLOR');
  background: rgba(64, 158, 255, 0.2);
}

.status-loading :deep(.el-icon) {
  animation: rotating 1.5s linear infinite;
}

.status-paused {
  color: v-bind('CHUNK_PROGRESS_CONFIG.CHUNK_COLOR');
  background: rgba(255, 149, 0, 0.2);
}

.status-success {
  color: #67c23a;
  background: rgba(103, 194, 58, 0.2);
}

.status-waiting {
  color: #909399;
  background: rgba(144, 147, 153, 0.2);
}

@keyframes rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 640px) {
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

  .status-badge {
    width: 100%;
    justify-content: center;
    order: 3;
  }
}
</style>
