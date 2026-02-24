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
      <el-icon
          class="warning-icon"
          :size="DELETE_CONFIRM_UI.ICON_SIZE"
          :color="DELETE_CONFIRM_UI.ICON_COLOR"
      >
        <Warning />
      </el-icon>

      <p class="message">
        {{ DELETE_CONFIRM_MESSAGES.MESSAGE(props.itemName, props.entityLabel) }}
      </p>

      <p class="hint">
        <el-icon><InfoFilled /></el-icon>
        Это действие нельзя отменить
      </p>
    </div>

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
import { computed, watch } from 'vue';
import { Warning, InfoFilled } from '@element-plus/icons-vue';
import {
  DELETE_CONFIRM_PROPS_CONFIG,
  DELETE_CONFIRM_UI,
  DELETE_CONFIRM_MESSAGES,
  BREAKPOINTS,
  ANIMATIONS,
  TIMINGS,
  COLORS,
} from '../../utils/appConfig.js';

const props = defineProps(DELETE_CONFIRM_PROPS_CONFIG);

const emit = defineEmits(['update:visible', 'confirm', 'cancel']);

const localVisible = computed({
  get: () => props.visible,
  set: (val) => {
    console.log('[DeleteConfirm] localVisible: SET', val);
    emit('update:visible', val);
  },
});

watch(() => props.visible, (newVal) => {
  console.log('[DeleteConfirm] watch visible:', newVal);
  if (!newVal) {
    emit('update:visible', false);
  }
});

const handleConfirm = () => {
  console.log('[DeleteConfirm] handleConfirm');
  if (props.loading) return;
  emit('confirm');
};

const handleCancel = () => {
  console.log('[DeleteConfirm] handleCancel');
  if (props.loading) return;
  emit('cancel');
  emit('update:visible', false);
};

const resetForm = () => {
  console.log('[DeleteConfirm] resetForm');
  emit('update:visible', false);
};
</script>

<style scoped>
.delete-confirm {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
  padding: 8px 0;
}

.warning-icon {
  flex-shrink: 0;
  animation: scaleIn v-bind('TIMINGS.MODAL_ANIMATION') ease-out;
}

.message {
  font-size: 14px;
  color: #606266;
  margin: 0;
  line-height: 1.6;
  max-width: 400px;
}

.message .item-name {
  display: block;
  margin-top: 4px;
  font-weight: 600;
  color: #303133;
}

.message strong {
  color: v-bind('COLORS.DANGER');
  font-weight: 600;
}

.hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  color: #909399;
  margin: 0;
  padding: 4px 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.hint :deep(.el-icon) {
  color: v-bind('COLORS.INFO');
  flex-shrink: 0;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding-top: 12px;
}

.dialog-footer .el-button {
  min-width: 80px;
  transition: all v-bind('ANIMATIONS.TRANSITION_NORMAL') v-bind('ANIMATIONS.EASING_EASE');
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

:deep(.el-dialog__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #EBEEF5;
  background-color: #FFFFFF;
}

:deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

:deep(.el-dialog__body) {
  padding: 24px 20px;
}

:deep(.el-dialog__footer) {
  padding: 12px 20px 16px;
  border-top: 1px solid #EBEEF5;
  background-color: #FFFFFF;
}

:deep(.el-dialog__headerbtn) {
  display: none;
}

/* ============================================================================
   АНИМАЦИИ ДИАЛОГА
   ============================================================================ */
.delete-confirm-dialog :deep(.el-dialog) {
  animation: dialogFadeIn v-bind('TIMINGS.MODAL_ANIMATION') ease-out;
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
  animation: overlayFadeIn v-bind('TIMINGS.MODAL_ANIMATION') ease;
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
   АДАПТИВ — ПЛАНШЕТЫ (577px - 768px)
   ============================================================================ */
@media (max-width: v-bind('BREAKPOINTS.XXXL')) {
  .delete-confirm-dialog :deep(.el-dialog) {
    width: 450px !important;
  }

  .warning-icon {
    width: 42px;
    height: 42px;
  }

  .message {
    font-size: 13px;
  }
}

/* ============================================================================
   АДАПТИВ — МОБИЛЬНЫЕ (321px - 576px)
   ============================================================================ */
@media (max-width: v-bind('BREAKPOINTS.XL')) {
  .delete-confirm-dialog :deep(.el-dialog) {
    width: 90% !important;
    margin: 10px auto;
  }

  .delete-confirm {
    gap: 12px;
  }

  .warning-icon {
    width: 36px;
    height: 36px;
  }

  .message {
    font-size: 12px;
  }

  .hint {
    font-size: 11px;
  }

  .dialog-footer {
    flex-direction: column;
    gap: 8px;
  }

  .dialog-footer .el-button {
    width: 100%;
  }
}

/* ============================================================================
   АДАПТИВ — ОЧЕНЬ МАЛЕНЬКИЕ ЭКРАНЫ (≤320px)
   ============================================================================ */
@media (max-width: v-bind('BREAKPOINTS.XS')) {
  .delete-confirm-dialog :deep(.el-dialog) {
    width: 95% !important;
    margin: 5px auto;
  }

  .delete-confirm-dialog :deep(.el-dialog__body) {
    padding: 16px 12px;
  }

  .warning-icon {
    width: 32px;
    height: 32px;
  }

  .message {
    font-size: 11px;
  }

  .hint {
    font-size: 10px;
  }

  .dialog-footer .el-button {
    min-width: auto;
    padding: 8px 12px;
    font-size: 12px;
  }
}

/* ============================================================================
   TOUCH DEVICES — УЛУЧШЕННАЯ ВИДИМОСТЬ
   ============================================================================ */
@media (hover: none) and (pointer: coarse) {
  .dialog-footer .el-button {
    min-height: 44px;
    padding: 10px 16px;
  }

  .warning-icon {
    width: 48px;
    height: 48px;
  }
}
</style>
