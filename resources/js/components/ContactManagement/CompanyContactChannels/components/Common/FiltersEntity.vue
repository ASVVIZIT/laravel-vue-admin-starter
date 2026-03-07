<template>
  <div class="filters-entity-container" :class="containerClass">
    <!-- ✅ INFO BADGE — НАЙДЕНО / ИЗ (КАК В COMPANIES!) -->
    <div v-if="config.UI.INFO_BADGE_SHOW" class="filters-info-badge">
      <span class="info-label">{{ config.MESSAGES.FOUND }}</span>
      <span class="info-count">{{ totalFiltered }}</span>
      <span class="info-label">{{ config.MESSAGES.OF }}</span>
      <span class="info-count">{{ totalItems }}</span>
    </div>

    <!-- ✅ ПОЛЯ ФИЛЬТРОВ -->
    <div class="filters-fields-wrapper">
      <template v-for="(field, fieldKey) in config.FIELDS" :key="fieldKey">
        <!-- ✅ SEARCH -->
        <div
            v-if="field.type === FILTER_FIELD_TYPES.SEARCH"
            class="filter-field filter-field-search"
            :style="{ width: isSearchFocused ? field.widthFocused : field.width }"
        >
          <el-input
              v-model="localFilters[field.key]"
              :placeholder="field.placeholder"
              :prefix-icon="getIconComponent(field.icon)"
              :disabled="props.disabled"
              size="small"
              clearable
              class="filter-input"
              @update:modelValue="handleDebouncedChange(field)"
              @focus="handleSearchFocus"
              @blur="handleSearchBlur"
          />
        </div>

        <!-- ✅ SELECT -->
        <div
            v-else-if="field.type === FILTER_FIELD_TYPES.SELECT"
            class="filter-field filter-field-select"
            :style="{ width: field.width }"
        >
          <el-tooltip
              :content="field.label"
              placement="top"
              :show-after="TIMINGS.TOOLTIP_DELAY"
              :hide-after="TIMINGS.TOOLTIP_HIDE_DELAY"
          >
            <el-select
                v-model="localFilters[field.key]"
                :placeholder="field.placeholder"
                :disabled="props.disabled"
                :clearable="field.clearable || false"
                :filterable="field.filterable || false"
                size="small"
                class="filter-select"
                @change="handleFilterChange(field.key)"
            >
              <el-option
                  v-for="option in field.options"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
              />
            </el-select>
          </el-tooltip>
        </div>
      </template>
    </div>

    <!-- ✅ КНОПКА СБРОСА -->
    <el-tooltip
        v-if="config.UI.RESET_BUTTON_SHOW && hasActiveFilters"
        :content="config.BUTTONS.RESET"
        placement="top"
        :show-after="TIMINGS.TOOLTIP_DELAY"
        :hide-after="TIMINGS.TOOLTIP_HIDE_DELAY"
    >
      <el-button
          :icon="RefreshLeft"
          circle
          size="small"
          :disabled="props.disabled"
          @click="handleReset"
          class="filter-reset-btn"
      />
    </el-tooltip>
  </div>
</template>

<script setup>
/**
 * ============================================================================
 * FILTERS ENTITY — УНИВЕРСАЛЬНЫЙ КОМПОНЕНТ ФИЛЬТРОВ СУЩНОСТЕЙ
 * ============================================================================
 * 📁 Путь: components/Common/FiltersEntity.vue
 * ✅ Используется: ChannelList.vue, CompanyList.vue
 * ✅ Безопасно менять — влияет только на фильтрацию
 * ✅ Зависит от: config/common/appConfigFiltersEntity.js
 * ============================================================================
 */

import { ref, computed, watch, onMounted } from 'vue';
import { RefreshLeft, Search, Sort, Picture, OfficeBuilding, Connection, CircleCheck } from '@element-plus/icons-vue';
import {
  getEntityFiltersConfig,
  getDefaultEntityFilters,
  hasActiveFilters as checkHasActiveFilters,
  FILTER_FIELD_TYPES,
  FILTERS_ENTITY_UI,
} from '@/components/ContactManagement/CompanyContactChannels/config/appConfigIndex.js';
import {
  BREAKPOINTS,
  ANIMATIONS,
  TIMINGS,
  COLORS,
} from '@/components/ContactManagement/CompanyContactChannels/config/appConfigIndex.js';

