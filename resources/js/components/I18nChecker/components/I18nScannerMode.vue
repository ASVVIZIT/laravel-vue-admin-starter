<template>
  <div class="i18n-scanner-mode">
    <!-- Панель управления -->
    <div class="i18n-scan-control">
      <el-button
          type="primary"
          size="small"
          :loading="loading"
          @click="$emit('scan')"
      >
        <Icon class-name="search" />
        {{ loading
          ? ($t('i18nChecker.scanning') || 'Сканирование...')
          : ($t('i18nChecker.startScan') || 'Запустить сканер')
        }}
      </el-button>
      <span class="i18n-scan-hint">
        {{ $t('i18nChecker.scanHint') || 'Сканер найдёт все ключи в коде и сравнит с переводами' }}
      </span>
      <div class="i18n-spacer" />
      <div class="i18n-total-keys">
        <Icon class-name="key" />
        <span>{{ report?.summary?.totalUsedKeys || 0 }}</span>
        <span class="i18n-total-label">{{ $t('i18nChecker.keysInCode') || 'ключей в коде' }}</span>
      </div>
    </div>

    <!-- Блок ошибки -->
    <div v-if="error && !report" class="i18n-error-block">
      <Icon class-name="exclamation-circle" />
      <p>{{ error }}</p>
    </div>

    <!-- Результаты -->
    <div v-if="report" class="i18n-scan-results">

      <!-- 🔥 ТАБЫ ЯЗЫКОВ -->
      <div class="i18n-lang-tabs">
        <button
            v-for="(stats, lang) in (report.summary?.languages || {})"
            :key="lang"
            :class="['i18n-lang-tab', { 'i18n-lang-tab-active': activeLang === lang }]"
            @click="activeLang = lang"
        >
          <span class="i18n-lang-flag">{{ getFlagEmoji(lang) }}</span>
          <span class="i18n-lang-name">{{ lang.toUpperCase() }}</span>
          <span class="i18n-lang-coverage" :class="{ 'i18n-lang-coverage-bad': stats.missing > 0 }">
            {{ stats.coverage || '0%' }}
          </span>
          <span class="i18n-lang-stats">
            <span class="i18n-lang-missing">−{{ stats.missing || 0 }}</span>
            <span class="i18n-lang-unused">~{{ stats.unused || 0 }}</span>
          </span>
        </button>
      </div>

      <!-- 🔥 КОНТЕНТ АКТИВНОГО ЯЗЫКА -->
      <div v-if="activeLang" class="i18n-lang-content">

        <!-- Сводка -->
        <div class="i18n-lang-summary">
          <div class="i18n-summary-item">
            <span class="i18n-summary-label">{{ $t('i18nChecker.totalKeys') || 'Всего' }}</span>
            <span class="i18n-summary-value">
              {{ report.summary?.languages?.[activeLang]?.totalKeys || 0 }}
            </span>
          </div>
          <div class="i18n-summary-item i18n-summary-coverage">
            <span class="i18n-summary-label">{{ $t('i18nChecker.coverage') || 'Покрытие' }}</span>
            <span class="i18n-summary-value">
              {{ report.summary?.languages?.[activeLang]?.coverage || '0%' }}
            </span>
          </div>
          <div class="i18n-summary-item i18n-summary-used">
            <span class="i18n-summary-label">{{ $t('i18nChecker.usedInCode') || 'Исп.' }}</span>
            <span class="i18n-summary-value">
              {{ report.summary?.languages?.[activeLang]?.usedInCode || 0 }}
            </span>
          </div>
          <div class="i18n-summary-item i18n-summary-missing">
            <span class="i18n-summary-label">{{ $t('i18nChecker.missingKeys') || 'Отс.' }}</span>
            <span class="i18n-summary-value">
              {{ report.summary?.languages?.[activeLang]?.missing || 0 }}
            </span>
          </div>
          <div class="i18n-summary-item i18n-summary-unused">
            <span class="i18n-summary-label">{{ $t('i18nChecker.unusedKeys') || 'Не исп.' }}</span>
            <span class="i18n-summary-value">
              {{ report.summary?.languages?.[activeLang]?.unused || 0 }}
            </span>
          </div>
          <div class="i18n-summary-progress">
            <div
                class="i18n-summary-progress-fill"
                :style="{ width: report.summary?.languages?.[activeLang]?.coverage || '0%' }"
            />
          </div>
        </div>

        <!-- 🔥 СВОРАЧИВАЕМЫЕ СЕКЦИИ -->
        <el-collapse v-model="expandedSections" class="i18n-collapse">

          <!-- 🔥 MISSING С ПОИСКОМ И КОПИРОВАНИЕМ -->
          <el-collapse-item
              v-if="currentMissing && currentMissing.length > 0"
              name="missing"
          >
            <template #title>
              <div class="i18n-collapse-header i18n-collapse-header-danger">
                <Icon class-name="exclamation-circle" />
                <span>{{ $t('i18nChecker.missingIn') || 'Отсутствуют в' }} {{ activeLang.toUpperCase() }}</span>
                <el-tag type="danger" size="small" effect="dark">
                  {{ currentMissing.length }}
                </el-tag>
              </div>
            </template>

            <!-- 🔥 ПАНЕЛЬ ПОИСКА И КОПИРОВАНИЯ -->
            <div class="i18n-search-panel">
              <el-input
                  v-model="missingSearch"
                  :placeholder="$t('i18nChecker.searchKey') || 'Поиск по ключу...'"
                  size="small"
                  clearable
                  class="i18n-search-input"
              >
                <template #prefix>
                  <Icon class-name="search" />
                </template>
              </el-input>

              <el-select
                  v-model="missingFileFilter"
                  :placeholder="$t('i18nChecker.allFiles') || 'Все файлы'"
                  size="small"
                  clearable
                  class="i18n-file-filter"
              >
                <el-option
                    v-for="file in availableFiles"
                    :key="file"
                    :label="file"
                    :value="file"
                />
              </el-select>

              <div class="i18n-spacer" />

              <span class="i18n-search-count">
                {{ filteredMissing.length }} / {{ currentMissing.length }}
              </span>

              <el-dropdown @command="copyMissing" trigger="click">
                <el-button size="small" type="primary" plain>
                  <Icon class-name="clipboard" />
                  {{ $t('i18nChecker.copy') || 'Копировать' }}
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="filtered-keys">
                      {{ $t('i18nChecker.copyFilteredKeys') || 'Отфильтрованные ключи' }}
                    </el-dropdown-item>
                    <el-dropdown-item command="all-keys">
                      {{ $t('i18nChecker.copyAllKeys') || 'Все missing ключи' }}
                    </el-dropdown-item>
                    <el-dropdown-item command="filtered-template" divided>
                      {{ $t('i18nChecker.copyFilteredTemplate') || 'Шаблон для перевода (отфильтр.)' }}
                    </el-dropdown-item>
                    <el-dropdown-item command="all-template">
                      {{ $t('i18nChecker.copyAllTemplate') || 'Шаблон для перевода (все)' }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>

            <!-- Таблица -->
            <div class="i18n-table-wrapper">
              <el-table
                  :data="filteredMissing"
                  stripe
                  size="small"
                  height="350"
                  style="width: 100%;"
              >
                <el-table-column prop="key" :label="$t('i18nChecker.colKey') || 'Ключ'" width="320" fixed>
                  <template #default="{ row }">
                    <code class="i18n-key-code" v-html="highlightText(row.key, missingSearch)"></code>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('i18nChecker.files') || 'Файлы'" min-width="180">
                  <template #default="{ row }">
                    <div class="i18n-files-list">
                      <el-tag
                          v-for="file in (row.files || []).slice(0, 3)"
                          :key="file"
                          size="small"
                          type="info"
                          effect="plain"
                      >
                        {{ file }}
                      </el-tag>
                      <span v-if="(row.files || []).length > 3" class="i18n-more-files">
                        +{{ row.files.length - 3 }}
                      </span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('i18nChecker.colStatus') || 'Статус'" width="80" align="center" fixed="right">
                  <template #default>
                    <el-tag type="danger" size="small" effect="dark">❌</el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-collapse-item>

          <!-- 🔥 UNUSED С ПОИСКОМ -->
          <el-collapse-item
              v-if="currentUnused && currentUnused.length > 0"
              name="unused"
          >
            <template #title>
              <div class="i18n-collapse-header i18n-collapse-header-warning">
                <Icon class-name="warning" />
                <span>{{ $t('i18nChecker.unusedIn') || 'Не используются в' }} {{ activeLang.toUpperCase() }}</span>
                <el-tag type="warning" size="small" effect="dark">
                  {{ currentUnused.length }}
                </el-tag>
              </div>
            </template>

            <!-- 🔥 ПАНЕЛЬ ПОИСКА И КОПИРОВАНИЯ -->
            <div class="i18n-search-panel">
              <el-input
                  v-model="unusedSearch"
                  :placeholder="$t('i18nChecker.searchKey') || 'Поиск по ключу...'"
                  size="small"
                  clearable
                  class="i18n-search-input"
              >
                <template #prefix>
                  <Icon class-name="search" />
                </template>
              </el-input>

              <div class="i18n-spacer" />

              <span class="i18n-search-count">
                {{ filteredUnused.length }} / {{ currentUnused.length }}
              </span>

              <el-dropdown @command="copyUnused" trigger="click">
                <el-button size="small" type="warning" plain>
                  <Icon class-name="clipboard" />
                  {{ $t('i18nChecker.copy') || 'Копировать' }}
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="filtered">
                      {{ $t('i18nChecker.copyFilteredKeys') || 'Отфильтрованные ключи' }}
                    </el-dropdown-item>
                    <el-dropdown-item command="all">
                      {{ $t('i18nChecker.copyAllKeys') || 'Все unused ключи' }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>

            <!-- Список unused -->
            <div class="i18n-unused-wrapper">
              <div class="i18n-unused-list">
                <el-tag
                    v-for="key in filteredUnused.slice(0, 500)"
                    :key="key"
                    class="i18n-unused-tag"
                    size="small"
                    type="info"
                    effect="plain"
                >
                  <span v-html="highlightText(key, unusedSearch)"></span>
                </el-tag>
                <span v-if="filteredUnused.length > 500" class="i18n-more-unused">
                  ... {{ filteredUnused.length - 500 }} ещё
                </span>
              </div>
            </div>
          </el-collapse-item>

        </el-collapse>

        <!-- Если нет проблем -->
        <div
            v-if="(!currentMissing || currentMissing.length === 0) && (!currentUnused || currentUnused.length === 0)"
            class="i18n-no-issues"
        >
          <Icon class-name="check-circle" />
          <p>{{ $t('i18nChecker.noIssues') || 'Нет проблем с переводами!' }}</p>
        </div>
      </div>
    </div>

    <!-- Подсказка если нет данных -->
    <div v-else-if="!loading && !error" class="i18n-scan-empty">
      <Icon class-name="search" />
      <p>{{ $t('i18nChecker.clickToScan') || 'Нажмите "Запустить сканер" для анализа переводов' }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import Icon from '@components/Icon/Icon.vue';

const { t } = useI18n();

const props = defineProps({
  loading: { type: Boolean, default: false },
  report: { type: Object, default: null },
  error: { type: String, default: null }
});

defineEmits(['scan']);

const activeLang = ref(null);
const expandedSections = ref(['missing', 'unused']);

// 🔥 Поиск и фильтры
const missingSearch = ref('');
const missingFileFilter = ref('');
const unusedSearch = ref('');

// При получении отчёта — выбрать первый язык
watch(() => props.report, (newReport) => {
  if (newReport?.summary?.languages) {
    const langs = Object.keys(newReport.summary.languages);
    if (langs.length > 0 && !activeLang.value) {
      activeLang.value = langs[0];
    }
  }
}, { immediate: true });

// Сброс поиска при смене языка
watch(activeLang, () => {
  missingSearch.value = '';
  missingFileFilter.value = '';
  unusedSearch.value = '';
});

// Missing для активного языка
const currentMissing = computed(() => {
  if (!activeLang.value || !props.report?.missing) return [];
  return props.report.missing[activeLang.value] || [];
});

// Unused для активного языка
const currentUnused = computed(() => {
  if (!activeLang.value || !props.report?.unused) return [];
  return props.report.unused[activeLang.value] || [];
});

// 🔥 Уникальные файлы из missing
const availableFiles = computed(() => {
  const files = new Set();
  currentMissing.value.forEach(item => {
    (item.files || []).forEach(f => files.add(f));
  });
  return Array.from(files).sort();
});

// 🔥 Фильтрованные missing
const filteredMissing = computed(() => {
  let result = currentMissing.value;

  if (missingSearch.value.trim()) {
    const query = missingSearch.value.toLowerCase();
    result = result.filter(item =>
        item.key.toLowerCase().includes(query)
    );
  }

  if (missingFileFilter.value) {
    result = result.filter(item =>
        (item.files || []).includes(missingFileFilter.value)
    );
  }

  return result;
});

// 🔥 Фильтрованные unused
const filteredUnused = computed(() => {
  if (!unusedSearch.value.trim()) return currentUnused.value;

  const query = unusedSearch.value.toLowerCase();
  return currentUnused.value.filter(key =>
      key.toLowerCase().includes(query)
  );
});

// 🔥 Подсветка найденного текста
const highlightText = (text, query) => {
  if (!query || !query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  return text.replace(regex, '<mark class="i18n-highlight">$1</mark>');
};

// 🔥 Копирование missing ключей
const copyMissing = (command) => {
  const isFiltered = command.startsWith('filtered');
  const isTemplate = command.endsWith('template');

  const items = isFiltered ? filteredMissing.value : currentMissing.value;

  let text;
  if (isTemplate) {
    text = items.map(item => `"${item.key}": ""`).join('\n');
  } else {
    text = items.map(item => item.key).join('\n');
  }

  copyToClipboard(text, items.length);
};

// 🔥 Копирование unused ключей
const copyUnused = (command) => {
  const isFiltered = command === 'filtered';
  const keys = isFiltered ? filteredUnused.value : currentUnused.value;
  const text = keys.join('\n');

  copyToClipboard(text, keys.length);
};

// 🔥 Общая функция копирования
const copyToClipboard = async (text, count) => {
  try {
    await navigator.clipboard.writeText(text);
    ElMessage.success(
        (t('i18nChecker.copiedCount') || 'Скопировано') + `: ${count}`
    );
  } catch (err) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      ElMessage.success(
          (t('i18nChecker.copiedCount') || 'Скопировано') + `: ${count}`
      );
    } catch (e) {
      ElMessage.error(t('i18nChecker.copyFailed') || 'Не удалось скопировать');
    }
    document.body.removeChild(textarea);
  }
};

const getFlagEmoji = (lang) => {
  const flags = {
    'ru': '🇷🇺',
    'en': '🇬🇧',
    'zh-cn': '🇨🇳',
    'zh': '🇨🇳'
  };
  return flags[lang] || '🌍';
};
</script>

<style lang="scss" scoped>
.i18n-scanner-mode {
  background: #fff;
  border-radius: 6px;
  padding: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.i18n-scan-control {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px;
  border-bottom: 1px solid #ebeef5;

  .i18n-scan-hint {
    color: #909399;
    font-size: 9px;
  }

  .i18n-spacer {
    flex: 1;
  }

  .i18n-total-keys {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 2px 6px;
    background: #f0f9ff;
    border: 1px solid #b3d8ff;
    border-radius: 3px;
    font-size: 9px;
    color: #1890ff;

    .bi { font-size: 9px; }

    span:first-of-type {
      font-weight: 700;
      font-size: 10px;
    }

    .i18n-total-label {
      color: #909399;
      font-size: 8px;
    }
  }
}

.i18n-error-block {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  margin: 4px 0;
  background: #fff1f0;
  border: 1px solid #ffccc7;
  border-radius: 3px;
  color: #cf1322;

  .bi { font-size: 12px; color: #ff4d4f; }

  p { margin: 0; font-size: 9px; }
}

.i18n-scan-results { margin-top: 4px; }

.i18n-scan-empty {
  text-align: center;
  padding: 10px;
  color: #909399;

  .bi {
    font-size: 28px;
    margin-bottom: 4px;
    color: #c0c4cc;
    display: block;
  }

  p { margin: 0; font-size: 10px; }
}

// ============================================================================
// 🔥 ТАБЫ ЯЗЫКОВ
// ============================================================================

.i18n-lang-tabs {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: #f5f7fa;
  border-radius: 4px;
  overflow-x: auto;
  overflow-y: hidden;
  height: 28px;
  min-height: 28px;
  scrollbar-width: thin;
  scrollbar-color: #c0c4cc transparent;

  &::-webkit-scrollbar { height: 3px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: #c0c4cc; border-radius: 2px; }

  .i18n-lang-tab {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0 8px;
    height: 22px;
    min-height: 22px;
    background: #fff;
    border: 1px solid #dcdfe6;
    border-radius: 3px;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
    flex-shrink: 0;
    font-size: 9px;

    &:hover {
      border-color: #b3d8ff;
      background: #ecf5ff;
    }

    &.i18n-lang-tab-active {
      background: #1890ff;
      border-color: #1890ff;
      color: #fff;

      .i18n-lang-coverage {
        color: #fff;
        background: rgba(255, 255, 255, 0.2);
      }

      .i18n-lang-stats {
        .i18n-lang-missing,
        .i18n-lang-unused {
          color: rgba(255, 255, 255, 0.8);
        }
      }
    }

    .i18n-lang-flag { font-size: 10px; }
    .i18n-lang-name { font-weight: 600; font-size: 9px; }

    .i18n-lang-coverage {
      font-weight: 700;
      font-size: 9px;
      color: #52c41a;
      padding: 1px 3px;
      background: #f6ffed;
      border-radius: 2px;

      &.i18n-lang-coverage-bad {
        color: #ff4d4f;
        background: #fff1f0;
      }
    }

    .i18n-lang-stats {
      display: flex;
      gap: 2px;
      font-size: 8px;

      .i18n-lang-missing { color: #ff4d4f; }
      .i18n-lang-unused { color: #faad14; }
    }
  }
}

.i18n-lang-content { margin-top: 4px; }

// ============================================================================
// 🔥 СВОДКА
// ============================================================================

.i18n-lang-summary {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px;
  background: #fafafa;
  border: 1px solid #ebeef5;
  border-radius: 3px;
  margin-bottom: 4px;
  flex-wrap: wrap;

  .i18n-summary-item {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 2px 4px;
    background: #fff;
    border: 1px solid #ebeef5;
    border-radius: 2px;

    .i18n-summary-label { font-size: 8px; color: #909399; }
    .i18n-summary-value { font-size: 9px; font-weight: 700; color: #303133; }

    &.i18n-summary-coverage .i18n-summary-value { color: #1890ff; }
    &.i18n-summary-used .i18n-summary-value { color: #52c41a; }
    &.i18n-summary-missing .i18n-summary-value { color: #ff4d4f; }
    &.i18n-summary-unused .i18n-summary-value { color: #faad14; }
  }

  .i18n-summary-progress {
    flex: 1;
    min-width: 60px;
    height: 4px;
    background: #f0f0f0;
    border-radius: 2px;
    overflow: hidden;

    .i18n-summary-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #52c41a, #73d13d);
      border-radius: 2px;
      transition: width 0.5s ease;
    }
  }
}

// ============================================================================
// 🔥 СВОРАЧИВАЕМЫЕ СЕКЦИИ
// ============================================================================

.i18n-collapse {
  border: none;

  :deep(.el-collapse-item__header) {
    background: transparent;
    border-bottom: none;
    height: auto;
    padding: 0;
    line-height: normal;
  }

  :deep(.el-collapse-item__wrap) { border-bottom: none; }
  :deep(.el-collapse-item__content) { padding: 0; }
  :deep(.el-collapse-item__arrow) { margin-right: 4px; }
}

.i18n-collapse-header {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px;
  border-radius: 3px;
  font-size: 9px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  width: 100%;

  .bi { font-size: 10px; }

  &.i18n-collapse-header-danger {
    background: #fff1f0;
    color: #cf1322;
    border-left: 2px solid #ff4d4f;

    &:hover { background: #ffeded; }
  }

  &.i18n-collapse-header-warning {
    background: #fffbe6;
    color: #ad6800;
    border-left: 2px solid #faad14;

    &:hover { background: #fff8d4; }
  }
}

// ============================================================================
// 🔥 ПАНЕЛЬ ПОИСКА И КОПИРОВАНИЯ
// ============================================================================

.i18n-search-panel {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  background: #fafafa;
  border: 1px solid #ebeef5;
  border-radius: 3px;
  margin: 4px 0;

  .i18n-search-input {
    width: 200px;
  }

  .i18n-file-filter {
    width: 220px;
  }

  .i18n-spacer {
    flex: 1;
  }

  .i18n-search-count {
    font-size: 9px;
    color: #909399;
    padding: 0 4px;
    white-space: nowrap;
  }
}

:deep(.i18n-highlight) {
  background: #fff3b0;
  color: #d4380d;
  padding: 0 2px;
  border-radius: 2px;
  font-weight: 600;
}

// ============================================================================
// 🔥 ТАБЛИЦА
// ============================================================================

.i18n-table-wrapper {
  background: #fff;
  border-radius: 3px;
  overflow: hidden;
  border: 1px solid #ebeef5;
  margin-top: 4px;

  :deep(.el-table) {
    .el-table__header th {
      background: #fafafa !important;
      font-weight: 600;
      font-size: 9px;
      padding: 4px 0;
    }

    .el-table__row td {
      padding: 4px 0;
      font-size: 9px;
    }
  }
}

.i18n-key-code {
  background: #f5f7fa;
  padding: 2px 4px;
  border-radius: 2px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 8px;
  color: #d4380d;
  word-break: break-all;
}

.i18n-files-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;

  .i18n-more-files {
    color: #909399;
    font-size: 8px;
  }
}

// ============================================================================
// 🔥 UNUSED
// ============================================================================

.i18n-unused-wrapper {
  background: #fff;
  border-radius: 3px;
  padding: 4px;
  border: 1px solid #ebeef5;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 4px;
}

.i18n-unused-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;

  .i18n-unused-tag {
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 8px;
  }

  .i18n-more-unused {
    color: #909399;
    font-size: 8px;
    align-self: center;
  }
}

.i18n-no-issues {
  text-align: center;
  padding: 10px;
  color: #52c41a;

  .bi {
    font-size: 20px;
    display: block;
    margin-bottom: 4px;
  }

  p { margin: 0; font-size: 10px; }
}
</style>
