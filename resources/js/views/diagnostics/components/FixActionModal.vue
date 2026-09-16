<template>
  <el-dialog
      v-if="check && check.fix_instructions"
      v-model="visible"
      :title="$t(check.fix_instructions.title_key)"
      :width="dialogWidth"
      :align-center="isMobile"
      :close-on-click-modal="false"
  >
    <div class="fix-content">
      <!-- СЕКЦИЯ: недостающие поля. Лейбл СНАРУЖИ рамок (единый паттерн формы) -->
      <div v-if="missingFields.length > 0" class="fix-block fields-section">
        <div class="fix-label">
          {{ $t('diagnostics.fix.fields_display_title') }}:
          <el-tag
              v-if="FIELD_LIST_CONFIG.SHOW_FIELD_COUNT && fieldCount > 0"
              type="warning"
              size="small"
              effect="plain"
              class="field-count-badge"
          >
            {{ fieldCount }}
          </el-tag>
        </div>

        <!-- Строка из двух рамок: список | switch+кнопка -->
        <div class="fix-top-row">
          <div class="fields-block">
            <div class="fields-scroll">
              <!-- Вертикальный режим: как в модели User.php -->
              <ul v-if="isVertical" class="fields-list fields-list--vertical">
                <li v-for="line in copyLines" :key="line" class="field-item">
                  <code>{{ line }}</code>
                </li>
              </ul>

              <!-- Горизонтальный режим: чипы с переносом ПО ЭЛЕМЕНТУ (по запятой) -->
              <div v-else class="fields-list fields-list--horizontal">
                <code v-for="chip in copyChips" :key="chip" class="field-chip">{{ chip }}</code>
              </div>
            </div>
          </div>

          <div class="switch-block">
            <ViewModeSwitch
                :model-value="viewMode"
                @update:model-value="onViewModeChange"
            />

            <el-tooltip
                v-if="copyList"
                :content="$t('diagnostics.fix.copy_list_tooltip')"
                placement="top"
            >
              <button type="button" class="copy-list-btn" @click="copyListToClipboard">
                <IconEpDocumentCopy class="copy-list-icon" />
                <span class="copy-list-text">
                  <span class="copy-list-label-line">{{ $t('diagnostics.fix.copy_list_action') }}</span>
                  <span class="copy-list-label-line">{{ $t('diagnostics.fix.copy_list_object') }}</span>
                </span>
              </button>
            </el-tooltip>
          </div>
        </div>
      </div>

      <!-- Обнаруженная проблема: лейбл снаружи, alert во всю ширину -->
      <div class="fix-block">
        <div class="fix-label">{{ $t('diagnostics.fix.problem') }}:</div>
        <el-alert
            :title="check.details"
            :type="check.status === 'fail' ? 'error' : 'warning'"
            :closable="false"
            show-icon
            class="problem-alert"
        />
      </div>

      <!-- Описание с подсветкой файлов, $-переменных, полей, миграций -->
      <p class="fix-desc" v-html="formattedDescription"></p>

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
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useBreakpoints } from '@vueuse/core'
import {
  copyToClipboard,
  FIELD_LIST_CONFIG,
  getFieldLines,
  formatFieldsHorizontal,
  formatFieldsByMode
} from '@/utils/diagnosticsActions'
import IconEpDocumentCopy from '~icons/ep/document-copy'
import ViewModeSwitch from './ViewModeSwitch.vue'

const { t } = useI18n()

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  check: { type: Object, default: null }
})

const emit = defineEmits(['update:modelValue'])

// ============================================================================
// ЭКРАННАЯ СИСТЕМА
// ============================================================================
// >=768px (desktop) : 600px ширина, 2 колонки (поля | switch+кнопка)
// 480-767px (tablet): 90% ширина, стек (поля сверху, switch+кнопка строкой снизу)
// <480px (mobile)   : 95% ширина, align-center, компакт-switch 104px
const breakpoints = useBreakpoints({
  tablet: 480,
  laptop: 768
})
const isMobile = breakpoints.smaller('laptop')
const isTiny = breakpoints.smaller('tablet')

