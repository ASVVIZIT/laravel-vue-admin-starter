<template>
  <div class="chunk-progress-container">
    <div class="spinner-wrapper" :class="{ 'is-complete': isComplete, 'is-loading': props.isLoading }">
      <el-icon class="spinner-icon">
        <Loading v-if="!isComplete" />
        <Check v-else />
      </el-icon>
    </div>

    <div class="progress-bar-wrapper">
      <el-progress
          :percentage="displayPercentage"
          :status="isComplete ? 'success' : undefined"
          :stroke-width="CHUNK_PROGRESS_CONFIG.HEIGHT.replace('px', '')"
          :text-inside="true"
          :show-text="true"
          class="progress-bar"
          :class="{ 'is-loading': props.isLoading, 'is-complete': isComplete }"
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
import { Loading, Check } from '@element-plus/icons-vue';
import { CHUNK_PROGRESS_CONFIG, CHUNK_PROGRESS_PROPS_CONFIG } from '../../utils/paginationOptions.js';

const props = defineProps(CHUNK_PROGRESS_PROPS_CONFIG);

const isComplete = computed(() => {
  return props.percentage >= 100;
});

const displayPercentage = computed(() => {
  if (props.isLoading && !isComplete.value) {
    return Math.min(props.percentage + (props.chunkProgress / 10), 100);
  }
  return props.percentage;
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
  background: linear-gradient(135deg, #909399 0%, #a0a0a0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: background 0.3s ease, box-shadow 0.3s ease;
}

.spinner-wrapper:not(.is-loading):not(.is-complete) {
  background: linear-gradient(135deg, #909399 0%, #a0a0a0 100%);
}

.spinner-wrapper.is-loading:not(.is-complete) {
  background: linear-gradient(135deg, v-bind('CHUNK_PROGRESS_CONFIG.LOADING_COLOR') 0%, v-bind('CHUNK_PROGRESS_CONFIG.LOADING_COLOR_LIGHT') 100%);
  box-shadow: 0 2px 4px rgba(64, 158, 255, 0.3);
}

.spinner-wrapper.is-complete {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  box-shadow: 0 2px 4px rgba(103, 194, 58, 0.3);
}

.spinner-icon {
  font-size: 14px;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-wrapper.is-loading:not(.is-complete) .spinner-icon {
  animation: rotating 1.5s linear infinite;
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
}

.progress-bar:not(.is-loading) :deep(.el-progress-bar__inner) {
  background: linear-gradient(90deg, #909399 0%, #a0a0a0 100%);
}

.progress-bar.is-loading:not(.is-complete) :deep(.el-progress-bar__inner) {
  background: linear-gradient(90deg, v-bind('CHUNK_PROGRESS_CONFIG.LOADING_COLOR') 0%, v-bind('CHUNK_PROGRESS_CONFIG.LOADING_COLOR_LIGHT') 100%);
}

.progress-bar.is-complete :deep(.el-progress-bar__inner),
.progress-bar :deep(.el-progress-bar__inner.is-success) {
  background: linear-gradient(90deg, #67c23a 0%, #85ce61 100%);
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

@keyframes rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
