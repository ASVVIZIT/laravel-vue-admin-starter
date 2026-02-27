<template>
  <div class="pagination-wrapper" :class="{ 'is-recalculating': isRecalculating }">
    <transition name="fade-slide">
      <div v-if="isRecalculating" class="recalculating-banner">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>{{ PAGINATION_MESSAGES.RECALCULATING }}</span>
      </div>
    </transition>

    <transition name="fade-in" appear>
      <div class="pagination-content">
        <PageSizeSelector
            v-model="localPageSize"
            :loaded-count="props.loadedCount"
            :available-sizes="props.availableSizes"
            :disabled="isRecalculating || props.disabled"
            @change="handleSizeChange"
        />

        <div class="pagination-with-nav">
          <el-button
              v-if="showNavigation"
              size="small"
              :disabled="isFirstPage || isRecalculating || props.disabled"
              @click="goToFirstPage"
              class="pagination-nav-btn pagination-btn-first"
              :title="PAGINATION_MESSAGES.FIRST_PAGE"
              round
          >
            <el-icon><DArrowLeft /></el-icon>
          </el-button>

          <el-pagination
              background
              :layout="PAGINATOR_DISPLAY.LAYOUT"
              :current-page="props.currentPage"
              :page-size="localPageSize"
              :total="props.loadedCount"
              :pager-count="PAGINATOR_DISPLAY.PAGER_COUNT"
              :hide-on-single-page="PAGINATOR_DISPLAY.HIDE_ON_SINGLE"
              :disabled="isRecalculating || props.disabled"
              @current-change="handlePageChange"
              @size-change="handleSizeChange"
              class="compact-pagination"
          />

          <el-button
              v-if="showNavigation"
              size="small"
              :disabled="isLastPage || isRecalculating || props.disabled"
              @click="goToLastPage"
              class="pagination-nav-btn pagination-btn-last"
              :title="PAGINATION_MESSAGES.LAST_PAGE"
              round
          >
            <el-icon><DArrowRight /></el-icon>
          </el-button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { Loading, DArrowLeft, DArrowRight } from '@element-plus/icons-vue';
import PageSizeSelector from './PageSizeSelector.vue';
import {
  PAGINATION_PROPS_CONFIG,
  PAGINATION_UI,
  PAGINATOR_DISPLAY,
  PAGINATION_MESSAGES,
  BREAKPOINTS,
  ANIMATIONS,
  TIMINGS,
  COLORS,
} from '../../config/appConfigIndex.js';

const props = defineProps({...PAGINATION_PROPS_CONFIG});

const emit = defineEmits(['page-change', 'size-change']);

const localPageSize = ref(props.pageSize);
const isRecalculating = ref(false);
const showFirstLastButtons = ref(true);

const totalPages = computed(() => {
  if (props.loadedCount === 0) return 1;
  return Math.ceil(props.loadedCount / localPageSize.value);
});

const isFirstPage = computed(() => props.currentPage === 1);

const isLastPage = computed(() => props.currentPage === totalPages.value);

const showNavigation = computed(() => {
  return showFirstLastButtons.value && totalPages.value > 1;
});

watch(() => props.loadedCount, (newVal, oldVal) => {
  if (newVal !== oldVal && newVal > 0) {
    startRecalculation();
  }
});

watch(() => props.pageSize, (newVal) => {
  localPageSize.value = newVal;
});

const startRecalculation = () => {
  isRecalculating.value = true;
  setTimeout(() => {
    isRecalculating.value = false;
  }, PAGINATION_UI.RECALCULATING_DURATION);
};

const goToFirstPage = () => {
  if (isFirstPage.value || isRecalculating.value || props.disabled) return;
  emit('page-change', 1);
};

const goToLastPage = () => {
  if (isLastPage.value || isRecalculating.value || props.disabled) return;
  emit('page-change', totalPages.value);
};

const handlePageChange = (newPage) => {
  if (isRecalculating.value) return;
  emit('page-change', newPage);
};

const handleSizeChange = (newSize) => {
  if (isRecalculating.value) return;
  emit('size-change', newSize);
};
</script>

