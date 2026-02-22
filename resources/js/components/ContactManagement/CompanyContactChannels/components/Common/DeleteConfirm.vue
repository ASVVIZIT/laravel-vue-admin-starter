<template>
  <el-dialog
      v-model="localVisible"
      :title="dialogTitle"
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
        <el-button @click="handleCancel" :disabled="props.loading">
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
import { ref, watch, computed } from 'vue';
import { Warning, InfoFilled } from '@element-plus/icons-vue';
import {
  DELETE_CONFIRM_PROPS_CONFIG,
  DELETE_CONFIRM_UI,
  DELETE_CONFIRM_MESSAGES,
} from '../../utils/paginationOptions.js';

const props = defineProps(DELETE_CONFIRM_PROPS_CONFIG);
const emit = defineEmits(['update:visible', 'confirm', 'cancel']);

const localVisible = ref(props.visible);

const dialogTitle = computed(() => {
  return DELETE_CONFIRM_MESSAGES.TITLE;
});

watch(() => props.visible, (newVal) => {
  localVisible.value = newVal;
});

watch(localVisible, (newVal) => {
  if (!newVal && props.visible) {
    emit('update:visible', false);
  }
});

const handleConfirm = () => {
  if (props.loading) return;
  emit('confirm');
};

const handleCancel = () => {
  if (props.loading) return;
  emit('cancel');
  localVisible.value = false;
};

const resetForm = () => {
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
}

.message {
  font-size: 14px;
  color: #606266;
  margin: 0;
  line-height: 1.6;
}

.message .item-name {
  display: block;
  margin-top: 4px;
}

.message strong {
  color: #303133;
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
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.dialog-footer .el-button {
  min-width: 80px;
}

:deep(.el-dialog__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #EBEEF5;
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
}

:deep(.el-dialog__headerbtn) {
  display: none;
}
</style>
