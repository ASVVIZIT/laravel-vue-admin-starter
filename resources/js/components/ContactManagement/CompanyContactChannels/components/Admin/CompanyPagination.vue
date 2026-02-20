<template>
  <div class="company-pagination">
    <PageSizeSelector
        v-model="localPageSize"
        :total-items="totalItems"
        @change="handleSizeChange"
    />

    <el-pagination
        v-if="totalItems > 0"
        background
        :layout="displayConfig.layout"
        :current-page="currentPage"
        :page-size="localPageSize"
        :total="totalItems"
        :pager-count="displayConfig.pagerCount"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
        :hide-on-single-page="displayConfig.hideOnSinglePage"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import PageSizeSelector from '../Common/PageSizeSelector.vue';
import {
  COMPANY_PAGINATION_UI,
  COMPANY_PAGINATION_PROPS,
  getDefaultDisplayPaginationConfig
} from '../../utils/paginationOptions.js';

const displayConfig = getDefaultDisplayPaginationConfig();

const props = defineProps({
  currentPage: { type: Number, default: COMPANY_PAGINATION_PROPS.CURRENT_PAGE_DEFAULT },
  pageSize: { type: Number, default: COMPANY_PAGINATION_PROPS.PAGE_SIZE_DEFAULT },
  totalItems: { type: Number, default: COMPANY_PAGINATION_PROPS.TOTAL_ITEMS_DEFAULT },
  totalPages: { type: Number, default: COMPANY_PAGINATION_PROPS.TOTAL_PAGES_DEFAULT }
});

const emit = defineEmits(['page-change', 'size-change']);
const localPageSize = ref(props.pageSize);

// ← Отслеживаем изменение totalItems
watch(() => props.totalItems, (newVal, oldVal) => {
  console.log('[CompanyPagination] totalItems changed:', oldVal, '→', newVal);
});

watch(() => props.pageSize, (newVal) => {
  localPageSize.value = newVal;
});

const handlePageChange = (newPage) => emit('page-change', newPage);
const handleSizeChange = (newSize) => emit('size-change', newSize);
</script>

<style scoped>
.company-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: v-bind('COMPANY_PAGINATION_UI.GAP');
  margin-top: v-bind('COMPANY_PAGINATION_UI.MARGIN_TOP');
  padding: v-bind('COMPANY_PAGINATION_UI.PADDING');
  flex-wrap: wrap;
  width: 100%;
}

.company-pagination .el-pagination {
  justify-content: flex-end;
  flex-wrap: wrap;
}

:deep(.el-pagination) {
  font-size: 12px;
}

:deep(.el-pagination .el-pager li) {
  min-width: 24px;
  height: 24px;
  line-height: 24px;
  font-size: 12px;
  margin: 0 2px;
  border-radius: 3px;
}

:deep(.el-pagination .el-pager li.is-active) {
  font-weight: 600;
}

:deep(.el-pagination button) {
  height: 24px;
  font-size: 12px;
  padding: 0 6px;
  border-radius: 3px;
}

:deep(.el-pagination .btn-prev),
:deep(.el-pagination .btn-next) {
  min-width: 24px;
  padding: 0 4px;
}

:deep(.el-pagination__total) {
  font-size: 12px;
  margin-right: 8px;
}

:deep(.el-pagination__jump) {
  font-size: 12px;
  margin-left: 8px;
}

:deep(.el-pagination__jump .el-input) {
  width: 45px;
  margin: 0 4px;
}

:deep(.el-pagination__jump .el-input .el-input__inner) {
  height: 24px;
  font-size: 12px;
  padding: 2px 6px;
}

:deep(.el-pagination .el-select) {
  margin-right: 8px;
}

:deep(.el-pagination .el-select .el-input__wrapper) {
  height: 24px;
  font-size: 12px;
  padding: 0 8px;
}

:deep(.el-pagination .el-select .el-input__inner) {
  font-size: 12px;
}
</style>
