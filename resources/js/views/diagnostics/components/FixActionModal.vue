<template>
  <el-dialog
      v-if="check && check.fix_instructions"
      v-model="visible"
      :title="$t(check.fix_instructions.title_key)"
      width="600px"
      :close-on-click-modal="false"
  >
    <div class="fix-content">
      <!-- Обнаруженная проблема + жёлтая кнопка копирования -->
      <div class="fix-block">
        <div class="fix-label">{{ $t('diagnostics.fix.problem') }}:</div>
        <div class="problem-row">
          <el-alert
              :title="check.details"
              :type="check.status === 'fail' ? 'error' : 'warning'"
              :closable="false"
              show-icon
              class="problem-alert"
          />
          <el-tooltip
              v-if="copyList"
              :content="$t('diagnostics.fix.copy_list_tooltip')"
              placement="top"
          >
            <button type="button" class="copy-list-btn" @click="copyListToClipboard">
              <IconEpDocumentCopy class="copy-list-icon" />
              <span class="copy-list-label">{{ $t('diagnostics.fix.copy_list') }}</span>
            </button>
          </el-tooltip>
        </div>
      </div>

      <!-- Список полей слева + вертикальный слайдер справа -->
      <div v-if="missingFields.length > 0" class="fix-block fields-block">
        <div class="fields-body">
          <div class="fields-main">
            <span class="fix-label">{{ $t('diagnostics.fix.fields_display_title') }}:</span>

            <!-- Вертикальный режим: компактный маркированный список -->
            <ul v-if="viewMode === 'vertical'" class="fields-list fields-list--vertical">
              <li v-for="field in missingFields" :key="field" class="field-item">
                <code>{{ field }}</code>
              </li>
            </ul>

            <!-- Горизонтальный режим: одной строкой -->
            <div v-else class="fields-list fields-list--horizontal">
              <code>{{ missingFields.join(', ') }}</code>
            </div>
          </div>

          <!-- Вертикальный слайдер справа от списка -->
          <ViewModeSwitch v-model="viewMode" class="fields-switch" />
        </div>
      </div>

      <p class="fix-desc">{{ $t(check.fix_instructions.description_key) }}</p>

      <div v-if="check.fix_instructions.file" class="fix-block">
        <div class="fix-label">{{ $t('diagnostics.actions.file') }}:</div>
        <el-tag type="info" size="small">{{ check.fix_instructions.file }}</el-tag>
      </div>

      <div v-if="check.fix_instructions.cli" class="fix-block">
        <div class="fix-label">{{ $t('diagnostics.actions.cli_command') }}:</div>
        <div class="cli-box">
          <code>{{ check.fix_instructions.cli }}</code>
          <el-button
              type="primary"
              size="small"
              @click="copyCli"
              :icon="IconEpDocumentCopy"
          >
            {{ $t('diagnostics.actions.copy_cli') }}
          </el-button>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="visible = false">
        {{ $t('diagnostics.actions.close') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
// computed, ref, watch — авто-импорт (unplugin-auto-import)
import { useI18n } from 'vue-i18n'
import { copyToClipboard } from '@/utils/diagnosticsActions'
import IconEpDocumentCopy from '~icons/ep/document-copy'
import ViewModeSwitch from './ViewModeSwitch.vue'

const { t } = useI18n()

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  check: { type: Object, default: null }
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// Режим отображения списка: по умолчанию вертикально
const viewMode = ref('vertical')

// При каждом открытии модалки сбрасываем режим на вертикальный
watch(visible, (isOpen) => {
  if (isOpen) {
    viewMode.value = 'vertical'
  }
})

/**
 * Массив недостающих полей с бэкенда (missing_fillable).
 * Единый источник и для отображения, и для копирования.
 */
const missingFields = computed(() => {
  const missing = props.check?.missing_fillable
  return Array.isArray(missing) ? missing : []
})

/**
 * Строка для копирования: 'a', 'b', 'c' — готова для вставки в $fillable.
 * НЕ зависит от режима отображения (viewMode).
 */
const copyList = computed(() => {
  if (missingFields.value.length === 0) return ''
  return missingFields.value.map((field) => `'${field}'`).join(', ')
})

const copyListToClipboard = () => {
  if (copyList.value) {
    copyToClipboard(copyList.value, t('diagnostics.fix.copy_list_success'))
  }
}

const copyCli = () => {
  if (props.check?.fix_instructions?.cli) {
    copyToClipboard(props.check.fix_instructions.cli)
  }
}
</script>

<style scoped lang="scss">
.fix-content {
  .fix-desc {
    font-size: 14px;
    line-height: 1.6;
    color: #606266;
    margin-bottom: 20px;
  }

  .fix-block {
    margin-bottom: 16px;

    .fix-label {
      font-weight: 600;
      font-size: 13px;
      color: #303133;
      margin-bottom: 8px;
    }

    .problem-row {
      display: flex;
      align-items: stretch;
      gap: 8px;

      .problem-alert {
        flex: 1;
      }

      // Жёлтая квадратная кнопка: иконка сверху, подпись снизу
      .copy-list-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6px;
        min-width: 96px;
        padding: 10px 12px;
        border: 1px solid #e6a23c;
        border-radius: 4px;
        background: #fdf6ec;
        color: #e6a23c;
        cursor: pointer;
        transition: background 0.2s, color 0.2s;

        &:hover,
        &:focus {
          background: #e6a23c;
          color: #fff;
        }

        .copy-list-icon {
          width: 26px;
          height: 26px;
        }

        .copy-list-label {
          font-size: 12px;
          line-height: 1.2;
          text-align: center;
        }
      }
    }

    // Блок со списком полей и вертикальным слайдером
    &.fields-block {
      background: #f5f7fa;
      border: 1px solid #e4e7ed;
      border-radius: 4px;
      padding: 10px 12px;

      // 🔥 Список слева, слайдер справа — без отдельной строки-шапки
      .fields-body {
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }

      .fields-main {
        flex: 1;
        min-width: 0;

        .fix-label {
          display: block;
          margin-bottom: 8px;
        }
      }

      .fields-switch {
        flex-shrink: 0;
      }

      // Компактные поля
      .fields-list {
        code {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          color: #303133;
          background: #fff;
          padding: 1px 5px;
          border-radius: 3px;
          border: 1px solid #dcdfe6;
        }

        // Вертикальный режим: компактный маркированный список
        &--vertical {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;

          .field-item {
            display: flex;
            align-items: center;
            gap: 6px;

            &::before {
              content: '•';
              color: #e6a23c;
              font-size: 14px;
              line-height: 1;
            }
          }
        }

        // Горизонтальный режим: одна строка
        &--horizontal {
          word-break: break-all;
          line-height: 1.5;
        }
      }
    }

    .cli-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #f5f7fa;
      border: 1px solid #e4e7ed;
      border-radius: 4px;
      padding: 10px 12px;

      code {
        font-family: 'Courier New', monospace;
        font-size: 13px;
        color: #409eff;
        word-break: break-all;
      }
    }
  }
}
</style>