<style scoped>
.pagination-wrapper {
  position: relative;
  width: 100%;
  margin-top: v-bind('PAGINATION_UI.MARGIN_TOP');
  padding: v-bind('PAGINATION_UI.PADDING');
}

.recalculating-banner {
  position: absolute;
  top: v-bind('PAGINATION_UI.RECALCULATING_BANNER_TOP');
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 9px;
  color: v-bind('COLORS.PRIMARY');
  font-weight: 600;
  padding: 4px 12px;
  background: linear-gradient(135deg, #e8f4ff 0%, #d0e8ff 100%);
  border: 1px solid #b3d8ff;
  border-radius: 12px;
  white-space: nowrap;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
  animation: bannerPulse v-bind('ANIMATIONS.TRANSITION_SLOW') ease-in-out infinite;
}

@keyframes bannerPulse {
  0%, 100% { box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2); }
  50% { box-shadow: 0 2px 12px rgba(64, 158, 255, 0.4); }
}

.recalculating-banner :deep(.el-icon) {
  font-size: 12px;
  animation: v-bind('ANIMATIONS.SPINNER_ROTATION');
}

.pagination-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: v-bind('PAGINATION_UI.GAP');
  flex-wrap: wrap;
  width: 100%;
}

.pagination-with-nav {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  justify-content: flex-end;
}

.pagination-nav-btn {
  height: v-bind('PAGINATION_UI.BUTTON_HEIGHT');
  min-width: v-bind('PAGINATION_UI.BUTTON_HEIGHT');
  padding: 0 8px;
  border-radius: v-bind('PAGINATION_UI.BORDER_RADIUS');
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all v-bind('ANIMATIONS.TRANSITION_NORMAL') v-bind('ANIMATIONS.EASING_EASE');
  font-weight: 500;
}

.pagination-nav-btn :deep(.el-icon) {
  font-size: v-bind('PAGINATION_UI.FONT_SIZE');
}

.pagination-nav-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pagination-nav-btn:active:not(:disabled) {
  transform: translateY(0);
}

.pagination-nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

.pagination-btn-first {
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eaed 100%);
  border: 1px solid #dcdfe6;
  color: v-bind('COLORS.INFO');
}

.pagination-btn-first:hover:not(:disabled) {
  background: linear-gradient(135deg, #ecf5ff 0%, #d9ecff 100%);
  border-color: v-bind('COLORS.PRIMARY');
  color: v-bind('COLORS.PRIMARY');
}

.pagination-btn-last {
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eaed 100%);
  border: 1px solid #dcdfe6;
  color: v-bind('COLORS.INFO');
}

