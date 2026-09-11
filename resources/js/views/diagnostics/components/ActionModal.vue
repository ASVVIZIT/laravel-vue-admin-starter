<template>
  <el-dialog
      v-model="visible"
      :title="$t(titleKey)"
      width="600px"
      :close-on-click-modal="false"
      @close="handleClose"
  >
    <div class="action-modal-content">
      <div v-if="descriptionKey" class="action-description">
        {{ $t(descriptionKey) }}
      </div>

      <div v-if="cliCommand" class="cli-block">
        <div class="cli-label">{{ $t('diagnostics.actions.cli_command') }}:</div>
        <el-input
            v-model="cliCommand"
            readonly
            type="textarea"
            :rows="3"
            class="cli-input"
        />
        <el-button
            type="primary"
            size="small"
            @click="copyCli"
            class="copy-btn"
        >
          {{ $t('diagnostics.actions.copy_cli') }}
        </el-button>
      </div>

      <div v-if="file" class="file-block">
        <div class="file-label">{{ $t('diagnostics.actions.file') }}:</div>
        <el-tag type="info" size="small">{{ file }}</el-tag>
      </div>

      <div v-if="additionalInfo" class="additional-info">
        <slot name="additional"></slot>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">
        {{ $t('diagnostics.actions.close') }}
      </el-button>
      <el-button
          v-if="primaryActionKey"
          type="primary"
          @click="handlePrimaryAction"
      >
        {{ $t(primaryActionKey) }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  titleKey: {
    type: String,
    required: true
  },
  descriptionKey: {
    type: String,
    default: null
  },
  cliCommand: {
    type: String,
    default: null
  },
  file: {
    type: String,
    default: null
  },
  primaryActionKey: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'primary-action'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const copyCli = () => {
  if (props.cliCommand) {
    copyToClipboard(props.cliCommand, 'CLI-команда скопирована')
  }
}

const handleClose = () => {
  visible.value = false
}

const handlePrimaryAction = () => {
  emit('primary-action')
  handleClose()
}
</script>

<style scoped lang="scss">
.action-modal-content {
  .action-description {
    margin-bottom: 16px;
    line-height: 1.6;
    color: #606266;
  }

  .cli-block {
    margin-bottom: 16px;

    .cli-label {
      font-weight: 600;
      margin-bottom: 8px;
      color: #303133;
    }

    .cli-input {
      margin-bottom: 8px;
      font-family: 'Courier New', monospace;
      font-size: 13px;
    }

    .copy-btn {
      width: 100%;
    }
  }

  .file-block {
    margin-bottom: 16px;

    .file-label {
      font-weight: 600;
      margin-bottom: 8px;
      color: #303133;
    }
  }

  .additional-info {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #ebeef5;
  }
}
</style>
