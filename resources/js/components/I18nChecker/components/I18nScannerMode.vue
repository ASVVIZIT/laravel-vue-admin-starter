<template>
  <div class="i18n-scanner-mode">
    <div class="i18n-scan-control">
      <el-button type="primary" size="small" :loading="loading" @click="$emit('scan')">
        <I18nIcon name="search" />
        {{ loading ? ($t('i18nChecker.scanning') || 'Сканирование...') : ($t('i18nChecker.startScan') || 'Запустить сканер') }}
      </el-button>
      <span class="i18n-scan-hint">{{ $t('i18nChecker.scanHint') || 'Сканер найдёт все ключи в коде и сравнит с переводами' }}</span>
      <div class="i18n-spacer" />
      <div class="i18n-total-keys">
        <I18nIcon name="key" />
        <span>{{ report?.summary?.totalUsedKeys || 0 }}</span>
        <span class="i18n-total-label">{{ $t('i18nChecker.keysInCode') || 'ключей в коде' }}</span>
      </div>
    </div>

    <div v-if="error && !report" class="i18n-error-block">
      <I18nIcon name="missing" />
      <p>{{ error }}</p>
    </div>

    <div v-if="report" class="i18n-scan-results">
      <I18nLangTabs :languages="report.summary?.languages || {}" v-model="activeLang" />

      <div v-if="activeLang" class="i18n-lang-content">
        <I18nStatsGrid :stats="scannerStats" />

        <el-collapse v-model="expandedSections" class="i18n-collapse">
          <!-- 🔥 MISSING -->
          <el-collapse-item v-if="currentMissing && currentMissing.length > 0" name="missing">
            <template #title>
              <div class="i18n-collapse-header i18n-collapse-header-danger">
                <I18nIcon name="missing" />
                <span>{{ $t('i18nChecker.missingIn') || 'Отсутствуют в' }} {{ activeLang.toUpperCase() }}</span>
                <el-tag type="danger" size="small" effect="dark">{{ filteredMissing.length }}</el-tag>
              </div>
            </template>

            <div class="i18n-search-panel">
              <el-input
                  v-model="missingSearch"
                  :placeholder="$t('i18nChecker.searchKey') || 'Поиск по ключу...'"
                  size="small"
                  clearable
                  class="i18n-search-input"
              >
                <template #prefix><I18nIcon name="search" /></template>
              </el-input>

              <el-tooltip :content="$t('i18nChecker.searchInFiles') || 'Искать также в файлах'" placement="top">
                <el-checkbox
                    v-model="searchInFilesMissing"
                    size="small"
                    class="i18n-search-toggle"
                    :label="$t('i18nChecker.files') || 'Файлы'"
                />
              </el-tooltip>

              <el-select v-model="missingFileFilter" :placeholder="$t('i18nChecker.allFiles') || 'Все файлы'" size="small" clearable class="i18n-file-filter">
                <el-option v-for="file in availableFiles" :key="file" :label="file" :value="file" />
              </el-select>

              <div class="i18n-spacer" />
              <span class="i18n-search-count">{{ filteredMissing.length }} / {{ currentMissing.length }}</span>

              <el-dropdown @command="copyMissing" trigger="click">
                <el-button size="small" type="primary" plain>
                  <I18nIcon name="copy" />
                  {{ $t('i18nChecker.copy') || 'Копировать' }}
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item :command="COPY_COMMANDS.FILTERED_KEYS">{{ $t('i18nChecker.copyFilteredKeys') || 'Отфильтрованные ключи' }}</el-dropdown-item>
                    <el-dropdown-item :command="COPY_COMMANDS.ALL_KEYS">{{ $t('i18nChecker.copyAllKeys') || 'Все missing ключи' }}</el-dropdown-item>
                    <el-dropdown-item :command="COPY_COMMANDS.FILTERED_TEMPLATE" divided>{{ $t('i18nChecker.copyFilteredTemplate') || 'Шаблон для перевода (отфильтр.)' }}</el-dropdown-item>
                    <el-dropdown-item :command="COPY_COMMANDS.ALL_TEMPLATE">{{ $t('i18nChecker.copyAllTemplate') || 'Шаблон для перевода (все)' }}</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>

            <div class="i18n-table-wrapper">
              <el-table
                  :data="filteredMissing"
                  stripe
                  size="small"
                  :height="tableHeight"
                  :style="{ width: '100%', fontSize: fontSize + 'px' }"
                  :class="{ 'i18n-compact-mode': compactMode }"
              >
                <el-table-column prop="key" :label="$t('i18nChecker.colKey') || 'Ключ'" width="320" fixed>
                  <template #default="{ row }">
                    <code class="i18n-key-code" v-html="highlightSearch ? highlightText(row.key, missingSearch, highlightColor) : row.key"></code>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('i18nChecker.files') || 'Файлы'" min-width="180">
                  <template #default="{ row }">
                    <div class="i18n-files-list">
                      <el-tag v-for="file in getFilesSlice(row.files, maxFilesPerRow)" :key="file" size="small" type="info" effect="plain">
                        <span v-html="highlightSearch && searchInFilesMissing ? highlightText(file, missingSearch, highlightColor) : file"></span>
                      </el-tag>
                      <span v-if="getRemainingCount(row.files, maxFilesPerRow) > 0" class="i18n-more-files">+{{ getRemainingCount(row.files, maxFilesPerRow) }}</span>
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

          <!-- 🔥 UNUSED (без переключателя - нет файлов) -->
          <el-collapse-item v-if="currentUnused && currentUnused.length > 0" name="unused">
            <template #title>
              <div class="i18n-collapse-header i18n-collapse-header-warning">
                <I18nIcon name="warning" />
                <span>{{ $t('i18nChecker.unusedIn') || 'Не используются в' }} {{ activeLang.toUpperCase() }}</span>
                <el-tag type="warning" size="small" effect="dark">{{ filteredUnused.length }}</el-tag>
              </div>
            </template>

            <div class="i18n-search-panel">
              <el-input
                  v-model="unusedSearch"
                  :placeholder="$t('i18nChecker.searchKey') || 'Поиск по ключу...'"
                  size="small"
                  clearable
                  class="i18n-search-input"
              >
                <template #prefix><I18nIcon name="search" /></template>
              </el-input>

              <div class="i18n-spacer" />
              <span class="i18n-search-count">{{ filteredUnused.length }} / {{ currentUnused.length }}</span>

              <el-dropdown @command="copyUnused" trigger="click">
                <el-button size="small" type="warning" plain>
                  <I18nIcon name="copy" />
                  {{ $t('i18nChecker.copy') || 'Копировать' }}
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item :command="COPY_COMMANDS.FILTERED">{{ $t('i18nChecker.copyFilteredKeys') || 'Отфильтрованные ключи' }}</el-dropdown-item>
                    <el-dropdown-item :command="COPY_COMMANDS.ALL">{{ $t('i18nChecker.copyAllKeys') || 'Все unused ключи' }}</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>

            <div class="i18n-unused-wrapper">
              <div class="i18n-unused-list">
                <el-tag v-for="key in filteredUnused.slice(0, maxUnusedKeys)" :key="key" class="i18n-unused-tag" size="small" type="info" effect="plain">
                  <span v-html="highlightSearch ? highlightText(key, unusedSearch, highlightColor) : key"></span>
                </el-tag>
                <span v-if="filteredUnused.length > maxUnusedKeys" class="i18n-more-unused">... {{ filteredUnused.length - maxUnusedKeys }} ещё</span>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>

        <div v-if="(!currentMissing || currentMissing.length === 0) && (!currentUnused || currentUnused.length === 0)" class="i18n-no-issues">
          <I18nIcon name="success" />
          <p>{{ $t('i18nChecker.noIssues') || 'Нет проблем с переводами!' }}</p>
        </div>
      </div>
    </div>

    <div v-else-if="!loading && !error" class="i18n-scan-empty">
      <I18nIcon name="i18n.scannerMode" />
      <p>{{ $t('i18nChecker.clickToScan') || 'Нажмите "Запустить сканер" для анализа переводов' }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import I18nIcon from '@components/I18nChecker/components/shared/I18nIcon.vue';
import I18nLangTabs from '@components/I18nChecker/components/shared/I18nLangTabs.vue';
import I18nStatsGrid from '@components/I18nChecker/components/shared/I18nStatsGrid.vue';
import { SCANNER_STATS_CONFIG } from '@components/I18nChecker/config/scannerStatsConfig.js';
import { SCANNER_SECTIONS } from '@components/I18nChecker/config/sectionsConfig.js';
import { getFilesSlice, getRemainingCount } from '@components/I18nChecker/config/displayLimitsConfig.js';
import { COPY_COMMANDS, isFilteredCommand, isTemplateCommand, isExactCommand } from '@components/I18nChecker/config/copyCommandsConfig.js';
import { highlightText } from '@components/I18nChecker/utils/highlightUtils.js';
import { copyToClipboard } from '@components/I18nChecker/utils/clipboardUtils.js';
import { useI18nSettings } from '@components/I18nChecker/composables/useI18nSettings.js';

const { t } = useI18n();

const { tableHeight, fontSize, compactMode, maxFilesPerRow, maxUnusedKeys, highlightSearch, highlightColor } = useI18nSettings();

const props = defineProps({
  loading: { type: Boolean, default: false },
  report: { type: Object, default: null },
  error: { type: String, default: null }
});

defineEmits(['scan']);

const activeLang = ref(null);
const expandedSections = ref([...SCANNER_SECTIONS]);
const missingSearch = ref('');
const searchInFilesMissing = ref(false); // 🔥 НОВОЕ
const missingFileFilter = ref('');
const unusedSearch = ref('');

watch(() => props.report, (newReport) => {
  if (newReport?.summary?.languages) {
    const langs = Object.keys(newReport.summary.languages);
    if (langs.length > 0 && !activeLang.value) activeLang.value = langs[0];
  }
}, { immediate: true });

// 🔥 Сброс при смене языка
watch(activeLang, () => {
  missingSearch.value = '';
  searchInFilesMissing.value = false; // 🔥 Сброс
  missingFileFilter.value = '';
  unusedSearch.value = '';
});

const currentMissing = computed(() => {
  if (!activeLang.value || !props.report?.missing) return [];
  return props.report.missing[activeLang.value] || [];
});

const currentUnused = computed(() => {
  if (!activeLang.value || !props.report?.unused) return [];
  return props.report.unused[activeLang.value] || [];
});

const availableFiles = computed(() => {
  const files = new Set();
  currentMissing.value.forEach(item => (item.files || []).forEach(f => files.add(f)));
  return Array.from(files).sort();
});

// 🔥 Фильтрация с учётом поиска по файлам
const filteredMissing = computed(() => {
  let result = currentMissing.value;

  if (missingSearch.value.trim()) {
    const query = missingSearch.value.toLowerCase();

    if (searchInFilesMissing.value) {
      result = result.filter(item =>
          item.key.toLowerCase().includes(query) ||
          (item.files || []).some(file => file.toLowerCase().includes(query))
      );
    } else {
      result = result.filter(item => item.key.toLowerCase().includes(query));
    }
  }

  if (missingFileFilter.value) {
    result = result.filter(item => (item.files || []).includes(missingFileFilter.value));
  }

  return result;
});

const filteredUnused = computed(() => {
  if (!unusedSearch.value.trim()) return currentUnused.value;
  const query = unusedSearch.value.toLowerCase();
  return currentUnused.value.filter(key => key.toLowerCase().includes(query));
});

const copyMissing = async (command) => {
  const filtered = isFilteredCommand(command);
  const template = isTemplateCommand(command);
  const items = filtered ? filteredMissing.value : currentMissing.value;
  const text = template ? items.map(item => `"${item.key}": ""`).join('\n') : items.map(item => item.key).join('\n');
  const success = await copyToClipboard(text);
  ElMessage.success(success ? `${t('i18nChecker.copiedCount') || 'Скопировано'}: ${items.length}` : t('i18nChecker.copyFailed') || 'Не удалось скопировать');
};

const copyUnused = async (command) => {
  const filtered = isExactCommand(command, COPY_COMMANDS.FILTERED);
  const keys = filtered ? filteredUnused.value : currentUnused.value;
  const text = keys.join('\n');
  const success = await copyToClipboard(text);
  ElMessage.success(success ? `${t('i18nChecker.copiedCount') || 'Скопировано'}: ${keys.length}` : t('i18nChecker.copyFailed') || 'Не удалось скопировать');
};

const scannerStats = computed(() => {
  if (!activeLang.value || !props.report?.summary?.languages?.[activeLang.value]) return [];
  const langData = props.report.summary.languages[activeLang.value];
  return SCANNER_STATS_CONFIG.map(cfg => ({
    icon: cfg.icon,
    label: t(cfg.labelKey),
    value: langData[cfg.key] || 0,
    class: cfg.class
  }));
});
</script>

<style lang="scss" scoped>
.i18n-scanner-mode { background: #fff; border-radius: 6px; padding: 4px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06); }
.i18n-scan-control { display: flex; align-items: center; gap: 4px; padding: 4px 6px; border-bottom: 1px solid #ebeef5; .i18n-scan-hint { color: #909399; font-size: 9px; } .i18n-spacer { flex: 1; } .i18n-total-keys { display: flex; align-items: center; gap: 4px; padding: 2px 6px; background: #f0f9ff; border: 1px solid #b3d8ff; border-radius: 3px; font-size: 9px; color: #1890ff; .bi { font-size: 9px; } span:first-of-type { font-weight: 700; font-size: 10px; } .i18n-total-label { color: #909399; font-size: 8px; } } }
.i18n-error-block { display: flex; align-items: center; gap: 4px; padding: 4px; margin: 4px 0; background: #fff1f0; border: 1px solid #ffccc7; border-radius: 3px; color: #cf1322; .bi { font-size: 12px; color: #ff4d4f; } p { margin: 0; font-size: 9px; } }
.i18n-scan-results { margin-top: 4px; }
.i18n-scan-empty { text-align: center; padding: 10px; color: #909399; .bi { font-size: 28px; margin-bottom: 4px; color: #c0c4cc; display: block; } p { margin: 0; font-size: 10px; } }
.i18n-lang-content { margin-top: 4px; }

.i18n-collapse { border: none; :deep(.el-collapse-item__header) { background: transparent; border-bottom: none; height: auto; padding: 0; line-height: normal; } :deep(.el-collapse-item__wrap) { border-bottom: none; } :deep(.el-collapse-item__content) { padding: 0; } :deep(.el-collapse-item__arrow) { margin-right: 4px; } }
.i18n-collapse-header { display: flex; align-items: center; gap: 4px; padding: 4px 6px; border-radius: 3px; font-size: 9px; font-weight: 600; cursor: pointer; transition: background 0.2s; width: 100%; .bi { font-size: 10px; } &.i18n-collapse-header-danger { background: #fff1f0; color: #cf1322; border-left: 2px solid #ff4d4f; &:hover { background: #ffeded; } } &.i18n-collapse-header-warning { background: #fffbe6; color: #ad6800; border-left: 2px solid #faad14; &:hover { background: #fff8d4; } } }

.i18n-search-panel { display: flex; align-items: center; gap: 4px; padding: 4px; background: #fafafa; border: 1px solid #ebeef5; border-radius: 3px; margin: 4px 0; .i18n-search-input { width: 200px; } .i18n-file-filter { width: 220px; } .i18n-spacer { flex: 1; } .i18n-search-count { font-size: 9px; color: #909399; padding: 0 4px; white-space: nowrap; } }

/* 🔥 Стили для переключателя */
.i18n-search-toggle {
  margin-left: 4px;
  :deep(.el-checkbox__label) {
    font-size: 10px;
    color: #606266;
  }
}

:deep(.i18n-highlight) { font-weight: 600; }

.i18n-table-wrapper { background: #fff; border-radius: 3px; overflow: hidden; border: 1px solid #ebeef5; margin-top: 4px; :deep(.el-table) { .el-table__header th { background: #fafafa !important; font-weight: 600; font-size: 9px; padding: 4px 0; } .el-table__row td { padding: 4px 0; font-size: 9px; } } }
.i18n-key-code { background: #f5f7fa; padding: 2px 4px; border-radius: 2px; font-family: 'Consolas', 'Monaco', monospace; font-size: 8px; color: #d4380d; word-break: break-all; }
.i18n-files-list { display: flex; flex-wrap: wrap; gap: 4px; .i18n-more-files { color: #909399; font-size: 8px; } }
.i18n-unused-wrapper { background: #fff; border-radius: 3px; padding: 4px; border: 1px solid #ebeef5; max-height: 200px; overflow-y: auto; margin-top: 4px; }
.i18n-unused-list { display: flex; flex-wrap: wrap; gap: 4px; .i18n-unused-tag { font-family: 'Consolas', 'Monaco', monospace; font-size: 8px; } .i18n-more-unused { color: #909399; font-size: 8px; align-self: center; } }
.i18n-no-issues { text-align: center; padding: 10px; color: #52c41a; .bi { font-size: 20px; display: block; margin-bottom: 4px; } p { margin: 0; font-size: 10px; } }

.i18n-compact-mode { :deep(.el-table__row td) { padding: 2px 0 !important; } :deep(.el-table__header th) { padding: 2px 0 !important; } .i18n-search-panel { padding: 2px; margin: 2px 0; } .i18n-collapse-header { padding: 2px 6px; } }
</style>
