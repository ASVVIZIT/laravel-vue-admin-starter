<template>
  <el-dialog
      v-model="localVisible"
      :title="getSettingsTitle()"
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
    >
      <!-- ✅ РАЗДЕЛ: ЗАГРУЗКА ДАННЫХ -->
      <el-divider content-position="left">
        <el-icon><Download /></el-icon>
        {{ SETTINGS_MESSAGES.SECTION_DATA_LOAD }}
      </el-divider>

      <el-form-item :label="SETTINGS_MESSAGES.LABEL_CHUNK_SIZE">
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
        <div class="form-hint">{{ SETTINGS_MESSAGES.HINT_CHUNK_SIZE }}</div>
      </el-form-item>

      <el-form-item :label="SETTINGS_MESSAGES.LABEL_CONFIRM_LOAD_ALL">
        <el-switch
            v-model="formData.confirmBeforeLoadAll"
            :disabled="props.disabled"
            :active-text="SETTINGS_MESSAGES.SWITCH_ON"
            :inactive-text="SETTINGS_MESSAGES.SWITCH_OFF"
        />
        <div class="form-hint">{{ SETTINGS_MESSAGES.HINT_CONFIRM_LOAD_ALL }}</div>
      </el-form-item>

      <!-- ✅ РАЗДЕЛ: ОТОБРАЖЕНИЕ -->
      <el-divider content-position="left">
        <el-icon><View /></el-icon>
        {{ SETTINGS_MESSAGES.SECTION_DISPLAY }}
      </el-divider>

      <el-form-item :label="SETTINGS_MESSAGES.LABEL_PAGE_SIZE">
        <el-select
            v-model="formData.pageSize"
            :placeholder="SETTINGS_MESSAGES.PLACEHOLDER_PAGE_SIZE"
            :disabled="props.disabled"
            class="settings-select"
        >
          <el-option
              v-for="size in PAGE_SIZE_OPTIONS_LIST"
              :key="size.value"
              :label="size.label"
              :value="size.value"
          />
        </el-select>
        <div class="form-hint">{{ SETTINGS_MESSAGES.HINT_PAGE_SIZE }}</div>
      </el-form-item>

      <el-form-item :label="SETTINGS_MESSAGES.LABEL_SHOW_LOAD_BUTTONS">
        <el-switch
            v-model="formData.showLoadButtons"
            :disabled="props.disabled"
            :active-text="SETTINGS_MESSAGES.SWITCH_ON"
            :inactive-text="SETTINGS_MESSAGES.SWITCH_OFF"
        />
        <div class="form-hint">{{ SETTINGS_MESSAGES.HINT_SHOW_LOAD_BUTTONS }}</div>
      </el-form-item>

      <!-- ✅ РАЗДЕЛ: ФИЛЬТРЫ ПО УМОЛЧАНИЮ -->
      <el-divider content-position="left">
        <el-icon><Filter /></el-icon>
        {{ SETTINGS_MESSAGES.SECTION_DEFAULT_FILTERS }}
      </el-divider>

      <el-form-item :label="SETTINGS_MESSAGES.LABEL_DEFAULT_SORT">
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
        <div class="form-hint">{{ SETTINGS_MESSAGES.HINT_DEFAULT_SORT }}</div>
      </el-form-item>

      <el-form-item :label="SETTINGS_MESSAGES.LABEL_DEFAULT_ICON_FILTER">
        <el-select
            v-model="formData.defaultFilterHasIcon"
            :placeholder="SETTINGS_MESSAGES.PLACEHOLDER_DEFAULT_ICON_FILTER"
            :disabled="props.disabled"
            clearable
            class="settings-select"
        >
          <el-option
              :label="SETTINGS_MESSAGES.ICON_FILTER_ALL"
              value=""
          />
          <el-option
              :label="SETTINGS_MESSAGES.ICON_FILTER_WITH"
              value="true"
          />
          <el-option
              :label="SETTINGS_MESSAGES.ICON_FILTER_WITHOUT"
              value="false"
          />
        </el-select>
        <div class="form-hint">{{ SETTINGS_MESSAGES.HINT_DEFAULT_ICON_FILTER }}</div>
      </el-form-item>
    </el-form>

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
import { ref, computed, watch } from 'vue';
import { Download, View, Filter } from '@element-plus/icons-vue';
import {
  SETTINGS_UI,
  SETTINGS_MESSAGES,
  getSettingsTitle,
  CHUNK_CONFIG,
  PAGE_SIZE_OPTIONS,
  SORT_OPTIONS,
  getSortOptions,
  BREAKPOINTS,
  ANIMATIONS,
  TIMINGS,
  COLORS,
} from '../../utils/appConfig.js';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:visible', 'save', 'cancel']);