const dialogWidth = computed(() => {
  if (isTiny.value) return '95%'
  if (isMobile.value) return '90%'
  return '600px'
})

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const viewMode = ref(FIELD_LIST_CONFIG.DEFAULT_VIEW_MODE)

const isVertical = computed(() => viewMode.value === FIELD_LIST_CONFIG.VIEW_MODES.VERTICAL)

// Сброс в режим по умолчанию при каждом открытии модалки (цикла нет: viewMode не источник для visible)
watch(visible, (isOpen) => {
  if (isOpen) {
    viewMode.value = FIELD_LIST_CONFIG.DEFAULT_VIEW_MODE
  }
})

const missingFields = computed(() => {
  const missing = props.check?.missing_fillable
  return Array.isArray(missing) ? missing : []
})

const copyLines = computed(() => getFieldLines(missingFields.value))

/**
 * Количество недостающих полей для отображения в бейдже.
 */
const fieldCount = computed(() => missingFields.value.length)

const copyList = computed(() => formatFieldsHorizontal(missingFields.value))

const copyChips = computed(() => {
  const fields = missingFields.value
  const lastIndex = fields.length - 1

  return fields.map((field, index) => {
    const quoted = `${FIELD_LIST_CONFIG.FIELD_QUOTE}${field}${FIELD_LIST_CONFIG.FIELD_QUOTE}`
    return index < lastIndex ? quoted + FIELD_LIST_CONFIG.FIELD_SUFFIX : quoted
  })
})

const onViewModeChange = (val) => {
  viewMode.value = val
}

// 🔥 DEBUG: лог структуры перед копированием
const copyListToClipboard = () => {
  const textToCopy = formatFieldsByMode(missingFields.value, viewMode.value)

  console.log('[FixActionModal] клик «Скопировать список»:', {
    viewMode: viewMode.value,
    textToCopy,
    missing_fillable_from_backend: props.check?.missing_fillable,
    missingFields: missingFields.value,
    copyLines_vertical: copyLines.value,
    copyList_horizontal: copyList.value
  })

  if (textToCopy) {
    copyToClipboard(textToCopy, t('diagnostics.fix.copy_list_success'))
  } else {
    console.warn('[FixActionModal] textToCopy пуст — копировать нечего')
  }
}

const copyCli = () => {
  if (props.check?.fix_instructions?.cli) {
    copyToClipboard(props.check.fix_instructions.cli)
  }
}

/**
 * Форматирование текста инструкции с подсветкой ключевых элементов.
 * Порядок замены: файлы > миграции > $ > поля (длинные → короткие).
 * Безопасность: весь текст экранируется до вставки в DOM.
 */
