<template>
  <div class="i18n-checker-simple">
    <div class="i18n-control-bar">
      <el-radio-group v-model="selectedLang" size="small" @change="runCheck">
        <el-radio-button v-for="lang in LANGUAGE_OPTIONS" :key="lang.value" :label="lang.value">{{ lang.label }}</el-radio-button>
      </el-radio-group>

      <el-select v-model="selectedCategory" size="small" style="width: 160px;">
        <el-option :label="$t('i18nChecker.allCategories')" value="all" />
        <el-option v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
      </el-select>

      <el-select v-model="selectedStatus" size="small" style="width: 140px;">
        <el-option v-for="opt in STATUS_OPTIONS" :key="opt.value" :label="$t(opt.labelKey)" :value="opt.value" />
      </el-select>

      <el-input v-model="searchQuery" :placeholder="$t('i18nChecker.search')" size="small" clearable style="width: 180px;">
        <template #prefix><I18nIcon name="search" /></template>
      </el-input>

      <div class="i18n-spacer" />

      <el-button size="small" @click="runCheck">
        <I18nIcon name="refresh" />
        {{ $t('i18nChecker.refresh') }}
      </el-button>
      <el-button size="small" @click="exportMissing">
        <I18nIcon name="export" />
        {{ $t('i18nChecker.exportMissing') }}
      </el-button>
    </div>

    <div class="i18n-stats-row">
      <div class="i18n-stat-chip">
        <span class="i18n-stat-label">{{ $t('i18nChecker.total') }}:</span>
        <span class="i18n-stat-value">{{ results.stats.total }}</span>
      </div>
      <div class="i18n-stat-chip i18n-stat-found">
        <span class="i18n-stat-label">{{ $t('i18nChecker.found') }}:</span>
        <span class="i18n-stat-value">{{ results.stats.found }}</span>
        <span class="i18n-stat-percent">{{ percentFound }}%</span>
      </div>
      <div class="i18n-stat-chip i18n-stat-missing">
        <span class="i18n-stat-label">{{ $t('i18nChecker.missing') }}:</span>
        <span class="i18n-stat-value">{{ results.stats.missing }}</span>
        <span class="i18n-stat-percent">{{ percentMissing }}%</span>
      </div>
      <div class="i18n-progress-bar">
        <div class="i18n-progress-fill" :style="{ width: percentFound + '%' }" />
      </div>
    </div>

    <div class="i18n-categories-row">
      <div v-for="(stat, cat) in results.stats.byCategory" :key="cat" class="i18n-category-chip" :class="{ 'i18n-has-missing': stat.missing > 0 }" :title="`${cat}: ${stat.found}/${stat.total}`">
        <span class="i18n-cat-name">{{ cat }}</span>
        <span class="i18n-cat-count">{{ stat.found }}/{{ stat.total }}</span>
      </div>
    </div>

    <div class="i18n-table-wrapper">
      <el-table
          :data="filteredResults"
          stripe
          size="small"
          :height="tableHeight"
          :style="{ width: '100%', fontSize: fontSize + 'px' }"
          :class="{ 'i18n-compact-mode': compactMode }"
          :row-class-name="tableRowClassName"
      >
        <el-table-column v-for="col in SIMPLE_TABLE_COLUMNS" :key="col.prop || col.labelKey" :prop="col.prop" :label="col.labelKey ? $t(col.labelKey) : ''" :width="col.width" :min-width="col.minWidth" :align="col.align" :fixed="col.fixed">
          <template #default="{ row }" v-if="col.type === 'code'">
            <code class="i18n-key-code" v-html="highlightSearch ? highlightText(row[col.prop], searchQuery, highlightColor) : row[col.prop]"></code>
          </template>
          <template #default="{ row }" v-else-if="col.type === 'tag'">
            <el-tag size="small" effect="plain">{{ row[col.prop] }}</el-tag>
          </template>
          <template #default="{ row }" v-else-if="col.type === 'priority'">
            <el-tag :type="getPriorityType(row[col.prop])" size="small" effect="dark">{{ priorityLabel(row[col.prop]) }}</el-tag>
          </template>
          <template #default="{ row }" v-else-if="col.type === 'translation'">
            <span v-if="row[col.prop]" class="i18n-translation-value" v-html="highlightSearch ? highlightText(row[col.prop], searchQuery, highlightColor) : row[col.prop]"></span>
            <span v-else class="i18n-translation-missing">
              <I18nIcon name="missing" />
              {{ $t('i18nChecker.notTranslated') }}
            </span>
          </template>
          <template #default="{ row }" v-else-if="col.type === 'status'">
            <el-tag :type="row.value ? 'success' : 'danger'" size="small" effect="dark">
              {{ row.value ? '✅ ' + $t('i18nChecker.ok') : '❌ ' + $t('i18nChecker.miss') }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <div class="i18n-table-footer">
        {{ $t('i18nChecker.showing') }} {{ filteredResults.length }} {{ $t('i18nChecker.from') }} {{ allResults.length }} {{ $t('i18nChecker.entries') }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElMessageBox } from 'element-plus';
import I18nIcon from '@components/I18nChecker/components/shared/I18nIcon.vue';
import { keysToCheck, getCategories, checkTranslations, exportMissingAsJS } from '@components/I18nChecker/utils/i18nChecker.js';
import { getPriorityType, getPriorityLabelKey } from '@components/I18nChecker/config/prioritiesConfig.js';
import { SIMPLE_TABLE_COLUMNS } from '@components/I18nChecker/config/tableColumnsConfig.js';
import { STATUS_OPTIONS, FILTER_DEFAULTS } from '@components/I18nChecker/config/filtersConfig.js';
import { LANGUAGE_OPTIONS } from '@components/I18nChecker/config/languagesConfig.js';
import { useI18nSettings } from '@components/I18nChecker/composables/useI18nSettings.js';
import { highlightText } from '@components/I18nChecker/utils/highlightUtils.js';

const { t, locale } = useI18n();

const { tableHeight, fontSize, compactMode, confirmBeforeExport, highlightSearch, highlightColor } = useI18nSettings();

const selectedLang = ref(FILTER_DEFAULTS.lang);
const selectedCategory = ref(FILTER_DEFAULTS.category);
const selectedStatus = ref(FILTER_DEFAULTS.status);
const searchQuery = ref('');

const results = ref({
  found: [],
  missing: [],
  stats: { total: 0, found: 0, missing: 0, byCategory: {}, byPriority: {} }
});

const categories = getCategories();

const allResults = computed(() => [
  ...results.value.found.map(r => ({ ...r, status: 'found' })),
  ...results.value.missing.map(r => ({ ...r, status: 'missing' }))
]);

const filteredResults = computed(() => {
  let filtered = allResults.value;
  if (selectedCategory.value !== 'all') filtered = filtered.filter(r => r.category === selectedCategory.value);
  if (selectedStatus.value !== 'all') filtered = filtered.filter(r => r.status === selectedStatus.value);
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(r => r.key.toLowerCase().includes(query) || (r.value && r.value.toLowerCase().includes(query)));
  }
  return filtered;
});

