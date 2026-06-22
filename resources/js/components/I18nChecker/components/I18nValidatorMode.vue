<template>
  <div class="i18n-validator-mode">
    <div class="i18n-validate-control">
      <el-button type="warning" size="small" :loading="loading" @click="$emit('validate')">
        <I18nIcon name="warning" />
        {{ loading ? ($t('i18nChecker.validating') || 'Проверка...') : ($t('i18nChecker.startValidation') || 'Проверить пути') }}
      </el-button>
      <span class="i18n-validate-hint">
        {{ $t('i18nChecker.validateHint') || 'Найдёт ключи с неправильной вложенностью' }}
      </span>
    </div>

    <div v-if="error && !report" class="i18n-error-block">
      <I18nIcon name="missing" />
      <p>{{ error }}</p>
    </div>

    <div v-if="report" class="i18n-validate-results">
      <I18nStatsGrid :stats="validatorStats" />

      <el-collapse v-model="expandedSections" class="i18n-collapse">
        <el-collapse-item v-if="report.duplicates && report.duplicates.length > 0" name="duplicates">
          <template #title>
            <div class="i18n-collapse-header i18n-collapse-header-danger">
              <I18nIcon name="warning" />
              <span>{{ $t('i18nChecker.duplicatesFound') || 'Найдены дубликаты' }}</span>
              <el-tag type="danger" size="small" effect="dark">{{ report.duplicates.length }}</el-tag>
            </div>
          </template>

          <div class="i18n-table-wrapper">
            <el-table :data="report.duplicates" stripe size="small" height="350" style="width: 100%;">
              <el-table-column prop="key" :label="$t('i18nChecker.colKey') || 'Ключ'" width="200">
                <template #default="{ row }"><code class="i18n-key-code">{{ row.key }}</code></template>
              </el-table-column>
              <el-table-column :label="$t('i18nChecker.paths') || 'Пути'" min-width="400">
                <template #default="{ row }">
                  <div class="i18n-paths-list">
                    <el-tag v-for="path in row.paths" :key="path" size="small" type="info" effect="plain">{{ path }}</el-tag>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-collapse-item>

        <el-collapse-item v-if="report.wrongPaths && report.wrongPaths.length > 0" name="wrongPaths">
          <template #title>
            <div class="i18n-collapse-header i18n-collapse-header-danger">
              <I18nIcon name="missing" />
              <span>{{ $t('i18nChecker.wrongPathsFound') || 'Неправильные пути' }}</span>
              <el-tag type="danger" size="small" effect="dark">{{ report.wrongPaths.length }}</el-tag>
            </div>
          </template>

          <div class="i18n-table-wrapper">
            <el-table :data="report.wrongPaths" stripe size="small" height="350" style="width: 100%;">
              <el-table-column prop="wrongPath" :label="$t('i18nChecker.wrongPath') || 'Неправильный путь'" width="280">
                <template #default="{ row }"><code class="i18n-key-code i18n-key-code-error">{{ row.wrongPath }}</code></template>
              </el-table-column>
              <el-table-column prop="correctPath" :label="$t('i18nChecker.correctPath') || 'Правильный путь'" width="280">
                <template #default="{ row }"><code class="i18n-key-code i18n-key-code-success">{{ row.correctPath }}</code></template>
              </el-table-column>
              <el-table-column prop="usedIn" :label="$t('i18nChecker.usedIn') || 'Используется в'" min-width="200">
                <template #default="{ row }">
                  <div class="i18n-files-list">
                    <el-tag v-for="file in (row.usedIn || []).slice(0, 2)" :key="file" size="small" type="info" effect="plain">{{ file }}</el-tag>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-collapse-item>

        <el-collapse-item v-if="report.flatKeys && report.flatKeys.length > 0" name="flatKeys">
          <template #title>
            <div class="i18n-collapse-header i18n-collapse-header-warning">
              <I18nIcon name="info" />
              <span>{{ $t('i18nChecker.flatKeysFound') || 'Плоские ключи' }}</span>
              <el-tag type="warning" size="small" effect="dark">{{ report.flatKeys.length }}</el-tag>
            </div>
          </template>

          <div class="i18n-unused-wrapper">
            <div class="i18n-unused-list">
              <el-tag v-for="key in report.flatKeys.slice(0, 200)" :key="key" class="i18n-unused-tag" size="small" type="warning" effect="plain">{{ key }}</el-tag>
              <span v-if="report.flatKeys.length > 200" class="i18n-more-unused">... {{ report.flatKeys.length - 200 }} ещё</span>
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

