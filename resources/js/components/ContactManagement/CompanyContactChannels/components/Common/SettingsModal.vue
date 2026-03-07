<template>
  <el-dialog
      v-model="localVisible"
      :title="SETTINGS_MESSAGES.TITLE"
      :width="SETTINGS_UI.DIALOG_WIDTH"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      class="settings-modal"
      :show-close="true"
      :destroy-on-close="true"
  >
    <el-form
        ref="formRef"
        :model="formData"
        :label-width="SETTINGS_UI.LABEL_WIDTH"
        :label-position="SETTINGS_UI.LABEL_POSITION"
        :size="SETTINGS_UI.FORM_SIZE"
        class="settings-form"
        :style="formStyle"
    >
      <!-- ✅ РАЗДЕЛ: ЗАГРУЗКА ДАННЫХ -->
      <el-divider content-position="left">
        <el-icon><Download /></el-icon>
        {{ SETTINGS_MESSAGES.SECTION_DATA_LOAD }}
      </el-divider>

      <el-form-item :label="SETTINGS_MESSAGES.LABEL_CHUNK_SIZE">
        <el-tooltip
            :content="SETTINGS_MESSAGES.HINT_CHUNK_SIZE"
            placement="top"
            :show-after="TIMINGS.TOOLTIP_DELAY"
            :hide-after="TIMINGS.TOOLTIP_HIDE_DELAY"
        >
          <el-select
              v-model="formData.chunkSize"
              :placeholder="SETTINGS_MESSAGES.PLACEHOLDER_CHUNK_SIZE"
              :disabled="props.disabled"
              class="settings-select"
          >
            <el-option
                v-for="size in CHUNK_SIZE_OPTIONS"
                :key="size.value"
                :label="size.label"
                :value="size.value"
            />
          </el-select>
        </el-tooltip>
        <div class="form-hint">{{ SETTINGS_MESSAGES.HINT_CHUNK_SIZE }}</div>
      </el-form-item>

      <el-form-item :label="SETTINGS_MESSAGES.LABEL_CONFIRM_LOAD_ALL">
        <el-tooltip
            :content="SETTINGS_MESSAGES.HINT_CONFIRM_LOAD_ALL"
            placement="top"
            :show-after="TIMINGS.TOOLTIP_DELAY"
            :hide-after="TIMINGS.TOOLTIP_HIDE_DELAY"
        >
          <el-switch
              v-model="formData.confirmBeforeLoadAll"
              :disabled="props.disabled"
              :active-text="SETTINGS_MESSAGES.SWITCH_ON"
              :inactive-text="SETTINGS_MESSAGES.SWITCH_OFF"
          />
        </el-tooltip>
        <div class="form-hint">{{ SETTINGS_MESSAGES.HINT_CONFIRM_LOAD_ALL }}</div>
      </el-form-item>

      <!-- ✅ РАЗДЕЛ: ОТОБРАЖЕНИЕ -->
      <el-divider content-position="left">
        <el-icon><View /></el-icon>
        {{ SETTINGS_MESSAGES.SECTION_DISPLAY }}
      </el-divider>

      <el-form-item :label="SETTINGS_MESSAGES.LABEL_PAGE_SIZE">
        <el-tooltip
            :content="SETTINGS_MESSAGES.HINT_PAGE_SIZE"
            placement="top"
            :show-after="TIMINGS.TOOLTIP_DELAY"
            :hide-after="TIMINGS.TOOLTIP_HIDE_DELAY"
        >
          <el-select
              v-model="formData.pageSize"
              :placeholder="SETTINGS_MESSAGES.PLACEHOLDER_PAGE_SIZE"
              :disabled="props.disabled"
              class="settings-select"
          >
            <el-option
                v-for="size in PAGE_SIZE_OPTIONS_LIST"
                :key="size"
                :label="size"
                :value="size"
            />
          </el-select>
        </el-tooltip>
        <div class="form-hint">{{ SETTINGS_MESSAGES.HINT_PAGE_SIZE }}</div>
      </el-form-item>

      <el-form-item :label="SETTINGS_MESSAGES.LABEL_SHOW_LOAD_BUTTONS">
        <el-tooltip
            :content="SETTINGS_MESSAGES.HINT_SHOW_LOAD_BUTTONS"
            placement="top"
            :show-after="TIMINGS.TOOLTIP_DELAY"
            :hide-after="TIMINGS.TOOLTIP_HIDE_DELAY"
        >
          <el-switch
              v-model="formData.showLoadButtons"
              :disabled="props.disabled"
              :active-text="SETTINGS_MESSAGES.SWITCH_ON"
              :inactive-text="SETTINGS_MESSAGES.SWITCH_OFF"
          />
        </el-tooltip>
        <div class="form-hint">{{ SETTINGS_MESSAGES.HINT_SHOW_LOAD_BUTTONS }}</div>
      </el-form-item>

      <!-- ✅ РАЗДЕЛ: ФИЛЬТРЫ ПО УМОЛЧАНИЮ -->
      <el-divider content-position="left">
        <el-icon><Filter /></el-icon>
        {{ SETTINGS_MESSAGES.SECTION_DEFAULT_FILTERS }}
      </el-divider>

      <el-form-item :label="SETTINGS_MESSAGES.LABEL_DEFAULT_SORT">
        <el-tooltip
            :content="SETTINGS_MESSAGES.HINT_DEFAULT_SORT"
            placement="top"
            :show-after="TIMINGS.TOOLTIP_DELAY"
            :hide-after="TIMINGS.TOOLTIP_HIDE_DELAY"
        >
          <el-select
              v-model="formData.defaultSortBy"
              :placeholder="SETTINGS_MESSAGES.PLACEHOLDER_DEFAULT_SORT"
              :disabled="props.disabled"
              class="settings-select"
          >
            <el-option
                v-for="option in SORT_OPTIONS_LIST"
                :key="option.value"
                :label="option.label"
                :value="option.value"
            />
          </el-select>
        </el-tooltip>
        <div class="form-hint">{{ SETTINGS_MESSAGES.HINT_DEFAULT_SORT }}</div>
      </el-form-item>

      <el-form-item :label="SETTINGS_MESSAGES.LABEL_DEFAULT_ICON_FILTER">
        <el-tooltip
            :content="SETTINGS_MESSAGES.HINT_DEFAULT_ICON_FILTER"
            placement="top"
            :show-after="TIMINGS.TOOLTIP_DELAY"
            :hide-after="TIMINGS.TOOLTIP_HIDE_DELAY"
        >
          <el-select
              v-model="formData.defaultFilterHasIcon"
              :placeholder="SETTINGS_MESSAGES.PLACEHOLDER_DEFAULT_ICON_FILTER"
              :disabled="props.disabled"
              clearable
              class="settings-select"
          >
            <el-option
                v-for="option in ICON_FILTER_OPTIONS"
                :key="option.value"
                :label="option.label"
                :value="option.value"
            />
          </el-select>
        </el-tooltip>
        <div class="form-hint">{{ SETTINGS_MESSAGES.HINT_DEFAULT_ICON_FILTER }}</div>
      </el-form-item>
    </el-form>

    <!-- ✅ FOOTER С КНОПКАМИ -->
    <template #footer>
      <div class="dialog-footer">
        <el-button
            @click="handleResetDefaults"
            :disabled="props.disabled"
        >
          {{ SETTINGS_MESSAGES.BTN_RESET_DEFAULTS }}
        </el-button>
        <el-button
            @click="handleCancel"
            :disabled="props.disabled"
        >
          {{ SETTINGS_MESSAGES.BTN_CANCEL }}
        </el-button>
        <el-button
            type="primary"
            @click="handleSave"
            :loading="props.isSaving"
        >
          {{ SETTINGS_MESSAGES.BTN_SAVE }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';
import { Download, View, Filter } from '@element-plus/icons-vue';
import {
  SETTINGS_MODAL_PROPS_CONFIG,
  SETTINGS_UI,
  SETTINGS_FILTERS_UI,
  SETTINGS_MESSAGES,
  CHUNK_CONFIG,
  CHUNK_SIZE_OPTIONS,
  PAGE_SIZE_OPTIONS,
  SORT_OPTIONS,
  getSortOptions,
  ICON_FILTER_OPTIONS,
  ANIMATIONS,
  TIMINGS,
  COLORS,
  BREAKPOINTS,
} from '../../config/appConfigIndex.js';

const props = defineProps({...SETTINGS_MODAL_PROPS_CONFIG});

const emit = defineEmits(['update:visible', 'save', 'cancel']);

const formRef = ref(null);

// ============================================================================
// COMPUTED — VISIBLE
// ============================================================================
const localVisible = computed({
  get: () => props.visible,
  set: (val) => {
    emit('update:visible', val);
  },
});

// ============================================================================
// COMPUTED — FORM STYLE (CSS VARIABLES)
// ============================================================================
const formStyle = computed(() => ({
  '--label-width': SETTINGS_UI.LABEL_WIDTH,
  '--label-position': SETTINGS_UI.LABEL_POSITION,
  '--label-height': SETTINGS_UI.LABEL_HEIGHT,
  '--label-height-mobile': SETTINGS_UI.LABEL_HEIGHT_MOBILE,
  '--label-font-size': SETTINGS_UI.LABEL_FONT_SIZE,
  '--label-font-size-mobile': SETTINGS_UI.LABEL_FONT_SIZE_MOBILE,
  '--label-line-height': SETTINGS_UI.LABEL_LINE_HEIGHT,
  '--label-line-height-mobile': SETTINGS_UI.LABEL_LINE_HEIGHT_MOBILE,
  '--label-margin-bottom': SETTINGS_UI.LABEL_MARGIN_BOTTOM,
  '--label-margin-bottom-mobile': SETTINGS_UI.LABEL_MARGIN_BOTTOM_MOBILE,
  '--label-letter-spacing': SETTINGS_UI.LABEL_LETTER_SPACING,
  '--form-item-margin': SETTINGS_UI.FORM_ITEM_MARGIN,
  '--form-item-margin-mobile': SETTINGS_UI.FORM_ITEM_MARGIN_MOBILE,
  '--form-item-gap': SETTINGS_UI.FORM_ITEM_GAP,
  '--form-item-gap-mobile': SETTINGS_UI.FORM_ITEM_GAP_MOBILE,
  '--select-height': SETTINGS_FILTERS_UI.WRAPPER_HEIGHT,
  '--select-height-mobile': SETTINGS_FILTERS_UI.WRAPPER_HEIGHT_MOBILE,
  '--select-font-size': SETTINGS_FILTERS_UI.WRAPPER_FONT_SIZE,
  '--select-font-size-mobile': SETTINGS_FILTERS_UI.WRAPPER_FONT_SIZE_MOBILE,
  '--select-padding': SETTINGS_FILTERS_UI.WRAPPER_PADDING,
  '--select-padding-mobile': SETTINGS_FILTERS_UI.WRAPPER_PADDING_MOBILE,
  '--button-height': SETTINGS_FILTERS_UI.BUTTON_HEIGHT,
  '--button-height-mobile': SETTINGS_FILTERS_UI.BUTTON_HEIGHT_MOBILE,
  '--button-font-size': SETTINGS_FILTERS_UI.BUTTON_FONT_SIZE,
  '--button-font-size-mobile': SETTINGS_FILTERS_UI.BUTTON_FONT_SIZE_MOBILE,
  '--button-padding': SETTINGS_UI.BUTTON_PADDING,
  '--button-padding-mobile': SETTINGS_UI.BUTTON_PADDING_MOBILE,
  '--footer-gap': SETTINGS_UI.FOOTER_GAP,
  '--footer-gap-mobile': SETTINGS_UI.FOOTER_GAP_MOBILE,
  '--divider-margin': SETTINGS_UI.DIVIDER_MARGIN,
  '--divider-margin-mobile': SETTINGS_UI.DIVIDER_MARGIN_MOBILE,
  '--hint-font-size': SETTINGS_FILTERS_UI.HINT_FONT_SIZE,
  '--hint-font-size-mobile': SETTINGS_FILTERS_UI.HINT_FONT_SIZE_MOBILE,
  '--scrollbar-width': SETTINGS_UI.SCROLLBAR_WIDTH,
  '--dialog-border-radius': SETTINGS_UI.DIALOG_BORDER_RADIUS,
  '--dialog-box-shadow': SETTINGS_UI.DIALOG_BOX_SHADOW,
  '--modal-breakpoint': `${SETTINGS_UI.LABEL_POSITION_MOBILE_BREAKPOINT}px`,
}));

// ============================================================================
// COMPUTED — СПИСКИ ОПЦИЙ
// ============================================================================
const PAGE_SIZE_OPTIONS_LIST = PAGE_SIZE_OPTIONS.BASE_AVAILABLE;

const SORT_OPTIONS_LIST = computed(() => {
  return getSortOptions();
});

// ============================================================================
// STATE — ФОРМА
// ============================================================================
const formData = ref({
  chunkSize: CHUNK_CONFIG.SIZE,
  confirmBeforeLoadAll: true,
  pageSize: PAGE_SIZE_OPTIONS.BASE_AVAILABLE[2],
  showLoadButtons: true,
  defaultSortBy: SORT_OPTIONS.DEFAULT,
  defaultFilterHasIcon: '',
});

// ============================================================================
// LOAD SETTINGS — ИЗ LOCALSTORAGE
// ============================================================================
const loadSettings = () => {
  const saved = localStorage.getItem('company_user_settings');
  if (saved) {
    try {
      const settings = JSON.parse(saved);
      formData.value = {
        ...formData.value,
        ...settings,
      };
      console.log('🟢 [SettingsModal] Settings loaded from localStorage:', settings);
    } catch (e) {
      console.error('🔴 [SettingsModal] Error loading settings:', e);
    }
  }
};

// ============================================================================
// SAVE SETTINGS — В LOCALSTORAGE
// ============================================================================
const saveSettings = () => {
  localStorage.setItem('company_user_settings', JSON.stringify(formData.value));
  console.log('🟢 [SettingsModal] Settings saved to localStorage:', formData.value);
  emit('save', { ...formData.value });
};

// ============================================================================
// RESET DEFAULTS
// ============================================================================
const handleResetDefaults = () => {
  formData.value = {
    chunkSize: CHUNK_CONFIG.SIZE,
    confirmBeforeLoadAll: true,
    pageSize: PAGE_SIZE_OPTIONS.BASE_AVAILABLE[2],
    showLoadButtons: true,
    defaultSortBy: SORT_OPTIONS.DEFAULT,
    defaultFilterHasIcon: '',
  };
  localStorage.removeItem('company_user_settings');
  console.log('🟢 [SettingsModal] Settings reset to defaults');
};

// ============================================================================
// CANCEL
// ============================================================================
const handleCancel = () => {
  loadSettings();
  emit('cancel');
  localVisible.value = false;
};

// ============================================================================
// SAVE
// ============================================================================
const handleSave = () => {
  saveSettings();
  localVisible.value = false;
};

// ============================================================================
// WATCH — VISIBLE
// ============================================================================
watch(() => props.visible, (newVal) => {
  if (newVal) {
    loadSettings();
  }
}, { immediate: true });

// ============================================================================
// CLEANUP — ON UNMOUNTED
// ============================================================================
onUnmounted(() => {
  // Очистка если нужна
});
</script>

<style scoped>
/* ============================================================================
   CSS ПЕРЕМЕННЫЕ
   ============================================================================ */
.settings-modal {
  --label-width: v-bind('SETTINGS_UI.LABEL_WIDTH');
  --label-position: v-bind('SETTINGS_UI.LABEL_POSITION');
  --label-height: v-bind('SETTINGS_UI.LABEL_HEIGHT');
  --label-font-size: v-bind('SETTINGS_UI.LABEL_FONT_SIZE');
  --label-line-height: v-bind('SETTINGS_UI.LABEL_LINE_HEIGHT');
  --label-margin-bottom: v-bind('SETTINGS_UI.LABEL_MARGIN_BOTTOM');
  --label-letter-spacing: v-bind('SETTINGS_UI.LABEL_LETTER_SPACING');
  --label-width-mobile: v-bind('SETTINGS_UI.LABEL_WIDTH_MOBILE');
  --label-height-mobile: v-bind('SETTINGS_UI.LABEL_HEIGHT_MOBILE');
  --label-font-size-mobile: v-bind('SETTINGS_UI.LABEL_FONT_SIZE_MOBILE');
  --label-line-height-mobile: v-bind('SETTINGS_UI.LABEL_LINE_HEIGHT_MOBILE');
  --label-margin-bottom-mobile: v-bind('SETTINGS_UI.LABEL_MARGIN_BOTTOM_MOBILE');
  --form-item-margin: v-bind('SETTINGS_UI.FORM_ITEM_MARGIN');
  --form-item-margin-mobile: v-bind('SETTINGS_UI.FORM_ITEM_MARGIN_MOBILE');
  --form-item-gap: v-bind('SETTINGS_UI.FORM_ITEM_GAP');
  --form-item-gap-mobile: v-bind('SETTINGS_UI.FORM_ITEM_GAP_MOBILE');
  --select-height: v-bind('SETTINGS_FILTERS_UI.WRAPPER_HEIGHT');
  --select-height-mobile: v-bind('SETTINGS_FILTERS_UI.WRAPPER_HEIGHT_MOBILE');
  --select-font-size: v-bind('SETTINGS_FILTERS_UI.WRAPPER_FONT_SIZE');
  --select-font-size-mobile: v-bind('SETTINGS_FILTERS_UI.WRAPPER_FONT_SIZE_MOBILE');
  --select-padding: v-bind('SETTINGS_FILTERS_UI.WRAPPER_PADDING');
  --select-padding-mobile: v-bind('SETTINGS_FILTERS_UI.WRAPPER_PADDING_MOBILE');
  --button-height: v-bind('SETTINGS_FILTERS_UI.BUTTON_HEIGHT');
  --button-height-mobile: v-bind('SETTINGS_FILTERS_UI.BUTTON_HEIGHT_MOBILE');
  --button-font-size: v-bind('SETTINGS_FILTERS_UI.BUTTON_FONT_SIZE');
  --button-font-size-mobile: v-bind('SETTINGS_FILTERS_UI.BUTTON_FONT_SIZE_MOBILE');
  --button-padding: v-bind('SETTINGS_UI.BUTTON_PADDING');
  --button-padding-mobile: v-bind('SETTINGS_UI.BUTTON_PADDING_MOBILE');
  --footer-gap: v-bind('SETTINGS_UI.FOOTER_GAP');
  --footer-gap-mobile: v-bind('SETTINGS_UI.FOOTER_GAP_MOBILE');
  --divider-margin: v-bind('SETTINGS_UI.DIVIDER_MARGIN');
  --divider-margin-mobile: v-bind('SETTINGS_UI.DIVIDER_MARGIN_MOBILE');
  --hint-font-size: v-bind('SETTINGS_FILTERS_UI.HINT_FONT_SIZE');
  --hint-font-size-mobile: v-bind('SETTINGS_FILTERS_UI.HINT_FONT_SIZE_MOBILE');
  --scrollbar-width: v-bind('SETTINGS_UI.SCROLLBAR_WIDTH');
  --dialog-border-radius: v-bind('SETTINGS_UI.DIALOG_BORDER_RADIUS');
  --dialog-box-shadow: v-bind('SETTINGS_UI.DIALOG_BOX_SHADOW');
  --modal-breakpoint: v-bind('SETTINGS_UI.LABEL_POSITION_MOBILE_BREAKPOINT') + 'px';
}

/* ============================================================================
   DIALOG
   ============================================================================ */
.settings-modal :deep(.el-dialog) {
  width: v-bind('SETTINGS_UI.DIALOG_WIDTH') !important;
  border-radius: var(--dialog-border-radius);
  box-shadow: var(--dialog-box-shadow);
  /* ✅ TIMINGS — АНИМАЦИЯ ПОЯВЛЕНИЯ (300ms) */
  animation: dialogFadeIn v-bind('TIMINGS.MODAL_ANIMATION') v-bind('ANIMATIONS.EASING_EASE_OUT');
}

.settings-modal :deep(.el-dialog__header) {
  padding: v-bind('SETTINGS_UI.HEADER_PADDING');
  border-bottom: 1px solid #EBEEF5;
  background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
  border-radius: var(--dialog-border-radius) var(--dialog-border-radius) 0 0;
}

.settings-modal :deep(.el-dialog__title) {
  font-size: v-bind('SETTINGS_UI.TITLE_FONT_SIZE');
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 5px;
}

.settings-modal :deep(.el-dialog__headerbtn) {
  top: 8px;
  right: 10px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  /* ✅ TIMINGS — ПЛАВНЫЙ ПЕРЕХОД (150ms) */
  transition: v-bind('TIMINGS.DELAY_FAST') ease;
}

.settings-modal :deep(.el-dialog__headerbtn:hover) {
  background-color: #f5f7fa;
}

.settings-modal :deep(.el-dialog__body) {
  padding: v-bind('SETTINGS_UI.BODY_PADDING');
  max-height: 65vh;
  overflow-y: auto;
  background-color: #FFFFFF;
}

.settings-modal :deep(.el-dialog__footer) {
  padding: v-bind('SETTINGS_UI.FOOTER_PADDING');
  border-top: 1px solid #EBEEF5;
  background: linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%);
  border-radius: 0 0 var(--dialog-border-radius) var(--dialog-border-radius);
}