const percentFound = computed(() => {
  if (results.value.stats.total === 0) return 0;
  return Math.round(results.value.stats.found / results.value.stats.total * 100);
});

const percentMissing = computed(() => 100 - percentFound.value);

const runCheck = () => {
  results.value = checkTranslations(
      { global: { t: (key) => t(key, {}, { locale: selectedLang.value }) } },
      selectedLang.value
  );
};

const priorityLabel = (priority) => t(getPriorityLabelKey(priority));
const tableRowClassName = ({ row }) => row.value ? 'i18n-row-found' : 'i18n-row-missing';

const exportMissing = async () => {
  if (results.value.missing.length === 0) {
    ElMessage.success(t('i18nChecker.noMissing'));
    return;
  }

  if (confirmBeforeExport.value) {
    try {
      await ElMessageBox.confirm(
          `${t('i18nChecker.confirmExport') || 'Экспортировать'} ${results.value.missing.length} ${t('i18nChecker.missing') || 'ключей'}?`,
          t('i18nChecker.exportMissing') || 'Экспорт',
          { confirmButtonText: t('i18nChecker.confirm') || 'OK', cancelButtonText: t('i18nChecker.cancel') || 'Отмена', type: 'info' }
      );
    } catch {
      return;
    }
  }

  const jsCode = exportMissingAsJS(results.value.missing, selectedLang.value);
  const blob = new Blob([jsCode], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `missing-keys-${selectedLang.value}.js`;
  a.click();
  URL.revokeObjectURL(url);
  ElMessage.success(t('i18nChecker.exported'));
};

onMounted(() => { runCheck(); });
</script>

<style lang="scss" scoped>
.i18n-checker-simple { display: flex; flex-direction: column; gap: 4px; height: 100%; }
.i18n-control-bar { display: flex; align-items: center; gap: 4px; padding: 4px 10px; background: #fff; border-radius: 6px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08); flex-wrap: wrap; .i18n-spacer { flex: 1; } }
.i18n-stats-row { display: flex; align-items: center; gap: 4px; padding: 4px 10px; background: #fff; border-radius: 6px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08); .i18n-stat-chip { display: flex; align-items: center; gap: 4px; padding: 4px 10px; background: #f5f7fa; border-radius: 4px; font-size: 13px; .i18n-stat-label { color: #909399; } .i18n-stat-value { font-weight: 700; color: #303133; font-size: 15px; } .i18n-stat-percent { font-size: 12px; color: #909399; margin-left: 2px; } &.i18n-stat-found { background: #f0f9ff; .i18n-stat-value { color: #52c41a; } } &.i18n-stat-missing { background: #fff1f0; .i18n-stat-value { color: #ff4d4f; } } } .i18n-progress-bar { flex: 1; height: 8px; background: #f0f0f0; border-radius: 4px; overflow: hidden; min-width: 100px; .i18n-progress-fill { height: 100%; background: linear-gradient(90deg, #52c41a, #73d13d); transition: width 0.5s ease; border-radius: 4px; } } }
.i18n-categories-row { display: flex; flex-wrap: wrap; gap: 4px; padding: 4px 10px; background: #fff; border-radius: 6px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08); .i18n-category-chip { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; background: #f5f7fa; border-radius: 4px; font-size: 12px; border-left: 3px solid #52c41a; cursor: default; transition: all 0.2s; &:hover { background: #ecf5ff; transform: translateY(-1px); } &.i18n-has-missing { border-left-color: #ff4d4f; background: #fff1f0; } .i18n-cat-name { font-weight: 600; color: #303133; } .i18n-cat-count { color: #909399; font-size: 11px; } } }
.i18n-table-wrapper { background: #fff; border-radius: 6px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08); overflow: hidden; flex: 1; display: flex; flex-direction: column; .i18n-table-footer { padding: 4px 10px; background: #fafafa; border-top: 1px solid #ebeef5; font-size: 12px; color: #909399; text-align: right; } }
.i18n-key-code { background: #f5f7fa; padding: 2px 4px; border-radius: 3px; font-family: 'Consolas', 'Monaco', monospace; font-size: 11px; color: #d4380d; word-break: break-all; }
.i18n-translation-value { color: #303133; font-size: 13px; }
.i18n-translation-missing { color: #ff4d4f; display: inline-flex; align-items: center; gap: 4px; font-style: italic; font-size: 12px; }

:deep(.i18n-highlight) { font-weight: 600; }

.i18n-compact-mode { :deep(.el-table__row td) { padding: 2px 0 !important; } :deep(.el-table__header th) { padding: 2px 0 !important; } }

:deep(.el-table) { .i18n-row-found td { background-color: #f6ffed !important; } .i18n-row-missing td { background-color: #fff1f0 !important; } .el-table__header th { background: #fafafa !important; font-weight: 600; font-size: 13px; padding: 4px 0; } .el-table__row td { padding: 4px 0; font-size: 13px; } }
</style>
