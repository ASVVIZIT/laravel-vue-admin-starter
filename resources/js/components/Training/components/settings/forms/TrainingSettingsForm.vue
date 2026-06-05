<template>
  <div class="training-settings-form">
    <div v-if="loading" class="loading-state">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>Загрузка настроек...</span>
    </div>

    <div v-else class="form-scroll-wrapper">
      <el-form :model="formData" label-position="top" size="small" class="compact-form" ref="formRef">

        <el-divider content-position="left" class="compact-divider">
          <el-icon><Setting /></el-icon> Серверные настройки
        </el-divider>

        <el-form-item label="Режим группировки" class="compact-item">
          <el-select v-model="formData.server.grouping_mode" class="full-width compact-select" size="small">
            <el-option label="🔄 Авто (по порогу)" value="auto" />
            <el-option label="📱 Фронтенд" value="frontend" />
            <el-option label="🖥 Сервер" value="server" />
          </el-select>
          <div class="form-tip">Как группировать записи при большом количестве</div>
        </el-form-item>

        <el-form-item v-if="formData.server.grouping_mode === 'auto'" label="Порог авто-переключения (записей)" class="compact-item">
          <el-input-number v-model="formData.server.grouping_auto_threshold" :min="50" :max="10000" :step="100" controls-position="right" class="full-width compact-input" />
          <div class="form-tip">При превышении переключается на серверную группировку</div>
        </el-form-item>

        <!-- 🔥 НОВЫЙ БЛОК -->
        <el-form-item v-if="formData.server.grouping_mode === 'auto'" class="compact-item">
          <template #label><span>Минимум групп для группировки</span></template>
          <el-checkbox v-model="formData.server.enable_min_groups_check" style="margin-bottom: 6px; font-size: 11px;">
            Включить проверку осмысленности
          </el-checkbox>
          <el-input-number
              v-if="formData.server.enable_min_groups_check"
              v-model="formData.server.grouping_min_groups"
              :min="1" :max="100" :step="1" controls-position="right" class="full-width compact-input"
          />
          <div class="form-tip">Группировка сработает, только если получится ≥ этого числа групп. Если меньше, покажется обычный список.</div>
        </el-form-item>

        <el-form-item label="Группировать по (серверный режим)" class="compact-item">
          <el-select v-model="formData.server.grouping_by" class="full-width compact-select" size="small">
            <el-option label="По пользователю" value="user" />
            <el-option label="По упражнению" value="exercise" />
            <el-option label="По месяцу" value="date" />
          </el-select>
        </el-form-item>

        <el-form-item label="Групп на странице" class="compact-item">
          <el-input-number v-model="formData.server.grouping_per_page" :min="5" :max="50" :step="5" controls-position="right" class="full-width compact-input" />
        </el-form-item>

        <el-form-item label="Записей на странице" class="compact-item">
          <el-input-number v-model="formData.server.logs_per_page" :min="10" :max="200" :step="10" controls-position="right" class="full-width compact-input" />
        </el-form-item>

        <el-form-item label="Показывать статистику" class="compact-item">
          <el-switch v-model="formData.server.enable_stats" :active-value="true" :inactive-value="false" />
        </el-form-item>

        <el-form-item label="Разрешить шеринг" class="compact-item">
          <el-switch v-model="formData.server.enable_sharing" :active-value="true" :inactive-value="false" />
        </el-form-item>

        <el-divider content-position="left" class="compact-divider">
          <el-icon><Monitor /></el-icon> Интерфейс
        </el-divider>

        <el-form-item label="Вкладка по умолчанию" class="compact-item">
          <el-select v-model="formData.frontend.default_tab" class="full-width compact-select" size="small">
            <el-option label="Мои тренировки" value="mine" />
            <el-option label="Доступные мне" value="shared-with-me" />
            <el-option label="Я поделился" value="shared-by-me" />
          </el-select>
        </el-form-item>

        <el-form-item label="Показывать кнопку переключения группировки" class="compact-item">
          <el-switch v-model="formData.frontend.show_grouping_toggle" :active-value="true" :inactive-value="false" />
        </el-form-item>

        <el-form-item label="Сворачивать фильтры на мобильном" class="compact-item">
          <el-switch v-model="formData.frontend.filters_collapsed_mobile" :active-value="true" :inactive-value="false" />
        </el-form-item>

        <el-form-item label="Компактный вид таблицы" class="compact-item">
          <el-switch v-model="formData.frontend.compact_view" :active-value="true" :inactive-value="false" />
        </el-form-item>

        <el-divider content-position="left" class="compact-divider">
          <el-icon><Grid /></el-icon> Колонки таблицы
        </el-divider>

        <el-tabs v-model="columnsTab" type="border-card" class="columns-tabs">
          <el-tab-pane v-for="tabKey in ['mine', 'shared-with-me', 'shared-by-me']" :key="tabKey" :label="tabLabels[tabKey]" :name="tabKey">
            <div class="columns-grid">
              <el-checkbox v-for="(label, key) in columnLabels" :key="key" v-model="formData.columns[tabKey][key]" :label="label" class="column-checkbox" />
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { Loading, Setting, Monitor, Grid } from '@element-plus/icons-vue';
import { useTrainingSettingsStore } from '@/components/Training/stores/trainingSettingsStore.js';

