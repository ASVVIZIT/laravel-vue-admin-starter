<template>
  <div class="pagination-wrapper" :class="{ 'is-recalculating': isRecalculating }">
    <!-- ★★★ ИНДИКАТОР ПЕРЕСЧЕТА ★★★ -->
    <transition name="fade-slide">
      <div v-if="isRecalculating" class="recalculating-banner">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>Пересчет...</span>
      </div>
    </transition>

    <!-- ★★★ ОСНОВНОЙ КОНТЕНТ ★★★ -->
    <transition name="fade-in" appear>
      <div class="pagination-content">
        <!-- Выбор размера страницы -->
        <PageSizeSelector
            v-model="localPageSize"
            :loaded-count="props.loadedCount"
            :available-sizes="props.availableSizes"
            :disabled="isRecalculating || props.disabled"
            @change="handleSizeChange"
        />

        <!-- ★★★ ПАГИНАЦИЯ С КНОПКАМИ FIRST/LAST ★★★ -->
        <div class="pagination-with-nav">
          <!-- КНОПКА "ПЕРВАЯ СТРАНИЦА" -->
          <el-button
              v-if="showNavigation"
              size="small"
              :disabled="isFirstPage || isRecalculating || props.disabled"
              @click="goToFirstPage"
              class="pagination-nav-btn pagination-btn-first"
              title="Первая страница"
              round
          >
            <el-icon><DArrowLeft /></el-icon>
          </el-button>

          <!-- ОСНОВНОЙ EL-PAGINATION -->
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

          <!-- КНОПКА "ПОСЛЕДНЯЯ СТРАНИЦА" -->
          <el-button
              v-if="showNavigation"
              size="small"
              :disabled="isLastPage || isRecalculating || props.disabled"
              @click="goToLastPage"
              class="pagination-nav-btn pagination-btn-last"
              title="Последняя страница"
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
  PAGINATION_UI,
  PAGINATION_PROPS_CONFIG,
  PAGINATOR_DISPLAY,
} from '../../utils/paginationOptions.js';

// ============================================================================
// PROPS
// ============================================================================

const props = defineProps({
  currentPage: { type: Number, default: 1 },
  pageSize: { type: Number, default: 15 },
  loadedCount: { type: Number, required: true },
  totalItems: { type: Number, default: 0 },
  availableSizes: { type: Array, required: true },
  disabled: { type: Boolean, default: false },
});

// ============================================================================
// EMITS
// ============================================================================

const emit = defineEmits(['page-change', 'size-change']);

// ============================================================================
// STATE
// ============================================================================

const localPageSize = ref(props.pageSize);
const isRecalculating = ref(false);
const showFirstLastButtons = ref(true);

// ============================================================================
// COMPUTED
// ============================================================================

const totalPages = computed(() => {
  if (props.loadedCount === 0) return 1;
  return Math.ceil(props.loadedCount / localPageSize.value);
});

const isFirstPage = computed(() => props.currentPage === 1);

const isLastPage = computed(() => props.currentPage === totalPages.value);

const showNavigation = computed(() => {
  return showFirstLastButtons.value && totalPages.value > 1;
});

// ============================================================================
// WATCH
// ============================================================================

watch(() => props.loadedCount, (newVal, oldVal) => {
  if (newVal !== oldVal && newVal > 0) {
    startRecalculation();
  }
});

watch(() => props.pageSize, (newVal) => {
  localPageSize.value = newVal;
});

// ============================================================================
// МЕТОДЫ
// ============================================================================