/* ============================================================================
   DIVIDER
   ============================================================================ */
.settings-modal :deep(.el-divider) {
  margin: var(--divider-margin);
  border-color: #EBEEF5;
}

.settings-modal :deep(.el-divider__text) {
  font-size: v-bind('SETTINGS_UI.DIVIDER_FONT_SIZE');
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: #FFFFFF;
  padding: 0 5px;
}

.settings-modal :deep(.el-divider__text .el-icon) {
  color: v-bind('COLORS.PRIMARY');
  font-size: 12px;
}

/* ============================================================================
   SELECT
   ============================================================================ */
.settings-modal .settings-select :deep(.el-select__wrapper) {
  height: var(--select-height) !important;
  min-height: var(--select-height) !important;
  max-height: var(--select-height) !important;
  padding: var(--select-padding) !important;
  font-size: var(--select-font-size) !important;
  border-radius: 3px;
  /* ✅ TIMINGS — ПЛАВНЫЙ ПЕРЕХОД (150ms) */
  transition: v-bind('TIMINGS.RECALCULATING_DURATION') ease;
  gap: 4px;
}

.settings-modal .settings-select :deep(.el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px v-bind('COLORS.PRIMARY') inset;
}

.settings-modal .settings-select :deep(.el-input__inner) {
  font-size: var(--select-font-size) !important;
  height: calc(var(--select-height) - 2px) !important;
  line-height: calc(var(--select-height) - 2px) !important;
}