const { t } = useI18n();

const props = defineProps({
  loading: { type: Boolean, default: false },
  report: { type: Object, default: null },
  error: { type: String, default: null }
});

defineEmits(['validate']);

const expandedSections = ref([...VALIDATOR_SECTIONS]);

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

.i18n-error-block { display: flex; align-items: center; gap: 4px; padding: 4px; margin: 4px 0; background: #fff1f0; border: 1px solid #ffccc7; border-radius: 3px; color: #cf1322; p { margin: 0; font-size: 9px; } }

.i18n-validate-results { margin-top: 4px; }

.i18n-validate-empty { text-align: center; padding: 10px; color: #909399; p { margin: 0; font-size: 10px; } }

.i18n-collapse {
  border: none;
  :deep(.el-collapse-item__header) { background: transparent; border-bottom: none; height: auto; padding: 0; line-height: normal; }
  :deep(.el-collapse-item__wrap) { border-bottom: none; }
  :deep(.el-collapse-item__content) { padding: 0; }
  :deep(.el-collapse-item__arrow) { margin-right: 4px; }
}

.i18n-collapse-header {
  display: flex; align-items: center; gap: 4px; padding: 4px 6px; border-radius: 3px; font-size: 9px; font-weight: 600; cursor: pointer; transition: background 0.2s; width: 100%;
  &.i18n-collapse-header-danger { background: #fff1f0; color: #cf1322; border-left: 2px solid #ff4d4f; &:hover { background: #ffeded; } }
  &.i18n-collapse-header-warning { background: #fffbe6; color: #ad6800; border-left: 2px solid #faad14; &:hover { background: #fff8d4; } }
}

.i18n-table-wrapper {
  background: #fff; border-radius: 3px; overflow: hidden; border: 1px solid #ebeef5; margin-top: 4px;
  :deep(.el-table) {
    .el-table__header th { background: #fafafa !important; font-weight: 600; font-size: 9px; padding: 4px 0; }
    .el-table__row td { padding: 4px 0; font-size: 9px; }
  }
}

.i18n-key-code {
  background: #f5f7fa; padding: 2px 4px; border-radius: 2px; font-family: 'Consolas', 'Monaco', monospace; font-size: 8px; color: #d4380d; word-break: break-all;
  &.i18n-key-code-error { background: #fff1f0; color: #cf1322; text-decoration: line-through; }
  &.i18n-key-code-success { background: #f6ffed; color: #52c41a; }
}

.i18n-paths-list { display: flex; flex-wrap: wrap; gap: 4px; }
.i18n-files-list { display: flex; flex-wrap: wrap; gap: 4px; }

.i18n-unused-wrapper { background: #fff; border-radius: 3px; padding: 4px; border: 1px solid #ebeef5; max-height: 250px; overflow-y: auto; margin-top: 4px; }

.i18n-unused-list { display: flex; flex-wrap: wrap; gap: 4px; .i18n-unused-tag { font-family: 'Consolas', 'Monaco', monospace; font-size: 8px; } .i18n-more-unused { color: #909399; font-size: 10px; align-self: center; } }

.i18n-no-issues { text-align: center; padding: 10px; color: #52c41a; p { margin: 0; font-size: 10px; } }
</style>