const formRef = ref(null);

const localVisible = computed({
  get: () => props.visible,
  set: (val) => {
    emit('update:visible', val);
  },
});

const CHUNK_SIZE_OPTIONS = [
  { value: 100, label: '100 записей' },
  { value: 250, label: '250 записей' },
  { value: 500, label: '500 записей (по умолчанию)' },
  { value: 1000, label: '1000 записей' },
];

const PAGE_SIZE_OPTIONS_LIST = [
  { value: 10, label: '10' },
  { value: 15, label: '15 (по умолчанию)' },
  { value: 20, label: '20' },
  { value: 30, label: '30' },
  { value: 50, label: '50' },
  { value: 100, label: '100' },
];

const SORT_OPTIONS_LIST = computed(() => {
  return getSortOptions();
});

const formData = ref({
  chunkSize: CHUNK_CONFIG.SIZE,
  confirmBeforeLoadAll: true,
  pageSize: PAGE_SIZE_OPTIONS.BASE_AVAILABLE[2],
  showLoadButtons: true,
  defaultSortBy: SORT_OPTIONS.DEFAULT,
  defaultFilterHasIcon: '',
});

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

const saveSettings = () => {
  localStorage.setItem('company_user_settings', JSON.stringify(formData.value));
  console.log('🟢 [SettingsModal] Settings saved to localStorage:', formData.value);
  emit('save', { ...formData.value });
};

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

const handleCancel = () => {
  loadSettings();
  emit('cancel');
  localVisible.value = false;
};

const handleSave = () => {
  saveSettings();
  localVisible.value = false;
};

watch(() => props.visible, (newVal) => {
  if (newVal) {
    loadSettings();
  }
}, { immediate: true });
</script>

<style scoped>
/* ============================================================================
   ОСНОВНЫЕ СТИЛИ ДИАЛОГА — КОМПАКТНЫЕ
   ============================================================================ */
.settings-modal :deep(.el-dialog) {
  width: 480px !important;
  border-radius: 6px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  animation: dialogFadeIn v-bind('TIMINGS.MODAL_ANIMATION') v-bind('ANIMATIONS.EASING_EASE_OUT');
}

.settings-modal :deep(.el-dialog__header) {
  padding: 12px 16px;
  border-bottom: 1px solid #EBEEF5;
  background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
  border-radius: 6px 6px 0 0;
}

.settings-modal :deep(.el-dialog__title) {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 6px;
}

.settings-modal :deep(.el-dialog__headerbtn) {
  top: 10px;
  right: 12px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  transition: all v-bind('ANIMATIONS.TRANSITION_NORMAL') v-bind('ANIMATIONS.EASING_EASE');
}

.settings-modal :deep(.el-dialog__headerbtn:hover) {
  background-color: #f5f7fa;
}

.settings-modal :deep(.el-dialog__body) {
  padding: 14px;
  max-height: 65vh;
  overflow-y: auto;
  background-color: #FFFFFF;
}

.settings-modal :deep(.el-dialog__footer) {
  padding: 12px 16px;
  border-top: 1px solid #EBEEF5;
  background: linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%);
  border-radius: 0 0 6px 6px;
}

/* ============================================================================
   РАЗДЕЛИТЕЛИ — КОМПАКТНЫЕ
   ============================================================================ */
.settings-modal :deep(.el-divider) {
  margin: 10px 0 8px;
  border-color: #EBEEF5;
}

.settings-modal :deep(.el-divider__text) {
  font-size: 12px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 5px;
  background-color: #FFFFFF;
  padding: 0 6px;
}

.settings-modal :deep(.el-divider__text .el-icon) {
  color: v-bind('COLORS.PRIMARY');
  font-size: 13px;
}

/* ============================================================================
   ФОРМА — КОМПАКТНАЯ
   ============================================================================ */
.settings-modal :deep(.el-form-item) {
  margin-bottom: 12px;
}

.settings-modal :deep(.el-form-item__label) {
  font-size: 12px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 6px;
}