.settings-modal .settings-select :deep(.el-select__caret) {
  font-size: v-bind('SETTINGS_FILTERS_UI.CARET_FONT_SIZE');
}

/* ============================================================================
   FORM HINT
   ============================================================================ */
.form-hint {
  font-size: var(--hint-font-size);
  color: #909399;
  margin-top: 2px;
  line-height: 1.3;
  padding-left: 2px;
}

/* ============================================================================
   SWITCH
   ============================================================================ */
:deep(.el-switch) {
  --el-switch-on-color: #409EFF;
  transform: scale(0.9);
  transform-origin: left center;
}

:deep(.el-switch__core) {
  border-radius: 10px;
  /* ✅ TIMINGS — ПЛАВНЫЙ ПЕРЕХОД (150ms) */
  transition: v-bind('TIMINGS.RECALCULATING_DURATION') ease;
  height: v-bind('SETTINGS_FILTERS_UI.SWITCH_HEIGHT');
}

:deep(.el-switch__label) {
  font-size: v-bind('SETTINGS_FILTERS_UI.SWITCH_FONT_SIZE');
}

/* ============================================================================
   FOOTER BUTTONS
   ============================================================================ */
.settings-modal .dialog-footer .el-button {
  height: v-bind('SETTINGS_FILTERS_UI.BUTTON_HEIGHT') !important;
  min-height: v-bind('SETTINGS_FILTERS_UI.BUTTON_HEIGHT') !important;
  font-size: v-bind('SETTINGS_UI.BUTTON_FONT_SIZE') !important;
  padding: v-bind('SETTINGS_UI.BUTTON_PADDING') !important;
  min-width: v-bind('SETTINGS_UI.BUTTON_MIN_WIDTH') !important;
  border-radius: 4px;
  font-weight: 500;
  /* ✅ TIMINGS — ПЛАВНЫЙ ПЕРЕХОД (150ms) */
  transition: v-bind('TIMINGS.RECALCULATING_DURATION') ease;
}