.pagination-btn-last:hover:not(:disabled) {
  background: linear-gradient(135deg, #ecf5ff 0%, #d9ecff 100%);
  border-color: v-bind('COLORS.PRIMARY');
  color: v-bind('COLORS.PRIMARY');
}

.compact-pagination {
  justify-content: flex-end;
  flex-wrap: wrap;
}

.compact-pagination :deep(.el-pagination) {
  font-size: v-bind('PAGINATION_UI.FONT_SIZE');
}

.compact-pagination :deep(.el-pagination .el-pager li) {
  min-width: v-bind('PAGINATION_UI.BUTTON_WIDTH');
  height: v-bind('PAGINATION_UI.BUTTON_HEIGHT');
  line-height: v-bind('PAGINATION_UI.BUTTON_HEIGHT');
  font-size: v-bind('PAGINATION_UI.FONT_SIZE');
  margin: v-bind('PAGINATION_UI.BUTTON_MARGIN');
  border-radius: v-bind('PAGINATION_UI.BORDER_RADIUS');
  padding: v-bind('PAGINATION_UI.BUTTON_PADDING');
  font-weight: 400;
  transition: all v-bind('ANIMATIONS.TRANSITION_NORMAL') v-bind('ANIMATIONS.EASING_EASE');
}

.compact-pagination :deep(.el-pagination .el-pager li.is-active) {
  font-weight: 600;
  background-color: v-bind('COLORS.PRIMARY');
  color: #FFFFFF;
  transform: scale(1.05);
}

.compact-pagination :deep(.el-pagination .el-pager li:not(.is-active):hover) {
  background-color: #ecf5ff;
  color: v-bind('COLORS.PRIMARY');
}

.compact-pagination :deep(.el-pagination button) {
  height: v-bind('PAGINATION_UI.BUTTON_HEIGHT');
  font-size: v-bind('PAGINATION_UI.FONT_SIZE');
  padding: v-bind('PAGINATION_UI.BUTTON_PADDING');
  border-radius: v-bind('PAGINATION_UI.BORDER_RADIUS');
  min-width: v-bind('PAGINATION_UI.BUTTON_WIDTH');
  font-weight: 500;
  transition: all v-bind('ANIMATIONS.TRANSITION_NORMAL') v-bind('ANIMATIONS.EASING_EASE');
}

.compact-pagination :deep(.el-pagination .btn-prev),
.compact-pagination :deep(.el-pagination .btn-next) {
  min-width: v-bind('PAGINATION_UI.BUTTON_WIDTH');
  padding: 0 3px;
}

.compact-pagination :deep(.el-pagination .btn-prev .el-icon),
.compact-pagination :deep(.el-pagination .btn-next .el-icon) {
  font-size: v-bind('PAGINATION_UI.FONT_SIZE');
}

.compact-pagination :deep(.el-pagination__total) {
  font-size: v-bind('PAGINATION_UI.FONT_SIZE');
  margin-right: v-bind('PAGINATION_UI.TOTAL_MARGIN');
  color: v-bind('COLORS.INFO');
  font-weight: 500;
}

.compact-pagination :deep(.el-pagination__jump) {
  font-size: v-bind('PAGINATION_UI.FONT_SIZE');
  margin-left: v-bind('PAGINATION_UI.JUMP_MARGIN');
  color: v-bind('COLORS.INFO');
}

.compact-pagination :deep(.el-pagination__jump .el-input) {
  width: v-bind('PAGINATION_UI.INPUT_WIDTH');
  margin: 0 3px;
}

.compact-pagination :deep(.el-pagination__jump .el-input .el-input__inner) {
  height: v-bind('PAGINATION_UI.INPUT_HEIGHT');
  font-size: v-bind('PAGINATION_UI.FONT_SIZE');
  padding: v-bind('PAGINATION_UI.INPUT_PADDING');
  border-radius: v-bind('PAGINATION_UI.BORDER_RADIUS');
}

.compact-pagination :deep(.el-pagination .el-select) {
  margin-right: v-bind('PAGINATION_UI.TOTAL_MARGIN');
}

.compact-pagination :deep(.el-pagination .el-select .el-input__wrapper) {
  height: v-bind('PAGINATION_UI.SELECT_HEIGHT');
  padding: 0 4px;
  box-shadow: none;
}

.compact-pagination :deep(.el-pagination .el-select .el-input__inner) {
  font-size: v-bind('PAGINATION_UI.FONT_SIZE');
  height: v-bind('PAGINATION_UI.SELECT_HEIGHT');
}

.compact-pagination :deep(.el-select-dropdown__item) {
  font-size: v-bind('PAGINATION_UI.FONT_SIZE');
  padding: v-bind('PAGINATION_UI.DROPDOWN_PADDING');
  min-height: v-bind('PAGINATION_UI.BUTTON_HEIGHT');
  transition: background-color v-bind('ANIMATIONS.TRANSITION_FAST') v-bind('ANIMATIONS.EASING_EASE');
}

/* ============================================================================
   АНИМАЦИИ TRANSITION
   ============================================================================ */
.fade-in-enter-active,
.fade-in-leave-active {
  transition: opacity v-bind('ANIMATIONS.TRANSITION_SLOW') v-bind('ANIMATIONS.EASING_EASE'),
  transform v-bind('ANIMATIONS.TRANSITION_SLOW') v-bind('ANIMATIONS.EASING_EASE');
}

.fade-in-enter-from,
.fade-in-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all v-bind('ANIMATIONS.TRANSITION_NORMAL') v-bind('ANIMATIONS.EASING_EASE');
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translate(-50%, -10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}

/* ============================================================================
   АДАПТИВ — ПЛАНШЕТЫ (577px - 768px)
   ============================================================================ */
@media (max-width: v-bind('BREAKPOINTS.XXXL')) {
  .pagination-with-nav {
    justify-content: center;
    width: 100%;
  }

  .pagination-content {
    justify-content: center;
  }

  .recalculating-banner {
    top: v-bind('PAGINATION_UI.RECALCULATING_BANNER_TOP_MOBILE');
    font-size: 8px;
    padding: 3px 10px;
  }
}

/* ============================================================================
   АДАПТИВ — МОБИЛЬНЫЕ (321px - 576px)
   ============================================================================ */
@media (max-width: v-bind('BREAKPOINTS.XL')) {
  .pagination-wrapper {
    margin-top: 6px;
  }

  .pagination-content {
    justify-content: center;
    gap: 6px;
  }

  .pagination-with-nav {
    flex-wrap: wrap;
    justify-content: center;
  }

  .compact-pagination {
    justify-content: center;
  }

  .pagination-nav-btn {
    height: 24px;
    min-width: 24px;
  }

  .pagination-nav-btn :deep(.el-icon) {
    font-size: 10px;
  }
}

/* ============================================================================
   АДАПТИВ — ОЧЕНЬ МАЛЕНЬКИЕ ЭКРАНЫ (≤320px)
   ============================================================================ */
@media (max-width: v-bind('BREAKPOINTS.XS')) {
  .pagination-wrapper {
    margin-top: 4px;
    padding: 2px 0;
  }

  .recalculating-banner {
    top: -18px;
    font-size: 7px;
    padding: 2px 8px;
  }

  .pagination-content {
    gap: 4px;
  }

  .pagination-nav-btn {
    height: 20px;
    min-width: 20px;
    padding: 0 4px;
  }

  .pagination-nav-btn :deep(.el-icon) {
    font-size: 8px;
  }

  .compact-pagination :deep(.el-pagination .el-pager li) {
    min-width: 20px;
    height: 20px;
    line-height: 20px;
    font-size: 9px;
    margin: 0 1px;
  }

  .compact-pagination :deep(.el-pagination button) {
    height: 20px;
    font-size: 9px;
    min-width: 20px;
  }

  .compact-pagination :deep(.el-pagination__total) {
    font-size: 8px;
    margin-right: 4px;
  }

  .compact-pagination :deep(.el-pagination__jump) {
    font-size: 8px;
    margin-left: 4px;
  }

  .compact-pagination :deep(.el-pagination__jump .el-input) {
    width: 28px;
  }

  .compact-pagination :deep(.el-pagination__jump .el-input .el-input__inner) {
    height: 18px;
    font-size: 8px;
    padding: 0 2px;
  }
}

/* ============================================================================
   TOUCH DEVICES — УЛУЧШЕННАЯ ВИДИМОСТЬ
   ============================================================================ */
@media (hover: none) and (pointer: coarse) {
  .pagination-nav-btn {
    min-height: 44px;
    min-width: 44px;
    padding: 10px 16px;
  }

  .pagination-nav-btn :deep(.el-icon) {
    font-size: 18px;
  }

  .compact-pagination :deep(.el-pagination .el-pager li) {
    min-width: 36px;
    height: 36px;
    line-height: 36px;
    font-size: 14px;
    margin: 0 2px;
  }

  .compact-pagination :deep(.el-pagination button) {
    height: 36px;
    font-size: 14px;
    min-width: 36px;
    padding: 0 8px;
  }

  .compact-pagination :deep(.el-pagination__total) {
    font-size: 12px;
    margin-right: 8px;
  }

  .compact-pagination :deep(.el-pagination__jump) {
    font-size: 12px;
    margin-left: 8px;
  }

  .compact-pagination :deep(.el-pagination__jump .el-input) {
    width: 50px;
  }

  .compact-pagination :deep(.el-pagination__jump .el-input .el-input__inner) {
    height: 32px;
    font-size: 14px;
    padding: 0 6px;
  }
}
</style>
