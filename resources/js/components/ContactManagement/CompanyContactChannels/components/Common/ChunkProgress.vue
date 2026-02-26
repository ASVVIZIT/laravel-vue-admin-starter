<template>
  <div class="chunk-progress-container">
    <div class="spinner-wrapper" :class="{ 'is-complete': isComplete, 'is-loading': props.isLoading, 'is-error': isError }">
      <el-icon class="spinner-icon">
        <Loading v-if="!isComplete && !isError" />
        <Check v-else-if="isComplete" />
        <Close v-else />
      </el-icon>
    </div>

    <div class="progress-bar-wrapper">
      <el-progress
          :percentage="displayPercentage"
          :status="progressStatus"
          :stroke-width="CHUNK_PROGRESS_CONFIG.HEIGHT.replace('px', '')"
          :text-inside="true"
          :show-text="true"
          class="progress-bar"
          :class="{ 'is-loading': props.isLoading, 'is-complete': isComplete, 'is-error': isError }"
          :duration="CHUNK_PROGRESS_CONFIG.TRANSITION_DURATION.replace('s', '')"
      >
        <template #default="{ percentage: progressPercentage }">
          <div class="progress-text">
            <span class="progress-label">{{ props.loaded }}/{{ props.total }}</span>
            <span class="progress-percentage">({{ progressPercentage }}%)</span>
          </div>
        </template>
      </el-progress>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Loading, Check, Close } from '@element-plus/icons-vue';
import {
  CHUNK_PROGRESS_CONFIG,
  CHUNK_PROGRESS_PROPS_CONFIG,
  BREAKPOINTS,
  ANIMATIONS,
  TIMINGS,
  COLORS,
  LOADING_DATA_ACTIONS_COLORS,
} from '../../utils/appConfig.js';

const props = defineProps(CHUNK_PROGRESS_PROPS_CONFIG);

// ✅ ОПРЕДЕЛЯЕМ ЗАВЕРШЕНИЕ
const isComplete = computed(() => {
  return props.percentage >= 100 && !props.error;
});

// ✅ ОПРЕДЕЛЯЕМ ОШИБКУ
const isError = computed(() => {
  return props.error === true || props.status === 'exception';
});

// ✅ СТАТУС ДЛЯ EL-PROGRESS
const progressStatus = computed(() => {
  if (isError.value) return 'exception';
  if (isComplete.value) return 'success';
  return undefined;
});

// ✅ РАСЧЁТ ПРОЦЕНТА С УЧЁТОМ CHUNK PROGRESS
const displayPercentage = computed(() => {
  if (isError.value) return 100;
  if (isComplete.value) return 100;

  // ✅ Добавляем chunk progress к основному проценту
  const chunkBonus = props.isLoading ? (props.chunkProgress / 10) : 0;
  return Math.min(Math.round(props.percentage + chunkBonus), 100);
});
</script>