const startRecalculation = () => {
  isRecalculating.value = true;
  setTimeout(() => {
    isRecalculating.value = false;
  }, 150);
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
/* ============================================================================
   ГЛАВНЫЙ КОНТЕЙНЕР
   ============================================================================ */

.pagination-wrapper {
  position: relative;
  width: 100%;
  margin-top: v-bind('PAGINATION_UI.MARGIN_TOP');
  padding: v-bind('PAGINATION_UI.PADDING');
}

/* ============================================================================
   ИНДИКАТОР ПЕРЕСЧЕТА
   ============================================================================ */

.recalculating-banner {
  position: absolute;
  top: -16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 9px;
  color: #409EFF;
  font-weight: 600;
  padding: 4px 12px;
  background: linear-gradient(135deg, #e8f4ff 0%, #d0e8ff 100%);
  border: 1px solid #b3d8ff;
  border-radius: 12px;
  white-space: nowrap;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.recalculating-banner :deep(.el-icon) {
  font-size: 12px;
  animation: rotating 1s linear infinite;
}

@keyframes rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ============================================================================
   КОНТЕНТ ПАГИНАЦИИ
   ============================================================================ */

.pagination-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: v-bind('PAGINATION_UI.GAP');
  flex-wrap: wrap;
  width: 100%;
}

/* ============================================================================
   КОНТЕЙНЕР С КНОПКАМИ НАВИГАЦИИ
   ============================================================================ */

.pagination-with-nav {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  justify-content: flex-end;
}

/* ============================================================================
   КНОПКИ FIRST/LAST
   ============================================================================ */

.pagination-nav-btn {
  height: v-bind('PAGINATION_UI.BUTTON_HEIGHT');
  min-width: v-bind('PAGINATION_UI.BUTTON_HEIGHT');
  padding: 0 8px;
  border-radius: v-bind('PAGINATION_UI.BORDER_RADIUS');
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
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

/* Первая страница */
.pagination-btn-first {
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eaed 100%);
  border: 1px solid #dcdfe6;
  color: #606266;
}

.pagination-btn-first:hover:not(:disabled) {
  background: linear-gradient(135deg, #ecf5ff 0%, #d9ecff 100%);
  border-color: #409EFF;
  color: #409EFF;
}

/* Последняя страница */
.pagination-btn-last {
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eaed 100%);
  border: 1px solid #dcdfe6;
  color: #606266;
}

.pagination-btn-last:hover:not(:disabled) {
  background: linear-gradient(135deg, #ecf5ff 0%, #d9ecff 100%);
  border-color: #409EFF;
  color: #409EFF;
}

/* ============================================================================
   ОСНОВНАЯ ПАГИНАЦИЯ
   ============================================================================ */

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
  transition: all 0.2s ease;
}

.compact-pagination :deep(.el-pagination .el-pager li.is-active) {
  font-weight: 600;
  background-color: #409EFF;
  color: #FFFFFF;
  transform: scale(1.05);
}

.compact-pagination :deep(.el-pagination .el-pager li:not(.is-active):hover) {
  background-color: #ecf5ff;
  color: #409EFF;
}

.compact-pagination :deep(.el-pagination button) {
  height: v-bind('PAGINATION_UI.BUTTON_HEIGHT');
  font-size: v-bind('PAGINATION_UI.FONT_SIZE');
  padding: v-bind('PAGINATION_UI.BUTTON_PADDING');
  border-radius: v-bind('PAGINATION_UI.BORDER_RADIUS');
  min-width: v-bind('PAGINATION_UI.BUTTON_WIDTH');
  font-weight: 500;
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
  color: #606266;
  font-weight: 500;
}

.compact-pagination :deep(.el-pagination__jump) {
  font-size: v-bind('PAGINATION_UI.FONT_SIZE');
  margin-left: v-bind('PAGINATION_UI.JUMP_MARGIN');
  color: #606266;
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
}

/* ============================================================================
   АНИМАЦИИ
   ============================================================================ */

.fade-in-enter-active,
.fade-in-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.fade-in-enter-from,
.fade-in-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
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
   АДАПТИВНОСТЬ
   ============================================================================ */

@media (max-width: 768px) {
  .pagination-with-nav {
    justify-content: center;
    width: 100%;
  }

  .pagination-content {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .pagination-wrapper {
    margin-top: 6px;
  }

  .recalculating-banner {
    top: -20px;
    font-size: 8px;
    padding: 3px 10px;
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
}
</style>