const formatDescription = (text, fields) => {
  const escapeHtml = (str) =>
      str.replace(/[&<>"']/g, (c) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[c]))

  const slots = []
  const slot = (html) => {
    const id = slots.length
    slots.push(html)
    return `§${id}§`
  }

  let result = escapeHtml(text)

  result = result.replace(
      /[\w\-/]+\.(php|json|js|ts|vue)/gi,
      (m) => slot(`<span class="fix-desc-file">${m}</span>`)
  )

  result = result.replace(
      /\b(add|create|remove|drop)_[a-z0-9_]+_table\b/gi,
      (m) => slot(`<span class="fix-desc-migration">${m}</span>`)
  )

  result = result.replace(
      /\$[a-zA-Z_]\w*/g,
      (m) => slot(`<span class="fix-desc-var">${m}</span>`)
  )

  const sortedFields = [...fields].sort((a, b) => b.length - a.length)
  sortedFields.forEach((field) => {
    const re = new RegExp(`\\b${field}\\b`, 'g')
    result = result.replace(
        re,
        () => slot(`<span class="fix-desc-field">${field}</span>`)
    )
  })

  return result.replace(/§(\d+)§/g, (_, id) => slots[parseInt(id)])
}

const formattedDescription = computed(() => {
  const key = props.check?.fix_instructions?.description_key
  if (!key) return ''
  return formatDescription(t(key), missingFields.value)
})
</script>

<style scoped lang="scss">
.fix-content {
  // ==========================================================================
  // СЕКЦИЯ «НЕДОСТАЮЩИЕ ПОЛЯ»: лейбл СНАРУЖИ рамок (единый паттерн формы)
  // ==========================================================================

  // Селектор с двойным классом .fix-block.fields-section — специфичность выше,
  // чем у базового .fix-block .fix-label (margin-bottom: 8px),
  // поэтому margins 5/5 применяются независимо от порядка правил в файле.
  .fix-block.fields-section > .fix-label {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 5px;
    margin-bottom: 5px;

    // Бейдж с количеством полей
    .field-count-badge {
      font-weight: 500;
      font-size: 11px;
      padding: 2px 6px;
    }
  }

  // ==========================================================================
  // СТРОКА ИЗ ДВУХ РАМОК: список | switch+кнопка (обе рамки с одной Y)
  // ==========================================================================
  .fix-top-row {
    display: flex;
    align-items: stretch;
    gap: 12px;

    // Tablet/Mobile: стек — список сверху, switch+кнопка строкой снизу
    @media (max-width: 767px) {
      flex-direction: column;
    }
  }

  // ==========================================================================
  // РАМКА СПИСКА ПОЛЕЙ (лейбл больше НЕ внутри)
  // ==========================================================================
  .fields-block {
    --field-font: 11px;    // размер кода полей: список + чипы (единая точка)
    --field-line: 17px;    // 11*1.2 + 2 padding + 2 border
    --field-gap: 4px;
    --scroll-lines: 3;     // эталон видимых строк

    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    flex-direction: column;
    background: #f5f7fa;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    padding: 10px 12px;

    // Зона скролла: basis 0 = высота НЕ зависит от контента.
    // Desktop: тянется до высоты switch-блока.
    // Tablet/Mobile (стек): min-height = эталон 3 строки (17*3 + 4*2 = 59px).
    // Контент выше зоны → overflow-y: auto даёт скроллбар.
    .fields-scroll {
      flex: 1 1 0;
      min-height: calc(
          var(--field-line) * var(--scroll-lines) +
          var(--field-gap) * (var(--scroll-lines) - 1)
      );
      overflow-y: auto;
      padding-right: 6px;   // место под скроллбар

      // Тонкий скроллбар (WebKit)
      &::-webkit-scrollbar {
        width: 6px;
      }
      &::-webkit-scrollbar-track {
        background: transparent;
      }
      &::-webkit-scrollbar-thumb {
        background: #c0c4cc;
        border-radius: 3px;

        &:hover {
          background: #909399;
        }
      }

      // Firefox
      scrollbar-width: thin;
      scrollbar-color: #c0c4cc transparent;
    }

    .fields-list {
      code {
        font-family: 'Courier New', monospace;
        font-size: var(--field-font);
        color: #303133;
        background: #fff;
        padding: 1px 5px;
        border-radius: 3px;
        border: 1px solid #dcdfe6;
      }

      // Вертикальный режим: столбик, отступ как внутри protected $fillable = [ ... ]
      &--vertical {
        list-style: none;
        margin: 0;
        padding: 0 0 0 14px;
        display: flex;
        flex-direction: column;
        gap: var(--field-gap);

        .field-item {
          display: flex;
          align-items: center;
        }
      }

      // Горизонтальный режим: чипы flex-wrap — перенос ПО ЭЛЕМЕНТУ (по запятой)
      &--horizontal {
        display: flex;
        flex-wrap: wrap;
        gap: var(--field-gap);
        align-content: flex-start;

        .field-chip {
          white-space: nowrap;   // чип не рвётся внутри имени поля
        }
      }
    }
  }

  // ==========================================================================
  // РАМКА ПЕРЕКЛЮЧАТЕЛЯ + КНОПКА КОПИРОВАНИЯ
  // ==========================================================================
  .switch-block {
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: #f5f7fa;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    padding: 10px 12px;

    // Tablet/Mobile: switch и кнопка в одну строку
    @media (max-width: 767px) {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
  }

  // Жёлтая кнопка копирования: ширина 118px (равна ViewModeSwitch),
  // иконка В СТРОКУ слева, текст двумя строками справа
  .copy-list-btn {
    width: 118px;
    padding: 8px;
    border: 1px solid #e6a23c;
    border-radius: 4px;
    background: #fdf6ec;
    color: #e6a23c;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: background 0.2s, color 0.2s;

    &:hover,
    &:focus {
      background: #e6a23c;
      color: #fff;
    }

    .copy-list-icon {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }

    .copy-list-text {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .copy-list-label-line {
      display: block;
      font-size: 11px;
      line-height: 1.2;
      text-align: center;
    }

    // Tablet/Mobile: кнопка тянется на свободное место строки
    @media (max-width: 767px) {
      flex: 1;
      width: auto;
      min-width: 0;
    }
  }

  // ==========================================================================
  // ОПИСАНИЕ С ПОДСВЕТКОЙ (бледно-зелёный блок)
  // ==========================================================================
  .fix-desc {
    font-size: 14px;
    line-height: 1.6;
    color: #606266;
    margin-bottom: 15px;
    background: #f0f9f4;
    border: 1px solid #d4e8dc;
    border-radius: 4px;      // 🔒 ВАЖНО: не менять
    padding: 10px 12px;      // 🔒 ВАЖНО: не менять

    // v-html вставляет DOM без Vue-скоупинга → :deep()
    :deep(.fix-desc-file) {
      font-weight: 600;
      color: #1f2937;
      font-family: 'Courier New', monospace;
      background: rgba(255, 255, 255, 0.6);
      padding: 1px 4px;
      border-radius: 3px;
    }

    :deep(.fix-desc-var) {
      color: #1e40af;               // тёмно-синий
      font-family: 'Courier New', monospace;
      font-weight: 500;
    }

    :deep(.fix-desc-field) {
      font-style: italic;
      color: #60a5fa;               // светло-синий
      font-family: 'Courier New', monospace;
    }

    :deep(.fix-desc-migration) {
      color: #6b7280;
      font-family: 'Courier New', monospace;
      font-size: 0.92em;
      background: rgba(255, 255, 255, 0.5);
      padding: 1px 4px;
      border-radius: 3px;
    }

    // Mobile: только шрифт плотнее (padding уже 10px 12px в базе)
    @media (max-width: 479px) {
      font-size: 13px;
    }
  }

  // ==========================================================================
  // ОСТАЛЬНЫЕ БЛОКИ (лейблы снаружи рамок — единый паттерн)
  // ==========================================================================
  .fix-block {
    margin-bottom: 16px;

    .fix-label {
      font-weight: 600;
      font-size: 13px;
      color: #303133;
      margin-bottom: 8px;
    }

    .problem-alert {
      width: 100%;
    }

    .cli-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
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

      // Mobile: команда сверху, кнопка снизу
      @media (max-width: 479px) {
        flex-direction: column;
        align-items: stretch;

        .el-button {
          width: 100%;
        }
      }
    }
  }

  // ==========================================================================
  // ДОСТУПНОСТЬ: отключение анимаций по системной настройке (2026 must-have)
  // ==========================================================================
  @media (prefers-reduced-motion: reduce) {
    .copy-list-btn,
    .fields-scroll {
      transition: none;
      scroll-behavior: auto;
    }
  }
}
</style>
