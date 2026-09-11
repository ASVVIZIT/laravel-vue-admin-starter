<template>
  <el-dialog
      v-model="visible"
      :title="$t(titleKey)"
      width="500px"
      :close-on-click-modal="false"
      @close="handleClose"
  >
    <div class="confirm-content">
      <el-icon class="confirm-icon" :size="40" :color="iconColor">
        <component :is="iconComponent" />
      </el-icon>
      <div class="confirm-message">
        {{ $t(messageKey) }}
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">
        {{ $t('diagnostics.actions.cancel') }}
      </el-button>
      <el-button
          :type="confirmButtonType"
          @click="handleConfirm"
      >
        {{ $t(confirmButtonKey) }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { WarningFilled, CircleCloseFilled, InfoFilled } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  titleKey: {
    type: String,
    required: true
  },
  messageKey: {
    type: String,
    required: true
  },
  confirmButtonKey: {
    type: String,
    default: 'diagnostics.actions.confirm'
  },
  type: {
    type: String,
    default: 'warning',
    validator: (val) => ['info', 'warning', 'danger'].includes(val)
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const iconComponent = computed(() => {
  const icons = {
    info: InfoFilled,
    warning: WarningFilled,
    danger: CircleCloseFilled
  }
  return icons[props.type] || WarningFilled
})

const iconColor = computed(() => {
  const colors = {
    info: '#409eff',
    warning: '#e6a23c',
    danger: '#f56c6c'
  }
  return colors[props.type] || '#e6a23c'
})

const confirmButtonType = computed(() => {
  const types = {
    info: 'primary',
    warning: 'warning',
    danger: 'danger'
  }
  return types[props.type] || 'warning'
})

const handleClose = () => {
  visible.value = false
}

const handleConfirm = () => {
  emit('confirm')
  handleClose()
}
</script>

<style scoped lang="scss">
.confirm-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 0;

  .confirm-icon {
    flex-shrink: 0;
  }

  .confirm-message {
    flex: 1;
    font-size: 14px;
    line-height: 1.6;
    color: #606266;
  }
}
</style>