<style scoped>
.chunk-progress-container {
  width: 100%;
  padding: 4px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.spinner-wrapper {
  width: 24px;
  height: 24px;
  min-width: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, v-bind('COLORS.INFO') 0%, v-bind('LOADING_DATA_ACTIONS_COLORS.BTN_REFRESH_GRADIENT_FROM') 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: v-bind('CHUNK_PROGRESS_CONFIG.BOX_SHADOW');
  transition: background v-bind('ANIMATIONS.TRANSITION_NORMAL') v-bind('ANIMATIONS.EASING_EASE'),
  box-shadow v-bind('ANIMATIONS.TRANSITION_NORMAL') v-bind('ANIMATIONS.EASING_EASE');
}

.spinner-wrapper:not(.is-loading):not(.is-complete):not(.is-error) {
  background: linear-gradient(135deg, v-bind('COLORS.INFO') 0%, v-bind('LOADING_DATA_ACTIONS_COLORS.BTN_REFRESH_GRADIENT_FROM') 100%);
}

.spinner-wrapper.is-loading:not(.is-complete):not(.is-error) {
  background: linear-gradient(135deg, v-bind('CHUNK_PROGRESS_CONFIG.LOADING_COLOR') 0%, v-bind('CHUNK_PROGRESS_CONFIG.LOADING_COLOR_LIGHT') 100%);
  box-shadow: v-bind('CHUNK_PROGRESS_CONFIG.CHUNK_SHADOW');
}

.spinner-wrapper.is-complete {
  background: linear-gradient(135deg, v-bind('COLORS.SUCCESS') 0%, v-bind('LOADING_DATA_ACTIONS_COLORS.BTN_MORE_GRADIENT_FROM') 100%);
  box-shadow: 0 2px 4px rgba(103, 194, 58, 0.3);
}

.spinner-wrapper.is-error {
  background: linear-gradient(135deg, v-bind('COLORS.DANGER') 0%, v-bind('LOADING_DATA_ACTIONS_COLORS.BTN_DELETE_GRADIENT_FROM') 100%);
  box-shadow: 0 2px 4px rgba(245, 108, 108, 0.3);
}

.spinner-icon {
  font-size: 14px;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-wrapper.is-loading:not(.is-complete):not(.is-error) .spinner-icon {
  animation: rotating 1s linear infinite;
}

.progress-bar-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  min-width: 0;
}

.progress-bar {
  width: 100%;
}

.progress-bar :deep(.el-progress) {
  display: block;
}

.progress-bar :deep(.el-progress-bar) {
  margin-right: 0;
  padding: 0;
}

.progress-bar :deep(.el-progress-bar__outer) {
  background-color: v-bind('CHUNK_PROGRESS_CONFIG.BACKGROUND_COLOR');
  border-radius: v-bind('CHUNK_PROGRESS_CONFIG.BORDER_RADIUS');
  height: v-bind('CHUNK_PROGRESS_CONFIG.HEIGHT') !important;
  line-height: v-bind('CHUNK_PROGRESS_CONFIG.HEIGHT') !important;
  padding: 0;
  margin: 0;
  overflow: hidden;
  box-shadow: v-bind('CHUNK_PROGRESS_CONFIG.BOX_SHADOW');
}

.progress-bar:not(.is-loading):not(.is-error) :deep(.el-progress-bar__inner) {
  background: linear-gradient(90deg, v-bind('COLORS.INFO') 0%, v-bind('LOADING_DATA_ACTIONS_COLORS.BTN_REFRESH_GRADIENT_FROM') 100%);
  transition: width v-bind('CHUNK_PROGRESS_CONFIG.TRANSITION_DURATION') v-bind('CHUNK_PROGRESS_CONFIG.TRANSITION_TIMING');
}

.progress-bar.is-loading:not(.is-complete):not(.is-error) :deep(.el-progress-bar__inner) {
  background: linear-gradient(90deg, v-bind('CHUNK_PROGRESS_CONFIG.LOADING_COLOR') 0%, v-bind('CHUNK_PROGRESS_CONFIG.LOADING_COLOR_LIGHT') 100%);
  animation: progress-stripes v-bind('CHUNK_PROGRESS_CONFIG.STRIPE_ANIMATION_DURATION') linear infinite;
  background-image: linear-gradient(
      v-bind('CHUNK_PROGRESS_CONFIG.STRIPE_ANGLE'),
      rgba(255, 255, 255, v-bind('CHUNK_PROGRESS_CONFIG.STRIPE_OPACITY')) 25%,
      transparent 25%,
      transparent 50%,
      rgba(255, 255, 255, v-bind('CHUNK_PROGRESS_CONFIG.STRIPE_OPACITY')) 50%,
      rgba(255, 255, 255, v-bind('CHUNK_PROGRESS_CONFIG.STRIPE_OPACITY')) 75%,
      transparent 75%,
      transparent
  );
  background-size: v-bind('CHUNK_PROGRESS_CONFIG.STRIPE_WIDTH') v-bind('CHUNK_PROGRESS_CONFIG.STRIPE_WIDTH');
}

.progress-bar.is-complete :deep(.el-progress-bar__inner),
.progress-bar :deep(.el-progress-bar__inner.is-success) {
  background: linear-gradient(90deg, v-bind('COLORS.SUCCESS') 0%, v-bind('LOADING_DATA_ACTIONS_COLORS.BTN_MORE_GRADIENT_FROM') 100%);
  transition: width v-bind('CHUNK_PROGRESS_CONFIG.TRANSITION_DURATION') v-bind('CHUNK_PROGRESS_CONFIG.TRANSITION_TIMING');
}

.progress-bar.is-error :deep(.el-progress-bar__inner),
.progress-bar :deep(.el-progress-bar__inner.is-exception) {
  background: linear-gradient(90deg, v-bind('COLORS.DANGER') 0%, v-bind('LOADING_DATA_ACTIONS_COLORS.BTN_DELETE_GRADIENT_FROM') 100%);
}

.progress-bar :deep(.el-progress__text) {
  display: none;
}

.progress-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: v-bind('CHUNK_PROGRESS_CONFIG.HEIGHT');
  line-height: v-bind('CHUNK_PROGRESS_CONFIG.HEIGHT');
  position: absolute;
  width: 100%;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  z-index: v-bind('CHUNK_PROGRESS_CONFIG.LOADED_Z_INDEX');
}