// ============================================================================
// PROPS
// ============================================================================
const props = defineProps({
  entityType: {
    type: String,
    required: true,
    validator: v => ['company', 'channel'].includes(v),
  },
  filters: {
    type: Object,
    required: true,
  },
  totalItems: {
    type: Number,
    default: 0,
  },
  totalFiltered: {
    type: Number,
    default: 0,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  dynamicOptions: {
    type: Object,
    default: () => ({}),
  },
});

// ============================================================================
// EMITS
// ============================================================================
const emit = defineEmits(['update:filters', 'reset', 'change']);

// ============================================================================
// STATE
// ============================================================================
const localFilters = ref({ ...props.filters });
const isSearchFocused = ref(false);
const searchDebounceTimer = ref(null);

// ============================================================================
// COMPUTED
// ============================================================================
const config = computed(() => {
  const cfg = getEntityFiltersConfig(props.entityType);

  // ✅ ИНИЦИАЛИЗИРУЕМ ДИНАМИЧЕСКИЕ ОПЦИИ
  if (props.dynamicOptions) {
    Object.keys(props.dynamicOptions).forEach(fieldKey => {
      const field = Object.values(cfg.FIELDS).find(f => f.key === fieldKey);
      if (field && field.type === FILTER_FIELD_TYPES.SELECT) {
        field.options = props.dynamicOptions[fieldKey];
      }
    });
  }

  return cfg;
});

const containerClass = computed(() => ({
  'has-active-filters': hasActiveFilters.value,
  'is-disabled': props.disabled,
}));

const hasActiveFilters = computed(() => {
  return checkHasActiveFilters(props.entityType, localFilters.value);
});

// ============================================================================
// ICON MAP
// ============================================================================
const iconMap = {
  Search,
  Sort,
  Picture,
  OfficeBuilding,
  Connection,
  CircleCheck,
  RefreshLeft,
};

function getIconComponent(iconName) {
  return iconMap[iconName] || null;
}

// ============================================================================
// WATCH
// ============================================================================
watch(() => props.filters, (newVal) => {
  localFilters.value = { ...newVal };
}, { deep: true });

// ============================================================================
// HANDLERS
// ============================================================================
function handleFilterChange(fieldKey) {
  console.log('🔵 [FiltersEntity] handleFilterChange:', fieldKey, localFilters.value[fieldKey]);
  emit('update:filters', { ...localFilters.value });
  emit('change', { field: fieldKey, value: localFilters.value[fieldKey] });
}

function handleDebouncedChange(field) {
  if (searchDebounceTimer.value) {
    clearTimeout(searchDebounceTimer.value);
  }

  const debounce = field.debounce || 500;

  searchDebounceTimer.value = setTimeout(() => {
    console.log('🔵 [FiltersEntity] handleDebouncedChange:', field.key, localFilters.value[field.key]);
    emit('update:filters', { ...localFilters.value });
    emit('change', { field: field.key, value: localFilters.value[field.key] });
  }, debounce);
}

function handleSearchFocus() {
  isSearchFocused.value = true;
}

function handleSearchBlur() {
  isSearchFocused.value = false;
}

function handleReset() {
  console.log('🔵 [FiltersEntity] handleReset');
  localFilters.value = getDefaultEntityFilters(props.entityType);
  emit('update:filters', { ...localFilters.value });
  emit('reset');
}

// ============================================================================
// LIFECYCLE
// ============================================================================
onMounted(() => {
  console.log('🟢 [FiltersEntity] Component mounted:', props.entityType);
});
</script>

<style scoped>
/**
 * ============================================================================
 * STYLES
 * ============================================================================
 */
.filters-entity-container {
  display: flex;
  align-items: center;
  gap: v-bind('FILTERS_ENTITY_UI.CONTAINER_GAP');
  height: v-bind('FILTERS_ENTITY_UI.CONTAINER_MIN_HEIGHT');
  padding: v-bind('FILTERS_ENTITY_UI.CONTAINER_PADDING');
  flex-wrap: nowrap;
  width: 100%;
  overflow: visible;
}

.filters-entity-container.is-disabled {
  opacity: 0.6;
  pointer-events: none;
}

/* ============================================================================
   INFO BADGE — НАЙДЕНО / ИЗ
   ============================================================================ */
.filters-info-badge {
  display: flex;
  align-items: center;
  gap: v-bind('FILTERS_ENTITY_UI.INFO_BADGE_GAP');
  flex-shrink: 0;
  white-space: nowrap;
}

.info-label {
  font-size: v-bind('FILTERS_ENTITY_UI.INFO_BADGE_FONT_SIZE');
  color: v-bind('FILTERS_ENTITY_UI.INFO_BADGE_COLOR');
  font-weight: 500;
}

.info-count {
  font-size: v-bind('FILTERS_ENTITY_UI.INFO_BADGE_FONT_SIZE');
  color: v-bind('COLORS.PRIMARY');
  font-weight: 600;
}

/* ============================================================================
   FILTERS FIELDS WRAPPER
   ============================================================================ */
.filters-fields-wrapper {
  display: flex;
  align-items: center;
  gap: v-bind('FILTERS_ENTITY_UI.CONTAINER_GAP');
  flex: 1;
  justify-content: flex-end;
  min-width: 0;
}

.filter-field {
  flex-shrink: 0;
  transition: width v-bind('ANIMATIONS.TRANSITION_NORMAL') v-bind('ANIMATIONS.EASING_EASE');
}

/* ============================================================================
   SEARCH INPUT
   ============================================================================ */
.filter-field-search :deep(.el-input__wrapper) {
  height: v-bind('FILTERS_ENTITY_UI.WRAPPER_HEIGHT') !important;
  min-height: v-bind('FILTERS_ENTITY_UI.WRAPPER_HEIGHT') !important;
  padding: v-bind('FILTERS_ENTITY_UI.WRAPPER_PADDING') !important;
  border-radius: v-bind('FILTERS_ENTITY_UI.WRAPPER_BORDER_RADIUS') !important;
  font-size: v-bind('FILTERS_ENTITY_UI.WRAPPER_FONT_SIZE') !important;
  box-shadow: none !important;
  border: 1px solid #dcdfe6 !important;
  transition: all v-bind('ANIMATIONS.TRANSITION_NORMAL') v-bind('ANIMATIONS.EASING_EASE');
}

.filter-field-search :deep(.el-input__inner) {
  height: v-bind('FILTERS_ENTITY_UI.INNER_HEIGHT') !important;
  line-height: v-bind('FILTERS_ENTITY_UI.INNER_LINE_HEIGHT') !important;
  font-size: v-bind('FILTERS_ENTITY_UI.INNER_FONT_SIZE') !important;
  padding: 0 !important;
}

.filter-field-search :deep(.el-input__prefix) {
  display: flex;
  align-items: center;
  height: v-bind('FILTERS_ENTITY_UI.INNER_HEIGHT') !important;
}

.filter-field-search :deep(.el-input__prefix-inner > .el-icon) {
  font-size: v-bind('FILTERS_ENTITY_UI.ICON_SIZE') !important;
  color: v-bind('FILTERS_ENTITY_UI.ICON_COLOR') !important;
}

/* ============================================================================
   SELECT
   ============================================================================ */
.filter-field-select :deep(.el-select) {
  width: 100%;
}

.filter-field-select :deep(.el-select__wrapper) {
  height: v-bind('FILTERS_ENTITY_UI.WRAPPER_HEIGHT') !important;
  min-height: v-bind('FILTERS_ENTITY_UI.WRAPPER_HEIGHT') !important;
  padding: v-bind('FILTERS_ENTITY_UI.WRAPPER_PADDING') !important;
  border-radius: v-bind('FILTERS_ENTITY_UI.WRAPPER_BORDER_RADIUS') !important;
  font-size: v-bind('FILTERS_ENTITY_UI.WRAPPER_FONT_SIZE') !important;
  box-shadow: none !important;
  border: 1px solid #dcdfe6 !important;
  transition: all v-bind('ANIMATIONS.TRANSITION_NORMAL') v-bind('ANIMATIONS.EASING_EASE');
}

.filter-field-select :deep(.el-select__input) {
  font-size: v-bind('FILTERS_ENTITY_UI.INNER_FONT_SIZE') !important;
  height: v-bind('FILTERS_ENTITY_UI.INNER_HEIGHT') !important;
}

.filter-field-select :deep(.el-select__caret) {
  font-size: v-bind('FILTERS_ENTITY_UI.ICON_SIZE') !important;
  color: v-bind('FILTERS_ENTITY_UI.ICON_COLOR') !important;
}

.filter-field-select :deep(.el-select-dropdown__item) {
  font-size: v-bind('FILTERS_ENTITY_UI.DROPDOWN_FONT_SIZE') !important;
  padding: v-bind('FILTERS_ENTITY_UI.DROPDOWN_PADDING') !important;
  height: v-bind('FILTERS_ENTITY_UI.DROPDOWN_HEIGHT') !important;
  line-height: v-bind('FILTERS_ENTITY_UI.DROPDOWN_LINE_HEIGHT') !important;
  transition: background-color v-bind('ANIMATIONS.TRANSITION_FAST') v-bind('ANIMATIONS.EASING_EASE');
}

/* ============================================================================
   RESET BUTTON
   ============================================================================ */
.filter-reset-btn {
  width: v-bind('FILTERS_ENTITY_UI.BUTTON_WIDTH');
  height: v-bind('FILTERS_ENTITY_UI.BUTTON_HEIGHT');
  padding: 0;
  border: none;
  background: transparent !important;
  color: v-bind('COLORS.INFO');
  transition: all v-bind('ANIMATIONS.TRANSITION_NORMAL') v-bind('ANIMATIONS.EASING_EASE');
  flex-shrink: 0;
}

.filter-reset-btn:hover:not(:disabled) {
  color: v-bind('COLORS.PRIMARY');
  transform: rotate(90deg);
}

.filter-reset-btn :deep(.el-icon) {
  font-size: v-bind('FILTERS_ENTITY_UI.BUTTON_ICON_SIZE');
}

/* ============================================================================
   АДАПТИВ
   ============================================================================ */
@media (max-width: v-bind('BREAKPOINTS.XL')) {
  .filters-entity-container {
    flex-wrap: wrap;
    height: auto;
    gap: 4px;
  }

  .filters-info-badge {
    width: 100%;
    justify-content: center;
    margin-bottom: 4px;
  }

  .filters-fields-wrapper {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }

  .filter-field {
    width: auto !important;
  }

  .filter-field-search :deep(.el-input__wrapper) {
    height: v-bind('FILTERS_ENTITY_UI.WRAPPER_HEIGHT_MOBILE') !important;
    font-size: v-bind('FILTERS_ENTITY_UI.WRAPPER_FONT_SIZE_MOBILE') !important;
  }
}

@media (max-width: v-bind('BREAKPOINTS.XS')) {
  .filters-entity-container {
    gap: 3px;
  }

  .filters-info-badge {
    font-size: 9px;
  }

  .filter-field-search :deep(.el-input__wrapper) {
    height: v-bind('FILTERS_ENTITY_UI.WRAPPER_HEIGHT_SMALL') !important;
    font-size: v-bind('FILTERS_ENTITY_UI.WRAPPER_FONT_SIZE_SMALL') !important;
  }

  .filter-field-select :deep(.el-select__wrapper) {
    height: v-bind('FILTERS_ENTITY_UI.WRAPPER_HEIGHT_SMALL') !important;
    font-size: v-bind('FILTERS_ENTITY_UI.WRAPPER_FONT_SIZE_SMALL') !important;
  }
}

@media (hover: none) and (pointer: coarse) {
  .filters-entity-container {
    min-height: v-bind('FILTERS_ENTITY_UI.WRAPPER_HEIGHT_TOUCH');
  }

  .filter-field-search :deep(.el-input__wrapper) {
    height: v-bind('FILTERS_ENTITY_UI.WRAPPER_HEIGHT_TOUCH') !important;
    font-size: v-bind('FILTERS_ENTITY_UI.WRAPPER_FONT_SIZE_TOUCH') !important;
  }

  .filter-field-select :deep(.el-select__wrapper) {
    height: v-bind('FILTERS_ENTITY_UI.WRAPPER_HEIGHT_TOUCH') !important;
    font-size: v-bind('FILTERS_ENTITY_UI.WRAPPER_FONT_SIZE_TOUCH') !important;
  }

  .filter-reset-btn {
    min-height: 36px;
    min-width: 36px;
  }
}
</style>