const props = defineProps({ initialSettings: { type: Object, default: null } });
const emit = defineEmits(['saved', 'cancelled', 'update:settings']);

const settingsStore = useTrainingSettingsStore();
const formRef = ref(null);
const loading = ref(false);
const columnsTab = ref('mine');

const tabLabels = { 'mine': 'Мои тренировки', 'shared-with-me': 'Доступные мне', 'shared-by-me': 'Я поделился' };
const columnLabels = { date: '📅 Дата', time: '🕐 Время', exercise: '💪 Упражнение', sharing: '🔗 Шеринг', sets: '📊 Подходы', reps: '🔢 Повторы', volume: '📈 Объём', rating: '⭐ Оценка', actions: '⚙️ Действия' };

const getDefaultFormData = () => ({
  server: {
    grouping_mode: 'auto', grouping_auto_threshold: 500, grouping_by: 'user', grouping_per_page: 10, logs_per_page: 50,
    enable_stats: true, enable_sharing: true, enable_min_groups_check: true, grouping_min_groups: 3 // 🔥 ДОБАВЛЕНО
  },
  frontend: { default_tab: 'mine', show_grouping_toggle: true, filters_collapsed_mobile: true, compact_view: false },
  columns: {
    'mine': { date: true, time: true, exercise: true, sharing: true, sets: true, reps: true, volume: true, rating: true, actions: true },
    'shared-with-me': { date: true, time: true, exercise: true, sharing: true, sets: true, reps: true, volume: true, rating: true, actions: false },
    'shared-by-me': { date: true, time: true, exercise: true, sharing: true, sets: true, reps: true, volume: true, rating: true, actions: true }
  }
});

const formData = ref(getDefaultFormData());

const loadSettings = () => {
  formData.value = getDefaultFormData();
  Object.keys(formData.value.server).forEach(key => { if (key in settingsStore.serverSettings) formData.value.server[key] = settingsStore.serverSettings[key]; });
  Object.keys(formData.value.frontend).forEach(key => { if (key in settingsStore.frontendSettings) formData.value.frontend[key] = settingsStore.frontendSettings[key]; });
  ['mine', 'shared-with-me', 'shared-by-me'].forEach(tab => {
    if (settingsStore.columnsConfig[tab]) {
      Object.keys(formData.value.columns[tab]).forEach(key => { if (key in settingsStore.columnsConfig[tab]) formData.value.columns[tab][key] = settingsStore.columnsConfig[tab][key]; });
    }
  });
};

