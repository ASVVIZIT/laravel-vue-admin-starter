<template>
  <div class="i18n-checker-simple">
    <!-- 🔥 КОМПАКТНАЯ ПАНЕЛЬ УПРАВЛЕНИЯ -->
    <div class="i18n-control-bar">
      <el-radio-group v-model="selectedLang" size="small" @change="runCheck">
        <el-radio-button label="ru">🇷🇺 RU</el-radio-button>
        <el-radio-button label="en">🇬 EN</el-radio-button>
        <el-radio-button label="zh-cn">🇨🇳 ZH</el-radio-button>
      </el-radio-group>

      <el-select v-model="selectedCategory" size="small" style="width: 160px;">
        <el-option label="Все категории" value="all" />
        <el-option v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
      </el-select>

      <el-select v-model="selectedStatus" size="small" style="width: 140px;">
        <el-option label="Все" value="all" />
        <el-option label="✅ Найдено" value="found" />
        <el-option label="❌ Отсутствует" value="missing" />
      </el-select>

      <el-input
          v-model="searchQuery"
          placeholder="Поиск..."
          size="small"
          clearable
          style="width: 180px;"
      >
        <template #prefix>
          <Icon class-name="search" />
        </template>
      </el-input>

      <div class="i18n-spacer" />

      <el-button size="small" @click="runCheck">
        <Icon class-name="arrow-clockwise" />
        Обновить
      </el-button>
      <el-button size="small" @click="exportMissing">
        <Icon class-name="download" />
        Экспорт
      </el-button>
    </div>

    <!--  КОМПАКТНАЯ СТАТИСТИКА -->
    <div class="i18n-stats-row">
      <div class="i18n-stat-chip">
        <span class="i18n-stat-label">Всего:</span>
        <span class="i18n-stat-value">{{ results.stats.total }}</span>
      </div>
      <div class="i18n-stat-chip i18n-stat-found">
        <span class="i18n-stat-label">Найдено:</span>
        <span class="i18n-stat-value">{{ results.stats.found }}</span>
        <span class="i18n-stat-percent">{{ percentFound }}%</span>
      </div>
      <div class="i18n-stat-chip i18n-stat-missing">
        <span class="i18n-stat-label">Отсутствует:</span>
        <span class="i18n-stat-value">{{ results.stats.missing }}</span>
        <span class="i18n-stat-percent">{{ percentMissing }}%</span>
      </div>

      <!-- Прогресс-бар -->
      <div class="i18n-progress-bar">
        <div class="i18n-progress-fill" :style="{ width: percentFound + '%' }" />
      </div>
    </div>

    <!-- 🔥 КОМПАКТНЫЕ КАТЕГОРИИ -->
    <div class="i18n-categories-row">
      <div
          v-for="(stat, cat) in results.stats.byCategory"
          :key="cat"
          class="i18n-category-chip"
          :class="{ 'i18n-has-missing': stat.missing > 0 }"
          :title="`${cat}: ${stat.found}/${stat.total}`"
      >
        <span class="i18n-cat-name">{{ cat }}</span>
        <span class="i18n-cat-count">{{ stat.found }}/{{ stat.total }}</span>
      </div>
    </div>

    <!-- 🔥 ТАБЛИЦА С ПРОКРУТКОЙ -->
    <div class="i18n-table-wrapper">
      <el-table
          :data="filteredResults"
          stripe
          size="small"
          height="500"
          style="width: 100%;"
          :row-class-name="tableRowClassName"
      >
        <el-table-column prop="key" label="Ключ" width="320" fixed>
          <template #default="{ row }">
            <code class="i18n-key-code">{{ row.key }}</code>
          </template>
        </el-table-column>

        <el-table-column prop="category" label="Категория" width="130">
          <template #default="{ row }">
            <el-tag size="small" effect="plain">{{ row.category }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="priority" label="Приоритет" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="priorityType(row.priority)" size="small" effect="dark">
              {{ priorityLabel(row.priority) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="value" label="Перевод" min-width="200">
          <template #default="{ row }">
            <span v-if="row.value" class="i18n-translation-value">{{ row.value }}</span>
            <span v-else class="i18n-translation-missing">
              <Icon class-name="exclamation-circle" />
              Не переведено
            </span>
          </template>
        </el-table-column>

        <el-table-column label="Статус" width="90" align="center" fixed="right">
          <template #default="{ row }">
            <el-tag :type="row.value ? 'success' : 'danger'" size="small" effect="dark">
              {{ row.value ? '✅ OK' : '❌ MISS' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- Счётчик внизу -->
      <div class="i18n-table-footer">
        Показано {{ filteredResults.length }} из {{ allResults.length }} записей
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import Icon from '@/components/Icon/Icon.vue';
import { keysToCheck, getCategories, checkTranslations, exportMissingAsJS } from '@/utils/i18nChecker';

const { t, locale } = useI18n();

const selectedLang = ref(locale.value || 'ru');
const selectedCategory = ref('all');
const selectedStatus = ref('all');
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

  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(r => r.category === selectedCategory.value);
  }

  if (selectedStatus.value !== 'all') {
    filtered = filtered.filter(r => r.status === selectedStatus.value);
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(r =>
        r.key.toLowerCase().includes(query) ||
        (r.value && r.value.toLowerCase().includes(query))
    );
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

const priorityType = (priority) => ({
  critical: 'danger',
  normal: 'warning',
  low: 'info'
}[priority] || 'info');

const priorityLabel = (priority) => ({
  critical: 'КРИТ',
  normal: 'НОРМ',
  low: 'НИЗК'
}[priority] || priority);

const tableRowClassName = ({ row }) => {
  return row.value ? 'i18n-row-found' : 'i18n-row-missing';
};

const exportMissing = () => {
  if (results.value.missing.length === 0) {
    ElMessage.success('Все ключи присутствуют!');
    return;
  }

  const jsCode = exportMissingAsJS(results.value.missing, selectedLang.value);
  const blob = new Blob([jsCode], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `missing-keys-${selectedLang.value}.js`;
  a.click();
  URL.revokeObjectURL(url);

  ElMessage.success('Экспортировано!');
};

onMounted(() => {
  runCheck();
});
</script>

<style lang="scss" scoped>
.i18n-checker-simple {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

.i18n-control-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  flex-wrap: wrap;

  .i18n-spacer {
    flex: 1;
  }
}

.i18n-stats-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);

  .i18n-stat-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    background: #f5f7fa;
    border-radius: 6px;
    font-size: 13px;

    .i18n-stat-label {
      color: #909399;
    }

    .i18n-stat-value {
      font-weight: 700;
      color: #303133;
      font-size: 15px;
    }

    .i18n-stat-percent {
      font-size: 12px;
      color: #909399;
      margin-left: 2px;
    }

    &.i18n-stat-found {
      background: #f0f9ff;
      .i18n-stat-value { color: #52c41a; }
    }

    &.i18n-stat-missing {
      background: #fff1f0;
      .i18n-stat-value { color: #ff4d4f; }
    }
  }

  .i18n-progress-bar {
    flex: 1;
    height: 8px;
    background: #f0f0f0;
    border-radius: 4px;
    overflow: hidden;
    min-width: 100px;

    .i18n-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #52c41a, #73d13d);
      transition: width 0.5s ease;
      border-radius: 4px;
    }
  }
}

.i18n-categories-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 12px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);

  .i18n-category-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    background: #f5f7fa;
    border-radius: 4px;
    font-size: 12px;
    border-left: 3px solid #52c41a;
    cursor: default;
    transition: all 0.2s;

    &:hover {
      background: #ecf5ff;
      transform: translateY(-1px);
    }

    &.i18n-has-missing {
      border-left-color: #ff4d4f;
      background: #fff1f0;
    }

    .i18n-cat-name {
      font-weight: 600;
      color: #303133;
    }

    .i18n-cat-count {
      color: #909399;
      font-size: 11px;
    }
  }
}

.i18n-table-wrapper {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;

  .i18n-table-footer {
    padding: 8px 12px;
    background: #fafafa;
    border-top: 1px solid #ebeef5;
    font-size: 12px;
    color: #909399;
    text-align: right;
  }
}

.i18n-key-code {
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 11px;
  color: #d4380d;
  word-break: break-all;
}

.i18n-translation-value {
  color: #303133;
  font-size: 13px;
}

.i18n-translation-missing {
  color: #ff4d4f;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-style: italic;
  font-size: 12px;
}

:deep(.el-table) {
  .i18n-row-found td {
    background-color: #f6ffed !important;
  }

  .i18n-row-missing td {
    background-color: #fff1f0 !important;
  }

  .el-table__header th {
    background: #fafafa !important;
    font-weight: 600;
    font-size: 13px;
    padding: 8px 0;
  }

  .el-table__row td {
    padding: 6px 0;
    font-size: 13px;
  }
}
</style>