.settings-modal :deep(.el-form-item__content) {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.settings-select {
  width: 100%;
}

.settings-select :deep(.el-select__wrapper) {
  border-radius: 4px;
  transition: all v-bind('ANIMATIONS.TRANSITION_NORMAL') v-bind('ANIMATIONS.EASING_EASE');
  height: 28px !important;
}

.settings-select :deep(.el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px v-bind('COLORS.PRIMARY') inset;
}

.form-hint {
  font-size: 10px;
  color: #909399;
  margin-top: 3px;
  line-height: 1.3;
  padding-left: 3px;
}

/* ============================================================================
   SWITCH — КОМПАКТНЫЙ
   ============================================================================ */
:deep(.el-switch) {
  --el-switch-on-color: #409EFF;
}

:deep(.el-switch__core) {
  border-radius: 10px;
  transition: all v-bind('ANIMATIONS.TRANSITION_NORMAL') v-bind('ANIMATIONS.EASING_EASE');
  height: 20px;
}

:deep(.el-switch__label) {
  font-size: 11px;
}

/* ============================================================================
   КНОПКИ В FOOTER — КОМПАКТНЫЕ
   ============================================================================ */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 3px;
}

.dialog-footer .el-button {
  min-width: 80px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 12px;
  padding: 8px 14px;
  transition: all v-bind('ANIMATIONS.TRANSITION_NORMAL') v-bind('ANIMATIONS.EASING_EASE');
}

.dialog-footer .el-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.dialog-footer .el-button--primary {
  background: linear-gradient(135deg, #409EFF 0%, #337ECC 100%);
  border-color: #409EFF;
}

.dialog-footer .el-button--primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #66B1FF 0%, #409EFF 100%);
  border-color: #66B1FF;
}

/* ============================================================================
   СКРОЛЛБАР — КОМПАКТНЫЙ
   ============================================================================ */
.settings-modal :deep(.el-dialog__body::-webkit-scrollbar) {
  width: 5px;
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
   АНИМАЦИИ
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
   АДАПТИВ — ПЛАНШЕТЫ
   ============================================================================ */
@media (max-width: v-bind('BREAKPOINTS.XXXL')) {
  .settings-modal :deep(.el-dialog) {
    width: 460px !important;
  }

  .settings-modal :deep(.el-dialog__body) {
    padding: 12px;
  }

  .dialog-footer .el-button {
    min-width: 75px;
    font-size: 11px;
  }
}

/* ============================================================================
   АДАПТИВ — МОБИЛЬНЫЕ
   ============================================================================ */
@media (max-width: v-bind('BREAKPOINTS.XL')) {
  .settings-modal :deep(.el-dialog) {
    width: 90% !important;
    margin: 10px auto;
  }

  .settings-modal :deep(.el-dialog__body) {
    padding: 12px;
    max-height: 60vh;
  }

  .settings-modal :deep(.el-dialog__header) {
    padding: 10px 14px;
  }

  .settings-modal :deep(.el-dialog__title) {
    font-size: 13px;
  }

  .settings-modal :deep(.el-form-item__label) {
    font-size: 11px;
  }

  .form-hint {
    font-size: 9px;
  }

  .dialog-footer {
    flex-direction: column;
    gap: 6px;
  }

  .dialog-footer .el-button {
    width: 100%;
    min-width: auto;
  }
}

/* ============================================================================
   АДАПТИВ — ОЧЕНЬ МАЛЕНЬКИЕ ЭКРАНЫ
   ============================================================================ */
@media (max-width: v-bind('BREAKPOINTS.XS')) {
  .settings-modal :deep(.el-dialog) {
    width: 95% !important;
    margin: 5px auto;
  }

  .settings-modal :deep(.el-dialog__header) {
    padding: 10px 12px;
  }

  .settings-modal :deep(.el-dialog__body) {
    padding: 10px;
  }

  .settings-modal :deep(.el-dialog__footer) {
    padding: 10px 12px;
  }

  .settings-modal :deep(.el-divider) {
    margin: 8px 0 6px;
  }

  .settings-modal :deep(.el-divider__text) {
    font-size: 11px;
  }

  .settings-modal :deep(.el-form-item__label) {
    font-size: 10px;
  }

  .form-hint {
    font-size: 8px;
  }

  .dialog-footer .el-button {
    font-size: 11px;
    padding: 7px 12px;
  }
}

/* ============================================================================
   TOUCH DEVICES
   ============================================================================ */
@media (hover: none) and (pointer: coarse) {
  .settings-modal :deep(.el-dialog) {
    width: 95% !important;
  }

  .dialog-footer .el-button {
    min-height: 40px;
    padding: 9px 14px;
    font-size: 13px;
  }

  .settings-modal :deep(.el-form-item__label) {
    font-size: 13px;
  }

  .form-hint {
    font-size: 11px;
  }

  .settings-select :deep(.el-select__wrapper) {
    height: 36px !important;
  }
}
</style>