.settings-modal .dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--footer-gap);
  padding-top: 2px;
}

.settings-modal .dialog-footer .el-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.settings-modal .dialog-footer .el-button--primary {
  background: linear-gradient(135deg, #409EFF 0%, #337ECC 100%);
  border-color: #409EFF;
}

.settings-modal .dialog-footer .el-button--primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #66B1FF 0%, #409EFF 100%);
  border-color: #66B1FF;
}

/* ============================================================================
   SCROLLBAR
   ============================================================================ */
.settings-modal :deep(.el-dialog__body::-webkit-scrollbar) {
  width: var(--scrollbar-width);
}

.settings-modal :deep(.el-dialog__body::-webkit-scrollbar-track) {
  background: #f5f7fa;
  border-radius: 2px;
}

.settings-modal :deep(.el-dialog__body::-webkit-scrollbar-thumb) {
  background: #c0c4cc;
  border-radius: 2px;
}

.settings-modal :deep(.el-dialog__body::-webkit-scrollbar-thumb:hover) {
  background: #909399;
}

/* ============================================================================
   ANIMATIONS
   ============================================================================ */
@keyframes dialogFadeIn {
  from {
    opacity: 0;
    transform: translateY(-15px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ============================================================================
   АДАПТИВ — MOBILE (≤768px)
   ============================================================================ */
@media (max-width: v-bind('BREAKPOINTS.SM')) {
  .settings-modal :deep(.el-dialog) {
    width: v-bind('SETTINGS_UI.DIALOG_WIDTH_MOBILE') !important;
    margin: 10px auto;
  }

  .settings-modal :deep(.el-dialog__header) {
    padding: v-bind('SETTINGS_UI.HEADER_PADDING_MOBILE');
  }

  .settings-modal :deep(.el-dialog__body) {
    padding: v-bind('SETTINGS_UI.BODY_PADDING_MOBILE');
    max-height: 60vh;
  }

  .settings-modal :deep(.el-dialog__footer) {
    padding: v-bind('SETTINGS_UI.FOOTER_PADDING_MOBILE');
  }

  .settings-modal .settings-select :deep(.el-select__wrapper) {
    height: var(--select-height-mobile) !important;
    font-size: var(--select-font-size-mobile) !important;
    padding: var(--select-padding-mobile) !important;
  }

  .settings-modal .dialog-footer {
    flex-direction: column;
    gap: var(--footer-gap-mobile);
  }

  .settings-modal .dialog-footer .el-button {
    width: 100%;
    height: v-bind('SETTINGS_FILTERS_UI.BUTTON_HEIGHT_MOBILE') !important;
    min-height: v-bind('SETTINGS_FILTERS_UI.BUTTON_HEIGHT_MOBILE') !important;
    font-size: v-bind('SETTINGS_UI.BUTTON_FONT_SIZE_MOBILE') !important;
    padding: v-bind('SETTINGS_UI.BUTTON_PADDING_MOBILE') !important;
  }

  .settings-modal :deep(.el-divider) {
    margin: var(--divider-margin-mobile);
  }

  .settings-modal :deep(.el-divider__text) {
    font-size: v-bind('SETTINGS_UI.DIVIDER_FONT_SIZE_MOBILE');
  }

  .form-hint {
    font-size: var(--hint-font-size-mobile);
  }
}

/* ============================================================================
   TOUCH DEVICES
   ============================================================================ */
@media (hover: none) and (pointer: coarse) and (max-width: v-bind('BREAKPOINTS.XS')) {
  .settings-modal :deep(.el-dialog) {
    width: v-bind('SETTINGS_UI.DIALOG_WIDTH_SMALL') !important;
  }

  .settings-modal :deep(.el-dialog__header) {
    padding: v-bind('SETTINGS_UI.HEADER_PADDING_SMALL');
  }

  .settings-modal :deep(.el-dialog__body) {
    padding: v-bind('SETTINGS_UI.BODY_PADDING_SMALL');
  }

  .settings-modal :deep(.el-dialog__footer) {
    padding: v-bind('SETTINGS_UI.FOOTER_PADDING_SMALL');
  }

  .settings-modal .dialog-footer .el-button {
    min-height: v-bind('SETTINGS_FILTERS_UI.BUTTON_HEIGHT_TOUCH') !important;
    height: v-bind('SETTINGS_FILTERS_UI.BUTTON_HEIGHT_TOUCH') !important;
    font-size: v-bind('SETTINGS_FILTERS_UI.BUTTON_FONT_SIZE_TOUCH') !important;
  }

  .settings-modal .settings-select :deep(.el-select__wrapper) {
    height: v-bind('SETTINGS_FILTERS_UI.WRAPPER_HEIGHT_TOUCH') !important;
    min-height: v-bind('SETTINGS_FILTERS_UI.WRAPPER_HEIGHT_TOUCH') !important;
    font-size: v-bind('SETTINGS_FILTERS_UI.WRAPPER_FONT_SIZE_TOUCH') !important;
    padding: v-bind('SETTINGS_FILTERS_UI.WRAPPER_PADDING_TOUCH') !important;
  }

  :deep(.el-switch__core) {
    height: v-bind('SETTINGS_FILTERS_UI.SWITCH_HEIGHT_TOUCH');
  }

  :deep(.el-switch__label) {
    font-size: v-bind('SETTINGS_FILTERS_UI.SWITCH_FONT_SIZE_TOUCH');
  }

  .form-hint {
    font-size: v-bind('SETTINGS_FILTERS_UI.HINT_FONT_SIZE_TOUCH');
  }
}
</style>
