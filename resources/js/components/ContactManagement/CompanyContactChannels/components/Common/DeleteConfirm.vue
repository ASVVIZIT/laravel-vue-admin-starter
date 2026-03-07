<template>
  <el-dialog
      v-model="localVisible"
      :title="DELETE_CONFIRM_MESSAGES.TITLE"
      :width="DELETE_CONFIRM_UI.DIALOG_WIDTH"
      :close-on-click-modal="false"
      :close-on-press-escape="!props.loading"
      :show-close="!props.loading"
      @closed="resetForm"
      class="delete-confirm-dialog"
  >
    <div class="delete-confirm">
      <!-- ✅ WARNING ICON -->
      <el-icon
          class="warning-icon"
          :size="DELETE_CONFIRM_UI.ICON_SIZE"
          :color="DELETE_CONFIRM_UI.ICON_COLOR"
      >
        <Warning />
      </el-icon>

      <!-- ✅ MESSAGE -->
      <p class="message" v-html="DELETE_CONFIRM_MESSAGES.MESSAGE(props.itemName, props.entityLabel)"></p>

      <!-- ✅ HINT -->
      <p class="hint">
        <el-icon><InfoFilled /></el-icon>
        {{ DELETE_CONFIRM_MESSAGES.HINT_TEXT }}
      </p>
    </div>

    <!-- ✅ FOOTER BUTTONS -->
    <template #footer>
      <span class="dialog-footer">
        <el-button
            @click="handleCancel"
            :disabled="props.loading"
        >
          {{ DELETE_CONFIRM_MESSAGES.CANCEL }}
        </el-button>
        <el-button
            type="danger"
            @click="handleConfirm"
            :loading="props.loading"
        >
          {{ DELETE_CONFIRM_MESSAGES.CONFIRM }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue';
import { Warning, InfoFilled } from '@element-plus/icons-vue';
import {
  DELETE_CONFIRM_PROPS_CONFIG,
  DELETE_CONFIRM_UI,
  DELETE_CONFIRM_MESSAGES,
  BREAKPOINTS,
  ANIMATIONS,
  TIMINGS,
  COLORS,
} from '../../config/appConfigIndex.js';

const props = defineProps({...DELETE_CONFIRM_PROPS_CONFIG});

const emit = defineEmits(['update:visible', 'confirm', 'cancel']);

// ============================================================================
// COMPUTED — VISIBLE (ДВУСТОРОННЯЯ СВЯЗЬ)
// ============================================================================
const localVisible = computed({
  get: () => props.visible,
  set: (val) => {
    emit('update:visible', val);
  },
});

// ============================================================================
// HANDLE CONFIRM
// ============================================================================
const handleConfirm = () => {
  if (props.loading) return;
  console.log('🔴 [DeleteConfirm] handleConfirm');
  emit('confirm');
};

// ============================================================================
// HANDLE CANCEL
// ============================================================================
const handleCancel = () => {
  if (props.loading) return;
  emit('cancel');
  localVisible.value = false;
};

// ============================================================================
// RESET FORM (ПРИ ЗАКРЫТИИ ДИАЛОГА)
// ============================================================================
const resetForm = () => {
  emit('cancel');
};
</script>

<style scoped>
/* ============================================================================
   DELETE CONFIRM CONTAINER
   ============================================================================ */
.delete-confirm {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  /* ✅ TIMINGS — ИЗ CONFIG */
  gap: v-bind('DELETE_CONFIRM_UI.CONTENT_PADDING');
  padding: v-bind('DELETE_CONFIRM_UI.CONTENT_PADDING');
}

/* ============================================================================
   WARNING ICON
   ============================================================================ */
.warning-icon {
  flex-shrink: 0;
  /* ✅ TIMINGS — АНИМАЦИЯ ПОЯВЛЕНИЯ (300ms) */
  animation: scaleIn v-bind('TIMINGS.MODAL_ANIMATION') v-bind('ANIMATIONS.EASING_EASE_OUT');
}

/* ============================================================================
   MESSAGE
   ============================================================================ */
.message {
  /* ✅ ИЗ CONFIG */
  font-size: v-bind('DELETE_CONFIRM_UI.MESSAGE_FONT_SIZE');
  color: v-bind('DELETE_CONFIRM_UI.MESSAGE_COLOR');
  margin: 0;
  line-height: v-bind('DELETE_CONFIRM_UI.MESSAGE_LINE_HEIGHT');
  max-width: v-bind('DELETE_CONFIRM_UI.MESSAGE_MAX_WIDTH');
}

.message .item-name {
  display: block;
  margin-top: 4px;
  font-weight: v-bind('DELETE_CONFIRM_UI.ITEM_NAME_FONT_WEIGHT');
  color: v-bind('DELETE_CONFIRM_UI.ITEM_NAME_COLOR');
}

.message strong {
  color: v-bind('COLORS.DANGER');
  font-weight: 600;
}

/* ============================================================================
   HINT
   ============================================================================ */
.hint {
  display: flex;
  align-items: center;
  justify-content: center;
  /* ✅ ИЗ CONFIG */
  gap: v-bind('DELETE_CONFIRM_UI.HINT_GAP');
  font-size: v-bind('DELETE_CONFIRM_UI.HINT_FONT_SIZE');
  color: v-bind('DELETE_CONFIRM_UI.HINT_COLOR');
  margin: 0;
  padding: v-bind('DELETE_CONFIRM_UI.HINT_PADDING');
  background-color: v-bind('DELETE_CONFIRM_UI.HINT_BACKGROUND');
  border-radius: v-bind('DELETE_CONFIRM_UI.HINT_BORDER_RADIUS');
}

.hint :deep(.el-icon) {
  color: v-bind('COLORS.INFO');
  flex-shrink: 0;
}

/* ============================================================================
   DIALOG FOOTER
   ============================================================================ */
.dialog-footer {
  display: flex;
  justify-content: center;
  /* ✅ ИЗ CONFIG */
  gap: v-bind('DELETE_CONFIRM_UI.FOOTER_GAP');
  padding-top: v-bind('DELETE_CONFIRM_UI.FOOTER_PADDING_TOP');
}

.dialog-footer .el-button {
  min-width: v-bind('DELETE_CONFIRM_UI.BUTTON_MIN_WIDTH');
  /* ✅ TIMINGS — ПЛАВНЫЙ ПЕРЕХОД (150ms) */
  transition: all v-bind('TIMINGS.RECALCULATING_DURATION') v-bind('ANIMATIONS.EASING_EASE');
}

.dialog-footer .el-button:hover:not(:disabled) {
  transform: scale(1.05);
}

.dialog-footer .el-button--danger {
  background-color: v-bind('COLORS.DANGER');
  border-color: v-bind('COLORS.DANGER');
}

.dialog-footer .el-button--danger:hover:not(:disabled) {
  background-color: v-bind('COLORS.DANGER');
  filter: brightness(1.1);
}

/* ============================================================================
   DIALOG HEADER
   ============================================================================ */
:deep(.el-dialog__header) {
  /* ✅ ИЗ CONFIG */
  padding: v-bind('DELETE_CONFIRM_UI.HEADER_PADDING');
  border-bottom: v-bind('DELETE_CONFIRM_UI.HEADER_BORDER');
  background-color: v-bind('DELETE_CONFIRM_UI.HEADER_BACKGROUND');
}

:deep(.el-dialog__title) {
  font-size: v-bind('DELETE_CONFIRM_UI.TITLE_FONT_SIZE');
  font-weight: v-bind('DELETE_CONFIRM_UI.TITLE_FONT_WEIGHT');
  color: v-bind('DELETE_CONFIRM_UI.TITLE_COLOR');
}

/* ============================================================================
   DIALOG BODY
   ============================================================================ */
:deep(.el-dialog__body) {
  /* ✅ ИЗ CONFIG */
  padding: v-bind('DELETE_CONFIRM_UI.BODY_PADDING');
}

/* ============================================================================
   DIALOG FOOTER (DEEP)
   ============================================================================ */
:deep(.el-dialog__footer) {
  /* ✅ ИЗ CONFIG */
  padding: v-bind('DELETE_CONFIRM_UI.FOOTER_PADDING');
  border-top: v-bind('DELETE_CONFIRM_UI.FOOTER_BORDER');
  background-color: v-bind('DELETE_CONFIRM_UI.FOOTER_BACKGROUND');
}

:deep(.el-dialog__headerbtn) {
  display: none;
}

/* ============================================================================
   DIALOG ANIMATION
   ============================================================================ */
.delete-confirm-dialog :deep(.el-dialog) {
  /* ✅ TIMINGS — АНИМАЦИЯ ПОЯВЛЕНИЯ (300ms) */
  animation: dialogFadeIn v-bind('TIMINGS.MODAL_ANIMATION') v-bind('ANIMATIONS.EASING_EASE_OUT');
}

@keyframes dialogFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.delete-confirm-dialog :deep(.el-overlay) {
  /* ✅ TIMINGS — АНИМАЦИЯ ПОЯВЛЕНИЯ (300ms) */
  animation: overlayFadeIn v-bind('TIMINGS.MODAL_ANIMATION') v-bind('ANIMATIONS.EASING_EASE');
}

@keyframes overlayFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* ============================================================================
   АДАПТИВ — XXXL
   ============================================================================ */
@media (max-width: v-bind('BREAKPOINTS.XXXL')) {
  .delete-confirm-dialog :deep(.el-dialog) {
    width: v-bind('DELETE_CONFIRM_UI.DIALOG_WIDTH_TABLET') !important;
  }

  .warning-icon {
    width: v-bind('DELETE_CONFIRM_UI.ICON_SIZE_TABLET');
    height: v-bind('DELETE_CONFIRM_UI.ICON_SIZE_TABLET');
  }

  .message {
    font-size: v-bind('DELETE_CONFIRM_UI.MESSAGE_FONT_SIZE_TABLET');
  }
}

/* ============================================================================
   АДАПТИВ — XL
   ============================================================================ */
@media (max-width: v-bind('BREAKPOINTS.XL')) {
  .delete-confirm-dialog :deep(.el-dialog) {
    width: v-bind('DELETE_CONFIRM_UI.DIALOG_WIDTH_MOBILE') !important;
    margin: 10px auto;
  }

  .delete-confirm {
    gap: v-bind('DELETE_CONFIRM_UI.HINT_GAP_MOBILE');
  }

  .warning-icon {
    width: v-bind('DELETE_CONFIRM_UI.ICON_SIZE_MOBILE');
    height: v-bind('DELETE_CONFIRM_UI.ICON_SIZE_MOBILE');
  }

  .message {
    font-size: v-bind('DELETE_CONFIRM_UI.MESSAGE_FONT_SIZE_MOBILE');
  }

  .hint {
    font-size: v-bind('DELETE_CONFIRM_UI.HINT_FONT_SIZE_MOBILE');
  }

  .dialog-footer {
    flex-direction: column;
    gap: v-bind('DELETE_CONFIRM_UI.FOOTER_GAP_MOBILE');
  }

  .dialog-footer .el-button {
    width: 100%;
  }
}

/* ============================================================================
   АДАПТИВ — XS
   ============================================================================ */
@media (max-width: v-bind('BREAKPOINTS.XS')) {
  .delete-confirm-dialog :deep(.el-dialog) {
    width: v-bind('DELETE_CONFIRM_UI.DIALOG_WIDTH_SMALL') !important;
    margin: 5px auto;
  }

  .delete-confirm-dialog :deep(.el-dialog__body) {
    padding: v-bind('DELETE_CONFIRM_UI.BODY_PADDING_SMALL');
  }

  .warning-icon {
    width: v-bind('DELETE_CONFIRM_UI.ICON_SIZE_SMALL');
    height: v-bind('DELETE_CONFIRM_UI.ICON_SIZE_SMALL');
  }

  .message {
    font-size: v-bind('DELETE_CONFIRM_UI.MESSAGE_FONT_SIZE_SMALL');
  }

  .hint {
    font-size: v-bind('DELETE_CONFIRM_UI.HINT_FONT_SIZE_SMALL');
  }

  .dialog-footer .el-button {
    min-width: auto;
    padding: 8px 12px;
    font-size: 12px;
  }
}

/* ============================================================================
   TOUCH DEVICES
   ============================================================================ */
@media (hover: none) and (pointer: coarse) {
  .dialog-footer .el-button {
    min-height: 44px;
    padding: 10px 16px;
  }

  .warning-icon {
    width: v-bind('DELETE_CONFIRM_UI.ICON_SIZE');
    height: v-bind('DELETE_CONFIRM_UI.ICON_SIZE');
  }
}
</style>