const saveSettings = async () => {
  if (!formRef.value) return false;
  try { await formRef.value.validate(); } catch { return false; }
  loading.value = true;
  try {
    const result = await settingsStore.updateSettingsStore({ server: formData.value.server, frontend: formData.value.frontend, columns: formData.value.columns });
    if (result?.success) { emit('saved', formData.value); return true; }
    else { emit('cancelled', result); return false; }
  } catch (error) { emit('cancelled', error); return false; } finally { loading.value = false; }
};

const resetSettings = async () => {
  loading.value = true;
  try { await settingsStore.resetSettingsStore(); loadSettings(); emit('saved', formData.value); }
  catch (error) { emit('cancelled', error); } finally { loading.value = false; }
};

watch(() => formData.value, (val) => emit('update:settings', val), { deep: true });
onMounted(() => loadSettings());
defineExpose({ saveSettings, resetSettings, formData });
</script>

<style scoped>
/* Стили остаются точно такими же, как в твоем текущем файле */
.training-settings-form { padding: 2px; }
.loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 12px; color: #909399; gap: 4px; font-size: 10px; }
.loading-state .el-icon { font-size: 20px; }
.form-scroll-wrapper { max-height: 480px; overflow-y: auto; padding-right: 6px; padding-bottom: 8px; }
.form-scroll-wrapper::-webkit-scrollbar { width: 4px; }
.form-scroll-wrapper::-webkit-scrollbar-track { background: transparent; }
.form-scroll-wrapper::-webkit-scrollbar-thumb { background: #dcdfe6; border-radius: 2px; }
:deep(.compact-divider) { margin: 6px 0 4px; }
:deep(.compact-divider .el-divider__text) { font-size: 10px; font-weight: 600; color: #303133; padding: 0 4px; background: #fff; }
:deep(.compact-item) { margin-bottom: 6px; }
:deep(.compact-item .el-form-item__label) { font-size: 9px; font-weight: 600; color: #606266; margin-bottom: 2px; line-height: 1.2; padding: 0; }
:deep(.compact-input), :deep(.compact-select) { width: 100%; --el-input-height: 26px; --el-input-font-size: 10px; }
:deep(.compact-input .el-input__wrapper), :deep(.compact-select .el-select__wrapper) { padding: 1px 8px; box-shadow: 0 0 0 1px #dcdfe6 inset; border-radius: 4px; }
:deep(.compact-input .el-input__inner), :deep(.compact-select .el-select__input) { font-size: 10px; height: 24px; line-height: 24px; padding: 0; }
:deep(.compact-input.el-input-number.is-controls-right .el-input-number__decrease), :deep(.compact-input.el-input-number.is-controls-right .el-input-number__increase) { width: 20px; height: 13px; line-height: 13px; font-size: 9px; border-left: 1px solid #dcdfe6; }
:deep(.compact-input.el-input-number.is-controls-right .el-input-number__increase) { border-top: 1px solid #dcdfe6; border-bottom: none; }
:deep(.compact-input.el-input-number.is-controls-right .el-input__wrapper) { padding-right: 26px; }
:deep(.compact-select .el-select-dropdown) { font-size: 10px; padding: 4px 0; }
:deep(.compact-select .el-select-dropdown__item) { font-size: 10px; padding: 6px 12px; }
.form-tip { font-size: 8px; color: #909399; margin-top: 2px; line-height: 1.2; padding-left: 2px; }
:deep(.el-form-item.is-error .el-input__wrapper), :deep(.el-form-item.is-error .el-select__wrapper) { box-shadow: 0 0 0 1px #f56c6c inset; }
.columns-tabs { margin-top: 8px; }
.columns-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 8px 0; }
.column-checkbox { font-size: 11px; }
:deep(.columns-tabs .el-tabs__content) { padding: 8px 12px; }
:deep(.columns-tabs .el-tabs__item) { font-size: 11px; padding: 0 10px; }
.full-width { width: 100%; }
</style>
