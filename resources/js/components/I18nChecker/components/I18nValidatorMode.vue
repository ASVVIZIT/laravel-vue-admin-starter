<template>
  <div class="i18n-validator-mode">
    <div class="i18n-validate-control">
      <el-button type="warning" size="small" :loading="loading" @click="$emit('validate')">
        <I18nIcon name="warning" />
        {{ loading ? ($t('i18nChecker.validating') || 'Проверка...') : ($t('i18nChecker.startValidation') || 'Проверить пути') }}
      </el-button>
      <span class="i18n-validate-hint">{{ $t('i18nChecker.validateHint') || 'Найдёт ключи с неправильной вложенностью' }}</span>
    </div>

    <div v-if="error && !report" class="i18n-error-block">
      <I18nIcon name="missing" />
      <p>{{ error }}</p>
    </div>

    <div v-if="report" class="i18n-validate-results">
      <I18nStatsGrid :stats="validatorStats" />

      <el-collapse v-model="expandedSections" class="i18n-collapse">
        <!-- 🔥 ДУБЛИКАТЫ -->
        <el-collapse-item v-if="report.duplicates && report.duplicates.length > 0" name="duplicates">
          <template #title>
            <div class="i18n-collapse-header i18n-collapse-header-danger">
              <I18nIcon name="warning" />
              <span>{{ $t('i18nChecker.duplicatesFound') || 'Найдены дубликаты' }}</span>
              <el-tag type="danger" size="small" effect="dark">{{ filteredDuplicates.length }}</el-tag>
            </div>
          </template>

          <div class="i18n-search-panel">
            <el-input
                v-model="duplicatesSearch"
                :placeholder="$t('i18nChecker.searchKey') || 'Поиск по ключу...'"
                size="small"
                clearable
                class="i18n-search-input"
            >
              <template #prefix><I18nIcon name="search" /></template>
            </el-input>

            <el-tooltip :content="$t('i18nChecker.searchInPaths') || 'Искать также в путях'" placement="top">
              <el-checkbox
                  v-model="searchInPathsDuplicates"
                  size="small"
                  class="i18n-search-toggle"
                  :label="$t('i18nChecker.paths') || 'Пути'"
              />
            </el-tooltip>

            <div class="i18n-spacer" />
            <span class="i18n-search-count">{{ filteredDuplicates.length }} / {{ report.duplicates.length }}</span>
          </div>

          <div class="i18n-table-wrapper">
            <el-table
                :data="filteredDuplicates"
                stripe
                size="small"
                :height="tableHeight"
                :style="{ width: '100%', fontSize: fontSize + 'px' }"
                :class="{ 'i18n-compact-mode': compactMode }"
            >
              <el-table-column prop="key" :label="$t('i18nChecker.colKey') || 'Ключ'" width="200">
                <template #default="{ row }">
                  <code class="i18n-key-code" v-html="highlightSearch ? highlightText(row.key, duplicatesSearch, highlightColor) : row.key"></code>
                </template>
              </el-table-column>

              <el-table-column :label="$t('i18nChecker.paths') || 'Пути'" min-width="400">
                <template #default="{ row }">
                  <div class="i18n-paths-list">
                    <el-tag v-for="path in row.paths" :key="path" size="small" type="info" effect="plain">
                      <span v-html="highlightSearch && searchInPathsDuplicates ? highlightText(path, duplicatesSearch, highlightColor) : path"></span>
                    </el-tag>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-collapse-item>

        <!-- 🔥 НЕПРАВИЛЬНЫЕ ПУТИ -->
        <el-collapse-item v-if="report.wrongPaths && report.wrongPaths.length > 0" name="wrongPaths">
          <template #title>
            <div class="i18n-collapse-header i18n-collapse-header-danger">
              <I18nIcon name="missing" />
              <span>{{ $t('i18nChecker.wrongPathsFound') || 'Неправильные пути' }}</span>
              <el-tag type="danger" size="small" effect="dark">{{ filteredWrongPaths.length }}</el-tag>
            </div>
          </template>

          <div class="i18n-search-panel">
            <el-input
                v-model="wrongPathsSearch"
                :placeholder="$t('i18nChecker.searchKey') || 'Поиск по ключу...'"
                size="small"
                clearable
                class="i18n-search-input"
            >
              <template #prefix><I18nIcon name="search" /></template>
            </el-input>

            <el-tooltip :content="$t('i18nChecker.searchInPaths') || 'Искать также в путях'" placement="top">
              <el-checkbox
                  v-model="searchInPathsWrongPaths"
                  size="small"
                  class="i18n-search-toggle"
                  :label="$t('i18nChecker.paths') || 'Пути'"
              />
            </el-tooltip>

            <div class="i18n-spacer" />
            <span class="i18n-search-count">{{ filteredWrongPaths.length }} / {{ report.wrongPaths.length }}</span>
          </div>

          <div class="i18n-table-wrapper">
            <el-table
                :data="filteredWrongPaths"
                stripe
                size="small"
                :height="tableHeight"
                :style="{ width: '100%', fontSize: fontSize + 'px' }"
                :class="{ 'i18n-compact-mode': compactMode }"
            >
              <el-table-column prop="wrongPath" :label="$t('i18nChecker.wrongPath') || 'Неправильный путь'" width="280">
                <template #default="{ row }">
                  <code class="i18n-key-code i18n-key-code-error" v-html="highlightSearch ? highlightText(row.wrongPath, wrongPathsSearch, highlightColor) : row.wrongPath"></code>
                </template>
              </el-table-column>
              <el-table-column prop="correctPath" :label="$t('i18nChecker.correctPath') || 'Правильный путь'" width="280">
                <template #default="{ row }">
                  <code class="i18n-key-code i18n-key-code-success" v-html="highlightSearch ? highlightText(row.correctPath, wrongPathsSearch, highlightColor) : row.correctPath"></code>
                </template>
              </el-table-column>
              <el-table-column prop="usedIn" :label="$t('i18nChecker.usedIn') || 'Используется в'" min-width="200">
                <template #default="{ row }">
                  <div class="i18n-files-list">
                    <el-tag v-for="file in (row.usedIn || []).slice(0, 2)" :key="file" size="small" type="info" effect="plain">
                      <span v-html="highlightSearch && searchInPathsWrongPaths ? highlightText(file, wrongPathsSearch, highlightColor) : file"></span>
                    </el-tag>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-collapse-item>

        <!-- 🔥 ПЛОСКИЕ КЛЮЧИ (без переключателя - нет массивов) -->
        <el-collapse-item v-if="report.flatKeys && report.flatKeys.length > 0" name="flatKeys">
          <template #title>
            <div class="i18n-collapse-header i18n-collapse-header-warning">
              <I18nIcon name="info" />
              <span>{{ $t('i18nChecker.flatKeysFound') || 'Плоские ключи' }}</span>
              <el-tag type="warning" size="small" effect="dark">{{ filteredFlatKeys.length }}</el-tag>
            </div>
          </template>

          <div class="i18n-search-panel">
            <el-input
                v-model="flatKeysSearch"
                :placeholder="$t('i18nChecker.searchKey') || 'Поиск по ключу...'"
                size="small"
                clearable
                class="i18n-search-input"
            >
              <template #prefix><I18nIcon name="search" /></template>
            </el-input>
            <div class="i18n-spacer" />
            <span class="i18n-search-count">{{ filteredFlatKeys.length }} / {{ report.flatKeys.length }}</span>
          </div>

          <div class="i18n-unused-wrapper">
            <div class="i18n-unused-list">
              <el-tag v-for="key in filteredFlatKeys.slice(0, maxFlatKeys)" :key="key" class="i18n-unused-tag" size="small" type="warning" effect="plain">
                <span v-html="highlightSearch ? highlightText(key, flatKeysSearch, highlightColor) : key"></span>
              </el-tag>
              <span v-if="filteredFlatKeys.length > maxFlatKeys" class="i18n-more-unused">... {{ filteredFlatKeys.length - maxFlatKeys }} ещё</span>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>

      <div v-if="(!report.duplicates || report.duplicates.length === 0) && (!report.wrongPaths || report.wrongPaths.length === 0) && (!report.flatKeys || report.flatKeys.length === 0)" class="i18n-no-issues">
        <I18nIcon name="success" />
        <p>{{ $t('i18nChecker.noPathIssues') || 'Нет проблем с путями!' }}</p>
      </div>
    </div>

    <div v-else-if="!loading && !error" class="i18n-validate-empty">
      <I18nIcon name="warning" />
      <p>{{ $t('i18nChecker.clickToValidate') || 'Нажмите "Проверить пути" для анализа структуры' }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import I18nIcon from '@components/I18nChecker/components/shared/I18nIcon.vue';
import I18nStatsGrid from '@components/I18nChecker/components/shared/I18nStatsGrid.vue';
import { VALIDATOR_STATS_CONFIG } from '@components/I18nChecker/config/validatorStatsConfig.js';
import { VALIDATOR_SECTIONS } from '@components/I18nChecker/config/sectionsConfig.js';
import { useI18nSettings } from '@components/I18nChecker/composables/useI18nSettings.js';
import { highlightText } from '@components/I18nChecker/utils/highlightUtils.js';

const { t } = useI18n();

const { tableHeight, fontSize, compactMode, maxFlatKeys, highlightSearch, highlightColor } = useI18nSettings();

const props = defineProps({
  loading: { type: Boolean, default: false },
  report: { type: Object, default: null },
  error: { type: String, default: null }
});

defineEmits(['validate']);

const expandedSections = ref([...VALIDATOR_SECTIONS]);

// 🔥 ОТДЕЛЬНЫЕ переменные для каждой секции
const duplicatesSearch = ref('');
const searchInPathsDuplicates = ref(false);

const wrongPathsSearch = ref('');
const searchInPathsWrongPaths = ref(false);

const flatKeysSearch = ref('');

// 🔥 Фильтрация с учётом поиска по путям
const filteredDuplicates = computed(() => {
  if (!props.report?.duplicates) return [];
  if (!duplicatesSearch.value.trim()) return props.report.duplicates;

  const query = duplicatesSearch.value.toLowerCase();

  if (searchInPathsDuplicates.value) {
    return props.report.duplicates.filter(item =>
        item.key.toLowerCase().includes(query) ||
        item.paths.some(path => path.toLowerCase().includes(query))
    );
  } else {
    return props.report.duplicates.filter(item =>
        item.key.toLowerCase().includes(query)
    );
  }
});

const filteredWrongPaths = computed(() => {
  if (!props.report?.wrongPaths) return [];
  if (!wrongPathsSearch.value.trim()) return props.report.wrongPaths;

  const query = wrongPathsSearch.value.toLowerCase();

  if (searchInPathsWrongPaths.value) {
    return props.report.wrongPaths.filter(item =>
        item.wrongPath.toLowerCase().includes(query) ||
        item.correctPath.toLowerCase().includes(query) ||
        (item.usedIn || []).some(file => file.toLowerCase().includes(query))
    );
  } else {
    return props.report.wrongPaths.filter(item =>
        item.wrongPath.toLowerCase().includes(query) ||
        item.correctPath.toLowerCase().includes(query)
    );
  }
});

const filteredFlatKeys = computed(() => {
  if (!props.report?.flatKeys) return [];
  if (!flatKeysSearch.value.trim()) return props.report.flatKeys;
  const query = flatKeysSearch.value.toLowerCase();
  return props.report.flatKeys.filter(key => key.toLowerCase().includes(query));
});

const validatorStats = computed(() => {
  if (!props.report?.summary) return [];
  const summary = props.report.summary;
  return VALIDATOR_STATS_CONFIG.map(cfg => ({
    icon: cfg.icon,
    label: t(cfg.labelKey),
    value: summary[cfg.key] || 0,
    class: cfg.class
  }));
});
</script>

<style lang="scss" scoped>
.i18n-validator-mode { background: #fff; border-radius: 6px; padding: 4px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06); }
.i18n-validate-control { display: flex; align-items: center; gap: 4px; padding: 4px; border-bottom: 1px solid #ebeef5; .i18n-validate-hint { color: #909399; font-size: 11px; } }
.i18n-error-block { display: flex; align-items: center; gap: 4px; padding: 4px; margin: 4px 0; background: #fff1f0; border: 1px solid #ffccc7; border-radius: 3px; color: #cf1322; .bi { font-size: 12px; color: #ff4d4f; } p { margin: 0; font-size: 9px; } }
.i18n-validate-results { margin-top: 4px; }
.i18n-validate-empty { text-align: center; padding: 10px; color: #909399; .bi { font-size: 28px; margin-bottom: 4px; color: #c0c4cc; display: block; } p { margin: 0; font-size: 10px; } }

.i18n-collapse { border: none; :deep(.el-collapse-item__header) { background: transparent; border-bottom: none; height: auto; padding: 0; line-height: normal; } :deep(.el-collapse-item__wrap) { border-bottom: none; } :deep(.el-collapse-item__content) { padding: 0; } :deep(.el-collapse-item__arrow) { margin-right: 4px; } }
.i18n-collapse-header { display: flex; align-items: center; gap: 4px; padding: 4px 6px; border-radius: 3px; font-size: 9px; font-weight: 600; cursor: pointer; transition: background 0.2s; width: 100%; .bi { font-size: 10px; } &.i18n-collapse-header-danger { background: #fff1f0; color: #cf1322; border-left: 2px solid #ff4d4f; &:hover { background: #ffeded; } } &.i18n-collapse-header-warning { background: #fffbe6; color: #ad6800; border-left: 2px solid #faad14; &:hover { background: #fff8d4; } } }

.i18n-search-panel { display: flex; align-items: center; gap: 4px; padding: 4px; background: #fafafa; border: 1px solid #ebeef5; border-radius: 3px; margin: 4px 0; .i18n-search-input { width: 200px; } .i18n-spacer { flex: 1; } .i18n-search-count { font-size: 9px; color: #909399; padding: 0 4px; white-space: nowrap; } }

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
.i18n-key-code { background: #f5f7fa; padding: 2px 4px; border-radius: 2px; font-family: 'Consolas', 'Monaco', monospace; font-size: 8px; color: #d4380d; word-break: break-all; &.i18n-key-code-error { background: #fff1f0; color: #cf1322; text-decoration: line-through; } &.i18n-key-code-success { background: #f6ffed; color: #52c41a; } }
.i18n-paths-list { display: flex; flex-wrap: wrap; gap: 4px; }
.i18n-files-list { display: flex; flex-wrap: wrap; gap: 4px; }
.i18n-unused-wrapper { background: #fff; border-radius: 3px; padding: 4px; border: 1px solid #ebeef5; max-height: 250px; overflow-y: auto; margin-top: 4px; }
.i18n-unused-list { display: flex; flex-wrap: wrap; gap: 4px; .i18n-unused-tag { font-family: 'Consolas', 'Monaco', monospace; font-size: 8px; } .i18n-more-unused { color: #909399; font-size: 10px; align-self: center; } }
.i18n-no-issues { text-align: center; padding: 10px; color: #52c41a; .bi { font-size: 20px; display: block; margin-bottom: 4px; } p { margin: 0; font-size: 10px; } }

.i18n-compact-mode { :deep(.el-table__row td) { padding: 2px 0 !important; } :deep(.el-table__header th) { padding: 2px 0 !important; } .i18n-search-panel { padding: 2px; margin: 2px 0; } .i18n-collapse-header { padding: 2px 6px; } }
</style>