.progress-label {
  font-size: v-bind('CHUNK_PROGRESS_CONFIG.FONT_SIZE');
  color: v-bind('CHUNK_PROGRESS_CONFIG.TEXT_COLOR');
  font-weight: v-bind('CHUNK_PROGRESS_CONFIG.FONT_WEIGHT');
  white-space: nowrap;
  text-shadow: v-bind('CHUNK_PROGRESS_CONFIG.TEXT_SHADOW');
}

.progress-percentage {
  font-size: v-bind('CHUNK_PROGRESS_CONFIG.FONT_SIZE_PERCENTAGE');
  color: rgba(255, 255, 255, 0.95);
  font-weight: 500;
  white-space: nowrap;
}

@keyframes progress-stripes {
  from {
    background-position: 0 0;
  }
  to {
    background-position: v-bind('CHUNK_PROGRESS_CONFIG.STRIPES_ANIMATION_DISTANCE') 0;
  }
}

@keyframes rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.progress-bar.is-loading:not(.is-complete):not(.is-error) :deep(.el-progress-bar__inner)::before {
  content: '';
  position: absolute;
  top: 0;
  left: v-bind('CHUNK_PROGRESS_CONFIG.SHINE_LEFT_START');
  width: v-bind('CHUNK_PROGRESS_CONFIG.SHINE_WIDTH');
  height: 100%;
  background: linear-gradient(
      to right,
      transparent 0%,
      v-bind('CHUNK_PROGRESS_CONFIG.SHINE_COLOR') 50%,
      transparent 100%
  );
  transform: skewX(-25deg);
  animation: shine v-bind('CHUNK_PROGRESS_CONFIG.SHINE_DURATION') ease-in-out infinite;
  animation-delay: v-bind('CHUNK_PROGRESS_CONFIG.SHINE_ANIMATION_DELAY');
}

@keyframes shine {
  0% {
    left: v-bind('CHUNK_PROGRESS_CONFIG.SHINE_LEFT_START');
  }
  100% {
    left: v-bind('CHUNK_PROGRESS_CONFIG.SHINE_LEFT_END');
  }
}

@media (max-width: v-bind('BREAKPOINTS.XXXL')) {
  .chunk-progress-container {
    gap: 8px;
  }

  .spinner-wrapper {
    width: 22px;
    height: 22px;
    min-width: 22px;
  }

  .spinner-icon {
    font-size: 12px;
  }

  .progress-label {
    font-size: v-bind('CHUNK_PROGRESS_CONFIG.FONT_SIZE_PERCENTAGE');
  }
}

@media (max-width: v-bind('BREAKPOINTS.XL')) {
  .chunk-progress-container {
    gap: 6px;
    padding: 3px 0;
  }

  .spinner-wrapper {
    width: 20px;
    height: 20px;
    min-width: 20px;
  }

  .spinner-icon {
    font-size: 11px;
  }

  .progress-bar :deep(.el-progress-bar__outer) {
    height: 16px !important;
    line-height: 16px !important;
  }

  .progress-text {
    height: 16px;
    line-height: 16px;
  }

  .progress-label {
    font-size: 10px;
  }

  .progress-percentage {
    font-size: 9px;
  }
}

@media (max-width: v-bind('BREAKPOINTS.XS')) {
  .chunk-progress-container {
    gap: 4px;
    padding: 2px 0;
  }

  .spinner-wrapper {
    width: 18px;
    height: 18px;
    min-width: 18px;
  }

  .spinner-icon {
    font-size: 10px;
  }

  .progress-bar :deep(.el-progress-bar__outer) {
    height: 14px !important;
    line-height: 14px !important;
  }

  .progress-text {
    height: 14px;
    line-height: 14px;
  }

  .progress-label {
    font-size: 9px;
  }

  .progress-percentage {
    font-size: 8px;
  }
}

@media (hover: none) and (pointer: coarse) {
  .spinner-wrapper {
    width: 28px;
    height: 28px;
    min-width: 28px;
  }

  .spinner-icon {
    font-size: 16px;
  }

  .progress-bar :deep(.el-progress-bar__outer) {
    height: 24px !important;
    line-height: 24px !important;
  }

  .progress-text {
    height: 24px;
    line-height: 24px;
  }

  .progress-label {
    font-size: 11px;
  }

  .progress-percentage {
    font-size: 10px;
  }
}
</style>
